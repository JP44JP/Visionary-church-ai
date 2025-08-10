import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../services/eventService';
import { EventUpdate } from '../../../../types/events';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  location: z.string().min(1).max(255).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  eventType: z.enum(['worship', 'bible_study', 'prayer', 'fellowship', 'outreach', 'youth', 'children', 'ministry', 'special', 'conference', 'retreat', 'wedding', 'funeral', 'other']).optional(),
  category: z.string().min(1).max(100).optional(),
  capacity: z.number().positive().nullable().optional(),
  cost: z.number().min(0).nullable().optional(),
  costType: z.enum(['free', 'paid', 'donation', 'suggested_donation']).optional(),
  ageGroups: z.array(z.string()).nullable().optional(),
  audienceType: z.enum(['all', 'members', 'visitors', 'youth', 'children', 'adults', 'seniors', 'families', 'men', 'women']).optional(),
  registrationRequired: z.boolean().optional(),
  registrationDeadline: z.string().nullable().optional(),
  waitlistEnabled: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'cancelled', 'completed', 'postponed']).optional(),
  imageUrl: z.string().url().nullable().optional(),
  settings: z.any().optional(),
});

// GET /api/events/[id] - Get a specific event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const event = await eventService.getEvent(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/[id] - Update an event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateEventSchema.parse(body);

    // Convert to database format
    const updateData: EventUpdate = {};
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.location) updateData.location = validatedData.location;
    if (validatedData.startDate) updateData.start_date = validatedData.startDate;
    if (validatedData.endDate) updateData.end_date = validatedData.endDate;
    if (validatedData.startTime) updateData.start_time = validatedData.startTime;
    if (validatedData.endTime) updateData.end_time = validatedData.endTime;
    if (validatedData.eventType) updateData.event_type = validatedData.eventType;
    if (validatedData.category) updateData.category = validatedData.category;
    if (validatedData.capacity !== undefined) updateData.capacity = validatedData.capacity;
    if (validatedData.cost !== undefined) updateData.cost = validatedData.cost;
    if (validatedData.costType) updateData.cost_type = validatedData.costType;
    if (validatedData.ageGroups !== undefined) updateData.age_groups = validatedData.ageGroups;
    if (validatedData.audienceType) updateData.audience_type = validatedData.audienceType;
    if (validatedData.registrationRequired !== undefined) updateData.registration_required = validatedData.registrationRequired;
    if (validatedData.registrationDeadline !== undefined) updateData.registration_deadline = validatedData.registrationDeadline;
    if (validatedData.waitlistEnabled !== undefined) updateData.waitlist_enabled = validatedData.waitlistEnabled;
    if (validatedData.status) updateData.status = validatedData.status;
    if (validatedData.imageUrl !== undefined) updateData.image_url = validatedData.imageUrl;
    if (validatedData.settings) updateData.settings = validatedData.settings as any;

    updateData.updated_at = new Date().toISOString();

    const event = await eventService.updateEvent(params.id, updateData);

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[id] - Delete an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    await eventService.deleteEvent(params.id);

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}