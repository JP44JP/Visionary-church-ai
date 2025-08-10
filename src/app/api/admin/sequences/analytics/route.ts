import { NextRequest, NextResponse } from 'next/server'
import { SequenceService } from '@/services/sequenceService'
import { requireAuth, requireRole } from '@/lib/auth'

const sequenceService = new SequenceService()

// GET /api/admin/sequences/analytics - Get sequence analytics and performance data
export async function GET(request: NextRequest) {
  try {
    const { user, tenantSchema } = await requireAuth(request)
    
    // Require admin or church_admin role
    await requireRole(user, ['admin', 'church_admin'])
    
    const url = new URL(request.url)
    const sequenceId = url.searchParams.get('sequence_id')
    const startDate = url.searchParams.get('start_date')
    const endDate = url.searchParams.get('end_date')

    if (sequenceId) {
      // Get analytics for specific sequence
      const analytics = await sequenceService.getSequenceAnalytics(
        tenantSchema,
        sequenceId,
        { start_date: startDate || undefined, end_date: endDate || undefined }
      )

      const performanceMetrics = await sequenceService.getSequencePerformanceMetrics(
        tenantSchema,
        sequenceId
      )

      return NextResponse.json({
        success: true,
        data: {
          analytics,
          performance: performanceMetrics,
          period: {
            start_date: startDate,
            end_date: endDate
          }
        }
      })
    } else {
      // Get dashboard summary
      const dashboardSummary = await sequenceService.getDashboardSummary(tenantSchema)

      return NextResponse.json({
        success: true,
        data: dashboardSummary
      })
    }
  } catch (error) {
    console.error('GET /api/admin/sequences/analytics error:', error)
    
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
        error: error instanceof Error ? error.message : 'Failed to get analytics' 
      },
      { status: 500 }
    )
  }
}