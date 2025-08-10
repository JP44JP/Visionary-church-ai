-- Follow-up Sequences Database Extension
-- PostgreSQL 15+

-- =============================================================================
-- SEQUENCE SYSTEM TABLES (for tenant schemas)
-- =============================================================================

-- Add to the tenant schema creation function in database-setup.sql
-- This adds new tables to each tenant schema for follow-up sequences

CREATE OR REPLACE FUNCTION shared.add_sequence_tables_to_tenant(p_schema_name VARCHAR(100))
RETURNS VOID AS $$
DECLARE
    sql_statement TEXT;
BEGIN
    sql_statement := format('
        -- Email/SMS sequence definitions
        CREATE TABLE %I.follow_up_sequences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            sequence_type VARCHAR(50) NOT NULL, -- welcome, pre_visit, post_visit, missed_visit, prayer_followup, birthday, anniversary
            trigger_event VARCHAR(100) NOT NULL, -- new_member, visit_scheduled, visit_completed, visit_missed, prayer_request_created
            trigger_conditions JSONB DEFAULT ''{}''::jsonb, -- Conditions that must be met to trigger
            is_active BOOLEAN DEFAULT true,
            start_delay_minutes INTEGER DEFAULT 0, -- Delay before first message
            max_enrollments INTEGER, -- Max concurrent enrollments (null = unlimited)
            enrollment_window_hours INTEGER DEFAULT 24, -- Window to prevent duplicate enrollments
            priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
            tags VARCHAR[] DEFAULT ''{}''::varchar[], -- For categorization
            created_by UUID REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            version INTEGER DEFAULT 1 -- For A/B testing
        );

        -- Individual steps within sequences (emails/SMS)
        CREATE TABLE %I.sequence_steps (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID NOT NULL REFERENCES %I.follow_up_sequences(id) ON DELETE CASCADE,
            step_order INTEGER NOT NULL, -- Order within sequence
            step_type VARCHAR(20) NOT NULL, -- email, sms, internal_task, webhook
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(255), -- For emails
            content_template TEXT NOT NULL, -- Template with variables
            delay_after_previous INTEGER NOT NULL, -- Minutes after previous step
            send_conditions JSONB DEFAULT ''{}''::jsonb, -- Conditions to send this step
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(sequence_id, step_order)
        );

        -- Template library for reusable content
        CREATE TABLE %I.message_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            category VARCHAR(50) NOT NULL, -- welcome, reminder, thank_you, followup, promotional
            template_type VARCHAR(20) NOT NULL, -- email, sms
            subject VARCHAR(255), -- For emails only
            content TEXT NOT NULL,
            variables VARCHAR[] DEFAULT ''{}''::varchar[], -- Available template variables
            language VARCHAR(10) DEFAULT ''en'', -- Language code
            is_default BOOLEAN DEFAULT false, -- Default template for category
            usage_count INTEGER DEFAULT 0, -- Track template usage
            created_by UUID REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- User enrollments in sequences
        CREATE TABLE %I.sequence_enrollments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID NOT NULL REFERENCES %I.follow_up_sequences(id) ON DELETE CASCADE,
            member_id UUID REFERENCES %I.members(id) ON DELETE CASCADE,
            visitor_id UUID REFERENCES %I.visits(id) ON DELETE SET NULL, -- Link to specific visit if applicable
            prayer_request_id UUID REFERENCES %I.prayer_requests(id) ON DELETE SET NULL, -- Link to prayer request
            enrollment_trigger VARCHAR(100) NOT NULL, -- What triggered this enrollment
            enrollment_data JSONB DEFAULT ''{}''::jsonb, -- Data for template personalization
            status VARCHAR(20) DEFAULT ''active'', -- active, paused, completed, cancelled
            current_step INTEGER DEFAULT 0, -- Current step in sequence
            enrolled_at TIMESTAMPTZ DEFAULT NOW(),
            next_send_at TIMESTAMPTZ, -- When next message should be sent
            completed_at TIMESTAMPTZ,
            cancelled_at TIMESTAMPTZ,
            cancel_reason VARCHAR(255),
            priority_boost INTEGER DEFAULT 0, -- Temporary priority adjustment
            metadata JSONB DEFAULT ''{}''::jsonb -- Additional enrollment metadata
        );

        -- Message delivery queue and history
        CREATE TABLE %I.sequence_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            enrollment_id UUID NOT NULL REFERENCES %I.sequence_enrollments(id) ON DELETE CASCADE,
            step_id UUID NOT NULL REFERENCES %I.sequence_steps(id) ON DELETE SET NULL,
            message_type VARCHAR(20) NOT NULL, -- email, sms
            recipient_email VARCHAR(255),
            recipient_phone VARCHAR(20),
            recipient_name VARCHAR(255),
            subject VARCHAR(255), -- Processed subject line
            content TEXT NOT NULL, -- Processed message content
            status VARCHAR(20) DEFAULT ''pending'', -- pending, sent, delivered, bounced, failed, opened, clicked
            priority INTEGER DEFAULT 0,
            scheduled_for TIMESTAMPTZ NOT NULL,
            sent_at TIMESTAMPTZ,
            delivered_at TIMESTAMPTZ,
            opened_at TIMESTAMPTZ,
            clicked_at TIMESTAMPTZ,
            bounced_at TIMESTAMPTZ,
            failed_at TIMESTAMPTZ,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            error_message TEXT,
            external_id VARCHAR(255), -- ID from email/SMS service
            delivery_metadata JSONB DEFAULT ''{}''::jsonb,
            tracking_data JSONB DEFAULT ''{}''::jsonb, -- Open/click tracking data
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- A/B testing for sequences
        CREATE TABLE %I.sequence_variants (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID NOT NULL REFERENCES %I.follow_up_sequences(id) ON DELETE CASCADE,
            variant_name VARCHAR(100) NOT NULL,
            description TEXT,
            traffic_percentage INTEGER DEFAULT 50, -- Percentage of traffic for this variant
            is_active BOOLEAN DEFAULT true,
            changes JSONB NOT NULL, -- JSON describing changes from base sequence
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(sequence_id, variant_name)
        );

        -- User preferences and unsubscribe management
        CREATE TABLE %I.communication_preferences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID REFERENCES %I.members(id) ON DELETE CASCADE,
            visitor_email VARCHAR(255), -- For non-members
            email_enabled BOOLEAN DEFAULT true,
            sms_enabled BOOLEAN DEFAULT true,
            sequence_types VARCHAR[] DEFAULT ''{}''::varchar[], -- Which sequence types they''ve opted out of
            unsubscribed_from VARCHAR[] DEFAULT ''{}''::varchar[], -- Specific sequence IDs
            global_unsubscribe BOOLEAN DEFAULT false, -- Unsubscribed from all communications
            preferred_language VARCHAR(10) DEFAULT ''en'',
            timezone VARCHAR(50) DEFAULT ''UTC'',
            quiet_hours JSONB DEFAULT ''{"start": "22:00", "end": "08:00"}''::jsonb,
            unsubscribe_token VARCHAR(255) UNIQUE, -- For one-click unsubscribe
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(member_id),
            UNIQUE(visitor_email)
        );

        -- Analytics and performance tracking
        CREATE TABLE %I.sequence_analytics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID NOT NULL REFERENCES %I.follow_up_sequences(id) ON DELETE CASCADE,
            variant_id UUID REFERENCES %I.sequence_variants(id) ON DELETE SET NULL,
            metric_date DATE NOT NULL,
            enrollments INTEGER DEFAULT 0,
            messages_sent INTEGER DEFAULT 0,
            messages_delivered INTEGER DEFAULT 0,
            messages_opened INTEGER DEFAULT 0,
            messages_clicked INTEGER DEFAULT 0,
            messages_bounced INTEGER DEFAULT 0,
            unsubscribes INTEGER DEFAULT 0,
            conversions INTEGER DEFAULT 0, -- Goal completions (visits, donations, etc.)
            revenue DECIMAL(10,2) DEFAULT 0, -- Revenue attributed to sequence
            calculated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(sequence_id, variant_id, metric_date)
        );

        -- Webhook configurations for external integrations
        CREATE TABLE %I.sequence_webhooks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID NOT NULL REFERENCES %I.follow_up_sequences(id) ON DELETE CASCADE,
            webhook_url VARCHAR(500) NOT NULL,
            webhook_events VARCHAR[] DEFAULT ''{}''::varchar[], -- enrolled, completed, message_sent, etc.
            webhook_secret VARCHAR(255), -- For signature verification
            is_active BOOLEAN DEFAULT true,
            retry_on_failure BOOLEAN DEFAULT true,
            max_retries INTEGER DEFAULT 3,
            headers JSONB DEFAULT ''{}''::jsonb, -- Additional HTTP headers
            created_at TIMESTAMPTZ DEFAULT NOW()
        );

        -- Delivery service configurations
        CREATE TABLE %I.delivery_providers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            provider_name VARCHAR(50) NOT NULL, -- sendgrid, mailgun, twilio, etc.
            provider_type VARCHAR(20) NOT NULL, -- email, sms
            is_active BOOLEAN DEFAULT false,
            is_default BOOLEAN DEFAULT false,
            priority INTEGER DEFAULT 0, -- Higher = preferred
            configuration JSONB NOT NULL, -- API keys, settings, etc.
            rate_limits JSONB DEFAULT ''{}''::jsonb, -- Rate limiting rules
            created_by UUID REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(provider_type, is_default) DEFERRABLE INITIALLY DEFERRED -- Only one default per type
        );

        -- Smart send time optimization
        CREATE TABLE %I.send_time_optimization (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID REFERENCES %I.members(id) ON DELETE CASCADE,
            visitor_email VARCHAR(255),
            optimal_send_hour INTEGER DEFAULT 10, -- Best hour to send (0-23)
            optimal_send_day VARCHAR(10) DEFAULT ''tuesday'', -- Best day of week
            timezone VARCHAR(50) DEFAULT ''UTC'',
            confidence_score DECIMAL(3,2) DEFAULT 0.5, -- Confidence in optimization (0-1)
            data_points INTEGER DEFAULT 0, -- Number of interactions used for optimization
            last_calculated TIMESTAMPTZ DEFAULT NOW(),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(member_id),
            UNIQUE(visitor_email)
        );
    ', p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name);

    EXECUTE sql_statement;

    -- Create indexes for performance
    sql_statement := format('
        -- Sequence indexes
        CREATE INDEX idx_%s_sequences_trigger ON %I.follow_up_sequences(trigger_event, is_active);
        CREATE INDEX idx_%s_sequences_type ON %I.follow_up_sequences(sequence_type, is_active);
        
        -- Step indexes
        CREATE INDEX idx_%s_steps_sequence ON %I.sequence_steps(sequence_id, step_order);
        CREATE INDEX idx_%s_steps_active ON %I.sequence_steps(is_active);
        
        -- Template indexes
        CREATE INDEX idx_%s_templates_category ON %I.message_templates(category, template_type);
        CREATE INDEX idx_%s_templates_language ON %I.message_templates(language);
        
        -- Enrollment indexes
        CREATE INDEX idx_%s_enrollments_member ON %I.sequence_enrollments(member_id, status);
        CREATE INDEX idx_%s_enrollments_sequence ON %I.sequence_enrollments(sequence_id, status);
        CREATE INDEX idx_%s_enrollments_next_send ON %I.sequence_enrollments(next_send_at) WHERE status = ''active'';
        CREATE INDEX idx_%s_enrollments_visitor ON %I.sequence_enrollments(visitor_id);
        CREATE INDEX idx_%s_enrollments_prayer ON %I.sequence_enrollments(prayer_request_id);
        
        -- Message indexes
        CREATE INDEX idx_%s_messages_status ON %I.sequence_messages(status, scheduled_for);
        CREATE INDEX idx_%s_messages_enrollment ON %I.sequence_messages(enrollment_id);
        CREATE INDEX idx_%s_messages_recipient ON %I.sequence_messages(recipient_email);
        CREATE INDEX idx_%s_messages_tracking ON %I.sequence_messages(sent_at, opened_at, clicked_at);
        
        -- Communication preferences indexes
        CREATE INDEX idx_%s_prefs_member ON %I.communication_preferences(member_id);
        CREATE INDEX idx_%s_prefs_email ON %I.communication_preferences(visitor_email);
        CREATE INDEX idx_%s_prefs_unsubscribe ON %I.communication_preferences(global_unsubscribe);
        
        -- Analytics indexes
        CREATE INDEX idx_%s_analytics_sequence ON %I.sequence_analytics(sequence_id, metric_date);
        CREATE INDEX idx_%s_analytics_date ON %I.sequence_analytics(metric_date);
        
        -- Optimization indexes
        CREATE INDEX idx_%s_optimization_member ON %I.send_time_optimization(member_id);
        CREATE INDEX idx_%s_optimization_email ON %I.send_time_optimization(visitor_email);
    ', 
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name,
    p_schema_name, p_schema_name
    );

    EXECUTE sql_statement;

    -- Create triggers
    sql_statement := format('
        CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON %I.follow_up_sequences
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_steps_updated_at BEFORE UPDATE ON %I.sequence_steps
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON %I.message_templates
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON %I.sequence_variants
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_prefs_updated_at BEFORE UPDATE ON %I.communication_preferences
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON %I.delivery_providers
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
    ', 
    p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name
    );

    EXECUTE sql_statement;

