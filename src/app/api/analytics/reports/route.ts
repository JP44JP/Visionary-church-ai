import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../services/analyticsService';
import { AnalyticsPeriod, AnalyticsFilter, ExportFormat } from '../../../../types/analytics';
import { z } from 'zod';

const analyticsService = new AnalyticsService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const reportQuerySchema = z.object({
  type: z.enum(['summary', 'detailed', 'custom']).default('summary'),
  period: z.enum(['1d', '7d', '30d', '90d', '1y']).default('30d'),
  format: z.enum(['json', 'csv', 'excel', 'pdf']).default('json'),
  source: z.string().optional(),
  medium: z.string().optional(),
  campaign: z.string().optional(),
  device_type: z.string().optional(),
  country: z.string().optional(),
  event_type: z.string().optional(),
  user_type: z.enum(['member', 'visitor', 'staff']).optional(),
});

// GET /api/analytics/reports - Generate analytics report
export async function GET(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');
    
    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validatedParams = reportQuerySchema.parse(queryParams);
    
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

    const report = await analyticsService.generateReport(
      churchId,
      validatedParams.type,
      validatedParams.period as AnalyticsPeriod,
      Object.keys(filters).length > 0 ? filters : undefined,
      validatedParams.format as ExportFormat
    );

    // Set appropriate response headers based on format
    const response = NextResponse.json({
      success: true,
      data: report
    });

    switch (validatedParams.format) {
      case 'csv':
        response.headers.set('Content-Type', 'text/csv');
        response.headers.set('Content-Disposition', `attachment; filename="analytics-report-${Date.now()}.csv"`);
        break;
      case 'excel':
        response.headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        response.headers.set('Content-Disposition', `attachment; filename="analytics-report-${Date.now()}.xlsx"`);
        break;
      case 'pdf':
        response.headers.set('Content-Type', 'application/pdf');
        response.headers.set('Content-Disposition', `attachment; filename="analytics-report-${Date.now()}.pdf"`);
        break;
      default:
        response.headers.set('Content-Type', 'application/json');
    }

    return response;
  } catch (error) {
    console.error('Error generating analytics report:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}