// Analytics Types for VisionaryChurch-ai Platform

export interface AnalyticsEvent {
  id: string;
  church_id: string;
  user_id?: string;
  visitor_id?: string;
  session_id?: string;
  
  // Event details
  event_name: string;
  event_category: string;
  event_action: string;
  event_label?: string;
  event_value?: number;
  
  // Context
  page_url?: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  country?: string;
  region?: string;
  city?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  
  // Custom dimensions
  custom_dimension_1?: string; // Source/Medium
  custom_dimension_2?: string; // Campaign
  custom_dimension_3?: string; // Content
  custom_dimension_4?: string; // Term
  custom_dimension_5?: string; // Additional
  
  created_at: string;
}

export interface AnalyticsSession {
  id: string;
  church_id: string;
  session_id: string;
  user_id?: string;
  visitor_id?: string;
  
  // Session details
  first_visit: boolean;
  returning_visitor: boolean;
  session_start: string;
  session_end?: string;
  session_duration?: number;
  page_views: number;
  events_count: number;
  
  // Acquisition
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  landing_page?: string;
  exit_page?: string;
  
  // Device/Location
  device_type?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  
  // Goals and conversions
  goal_completions: GoalCompletion[];
  conversion_value: number;
  
  created_at: string;
  updated_at: string;
}

export interface VisitorJourneyStage {
  id: string;
  church_id: string;
  visitor_id?: string;
  user_id?: string;
  session_id?: string;
  
  // Journey stage
  stage: 'awareness' | 'interest' | 'consideration' | 'conversion' | 'retention' | 'advocacy';
  stage_action: string;
  
  // Attribution
  first_touch_source?: string;
  first_touch_medium?: string;
  last_touch_source?: string;
  last_touch_medium?: string;
  
  metadata: Record<string, any>;
  created_at: string;
}

export interface CommunicationAnalytics {
  id: string;
  church_id: string;
  
  // Communication details
  communication_type: 'email' | 'sms' | 'push' | 'in_app';
  campaign_id?: string;
  sequence_id?: string;
  message_id?: string;
  
  // Recipient
  recipient_type: 'member' | 'visitor' | 'staff';
  recipient_id?: string;
  recipient_email?: string;
  recipient_phone?: string;
  
  // Message details
  subject?: string;
  template_id?: string;
  
  // Delivery tracking
  sent_at?: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced_at?: string;
  unsubscribed_at?: string;
  
  // Provider details
  provider?: string;
  external_id?: string;
  
  // Metrics
  open_count: number;
  click_count: number;
  unique_clicks: number;
  
  created_at: string;
}

export interface ChatAnalytics {
  id: string;
  church_id: string;
  session_id: string;
  visitor_id?: string;
  
  // Chat metrics
  total_messages: number;
  visitor_messages: number;
  ai_messages: number;
  avg_response_time: number; // seconds
  session_duration: number; // seconds
  
  // Satisfaction and outcomes
  satisfaction_rating?: number; // 1-5
  resolution_achieved: boolean;
  escalated_to_human: boolean;
  conversion_occurred: boolean;
  conversion_type?: string;
  
  // Intent analysis
  detected_intents: string[];
  sentiment_score?: number; // -1 to 1
  confidence_scores: Record<string, number>;
  
  // Context
  source_page?: string;
  device_type?: string;
  
  created_at: string;
}

export interface EventAnalytics {
  id: string;
  church_id: string;
  event_id: string;
  
  // Registration metrics
  total_registrations: number;
  confirmed_registrations: number;
  cancelled_registrations: number;
  waitlist_registrations: number;
  
  // Attendance metrics
  total_attendance: number;
  member_attendance: number;
  visitor_attendance: number;
  no_shows: number;
  
  // Engagement metrics
  check_in_rate: number; // percentage
  avg_arrival_time: number; // minutes before/after start
  feedback_responses: number;
  avg_rating: number;
  
  // Financial metrics
  total_revenue: number;
  avg_donation: number;
  