END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SEQUENCE PROCESSING FUNCTIONS
-- =============================================================================

-- Function to enroll a user in a sequence
CREATE OR REPLACE FUNCTION shared.enroll_in_sequence(
    p_tenant_schema VARCHAR(100),
    p_sequence_id UUID,
    p_member_id UUID DEFAULT NULL,
    p_visitor_id UUID DEFAULT NULL,
    p_prayer_request_id UUID DEFAULT NULL,
    p_trigger_event VARCHAR(100),
    p_enrollment_data JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_enrollment_id UUID;
    v_next_send_at TIMESTAMPTZ;
    v_sequence_delay INTEGER;
BEGIN
    -- Get sequence delay
    EXECUTE format('SELECT start_delay_minutes FROM %I.follow_up_sequences WHERE id = $1', p_tenant_schema) 
    INTO v_sequence_delay USING p_sequence_id;
    
    -- Calculate next send time
    v_next_send_at := NOW() + (COALESCE(v_sequence_delay, 0) || ' minutes')::INTERVAL;
    
    -- Create enrollment
    EXECUTE format('
        INSERT INTO %I.sequence_enrollments 
        (sequence_id, member_id, visitor_id, prayer_request_id, enrollment_trigger, enrollment_data, next_send_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id', p_tenant_schema)
    INTO v_enrollment_id
    USING p_sequence_id, p_member_id, p_visitor_id, p_prayer_request_id, p_trigger_event, p_enrollment_data, v_next_send_at;
    
    RETURN v_enrollment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process pending messages
CREATE OR REPLACE FUNCTION shared.process_pending_sequences(p_tenant_schema VARCHAR(100))
RETURNS INTEGER AS $$
DECLARE
    v_processed_count INTEGER := 0;
    v_enrollment RECORD;
    v_step RECORD;
    v_message_id UUID;
    v_recipient_info RECORD;
BEGIN
    -- Process each active enrollment that's ready for next message
    FOR v_enrollment IN 
        EXECUTE format('
            SELECT e.*, s.name as sequence_name
            FROM %I.sequence_enrollments e
            JOIN %I.follow_up_sequences s ON e.sequence_id = s.id
            WHERE e.status = ''active'' 
            AND e.next_send_at <= NOW()
            AND s.is_active = true
            ORDER BY e.next_send_at
            LIMIT 100', p_tenant_schema, p_tenant_schema)
    LOOP
        -- Get next step in sequence
        EXECUTE format('
            SELECT * FROM %I.sequence_steps 
            WHERE sequence_id = $1 
            AND step_order = $2 
            AND is_active = true', p_tenant_schema)
        INTO v_step
        USING v_enrollment.sequence_id, v_enrollment.current_step + 1;
        
        IF v_step.id IS NOT NULL THEN
            -- Get recipient information
            EXECUTE format('
                SELECT 
                    COALESCE(m.email, v.visitor_email) as email,
                    COALESCE(m.phone, v.visitor_phone) as phone,
                    COALESCE(m.first_name || '' '' || m.last_name, v.visitor_name) as full_name
                FROM %I.sequence_enrollments e
                LEFT JOIN %I.members m ON e.member_id = m.id
                LEFT JOIN %I.visits v ON e.visitor_id = v.id
                WHERE e.id = $1', p_tenant_schema, p_tenant_schema, p_tenant_schema)
            INTO v_recipient_info
            USING v_enrollment.id;
            
            -- Create message record
            EXECUTE format('
                INSERT INTO %I.sequence_messages 
                (enrollment_id, step_id, message_type, recipient_email, recipient_phone, recipient_name, 
                 subject, content, scheduled_for, priority)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id', p_tenant_schema)
            INTO v_message_id
            USING v_enrollment.id, v_step.id, v_step.step_type, v_recipient_info.email, 
                  v_recipient_info.phone, v_recipient_info.full_name, v_step.subject, 
                  v_step.content_template, NOW(), 0;
            
            -- Update enrollment for next step
            EXECUTE format('
                UPDATE %I.sequence_enrollments 
                SET current_step = $1,
                    next_send_at = CASE 
                        WHEN $2 > 0 THEN NOW() + ($2 || '' minutes'')::INTERVAL
                        ELSE NULL 
                    END
                WHERE id = $3', p_tenant_schema)
            USING v_enrollment.current_step + 1, 
                  COALESCE((SELECT delay_after_previous FROM (
                      SELECT * FROM unnest(string_to_array(format('SELECT delay_after_previous FROM %I.sequence_steps WHERE sequence_id = %L AND step_order = %s', p_tenant_schema, v_enrollment.sequence_id, v_enrollment.current_step + 2), ' ')) 
                  ) AS t(delay_after_previous)), 0),
                  v_enrollment.id;
            
            v_processed_count := v_processed_count + 1;
        ELSE
            -- No more steps, mark as completed
            EXECUTE format('
                UPDATE %I.sequence_enrollments 
                SET status = ''completed'', completed_at = NOW()
                WHERE id = $1', p_tenant_schema)
            USING v_enrollment.id;
        END IF;
    END LOOP;
    
    RETURN v_processed_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- DEFAULT SEQUENCE TEMPLATES
-- =============================================================================

-- Function to create default sequences for new tenants
CREATE OR REPLACE FUNCTION shared.create_default_sequences(p_tenant_schema VARCHAR(100))
RETURNS VOID AS $$
DECLARE
    v_welcome_sequence_id UUID;
    v_pre_visit_sequence_id UUID;
    v_post_visit_sequence_id UUID;
    v_missed_visit_sequence_id UUID;
    v_prayer_sequence_id UUID;
BEGIN
    -- Welcome sequence for new members
    EXECUTE format('
        INSERT INTO %I.follow_up_sequences (name, description, sequence_type, trigger_event, start_delay_minutes)
        VALUES (''New Member Welcome'', ''Welcome new members to the church community'', ''welcome'', ''new_member'', 60)
        RETURNING id', p_tenant_schema)
    INTO v_welcome_sequence_id;
    
    -- Welcome sequence steps
    EXECUTE format('
        INSERT INTO %I.sequence_steps (sequence_id, step_order, step_type, name, subject, content_template, delay_after_previous)
        VALUES 
        ($1, 1, ''email'', ''Welcome Email'', ''Welcome to {{church_name}}!'', 
         ''Dear {{first_name}},\n\nWelcome to {{church_name}}! We''re so excited to have you as part of our church family...'', 0),
        ($1, 2, ''email'', ''Getting Started'', ''Getting Started at {{church_name}}'', 
         ''Hi {{first_name}},\n\nNow that you''re part of our community, here are some ways to get involved...'', 10080),
        ($1, 3, ''email'', ''Connect & Grow'', ''Your Next Steps at {{church_name}}'', 
         ''Hello {{first_name}},\n\nIt''s been two weeks since you joined us! Here are some opportunities to connect and grow...'', 10080)', p_tenant_schema)
    USING v_welcome_sequence_id;
    
    -- Pre-visit reminder sequence
    EXECUTE format('
        INSERT INTO %I.follow_up_sequences (name, description, sequence_type, trigger_event, start_delay_minutes)
        VALUES (''Visit Reminders'', ''Remind visitors about their upcoming visit'', ''pre_visit'', ''visit_scheduled'', 0)
        RETURNING id', p_tenant_schema)
    INTO v_pre_visit_sequence_id;
    
    -- Pre-visit steps
    EXECUTE format('
        INSERT INTO %I.sequence_steps (sequence_id, step_order, step_type, name, subject, content_template, delay_after_previous)
        VALUES 
        ($1, 1, ''email'', ''3 Day Reminder'', ''Looking forward to seeing you at {{church_name}}'', 
         ''Hi {{first_name}},\n\nJust a friendly reminder that you''re scheduled to visit us on {{visit_date}} at {{visit_time}}...'', 4320),
        ($1, 2, ''email'', ''1 Day Reminder'', ''Tomorrow is the day - see you at {{church_name}}!'', 
         ''Hello {{first_name}},\n\nTomorrow''s the day! We''re looking forward to meeting you at {{church_name}}...'', 1440),
        ($1, 3, ''sms'', ''2 Hour Reminder'', '''', 
         ''Hi {{first_name}}! This is a reminder that you''re visiting {{church_name}} today at {{visit_time}}. Looking forward to meeting you!'', 120)', p_tenant_schema)
    USING v_pre_visit_sequence_id;
    
    -- Post-visit follow-up
    EXECUTE format('
        INSERT INTO %I.follow_up_sequences (name, description, sequence_type, trigger_event, start_delay_minutes)
        VALUES (''Post-Visit Follow-up'', ''Thank visitors and provide next steps after their visit'', ''post_visit'', ''visit_completed'', 60)
        RETURNING id', p_tenant_schema)
    INTO v_post_visit_sequence_id;
    
    EXECUTE format('
        INSERT INTO %I.sequence_steps (sequence_id, step_order, step_type, name, subject, content_template, delay_after_previous)
        VALUES 
        ($1, 1, ''email'', ''Thank You'', ''Thank you for visiting {{church_name}}!'', 
         ''Dear {{first_name}},\n\nThank you so much for visiting {{church_name}} today! It was wonderful to meet you...'', 0),
        ($1, 2, ''email'', ''Next Steps'', ''Your next steps at {{church_name}}'', 
         ''Hi {{first_name}},\n\nWe hope you felt welcomed during your visit last week. Here are some ways to stay connected...'', 10080)', p_tenant_schema)
    USING v_post_visit_sequence_id;
    
    -- Missed visit re-engagement
    EXECUTE format('
        INSERT INTO %I.follow_up_sequences (name, description, sequence_type, trigger_event, start_delay_minutes)
        VALUES (''Missed Visit Re-engagement'', ''Re-engage visitors who missed their scheduled visit'', ''missed_visit'', ''visit_missed'', 1440)
        RETURNING id', p_tenant_schema)
    INTO v_missed_visit_sequence_id;
    
    EXECUTE format('
        INSERT INTO %I.sequence_steps (sequence_id, step_order, step_type, name, subject, content_template, delay_after_previous)
        VALUES 
        ($1, 1, ''email'', ''We Missed You'', ''We missed you at {{church_name}}'', 
         ''Hi {{first_name}},\n\nWe noticed you weren''t able to make it to your visit yesterday. No worries - life happens!...'', 0),
        ($1, 2, ''email'', ''Reschedule Invitation'', ''Ready to reschedule your visit to {{church_name}}?'', 
         ''Hello {{first_name}},\n\nWe''d still love to meet you! If you''re still interested in visiting {{church_name}}...'', 4320)', p_tenant_schema)
    USING v_missed_visit_sequence_id;
    
    -- Prayer request follow-up
    EXECUTE format('
        INSERT INTO %I.follow_up_sequences (name, description, sequence_type, trigger_event, start_delay_minutes)
        VALUES (''Prayer Request Follow-up'', ''Follow up on prayer requests to show care and support'', ''prayer_followup'', ''prayer_request_created'', 1440)
        RETURNING id', p_tenant_schema)
    INTO v_prayer_sequence_id;
    
    EXECUTE format('
        INSERT INTO %I.sequence_steps (sequence_id, step_order, step_type, name, subject, content_template, delay_after_previous)
        VALUES 
        ($1, 1, ''email'', ''Prayer Confirmation'', ''We''re praying for you'', 
         ''Dear {{first_name}},\n\nThank you for sharing your prayer request with us. Our prayer team is lifting you up...'', 0),
        ($1, 2, ''email'', ''Prayer Update Check'', ''How can we continue praying for you?'', 
         ''Hi {{first_name}},\n\nIt''s been a week since you shared your prayer request with us. We wanted to check in...'', 10080)', p_tenant_schema)
    USING v_prayer_sequence_id;

END;
$$ LANGUAGE plpgsql;

-- Create default message templates
CREATE OR REPLACE FUNCTION shared.create_default_templates(p_tenant_schema VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        INSERT INTO %I.message_templates (name, category, template_type, subject, content, variables, is_default)
        VALUES 
        -- Email templates
        (''Welcome New Member'', ''welcome'', ''email'', ''Welcome to {{church_name}}!'', 
         ''Dear {{first_name}},\n\nWelcome to the {{church_name}} family! We are thrilled that you have chosen to join our community of faith.\n\nIn the coming days, you''ll receive information about our various ministries, small groups, and ways to get involved. If you have any questions, please don''t hesitate to reach out.\n\nBlessings,\nThe {{church_name}} Team'',
         ARRAY[''first_name'', ''last_name'', ''church_name'', ''pastor_name''], true),
         
        (''Visit Reminder'', ''reminder'', ''email'', ''Looking forward to your visit to {{church_name}}'',
         ''Hi {{first_name}},\n\nThis is a friendly reminder about your upcoming visit to {{church_name}} on {{visit_date}} at {{visit_time}}.\n\nWe''re located at {{church_address}}. Please arrive 10-15 minutes early so we can greet you and show you around.\n\nIf you need to reschedule, please let us know.\n\nLooking forward to meeting you!\n\n{{church_name}} Team'',
         ARRAY[''first_name'', ''church_name'', ''visit_date'', ''visit_time'', ''church_address''], true),
         
        (''Thank You Visit'', ''thank_you'', ''email'', ''Thank you for visiting {{church_name}}!'',
         ''Dear {{first_name}},\n\nThank you for joining us at {{church_name}} {{visit_date}}! It was wonderful to meet you and we hope you felt welcomed into our church family.\n\nWe''d love to stay connected with you. Here are some next steps:\n- Join us again next Sunday\n- Consider joining a small group\n- Follow us on social media\n\nIf you have any questions or would like to learn more about {{church_name}}, please don''t hesitate to reach out.\n\nBlessings,\n{{pastor_name}}'',
         ARRAY[''first_name'', ''church_name'', ''visit_date'', ''pastor_name''], true),
         
        (''Prayer Request Follow-up'', ''followup'', ''email'', ''We''re continuing to pray for you'',
         ''Dear {{first_name}},\n\nWe wanted to follow up on the prayer request you shared with us: "{{prayer_request}}"\n\nOur prayer team has been faithfully lifting you up in prayer. We wanted to check in and see how you''re doing.\n\nPlease let us know if there are any updates or if you have additional prayer needs.\n\nYou are loved and not forgotten.\n\nIn His love,\n{{church_name}} Prayer Team'',
         ARRAY[''first_name'', ''prayer_request'', ''church_name''], true),
         
        -- SMS templates
        (''Visit Reminder SMS'', ''reminder'', ''sms'', '''',
         ''Hi {{first_name}}! Reminder: You''re visiting {{church_name}} {{visit_date}} at {{visit_time}}. We''re excited to meet you! Address: {{church_address}}'',
         ARRAY[''first_name'', ''church_name'', ''visit_date'', ''visit_time'', ''church_address''], true),
         
        (''Service Update SMS'', ''notification'', ''sms'', '''',
         ''{{church_name}} Update: {{message}}. Questions? Reply to this message or call {{church_phone}}.'',
         ARRAY[''church_name'', ''message'', ''church_phone''], true),
         
        (''Emergency Notification'', ''emergency'', ''sms'', '''',
         ''URGENT - {{church_name}}: {{emergency_message}}. Please call {{emergency_contact}} for more information.'',
         ARRAY[''church_name'', ''emergency_message'', ''emergency_contact''], true)', p_tenant_schema);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- TENANT SCHEMA UPDATE FUNCTION
-- =============================================================================

-- Update existing tenants with sequence tables
CREATE OR REPLACE FUNCTION shared.update_all_tenant_schemas_with_sequences()
RETURNS INTEGER AS $$
DECLARE
    tenant_record RECORD;
    updated_count INTEGER := 0;
BEGIN
    FOR tenant_record IN 
        SELECT schema_name FROM shared.tenants WHERE status = 'active'
    LOOP
        -- Add sequence tables to existing tenant schema
        PERFORM shared.add_sequence_tables_to_tenant(tenant_record.schema_name);
        
        -- Create default sequences and templates
        PERFORM shared.create_default_sequences(tenant_record.schema_name);
        PERFORM shared.create_default_templates(tenant_record.schema_name);
        
        updated_count := updated_count + 1;
    END LOOP;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Execute the update for existing tenants
-- SELECT shared.update_all_tenant_schemas_with_sequences();