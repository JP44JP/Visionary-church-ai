import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const updateSequenceSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sequence_type: z.enum(['welcome', 'pre_visit', 'post_visit', 'missed_visit', 'prayer_followup', 'birthday', 'anniversary', 'member_care', 'donation_followup', 'volunteer_recruitment', 'event_promotion']).optional(),
  trigger_event: z.enum(['new_member', 'visit_scheduled', 'visit_completed', 'visit_missed', 'prayer_request_created', 'birthday', 'anniversary', 'donation_received', 'event_registration', 'manual_enrollment', 'chat_completed', 'form_submitted']).optional(),
  trigger_conditions: z.record(z.any()).optional(),
  is_active: z.boolean().optional(),
  start_delay_minutes: z.number().min(0).optional(),
  max_enrollments: z.number().min(1).optional(),
  enrollment_window_hours: z.number().min(1).optional(),
  priority: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).optional()
})

// GET /api/sequences/[id] - Get specific sequence
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const sequenceId = params.id

    const sequence = await sequenceService.getSequenceById(tenantSchema, sequenceId)

    return NextResponse.json({
      success: true,
      data: sequence
    })
  } catch (error) {
    console.error(`GET /api/sequences/${params.id} error:`, error)
    
    const status = error instanceof Error && error.message === 'Sequence not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get sequence' 
      },
      { status }
    )
  }
}

// PUT /api/sequences/[id] - Update sequence
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const sequenceId = params.id
    const body = await request.json()
    
    const validatedData = updateSequenceSchema.parse(body)
    
    const sequence = await sequenceService.updateSequence(
      tenantSchema,
      sequenceId,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: sequence
    })
  } catch (error) {
    console.error(`PUT /api/sequences/${params.id} error:`, error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    const status = error instanceof Error && error.message === 'Sequence not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update sequence' 
      },
      { status }
    )
  }
}

// DELETE /api/sequences/[id] - Delete sequence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const sequenceId = params.id

    await sequenceService.deleteSequence(tenantSchema, sequenceId)

    return NextResponse.json({
      success: true,
      message: 'Sequence deleted successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/sequences/${params.id} error:`, error)
    
    const status = error instanceof Error && error.message === 'Sequence not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete sequence' 
      },
      { status }
    )
  }
}