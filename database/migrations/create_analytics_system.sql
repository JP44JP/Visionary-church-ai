-- Analytics System Database Schema
-- Comprehensive analytics and reporting for VisionaryChurch-ai platform

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Analytics Events - Core event tracking table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Event details
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL, -- visitor_journey, engagement, conversion, system, communication
  event_action VARCHAR(100) NOT NULL, -- chat_started, visit_scheduled, email_opened, etc.
  event_label VARCHAR(255),
  event_value DECIMAL(10,2),
  
  -- Context and metadata
  page_url VARCHAR(500),
  referrer_url VARCHAR(500),
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(2),
  region VARCHAR(50),
  city VARCHAR(100),
  device_type VARCHAR(20), -- desktop, mobile, tablet
  browser VARCHAR(50),
  os VARCHAR(50),
  
  -- Custom dimensions
  custom_dimension_1 VARCHAR(100), -- Source/Medium
  custom_dimension_2 VARCHAR(100), -- Campaign
  custom_dimension_3 VARCHAR(100), -- Content
  custom_dimension_4 VARCHAR(100), -- Term
  custom_dimension_5 VARCHAR(100), -- Additional tracking
  
  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_date DATE GENERATED ALWAYS AS (created_at::DATE) STORED,
  event_hour INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM created_at)) STORED,
  event_dow INTEGER GENERATED ALWAYS AS (EXTRACT(DOW FROM created_at)) STORED
);

