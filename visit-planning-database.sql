-- Visit Planning System Database Extension
-- Extends the existing church management database with visit planning functionality

-- =============================================================================
-- VISIT PLANNING TABLES
-- =============================================================================

-- Church service times table
CREATE TABLE IF NOT EXISTS service_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- 'Sunday Morning', 'Sunday Evening', 'Wednesday Bible Study'
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    description TEXT,
    service_type VARCHAR(50) NOT NULL DEFAULT 'worship', -- worship, bible_study, prayer, youth, children
    capacity INTEGER DEFAULT 200,
    is_visitor_friendly BOOLEAN DEFAULT true,
    special_notes TEXT, -- 'Childcare available', 'Casual dress welcome', etc.
    location VARCHAR(255) DEFAULT 'Main Sanctuary',
    is_active BOOLEAN DEFAULT true,
    requires_registration BOOLEAN DEFAULT false,
    registration_deadline_hours INTEGER DEFAULT 0, -- Hours before service
    recurring_pattern JSONB DEFAULT '{"weekly": true}', -- For handling special schedules
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit plans/bookings
CREATE TABLE IF NOT EXISTS visit_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_time_id UUID REFERENCES service_times(id) ON DELETE SET NULL,
    
    -- Visitor Information
    visitor_name VARCHAR(255) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    
    -- Visit Details
    planned_date DATE NOT NULL,
    party_size INTEGER DEFAULT 1 CHECK (party_size > 0),
    adults_count INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    children_ages INTEGER[] DEFAULT '{}', -- Array of ages
    
    -- Special Requests
    special_needs TEXT,
    dietary_restrictions TEXT,
    wheelchair_accessible BOOLEAN DEFAULT false,
    parking_assistance BOOLEAN DEFAULT false,
    childcare_needed BOOLEAN DEFAULT false,
    
    -- Contact Preferences
    preferred_contact_method VARCHAR(20) DEFAULT 'email', -- email, phone, sms
    contact_time_preference VARCHAR(50), -- 'mornings', 'afternoons', 'evenings', 'weekends'
    
    -- Visit Status
    status VARCHAR(20) DEFAULT 'planned', -- planned, confirmed, attended, no_show, cancelled, rescheduled
    confirmation_sent_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    follow_up_sent_at TIMESTAMPTZ,
    
    -- Integration fields
    chat_conversation_id UUID, -- Link to chat conversation that generated this
    lead_source VARCHAR(50) DEFAULT 'website', -- website, chat, phone, referral, social_media
    referrer_name VARCHAR(255),
    
    -- Visit outcome
    attended BOOLEAN,
    attended_date DATE,
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    feedback TEXT,
    interested_in_membership BOOLEAN,
    interested_in_ministries VARCHAR[] DEFAULT '{}',
    
    -- Follow-up tracking
    follow_up_completed BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    follow_up_assigned_to UUID, -- Reference to staff member
    next_contact_date DATE,
    
    -- Metadata
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),
    user_agent TEXT,
    ip_address INET,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit confirmation tokens for email verification
CREATE TABLE IF NOT EXISTS visit_confirmation_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_plan_id UUID NOT NULL REFERENCES visit_plans(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit reminder schedules
CREATE TABLE IF NOT EXISTS visit_reminder_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL, -- '3 Days Before', '1 Day Before', etc.
    days_before INTEGER NOT NULL,
    hours_before INTEGER DEFAULT 0,
    reminder_type VARCHAR(20) NOT NULL, -- email, sms, both
    template_type VARCHAR(50) NOT NULL, -- confirmation, reminder, follow_up
    is_active BOOLEAN DEFAULT true,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit communication log
CREATE TABLE IF NOT EXISTS visit_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_plan_id UUID NOT NULL REFERENCES visit_plans(id) ON DELETE CASCADE,
    communication_type VARCHAR(20) NOT NULL, -- email, sms, phone_call
    template_used VARCHAR(100),
    subject VARCHAR(255),
    content TEXT NOT NULL,
    sent_to VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, opened, clicked, bounced, failed
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Visit planning metrics and analytics
CREATE TABLE IF NOT EXISTS visit_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    metric_name VARCHAR(100) NOT NULL, -- visits_planned, confirmations_sent, attendances, no_shows
    metric_value INTEGER NOT NULL DEFAULT 0,
    service_time_id UUID REFERENCES service_times(id),
    dimensions JSONB DEFAULT '{}', -- Additional context like source, age_group, etc.
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, metric_name, service_time_id)
);

