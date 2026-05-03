import { NextRequest } from 'next/server';
import { client } from '@/lib/gemini';

// Shared mocks for all tests
jest.mock('@/lib/gemini', () => ({
  client: {
    chats: {
      create: jest.fn().mockReturnValue({
        sendMessageStream: jest.fn().mockResolvedValue([{ text: 'Hello' }]),
      }),
    },
  },
  systemPrompt: 'System Prompt',
  MODEL_NAME: 'gemini-2.5-flash',
  createGroundedPrompt: jest.fn().mockReturnValue('Grounded Prompt'),
}));

jest.mock('@/lib/firestore-admin', () => ({
  getServerUserProgress: jest.fn().mockResolvedValue(null),
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
});
