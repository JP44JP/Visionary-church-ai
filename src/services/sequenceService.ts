import { createServerSupabaseClient } from '@/lib/supabase'
import { 
  FollowUpSequence,
  SequenceStep,
  MessageTemplate,
  SequenceEnrollment,
  SequenceMessage,
  SequenceAnalytics,
  DeliveryProvider,
  CommunicationPreferences,
  EnrollUserRequest,
  CreateSequenceRequest,
  UpdateSequenceRequest,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateContext,
  SequenceFilters,
  EnrollmentFilters,
  MessageFilters,
  AnalyticsFilters,
  BulkEnrollRequest,
  SequencePerformanceMetrics,
  SequencesDashboardSummary
} from '@/types/sequences'
import { AppError } from '@/types/index'
import { EmailService } from './emailService'
import { SMSService } from './smsService'

export class SequenceService {
  private supabase = createServerSupabaseClient()
  private emailService = new EmailService()
  private smsService = new SMSService()

  // ============================================================================
  // SEQUENCE MANAGEMENT
  // ============================================================================

  async getSequences(tenantSchema: string, filters?: SequenceFilters): Promise<FollowUpSequence[]> {
    try {
      let query = this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .select(`
          *,
          steps:sequence_steps(*)
        `)
        .order('created_at', { ascending: false })

      if (filters?.sequence_type) {
        query = query.eq('sequence_type', filters.sequence_type)
      }
      if (filters?.trigger_event) {
        query = query.eq('trigger_event', filters.trigger_event)
      }
      if (filters?.is_active !== undefined) {
        query = query.eq('is_active', filters.is_active)
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by)
      }
      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting sequences:', error)
      throw new AppError('Failed to get sequences', 'SEQUENCE_GET_ERROR', 500)
    }
  }

  async getSequenceById(tenantSchema: string, sequenceId: string): Promise<FollowUpSequence> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .select(`
          *,
          steps:sequence_steps(*),
          analytics:sequence_analytics(*)
        `)
        .eq('id', sequenceId)
        .single()

      if (error) throw error
      if (!data) throw new AppError('Sequence not found', 'SEQUENCE_NOT_FOUND', 404)

      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error getting sequence:', error)
      throw new AppError('Failed to get sequence', 'SEQUENCE_GET_ERROR', 500)
    }
  }

  async createSequence(tenantSchema: string, userId: string, request: CreateSequenceRequest): Promise<FollowUpSequence> {
    try {
      // Start transaction
      const { data: sequence, error: sequenceError } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .insert({
          name: request.name,
          description: request.description,
          sequence_type: request.sequence_type,
          trigger_event: request.trigger_event,
          trigger_conditions: request.trigger_conditions || {},
          start_delay_minutes: request.start_delay_minutes || 0,
          max_enrollments: request.max_enrollments,
          enrollment_window_hours: request.enrollment_window_hours || 24,
          priority: request.priority || 0,
          tags: request.tags || [],
          created_by: userId
        })
        .select()
        .single()

      if (sequenceError) throw sequenceError

      // Create steps
      if (request.steps && request.steps.length > 0) {
        const stepsToInsert = request.steps.map((step, index) => ({
          sequence_id: sequence.id,
          step_order: step.step_order || index + 1,
          step_type: step.step_type,
          name: step.name,
          subject: step.subject,
          content_template: step.content_template,
          delay_after_previous: step.delay_after_previous,
          send_conditions: step.send_conditions || {},
          is_active: step.is_active !== false
        }))

        const { error: stepsError } = await this.supabase
          .from(`${tenantSchema}.sequence_steps`)
          .insert(stepsToInsert)

        if (stepsError) throw stepsError
      }

      return await this.getSequenceById(tenantSchema, sequence.id)
    } catch (error) {
      console.error('Error creating sequence:', error)
      throw new AppError('Failed to create sequence', 'SEQUENCE_CREATE_ERROR', 500)
    }
  }

  async updateSequence(tenantSchema: string, sequenceId: string, request: UpdateSequenceRequest): Promise<FollowUpSequence> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .update({
          name: request.name,
          description: request.description,
          sequence_type: request.sequence_type,
          trigger_event: request.trigger_event,
          trigger_conditions: request.trigger_conditions,
          is_active: request.is_active,
          start_delay_minutes: request.start_delay_minutes,
          max_enrollments: request.max_enrollments,
          enrollment_window_hours: request.enrollment_window_hours,
          priority: request.priority,
          tags: request.tags,
          updated_at: new Date().toISOString()
        })
        .eq('id', sequenceId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new AppError('Sequence not found', 'SEQUENCE_NOT_FOUND', 404)

      return await this.getSequenceById(tenantSchema, sequenceId)
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error updating sequence:', error)
      throw new AppError('Failed to update sequence', 'SEQUENCE_UPDATE_ERROR', 500)
    }
  }

  async deleteSequence(tenantSchema: string, sequenceId: string): Promise<void> {
    try {
      // Check for active enrollments
      const { count } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select('id', { count: 'exact' })
        .eq('sequence_id', sequenceId)
        .eq('status', 'active')

      if (count && count > 0) {
        throw new AppError('Cannot delete sequence with active enrollments', 'SEQUENCE_HAS_ACTIVE_ENROLLMENTS', 400)
      }

      const { error } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .delete()
        .eq('id', sequenceId)

      if (error) throw error
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error deleting sequence:', error)
      throw new AppError('Failed to delete sequence', 'SEQUENCE_DELETE_ERROR', 500)
    }
  }

  // ============================================================================
  // ENROLLMENT MANAGEMENT
  // ============================================================================

  async enrollUser(tenantSchema: string, request: EnrollUserRequest): Promise<SequenceEnrollment> {
    try {
      // Check if user is already enrolled in this sequence within the window
      const windowStart = new Date(Date.now() - (24 * 60 * 60 * 1000)) // Default 24 hours

      const existingEnrollment = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select('id')
        .eq('sequence_id', request.sequence_id)
        .eq('member_id', request.member_id)
        .gte('enrolled_at', windowStart.toISOString())
        .single()

      if (existingEnrollment.data) {
        throw new AppError('User already enrolled in this sequence', 'USER_ALREADY_ENROLLED', 400)
      }

      // Check communication preferences
      if (request.member_id) {
        const preferences = await this.getCommunicationPreferences(tenantSchema, request.member_id)
        if (preferences?.global_unsubscribe) {
          throw new AppError('User has unsubscribed from all communications', 'USER_UNSUBSCRIBED', 400)
        }
      }

      // Get sequence details to calculate next send time
      const sequence = await this.getSequenceById(tenantSchema, request.sequence_id)
      const nextSendAt = new Date(Date.now() + (sequence.start_delay_minutes * 60 * 1000))

      const { data, error } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .insert({
          sequence_id: request.sequence_id,
          member_id: request.member_id,
          visitor_id: request.visitor_id,
          prayer_request_id: request.prayer_request_id,
          enrollment_trigger: request.trigger_event,
          enrollment_data: request.enrollment_data || {},
          priority_boost: request.priority_boost || 0,
          next_send_at: nextSendAt.toISOString()
        })
        .select(`
          *,
          sequence:follow_up_sequences(*)
        `)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error enrolling user:', error)
      throw new AppError('Failed to enroll user', 'ENROLLMENT_ERROR', 500)
    }
  }

  async bulkEnroll(tenantSchema: string, request: BulkEnrollRequest): Promise<{
    enrolled_count: number
    failed_count: number
    enrollment_ids: string[]
    errors: Array<{ index: number; error: string }>
  }> {
    const results = {
      enrolled_count: 0,
      failed_count: 0,
      enrollment_ids: [] as string[],
      errors: [] as Array<{ index: number; error: string }>
    }

    for (let i = 0; i < request.enrollments.length; i++) {
      try {
        const enrollment = await this.enrollUser(tenantSchema, {
          sequence_id: request.sequence_id,
          ...request.enrollments[i]
        })
        results.enrolled_count++
        results.enrollment_ids.push(enrollment.id)
      } catch (error) {
        results.failed_count++
        results.errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return results
  }

  async pauseEnrollment(tenantSchema: string, enrollmentId: string, reason?: string): Promise<SequenceEnrollment> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .update({
          status: 'paused',
          metadata: { pause_reason: reason, paused_at: new Date().toISOString() }
        })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new AppError('Enrollment not found', 'ENROLLMENT_NOT_FOUND', 404)

      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error pausing enrollment:', error)
      throw new AppError('Failed to pause enrollment', 'ENROLLMENT_PAUSE_ERROR', 500)
    }
  }

  async resumeEnrollment(tenantSchema: string, enrollmentId: string): Promise<SequenceEnrollment> {
    try {
      // Calculate next send time based on current step
      const enrollment = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select(`
          *,
          sequence:follow_up_sequences(
            start_delay_minutes,
            steps:sequence_steps(step_order, delay_after_previous)
          )
        `)
        .eq('id', enrollmentId)
        .single()

      if (!enrollment.data) {
        throw new AppError('Enrollment not found', 'ENROLLMENT_NOT_FOUND', 404)
      }

      // Calculate appropriate next send time
      let nextSendAt = new Date()
      if (enrollment.data.current_step === 0) {
        nextSendAt = new Date(Date.now() + (enrollment.data.sequence.start_delay_minutes * 60 * 1000))
      } else {
        // Find the next step's delay
        const nextStep = enrollment.data.sequence.steps?.find((s: any) => s.step_order === enrollment.data.current_step + 1)
        if (nextStep) {
          nextSendAt = new Date(Date.now() + (nextStep.delay_after_previous * 60 * 1000))
        }
      }

      const { data, error } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .update({
          status: 'active',
          next_send_at: nextSendAt.toISOString(),
          metadata: { resumed_at: new Date().toISOString() }
        })
        .eq('id', enrollmentId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error resuming enrollment:', error)
      throw new AppError('Failed to resume enrollment', 'ENROLLMENT_RESUME_ERROR', 500)
    }
  }

  async cancelEnrollment(tenantSchema: string, enrollmentId: string, reason?: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
          cancel_reason: reason
        })
        .eq('id', enrollmentId)

      if (error) throw error
    } catch (error) {
      console.error('Error cancelling enrollment:', error)
      throw new AppError('Failed to cancel enrollment', 'ENROLLMENT_CANCEL_ERROR', 500)
    }
  }

  async getEnrollments(tenantSchema: string, filters?: EnrollmentFilters): Promise<SequenceEnrollment[]> {
    try {
      let query = this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select(`
          *,
          sequence:follow_up_sequences(name, sequence_type),
          member:members(first_name, last_name, email),
          visitor:visits(visitor_name, visitor_email)
        `)
        .order('enrolled_at', { ascending: false })

      if (filters?.sequence_id) {
        query = query.eq('sequence_id', filters.sequence_id)
      }
      if (filters?.member_id) {
        query = query.eq('member_id', filters.member_id)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.enrolled_after) {
        query = query.gte('enrolled_at', filters.enrolled_after)
      }
      if (filters?.enrolled_before) {
        query = query.lte('enrolled_at', filters.enrolled_before)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting enrollments:', error)
      throw new AppError('Failed to get enrollments', 'ENROLLMENTS_GET_ERROR', 500)
    }
  }

  // ============================================================================
  // MESSAGE PROCESSING
  // ============================================================================

  async processSequences(tenantSchema: string, batchSize: number = 100): Promise<{
    processed_count: number
    failed_count: number
  }> {
    try {
      const result = await this.supabase.rpc('process_pending_sequences', {
        p_tenant_schema: tenantSchema
      })

      if (result.error) throw result.error

      // Get pending messages to send
      const { data: pendingMessages, error: messagesError } = await this.supabase
        .from(`${tenantSchema}.sequence_messages`)
        .select(`
          *,
          enrollment:sequence_enrollments(
            enrollment_data,
            member:members(first_name, last_name, email, phone),
            visitor:visits(visitor_name, visitor_email, visitor_phone)
          )
        `)
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('scheduled_for', { ascending: true })
        .limit(batchSize)

      if (messagesError) throw messagesError

      let processed = 0
      let failed = 0

      for (const message of pendingMessages || []) {
        try {
          await this.sendMessage(tenantSchema, message)
          processed++
        } catch (error) {
          console.error('Error sending message:', error)
          await this.markMessageFailed(tenantSchema, message.id, error instanceof Error ? error.message : 'Unknown error')
          failed++
        }
      }

      return { processed_count: processed, failed_count: failed }
    } catch (error) {
      console.error('Error processing sequences:', error)
      throw new AppError('Failed to process sequences', 'SEQUENCE_PROCESS_ERROR', 500)
    }
  }

  private async sendMessage(tenantSchema: string, message: SequenceMessage): Promise<void> {
    try {
      // Process template variables
      const context = this.buildTemplateContext(message)
      const processedContent = this.processTemplate(message.content, context)
      const processedSubject = message.subject ? this.processTemplate(message.subject, context) : undefined

      let deliveryResult: any

      if (message.message_type === 'email') {
        deliveryResult = await this.emailService.sendEmail({
          to: message.recipient_email!,
          subject: processedSubject!,
          content: processedContent,
          from: context.church_email || 'noreply@church.com'
        })
      } else if (message.message_type === 'sms') {
        deliveryResult = await this.smsService.sendSMS({
          to: message.recipient_phone!,
          message: processedContent
        })
      }

      // Update message status
      await this.supabase
        .from(`${tenantSchema}.sequence_messages`)
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          external_id: deliveryResult?.id || null,
          delivery_metadata: deliveryResult || {}
        })
        .eq('id', message.id)

    } catch (error) {
      throw error
    }
  }

  private async markMessageFailed(tenantSchema: string, messageId: string, errorMessage: string): Promise<void> {
    await this.supabase
      .from(`${tenantSchema}.sequence_messages`)
      .update({
        status: 'failed',
        failed_at: new Date().toISOString(),
        error_message: errorMessage,
        retry_count: 0 // Will be incremented by retry logic
      })
      .eq('id', messageId)
  }

  private buildTemplateContext(message: any): TemplateContext {
    const enrollment = message.enrollment
    const member = enrollment?.member
    const visitor = enrollment?.visitor
    const enrollmentData = enrollment?.enrollment_data || {}

    return {
      first_name: member?.first_name || visitor?.visitor_name?.split(' ')[0] || 'Friend',
      last_name: member?.last_name || visitor?.visitor_name?.split(' ').slice(1).join(' ') || '',
      full_name: member ? `${member.first_name} ${member.last_name}` : visitor?.visitor_name || 'Friend',
      email: member?.email || visitor?.visitor_email || message.recipient_email,
      phone: member?.phone || visitor?.visitor_phone || message.recipient_phone,
      church_name: enrollmentData.church_name || 'Our Church',
      church_address: enrollmentData.church_address || '',
      church_phone: enrollmentData.church_phone || '',
      church_email: enrollmentData.church_email || '',
      pastor_name: enrollmentData.pastor_name || 'Pastor',
      visit_date: enrollmentData.visit_date || '',
      visit_time: enrollmentData.visit_time || '',
      visit_type: enrollmentData.visit_type || '',
      prayer_request: enrollmentData.prayer_request || '',
      unsubscribe_url: this.generateUnsubscribeUrl(message.recipient_email || message.recipient_phone),
      ...enrollmentData // Include any additional enrollment data
    }
  }

  private processTemplate(template: string, context: TemplateContext): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return context[key] || match
    })
  }

  private generateUnsubscribeUrl(recipient?: string): string {
    if (!recipient) return '#'
    const token = Buffer.from(recipient).toString('base64')
    return `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?token=${token}`
  }

  // ============================================================================
  // TEMPLATE MANAGEMENT
  // ============================================================================

  async getTemplates(tenantSchema: string, category?: string, type?: 'email' | 'sms'): Promise<MessageTemplate[]> {
    try {
      let query = this.supabase
        .from(`${tenantSchema}.message_templates`)
        .select('*')
        .order('category')
        .order('name')

      if (category) {
        query = query.eq('category', category)
      }
      if (type) {
        query = query.eq('template_type', type)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting templates:', error)
      throw new AppError('Failed to get templates', 'TEMPLATES_GET_ERROR', 500)
    }
  }

  async createTemplate(tenantSchema: string, userId: string, request: CreateTemplateRequest): Promise<MessageTemplate> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.message_templates`)
        .insert({
          name: request.name,
          category: request.category,
          template_type: request.template_type,
          subject: request.subject,
          content: request.content,
          variables: request.variables || [],
          language: request.language || 'en',
          created_by: userId
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating template:', error)
      throw new AppError('Failed to create template', 'TEMPLATE_CREATE_ERROR', 500)
    }
  }

  async updateTemplate(tenantSchema: string, templateId: string, request: UpdateTemplateRequest): Promise<MessageTemplate> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.message_templates`)
        .update({
          name: request.name,
          category: request.category,
          template_type: request.template_type,
          subject: request.subject,
          content: request.content,
          variables: request.variables,
          language: request.language,
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId)
        .select()
        .single()

      if (error) throw error
      if (!data) throw new AppError('Template not found', 'TEMPLATE_NOT_FOUND', 404)
      return data
    } catch (error) {
      if (error instanceof AppError) throw error
      console.error('Error updating template:', error)
      throw new AppError('Failed to update template', 'TEMPLATE_UPDATE_ERROR', 500)
    }
  }

  async deleteTemplate(tenantSchema: string, templateId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(`${tenantSchema}.message_templates`)
        .delete()
        .eq('id', templateId)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting template:', error)
      throw new AppError('Failed to delete template', 'TEMPLATE_DELETE_ERROR', 500)
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getSequenceAnalytics(
    tenantSchema: string, 
    sequenceId: string, 
    filters?: AnalyticsFilters
  ): Promise<SequenceAnalytics[]> {
    try {
      let query = this.supabase
        .from(`${tenantSchema}.sequence_analytics`)
        .select('*')
        .eq('sequence_id', sequenceId)
        .order('metric_date', { ascending: false })

      if (filters?.start_date) {
        query = query.gte('metric_date', filters.start_date)
      }
      if (filters?.end_date) {
        query = query.lte('metric_date', filters.end_date)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting sequence analytics:', error)
      throw new AppError('Failed to get analytics', 'ANALYTICS_GET_ERROR', 500)
    }
  }

  async getSequencePerformanceMetrics(tenantSchema: string, sequenceId: string): Promise<SequencePerformanceMetrics> {
    try {
      // This would be implemented with complex queries
      // For now, returning a basic structure
      const sequence = await this.getSequenceById(tenantSchema, sequenceId)
      
      // Get enrollment stats
      const { count: totalEnrollments } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select('id', { count: 'exact' })
        .eq('sequence_id', sequenceId)

      const { count: activeEnrollments } = await this.supabase
        .from(`${tenantSchema}.sequence_enrollments`)
        .select('id', { count: 'exact' })
        .eq('sequence_id', sequenceId)
        .eq('status', 'active')

      // Get message stats
      const { data: messageStats } = await this.supabase
        .from(`${tenantSchema}.sequence_messages`)
        .select('status, sent_at, opened_at, clicked_at')
        .eq('enrollment_id', sequenceId) // This would need proper join

      return {
        sequence_id: sequenceId,
        sequence_name: sequence.name,
        total_enrollments: totalEnrollments || 0,
        active_enrollments: activeEnrollments || 0,
        completion_rate: 0, // Calculate from data
        open_rate: 0, // Calculate from message stats
        click_rate: 0, // Calculate from message stats
        unsubscribe_rate: 0, // Calculate from preferences
        conversion_rate: 0, // Calculate from conversions
        revenue_per_enrollment: 0, // Calculate from revenue data
        avg_time_to_complete: 0 // Calculate from enrollment data
      }
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      throw new AppError('Failed to get performance metrics', 'METRICS_GET_ERROR', 500)
    }
  }

  async getDashboardSummary(tenantSchema: string): Promise<SequencesDashboardSummary> {
    try {
      // This would involve multiple queries to build the summary
      // Implementation details would depend on specific requirements
      
      const { count: totalSequences } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .select('id', { count: 'exact' })

      const { count: activeSequences } = await this.supabase
        .from(`${tenantSchema}.follow_up_sequences`)
        .select('id', { count: 'exact' })
        .eq('is_active', true)

      return {
        total_sequences: totalSequences || 0,
        active_sequences: activeSequences || 0,
        total_enrollments: 0, // Calculate
        active_enrollments: 0, // Calculate
        messages_sent_today: 0, // Calculate
        messages_sent_this_week: 0, // Calculate
        overall_open_rate: 0, // Calculate
        overall_click_rate: 0, // Calculate
        overall_conversion_rate: 0, // Calculate
        recent_conversions: [], // Fetch recent data
        top_performing_sequences: [], // Calculate top performers
        upcoming_sends: [] // Get upcoming scheduled sends
      }
    } catch (error) {
      console.error('Error getting dashboard summary:', error)
      throw new AppError('Failed to get dashboard summary', 'DASHBOARD_SUMMARY_ERROR', 500)
    }
  }

  // ============================================================================
  // COMMUNICATION PREFERENCES
  // ============================================================================

  async getCommunicationPreferences(tenantSchema: string, memberId: string): Promise<CommunicationPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.communication_preferences`)
        .select('*')
        .eq('member_id', memberId)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    } catch (error) {
      console.error('Error getting communication preferences:', error)
      return null
    }
  }

  async updateCommunicationPreferences(
    tenantSchema: string, 
    memberId: string, 
    preferences: Partial<CommunicationPreferences>
  ): Promise<CommunicationPreferences> {
    try {
      const { data, error } = await this.supabase
        .from(`${tenantSchema}.communication_preferences`)
        .upsert({
          member_id: memberId,
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating communication preferences:', error)
      throw new AppError('Failed to update preferences', 'PREFERENCES_UPDATE_ERROR', 500)
    }
  }

  async unsubscribe(tenantSchema: string, email?: string, phone?: string, sequenceId?: string): Promise<void> {
    try {
      if (sequenceId) {
        // Unsubscribe from specific sequence
        await this.supabase
          .from(`${tenantSchema}.communication_preferences`)
          .upsert({
            [email ? 'visitor_email' : 'member_id']: email || phone,
            unsubscribed_from: [sequenceId],
            updated_at: new Date().toISOString()
          })
      } else {
        // Global unsubscribe
        await this.supabase
          .from(`${tenantSchema}.communication_preferences`)
          .upsert({
            [email ? 'visitor_email' : 'member_id']: email || phone,
            global_unsubscribe: true,
            email_enabled: false,
            sms_enabled: false,
            updated_at: new Date().toISOString()
          })
      }
    } catch (error) {
      console.error('Error processing unsubscribe:', error)
      throw new AppError('Failed to process unsubscribe', 'UNSUBSCRIBE_ERROR', 500)
    }
  }
}