/**
 * API route for batch geocoding (admin endpoint)
 * 
 * Security:
 * - Admin authentication required
 * - Rate limiting (5 req/hour)
 * - File size limits
 * 
 * Functionality:
 * - CSV upload and parsing
 * - Batch geocoding with progress tracking
 * - Error reporting
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { importEciData, getGeocodeStats } from '@/lib/eci-data-importer';

// Request validation
const BatchGeocodeRequestSchema = z.object({
  csvData: z.string().min(1).max(10485760), // Max 10MB
  stateCode: z.string().length(2),
  adminToken: z.string().min(32),
});

// Rate limiting for admin operations
const adminRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const ADMIN_RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour
const MAX_ADMIN_REQUESTS_PER_WINDOW = process.env.NODE_ENV === 'production' ? 5 : 100;

function checkAdminRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = adminRateLimitMap.get(identifier);

  if (!record || now > record.resetAt) {
    adminRateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + ADMIN_RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count < MAX_ADMIN_REQUESTS_PER_WINDOW) {
    record.count++;
    return true;
  }

  return false;
}

/**
 * POST /api/admin/batch-geocode
 * Upload CSV and batch geocode polling booths
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkAdminRateLimit(identifier)) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          message: 'Admin operations limited to 5 per hour',
        },
        { status: 429 }
      );
    }

    // 2. Parse and validate request
    const body = await request.json();
    const { csvData, stateCode, adminToken } = BatchGeocodeRequestSchema.parse(body);

    // 3. Authenticate admin
    const expectedToken = process.env.ADMIN_SECRET_TOKEN;
    if (!expectedToken) {
      console.error('ADMIN_SECRET_TOKEN not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (adminToken !== expectedToken) {
      console.warn('Invalid admin token received');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid admin token' },
        { status: 401 }
      );
    }

    // 4. Process CSV and geocode
    console.log(`Starting batch geocode for state: ${stateCode}`);
    const result = await importEciData(csvData, stateCode);

    // 5. Get stats
    const stats = getGeocodeStats();

    // 6. Return result
    return NextResponse.json({
      success: result.success,
      processed: result.processed,
      errors: result.errors,
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in batch geocode:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          details: error.issues,
        },
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
 * GET /api/admin/batch-geocode
 * Get geocoding statistics (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin token from query params or header
    const token = request.nextUrl.searchParams.get('token') || 
                  request.headers.get('authorization')?.replace('Bearer ', '');

    const expectedToken = process.env.ADMIN_SECRET_TOKEN;
    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const stats = getGeocodeStats();

    return NextResponse.json({
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching geocode stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
