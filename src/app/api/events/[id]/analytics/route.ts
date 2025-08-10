import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/events/[id]/analytics - Get event analytics
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    const analytics = await eventService.getEventAnalytics(params.id);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching event analytics:', error);
    
    if (error instanceof Error && error.message === 'Event not found') {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch event analytics' },
      { status: 500 }
    );
  }
}