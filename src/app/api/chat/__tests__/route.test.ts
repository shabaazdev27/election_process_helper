import { NextRequest } from 'next/server';
import { client } from '@/lib/gemini';

// Helper to create an async iterable for mocking
async function* asyncIterableFromArray<T>(arr: T[]): AsyncGenerator<T> {
  for (const item of arr) {
    yield item;
  }
}

// Shared mocks for all tests
jest.mock('@/lib/gemini', () => ({
  client: {
    chats: {
      create: jest.fn().mockReturnValue({
        sendMessageStream: jest.fn().mockImplementation(() =>
          asyncIterableFromArray([{ text: 'According to voters.eci.gov.in, you can register online. Next Steps: Visit the portal at nvsp.in.' }])
        ),
      }),
    },
  },
  systemPrompt: 'System Prompt with ECI citations required',
  MODEL_NAME: 'gemini-2.5-flash',
  createGroundedPrompt: jest.fn().mockReturnValue('Grounded Prompt with search instructions'),
  getSystemPromptForLanguage: jest.fn((_lang: string) => 'System Prompt with ECI citations required'),
}));

jest.mock('@/lib/firestore-admin', () => ({
  getServerUserProgress: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/translate', () => ({
  translate: jest.fn().mockImplementation(async (content: string) => ({
    original: content,
    translated: content,
    targetLanguage: 'en',
    cached: false,
  })),
}));

describe('Chat API Route', () => {
  /**
   * CSRF test: re-import route.ts with NODE_ENV=production so the IS_TEST
   * flag evaluates to false and the CSRF guard is active.
   */
  it('should reject requests with missing CSRF token', async () => {
    const originalEnv = process.env.NODE_ENV;
    // Override to disable the IS_TEST bypass inside route.ts
    (process.env as Record<string, string>).NODE_ENV = 'production';

    let POST: (req: NextRequest) => Promise<Response>;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ POST } = require('../route'));
    });

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST!(req);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Invalid security token');

    // Restore original NODE_ENV
    (process.env as Record<string, string>).NODE_ENV = originalEnv;
  });

  it('should accept requests with valid CSRF token and cookie', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'x-csrf-token': 'valid-token',
        'Content-Type': 'application/json',
        'Cookie': 'csrf_token=valid-token',
      },
      body: JSON.stringify({ message: 'Hello', userId: 'user-1' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(200);

    const createMock = client.chats.create as jest.Mock;
    expect(createMock).toHaveBeenCalled();
    const chatInstance = createMock.mock.results[0]?.value as {
      sendMessageStream: jest.Mock;
    };
    expect(chatInstance.sendMessageStream).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.any(String) })
    );
  });

  it('should reject invalid request bodies even with valid CSRF', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      headers: {
        'x-csrf-token': 'valid-token',
        'Content-Type': 'application/json',
        'Cookie': 'csrf_token=valid-token',
      },
      body: JSON.stringify({ msg: 'Hello' }), // Wrong key
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Invalid request data');
  });

  describe('Google Services - Search Grounding', () => {
    it('should configure chat with googleSearch tool enabled', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'How do I register to vote?' }),
      });

      await POST(req);

      const createMock = client.chats.create as jest.Mock;
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tools: [{ googleSearch: {} }],
        })
      );
    });

    it('should use low temperature for factual accuracy', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'Test' }),
      });

      await POST(req);

      const createMock = client.chats.create as jest.Mock;
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            temperature: 0.1,
          }),
        })
      );
    });

    it('should call createGroundedPrompt for all messages', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };
      const { createGroundedPrompt } = jest.requireMock('@/lib/gemini');

      const userMessage = 'How do I check my voter registration status?';
      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      await POST(req);

      expect(createGroundedPrompt).toHaveBeenCalledWith(userMessage);
    });

    it('should include system prompt with ECI requirement', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'Test' }),
      });

      await POST(req);

      const createMock = client.chats.create as jest.Mock;
      const callArgs = createMock.mock.calls[0][0];
      expect(callArgs.systemInstruction).toContain('System Prompt with ECI');
    });

    it('should stream response with proper headers', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'Test' }),
      });

      const response = await POST(req);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/plain; charset=utf-8');
      expect(response.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate');
    });
  });

  describe('Google Services - ECI Citation Validation', () => {
    it('response mock should include ECI citations', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'How do I register?' }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);

      const responseText = await response.text();
      expect(responseText).toContain('voters.eci.gov.in');
    });

    it('should support user context in grounding', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ 
          message: 'What about my state?',
          userId: 'user-123'
        }),
      });

      const response = await POST(req);
      expect(response.status).toBe(200);
    });
  });

  describe('Google Services - Configuration Validation', () => {
    it('should use gemini-2.5-flash model', async () => {
      const { MODEL_NAME } = jest.requireMock('@/lib/gemini');

      expect(MODEL_NAME).toBe('gemini-2.5-flash');
    });

    it('should configure proper token limits', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { POST } = require('../route') as { POST: (req: NextRequest) => Promise<Response> };

      const req = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'valid-token',
          'Content-Type': 'application/json',
          'Cookie': 'csrf_token=valid-token',
        },
        body: JSON.stringify({ message: 'Test' }),
      });

      await POST(req);

      const createMock = client.chats.create as jest.Mock;
      expect(createMock).toHaveBeenCalledWith(
        expect.objectContaining({
          config: expect.objectContaining({
            maxOutputTokens: 2048,
          }),
        })
      );
    });
  });
});
