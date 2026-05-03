import { NextRequest, NextResponse } from 'next/server';
import { client, systemPrompt, MODEL_NAME, createGroundedPrompt } from '@/lib/gemini';
import { getServerUserProgress } from '@/lib/firestore-admin';
import { ChatMessage, UserProgress } from '@/types';
import { z } from 'zod';

/**
 * ElectionGuide Chat API Route
 *
 * This endpoint handles AI-powered chat requests with:
 * - Search grounding to ECI sources
 * - Rate limiting (5/min guests, 20/min authenticated)
 * - CSRF protection via httpOnly cookies
 * - Input validation with Zod
 * - User context enrichment from Firestore
 * - Streaming responses for real-time chat
 *
 * POST /api/chat
 * Request body:
 * ```json
 * {
 *   "message": "How do I register to vote?",
 *   "history": [
 *     { "role": "user", "content": "..." },
 *     { "role": "assistant", "content": "..." }
 *   ],
 *   "userId": "optional-user-id-header"
 * }
 * ```
 *
 * Response: Stream of text chunks from Gemini (search-grounded)
 */

/**
 * Request validation schema using Zod
 * Ensures type safety and prevents malicious inputs
 */
const chatRequestSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message exceeds maximum length of 2000 characters'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']).pipe(
          z.enum(['user', 'assistant'])
        ),
        content: z.string().min(1).max(5000),
      })
    )
    .max(20, 'Chat history exceeds maximum of 20 messages')
    .optional(),
  userId: z
    .string()
    .min(1, 'If provided, userId must not be empty')
    .max(256, 'userId exceeds maximum length')
    .optional(),
});

/**
 * Rate limiting store: Maps client IP/User ID to request timestamps
 * This is an in-memory store; for production, consider Redis
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Rate limit configuration
 * Guests (anonymous): 5 requests per minute
 * Authenticated users: 20 requests per minute
 *
 * These limits can be adjusted based on load and business requirements
 */
const IS_TEST =
  process.env.NODE_ENV === 'test' ||
  process.env.PLAYWRIGHT_TEST_REMOTE_URL ||
  process.env.CI === 'true';

/**
 * Rate limit configurations based on authentication status
 */
const RATE_LIMITS = {
  guest: {
    requests: IS_TEST ? 1000 : process.env.NODE_ENV === 'production' ? 5 : 100,
    windowMs: 60000, // 1 minute
  },
  authenticated: {
    requests: IS_TEST ? 1000 : process.env.NODE_ENV === 'production' ? 20 : 500,
    windowMs: 60000, // 1 minute
  },
} as const;

/**
 * Extract client IP from various headers
 * Handles proxied requests and forwards the original IP
 *
 * @param req - Next.js request object
 * @returns Client IP address or 'unknown'
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const cloudflare = req.headers.get('cf-connecting-ip');
  const direct = req.headers.get('x-real-ip');

  return forwarded
    ? forwarded.split(',')[0].trim()
    : cloudflare || direct || 'unknown';
}

/**
 * Sliding window rate limiting implementation
 * Allows N requests per window, with old requests dropped as time passes
 *
 * @param clientId - Client identifier (IP or User ID)
 * @param limit - Rate limit configuration
 * @returns true if request is allowed, false if rate limit exceeded
 */
function checkRateLimit(
  clientId: string,
  limit: (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS]
): boolean {
  const now = Date.now();
  const timestamps = rateLimitStore.get(clientId) || [];

  // Keep only timestamps within the current window
  const validTimestamps = timestamps.filter((ts) => now - ts < limit.windowMs);

  if (validTimestamps.length >= limit.requests) {
    // Rate limit exceeded
    return false;
  }

  // Add current request timestamp
  validTimestamps.push(now);
  rateLimitStore.set(clientId, validTimestamps);
  return true;
}

