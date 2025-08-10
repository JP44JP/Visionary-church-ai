import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '../../../../services/analyticsService';
import { z } from 'zod';

const analyticsService = new AnalyticsService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const eventTrackingSchema = z.object({
  event_name: z.string(),
  event_category: z.string(),
  event_action: z.string(),
  event_label: z.string().optional(),
  event_value: z.number().optional(),
  
  // Context
  page_url: z.string().optional(),
  referrer_url: z.string().optional(),
  user_agent: z.string().optional(),
  
  // Session and user
  session_id: z.string().optional(),
  user_id: z.string().optional(),
  visitor_id: z.string().optional(),
  
  // Custom dimensions
  custom_dimension_1: z.string().optional(), // Source/Medium
  custom_dimension_2: z.string().optional(), // Campaign
  custom_dimension_3: z.string().optional(), // Content
  custom_dimension_4: z.string().optional(), // Term
  custom_dimension_5: z.string().optional(), // Additional
});

const batchEventSchema = z.object({
  events: z.array(eventTrackingSchema)
});

// POST /api/analytics/events - Track analytics event(s)
export async function POST(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    const body = await request.json();
    
    // Check if it's a batch of events or single event
    let events: any[] = [];
    if (Array.isArray(body.events)) {
      // Batch tracking
      const validatedBatch = batchEventSchema.parse(body);
      events = validatedBatch.events;
    } else {
      // Single event
      const validatedEvent = eventTrackingSchema.parse(body);
      events = [validatedEvent];
    }

    // Extract IP and user agent from request if not provided
    const ip = request.headers.get('x-forwarded-for') || 
              request.headers.get('x-real-ip') || 
              request.ip || 
              'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Track each event
    const trackingPromises = events.map(event => 
      analyticsService.trackEvent({
        church_id: churchId,
        ...event,
        ip_address: event.ip_address || ip,
        user_agent: event.user_agent || userAgent
      })
    );

    await Promise.all(trackingPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully tracked ${events.length} event(s)`
    });
  } catch (error) {
    console.error('Error tracking analytics events:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track events' },
      { status: 500 }
    );
  }
}