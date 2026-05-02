import { NextRequest, NextResponse } from 'next/server';
import { client, systemPrompt, MODEL_NAME, createGroundedPrompt } from '@/lib/gemini';
import { getServerUserProgress } from '@/lib/firestore-admin';
import { ChatMessage } from '@/types';
import { z } from 'zod';

/**
 * Validation schema for the chat request
 */
const chatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
  userId: z.string().optional()
});

/**
 * Rate limiting store: Maps user IP to request timestamps
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Rate limit configuration
 * Guests: 5 requests per minute
 * Authenticated: 20 requests per minute
 */
const IS_TEST = process.env.NODE_ENV === 'test' || process.env.PLAYWRIGHT_TEST_REMOTE_URL;

const RATE_LIMITS = {
  guest: { requests: (process.env.NODE_ENV === 'production' && !IS_TEST) ? 5 : 1000, windowMs: 60000 },
  authenticated: { requests: (process.env.NODE_ENV === 'production' && !IS_TEST) ? 20 : 1000, windowMs: 60000 },
};

/**
 * Get client IP from request
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

/**
 * Check rate limit for a client
 */
function checkRateLimit(clientId: string, limit: { requests: number; windowMs: number }): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(clientId) || [];
  const validTimestamps = timestamps.filter(ts => now - ts < limit.windowMs);
  
  if (validTimestamps.length >= limit.requests) {
    return false;
  }
  
  validTimestamps.push(now);
  rateLimitStore.set(clientId, validTimestamps);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Security Check: CSRF
    const csrfHeader = req.headers.get("x-csrf-token");
    const csrfCookie = req.cookies.get("csrf_token")?.value;

    if (!IS_TEST && (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie)) {
      return NextResponse.json({ error: "Invalid security token" }, { status: 403 });
    }

    // 2. Security Check: Rate Limiting
    const clientIp = getClientIp(req);
    const isAuthenticated = req.headers.get('x-user-id') !== null;
    const limitConfig = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.guest;
    const rateLimitKey = isAuthenticated 
      ? req.headers.get('x-user-id') || clientIp 
      : clientIp;

    if (!checkRateLimit(rateLimitKey, limitConfig)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { message, history, userId } = validation.data;

    // 3. Efficiency: Fetch user progress for context enrichment
    let contextAddition = "";
    if (userId) {
      const progress = await getServerUserProgress(userId);
      if (progress) {
        const scores = progress.quizScores as { score: number; total: number }[] | undefined;
        const lastScore = scores?.[scores.length - 1];
        contextAddition = `\nUSER CONTEXT:
- Home State/Location: ${progress.preferences?.state || 'Not specified'}
- Completed Processes: ${(progress.completedProcesses as string[] | undefined)?.join(', ') || 'None'}
- Viewed Processes: ${(progress.viewedProcesses as string[] | undefined)?.join(', ') || 'None'}
- Last Quiz Score: ${lastScore?.score ?? 0}/${lastScore?.total ?? 0}
Please reference their progress and location if relevant.`;
      }
    }

    // 4. Grounding: Create search-grounded prompt
    // We apply the grounded prompt template to the current user message
    const groundedPrompt = createGroundedPrompt(message);

    // 5. History Formatting: Match @google/genai requirements
    const formattedHistory = history?.map((msg: ChatMessage) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || [];

    // Ensure history starts with 'user' and alternates correctly
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    // 6. AI Assistant: Initialize chat session with the new SDK
    const chat = client.chats.create({
      model: MODEL_NAME,
      systemInstruction: systemPrompt,
      history: formattedHistory,
      tools: [{ google_search: {} } as any], // Use search grounding
      config: {
        temperature: 0.1, // Lower temperature for factual accuracy in election info
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Combine context enrichment with search-grounded prompt
    const finalMessage = `${contextAddition}\n\n${groundedPrompt}`.trim();

    // 7. Streaming: Use the SDK's streaming capability correctly
    // The new SDK sendMessageStream returns a stream that can be iterated
    const response = await chat.sendMessageStream(finalMessage);

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            // The unified SDK chunks are GenerateContentResponse objects
            // We use the text() method to get the content
            try {
              const text = chunk.text();
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch (e) {
              // Sometimes chunks might not have text (e.g. if they are just metadata)
              console.warn('Chunk without text:', e);
            }
          }
          controller.close();
        } catch (streamError) {
          console.error('Streaming error:', streamError);
          // Don't close with error if we already sent some data, just close normally
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: unknown) {
    console.error('Chat API Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


/**
 * GET handler to provide CSRF token to clients
 * Clients should call this before making POST requests
 */
export async function GET() {
  const csrfToken = crypto.randomUUID();
  const response = NextResponse.json({ csrfToken, expiresIn: 3600 });
  
  // Set the token in an HTTP-only cookie
  response.cookies.set("csrf_token", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 3600, // 1 hour
  });
  
  return response;
}
