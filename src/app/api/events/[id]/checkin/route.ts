import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const checkInSchema = z.object({
  registrationId: z.string().uuid(),
  method: z.enum(['qr_code', 'manual', 'mobile_app', 'kiosk']).default('manual'),
  notes: z.string().optional(),
});

const qrCheckInSchema = z.object({
  qrToken: z.string(),
  method: z.enum(['qr_code', 'mobile_app']).default('qr_code'),
});

// PUT /api/events/[id]/checkin - Check in an attendee
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

    // Check if it's a QR code check-in or manual check-in
    if ('qrToken' in body) {
      const validatedData = qrCheckInSchema.parse(body);
      
      // TODO: Validate QR token and extract registration ID
      // This would involve decoding the QR token and validating it
      // For now, we'll return an error indicating this needs implementation
      return NextResponse.json(
        { error: 'QR code check-in not implemented yet' },
        { status: 501 }
      );
    } else {
      const validatedData = checkInSchema.parse(body);
      
      const result = await eventService.checkInAttendee(
        params.id,
        validatedData.registrationId,
        validatedData.method
      );

      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('Error checking in attendee:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to check in attendee' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/checkin/qr - Generate QR code for check-in
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const registrationId = searchParams.get('registrationId');

    if (!registrationId) {
      return NextResponse.json({ error: 'Registration ID required' }, { status: 400 });
    }

    const qrData = await eventService.generateQRCode(params.id, registrationId);

    // In a real implementation, you would generate the actual QR code image
    // and return the image URL along with the data
    return NextResponse.json({
      qrData,
      qrCodeUrl: `/api/qr/generate?data=${encodeURIComponent(JSON.stringify(qrData))}`,
      message: 'QR code generated successfully'
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}