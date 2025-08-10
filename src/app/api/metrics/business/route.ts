// =============================================================================
// BUSINESS METRICS API ENDPOINT
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessMetrics } from '../../../../../monitoring/app-metrics';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenant_id');
    const timeframe = searchParams.get('timeframe') || '24h';
    const format = searchParams.get('format') || 'json';

    // Get business metrics from monitoring system
    const prometheusMetrics = await getBusinessMetrics();

    // Get real-time business data from database
    const businessData = await getRealtimeBusinessMetrics(tenantId, timeframe);

    const response = {
      ...prometheusMetrics,
      realtime_data: businessData,
      metadata: {
        tenant_id: tenantId,
        timeframe,
        generated_at: new Date().toISOString(),
      },
    };

    if (format === 'prometheus') {
      // Return Prometheus format for scraping
      const prometheusFormat = convertToPrometheusFormat(response);
      return new NextResponse(prometheusFormat, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Generated-At': new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error generating business metrics:', error);
    
    return NextResponse.json({
      error: 'Failed to generate business metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

async function getRealtimeBusinessMetrics(tenantId?: string | null, timeframe: string = '24h') {
  try {
    // Calculate time range
    const timeRangeHours = parseTimeframe(timeframe);
    const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

    // Base query filters
    let chatQuery = supabase
      .from('chat_conversations')
      .select('id, tenant_id, created_at, status')
      .gte('created_at', startTime);

    let prayerQuery = supabase
      .from('prayer_requests')
      .select('id, tenant_id, created_at, status, priority')
      .gte('created_at', startTime);

    let visitQuery = supabase
      .from('visit_requests')
      .select('id, tenant_id, created_at, status, visit_type')
      .gte('created_at', startTime);

    let eventQuery = supabase
      .from('event_registrations')
      .select('id, tenant_id, created_at, status, event_type')
      .gte('created_at', startTime);

    // Apply tenant filter if provided
    if (tenantId) {
      chatQuery = chatQuery.eq('tenant_id', tenantId);
      prayerQuery = prayerQuery.eq('tenant_id', tenantId);
      visitQuery = visitQuery.eq('tenant_id', tenantId);
      eventQuery = eventQuery.eq('tenant_id', tenantId);
    }

    // Execute queries in parallel
    const [chatData, prayerData, visitData, eventData] = await Promise.all([
      chatQuery,
      prayerQuery,
      visitQuery,
      eventQuery,
    ]);

    // Process and aggregate data
    const metrics = {
      chat_conversations: {
        total: chatData.data?.length || 0,
        by_status: aggregateByField(chatData.data, 'status'),
        by_tenant: tenantId ? null : aggregateByField(chatData.data, 'tenant_id'),
        hourly_breakdown: getHourlyBreakdown(chatData.data, timeRangeHours),
      },
      prayer_requests: {
        total: prayerData.data?.length || 0,
        by_status: aggregateByField(prayerData.data, 'status'),
        by_priority: aggregateByField(prayerData.data, 'priority'),
        by_tenant: tenantId ? null : aggregateByField(prayerData.data, 'tenant_id'),
        hourly_breakdown: getHourlyBreakdown(prayerData.data, timeRangeHours),
      },
      visit_requests: {
        total: visitData.data?.length || 0,
        by_status: aggregateByField(visitData.data, 'status'),
        by_type: aggregateByField(visitData.data, 'visit_type'),
        by_tenant: tenantId ? null : aggregateByField(visitData.data, 'tenant_id'),
        hourly_breakdown: getHourlyBreakdown(visitData.data, timeRangeHours),
      },
      event_registrations: {
        total: eventData.data?.length || 0,
        by_status: aggregateByField(eventData.data, 'status'),
        by_type: aggregateByField(eventData.data, 'event_type'),
        by_tenant: tenantId ? null : aggregateByField(eventData.data, 'tenant_id'),
        hourly_breakdown: getHourlyBreakdown(eventData.data, timeRangeHours),
      },
    };

    return metrics;
  } catch (error) {
    console.error('Error fetching realtime business metrics:', error);
    return {
      error: 'Failed to fetch realtime metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function parseTimeframe(timeframe: string): number {
  const match = timeframe.match(/^(\d+)([hd])$/);
  if (!match) return 24; // Default to 24 hours

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'h':
      return value;
    case 'd':
      return value * 24;
    default:
      return 24;
  }
}

function aggregateByField(data: any[] | null, field: string): Record<string, number> {
  if (!data) return {};

  return data.reduce((acc, item) => {
    const value = item[field] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function getHourlyBreakdown(data: any[] | null, timeRangeHours: number): Record<string, number> {
  if (!data) return {};

  const breakdown: Record<string, number> = {};
  const now = new Date();

  // Initialize all hours with 0
  for (let i = 0; i < timeRangeHours; i++) {
    const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hourKey = hour.getHours().toString().padStart(2, '0');
    breakdown[hourKey] = 0;
  }

  // Count items by hour
  data.forEach(item => {
    if (item.created_at) {
      const itemDate = new Date(item.created_at);
      const hourKey = itemDate.getHours().toString().padStart(2, '0');
      breakdown[hourKey] = (breakdown[hourKey] || 0) + 1;
    }
  });

  return breakdown;
}

function convertToPrometheusFormat(data: any): string {
  let prometheus = '';

  // Convert business metrics to Prometheus format
  if (data.realtime_data) {
    const metrics = data.realtime_data;

    // Chat conversation metrics
    prometheus += `# HELP church_chat_conversations_total Total chat conversations\n`;
    prometheus += `# TYPE church_chat_conversations_total counter\n`;
    prometheus += `church_chat_conversations_total{timeframe="${data.metadata.timeframe}"} ${metrics.chat_conversations.total}\n`;

    // Prayer request metrics
    prometheus += `# HELP church_prayer_requests_total Total prayer requests\n`;
    prometheus += `# TYPE church_prayer_requests_total counter\n`;
    prometheus += `church_prayer_requests_total{timeframe="${data.metadata.timeframe}"} ${metrics.prayer_requests.total}\n`;

    // Visit request metrics
    prometheus += `# HELP church_visit_requests_total Total visit requests\n`;
    prometheus += `# TYPE church_visit_requests_total counter\n`;
    prometheus += `church_visit_requests_total{timeframe="${data.metadata.timeframe}"} ${metrics.visit_requests.total}\n`;

    // Event registration metrics
    prometheus += `# HELP church_event_registrations_total Total event registrations\n`;
    prometheus += `# TYPE church_event_registrations_total counter\n`;
    prometheus += `church_event_registrations_total{timeframe="${data.metadata.timeframe}"} ${metrics.event_registrations.total}\n`;

    // Status breakdown metrics
    Object.entries(metrics.chat_conversations.by_status).forEach(([status, count]) => {
      prometheus += `church_chat_conversations_by_status{status="${status}",timeframe="${data.metadata.timeframe}"} ${count}\n`;
    });

    Object.entries(metrics.prayer_requests.by_status).forEach(([status, count]) => {
      prometheus += `church_prayer_requests_by_status{status="${status}",timeframe="${data.metadata.timeframe}"} ${count}\n`;
    });

    Object.entries(metrics.visit_requests.by_status).forEach(([status, count]) => {
      prometheus += `church_visit_requests_by_status{status="${status}",timeframe="${data.metadata.timeframe}"} ${count}\n`;
    });

    Object.entries(metrics.event_registrations.by_status).forEach(([status, count]) => {
      prometheus += `church_event_registrations_by_status{status="${status}",timeframe="${data.metadata.timeframe}"} ${count}\n`;
    });
  }

  return prometheus;
}