-- First-time visitor tracking
CREATE TABLE IF NOT EXISTS first_time_visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_plan_id UUID NOT NULL REFERENCES visit_plans(id) ON DELETE CASCADE,
    
    -- Basic Info
    visitor_name VARCHAR(255) NOT NULL,
    visitor_email VARCHAR(255) NOT NULL,
    visitor_phone VARCHAR(20),
    
    -- Visit Details
    first_visit_date DATE NOT NULL,
    service_attended VARCHAR(255),
    how_did_you_hear VARCHAR(100), -- website, friend, social_media, drive_by, etc.
    previous_church_background TEXT,
    
    -- Follow-up Information
    interests VARCHAR[] DEFAULT '{}', -- ministries, volunteering, membership, etc.
    life_stage VARCHAR(50), -- single, married, young_family, empty_nester, senior
    prayer_requests TEXT,
    
    -- Connection Status
    connected_with_staff BOOLEAN DEFAULT false,
    staff_contact_id UUID,
    invited_to_small_group BOOLEAN DEFAULT false,
    small_group_id UUID,
    
    -- Conversion tracking
    became_member BOOLEAN DEFAULT false,
    membership_date DATE,
    baptized BOOLEAN DEFAULT false,
    baptism_date DATE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR VISIT PLANNING TABLES
-- =============================================================================