/**
 * POST handler for chat API
 * Handles user messages, applies security checks, and streams Gemini responses
 *
 * Security measures:
 * 1. CSRF protection: x-csrf-token header + csrf_token cookie
 * 2. Rate limiting: IP-based for guests, User ID-based for authenticated
 * 3. Input validation: Zod schema validation
 * 4. Grounding: Prompts Gemini to search official ECI sources
 *
 * @param req - Next.js request object
 * @returns Streaming response with chat text or error JSON
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 1. SECURITY CHECK: CSRF Protection
    // Verify x-csrf-token header matches csrf_token cookie
    const csrfHeader = req.headers.get('x-csrf-token');
    const csrfCookie = req.cookies.get('csrf_token')?.value;

    if (!IS_TEST && (!csrfHeader || !csrfCookie || csrfHeader !== csrfCookie)) {
      return NextResponse.json(
        {
          error: 'Invalid security token',
          details: 'CSRF validation failed. Please refresh the page.',
        },
        { status: 403 }
      );
    }

    // 2. SECURITY CHECK: Rate Limiting
    const clientIp = getClientIp(req);
    const isAuthenticated = req.headers.get('x-user-id') !== null;
    const limitConfig = isAuthenticated
      ? RATE_LIMITS.authenticated
      : RATE_LIMITS.guest;
    const rateLimitKey = isAuthenticated
      ? req.headers.get('x-user-id') || clientIp
      : clientIp;

    if (!checkRateLimit(rateLimitKey, limitConfig)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          details: `${isAuthenticated ? 'Authenticated' : 'Guest'} users are limited to ${limitConfig.requests} requests per minute.`,
          resetTime: 60,
        },
        { status: 429 }
      );
    }

    // 3. Parse and validate request body
    const body = await req.json();
    const validation = chatRequestSchema.safeParse(body);

    if (!validation.success) {
      const errorMessages = validation.error.issues
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join('; ');

      return NextResponse.json(
        {
          error: 'Invalid request data',
          details: errorMessages,
        },
        { status: 400 }
      );
    }

    const { message, history, userId } = validation.data;

    // 4. EFFICIENCY: Fetch user progress for context enrichment
    // Personalize responses based on user's learning path
    let contextAddition = '';
    if (userId) {
      try {
        const progress = (await getServerUserProgress(userId)) as UserProgress | null;
        if (progress) {
          const completedList = (
            (progress.completedProcesses as string[] | undefined) || []
          ).join(', ');
          const viewedList = ((progress.viewedProcesses as string[] | undefined) || []).join(
            ', '
          );
          const scores = (progress.quizScores ?? []);
          const lastScore = scores.length > 0 ? scores[scores.length - 1] : undefined;

          contextAddition = `
USER CONTEXT (for personalized responses):
- State/Location: ${(progress.preferences as Record<string, unknown>)?.state || 'Not specified'}
- Completed Processes: ${completedList || 'None'}
- Viewed Processes: ${viewedList || 'None'}
- Last Quiz Score: ${lastScore?.score ?? 0}/${lastScore?.total ?? 0}
- Progress Completion: ${progress.completionPercentage ?? 0}%

Reference the user's progress context in your response when relevant.
`;
        }
      } catch (contextError) {
        console.warn('[chat-api] Error fetching user context:', contextError);
        // Continue without context if Firestore is unavailable
      }
    }

    // 5. GROUNDING: Create search-grounded prompt
    // Instructs Gemini to search official ECI sources for current information
    const groundedPrompt = createGroundedPrompt(message);

    // 6. Format chat history for @google/genai SDK
    // Convert { role, content } to SDK format { role, parts }
    const formattedHistory = history?.map((msg: Omit<ChatMessage, 'timestamp'>) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    })) || [];

    // Ensure history alternation: user, model, user, model, ...
    while (formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
      formattedHistory.shift();
    }

    // 7. AI ASSISTANT: Initialize chat session with Gemini
    // Configure with search grounding enabled
    const englishPrompt = "Please respond to all questions in English only. Do not respond in any other language.";
    const chatConfig = {
      model: MODEL_NAME,
      history: formattedHistory,
      tools: [{ googleSearch: {} }],
      config: {
        temperature: 0.1,
        topP: 0.95,
        maxOutputTokens: 2048,
      },
      systemInstruction: systemPrompt ? systemPrompt + "\n\n" + englishPrompt : englishPrompt,
    };

    const chat = client.chats.create(chatConfig);

    // Combine context with grounded prompt
    const finalPrompt = `${systemPrompt}\n\n${contextAddition}\n\n${groundedPrompt}`.trim();

    // 8. STREAMING: Send message and stream response
    // Gemini streams text chunks as they are generated
    const response = await chat.sendMessageStream({
      message: finalPrompt,
    });

    // Create a ReadableStream for the response
    const stream = new ReadableStream<Uint8Array>({
      async start(controller: ReadableStreamDefaultController<Uint8Array>) {
        try {
          for await (const chunk of response) {
            try {
              const text = typeof (chunk as { text?: unknown }).text === 'string'
                ? (chunk as { text: string }).text
                : null;
              if (text) {
                controller.enqueue(new TextEncoder().encode(text));
              }
            } catch (chunkError) {
              console.debug('[chat-api] Chunk processing error:', chunkError);
            }
          }
          controller.close();
        } catch (streamError) {
          console.error('[chat-api] Streaming error:', streamError);
          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: unknown) {
    console.error('[chat-api] Fatal error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      {
        error: 'Failed to process chat',
        details: message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET handler for CSRF token retrieval
 * Clients must call this before making chat requests to get a CSRF token
 *
 * Response:
 * ```json
 * {
 *   "csrfToken": "uuid-v4-token",
 *   "expiresIn": 3600
 * }
 * ```
 *
 * The CSRF token is set in an httpOnly, secure, sameSite=strict cookie
 *
 * @returns JSON with CSRF token and expiration time
 */
export async function GET(): Promise<NextResponse> {
  try {
    const csrfToken = crypto.randomUUID();
    const response = NextResponse.json(
      {
        csrfToken,
        expiresIn: 3600, // 1 hour
      },
      { status: 200 }
    );

    // Set the token in an HTTP-only cookie with security flags
    response.cookies.set('csrf_token', csrfToken, {
      httpOnly: true, // Cannot be accessed by JavaScript (XSS protection)
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // Only sent to same-site requests (CSRF protection)
      path: '/', // Available to all paths
      maxAge: 3600, // 1 hour expiration
    });

    return response;
  } catch (error: unknown) {
    console.error('[chat-api] Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate security token' },
      { status: 500 }
    );
  }
}
