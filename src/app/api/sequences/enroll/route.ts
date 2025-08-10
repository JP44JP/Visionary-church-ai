import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const enrollUserSchema = z.object({
  sequence_id: z.string().uuid(),
  member_id: z.string().uuid().optional(),
  visitor_id: z.string().uuid().optional(),
  prayer_request_id: z.string().uuid().optional(),
  trigger_event: z.string().min(1),
  enrollment_data: z.record(z.any()).optional(),
  priority_boost: z.number().min(0).max(10).optional()
}).refine(
  data => data.member_id || data.visitor_id || data.prayer_request_id,
  {
    message: "At least one of member_id, visitor_id, or prayer_request_id is required",
    path: ["member_id"]
  }
)

const bulkEnrollSchema = z.object({
  sequence_id: z.string().uuid(),
  enrollments: z.array(z.object({
    member_id: z.string().uuid().optional(),
    visitor_id: z.string().uuid().optional(),
    prayer_request_id: z.string().uuid().optional(),
    trigger_event: z.string().min(1),
    enrollment_data: z.record(z.any()).optional(),
    priority_boost: z.number().min(0).max(10).optional()
  }).refine(
    data => data.member_id || data.visitor_id || data.prayer_request_id,
    {
      message: "At least one of member_id, visitor_id, or prayer_request_id is required"
    }
  )).min(1).max(1000) // Limit bulk enrollments
})

// POST /api/sequences/enroll - Enroll user in sequence
export async function POST(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const body = await request.json()

    // Check if it's a bulk enrollment request
    if (body.enrollments && Array.isArray(body.enrollments)) {
      const validatedData = bulkEnrollSchema.parse(body)
      
      const result = await sequenceService.bulkEnroll(tenantSchema, validatedData)
      
      return NextResponse.json({
        success: true,
        data: result
      }, { status: 201 })
    } else {
      // Single enrollment
      const validatedData = enrollUserSchema.parse(body)
      
      const enrollment = await sequenceService.enrollUser(tenantSchema, validatedData)
      
      return NextResponse.json({
        success: true,
        data: {
          enrollment_id: enrollment.id,
          enrollment,
          next_send_at: enrollment.next_send_at
        }
      }, { status: 201 })
    }
  } catch (error) {
    console.error('POST /api/sequences/enroll error:', error)
    
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

    // Handle specific enrollment errors
    if (error instanceof Error) {
      if (error.message.includes('already enrolled')) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message 
          },
          { status: 409 } // Conflict
        )
      }
      
      if (error.message.includes('unsubscribed')) {
        return NextResponse.json(
          { 
            success: false, 
            error: error.message 
          },
          { status: 403 } // Forbidden
        )
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to enroll user' 
      },
      { status: 500 }
    )
  }
}

// GET /api/sequences/enroll - Get enrollments (with filters)
export async function GET(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const url = new URL(request.url)
    
    const filters = {
      sequence_id: url.searchParams.get('sequence_id') || undefined,
      member_id: url.searchParams.get('member_id') || undefined,
      status: url.searchParams.get('status') as any || undefined,
      enrolled_after: url.searchParams.get('enrolled_after') || undefined,
      enrolled_before: url.searchParams.get('enrolled_before') || undefined
    }

    const enrollments = await sequenceService.getEnrollments(tenantSchema, filters)

    return NextResponse.json({
      success: true,
      data: enrollments,
      count: enrollments.length
    })
  } catch (error) {
    console.error('GET /api/sequences/enroll error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get enrollments' 
      },
      { status: 500 }
    )
  }
}