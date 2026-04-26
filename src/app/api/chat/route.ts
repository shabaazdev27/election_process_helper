import { NextRequest, NextResponse } from 'next/server';
import { generativeModel, systemPrompt } from '@/lib/gemini';
import { getServerUserProgress } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { message, history, userId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Fetch user progress for context enrichment
    let enrichedPrompt = systemPrompt;
    if (userId) {
      const progress = await getServerUserProgress(userId) as any;
      if (progress) {
        enrichedPrompt += `\n\nUSER CONTEXT:
- Completed Processes: ${progress.completedProcesses?.join(', ') || 'None'}
- Viewed Processes: ${progress.viewedProcesses?.join(', ') || 'None'}
- Last Quiz Score: ${progress.quizScores?.[progress.quizScores.length - 1]?.score || 0}/${progress.quizScores?.[progress.quizScores.length - 1]?.total || 0}
Please reference their progress if relevant. If they finished registration, acknowledge it.`;
      }
    }

    // Prepare history for Gemini format
    const formattedHistory = history?.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || [];

    // The standard SDK allows passing system instruction in startChat or getGenerativeModel
    // For simplicity, we'll prepend the system instruction to the first message if history is empty,
    // or better, use the model's capability if supported in the specific SDK version.
    // However, most reliable way across versions is to include it in the initial prompt or history.
    
    const chat = generativeModel.startChat({
      history: formattedHistory,
      // Some versions of standard SDK support systemInstruction here:
      // systemInstruction: enrichedPrompt 
    });

    // If history is empty, we can prepend context to the first message
    const finalMessage = history?.length === 0 
      ? `System Instructions: ${enrichedPrompt}\n\nUser Message: ${message}`
      : message;

    const result = await chat.sendMessageStream(finalMessage);

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          controller.enqueue(new TextEncoder().encode(chunkText));
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
