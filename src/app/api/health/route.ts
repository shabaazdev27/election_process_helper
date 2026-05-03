/**
 * API route for Pub/Sub health check
 * 
 * Security:
 * - Internal health check
 * - No authentication required
 * 
 * Functionality:
 * - Test Pub/Sub connectivity
 * - Verify topic existence
 * - Return status
 */

import { NextResponse } from 'next/server';
import { healthCheck, getCacheStats } from '@/lib/pubsub';
import { getCacheStats as getSchedulerCacheStats } from '@/lib/scheduler';
import { getGeocodeStats } from '@/lib/eci-data-importer';

/**
 * GET /api/health
 * System health check including all Google Services
 */
export async function GET() {
  try {
    const [pubSubHealthy] = await Promise.all([
      healthCheck().catch(() => false),
    ]);

    const health = {
      status: pubSubHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        pubsub: {
          status: pubSubHealthy ? 'up' : 'down',
          stats: pubSubHealthy ? await getCacheStats() : null,
        },
        scheduler: {
          status: 'up', // Scheduler is passive, always up if code loads
          cacheStats: getSchedulerCacheStats(),
        },
        geocoder: {
          status: 'up',
          stats: getGeocodeStats(),
        },
      },
      googleServices: {
        pubsub: pubSubHealthy,
        firestore: true, // Assume healthy if app is running
        translate: true, // Assume healthy if app is running
        gemini: true, // Assume healthy if app is running
        geocoding: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
