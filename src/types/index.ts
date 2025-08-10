import { Database } from './supabase'

// Database types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Core entity types
export interface Church {
  id: string
  name: string
  slug: string
  description?: string
  website?: string
  address?: string
  phone?: string
  email?: string
  logo_url?: string
  banner_url?: string
  settings: ChurchSettings
  created_at: string
  updated_at: string
}

export interface ChurchSettings {
  theme_color: string
  welcome_message: string
  ai_personality: string
  visit_scheduling_enabled: boolean
  prayer_requests_enabled: boolean
  events_enabled: boolean
  donations_enabled: boolean
  notification_preferences: NotificationSettings
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  new_visits: boolean
  prayer_requests: boolean
  system_alerts: boolean
}

export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  role: UserRole
  church_id?: string
  created_at: string
  updated_at: string
}

export type UserRole = 'super_admin' | 'church_admin' | 'staff' | 'member' | 'visitor' | 'prayer_team_leader' | 'prayer_team_member' | 'counselor'

export interface Visit {
  id: string
  church_id: string
  visitor_id: string
  scheduled_date: string
  scheduled_time: string
  status: VisitStatus
  type: VisitType
  notes?: string
  staff_assigned?: string
  created_at: string
  updated_at: string
  visitor: Visitor
  church: Church
}

export type VisitStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type VisitType = 'first_time' | 'returning' | 'prayer' | 'counseling' | 'baptism' | 'membership'