-- Analytics Sessions - Session tracking
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Session details
  first_visit BOOLEAN DEFAULT true,
  returning_visitor BOOLEAN DEFAULT false,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- seconds
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  
  -- Acquisition
  source VARCHAR(100),
  medium VARCHAR(100),
  campaign VARCHAR(100),
  content VARCHAR(100),
  term VARCHAR(100),
  landing_page VARCHAR(500),
  exit_page VARCHAR(500),
  
  -- Device/Location
  device_type VARCHAR(20),
  browser VARCHAR(50),
  os VARCHAR(50),
  country VARCHAR(2),
  region VARCHAR(50),
  city VARCHAR(100),
  
  -- Goals and conversions
  goal_completions JSONB DEFAULT '[]'::jsonb,
  conversion_value DECIMAL(10,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Page Views tracking
CREATE TABLE analytics_page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Page details
  page_url VARCHAR(500) NOT NULL,
  page_title VARCHAR(255),
  page_type VARCHAR(50), -- home, about, events, blog, etc.
  
  -- Timing
  time_on_page INTEGER, -- seconds
  bounce BOOLEAN DEFAULT false,
  exit_page BOOLEAN DEFAULT false,
  
  -- Context
  referrer_url VARCHAR(500),
  scroll_depth INTEGER DEFAULT 0, -- percentage
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Visitor Journey Tracking
CREATE TABLE visitor_journey_stages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  
  -- Journey stage
  stage VARCHAR(50) NOT NULL, -- awareness, interest, consideration, conversion, retention, advocacy
  stage_action VARCHAR(100) NOT NULL, -- website_visit, chat_started, form_filled, visit_scheduled, attended, joined
  
  -- Source attribution
  first_touch_source VARCHAR(100),
  first_touch_medium VARCHAR(100),
  last_touch_source VARCHAR(100),
  last_touch_medium VARCHAR(100),
  
  -- Context
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication Analytics
CREATE TABLE communication_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  
  -- Communication details
  communication_type VARCHAR(20) NOT NULL, -- email, sms, push, in_app
  campaign_id UUID,
  sequence_id UUID,
  message_id UUID,
  
  -- Recipient
  recipient_type VARCHAR(20) NOT NULL, -- member, visitor, staff
  recipient_id UUID,
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  
  -- Message details
  subject VARCHAR(255),
  template_id UUID,
  
  -- Delivery status
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  -- Provider details
  provider VARCHAR(50), -- sendgrid, twilio, etc.
  external_id VARCHAR(255),
  
  -- Tracking
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  unique_clicks INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat Analytics
CREATE TABLE chat_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Chat metrics
  total_messages INTEGER DEFAULT 0,
  visitor_messages INTEGER DEFAULT 0,
  ai_messages INTEGER DEFAULT 0,
  avg_response_time INTEGER, -- seconds
  session_duration INTEGER, -- seconds
  
  -- Satisfaction and outcomes
  satisfaction_rating INTEGER, -- 1-5 scale
  resolution_achieved BOOLEAN DEFAULT false,
  escalated_to_human BOOLEAN DEFAULT false,
  conversion_occurred BOOLEAN DEFAULT false,
  conversion_type VARCHAR(50), -- visit_scheduled, prayer_request, contact_form
  
  -- Intent analysis
  detected_intents VARCHAR[] DEFAULT '{}',
  sentiment_score DECIMAL(3,2), -- -1 to 1
  confidence_scores JSONB DEFAULT '{}'::jsonb,
  
  -- Context
  source_page VARCHAR(500),
  device_type VARCHAR(20),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Performance Analytics
CREATE TABLE event_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  
  -- Registration metrics
  total_registrations INTEGER DEFAULT 0,
  confirmed_registrations INTEGER DEFAULT 0,
  cancelled_registrations INTEGER DEFAULT 0,
  waitlist_registrations INTEGER DEFAULT 0,
  
  -- Attendance metrics
  total_attendance INTEGER DEFAULT 0,
  member_attendance INTEGER DEFAULT 0,
  visitor_attendance INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  
  -- Engagement metrics
  check_in_rate DECIMAL(5,2), -- percentage
  avg_arrival_time INTEGER, -- minutes before/after start
  feedback_responses INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2),
  
  -- Financial metrics
  total_revenue DECIMAL(10,2) DEFAULT 0,
  avg_donation DECIMAL(10,2),
  
  -- Marketing metrics
  page_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- Calculated metrics
  roi DECIMAL(10,2),
  cost_per_attendee DECIMAL(10,2),
  
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Request Analytics
CREATE TABLE prayer_analytics_summary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  
  -- Time period
  period_type VARCHAR(20) NOT NULL, -- daily, weekly, monthly, yearly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Request metrics
  total_requests INTEGER DEFAULT 0,
  new_requests INTEGER DEFAULT 0,
  active_requests INTEGER DEFAULT 0,
  completed_requests INTEGER DEFAULT 0,
  archived_requests INTEGER DEFAULT 0,
  
  -- Response metrics
  avg_response_time_hours DECIMAL(8,2),
  median_response_time_hours DECIMAL(8,2),
  requests_with_responses INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  
  -- Team metrics
  active_team_members INTEGER DEFAULT 0,
  avg_load_per_member DECIMAL(5,2),
  team_utilization_rate DECIMAL(5,2),
  
  -- Category breakdown
  category_distribution JSONB DEFAULT '{}'::jsonb,
  urgency_distribution JSONB DEFAULT '{}'::jsonb,
  
  -- Satisfaction
  avg_satisfaction_rating DECIMAL(3,2),
  satisfaction_responses INTEGER DEFAULT 0,
  
  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(church_id, period_type, period_start)
);

-- Revenue and Growth Analytics
CREATE TABLE growth_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  
  -- Time period
  metric_date DATE NOT NULL,
  
  -- Visitor metrics
  new_visitors INTEGER DEFAULT 0,
  returning_visitors INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  unique_page_views INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTEGER,
  
  -- Conversion metrics
  chat_sessions INTEGER DEFAULT 0,
  chat_to_visit_conversions INTEGER DEFAULT 0,
  visit_scheduled INTEGER DEFAULT 0,
  visits_completed INTEGER DEFAULT 0,
  visit_to_member_conversions INTEGER DEFAULT 0,
  
  -- Engagement metrics
  total_events INTEGER DEFAULT 0,
  event_attendees INTEGER DEFAULT 0,
  prayer_requests INTEGER DEFAULT 0,
  email_subscribers INTEGER DEFAULT 0,
  
  -- Growth metrics
  member_growth INTEGER DEFAULT 0, -- net new members
  retention_rate DECIMAL(5,2),
  churn_rate DECIMAL(5,2),
  
  -- Financial metrics
  total_donations DECIMAL(10,2) DEFAULT 0,
  avg_donation DECIMAL(10,2),
  donor_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(church_id, metric_date)
);

