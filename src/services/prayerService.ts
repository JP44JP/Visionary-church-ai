import { createClient } from '@supabase/supabase-js'
import { 
  PrayerRequest, 
  PrayerTeam, 
  PrayerTeamMember, 
  PrayerAssignment,
  PrayerResponse,
  PrayerCommunication,
  PrayerAnalytics,
  PrayerRequestForm,
  PrayerResponseForm,
  PrayerUpdateForm,
  PrayerCategory,
  PrayerUrgency,
  PrayerStatus,
  PrayerPrivacyLevel,
  ApiResponse,
  PaginatedResponse
} from '../types'
import { AppError } from '../utils/errors'
import { NotificationService } from './notificationService'
import { EmailService } from './emailService'

export class PrayerService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  private notificationService = new NotificationService()
  private emailService = new EmailService()

  // Prayer Request Management
  async submitPrayerRequest(
    churchId: string,
    requestData: PrayerRequestForm,
    metadata: any = {}
  ): Promise<ApiResponse<PrayerRequest>> {
    try {
      // Validate and sanitize input
      const sanitizedData = await this.sanitizePrayerRequest(requestData)
      
      // Check for sensitive information
      const hasSensitiveInfo = await this.detectSensitiveInformation(sanitizedData.description)
      
      // Create the prayer request
      const prayerRequest = {
        church_id: churchId,
        requester_name: sanitizedData.is_anonymous ? null : sanitizedData.requester_name,
        requester_email: sanitizedData.is_anonymous ? null : sanitizedData.requester_email,
        requester_phone: sanitizedData.is_anonymous ? null : sanitizedData.requester_phone,
        title: sanitizedData.title,
        description: sanitizedData.description,
        category: sanitizedData.category,
        urgency: sanitizedData.urgency,
        privacy_level: sanitizedData.privacy_level,
        is_anonymous: sanitizedData.is_anonymous,
        allow_updates: sanitizedData.allow_updates,
        status: 'submitted' as PrayerStatus,
        tags: [],
        metadata: {
          ...metadata,
          has_sensitive_info: hasSensitiveInfo,
          source: metadata.source || 'web_form'
        },
        assigned_team_members: []
      }

      const { data, error } = await this.supabase
        .from('prayer_requests')
        .insert(prayerRequest)
        .select()
        .single()

      if (error) throw new AppError('Failed to submit prayer request', 'SUBMISSION_FAILED', 500)

      // Auto-assign if enabled
      if (requestData.urgency === 'emergency') {
        await this.handleEmergencyRequest(data.id, churchId)
      } else {
        await this.autoAssignRequest(data.id, churchId)
      }

      // Send confirmation to requester if not anonymous
      if (!requestData.is_anonymous && requestData.requester_email) {
        await this.sendSubmissionConfirmation(data, requestData.requester_email)
      }

      return {
        success: true,
        data,
        message: 'Prayer request submitted successfully'
      }
    } catch (error) {
      console.error('Error submitting prayer request:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to submit prayer request'
      }
    }
  }

  async getPrayerRequests(
    churchId: string,
    filters: {
      status?: PrayerStatus[]
      category?: PrayerCategory[]
      urgency?: PrayerUrgency[]
      privacy_level?: PrayerPrivacyLevel[]
      assigned_to?: string
      date_range?: { from: string; to: string }
    } = {},
    pagination: { page: number; limit: number } = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<PrayerRequest>> {
    try {
      let query = this.supabase
        .from('prayer_requests')
        .select('*', { count: 'exact' })
        .eq('church_id', churchId)
        .is('archived_at', null)

      // Apply filters
      if (filters.status?.length) {
        query = query.in('status', filters.status)
      }
      if (filters.category?.length) {
        query = query.in('category', filters.category)
      }
      if (filters.urgency?.length) {
        query = query.in('urgency', filters.urgency)
      }
      if (filters.privacy_level?.length) {
        query = query.in('privacy_level', filters.privacy_level)
      }
      if (filters.assigned_to) {
        query = query.contains('assigned_team_members', [filters.assigned_to])
      }
      if (filters.date_range) {
        query = query
          .gte('created_at', filters.date_range.from)
          .lte('created_at', filters.date_range.to)
      }

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit
      query = query
        .range(offset, offset + pagination.limit - 1)
        .order('urgency', { ascending: false })
        .order('created_at', { ascending: false })

      const { data, error, count } = await query

      if (error) throw new AppError('Failed to fetch prayer requests', 'FETCH_FAILED', 500)

      return {
        success: true,
        data: data || [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / pagination.limit)
        }
      }
    } catch (error) {
      console.error('Error fetching prayer requests:', error)
      return {
        success: false,
        data: [],
        error: error instanceof AppError ? error.message : 'Failed to fetch prayer requests',
        pagination: { page: 1, limit: 20, total: 0, pages: 0 }
      }
    }
  }

  async getPrayerRequestById(
    requestId: string,
    churchId: string,
    userId?: string
  ): Promise<ApiResponse<PrayerRequest & { responses: PrayerResponse[]; communications: PrayerCommunication[] }>> {
    try {
      // Check permissions first
      if (userId) {
        const hasAccess = await this.checkRequestAccess(requestId, churchId, userId)
        if (!hasAccess) {
          throw new AppError('Access denied to this prayer request', 'ACCESS_DENIED', 403)
        }
      }

      const { data: request, error: requestError } = await this.supabase
        .from('prayer_requests')
        .select(`
          *,
          responses:prayer_responses(*),
          communications:prayer_communications(*)
        `)
        .eq('id', requestId)
        .eq('church_id', churchId)
        .single()

      if (requestError) throw new AppError('Prayer request not found', 'NOT_FOUND', 404)

      return {
        success: true,
        data: request
      }
    } catch (error) {
      console.error('Error fetching prayer request:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to fetch prayer request'
      }
    }
  }

  async updatePrayerRequestStatus(
    requestId: string,
    churchId: string,
    userId: string,
    updateData: PrayerUpdateForm
  ): Promise<ApiResponse<PrayerRequest>> {
    try {
      // Verify permissions
      const hasAccess = await this.checkRequestAccess(requestId, churchId, userId)
      if (!hasAccess) {
        throw new AppError('Access denied to update this prayer request', 'ACCESS_DENIED', 403)
      }

      const updates: any = {
        updated_at: new Date().toISOString()
      }

      if (updateData.status) updates.status = updateData.status
      if (updateData.tags) updates.tags = updateData.tags

      const { data, error } = await this.supabase
        .from('prayer_requests')
        .update(updates)
        .eq('id', requestId)
        .eq('church_id', churchId)
        .select()
        .single()

      if (error) throw new AppError('Failed to update prayer request', 'UPDATE_FAILED', 500)

      // Log the update
      await this.logCommunication(requestId, userId, 'status_update', {
        subject: 'Status Updated',
        content: `Prayer request status updated to: ${updateData.status}`
      })

      // Send notification to requester if appropriate
      if (data.requester_email && data.allow_updates && !data.is_anonymous) {
        await this.sendStatusUpdateNotification(data, updateData.status!)
      }

      return {
        success: true,
        data,
        message: 'Prayer request updated successfully'
      }
    } catch (error) {
      console.error('Error updating prayer request:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to update prayer request'
      }
    }
  }

  // Prayer Team Management
  async createPrayerTeam(
    churchId: string,
    teamData: Omit<PrayerTeam, 'id' | 'current_load' | 'created_at' | 'updated_at' | 'members'>
  ): Promise<ApiResponse<PrayerTeam>> {
    try {
      const { data, error } = await this.supabase
        .from('prayer_teams')
        .insert({
          ...teamData,
          church_id: churchId,
          current_load: 0
        })
        .select()
        .single()

      if (error) throw new AppError('Failed to create prayer team', 'CREATION_FAILED', 500)

      return {
        success: true,
        data,
        message: 'Prayer team created successfully'
      }
    } catch (error) {
      console.error('Error creating prayer team:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to create prayer team'
      }
    }
  }

  async addTeamMember(
    teamId: string,
    memberData: Omit<PrayerTeamMember, 'id' | 'team_id' | 'joined_at' | 'user'>
  ): Promise<ApiResponse<PrayerTeamMember>> {
    try {
      const { data, error } = await this.supabase
        .from('prayer_team_members')
        .insert({
          ...memberData,
          team_id: teamId,
          current_load: 0
        })
        .select(`
          *,
          user:users(*)
        `)
        .single()

      if (error) throw new AppError('Failed to add team member', 'ADD_MEMBER_FAILED', 500)

      return {
        success: true,
        data,
        message: 'Team member added successfully'
      }
    } catch (error) {
      console.error('Error adding team member:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to add team member'
      }
    }
  }

  // Assignment Management
  async autoAssignRequest(requestId: string, churchId: string): Promise<void> {
    try {
      const { data: request } = await this.supabase
        .from('prayer_requests')
        .select('*')
        .eq('id', requestId)
        .single()

      if (!request) return

      // Get church prayer settings
      const settings = await this.getPrayerSettings(churchId)
      
      if (!settings.auto_assignment) return

      // Find appropriate team members
      const availableMembers = await this.findAvailableTeamMembers(
        churchId,
        request.category,
        request.urgency
      )

      if (availableMembers.length === 0) {
        // No available members, escalate to leadership
        await this.escalateToLeadership(requestId, churchId, 'no_available_members')
        return
      }

      // Select member based on algorithm
      const selectedMember = this.selectTeamMember(availableMembers, settings.assignment_algorithm)

      // Create assignment
      await this.createAssignment(requestId, selectedMember.id, 'system')

      // Update request status
      await this.supabase
        .from('prayer_requests')
        .update({
          status: 'assigned',
          assigned_team_members: [selectedMember.id]
        })
        .eq('id', requestId)

      // Notify assigned member
      await this.notifyTeamMemberAssignment(selectedMember, request)

    } catch (error) {
      console.error('Error auto-assigning request:', error)
      // If auto-assignment fails, escalate to leadership
      await this.escalateToLeadership(requestId, churchId, 'assignment_failed')
    }
  }

  async handleEmergencyRequest(requestId: string, churchId: string): Promise<void> {
    try {
      // Get emergency-capable team members
      const { data: emergencyMembers } = await this.supabase
        .from('prayer_team_members')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_active', true)
        .eq('emergency_contact', true)
        .contains('specialties', ['crisis', 'emergency'])

      // Notify all emergency contacts immediately
      const notifications = emergencyMembers?.map(member => 
        this.notificationService.sendEmergencyNotification(
          member.user.id,
          `Emergency prayer request received - ID: ${requestId}`,
          'emergency_prayer'
        )
      ) || []

      await Promise.all(notifications)

      // Also notify leadership
      await this.escalateToLeadership(requestId, churchId, 'emergency')

      // Mark as emergency assigned
      await this.supabase
        .from('prayer_requests')
        .update({
          status: 'assigned',
          assigned_team_members: emergencyMembers?.map(m => m.id) || []
        })
        .eq('id', requestId)

    } catch (error) {
      console.error('Error handling emergency request:', error)
      // Critical: Alert system administrators
      await this.notificationService.sendSystemAlert(
        'Emergency prayer request handling failed',
        { requestId, churchId, error: error.message }
      )
    }
  }

  // Response Management
  async addPrayerResponse(
    requestId: string,
    responderId: string,
    responseData: PrayerResponseForm
  ): Promise<ApiResponse<PrayerResponse>> {
    try {
      // Verify responder has access to this request
      const { data: assignment } = await this.supabase
        .from('prayer_assignments')
        .select('*')
        .eq('prayer_request_id', requestId)
        .eq('team_member_id', responderId)
        .single()

      if (!assignment) {
        throw new AppError('Access denied to respond to this prayer request', 'ACCESS_DENIED', 403)
      }

      const { data: responder } = await this.supabase
        .from('users')
        .select('full_name')
        .eq('id', responderId)
        .single()

      const response = {
        prayer_request_id: requestId,
        responder_id: responderId,
        responder_name: responder?.full_name || 'Prayer Team Member',
        response_type: responseData.response_type,
        content: responseData.content,
        is_public: responseData.is_public,
        scripture_references: responseData.scripture_references || [],
        resources: responseData.resources || []
      }

      const { data, error } = await this.supabase
        .from('prayer_responses')
        .insert(response)
        .select()
        .single()

      if (error) throw new AppError('Failed to add prayer response', 'RESPONSE_FAILED', 500)

      // Update request status
      await this.supabase
        .from('prayer_requests')
        .update({ status: 'in_progress' })
        .eq('id', requestId)

      // Log communication
      await this.logCommunication(requestId, responderId, responseData.response_type, {
        content: `Added ${responseData.response_type} response`
      })

      return {
        success: true,
        data,
        message: 'Prayer response added successfully'
      }
    } catch (error) {
      console.error('Error adding prayer response:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to add prayer response'
      }
    }
  }

  // Analytics and Reporting
  async getPrayerAnalytics(
    churchId: string,
    dateRange: { from: string; to: string }
  ): Promise<ApiResponse<PrayerAnalytics>> {
    try {
      // Get basic statistics
      const { data: requests } = await this.supabase
        .from('prayer_requests')
        .select('*')
        .eq('church_id', churchId)
        .gte('created_at', dateRange.from)
        .lte('created_at', dateRange.to)

      if (!requests) {
        throw new AppError('Failed to fetch prayer requests for analytics', 'ANALYTICS_FAILED', 500)
      }

      // Calculate metrics
      const totalRequests = requests.length
      const activeRequests = requests.filter(r => !['closed', 'archived'].includes(r.status)).length
      const completedRequests = requests.filter(r => r.status === 'answered' || r.status === 'closed').length

      // Category distribution
      const categoryCount = requests.reduce((acc, req) => {
        acc[req.category] = (acc[req.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
        category: category as PrayerCategory,
        count,
        percentage: (count / totalRequests) * 100
      }))

      // Response time analysis
      const responseTimes = await this.calculateResponseTimes(requests)
      const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length || 0

      // Team performance
      const teamPerformance = await this.getTeamPerformanceMetrics(churchId, dateRange)

      // Satisfaction ratings
      const satisfactionRatings = await this.getSatisfactionMetrics(churchId, dateRange)

      // Monthly trends
      const monthlyTrends = this.calculateMonthlyTrends(requests)

      const analytics: PrayerAnalytics = {
        total_requests: totalRequests,
        active_requests: activeRequests,
        completed_requests: completedRequests,
        avg_response_time: avgResponseTime,
        category_distribution: categoryDistribution,
        urgency_distribution: this.calculateUrgencyDistribution(requests),
        team_performance: teamPerformance,
        satisfaction_ratings: satisfactionRatings,
        monthly_trends: monthlyTrends
      }

      return {
        success: true,
        data: analytics
      }
    } catch (error) {
      console.error('Error generating prayer analytics:', error)
      return {
        success: false,
        error: error instanceof AppError ? error.message : 'Failed to generate analytics'
      }
    }
  }

  // Private Helper Methods
  private async sanitizePrayerRequest(data: PrayerRequestForm): Promise<PrayerRequestForm> {
    // Remove any potentially harmful content
    const sanitized = { ...data }
    
    // Sanitize text fields
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim().slice(0, 200)
    }
    if (sanitized.description) {
      sanitized.description = sanitized.description.trim().slice(0, 2000)
    }

    return sanitized
  }

  private async detectSensitiveInformation(content: string): Promise<boolean> {
    // Basic patterns for sensitive information
    const sensitivePatterns = [
      /\b\d{3}-\d{2}-\d{4}\b/, // SSN
      /\b\d{16}\b/, // Credit card
      /\b(?:suicide|self-harm|abuse|violence)\b/i // Crisis keywords
    ]

    return sensitivePatterns.some(pattern => pattern.test(content))
  }

  private async findAvailableTeamMembers(
    churchId: string,
    category: PrayerCategory,
    urgency: PrayerUrgency
  ): Promise<PrayerTeamMember[]> {
    const { data: members } = await this.supabase
      .from('prayer_team_members')
      .select(`
        *,
        user:users(*),
        team:prayer_teams(church_id)
      `)
      .eq('is_active', true)
      .eq('team.church_id', churchId)
      .lt('current_load', this.supabase.sql`max_capacity`)

    if (!members) return []

    // Filter by specialty and availability
    return members.filter(member => {
      const hasSpecialty = member.specialties.includes(category) || member.specialties.includes('general')
      const isAvailable = this.checkMemberAvailability(member, urgency)
      return hasSpecialty && isAvailable
    })
  }

  private checkMemberAvailability(member: PrayerTeamMember, urgency: PrayerUrgency): boolean {
    if (urgency === 'emergency') {
      return member.availability.on_call_available
    }

    const now = new Date()
    const day = now.toLocaleLowerCase().substring(0, 3) // mon, tue, etc.
    const schedule = member.availability.schedule[day]
    
    return schedule?.available || false
  }

  private selectTeamMember(
    members: PrayerTeamMember[],
    algorithm: string
  ): PrayerTeamMember {
    switch (algorithm) {
      case 'load_based':
        return members.reduce((min, member) => 
          member.current_load < min.current_load ? member : min
        )
      case 'specialty_based':
        // Prefer members with more specific specialties
        return members[0] // Simplified for now
      case 'availability_based':
        // Prefer members who are currently most available
        return members[0] // Simplified for now
      default: // round_robin
        return members[Math.floor(Math.random() * members.length)]
    }
  }

  private async createAssignment(
    requestId: string,
    memberId: string,
    assignedBy: string
  ): Promise<void> {
    await this.supabase
      .from('prayer_assignments')
      .insert({
        prayer_request_id: requestId,
        team_member_id: memberId,
        assigned_by: assignedBy,
        status: 'assigned',
        priority: 1
      })

    // Update member's current load
    await this.supabase
      .from('prayer_team_members')
      .update({
        current_load: this.supabase.sql`current_load + 1`
      })
      .eq('id', memberId)
  }

  private async escalateToLeadership(
    requestId: string,
    churchId: string,
    reason: string
  ): Promise<void> {
    // Get church leadership
    const { data: leaders } = await this.supabase
      .from('users')
      .select('*')
      .eq('church_id', churchId)
      .in('role', ['church_admin', 'prayer_team_leader'])

    // Send escalation notifications
    const notifications = leaders?.map(leader =>
      this.notificationService.sendNotification(
        leader.id,
        `Prayer request escalated - Reason: ${reason}`,
        `Prayer request ${requestId} requires leadership attention`,
        'escalation'
      )
    ) || []

    await Promise.all(notifications)
  }

  private async notifyTeamMemberAssignment(
    member: PrayerTeamMember,
    request: PrayerRequest
  ): Promise<void> {
    await this.notificationService.sendNotification(
      member.user_id,
      'New Prayer Request Assignment',
      `You have been assigned a new ${request.urgency} prayer request: ${request.title}`,
      'assignment'
    )

    if (member.email) {
      await this.emailService.sendEmail({
        to: member.email,
        subject: 'New Prayer Request Assignment',
        template: 'prayer_assignment',
        data: {
          memberName: member.user.full_name,
          requestTitle: request.title,
          urgency: request.urgency,
          category: request.category
        }
      })
    }
  }

  private async logCommunication(
    requestId: string,
    senderId: string,
    messageType: string,
    content: any
  ): Promise<void> {
    await this.supabase
      .from('prayer_communications')
      .insert({
        prayer_request_id: requestId,
        sender_id: senderId,
        sender_role: 'team_member',
        message_type: messageType,
        content: JSON.stringify(content),
        delivery_method: 'in_app'
      })
  }

  private async checkRequestAccess(
    requestId: string,
    churchId: string,
    userId: string
  ): Promise<boolean> {
    // Check if user is assigned to this request
    const { data: assignment } = await this.supabase
      .from('prayer_assignments')
      .select('*')
      .eq('prayer_request_id', requestId)
      .eq('team_member_id', userId)
      .single()

    if (assignment) return true

    // Check if user is leadership
    const { data: user } = await this.supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .eq('church_id', churchId)
      .single()

    return user && ['church_admin', 'prayer_team_leader', 'super_admin'].includes(user.role)
  }

  private async sendSubmissionConfirmation(
    request: PrayerRequest,
    email: string
  ): Promise<void> {
    await this.emailService.sendEmail({
      to: email,
      subject: 'Prayer Request Confirmation',
      template: 'prayer_confirmation',
      data: {
        requestTitle: request.title,
        requestId: request.id.slice(-8), // Show last 8 chars
        submissionDate: new Date(request.created_at).toLocaleDateString()
      }
    })
  }

  private async sendStatusUpdateNotification(
    request: PrayerRequest,
    newStatus: PrayerStatus
  ): Promise<void> {
    if (!request.requester_email) return

    await this.emailService.sendEmail({
      to: request.requester_email,
      subject: 'Prayer Request Update',
      template: 'prayer_status_update',
      data: {
        requestTitle: request.title,
        newStatus: newStatus.replace('_', ' '),
        updateDate: new Date().toLocaleDateString()
      }
    })
  }

  private async getPrayerSettings(churchId: string): Promise<any> {
    const { data } = await this.supabase
      .from('churches')
      .select('settings')
      .eq('id', churchId)
      .single()

    return data?.settings?.prayer || {
      auto_assignment: true,
      assignment_algorithm: 'load_based',
      max_requests_per_member: 5
    }
  }

  private async calculateResponseTimes(requests: PrayerRequest[]): Promise<number[]> {
    // Calculate response times for completed requests
    const responseTimes: number[] = []
    
    for (const request of requests) {
      if (request.status === 'answered' || request.status === 'closed') {
        const { data: firstResponse } = await this.supabase
          .from('prayer_responses')
          .select('created_at')
          .eq('prayer_request_id', request.id)
          .order('created_at')
          .limit(1)
          .single()

        if (firstResponse) {
          const submitTime = new Date(request.created_at).getTime()
          const responseTime = new Date(firstResponse.created_at).getTime()
          responseTimes.push((responseTime - submitTime) / (1000 * 60 * 60)) // Hours
        }
      }
    }

    return responseTimes
  }

  private calculateUrgencyDistribution(requests: PrayerRequest[]): any[] {
    const urgencyCount = requests.reduce((acc, req) => {
      acc[req.urgency] = (acc[req.urgency] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(urgencyCount).map(([urgency, count]) => ({
      urgency: urgency as PrayerUrgency,
      count,
      avg_response_time: 0 // Would calculate actual response times
    }))
  }

  private async getTeamPerformanceMetrics(churchId: string, dateRange: any): Promise<any[]> {
    // Get team performance data
    const { data: teams } = await this.supabase
      .from('prayer_teams')
      .select(`
        *,
        assignments:prayer_assignments(*)
      `)
      .eq('church_id', churchId)

    return teams?.map(team => ({
      team_id: team.id,
      team_name: team.name,
      requests_handled: team.assignments.length,
      avg_response_time: 0, // Would calculate from actual data
      satisfaction_score: 0 // Would calculate from feedback
    })) || []
  }

  private async getSatisfactionMetrics(churchId: string, dateRange: any): Promise<any> {
    // Get satisfaction ratings from feedback
    return {
      average: 0,
      total_responses: 0,
      distribution: []
    }
  }

  private calculateMonthlyTrends(requests: PrayerRequest[]): any[] {
    const monthlyData = requests.reduce((acc, req) => {
      const month = new Date(req.created_at).toISOString().slice(0, 7) // YYYY-MM
      if (!acc[month]) {
        acc[month] = { requests: 0, completed: 0 }
      }
      acc[month].requests++
      if (req.status === 'answered' || req.status === 'closed') {
        acc[month].completed++
      }
      return acc
    }, {} as Record<string, any>)

    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      requests: data.requests,
      completed: data.completed,
      avg_response_time: 0 // Would calculate from actual data
    }))
  }
}

export const prayerService = new PrayerService()