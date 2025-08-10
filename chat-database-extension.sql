-- AI-Powered Chat System Database Extension
-- Extends the existing church management database with chat functionality

-- =============================================================================
-- CHAT SYSTEM TABLES (Add to tenant schema creation function)
-- =============================================================================

-- This script should be integrated into the create_tenant_schema function
-- Replace the existing chat tables in database-setup.sql with these enhanced versions

-- Enhanced chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    session_id VARCHAR(255) NOT NULL,
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    conversation_type VARCHAR(20) DEFAULT 'support', -- support, prayer, information, emergency, sales
    source VARCHAR(50) DEFAULT 'website_widget', -- website_widget, mobile_app, facebook, sms
    status VARCHAR(20) DEFAULT 'active', -- active, resolved, transferred, abandoned, waiting_human
    priority VARCHAR(10) DEFAULT 'normal', -- low, normal, high, urgent
    assigned_to UUID REFERENCES shared.tenant_users(id),
    lead_score INTEGER DEFAULT 0, -- 0-100 lead scoring
    visitor_intent VARCHAR(50), -- detected primary intent
    visitor_satisfaction JSONB DEFAULT '{}', -- satisfaction tracking
    escalation_reason VARCHAR(100), -- why escalated to human
    tags VARCHAR[] DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    first_response_at TIMESTAMPTZ, -- Time of first AI/staff response
    resolution_time_minutes INTEGER, -- Total time to resolve
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    rating INTEGER, -- 1-5 satisfaction rating
    feedback TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    analytics_data JSONB DEFAULT '{}', -- Session analytics
    metadata JSONB DEFAULT '{}', -- Additional conversation metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_type VARCHAR(20) NOT NULL, -- user, ai, staff, system, bot
    sender_id UUID, -- member_id or staff_id, null for AI/system
    sender_name VARCHAR(255), -- Display name
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system, quick_reply, form, action_button
    message_subtype VARCHAR(50), -- ai_response, human_handoff, info_collection, satisfaction_survey
    message_data JSONB DEFAULT '{}', -- Additional message data (file URLs, quick replies, AI metadata)
    ai_confidence DECIMAL(3,2), -- AI confidence score 0.00-1.00
    ai_intent VARCHAR(50), -- Detected intent for this message
    processing_time_ms INTEGER, -- Time taken to generate response
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    parent_message_id UUID REFERENCES chat_messages(id), -- For threaded conversations
    reaction_counts JSONB DEFAULT '{}', -- Like, helpful, etc.
    flagged BOOLEAN DEFAULT false,
    flag_reason VARCHAR(100),
    search_vector tsvector, -- Full-text search
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI chat analytics table
CREATE TABLE IF NOT EXISTS chat_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    metric_name VARCHAR(100) NOT NULL, -- intent_detected, response_generated, escalated, etc.
    metric_value JSONB NOT NULL,
    confidence_score DECIMAL(3,2),
    processing_time_ms INTEGER,
    ai_model_used VARCHAR(50), -- gpt-4, claude-3, etc.
    cost_cents INTEGER, -- API cost in cents
    session_data JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visitor lead scoring table
CREATE TABLE IF NOT EXISTS visitor_lead_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    visitor_email VARCHAR(255),
    lead_score INTEGER DEFAULT 0, -- 0-100
    score_factors JSONB DEFAULT '{}', -- What contributed to the score
    engagement_level VARCHAR(20) DEFAULT 'low', -- low, medium, high, very_high
    visit_likelihood VARCHAR(20) DEFAULT 'unknown', -- unlikely, possible, likely, very_likely
    follow_up_priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
    suggested_actions VARCHAR[] DEFAULT '{}',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI training data table