  // Marketing metrics
  page_views: number;
  unique_visitors: number;
  conversion_rate: number;
  
  // Calculated metrics
  roi: number;
  cost_per_attendee: number;
  
  last_calculated: string;
  created_at: string;
}

export interface GrowthAnalytics {
  id: string;
  church_id: string;
  metric_date: string;
  
  // Visitor metrics
  new_visitors: number;
  returning_visitors: number;
  total_page_views: number;
  unique_page_views: number;
  bounce_rate: number;
  avg_session_duration: number;
  
  // Conversion metrics
  chat_sessions: number;
  chat_to_visit_conversions: number;
  visit_scheduled: number;
  visits_completed: number;
  visit_to_member_conversions: number;
  
  // Engagement metrics
  total_events: number;
  event_attendees: number;
  prayer_requests: number;
  email_subscribers: number;
  
  // Growth metrics
  member_growth: number; // net new members
  retention_rate: number;
  churn_rate: number;
  
  // Financial metrics
  total_donations: number;
  avg_donation: number;
  donor_count: number;
  
  created_at: string;
}

export interface AnalyticsGoal {
  id: string;
  church_id: string;
  
  // Goal definition
  goal_name: string;
  goal_type: 'event' | 'page_view' | 'duration' | 'value';
  goal_value?: number;
  
  // Goal conditions
  conditions: Record<string, any>;
  
  // Settings
  is_active: boolean;
  created_by?: string;
  
  created_at: string;
  updated_at: string;
}

export interface GoalCompletion {
  id: string;
  church_id: string;
  goal_id: string;
  
  // Completion details
  session_id?: string;
  user_id?: string;
  visitor_id?: string;
  
  // Value and context
  goal_value?: number;
  conversion_path: any[]; // Touchpoints leading to conversion
  
  // Attribution
  first_touch_source?: string;
  first_touch_medium?: string;
  last_touch_source?: string;
  last_touch_medium?: string;
  
  created_at: string;
}

// Dashboard and Reporting Types
export interface DashboardMetrics {
  kpis: KPIMetrics;
  funnel: VisitorFunnelMetrics;
  communications: CommunicationMetrics;
  events: EventMetrics;
  growth: GrowthTrendMetrics;
  chat: ChatMetrics;
  period: AnalyticsPeriod;
  generated_at: string;
  filters?: AnalyticsFilter;
}

export interface KPIMetrics {
  total_visitors: number;
  chat_sessions: number;
  visit_conversions: number;
  member_conversions: number;
  chat_to_visit_rate: number;
  visit_to_member_rate: number;
  visitor_growth: number; // percentage change
  chat_growth: number; // percentage change
}

export interface VisitorFunnelMetrics {
  awareness: number;
  interest: number;
  consideration: number;
  conversion: number;
  retention: number;
  advocacy: number;
  drop_off_rates: Record<string, number>;
}

export interface CommunicationMetrics {
  [type: string]: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
    delivery_rate: number;
    open_rate: number;
    click_rate: number;
    bounce_rate: number;
    unsubscribe_rate: number;
  };
}

export interface EventMetrics {
  total_events: number;
  total_registrations: number;
  total_attendance: number;
  avg_attendance_rate: number;
  popular_event_types: Array<{ type: string; count: number }>;
  upcoming_events: Array<{
    id: string;
    title: string;
    start_date: string;
    event_type: string;
  }>;
}

export interface ChatMetrics {
  total_sessions: number;
  avg_satisfaction: number;
  avg_response_time: number;
  conversion_rate: number;
  escalation_rate: number;
  common_intents: Array<{ intent: string; count: number }>;
}

export interface GrowthTrendMetrics {
  daily_trends: GrowthAnalytics[];
  total_growth: number;
  retention_trend: Array<{ date: string; value: number }>;
  conversion_trend: Array<{ date: string; value: number }>;
}

// Real-time Analytics
export interface RealTimeMetrics {
  active_visitors: number;
  recent_events: Array<{
    event_action: string;
    created_at: string;
  }>;
  live_chats: number;
  timestamp: string;
}

