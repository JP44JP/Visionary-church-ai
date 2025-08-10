// Follow-up Sequences Type Definitions

export interface FollowUpSequence {
  id: string
  name: string
  description?: string
  sequence_type: SequenceType
  trigger_event: TriggerEvent
  trigger_conditions: Record<string, any>
  is_active: boolean
  start_delay_minutes: number
  max_enrollments?: number
  enrollment_window_hours: number
  priority: number
  tags: string[]
  created_by: string
  created_at: string
  updated_at: string
  version: number
  steps?: SequenceStep[]
  analytics?: SequenceAnalytics
}

export type SequenceType = 
  | 'welcome'
  | 'pre_visit' 
  | 'post_visit'
  | 'missed_visit'
  | 'prayer_followup'
  | 'birthday'
  | 'anniversary'
  | 'member_care'
  | 'donation_followup'
  | 'volunteer_recruitment'
  | 'event_promotion'

export type TriggerEvent = 
  | 'new_member'
  | 'visit_scheduled'
  | 'visit_completed'
  | 'visit_missed'
  | 'prayer_request_created'
  | 'birthday'
  | 'anniversary'
  | 'donation_received'
  | 'event_registration'
  | 'manual_enrollment'
  | 'chat_completed'
  | 'form_submitted'

export interface SequenceStep {
  id: string
  sequence_id: string
  step_order: number
  step_type: StepType
  name: string
  subject?: string // For emails
  content_template: string
  delay_after_previous: number // Minutes
  send_conditions: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export type StepType = 'email' | 'sms' | 'internal_task' | 'webhook'

export interface MessageTemplate {
  id: string
  name: string
  category: TemplateCategory
  template_type: 'email' | 'sms'
  subject?: string
  content: string
  variables: string[]
  language: string
  is_default: boolean
  usage_count: number
  created_by: string
  created_at: string
  updated_at: string
}

export type TemplateCategory = 
  | 'welcome'
  | 'reminder' 
  | 'thank_you'
  | 'followup'
  | 'promotional'
  | 'notification'
  | 'emergency'
  | 'birthday'
  | 'anniversary'

export interface SequenceEnrollment {
  id: string
  sequence_id: string
  member_id?: string
  visitor_id?: string
  prayer_request_id?: string
  enrollment_trigger: string
  enrollment_data: Record<string, any>
  status: EnrollmentStatus
  current_step: number
  enrolled_at: string
  next_send_at?: string
  completed_at?: string
  cancelled_at?: string
  cancel_reason?: string
  priority_boost: number
  metadata: Record<string, any>
  sequence?: FollowUpSequence
  member?: any // Reference to member
  visitor?: any // Reference to visitor
}

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'cancelled'

export interface SequenceMessage {
  id: string
  enrollment_id: string
  step_id: string
  message_type: 'email' | 'sms'
  recipient_email?: string
  recipient_phone?: string
  recipient_name?: string
  subject?: string
  content: string
  status: MessageStatus
  priority: number
  scheduled_for: string
  sent_at?: string
  delivered_at?: string
  opened_at?: string
  clicked_at?: string
  bounced_at?: string
  failed_at?: string
  retry_count: number
  max_retries: number
  error_message?: string
  external_id?: string
  delivery_metadata: Record<string, any>
  tracking_data: Record<string, any>
  created_at: string
  enrollment?: SequenceEnrollment
  step?: SequenceStep
}

export type MessageStatus = 
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'bounced'
  | 'failed'
  | 'opened'
  | 'clicked'
  | 'unsubscribed'

export interface SequenceVariant {
  id: string
  sequence_id: string
  variant_name: string
  description?: string
  traffic_percentage: number
  is_active: boolean
  changes: Record<string, any>
  created_at: string
  updated_at: string
}

export interface CommunicationPreferences {
  id: string
  member_id?: string
  visitor_email?: string
  email_enabled: boolean
  sms_enabled: boolean
  sequence_types: string[]
  unsubscribed_from: string[]
  global_unsubscribe: boolean
  preferred_language: string
  timezone: string
  quiet_hours: {
    start: string
    end: string
  }
  unsubscribe_token: string
  created_at: string
  updated_at: string
}

export interface SequenceAnalytics {
  id: string
  sequence_id: string
  variant_id?: string
  metric_date: string
  enrollments: number
  messages_sent: number
  messages_delivered: number
  messages_opened: number
  messages_clicked: number
  messages_bounced: number
  unsubscribes: number
  conversions: number
  revenue: number
  calculated_at: string
}

export interface DeliveryProvider {
  id: string
  provider_name: string
  provider_type: 'email' | 'sms'
  is_active: boolean
  is_default: boolean
  priority: number
  configuration: Record<string, any>
  rate_limits: Record<string, any>
  created_by: string
  created_at: string
  updated_at: string
}

export interface SendTimeOptimization {
  id: string
  member_id?: string
  visitor_email?: string
  optimal_send_hour: number
  optimal_send_day: string
  timezone: string
  confidence_score: number
  data_points: number
  last_calculated: string
  created_at: string
}

// API Request/Response Types
export interface EnrollUserRequest {
  sequence_id: string
  member_id?: string
  visitor_id?: string
  prayer_request_id?: string
  trigger_event: string
  enrollment_data?: Record<string, any>
  priority_boost?: number
}

export interface EnrollUserResponse {
  success: boolean
  enrollment_id: string
  enrollment: SequenceEnrollment
  next_send_at?: string
}

export interface SequenceTemplatesResponse {
  templates: MessageTemplate[]
  total: number
}

export interface SequenceAnalyticsResponse {
  analytics: SequenceAnalytics[]
  summary: {
    total_enrollments: number
    total_messages_sent: number
    overall_open_rate: number
    overall_click_rate: number
    overall_conversion_rate: number
    avg_revenue_per_enrollment: number
  }
  period: {
    start_date: string
    end_date: string
  }
}

export interface CreateSequenceRequest {
  name: string
  description?: string
  sequence_type: SequenceType
  trigger_event: TriggerEvent
  trigger_conditions?: Record<string, any>
  start_delay_minutes?: number
  max_enrollments?: number
  enrollment_window_hours?: number
  priority?: number
  tags?: string[]
  steps: Omit<SequenceStep, 'id' | 'sequence_id' | 'created_at' | 'updated_at'>[]
}

export interface UpdateSequenceRequest extends Partial<CreateSequenceRequest> {
  is_active?: boolean
}

export interface CreateTemplateRequest {
  name: string
  category: TemplateCategory
  template_type: 'email' | 'sms'
  subject?: string
  content: string
  variables?: string[]
  language?: string
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {}

export interface ProcessSequencesResponse {
  processed_count: number
  failed_count: number
  next_batch_at?: string
}

export interface PauseSequenceRequest {
  enrollment_id: string
  reason?: string
}

export interface ResumeSequenceRequest {
  enrollment_id: string
}

export interface UnsubscribeRequest {
  email?: string
  phone?: string
  sequence_id?: string
  global?: boolean
}

export interface TestSequenceRequest {
  sequence_id: string
  test_email: string
  test_data?: Record<string, any>
}

export interface DeliveryStatusWebhook {
  message_id: string
  external_id: string
  status: MessageStatus
  timestamp: string
  error_message?: string
  bounce_reason?: string
  tracking_data?: Record<string, any>
}

// Filter and query types
export interface SequenceFilters {
  sequence_type?: SequenceType
  trigger_event?: TriggerEvent
  is_active?: boolean
  created_by?: string
  tags?: string[]
}

export interface EnrollmentFilters {
  sequence_id?: string
  member_id?: string
  status?: EnrollmentStatus
  enrolled_after?: string
  enrolled_before?: string
}

export interface MessageFilters {
  message_type?: 'email' | 'sms'
  status?: MessageStatus
  sent_after?: string
  sent_before?: string
  recipient?: string
}

export interface AnalyticsFilters {
  sequence_id?: string
  start_date?: string
  end_date?: string
  variant_id?: string
}

// Template variable context types
export interface TemplateContext {
  first_name?: string
  last_name?: string
  full_name?: string
  email?: string
  phone?: string
  church_name?: string
  church_address?: string
  church_phone?: string
  church_email?: string
  pastor_name?: string
  visit_date?: string
  visit_time?: string
  visit_type?: string
  prayer_request?: string
  donation_amount?: string
  event_name?: string
  event_date?: string
  unsubscribe_url?: string
  [key: string]: any // Allow additional context variables
}

// Webhook types
export interface SequenceWebhook {
  id: string
  sequence_id: string
  webhook_url: string
  webhook_events: string[]
  webhook_secret?: string
  is_active: boolean
  retry_on_failure: boolean
  max_retries: number
  headers: Record<string, string>
  created_at: string
}

export interface WebhookEvent {
  event_type: string
  sequence_id: string
  enrollment_id?: string
  message_id?: string
  data: Record<string, any>
  timestamp: string
}

// Bulk operations
export interface BulkEnrollRequest {
  sequence_id: string
  enrollments: Omit<EnrollUserRequest, 'sequence_id'>[]
}

export interface BulkEnrollResponse {
  success: boolean
  enrolled_count: number
  failed_count: number
  enrollment_ids: string[]
  errors?: Array<{
    index: number
    error: string
  }>
}

// Performance metrics
export interface SequencePerformanceMetrics {
  sequence_id: string
  sequence_name: string
  total_enrollments: number
  active_enrollments: number
  completion_rate: number
  open_rate: number
  click_rate: number
  unsubscribe_rate: number
  conversion_rate: number
  revenue_per_enrollment: number
  avg_time_to_complete: number // Hours
  best_performing_step?: {
    step_name: string
    open_rate: number
    click_rate: number
  }
  worst_performing_step?: {
    step_name: string
    open_rate: number
    click_rate: number
  }
}

// Dashboard summary types
export interface SequencesDashboardSummary {
  total_sequences: number
  active_sequences: number
  total_enrollments: number
  active_enrollments: number
  messages_sent_today: number
  messages_sent_this_week: number
  overall_open_rate: number
  overall_click_rate: number
  overall_conversion_rate: number
  recent_conversions: Array<{
    sequence_name: string
    member_name: string
    conversion_type: string
    timestamp: string
  }>
  top_performing_sequences: SequencePerformanceMetrics[]
  upcoming_sends: Array<{
    sequence_name: string
    step_name: string
    scheduled_count: number
    next_send_time: string
  }>
}