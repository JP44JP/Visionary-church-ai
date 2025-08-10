import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const addVolunteerSchema = z.object({
  userId: z.string().uuid(),
  role: z.string().min(1).max(100),
  description: z.string().optional(),
  requirements: z.array(z.string()).optional(),
  capacity: z.number().positive().optional(),
});

// GET /api/events/[id]/volunteers - Get event volunteers
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

    const event = await eventService.getEvent(params.id);
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const volunteers = event.volunteers;

    // Group volunteers by status and role
    const summary = {
      total: volunteers.length,
      interested: volunteers.filter(v => v.status === 'interested').length,
      confirmed: volunteers.filter(v => v.status === 'confirmed').length,
      checkedIn: volunteers.filter(v => v.status === 'checked_in').length,
      completed: volunteers.filter(v => v.status === 'completed').length,
      cancelled: volunteers.filter(v => v.status === 'cancelled').length,
      totalHours: volunteers
        .filter(v => v.hours_served)
        .reduce((sum, v) => sum + (v.hours_served || 0), 0),
    };

    // Group by roles
    const rolesSummary = volunteers.reduce((acc, volunteer) => {
      if (!acc[volunteer.role]) {
        acc[volunteer.role] = {
          role: volunteer.role,
          total: 0,
          confirmed: 0,
          needed: volunteer.capacity || 0,
        };
      }
      acc[volunteer.role].total++;
      if (volunteer.status === 'confirmed' || volunteer.status === 'checked_in') {
        acc[volunteer.role].confirmed++;
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      volunteers,
      summary,
      roles: Object.values(rolesSummary),
    });
  } catch (error) {
    console.error('Error fetching event volunteers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event volunteers' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/volunteers - Add volunteer to event
export async function POST(
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
    const validatedData = addVolunteerSchema.parse(body);

    const volunteer = await eventService.addVolunteerRole(
      params.id,
      validatedData.userId,
      validatedData.role,
      validatedData.requirements
    );

    return NextResponse.json(volunteer, { status: 201 });
  } catch (error) {
    console.error('Error adding volunteer:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add volunteer' },
      { status: 500 }
    );
  }
}