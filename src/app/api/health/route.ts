// =============================================================================
// HEALTH CHECK API ENDPOINT
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { handleHealthCheck, handleQuickHealthCheck } from '../../../../monitoring/health-checks';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const quick = searchParams.get('quick') === 'true';
  
  try {
    if (quick) {
      return await handleQuickHealthCheck(request);
    } else {
      return await handleHealthCheck(request);
    }
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'unhealthy',
      message: 'Health check system error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function HEAD(request: NextRequest) {
  // Lightweight health check for load balancers
  try {
    const health = await handleQuickHealthCheck(request);
    return new NextResponse(null, { 
      status: health.status === 200 ? 200 : 503,
      headers: {
        'X-Health-Status': health.status === 200 ? 'healthy' : 'unhealthy',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    return new NextResponse(null, { 
      status: 503,
      headers: {
        'X-Health-Status': 'unhealthy',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}