CREATE TABLE IF NOT EXISTS ai_training_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    input_text TEXT NOT NULL,
    expected_intent VARCHAR(50),
    expected_response TEXT,
    actual_intent VARCHAR(50),
    actual_response TEXT,
    feedback_score INTEGER, -- -1 (bad), 0 (neutral), 1 (good)
    human_correction TEXT, -- Staff correction of AI response
    training_source VARCHAR(50) DEFAULT 'conversation', -- conversation, manual_entry, import
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES shared.tenant_users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat templates for common responses
CREATE TABLE IF NOT EXISTS chat_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- greeting, service_times, directions, etc.
    trigger_intents VARCHAR[] DEFAULT '{}', -- Which intents should use this template
    template_text TEXT NOT NULL,
    variables JSONB DEFAULT '{}', -- Template variables
    usage_count INTEGER DEFAULT 0,
    effectiveness_score DECIMAL(3,2) DEFAULT 0.00, -- Based on user feedback
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat escalation rules
CREATE TABLE IF NOT EXISTS chat_escalation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(255) NOT NULL,
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    trigger_conditions JSONB NOT NULL, -- Conditions that trigger escalation
    escalation_action VARCHAR(50) NOT NULL, -- assign_staff, send_notification, create_task
    target_staff_id UUID REFERENCES shared.tenant_users(id),
    target_role VARCHAR(50), -- pastor, counselor, admin, etc.
    notification_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation tags for categorization
CREATE TABLE IF NOT EXISTS conversation_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    tag_type VARCHAR(30) DEFAULT 'manual', -- manual, auto, ai_suggested
    confidence_score DECIMAL(3,2), -- For AI-suggested tags
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, tag_name)
);

-- Quick reply buttons
CREATE TABLE IF NOT EXISTS chat_quick_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- welcome, service_info, visit_planning, etc.
    reply_text VARCHAR(255) NOT NULL,
    response_intent VARCHAR(50), -- What intent this should trigger
    response_template_id UUID REFERENCES chat_templates(id),
    order_index INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    click_through_rate DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Staff chat performance metrics
CREATE TABLE IF NOT EXISTS staff_chat_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES shared.tenant_users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    conversations_handled INTEGER DEFAULT 0,
    average_response_time_minutes DECIMAL(8,2) DEFAULT 0,
    satisfaction_rating DECIMAL(3,2) DEFAULT 0,
    escalations_received INTEGER DEFAULT 0,
    escalations_resolved INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    online_time_minutes INTEGER DEFAULT 0,
    metrics_data JSONB DEFAULT '{}',
    UNIQUE(staff_id, date)
);

-- =============================================================================
-- INDEXES FOR CHAT TABLES
-- =============================================================================

