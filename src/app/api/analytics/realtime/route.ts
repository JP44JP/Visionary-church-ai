import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../services/analyticsService';

const analyticsService = new AnalyticsService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/analytics/realtime - Get real-time analytics metrics
export async function GET(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    const metrics = await analyticsService.getRealTimeMetrics(churchId);

    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching real-time metrics:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch real-time metrics' },
      { status: 500 }
    );
  }
}