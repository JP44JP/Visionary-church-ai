import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prayerService } from '../../../../../services/prayerService'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const analyticsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  team_id: z.string().uuid().optional(),
  category: z.string().optional(),
  urgency: z.string().optional()
})

export async function GET(request: NextRequest) {
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

    // Verify user has admin permissions
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

    const hasAdminAccess = ['church_admin', 'prayer_team_leader', 'super_admin'].includes(userData.role)
    if (!hasAdminAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Parse and validate query parameters
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams.entries())
    
    // Set default date range if not provided
    const defaultTo = new Date().toISOString()
    const defaultFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    
    const validatedQuery = analyticsQuerySchema.parse({
      from: queryParams.from || defaultFrom,
      to: queryParams.to || defaultTo,
      team_id: queryParams.team_id,
      category: queryParams.category,
      urgency: queryParams.urgency
    })

    // Get prayer analytics
    const result = await prayerService.getPrayerAnalytics(
      userData.church_id,
      {
        from: validatedQuery.from,
        to: validatedQuery.to
      }
    )

    if (!result.success) {
      return NextResponse.json(result, { status: 500 })
    }

    // Apply additional filters if specified
    let filteredData = result.data!
    
    if (validatedQuery.category) {
      filteredData = {
        ...filteredData,
        category_distribution: filteredData.category_distribution.filter(
          item => item.category === validatedQuery.category
        )
      }
    }

    if (validatedQuery.urgency) {
      filteredData = {
        ...filteredData,
        urgency_distribution: filteredData.urgency_distribution.filter(
          item => item.urgency === validatedQuery.urgency
        )
      }
    }

    if (validatedQuery.team_id) {
      filteredData = {
        ...filteredData,
        team_performance: filteredData.team_performance.filter(
          item => item.team_id === validatedQuery.team_id
        )
      }
    }

    return NextResponse.json({
      success: true,
      data: filteredData,
      metadata: {
        date_range: {
          from: validatedQuery.from,
          to: validatedQuery.to
        },
        filters: {
          team_id: validatedQuery.team_id,
          category: validatedQuery.category,
          urgency: validatedQuery.urgency
        }
      }
    })

  } catch (error) {
    console.error('Error fetching prayer analytics:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid query parameters',
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

// Create custom analytics report
export async function POST(request: NextRequest) {
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

    // Verify user has admin permissions
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

    const hasAdminAccess = ['church_admin', 'prayer_team_leader', 'super_admin'].includes(userData.role)
    if (!hasAdminAccess) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    const reportSchema = z.object({
      name: z.string().min(1).max(100),
      description: z.string().max(500).optional(),
      date_range: z.object({
        from: z.string().datetime(),
        to: z.string().datetime()
      }),
      filters: z.object({
        categories: z.array(z.string()).optional(),
        urgencies: z.array(z.string()).optional(),
        teams: z.array(z.string().uuid()).optional(),
        statuses: z.array(z.string()).optional()
      }).optional(),
      metrics: z.array(z.enum([
        'total_requests',
        'response_times',
        'category_breakdown',
        'team_performance',
        'satisfaction_scores',
        'completion_rates'
      ])),
      format: z.enum(['json', 'csv', 'pdf']).default('json')
    })

    const validatedData = reportSchema.parse(body)

    // Generate custom analytics based on the report configuration
    const baseAnalytics = await prayerService.getPrayerAnalytics(
      userData.church_id,
      validatedData.date_range
    )

    if (!baseAnalytics.success) {
      return NextResponse.json(baseAnalytics, { status: 500 })
    }

    // Filter and format the analytics based on the report requirements
    const customReport = {
      name: validatedData.name,
      description: validatedData.description,
      generated_at: new Date().toISOString(),
      generated_by: user.id,
      church_id: userData.church_id,
      date_range: validatedData.date_range,
      filters: validatedData.filters,
      metrics: {},
      format: validatedData.format
    }

    // Include requested metrics
    if (validatedData.metrics.includes('total_requests')) {
      customReport.metrics.total_requests = baseAnalytics.data!.total_requests
    }

    if (validatedData.metrics.includes('response_times')) {
      customReport.metrics.avg_response_time = baseAnalytics.data!.avg_response_time
    }

    if (validatedData.metrics.includes('category_breakdown')) {
      customReport.metrics.category_distribution = baseAnalytics.data!.category_distribution
    }

    if (validatedData.metrics.includes('team_performance')) {
      customReport.metrics.team_performance = baseAnalytics.data!.team_performance
    }

    if (validatedData.metrics.includes('satisfaction_scores')) {
      customReport.metrics.satisfaction_ratings = baseAnalytics.data!.satisfaction_ratings
    }

    if (validatedData.metrics.includes('completion_rates')) {
      customReport.metrics.completion_rate = (
        baseAnalytics.data!.completed_requests / baseAnalytics.data!.total_requests
      ) * 100
    }

    // Store the report for future reference
    const { data: reportRecord, error: saveError } = await supabase
      .from('prayer_analytics_reports')
      .insert({
        church_id: userData.church_id,
        name: validatedData.name,
        description: validatedData.description,
        configuration: validatedData,
        generated_by: user.id,
        report_data: customReport
      })
      .select()
      .single()

    if (saveError) {
      console.error('Failed to save report:', saveError)
      // Continue anyway, just don't save the report
    }

    return NextResponse.json({
      success: true,
      data: customReport,
      report_id: reportRecord?.id
    })

  } catch (error) {
    console.error('Error generating custom analytics report:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid report configuration',
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