-- Service times indexes
CREATE INDEX IF NOT EXISTS idx_service_times_active ON service_times(is_active, day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_service_times_visitor_friendly ON service_times(is_visitor_friendly) WHERE is_visitor_friendly = true;

-- Visit plans indexes
CREATE INDEX IF NOT EXISTS idx_visit_plans_date ON visit_plans(planned_date);
CREATE INDEX IF NOT EXISTS idx_visit_plans_status ON visit_plans(status);
CREATE INDEX IF NOT EXISTS idx_visit_plans_email ON visit_plans(visitor_email);
CREATE INDEX IF NOT EXISTS idx_visit_plans_service ON visit_plans(service_time_id, planned_date);
CREATE INDEX IF NOT EXISTS idx_visit_plans_follow_up ON visit_plans(follow_up_completed, next_contact_date) WHERE follow_up_completed = false;
CREATE INDEX IF NOT EXISTS idx_visit_plans_reminders ON visit_plans(status, planned_date) WHERE status IN ('planned', 'confirmed');
CREATE INDEX IF NOT EXISTS idx_visit_plans_chat_source ON visit_plans(chat_conversation_id) WHERE chat_conversation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visit_plans_created_at ON visit_plans(created_at DESC);

-- Confirmation tokens indexes
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_token ON visit_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_confirmation_tokens_expires ON visit_confirmation_tokens(expires_at) WHERE used_at IS NULL;

-- Communications indexes
CREATE INDEX IF NOT EXISTS idx_visit_communications_visit ON visit_communications(visit_plan_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_visit_communications_type ON visit_communications(communication_type, status);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_visit_analytics_date_metric ON visit_analytics(date DESC, metric_name);
CREATE INDEX IF NOT EXISTS idx_visit_analytics_service ON visit_analytics(service_time_id, date DESC);

-- First-time visitors indexes
CREATE INDEX IF NOT EXISTS idx_first_visitors_date ON first_time_visitors(first_visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_first_visitors_email ON first_time_visitors(visitor_email);
CREATE INDEX IF NOT EXISTS idx_first_visitors_follow_up ON first_time_visitors(connected_with_staff, became_member);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_visit_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER visit_plans_updated_at BEFORE UPDATE ON visit_plans
    FOR EACH ROW EXECUTE FUNCTION update_visit_updated_at();

CREATE TRIGGER service_times_updated_at BEFORE UPDATE ON service_times
    FOR EACH ROW EXECUTE FUNCTION update_visit_updated_at();

CREATE TRIGGER first_time_visitors_updated_at BEFORE UPDATE ON first_time_visitors
    FOR EACH ROW EXECUTE FUNCTION update_visit_updated_at();

-- Function to generate confirmation tokens
CREATE OR REPLACE FUNCTION generate_visit_confirmation_token()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate confirmation token for new visit plans
    IF NEW.status = 'planned' AND OLD.status IS DISTINCT FROM 'planned' THEN
        INSERT INTO visit_confirmation_tokens (visit_plan_id, token, expires_at)
        VALUES (
            NEW.id,
            encode(gen_random_bytes(32), 'hex'),
            NOW() + INTERVAL '7 days'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate confirmation tokens
CREATE TRIGGER visit_confirmation_token_generation
    AFTER INSERT OR UPDATE ON visit_plans
    FOR EACH ROW EXECUTE FUNCTION generate_visit_confirmation_token();

-- Function to track visit analytics
CREATE OR REPLACE FUNCTION track_visit_analytics()
RETURNS TRIGGER AS $$
DECLARE
    metric_date DATE := CURRENT_DATE;
BEGIN
    -- Track new visit plans
    IF TG_OP = 'INSERT' THEN
        INSERT INTO visit_analytics (date, metric_name, metric_value, service_time_id, dimensions)
        VALUES (metric_date, 'visits_planned', 1, NEW.service_time_id, 
                jsonb_build_object('source', NEW.lead_source, 'party_size', NEW.party_size))
        ON CONFLICT (date, metric_name, service_time_id) 
        DO UPDATE SET metric_value = visit_analytics.metric_value + 1;
        
        RETURN NEW;
    END IF;
    
    -- Track status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'confirmed' THEN
                INSERT INTO visit_analytics (date, metric_name, metric_value, service_time_id)
                VALUES (metric_date, 'visits_confirmed', 1, NEW.service_time_id)
                ON CONFLICT (date, metric_name, service_time_id) 
                DO UPDATE SET metric_value = visit_analytics.metric_value + 1;
                
            WHEN 'attended' THEN
                INSERT INTO visit_analytics (date, metric_name, metric_value, service_time_id)
                VALUES (metric_date, 'visits_attended', 1, NEW.service_time_id)
                ON CONFLICT (date, metric_name, service_time_id) 
                DO UPDATE SET metric_value = visit_analytics.metric_value + 1;
                
            WHEN 'no_show' THEN
                INSERT INTO visit_analytics (date, metric_name, metric_value, service_time_id)
                VALUES (metric_date, 'visits_no_show', 1, NEW.service_time_id)
                ON CONFLICT (date, metric_name, service_time_id) 
                DO UPDATE SET metric_value = visit_analytics.metric_value + 1;
                
            WHEN 'cancelled' THEN
                INSERT INTO visit_analytics (date, metric_name, metric_value, service_time_id)
                VALUES (metric_date, 'visits_cancelled', 1, NEW.service_time_id)
                ON CONFLICT (date, metric_name, service_time_id) 
                DO UPDATE SET metric_value = visit_analytics.metric_value + 1;
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for analytics tracking
CREATE TRIGGER visit_analytics_tracking
    AFTER INSERT OR UPDATE ON visit_plans
    FOR EACH ROW EXECUTE FUNCTION track_visit_analytics();

-- Function to clean up expired confirmation tokens
CREATE OR REPLACE FUNCTION cleanup_expired_confirmation_tokens()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM visit_confirmation_tokens 
    WHERE expires_at < NOW() AND used_at IS NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DEFAULT DATA
-- =============================================================================

-- Default service times (adjust as needed)
INSERT INTO service_times (name, day_of_week, start_time, end_time, description, service_type, capacity, special_notes) VALUES
('Sunday Morning Worship', 0, '09:00', '10:30', 'Traditional worship service with hymns and choir', 'worship', 300, 'Childcare available for ages 0-5. Coffee and fellowship after service.'),
('Sunday Morning Contemporary', 0, '11:00', '12:30', 'Contemporary worship with modern music and casual atmosphere', 'worship', 350, 'Childcare available. Kids church for ages 6-12. Come as you are!'),
('Sunday Evening Service', 0, '18:00', '19:30', 'Intimate evening worship and teaching', 'worship', 150, 'More relaxed atmosphere, great for visitors'),
('Wednesday Bible Study', 3, '19:00', '20:30', 'Midweek Bible study and prayer', 'bible_study', 100, 'All ages welcome. Study materials provided.'),
('Friday Youth Service', 5, '19:00', '21:00', 'High-energy service for teens and young adults', 'youth', 80, 'Ages 13-25. Pizza and games after service.')
ON CONFLICT DO NOTHING;

-- Default reminder schedules
INSERT INTO visit_reminder_schedules (name, days_before, hours_before, reminder_type, template_type, order_index) VALUES
('Immediate Confirmation', 0, 0, 'email', 'confirmation', 1),
('3 Days Before Reminder', 3, 0, 'email', 'reminder', 2),
('1 Day Before Reminder', 1, 0, 'both', 'reminder', 3),
('2 Hours Before SMS', 0, 2, 'sms', 'reminder', 4),
('Post-Visit Follow-up', -1, 0, 'email', 'follow_up', 5) -- Negative means days after
ON CONFLICT DO NOTHING;

-- =============================================================================
-- VIEWS FOR REPORTING
-- =============================================================================

-- Active visit plans view
CREATE OR REPLACE VIEW active_visit_plans AS
SELECT 
    vp.*,
    st.name as service_name,
    st.start_time,
    st.end_time,
    st.location,
    vct.token as confirmation_token,
    vct.expires_at as token_expires_at
FROM visit_plans vp
LEFT JOIN service_times st ON vp.service_time_id = st.id
LEFT JOIN visit_confirmation_tokens vct ON vp.id = vct.visit_plan_id AND vct.used_at IS NULL
WHERE vp.status IN ('planned', 'confirmed')
  AND vp.planned_date >= CURRENT_DATE;

-- Visit statistics view
CREATE OR REPLACE VIEW visit_statistics AS
SELECT 
    DATE(vp.planned_date) as visit_date,
    st.name as service_name,
    COUNT(*) as total_planned,
    COUNT(*) FILTER (WHERE vp.status = 'confirmed') as confirmed,
    COUNT(*) FILTER (WHERE vp.status = 'attended') as attended,
    COUNT(*) FILTER (WHERE vp.status = 'no_show') as no_shows,
    COUNT(*) FILTER (WHERE vp.status = 'cancelled') as cancelled,
    AVG(vp.party_size) as avg_party_size,
    SUM(vp.party_size) FILTER (WHERE vp.status = 'attended') as total_attendance
FROM visit_plans vp
LEFT JOIN service_times st ON vp.service_time_id = st.id
WHERE vp.planned_date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE(vp.planned_date), st.name, st.start_time
ORDER BY visit_date DESC, st.start_time;

-- Conversion funnel view
CREATE OR REPLACE VIEW visit_conversion_funnel AS
WITH funnel_data AS (
    SELECT 
        COUNT(*) as total_visits,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_visits,
        COUNT(*) FILTER (WHERE status = 'attended') as attended_visits,
        COUNT(*) FILTER (WHERE follow_up_completed = true) as followed_up,
        COUNT(*) FILTER (WHERE interested_in_membership = true) as interested_membership
    FROM visit_plans
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
    'Total Visit Plans' as stage,
    total_visits as count,
    100.0 as percentage
FROM funnel_data
UNION ALL
SELECT 
    'Confirmed' as stage,
    confirmed_visits as count,
    ROUND(100.0 * confirmed_visits / NULLIF(total_visits, 0), 2) as percentage
FROM funnel_data
UNION ALL
SELECT 
    'Attended' as stage,
    attended_visits as count,
    ROUND(100.0 * attended_visits / NULLIF(total_visits, 0), 2) as percentage
FROM funnel_data
UNION ALL
SELECT 
    'Follow-up Completed' as stage,
    followed_up as count,
    ROUND(100.0 * followed_up / NULLIF(attended_visits, 0), 2) as percentage
FROM funnel_data
UNION ALL
SELECT 
    'Interested in Membership' as stage,
    interested_membership as count,
    ROUND(100.0 * interested_membership / NULLIF(attended_visits, 0), 2) as percentage
FROM funnel_data;