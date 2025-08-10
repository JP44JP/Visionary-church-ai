// =============================================================================
// PROMETHEUS METRICS API ENDPOINT
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getPrometheusMetrics } from '../../../../monitoring/app-metrics';

export async function GET(request: NextRequest) {
  try {
    const metrics = await getPrometheusMetrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error generating metrics:', error);
    
    return NextResponse.json({
      error: 'Failed to generate metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}