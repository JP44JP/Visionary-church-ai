import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prayerService } from '../../../../../services/prayerService'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const addResponseSchema = z.object({
  response_type: z.enum(['prayer', 'encouragement', 'scripture', 'resource', 'follow_up'] as const),
  content: z.string().min(1).max(2000),
  is_public: z.boolean(),
  scripture_references: z.array(z.string()).optional(),
  resources: z.array(z.object({
    title: z.string(),
    url: z.string().url().optional(),
    description: z.string().optional()
  })).optional()
})

export async function POST(
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
    const validatedData = addResponseSchema.parse(body)

    // Verify user is a team member assigned to this request
    const { data: assignment } = await supabase
      .from('prayer_assignments')
      .select(`
        *,
        team_member:prayer_team_members(user_id)
      `)
      .eq('prayer_request_id', params.id)
      .eq('team_member.user_id', user.id)
      .single()

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Access denied - not assigned to this request' },
        { status: 403 }
      )
    }

    // Add the prayer response
    const result = await prayerService.addPrayerResponse(
      params.id,
      assignment.team_member_id,
      validatedData
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    return NextResponse.json(result, { status: 201 })

  } catch (error) {
    console.error('Error adding prayer response:', error)
    
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

// Get responses for a prayer request
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

    // Check if user has access to this prayer request
    const { data: userData } = await supabase
      .from('users')
      .select('church_id, role')
      .eq('id', user.id)
      .single()

    if (!userData?.church_id) {
      return NextResponse.json(
        { success: false, error: 'User not associated with a church' },
        { status: 403 }
      )
    }

    // Verify access to prayer request
    const hasAccess = await supabase
      .from('prayer_assignments')
      .select('id')
      .eq('prayer_request_id', params.id)
      .eq('team_member.user_id', user.id)
      .single()

    const isLeadership = ['church_admin', 'prayer_team_leader', 'super_admin'].includes(userData.role)

    if (!hasAccess.data && !isLeadership) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get prayer responses
    const { data: responses, error } = await supabase
      .from('prayer_responses')
      .select('*')
      .eq('prayer_request_id', params.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch responses' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: responses || []
    })

  } catch (error) {
    console.error('Error fetching prayer responses:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}