-- Custom Goals and Conversions
CREATE TABLE analytics_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  
  -- Goal definition
  goal_name VARCHAR(100) NOT NULL,
  goal_type VARCHAR(50) NOT NULL, -- event, page_view, duration, value
  goal_value DECIMAL(10,2),
  
  -- Goal conditions
  conditions JSONB NOT NULL, -- Flexible conditions for goal matching
  
  -- Settings
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goal Completions
CREATE TABLE goal_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES analytics_goals(id) ON DELETE CASCADE,
  
  -- Completion details
  session_id VARCHAR(255),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_id UUID REFERENCES visitors(id) ON DELETE SET NULL,
  
  -- Value and context
  goal_value DECIMAL(10,2),
  conversion_path JSONB DEFAULT '[]'::jsonb, -- Array of touchpoints leading to conversion
  
  -- Attribution
  first_touch_source VARCHAR(100),
  first_touch_medium VARCHAR(100),
  last_touch_source VARCHAR(100),
  last_touch_medium VARCHAR(100),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time Analytics Dashboard Cache
CREATE TABLE analytics_dashboard_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  
  -- Cache details
  cache_key VARCHAR(100) NOT NULL,
  cache_data JSONB NOT NULL,
  
  -- Time period covered
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  
  -- Cache metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(church_id, cache_key)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Analytics Events indexes
CREATE INDEX idx_analytics_events_church_date ON analytics_events(church_id, event_date);
CREATE INDEX idx_analytics_events_category ON analytics_events(church_id, event_category, created_at);
CREATE INDEX idx_analytics_events_action ON analytics_events(church_id, event_action, created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at);
CREATE INDEX idx_analytics_events_visitor ON analytics_events(visitor_id, created_at);

-- Sessions indexes
CREATE INDEX idx_analytics_sessions_church ON analytics_sessions(church_id, session_start);
CREATE INDEX idx_analytics_sessions_user ON analytics_sessions(user_id, session_start);
CREATE INDEX idx_analytics_sessions_visitor ON analytics_sessions(visitor_id, session_start);
CREATE INDEX idx_analytics_sessions_source ON analytics_sessions(church_id, source, medium);

-- Page views indexes
CREATE INDEX idx_page_views_church_session ON analytics_page_views(church_id, session_id);
CREATE INDEX idx_page_views_url ON analytics_page_views(church_id, page_url, created_at);
CREATE INDEX idx_page_views_type ON analytics_page_views(church_id, page_type, created_at);

-- Journey stages indexes
CREATE INDEX idx_journey_stages_church ON visitor_journey_stages(church_id, created_at);
CREATE INDEX idx_journey_stages_visitor ON visitor_journey_stages(visitor_id, stage, created_at);
CREATE INDEX idx_journey_stages_stage ON visitor_journey_stages(church_id, stage, created_at);

-- Communication analytics indexes
CREATE INDEX idx_comm_analytics_church ON communication_analytics(church_id, created_at);
CREATE INDEX idx_comm_analytics_type ON communication_analytics(church_id, communication_type, sent_at);
CREATE INDEX idx_comm_analytics_recipient ON communication_analytics(recipient_id, communication_type);

-- Chat analytics indexes
CREATE INDEX idx_chat_analytics_church ON chat_analytics(church_id, created_at);
CREATE INDEX idx_chat_analytics_session ON chat_analytics(session_id);
CREATE INDEX idx_chat_analytics_visitor ON chat_analytics(visitor_id, created_at);

-- Event analytics indexes
CREATE INDEX idx_event_analytics_church ON event_analytics(church_id, created_at);
CREATE INDEX idx_event_analytics_event ON event_analytics(event_id);

-- Prayer analytics indexes
CREATE INDEX idx_prayer_analytics_church_period ON prayer_analytics_summary(church_id, period_type, period_start);

-- Growth analytics indexes
CREATE INDEX idx_growth_analytics_church_date ON growth_analytics(church_id, metric_date);

-- Goals indexes
CREATE INDEX idx_analytics_goals_church ON analytics_goals(church_id, is_active);
CREATE INDEX idx_goal_completions_goal ON goal_completions(goal_id, created_at);
CREATE INDEX idx_goal_completions_church ON goal_completions(church_id, created_at);

