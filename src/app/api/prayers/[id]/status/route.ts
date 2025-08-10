import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prayerService } from '../../../../../services/prayerService'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const updateStatusSchema = z.object({
  status: z.enum([
    'submitted', 'assigned', 'in_progress', 'praying', 
    'follow_up_needed', 'answered', 'ongoing', 'closed', 'archived'
  ] as const).optional(),
  follow_up_notes: z.string().max(1000).optional(),
  next_follow_up: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
  additional_needs: z.string().max(500).optional()
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateStatusSchema.parse(body)

    // Get user's church
    const { data: userData } = await supabase
      .from('users')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (!userData?.church_id) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a church' },
        { status: 403 }
      )
    }

    // Update the prayer request status
    const result = await prayerService.updatePrayerRequestStatus(
      params.id,
      userData.church_id,
      user.id,
      validatedData
    )

    if (!result.success) {
      return NextResponse.json(result, { 
        status: result.error?.includes('Access denied') ? 403 : 500 
      })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating prayer request status:', error)
    
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
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get prayer request details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's church
    const { data: userData } = await supabase
      .from('users')
      .select('church_id')
      .eq('id', user.id)
      .single()

    if (!userData?.church_id) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a church' },
        { status: 403 }
      )
    }

    // Get the prayer request
    const result = await prayerService.getPrayerRequestById(
      params.id,
      userData.church_id,
      user.id
    )

    if (!result.success) {
      return NextResponse.json(result, { 
        status: result.error?.includes('Access denied') ? 403 : 
               result.error?.includes('not found') ? 404 : 500 
      })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching prayer request:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}