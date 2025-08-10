import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { requireAuth, requireRole } from '@/lib/auth'
import { z } from 'zod'

const sequenceService = new SequenceService()

const processRequestSchema = z.object({
  batch_size: z.number().min(1).max(1000).optional(),
  sequence_types: z.array(z.string()).optional(),
  priority_only: z.boolean().optional()
})

// POST /api/sequences/process - Process pending sequences (manual trigger)
export async function POST(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    
    // Require staff role or higher
    await requireRole(user, ['staff', 'admin', 'church_admin', 'pastor'])
    
    const body = await request.json().catch(() => ({}))
    const validatedData = processRequestSchema.parse(body)
    
    const result = await sequenceService.processSequences(
      tenantSchema,
      validatedData.batch_size || 100
    )

    return NextResponse.json({
      success: true,
      data: result,
      message: `Processed ${result.processed_count} messages, ${result.failed_count} failures`
    })
  } catch (error) {
    console.error('POST /api/sequences/process error:', error)
    
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

    // Handle authorization errors
    if (error instanceof Error && error.message.includes('permission')) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Insufficient permissions' 
        },
        { status: 403 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to process sequences' 
      },
      { status: 500 }
    )
  }
}

// GET /api/sequences/process - Get processing status
export async function GET(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    
    // Get pending message count and next processing time
    const supabase = await import('@/lib/supabase').then(m => m.createServerSupabaseClient())
    
    const { count: pendingCount } = await supabase
      .from(`${tenantSchema}.sequence_messages`)
      .select('id', { count: 'exact' })
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())

    const { count: activeEnrollments } = await supabase
      .from(`${tenantSchema}.sequence_enrollments`)
      .select('id', { count: 'exact' })
      .eq('status', 'active')

    const { data: nextMessages } = await supabase
      .from(`${tenantSchema}.sequence_messages`)
      .select('scheduled_for')
      .eq('status', 'pending')
      .gt('scheduled_for', new Date().toISOString())
      .order('scheduled_for', { ascending: true })
      .limit(1)

    return NextResponse.json({
      success: true,
      data: {
        pending_messages: pendingCount || 0,
        active_enrollments: activeEnrollments || 0,
        next_scheduled_message: nextMessages?.[0]?.scheduled_for || null,
        last_processed: new Date().toISOString() // This would come from a processing log
      }
    })
  } catch (error) {
    console.error('GET /api/sequences/process error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get processing status' 
      },
      { status: 500 }
    )
  }
}