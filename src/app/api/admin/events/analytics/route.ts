import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/admin/events/analytics - Get overall event analytics for admin
export async function GET(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    // Check if user has admin privileges
    if (!['super_admin', 'church_admin', 'staff'].includes(userRole || '')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'month'; // month, quarter, year, all
    const includeProjections = searchParams.get('projections') === 'true';

    const stats = await eventService.getEventStats(churchId);

    // Calculate additional metrics based on timeframe
    let dateFilter: Date | undefined;
    const now = new Date();

    switch (timeframe) {
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        dateFilter = new Date(now.getFullYear(), quarterStart, 1);
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFilter = undefined;
    }

    // Get trends and comparisons
    const trends = {
      eventCreationTrend: {
        current: stats.totalEvents,
        previousPeriod: 0, // This would require historical data calculation
        changePercentage: 0,
      },
      attendanceTrend: {
        current: stats.averageAttendanceRate,
        previousPeriod: 0,
        changePercentage: 0,
      },
      revenueTrend: {
        current: stats.revenueThisMonth,
        previousPeriod: 0,
        changePercentage: 0,
      }
    };

    const response = {
      stats,
      trends,
      timeframe,
      ...(includeProjections && {
        projections: {
          nextMonthEvents: Math.ceil(stats.upcomingEvents / 4), // Simple projection
          expectedRevenue: stats.revenueThisMonth * 1.1, // 10% growth assumption
          capacityUtilization: (stats.totalAttendees / (stats.totalRegistrations || 1)) * 100,
        }
      }),
      recommendations: generateRecommendations(stats),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin analytics' },
      { status: 500 }
    );
  }
}

function generateRecommendations(stats: any): string[] {
  const recommendations: string[] = [];

  if (stats.averageAttendanceRate < 70) {
    recommendations.push('Consider improving event promotion strategies as attendance rate is below 70%');
  }

  if (stats.upcomingEvents === 0) {
    recommendations.push('No upcoming events scheduled. Consider planning new events to maintain engagement');
  }

  if (stats.totalRegistrations > stats.totalAttendees * 1.3) {
    recommendations.push('High no-show rate detected. Consider implementing reminder systems or confirmation requirements');
  }

  if (stats.revenueThisMonth === 0) {
    recommendations.push('No revenue generated this month. Consider adding paid events or donation options');
  }

  const popularEventType = stats.popularEventTypes[0];
  if (popularEventType && popularEventType.count > stats.totalEvents * 0.5) {
    recommendations.push(`${popularEventType.type} events are very popular. Consider creating more diverse event types`);
  }

  return recommendations;
}