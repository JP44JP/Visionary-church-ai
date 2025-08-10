import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../services/analyticsService';
import { AnalyticsPeriod, AnalyticsFilter } from '../../../../types/analytics';
import { z } from 'zod';

const analyticsService = new AnalyticsService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const dashboardQuerySchema = z.object({
  period: z.enum(['1d', '7d', '30d', '90d', '1y']).optional().default('30d'),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  device_type: z.string().optional(),
  country: z.string().optional(),
  event_type: z.string().optional(),
  user_type: z.enum(['member', 'visitor', 'staff']).optional(),
});

// GET /api/analytics/dashboard - Get comprehensive dashboard metrics
export async function GET(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = dashboardQuerySchema.parse(queryParams);
    
    const filters: AnalyticsFilter = {
      source: validatedParams.source,
      medium: validatedParams.medium,
      campaign: validatedParams.campaign,
      device_type: validatedParams.device_type,
      country: validatedParams.country,
      event_type: validatedParams.event_type,
      user_type: validatedParams.user_type,
    };

    // Remove undefined values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof AnalyticsFilter] === undefined) {
        delete filters[key as keyof AnalyticsFilter];
      }
    });

    const metrics = await analyticsService.getDashboardMetrics(
      churchId,
      validatedParams.period as AnalyticsPeriod,
      Object.keys(filters).length > 0 ? filters : undefined
    );

    return NextResponse.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}