import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../../services/eventService';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const actionSchema = z.object({
  action: z.enum(['confirm', 'checkin', 'checkout', 'cancel']),
  notes: z.string().optional(),
});

// PUT /api/events/[id]/volunteers/[volunteerId] - Update volunteer status
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; volunteerId: string } }
) {
  try {
    const churchId = request.headers.get('x-church-id');
    const userId = request.headers.get('x-user-id');

    if (!churchId || !userId) {
      return NextResponse.json({ error: 'Church ID and User ID required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = actionSchema.parse(body);

    let volunteer;

    switch (validatedData.action) {
      case 'confirm':
        volunteer = await eventService.confirmVolunteer(params.volunteerId);
        break;
      case 'checkin':
        volunteer = await eventService.checkInVolunteer(params.volunteerId);
        break;
      case 'checkout':
        volunteer = await eventService.checkOutVolunteer(params.volunteerId);
        break;
      case 'cancel':
        // TODO: Implement cancel volunteer method in EventService
        return NextResponse.json(
          { error: 'Cancel volunteer not implemented yet' },
          { status: 501 }
        );
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      volunteer,
      message: `Volunteer ${validatedData.action} successful`
    });
  } catch (error) {
    console.error('Error updating volunteer status:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update volunteer status' },
      { status: 500 }
    );
  }
}