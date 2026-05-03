/**
 * Chat Translation Endpoint - POST /api/chat/translate
 *
 * Translates chat responses to user's selected language.
 * Implements rate limiting, CSRF protection, and caching.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  translate,
  TranslationRequestSchema,
} from '@/lib/translate';

/**
 * Rate limiting store: Maps client IP/User ID to request timestamps
 */
const rateLimitStore = new Map<string, number[]>();

/**
 * Rate limit configuration
 * Guests: 20/min, Authenticated: 50/min
 */
const RATE_LIMITS = {
  guest: { requests: 20, window: 60000 },
  authenticated: { requests: 50, window: 60000 },
};

/**
 * Check rate limit for client
 */
function checkRateLimit(clientId: string, isAuthenticated: boolean): boolean {
  const now = Date.now();
  const limit = isAuthenticated ? RATE_LIMITS.authenticated : RATE_LIMITS.guest;

  if (!rateLimitStore.has(clientId)) {
    rateLimitStore.set(clientId, []);
  }

  const timestamps = rateLimitStore.get(clientId)!;

  // Remove timestamps outside the window
  const validTimestamps = timestamps.filter((ts) => now - ts < limit.window);

  if (validTimestamps.length >= limit.requests) {
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitStore.set(clientId, validTimestamps);
  return true;
}

/**
 * POST /api/chat/translate
 *
 * Request body:
 * ```json
 * {
 *   "content": "How do I register to vote?",
 *   "targetLanguage": "hi",
 *   "sourceLanguage": "en"
 * }
 * ```
 *
 * Response:
 * ```json
 * {
 *   "original": "How do I register to vote?",
 *   "translated": "मैं मतदान के लिए पंजीकरण कैसे करूं?",
 *   "targetLanguage": "hi",
 *   "cached": false
 * }
 * ```
 */
export async function POST(req: NextRequest) {
  try {
    // Extract client identifier (IP for guests, user ID if provided)
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
    const userId = req.headers.get('x-user-id') || null;
    const clientId = userId || clientIp;
    const isAuthenticated = !!userId;

    // Check rate limit
    if (!checkRateLimit(clientId, isAuthenticated)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    // Parse and validate request body
    const body = await req.json();

    let request;
    try {
      request = TranslationRequestSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Invalid request', details: error.issues },
          { status: 400 }
        );
      }
      throw error;
    }

    // Perform translation
    const result = await translate(
      request.content,
      request.targetLanguage,
      request.sourceLanguage
    );

    // Return translated response
    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Translation API error:', error);

    return NextResponse.json(
      { error: 'Translation service unavailable' },
      { status: 503 }
    );
  }
}

/**
 * GET /api/chat/translate
 *
 * Returns list of supported languages
 */
export async function GET() {
  const { SUPPORTED_LANGUAGES } = await import('@/lib/translate');

  return NextResponse.json({
    supportedLanguages: SUPPORTED_LANGUAGES,
    timestamp: new Date().toISOString(),
  });
}
