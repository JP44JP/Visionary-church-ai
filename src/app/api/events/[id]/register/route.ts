import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';
import { EventRegistrationRequest } from '../../../../../types/events';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const registerSchema = z.object({
  registrationType: z.enum(['individual', 'group', 'family']),
  attendeeCount: z.number().positive().default(1),
  userDetails: z.object({
    userId: z.string().uuid(),
  }).optional(),
  visitorDetails: z.object({
    fullName: z.string().min(1).max(255),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }).optional(),
  guestDetails: z.array(z.object({
    name: z.string().min(1).max(255),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    ageGroup: z.string().optional(),
  })).optional(),
  customFields: z.record(z.any()).optional(),
  paymentInfo: z.object({
    amount: z.number().min(0),
    method: z.enum(['credit_card', 'bank_transfer', 'cash', 'waived']),
    reference: z.string().optional(),
  }).optional(),
});

// POST /api/events/[id]/register - Register for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Validate that either userDetails or visitorDetails is provided
    if (!validatedData.userDetails && !validatedData.visitorDetails) {
      return NextResponse.json(
        { error: 'Either user details or visitor details must be provided' },
        { status: 400 }
      );
    }

    const registrationData: EventRegistrationRequest = {
      eventId: params.id,
      registrationType: validatedData.registrationType,
      attendeeCount: validatedData.attendeeCount,
      userDetails: validatedData.userDetails,
      visitorDetails: validatedData.visitorDetails,
      guestDetails: validatedData.guestDetails,
      customFields: validatedData.customFields,
      paymentInfo: validatedData.paymentInfo,
    };

    const registration = await eventService.registerForEvent(registrationData);

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error('Error registering for event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('deadline')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register for event' },
      { status: 500 }
    );
  }
}