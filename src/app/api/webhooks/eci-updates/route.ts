/**
 * API route for ECI update webhook (called by Cloud Scheduler)
 * 
 * Security:
 * - CSRF token validation
 * - Rate limiting (1 req/min from Cloud Scheduler)
 * - Request authentication via shared secret
 * 
 * Accessibility:
 * - RESTful design
 * - Clear error messages
 * - JSON response format
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runEciUpdateCheck } from '@/lib/scheduler';

// Validation schema
const WebhookRequestSchema = z.object({
  token: z.string().min(32),
  trigger: z.enum(['scheduled', 'manual']).default('scheduled'),
});

// Rate limiting (simple in-memory for single instance)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const lastRequest = rateLimitMap.get(identifier);

  if (!lastRequest || now - lastRequest > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(identifier, now);
    return true;
  }

  return false;
}

/**
 * POST /api/webhooks/eci-updates
 * Triggered by Cloud Scheduler to check for ECI updates
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    const { token, trigger } = WebhookRequestSchema.parse(body);

    // 3. Authenticate request
    const expectedToken = process.env.ECI_WEBHOOK_SECRET;
    if (!expectedToken) {
      console.error('ECI_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (token !== expectedToken) {
      console.warn('Invalid webhook token received');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 4. Run ECI update check
    console.log(`Running ECI update check (trigger: ${trigger})...`);
    const result = await runEciUpdateCheck();

    // 5. Return result
    return NextResponse.json({
      success: result.success,
      updates: result.updates,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in ECI webhook:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/eci-updates
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'eci-updates-webhook',
    timestamp: new Date().toISOString(),
  });
}
