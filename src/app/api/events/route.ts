import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../services/eventService';
import { EventCreateRequest, EventFilters, EventSortOptions, PaginationOptions } from '../../../types/events';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  location: z.string().min(1).max(255),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().optional(),
  eventType: z.enum(['worship', 'bible_study', 'prayer', 'fellowship', 'outreach', 'youth', 'children', 'ministry', 'special', 'conference', 'retreat', 'wedding', 'funeral', 'other']),
  category: z.string().min(1).max(100),
  capacity: z.number().positive().optional(),
  cost: z.number().min(0).optional(),
  costType: z.enum(['free', 'paid', 'donation', 'suggested_donation']),
  ageGroups: z.array(z.string()).optional(),
  audienceType: z.enum(['all', 'members', 'visitors', 'youth', 'children', 'adults', 'seniors', 'families', 'men', 'women']),
  registrationRequired: z.boolean(),
  registrationDeadline: z.string().optional(),
  waitlistEnabled: z.boolean(),
  isRecurring: z.boolean(),
  recurrencePattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
    interval: z.number().positive(),
    byWeekDay: z.array(z.number().min(0).max(6)).optional(),
    byMonthDay: z.array(z.number().min(1).max(31)).optional(),
    byMonth: z.array(z.number().min(1).max(12)).optional(),
    until: z.string().optional(),
    count: z.number().positive().optional(),
  }).optional(),
  imageUrl: z.string().url().optional(),
  settings: z.object({
    allowWaitlist: z.boolean(),
    sendReminders: z.boolean(),
    reminderSchedule: z.array(z.object({
      days: z.number(),
      hours: z.number(),
    })),
    customFields: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(['text', 'email', 'phone', 'number', 'select', 'multiselect', 'textarea', 'checkbox']),
      required: z.boolean(),
      options: z.array(z.string()).optional(),
    })),
    cancellationPolicy: z.object({
      allowCancellation: z.boolean(),
      deadlineHours: z.number(),
      refundPolicy: z.string(),
    }),
    checkInSettings: z.object({
      enableQRCode: z.boolean(),
      enableManualCheckIn: z.boolean(),
      enableMobileApp: z.boolean(),
      requireCheckOut: z.boolean(),
    }),
  }),
});

// GET /api/events - Get events for a church
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const churchId = request.headers.get('x-church-id');

    if (!churchId) {
      return NextResponse.json({ error: 'Church ID required' }, { status: 400 });
    }

    // Parse filters
    const filters: EventFilters = {};
    if (searchParams.get('startDate')) filters.startDate = searchParams.get('startDate')!;
    if (searchParams.get('endDate')) filters.endDate = searchParams.get('endDate')!;
    if (searchParams.get('eventType')) {
      filters.eventType = searchParams.get('eventType')!.split(',') as any;
    }
    if (searchParams.get('category')) {
      filters.category = searchParams.get('category')!.split(',');
    }
    if (searchParams.get('status')) {
      filters.status = searchParams.get('status')!.split(',') as any;
    }
    if (searchParams.get('audienceType')) {
      filters.audienceType = searchParams.get('audienceType')!.split(',') as any;
    }
    if (searchParams.get('registrationRequired')) {
      filters.registrationRequired = searchParams.get('registrationRequired') === 'true';
    }
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    // Parse sorting
    const sort: EventSortOptions = {
      field: (searchParams.get('sortField') as any) || 'start_date',
      direction: (searchParams.get('sortDirection') as 'asc' | 'desc') || 'asc',
    };

    // Parse pagination
    const pagination: PaginationOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '25'), 100),
    };

    const result = await eventService.getEvents(churchId, filters, sort, pagination);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

// POST /api/events - Create a new event
export async function POST(request: NextRequest) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    const event = await eventService.createEvent(churchId, userId, validatedData as EventCreateRequest);

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}