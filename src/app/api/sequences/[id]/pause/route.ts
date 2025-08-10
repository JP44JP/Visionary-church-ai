import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'

const sequenceService = new SequenceService()

const pauseResumeSchema = z.object({
  enrollment_id: z.string().uuid(),
  reason: z.string().max(255).optional()
})

// PUT /api/sequences/[id]/pause - Pause enrollment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const body = await request.json()
    
    const validatedData = pauseResumeSchema.parse(body)
    
    const enrollment = await sequenceService.pauseEnrollment(
      tenantSchema,
      validatedData.enrollment_id,
      validatedData.reason
    )

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrollment paused successfully'
    })
  } catch (error) {
    console.error(`PUT /api/sequences/${params.id}/pause error:`, error)
    
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

    const status = error instanceof Error && error.message === 'Enrollment not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to pause enrollment' 
      },
      { status }
    )
  }
}

// DELETE /api/sequences/[id]/pause - Resume enrollment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    const body = await request.json()
    
    const { enrollment_id } = z.object({
      enrollment_id: z.string().uuid()
    }).parse(body)
    
    const enrollment = await sequenceService.resumeEnrollment(
      tenantSchema,
      enrollment_id
    )

    return NextResponse.json({
      success: true,
      data: enrollment,
      message: 'Enrollment resumed successfully'
    })
  } catch (error) {
    console.error(`DELETE /api/sequences/${params.id}/pause error:`, error)
    
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

    const status = error instanceof Error && error.message === 'Enrollment not found' ? 404 : 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to resume enrollment' 
      },
      { status }
    )
  }
}