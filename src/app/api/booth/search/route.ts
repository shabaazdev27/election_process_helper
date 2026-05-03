import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { findNearbyBooths } from '@/lib/maps';

/**
 * Booth Search API Endpoint
 * - GET: Find nearby booths by geolocation
 * - Query params: latitude, longitude, stateCode, radiusKm, limit
 * - Rate limited: 10 req/min per IP
 */

// Simple in-memory rate limiter (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count < RATE_LIMIT_REQUESTS) {
    record.count++;
    return true;
  }

  return false;
}

// Request validation schema
const GetBoothsSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  stateCode: z.string().length(2).toUpperCase(),
  radiusKm: z.coerce.number().min(1).max(20).default(5),
  limit: z.coerce.number().min(1).max(20).default(5),
});

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded. Maximum 10 requests per minute.',
        },
        { status: 429 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const params = GetBoothsSchema.parse({
      latitude: searchParams.get('latitude'),
      longitude: searchParams.get('longitude'),
      stateCode: searchParams.get('stateCode'),
      radiusKm: searchParams.get('radiusKm'),
      limit: searchParams.get('limit'),
    });

    // Find nearby booths
    const booths = await findNearbyBooths(
      params.latitude,
      params.longitude,
      params.stateCode,
      params.radiusKm,
      params.limit
    );

    return NextResponse.json({
      success: true,
      count: booths.length,
      location: {
        latitude: params.latitude,
        longitude: params.longitude,
      },
      booths,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Booth search error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
