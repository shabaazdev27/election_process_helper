import { POST } from '../route';
import { NextRequest } from 'next/server';

// Mock the dependencies
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
  it('should reject requests with missing CSRF token', async () => {
    const req = new NextRequest('http://localhost/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const response = await POST(req);
    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe('Invalid security token');
  });

  it('should accept requests with valid CSRF token and cookie', async () => {
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
  });

  it('should reject invalid request bodies even with valid CSRF', async () => {
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