-- Chat conversations indexes
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_visitor_email ON chat_conversations(visitor_email) WHERE visitor_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status, priority);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_assigned ON chat_conversations(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_activity ON chat_conversations(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_intent ON chat_conversations(visitor_intent) WHERE visitor_intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_lead_score ON chat_conversations(lead_score DESC) WHERE lead_score > 0;
CREATE INDEX IF NOT EXISTS idx_chat_conversations_created_at ON chat_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_follow_up ON chat_conversations(follow_up_required, follow_up_date) WHERE follow_up_required = true;

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_type, sender_id) WHERE sender_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_type ON chat_messages(message_type, message_subtype);
CREATE INDEX IF NOT EXISTS idx_chat_messages_intent ON chat_messages(ai_intent) WHERE ai_intent IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_confidence ON chat_messages(ai_confidence DESC) WHERE ai_confidence IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(is_read, created_at) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON chat_messages USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged ON chat_messages(flagged, flag_reason) WHERE flagged = true;

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_chat_analytics_conversation ON chat_analytics(conversation_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_metric ON chat_analytics(metric_name, recorded_at);
CREATE INDEX IF NOT EXISTS idx_chat_analytics_cost ON chat_analytics(cost_cents, recorded_at) WHERE cost_cents > 0;

-- Lead scoring indexes
CREATE INDEX IF NOT EXISTS idx_visitor_lead_scores_email ON visitor_lead_scores(visitor_email) WHERE visitor_email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_visitor_lead_scores_score ON visitor_lead_scores(lead_score DESC, engagement_level);
CREATE INDEX IF NOT EXISTS idx_visitor_lead_scores_priority ON visitor_lead_scores(follow_up_priority, last_updated);

-- Staff metrics indexes
CREATE INDEX IF NOT EXISTS idx_staff_chat_metrics_staff_date ON staff_chat_metrics(staff_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_staff_chat_metrics_performance ON staff_chat_metrics(satisfaction_rating DESC, date DESC);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update search vector for messages
CREATE OR REPLACE FUNCTION update_chat_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', 
        COALESCE(NEW.sender_name, '') || ' ' || 
        COALESCE(NEW.message_text, '') || ' ' || 
        COALESCE(NEW.ai_intent, '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update search vector
CREATE TRIGGER chat_message_search_vector_update
    BEFORE INSERT OR UPDATE ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_chat_message_search_vector();

-- Function to calculate lead score
CREATE OR REPLACE FUNCTION calculate_lead_score(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    message_count INTEGER;
    response_time INTEGER;
    has_contact_info BOOLEAN;
    visit_interest BOOLEAN;
    prayer_request BOOLEAN;
    ministry_interest BOOLEAN;
BEGIN
    -- Get conversation data
    SELECT 
        (SELECT COUNT(*) FROM chat_messages WHERE conversation_id = p_conversation_id AND sender_type = 'user'),
        EXTRACT(EPOCH FROM (ended_at - started_at))/60,
        visitor_email IS NOT NULL OR visitor_phone IS NOT NULL,
        visitor_intent LIKE '%visit%' OR visitor_intent LIKE '%service%',
        visitor_intent LIKE '%prayer%',
        visitor_intent LIKE '%ministry%' OR visitor_intent LIKE '%volunteer%'
    INTO message_count, response_time, has_contact_info, visit_interest, prayer_request, ministry_interest
    FROM chat_conversations 
    WHERE id = p_conversation_id;
    
    -- Score based on engagement (message count)
    score := score + LEAST(message_count * 5, 25);
    
    -- Score based on session length
    IF response_time > 5 THEN
        score := score + 15;
    ELSIF response_time > 2 THEN
        score := score + 10;
    END IF;
    
    -- Score for providing contact info
    IF has_contact_info THEN
        score := score + 20;
    END IF;
    
    -- Score for specific intents
    IF visit_interest THEN
        score := score + 25;
    END IF;
    
    IF prayer_request THEN
        score := score + 15;
    END IF;
    
    IF ministry_interest THEN
        score := score + 20;
    END IF;
    
    -- Cap score at 100
    RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update conversation stats
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
DECLARE
    first_response TIMESTAMPTZ;
    resolution_time INTEGER;
BEGIN
    -- Update last activity
    UPDATE chat_conversations 
    SET last_activity_at = NEW.created_at,
        updated_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    
    -- Set first response time for AI/staff messages
    IF NEW.sender_type IN ('ai', 'staff') THEN
        SELECT first_response_at INTO first_response
        FROM chat_conversations 
        WHERE id = NEW.conversation_id;
        
        IF first_response IS NULL THEN
            UPDATE chat_conversations 
            SET first_response_at = NEW.created_at
            WHERE id = NEW.conversation_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation stats
CREATE TRIGGER chat_message_stats_update
    AFTER INSERT ON chat_messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Function to update lead score on conversation end
CREATE OR REPLACE FUNCTION update_lead_score_on_end()
RETURNS TRIGGER AS $$
DECLARE
    calculated_score INTEGER;
BEGIN
    -- Only calculate when conversation is ending
    IF OLD.status != 'resolved' AND NEW.status = 'resolved' THEN
        calculated_score := calculate_lead_score(NEW.id);
        
        -- Update conversation lead score
        NEW.lead_score := calculated_score;
        
        -- Calculate resolution time
        IF NEW.started_at IS NOT NULL AND NEW.ended_at IS NOT NULL THEN
            NEW.resolution_time_minutes := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))/60;
        END IF;
        
        -- Insert/update visitor lead score
        INSERT INTO visitor_lead_scores (
            conversation_id, visitor_email, lead_score, 
            engagement_level, visit_likelihood, follow_up_priority
        ) VALUES (
            NEW.id, NEW.visitor_email, calculated_score,
            CASE 
                WHEN calculated_score >= 80 THEN 'very_high'
                WHEN calculated_score >= 60 THEN 'high'
                WHEN calculated_score >= 40 THEN 'medium'
                ELSE 'low'
            END,
            CASE 
                WHEN calculated_score >= 70 THEN 'very_likely'
                WHEN calculated_score >= 50 THEN 'likely'
                WHEN calculated_score >= 30 THEN 'possible'
                ELSE 'unlikely'
            END,
            CASE 
                WHEN calculated_score >= 80 THEN 'urgent'
                WHEN calculated_score >= 60 THEN 'high'
                WHEN calculated_score >= 40 THEN 'normal'
                ELSE 'low'
            END
        )
        ON CONFLICT (conversation_id) DO UPDATE SET
            lead_score = EXCLUDED.lead_score,
            engagement_level = EXCLUDED.engagement_level,
            visit_likelihood = EXCLUDED.visit_likelihood,
            follow_up_priority = EXCLUDED.follow_up_priority,
            last_updated = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lead score
CREATE TRIGGER conversation_lead_score_update
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION update_lead_score_on_end();

-- =============================================================================
-- DEFAULT DATA FOR CHAT SYSTEM
-- =============================================================================

-- Default chat templates
INSERT INTO chat_templates (name, category, trigger_intents, template_text, variables) VALUES
('Welcome Message', 'greeting', ARRAY['general_greeting', 'welcome'], 
 'Welcome to {{church_name}}! I''m here to help answer your questions and connect you with our church community. How can I assist you today?', 
 '{"church_name": "Our Church"}'),
 
('Service Times', 'service_info', ARRAY['service_times', 'worship_schedule'], 
 'Our worship services are: {{service_times}}. We''d love to have you join us! Would you like help planning your first visit?', 
 '{"service_times": "Sunday 9:00 AM and 11:00 AM"}'),
 
('Visit Planning', 'visit_planning', ARRAY['first_visit_planning', 'directions'], 
 'We''re so excited you''re considering visiting {{church_name}}! I''d love to help you plan your visit. What would you like to know about what to expect?', 
 '{"church_name": "Our Church"}'),
 
('Kids Programs', 'children', ARRAY['kids_programs', 'children_ministry'], 
 'We have wonderful programs for children of all ages! {{kids_info}} Would you like to know more about any specific age group?', 
 '{"kids_info": "Our children\'s ministry includes nursery, preschool, and elementary programs."}'),
 
('Prayer Request', 'prayer', ARRAY['prayer_request', 'pastoral_care'], 
 'I''d be honored to add your prayer request to our prayer list. Would you like to share what you''d like prayer for?', 
 '{}'),
 
('Human Handoff', 'escalation', ARRAY['speak_to_pastor', 'human_assistance'], 
 'I''m connecting you with one of our team members who can help you personally. They should be with you shortly!', 
 '{}');

-- Default quick replies
INSERT INTO chat_quick_replies (category, reply_text, response_intent, order_index) VALUES
('welcome', 'What are your service times?', 'service_times', 1),
('welcome', 'I''d like to plan a visit', 'first_visit_planning', 2),
('welcome', 'Tell me about kids programs', 'kids_programs', 3),
('welcome', 'How can I get involved?', 'ministry_involvement', 4),
('welcome', 'I have a prayer request', 'prayer_request', 5),
('welcome', 'I need to speak with someone', 'contact_pastor', 6);

-- Default escalation rules
INSERT INTO chat_escalation_rules (rule_name, priority, trigger_conditions, escalation_action, target_role, notification_message) VALUES
('Emergency Keywords', 100, 
 '{"keywords": ["emergency", "crisis", "urgent", "help me", "suicide"], "match_type": "any"}',
 'assign_staff', 'pastor', 'URGENT: Visitor may need immediate assistance'),
 
('Long Conversation', 50, 
 '{"message_count": 15, "no_resolution": true}',
 'send_notification', 'staff', 'Long conversation may need human assistance'),
 
('High Lead Score', 75, 
 '{"lead_score_threshold": 70, "contact_info_provided": true}',
 'send_notification', 'pastor', 'High-value visitor - consider personal follow-up'),
 
('Prayer Request Urgent', 80, 
 '{"intent": "prayer_request", "keywords": ["urgent", "hospital", "dying", "funeral"]}',
 'assign_staff', 'pastor', 'Urgent prayer request needs pastoral attention');

-- =============================================================================
-- ANALYTICS AND REPORTING VIEWS
-- =============================================================================

-- Daily chat statistics view
CREATE OR REPLACE VIEW daily_chat_stats AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_conversations,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_conversations,
    COUNT(*) FILTER (WHERE assigned_to IS NOT NULL) as human_assisted,
    AVG(lead_score) FILTER (WHERE lead_score > 0) as avg_lead_score,
    AVG(rating) FILTER (WHERE rating IS NOT NULL) as avg_satisfaction,
    AVG(resolution_time_minutes) FILTER (WHERE resolution_time_minutes IS NOT NULL) as avg_resolution_time
FROM chat_conversations
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Popular intents view
CREATE OR REPLACE VIEW popular_intents AS
SELECT 
    ai_intent,
    COUNT(*) as frequency,
    AVG(ai_confidence) as avg_confidence,
    COUNT(DISTINCT conversation_id) as unique_conversations
FROM chat_messages 
WHERE ai_intent IS NOT NULL 
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY ai_intent
ORDER BY frequency DESC;

-- Staff performance view
CREATE OR REPLACE VIEW staff_chat_performance AS
SELECT 
    u.first_name || ' ' || u.last_name as staff_name,
    COUNT(DISTINCT c.id) as conversations_handled,
    AVG(c.rating) FILTER (WHERE c.rating IS NOT NULL) as avg_satisfaction,
    AVG(c.resolution_time_minutes) FILTER (WHERE c.resolution_time_minutes IS NOT NULL) as avg_resolution_time,
    COUNT(*) FILTER (WHERE c.created_at >= CURRENT_DATE - INTERVAL '7 days') as conversations_this_week
FROM shared.tenant_users u
LEFT JOIN chat_conversations c ON u.id = c.assigned_to
WHERE u.role IN ('staff', 'pastor', 'admin')
GROUP BY u.id, u.first_name, u.last_name
ORDER BY conversations_handled DESC;

-- =============================================================================
-- CLEANUP AND MAINTENANCE FUNCTIONS
-- =============================================================================

-- Function to archive old conversations
CREATE OR REPLACE FUNCTION archive_old_conversations(days_old INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Archive conversations older than specified days
    WITH archived AS (
        UPDATE chat_conversations 
        SET metadata = metadata || '{"archived": true}',
            updated_at = NOW()
        WHERE created_at < NOW() - (days_old || ' days')::INTERVAL
          AND status IN ('resolved', 'abandoned')
          AND (metadata->>'archived')::boolean IS NOT TRUE
        RETURNING id
    )
    SELECT COUNT(*) INTO archived_count FROM archived;
    
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old analytics data
CREATE OR REPLACE FUNCTION cleanup_chat_analytics(days_old INTEGER DEFAULT 180)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete old analytics data
    DELETE FROM chat_analytics 
    WHERE recorded_at < NOW() - (days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update template effectiveness scores
CREATE OR REPLACE FUNCTION update_template_effectiveness()
RETURNS VOID AS $$
BEGIN
    -- Update effectiveness based on conversation outcomes
    UPDATE chat_templates ct
    SET effectiveness_score = (
        SELECT COALESCE(AVG(c.rating)::decimal(3,2), 0.00)
        FROM chat_messages cm
        JOIN chat_conversations c ON cm.conversation_id = c.id
        WHERE cm.message_data->>'template_id' = ct.id::text
          AND c.rating IS NOT NULL
          AND cm.created_at >= NOW() - INTERVAL '30 days'
    ),
    updated_at = NOW()
    WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Schedule regular maintenance (add to cron or scheduled jobs)
-- SELECT archive_old_conversations(90);
-- SELECT cleanup_chat_analytics(180);
-- SELECT update_template_effectiveness();