import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { getTenantFromRequest, requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const createSequenceSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sequence_type: z.enum(['welcome', 'pre_visit', 'post_visit', 'missed_visit', 'prayer_followup', 'birthday', 'anniversary', 'member_care', 'donation_followup', 'volunteer_recruitment', 'event_promotion']),
  trigger_event: z.enum(['new_member', 'visit_scheduled', 'visit_completed', 'visit_missed', 'prayer_request_created', 'birthday', 'anniversary', 'donation_received', 'event_registration', 'manual_enrollment', 'chat_completed', 'form_submitted']),
  trigger_conditions: z.record(z.any()).optional(),
  start_delay_minutes: z.number().min(0).optional(),
  max_enrollments: z.number().min(1).optional(),
  enrollment_window_hours: z.number().min(1).optional(),
  priority: z.number().min(0).max(10).optional(),
  tags: z.array(z.string()).optional(),
  steps: z.array(z.object({
    step_order: z.number().min(1).optional(),
    step_type: z.enum(['email', 'sms', 'internal_task', 'webhook']),
    name: z.string().min(1).max(255),
    subject: z.string().max(255).optional(),
    content_template: z.string().min(1),
    delay_after_previous: z.number().min(0),
    send_conditions: z.record(z.any()).optional(),
    is_active: z.boolean().optional()
  }))
})

const sequenceFiltersSchema = z.object({
  sequence_type: z.string().optional(),
  trigger_event: z.string().optional(),
  is_active: z.boolean().optional(),
  created_by: z.string().optional(),
  tags: z.array(z.string()).optional()
})

// GET /api/sequences - Get all sequences for tenant
export async function GET(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const url = new URL(request.url)
    
    // Parse query parameters
    const filters = {
      sequence_type: url.searchParams.get('sequence_type') || undefined,
      trigger_event: url.searchParams.get('trigger_event') || undefined,
      is_active: url.searchParams.get('is_active') === 'true' ? true : 
                 url.searchParams.get('is_active') === 'false' ? false : undefined,
      created_by: url.searchParams.get('created_by') || undefined,
      tags: url.searchParams.get('tags')?.split(',') || undefined
    }

    const sequences = await sequenceService.getSequences(tenantSchema, filters)

    return NextResponse.json({
      success: true,
      data: sequences
    })
  } catch (error) {
    console.error('GET /api/sequences error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get sequences' 
      },
      { status: 500 }
    )
  }
}

// POST /api/sequences - Create new sequence
export async function POST(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = createSequenceSchema.parse(body)
    
    const sequence = await sequenceService.createSequence(
      tenantSchema,
      user.id,
      validatedData
    )

    return NextResponse.json({
      success: true,
      data: sequence
    }, { status: 201 })
  } catch (error) {
    console.error('POST /api/sequences error:', error)
    
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

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create sequence' 
      },
      { status: 500 }
    )
  }
}