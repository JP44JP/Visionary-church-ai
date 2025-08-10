import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prayerService } from '../../../../../services/prayerService'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const queryParamsSchema = z.object({
  status: z.array(z.string()).optional(),
  category: z.array(z.string()).optional(),
  urgency: z.array(z.string()).optional(),
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(100).optional().default(20)
})

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

    // Verify user is a team member
    const { data: teamMember } = await supabase
      .from('prayer_team_members')
      .select(`
        *,
        team:prayer_teams(church_id)
      `)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const searchParams = Object.fromEntries(url.searchParams.entries())
    
    // Handle array parameters
    const filters = {
      status: url.searchParams.getAll('status'),
      category: url.searchParams.getAll('category'),
      urgency: url.searchParams.getAll('urgency'),
      assigned_to: params.id
    }

    const pagination = {
      page: parseInt(searchParams.page) || 1,
      limit: parseInt(searchParams.limit) || 20
    }

    // Get assigned prayer requests
    const result = await prayerService.getPrayerRequests(
      teamMember.team.church_id,
      filters,
      pagination
    )

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error in team prayer requests endpoint:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update team member availability or settings
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
    
    const updateSchema = z.object({
      availability: z.object({
        schedule: z.record(z.object({
          available: z.boolean(),
          start_time: z.string().optional(),
          end_time: z.string().optional()
        })),
        timezone: z.string(),
        on_call_available: z.boolean(),
        max_emergency_requests: z.number()
      }).optional(),
      specialties: z.array(z.string()).optional(),
      max_capacity: z.number().min(1).max(20).optional(),
      is_active: z.boolean().optional()
    })

    const validatedData = updateSchema.parse(body)

    // Verify user can update this team member
    const { data: teamMember } = await supabase
      .from('prayer_team_members')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (!teamMember) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Update team member
    const { data, error } = await supabase
      .from('prayer_team_members')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select(`
        *,
        user:users(*)
      `)
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Failed to update team member' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Team member updated successfully'
    })

  } catch (error) {
    console.error('Error updating team member:', error)
    
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