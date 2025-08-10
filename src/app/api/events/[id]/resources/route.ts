import { NextRequest, NextResponse } from 'next/server';
import { EventService } from '../../../../../services/eventService';
import { EventResourceInsert } from '../../../../../types/events';
import { z } from 'zod';

const eventService = new EventService(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const addResourceSchema = z.object({
  resourceType: z.enum(['facility', 'equipment', 'catering', 'supplies', 'transport', 'other']),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  quantityNeeded: z.number().positive().default(1),
  quantityConfirmed: z.number().min(0).default(0),
  vendorContact: z.string().optional(),
  cost: z.number().min(0).optional(),
  notes: z.string().optional(),
});

// GET /api/events/[id]/resources - Get event resources
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

    const resources = event.resources;

    // Group resources by type and status
    const summary = {
      total: resources.length,
      requested: resources.filter(r => r.booking_status === 'requested').length,
      confirmed: resources.filter(r => r.booking_status === 'confirmed').length,
      cancelled: resources.filter(r => r.booking_status === 'cancelled').length,
      pending: resources.filter(r => r.booking_status === 'pending').length,
      totalCost: resources
        .filter(r => r.cost)
        .reduce((sum, r) => sum + (r.cost || 0), 0),
    };

    // Group by resource type
    const typesSummary = resources.reduce((acc, resource) => {
      if (!acc[resource.resource_type]) {
        acc[resource.resource_type] = {
          type: resource.resource_type,
          total: 0,
          confirmed: 0,
          totalCost: 0,
        };
      }
      acc[resource.resource_type].total++;
      if (resource.booking_status === 'confirmed') {
        acc[resource.resource_type].confirmed++;
      }
      acc[resource.resource_type].totalCost += resource.cost || 0;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      resources,
      summary,
      types: Object.values(typesSummary),
    });
  } catch (error) {
    console.error('Error fetching event resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event resources' },
      { status: 500 }
    );
  }
}

// POST /api/events/[id]/resources - Add resource to event
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
    const validatedData = addResourceSchema.parse(body);

    const resourceData: Omit<EventResourceInsert, 'event_id'> = {
      resource_type: validatedData.resourceType,
      name: validatedData.name,
      description: validatedData.description,
      quantity_needed: validatedData.quantityNeeded,
      quantity_confirmed: validatedData.quantityConfirmed,
      booking_status: 'requested',
      vendor_contact: validatedData.vendorContact,
      cost: validatedData.cost,
      notes: validatedData.notes,
    };

    const resource = await eventService.addEventResource(params.id, resourceData);

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    console.error('Error adding resource:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add resource' },
      { status: 500 }
    );
  }
}