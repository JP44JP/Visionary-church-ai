import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../services/eventService';
import { EventFilters } from '../../../../types/events';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/events/public - Get public events for a church (no authentication required)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = searchParams.get('churchId');

    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    // Parse filters for public events
    const filters: EventFilters = {};
    if (searchParams.get('startDate')) filters.startDate = searchParams.get('startDate')!;
    if (searchParams.get('endDate')) filters.endDate = searchParams.get('endDate')!;
    if (searchParams.get('eventType')) {
      filters.eventType = searchParams.get('eventType')!.split(',') as any;
    }
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    const events = await eventService.getPublicEvents(churchId, filters);

    return NextResponse.json({
      events,
      count: events.length,
    });
  } catch (error) {
    console.error('Error fetching public events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public events' },
      { status: 500 }
    );
  }
}