-- Dashboard cache indexes
CREATE INDEX idx_dashboard_cache_church_key ON analytics_dashboard_cache(church_id, cache_key);
CREATE INDEX idx_dashboard_cache_expires ON analytics_dashboard_cache(expires_at);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update analytics_sessions updated_at
CREATE OR REPLACE FUNCTION update_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers
CREATE TRIGGER update_analytics_sessions_updated_at 
    BEFORE UPDATE ON analytics_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();

CREATE TRIGGER update_analytics_goals_updated_at 
    BEFORE UPDATE ON analytics_goals 
    FOR EACH ROW EXECUTE FUNCTION update_analytics_updated_at();

-- Function to track visitor journey stages automatically
CREATE OR REPLACE FUNCTION track_visitor_journey(
    p_church_id UUID,
    p_visitor_id UUID,
    p_user_id UUID,
    p_session_id VARCHAR,
    p_stage VARCHAR,
    p_action VARCHAR,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    v_journey_id UUID;
BEGIN
    INSERT INTO visitor_journey_stages (
        church_id, visitor_id, user_id, session_id, stage, stage_action, metadata
    ) VALUES (
        p_church_id, p_visitor_id, p_user_id, p_session_id, p_stage, p_action, p_metadata
    ) RETURNING id INTO v_journey_id;
    
    RETURN v_journey_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate and cache dashboard metrics
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(
    p_church_id UUID,
    p_period_days INTEGER DEFAULT 30
)
RETURNS JSONB AS $$
DECLARE
    v_start_date TIMESTAMP WITH TIME ZONE := NOW() - (p_period_days || ' days')::INTERVAL;
    v_end_date TIMESTAMP WITH TIME ZONE := NOW();
    v_metrics JSONB := '{}'::jsonb;
    v_temp_data RECORD;
BEGIN
    -- High-level KPIs
    SELECT 
        COUNT(DISTINCT visitor_id) as total_visitors,
        COUNT(DISTINCT CASE WHEN event_action = 'visit_scheduled' THEN visitor_id END) as visit_conversions,
        COUNT(DISTINCT CASE WHEN event_action = 'chat_started' THEN session_id END) as chat_sessions,
        COALESCE(AVG(CASE WHEN event_name = 'chat_satisfaction' THEN event_value END), 0) as avg_satisfaction
    INTO v_temp_data
    FROM analytics_events
    WHERE church_id = p_church_id 
    AND created_at BETWEEN v_start_date AND v_end_date;
    
    v_metrics := jsonb_set(v_metrics, '{kpis}', jsonb_build_object(
        'total_visitors', COALESCE(v_temp_data.total_visitors, 0),
        'visit_conversions', COALESCE(v_temp_data.visit_conversions, 0),
        'chat_sessions', COALESCE(v_temp_data.chat_sessions, 0),
        'avg_satisfaction', COALESCE(v_temp_data.avg_satisfaction, 0),
        'conversion_rate', CASE 
            WHEN v_temp_data.total_visitors > 0 THEN 
                ROUND((v_temp_data.visit_conversions::DECIMAL / v_temp_data.total_visitors * 100), 2)
            ELSE 0 
        END
    ));
    
    -- Visitor journey funnel
    WITH funnel_data AS (
        SELECT 
            stage,
            COUNT(DISTINCT visitor_id) as unique_visitors
        FROM visitor_journey_stages
        WHERE church_id = p_church_id 
        AND created_at BETWEEN v_start_date AND v_end_date
        GROUP BY stage
    )
    SELECT jsonb_object_agg(stage, unique_visitors) INTO v_temp_data
    FROM funnel_data;
    
    v_metrics := jsonb_set(v_metrics, '{funnel}', COALESCE(v_temp_data, '{}'::jsonb));
    
    -- Communication performance
    WITH comm_stats AS (
        SELECT 
            communication_type,
            COUNT(*) as sent_count,
            COUNT(opened_at) as opened_count,
            COUNT(clicked_at) as clicked_count,
            COUNT(bounced_at) as bounced_count
        FROM communication_analytics
        WHERE church_id = p_church_id 
        AND sent_at BETWEEN v_start_date AND v_end_date
        GROUP BY communication_type
    )
    SELECT jsonb_object_agg(
        communication_type, 
        jsonb_build_object(
            'sent', sent_count,
            'opened', opened_count,
            'clicked', clicked_count,
            'bounced', bounced_count,
            'open_rate', CASE WHEN sent_count > 0 THEN ROUND((opened_count::DECIMAL / sent_count * 100), 2) ELSE 0 END,
            'click_rate', CASE WHEN opened_count > 0 THEN ROUND((clicked_count::DECIMAL / opened_count * 100), 2) ELSE 0 END
        )
    ) INTO v_temp_data
    FROM comm_stats;
    
    v_metrics := jsonb_set(v_metrics, '{communications}', COALESCE(v_temp_data, '{}'::jsonb));
    
    RETURN v_metrics;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old analytics data
CREATE OR REPLACE FUNCTION cleanup_old_analytics_data()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_retention_days INTEGER := 730; -- 2 years default retention
BEGIN
    -- Delete old events (keep aggregated data)
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    
    -- Delete expired cache entries
    DELETE FROM analytics_dashboard_cache 
    WHERE expires_at < NOW();
    
    -- Clean up old page views
    DELETE FROM analytics_page_views 
    WHERE created_at < NOW() - (v_retention_days || ' days')::INTERVAL;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

-- Enable RLS on all analytics tables
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_journey_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_analytics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_dashboard_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_events
CREATE POLICY "Church members can view their church's analytics events" ON analytics_events
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert analytics events" ON analytics_events
    FOR INSERT WITH CHECK (true);

-- Apply similar policies to other analytics tables
CREATE POLICY "Church members can view their church's analytics" ON analytics_sessions
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON analytics_page_views
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON visitor_journey_stages
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON communication_analytics
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON chat_analytics
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON event_analytics
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON prayer_analytics_summary
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church members can view their church's analytics" ON growth_analytics
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

-- Goals policies
CREATE POLICY "Church admins can manage analytics goals" ON analytics_goals
    FOR ALL USING (
        church_id IN (
            SELECT church_id FROM users 
            WHERE id = auth.uid() 
            AND role IN ('church_admin', 'super_admin')
        )
    );

CREATE POLICY "Church members can view goal completions" ON goal_completions
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

-- Dashboard cache policies
CREATE POLICY "Church members can view their church's dashboard cache" ON analytics_dashboard_cache
    FOR SELECT USING (church_id IN (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "System can manage dashboard cache" ON analytics_dashboard_cache
    FOR ALL WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT ON analytics_events, analytics_sessions, analytics_page_views, visitor_journey_stages TO anon, authenticated;
GRANT ALL ON analytics_goals, goal_completions, analytics_dashboard_cache TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Create materialized view for common dashboard queries
CREATE MATERIALIZED VIEW analytics_dashboard_summary AS
SELECT 
    church_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(DISTINCT visitor_id) as unique_visitors,
    COUNT(DISTINCT session_id) as sessions,
    COUNT(*) FILTER (WHERE event_category = 'conversion') as conversions,
    COUNT(*) FILTER (WHERE event_action = 'chat_started') as chat_starts,
    COUNT(*) FILTER (WHERE event_action = 'visit_scheduled') as visits_scheduled,
    AVG(event_value) FILTER (WHERE event_name = 'session_duration') as avg_session_duration
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '1 year'
GROUP BY church_id, DATE_TRUNC('day', created_at);

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_analytics_dashboard_summary_unique 
ON analytics_dashboard_summary (church_id, date);

-- Function to refresh dashboard summary
CREATE OR REPLACE FUNCTION refresh_analytics_dashboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_dashboard_summary;
END;
$$ LANGUAGE plpgsql;

COMMENT ON TABLE analytics_events IS 'Core event tracking for all user interactions';
COMMENT ON TABLE analytics_sessions IS 'User session tracking with acquisition data';
COMMENT ON TABLE visitor_journey_stages IS 'Tracks visitor progression through conversion funnel';
COMMENT ON TABLE communication_analytics IS 'Email and SMS campaign performance tracking';
COMMENT ON TABLE chat_analytics IS 'AI chat widget performance and satisfaction metrics';
COMMENT ON TABLE event_analytics IS 'Church event performance and attendance analytics';
COMMENT ON TABLE growth_analytics IS 'High-level growth and engagement metrics by date';
COMMENT ON TABLE analytics_dashboard_cache IS 'Cached dashboard data for performance optimization';