// Filters and Parameters
export type AnalyticsPeriod = '1d' | '7d' | '30d' | '90d' | '1y';

export interface AnalyticsFilter {
  source?: string;
  medium?: string;
  campaign?: string;
  device_type?: string;
  country?: string;
  event_type?: string;
  user_type?: 'member' | 'visitor' | 'staff';
}

export type ExportFormat = 'json' | 'csv' | 'excel' | 'pdf';

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface FunnelChartData {
  stage: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface LineChartData {
  date: string;
  [key: string]: string | number;
}

export interface BarChartData {
  category: string;
  value: number;
  previousValue?: number;
  growth?: number;
}

// Report Types
export interface AnalyticsReport {
  title: string;
  description?: string;
  generated_at: string;
  period: AnalyticsPeriod;
  filters?: AnalyticsFilter;
  sections: ReportSection[];
}

export interface ReportSection {
  title: string;
  type: 'kpis' | 'chart' | 'table' | 'text' | 'funnel';
  data: any;
  insights?: string[];
}

// Widget Configuration Types
export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'funnel' | 'realtime';
  title: string;
  config: WidgetConfig;
  position: { x: number; y: number; w: number; h: number };
  is_visible: boolean;
  refresh_interval?: number; // seconds
}

export interface WidgetConfig {
  metric?: string;
  chart_type?: 'line' | 'bar' | 'pie' | 'area' | 'funnel';
  period?: AnalyticsPeriod;
  filters?: AnalyticsFilter;
  show_comparison?: boolean;
  color_scheme?: string;
  [key: string]: any;
}

// User Preferences
export interface AnalyticsUserPreferences {
  user_id: string;
  church_id: string;
  default_period: AnalyticsPeriod;
  dashboard_layout: DashboardWidget[];
  email_reports: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  notification_thresholds: {
    visitor_drop: number;
    conversion_drop: number;
    chat_satisfaction: number;
  };
}

// Cohort Analysis Types
export interface CohortData {
  cohort_period: string; // YYYY-MM
  period_number: number; // 0, 1, 2, etc.
  users: number;
  retention_rate: number;
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  periods: string[];
  avg_retention_by_period: Record<number, number>;
}

// A/B Testing Types
export interface ExperimentMetrics {
  experiment_id: string;
  variant_name: string;
  participants: number;
  conversions: number;
  conversion_rate: number;
  confidence: number;
  statistical_significance: boolean;
  lift: number; // percentage improvement over control
}

// Attribution Types
export interface AttributionData {
  touchpoint: string;
  channel: string;
  campaign?: string;
  timestamp: string;
  conversion_value?: number;
}

export interface AttributionModel {
  model_type: 'first_touch' | 'last_touch' | 'linear' | 'time_decay' | 'position_based';
  attribution_weights: Record<string, number>;
}

// Advanced Analytics Types
export interface PredictiveMetrics {
  metric_name: string;
  current_value: number;
  predicted_value: number;
  confidence_interval: [number, number];
  prediction_period: string; // e.g., "next_30_days"
  model_accuracy: number;
}

export interface AnomalyDetection {
  metric_name: string;
  timestamp: string;
  actual_value: number;
  expected_value: number;
  anomaly_score: number;
  severity: 'low' | 'medium' | 'high';
  possible_causes: string[];
}

// Performance Benchmarks
export interface BenchmarkData {
  metric_name: string;
  church_value: number;
  industry_average: number;
  top_quartile: number;
  percentile_rank: number;
  benchmark_date: string;
}

// Segment Analysis
export interface UserSegment {
  segment_id: string;
  segment_name: string;
  description: string;
  criteria: Record<string, any>;
  user_count: number;
  conversion_rate: number;
  avg_lifetime_value: number;
}

export interface SegmentComparison {
  segments: UserSegment[];
  metrics: Record<string, Record<string, number>>; // segment_id -> metric_name -> value
  insights: string[];
}