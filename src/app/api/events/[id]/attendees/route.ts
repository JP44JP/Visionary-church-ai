import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/events/[id]/attendees - Get event attendees/registrations
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeDetails = searchParams.get('includeDetails') === 'true';

    const registrations = await eventService.getEventRegistrations(params.id);

    // Filter by status if provided
    let filteredRegistrations = registrations;
    if (status) {
      const statusFilter = status.split(',');
      filteredRegistrations = registrations.filter(reg => statusFilter.includes(reg.status));
    }

    // Group registrations by status for summary
    const summary = {
      total: registrations.length,
      confirmed: registrations.filter(r => r.status === 'confirmed').length,
      pending: registrations.filter(r => r.status === 'pending').length,
      waitlisted: registrations.filter(r => r.status === 'waitlisted').length,
      cancelled: registrations.filter(r => r.status === 'cancelled').length,
      checkedIn: registrations.filter(r => r.checked_in).length,
    };

    const response = {
      registrations: filteredRegistrations,
      summary,
      ...(includeDetails && {
        totalAttendees: filteredRegistrations.reduce((sum, reg) => sum + reg.attendee_count, 0),
        paymentSummary: {
          totalRevenue: registrations
            .filter(r => r.payment_status === 'completed')
            .reduce((sum, r) => sum + (r.payment_amount || 0), 0),
          pendingPayments: registrations.filter(r => r.payment_status === 'pending').length,
          failedPayments: registrations.filter(r => r.payment_status === 'failed').length,
        }
      })
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event attendees' },
      { status: 500 }
    );
  }
}