export interface Visitor {
  id: string
  email?: string
  full_name: string
  phone?: string
  address?: string
  age_group?: string
  family_size?: number
  interests?: string[]
  how_heard_about?: string
  previous_church_experience?: boolean
  prayer_requests?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface ChatSession {
  id: string
  church_id: string
  visitor_id?: string
  messages: ChatMessage[]
  status: 'active' | 'ended'
  metadata: ChatMetadata
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: {
    confidence?: number
    intent?: string
    entities?: Record<string, any>
    suggested_actions?: string[]
  }
}

export interface ChatMetadata {
  user_agent?: string
  ip_address?: string
  referrer?: string
  session_duration?: number
  message_count: number
  satisfaction_rating?: number
  tags?: string[]
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Form types
export interface ContactForm {
  name: string
  email: string
  phone?: string
  message: string
  church_id?: string
}

export interface VisitForm {
  full_name: string
  email?: string
  phone?: string
  preferred_date: string
  preferred_time: string
  visit_type: VisitType
  age_group?: string
  family_size?: number
  how_heard_about?: string
  prayer_requests?: string
  notes?: string
}

export interface ChurchOnboardingForm {
  church_name: string
  slug: string
  description: string
  website?: string
  address: string
  phone: string
  email: string
  admin_name: string
  admin_email: string
  theme_color: string
  welcome_message: string
}

// Analytics types
export interface Analytics {
  visits: VisitAnalytics
  chat: ChatAnalytics
  engagement: EngagementAnalytics
  conversion: ConversionAnalytics
}

export interface VisitAnalytics {
  total_visits: number
  completed_visits: number
  cancelled_visits: number
  no_shows: number
  conversion_rate: number
  popular_visit_types: Array<{ type: VisitType; count: number }>
  monthly_trends: Array<{ month: string; visits: number }>
}

export interface ChatAnalytics {
  total_sessions: number
  avg_session_duration: number
  avg_messages_per_session: number
  satisfaction_rating: number
  common_intents: Array<{ intent: string; count: number }>
  resolution_rate: number
}

export interface EngagementAnalytics {
  unique_visitors: number
  returning_visitors: number
  bounce_rate: number
  avg_time_on_site: number
  popular_pages: Array<{ page: string; views: number }>
}

export interface ConversionAnalytics {
  chat_to_visit: number
  visit_to_member: number
  landing_to_chat: number
  funnel_data: Array<{
    stage: string
    count: number
    conversion_rate: number
  }>
}

// Component props types
export interface BaseProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export interface InputProps extends BaseProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  error?: string
  label?: string
  required?: boolean
  disabled?: boolean
}

// Error types
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public metadata?: Record<string, any>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

// Prayer Request Types
export interface PrayerRequest {
  id: string
  church_id: string
  requester_id?: string
  requester_name?: string
  requester_email?: string
  requester_phone?: string
  title: string
  description: string
  category: PrayerCategory
  urgency: PrayerUrgency
  privacy_level: PrayerPrivacyLevel
  status: PrayerStatus
  is_anonymous: boolean
  allow_updates: boolean
  tags: string[]
  metadata: PrayerRequestMetadata
  assigned_team_members: string[]
  created_at: string
  updated_at: string
  archived_at?: string
}

export type PrayerCategory = 
  | 'healing'
  | 'guidance'
  | 'thanksgiving'
  | 'family'
  | 'financial'
  | 'relationships'
  | 'grief'
  | 'addiction'
  | 'mental_health'
  | 'spiritual_growth'
  | 'salvation'
  | 'protection'
  | 'employment'
  | 'travel'
  | 'other'

export type PrayerUrgency = 'routine' | 'urgent' | 'emergency'

export type PrayerPrivacyLevel = 
  | 'public'
  | 'prayer_team_only' 
  | 'leadership_only'
  | 'private'

export type PrayerStatus = 
  | 'submitted'
  | 'assigned'
  | 'in_progress'
  | 'praying'
  | 'follow_up_needed'
  | 'answered'
  | 'ongoing'
  | 'closed'
  | 'archived'

export interface PrayerRequestMetadata {
  source: 'web_form' | 'chat_widget' | 'phone' | 'email' | 'in_person'
  ip_address?: string
  user_agent?: string
  referrer?: string
  location?: {
    city?: string
    state?: string
    country?: string
  }
  has_sensitive_info: boolean
  estimated_duration?: string
  follow_up_date?: string
  last_contact?: string
}

export interface PrayerTeam {
  id: string
  church_id: string
  name: string
  description?: string
  specialties: PrayerCategory[]
  max_capacity: number
  current_load: number
  is_active: boolean
  meeting_schedule?: {
    days: string[]
    time: string
    frequency: 'weekly' | 'biweekly' | 'monthly'
  }
  leader_id: string
  members: PrayerTeamMember[]
  created_at: string
  updated_at: string
}

export interface PrayerTeamMember {
  id: string
  user_id: string
  team_id: string
  role: 'leader' | 'member' | 'trainee'
  specialties: PrayerCategory[]
  availability: PrayerMemberAvailability
  current_load: number
  max_capacity: number
  is_active: boolean
  phone?: string
  email?: string
  emergency_contact?: boolean
  joined_at: string
  user: User
}

export interface PrayerMemberAvailability {
  schedule: {
    [key: string]: {
      available: boolean
      start_time?: string
      end_time?: string
    }
  }
  timezone: string
  on_call_available: boolean
  max_emergency_requests: number
}

export interface PrayerAssignment {
  id: string
  prayer_request_id: string
  team_member_id: string
  assigned_by: string
  assigned_at: string
  status: 'assigned' | 'accepted' | 'declined' | 'completed' | 'transferred'
  priority: number
  due_date?: string
  notes?: string
  completed_at?: string
}

export interface PrayerResponse {
  id: string
  prayer_request_id: string
  responder_id: string
  responder_name: string
  response_type: 'prayer' | 'encouragement' | 'scripture' | 'resource' | 'follow_up'
  content: string
  is_public: boolean
  scripture_references?: string[]
  resources?: {
    title: string
    url?: string
    description?: string
  }[]
  created_at: string
}

export interface PrayerCommunication {
  id: string
  prayer_request_id: string
  sender_id?: string
  sender_role: 'requester' | 'team_member' | 'system'
  recipient_id?: string
  message_type: 'status_update' | 'follow_up' | 'encouragement' | 'question' | 'notification'
  subject?: string
  content: string
  delivery_method: 'email' | 'sms' | 'in_app' | 'phone'
  sent_at: string
  read_at?: string
  responded_at?: string
}

export interface PrayerAnalytics {
  total_requests: number
  active_requests: number
  completed_requests: number
  avg_response_time: number
  category_distribution: Array<{
    category: PrayerCategory
    count: number
    percentage: number
  }>
  urgency_distribution: Array<{
    urgency: PrayerUrgency
    count: number
    avg_response_time: number
  }>
  team_performance: Array<{
    team_id: string
    team_name: string
    requests_handled: number
    avg_response_time: number
    satisfaction_score: number
  }>
  satisfaction_ratings: {
    average: number
    total_responses: number
    distribution: Array<{
      rating: number
      count: number
    }>
  }
  monthly_trends: Array<{
    month: string
    requests: number
    completed: number
    avg_response_time: number
  }>
}

export interface PrayerSettings {
  auto_assignment: boolean
  assignment_algorithm: 'round_robin' | 'load_based' | 'specialty_based' | 'availability_based'
  max_requests_per_member: number
  emergency_escalation_time: number // minutes
  follow_up_schedule: {
    initial: number // hours
    ongoing: number // days
  }
  notification_preferences: {
    new_requests: boolean
    assignments: boolean
    follow_ups: boolean
    emergencies: boolean
  }
  privacy_settings: {
    require_consent: boolean
    auto_archive_days: number
    anonymize_after_days: number
  }
}

// Prayer Request Forms
export interface PrayerRequestForm {
  requester_name?: string
  requester_email?: string
  requester_phone?: string
  title: string
  description: string
  category: PrayerCategory
  urgency: PrayerUrgency
  privacy_level: PrayerPrivacyLevel
  is_anonymous: boolean
  allow_updates: boolean
  consent_to_contact: boolean
  consent_to_store: boolean
}

export interface PrayerUpdateForm {
  status?: PrayerStatus
  follow_up_notes?: string
  next_follow_up?: string
  tags?: string[]
  additional_needs?: string
}

export interface PrayerResponseForm {
  response_type: 'prayer' | 'encouragement' | 'scripture' | 'resource' | 'follow_up'
  content: string
  scripture_references?: string[]
  is_public: boolean
  include_resources: boolean
  resources?: {
    title: string
    url?: string
    description?: string
  }[]
}

// Utility types
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & {
  created_at: string
  updated_at: string
}
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}