-- Multi-Tenant Church Management Database Setup
-- PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create shared schema for cross-tenant data
CREATE SCHEMA IF NOT EXISTS shared;

-- =============================================================================
-- SHARED TABLES (Cross-tenant)
-- =============================================================================

-- Tenants table
CREATE TABLE shared.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255), -- Custom domain
    plan_type VARCHAR(50) NOT NULL DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    max_members INTEGER DEFAULT 500,
    max_staff INTEGER DEFAULT 10,
    features JSONB DEFAULT '{}', -- Feature flags
    settings JSONB DEFAULT '{}', -- Tenant-specific settings
    billing_info JSONB DEFAULT '{}',
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tenant users (staff, pastors, admins)
CREATE TABLE shared.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES shared.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'staff', -- 'admin', 'pastor', 'staff', 'volunteer'
    permissions VARCHAR[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Global settings and feature flags
CREATE TABLE shared.global_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log for tenant operations
CREATE TABLE shared.tenant_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES shared.tenants(id),
    user_id UUID REFERENCES shared.tenant_users(id),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- System-wide analytics
CREATE TABLE shared.usage_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES shared.tenants(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    dimensions JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR SHARED TABLES
-- =============================================================================

CREATE INDEX idx_tenants_subdomain ON shared.tenants(subdomain);
CREATE INDEX idx_tenants_status ON shared.tenants(status);
CREATE INDEX idx_tenant_users_tenant ON shared.tenant_users(tenant_id);
CREATE INDEX idx_tenant_users_email ON shared.tenant_users(email);
CREATE INDEX idx_tenant_users_role ON shared.tenant_users(tenant_id, role);
CREATE INDEX idx_audit_log_tenant ON shared.tenant_audit_log(tenant_id, created_at);
CREATE INDEX idx_usage_analytics_tenant ON shared.usage_analytics(tenant_id, recorded_at);

-- =============================================================================
-- FUNCTION TO CREATE TENANT SCHEMA
-- =============================================================================

CREATE OR REPLACE FUNCTION shared.create_tenant_schema(
    p_tenant_id UUID,
    p_schema_name VARCHAR(100)
) RETURNS VOID AS $$
DECLARE
    sql_statement TEXT;
BEGIN
    -- Create schema
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', p_schema_name);
    
    -- Grant usage to application role
    EXECUTE format('GRANT USAGE ON SCHEMA %I TO church_app', p_schema_name);
    EXECUTE format('GRANT ALL ON ALL TABLES IN SCHEMA %I TO church_app', p_schema_name);
    EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA %I GRANT ALL ON TABLES TO church_app', p_schema_name);
    
    -- Create tenant-specific tables
    sql_statement := format('
        -- Members table
        CREATE TABLE %I.members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_number VARCHAR(50) UNIQUE,
            first_name VARCHAR(100) NOT NULL,
            last_name VARCHAR(100) NOT NULL,
            middle_name VARCHAR(100),
            email VARCHAR(255),
            phone VARCHAR(20),
            alternate_phone VARCHAR(20),
            date_of_birth DATE,
            gender VARCHAR(20),
            marital_status VARCHAR(20),
            occupation VARCHAR(100),
            employer VARCHAR(100),
            address JSONB DEFAULT ''{}''::jsonb,
            emergency_contact JSONB DEFAULT ''{}''::jsonb,
            membership_status VARCHAR(20) DEFAULT ''active'', -- active, inactive, deceased, transferred
            membership_date DATE,
            baptized_date DATE,
            baptized_by VARCHAR(100),
            communion_date DATE,
            tags VARCHAR[] DEFAULT ''{}''::varchar[],
            ministry_involvements VARCHAR[] DEFAULT ''{}''::varchar[],
            skills_talents VARCHAR[] DEFAULT ''{}''::varchar[],
            custom_fields JSONB DEFAULT ''{}''::jsonb,
            notes TEXT,
            photo_url VARCHAR(500),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Family relationships
        CREATE TABLE %I.family_relationships (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID NOT NULL REFERENCES %I.members(id) ON DELETE CASCADE,
            related_member_id UUID NOT NULL REFERENCES %I.members(id) ON DELETE CASCADE,
            relationship_type VARCHAR(50) NOT NULL, -- spouse, parent, child, sibling, guardian
            is_primary BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(member_id, related_member_id, relationship_type)
        );
        
        -- Events
        CREATE TABLE %I.events (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            event_type VARCHAR(50) NOT NULL, -- service, meeting, outreach, social, training
            category VARCHAR(50), -- Sunday service, Bible study, youth, seniors, etc.
            start_datetime TIMESTAMPTZ NOT NULL,
            end_datetime TIMESTAMPTZ NOT NULL,
            all_day BOOLEAN DEFAULT false,
            location VARCHAR(255),
            location_details JSONB DEFAULT ''{}''::jsonb,
            max_attendees INTEGER,
            registration_required BOOLEAN DEFAULT false,
            registration_deadline TIMESTAMPTZ,
            registration_fee DECIMAL(10,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT ''active'', -- active, cancelled, completed, draft
            recurring_pattern JSONB DEFAULT ''{}''::jsonb, -- For recurring events
            parent_event_id UUID REFERENCES %I.events(id), -- For recurring event instances
            tags VARCHAR[] DEFAULT ''{}''::varchar[],
            custom_fields JSONB DEFAULT ''{}''::jsonb,
            created_by UUID NOT NULL REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Event registrations
        CREATE TABLE %I.event_registrations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            event_id UUID NOT NULL REFERENCES %I.events(id) ON DELETE CASCADE,
            member_id UUID REFERENCES %I.members(id) ON DELETE SET NULL,
            guest_name VARCHAR(255), -- For non-member registrations
            guest_email VARCHAR(255),
            guest_phone VARCHAR(20),
            adults_count INTEGER DEFAULT 1,
            children_count INTEGER DEFAULT 0,
            status VARCHAR(20) DEFAULT ''registered'', -- registered, attended, no_show, cancelled
            registration_date TIMESTAMPTZ DEFAULT NOW(),
            payment_status VARCHAR(20) DEFAULT ''pending'', -- pending, paid, refunded, waived
            amount_paid DECIMAL(10,2) DEFAULT 0,
            notes TEXT,
            custom_responses JSONB DEFAULT ''{}''::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(event_id, member_id)
        );
        
        -- Prayer requests
        CREATE TABLE %I.prayer_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            requester_id UUID REFERENCES %I.members(id) ON DELETE SET NULL,
            requester_name VARCHAR(255), -- For anonymous or non-member requests
            requester_email VARCHAR(255),
            category VARCHAR(50) DEFAULT ''general'', -- healing, family, guidance, thanksgiving, etc.
            priority VARCHAR(20) DEFAULT ''normal'', -- low, normal, high, urgent
            status VARCHAR(20) DEFAULT ''active'', -- active, answered, closed
            is_anonymous BOOLEAN DEFAULT false,
            is_public BOOLEAN DEFAULT true,
            is_urgent BOOLEAN DEFAULT false,
            assigned_to UUID REFERENCES shared.tenant_users(id),
            answered_date DATE,
            answer_description TEXT,
            follow_up_date DATE,
            expiry_date DATE, -- Auto-close date
            tags VARCHAR[] DEFAULT ''{}''::varchar[],
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Prayer request updates
        CREATE TABLE %I.prayer_updates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            prayer_request_id UUID NOT NULL REFERENCES %I.prayer_requests(id) ON DELETE CASCADE,
            update_text TEXT NOT NULL,
            update_type VARCHAR(20) DEFAULT ''update'', -- update, answered, closed, escalated
            created_by UUID REFERENCES shared.tenant_users(id),
            created_by_name VARCHAR(255), -- For system updates
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Pastoral visits
        CREATE TABLE %I.visits (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID REFERENCES %I.members(id) ON DELETE SET NULL,
            visitor_name VARCHAR(255), -- For non-member visits
            visitor_email VARCHAR(255),
            visitor_phone VARCHAR(20),
            visit_type VARCHAR(50) NOT NULL, -- pastoral, home, hospital, coffee, counseling, new_member
            purpose VARCHAR(255),
            scheduled_datetime TIMESTAMPTZ NOT NULL,
            duration_minutes INTEGER DEFAULT 60,
            location VARCHAR(255),
            location_type VARCHAR(30) DEFAULT ''other'', -- home, hospital, office, church, restaurant, other
            status VARCHAR(20) DEFAULT ''scheduled'', -- scheduled, completed, cancelled, rescheduled, no_show
            completion_status VARCHAR(20), -- successful, partially_completed, unsuccessful
            notes TEXT,
            follow_up_required BOOLEAN DEFAULT false,
            follow_up_date DATE,
            assigned_pastor UUID NOT NULL REFERENCES shared.tenant_users(id),
            created_by UUID NOT NULL REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Email sequences
        CREATE TABLE %I.email_sequences (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            trigger_event VARCHAR(100) NOT NULL, -- new_member, first_visit, prayer_request, birthday, anniversary
            trigger_conditions JSONB DEFAULT ''{}''::jsonb, -- Additional conditions for triggering
            is_active BOOLEAN DEFAULT true,
            start_delay_days INTEGER DEFAULT 0,
            created_by UUID REFERENCES shared.tenant_users(id),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Email templates within sequences
        CREATE TABLE %I.email_templates (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            sequence_id UUID REFERENCES %I.email_sequences(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            body_html TEXT NOT NULL,
            body_text TEXT,
            delay_days INTEGER DEFAULT 0, -- Days after sequence start or previous email
            order_index INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT true,
            send_conditions JSONB DEFAULT ''{}''::jsonb, -- Conditions to send this specific email
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Automated message queue
        CREATE TABLE %I.automated_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            recipient_id UUID REFERENCES %I.members(id) ON DELETE CASCADE,
            recipient_email VARCHAR(255) NOT NULL, -- Cached for performance
            recipient_phone VARCHAR(20), -- For SMS
            template_id UUID REFERENCES %I.email_templates(id) ON DELETE SET NULL,
            sequence_id UUID REFERENCES %I.email_sequences(id) ON DELETE SET NULL,
            message_type VARCHAR(20) NOT NULL, -- email, sms
            subject VARCHAR(255),
            body_content TEXT NOT NULL,
            status VARCHAR(20) DEFAULT ''pending'', -- pending, sent, failed, cancelled
            priority INTEGER DEFAULT 0, -- Higher numbers = higher priority
            scheduled_for TIMESTAMPTZ NOT NULL,
            sent_at TIMESTAMPTZ,
            failed_at TIMESTAMPTZ,
            retry_count INTEGER DEFAULT 0,
            max_retries INTEGER DEFAULT 3,
            error_message TEXT,
            metadata JSONB DEFAULT ''{}''::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Chat conversations
        CREATE TABLE %I.chat_conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            member_id UUID REFERENCES %I.members(id) ON DELETE SET NULL,
            session_id VARCHAR(255) NOT NULL,
            visitor_name VARCHAR(255), -- For non-member chats
            visitor_email VARCHAR(255),
            conversation_type VARCHAR(20) DEFAULT ''support'', -- support, prayer, information, emergency
            status VARCHAR(20) DEFAULT ''active'', -- active, resolved, transferred, abandoned
            assigned_to UUID REFERENCES shared.tenant_users(id),
            tags VARCHAR[] DEFAULT ''{}''::varchar[],
            is_active BOOLEAN DEFAULT true,
            last_activity_at TIMESTAMPTZ DEFAULT NOW(),
            started_at TIMESTAMPTZ DEFAULT NOW(),
            ended_at TIMESTAMPTZ,
            rating INTEGER, -- 1-5 satisfaction rating
            feedback TEXT,
            metadata JSONB DEFAULT ''{}''::jsonb
        );
        
        -- Chat messages
        CREATE TABLE %I.chat_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            conversation_id UUID NOT NULL REFERENCES %I.chat_conversations(id) ON DELETE CASCADE,
            sender_type VARCHAR(20) NOT NULL, -- user, ai, staff, system
            sender_id UUID, -- member_id or staff_id, null for AI/system
            sender_name VARCHAR(255), -- Display name
            message_text TEXT NOT NULL,
            message_type VARCHAR(20) DEFAULT ''text'', -- text, image, file, system, quick_reply
            message_data JSONB DEFAULT ''{}''::jsonb, -- Additional message data (file URLs, quick replies, etc.)
            is_read BOOLEAN DEFAULT false,
            read_at TIMESTAMPTZ,
            metadata JSONB DEFAULT ''{}''::jsonb,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Ministry groups/teams
        CREATE TABLE %I.ministries (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            category VARCHAR(50), -- worship, youth, childrens, seniors, outreach, administration
            leader_id UUID REFERENCES shared.tenant_users(id),
            status VARCHAR(20) DEFAULT ''active'', -- active, inactive, seasonal
            meeting_schedule VARCHAR(255),
            contact_email VARCHAR(255),
            requirements TEXT,
            is_accepting_members BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Ministry membership
        CREATE TABLE %I.ministry_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            ministry_id UUID NOT NULL REFERENCES %I.ministries(id) ON DELETE CASCADE,
            member_id UUID NOT NULL REFERENCES %I.members(id) ON DELETE CASCADE,
            role VARCHAR(50) DEFAULT ''member'', -- leader, co_leader, member, volunteer
            joined_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT ''active'', -- active, inactive, on_leave
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(ministry_id, member_id)
        );
        
        -- Giving/donations tracking
        CREATE TABLE %I.donations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            donor_id UUID REFERENCES %I.members(id) ON DELETE SET NULL,
            donor_name VARCHAR(255), -- For anonymous or non-member donations
            amount DECIMAL(10,2) NOT NULL,
            currency VARCHAR(3) DEFAULT ''USD'',
            donation_date DATE NOT NULL,
            payment_method VARCHAR(50), -- cash, check, online, bank_transfer, crypto
            check_number VARCHAR(50),
            transaction_id VARCHAR(255), -- External payment processor ID
            category VARCHAR(50) DEFAULT ''general'', -- tithes, offerings, missions, building_fund, etc.
            fund_designation VARCHAR(100),
            is_recurring BOOLEAN DEFAULT false,
            recurring_schedule VARCHAR(50), -- weekly, monthly, quarterly, annually
            notes TEXT,
            is_anonymous BOOLEAN DEFAULT false,
            tax_deductible BOOLEAN DEFAULT true,
            receipt_sent BOOLEAN DEFAULT false,
            receipt_sent_at TIMESTAMPTZ,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Small groups
        CREATE TABLE %I.small_groups (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            group_type VARCHAR(50) DEFAULT ''bible_study'', -- bible_study, prayer, fellowship, support, youth, mens, womens
            leader_id UUID REFERENCES %I.members(id),
            co_leader_id UUID REFERENCES %I.members(id),
            max_members INTEGER DEFAULT 12,
            meeting_day VARCHAR(20), -- monday, tuesday, etc.
            meeting_time TIME,
            meeting_location VARCHAR(255),
            meeting_frequency VARCHAR(20) DEFAULT ''weekly'', -- weekly, biweekly, monthly
            start_date DATE,
            end_date DATE,
            is_open BOOLEAN DEFAULT true,
            childcare_available BOOLEAN DEFAULT false,
            age_range VARCHAR(50),
            gender_restriction VARCHAR(20), -- mixed, men_only, women_only
            status VARCHAR(20) DEFAULT ''active'', -- active, inactive, full, completed
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        
        -- Small group membership
        CREATE TABLE %I.small_group_members (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            group_id UUID NOT NULL REFERENCES %I.small_groups(id) ON DELETE CASCADE,
            member_id UUID NOT NULL REFERENCES %I.members(id) ON DELETE CASCADE,
            role VARCHAR(20) DEFAULT ''member'', -- leader, co_leader, member
            joined_date DATE DEFAULT CURRENT_DATE,
            status VARCHAR(20) DEFAULT ''active'', -- active, inactive, completed
            notes TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(group_id, member_id)
        );
        
    ', p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name);
    
    EXECUTE sql_statement;
    
    -- Create indexes
    sql_statement := format('
        -- Member indexes
        CREATE INDEX idx_%s_members_email ON %I.members(email) WHERE email IS NOT NULL;
        CREATE INDEX idx_%s_members_phone ON %I.members(phone) WHERE phone IS NOT NULL;
        CREATE INDEX idx_%s_members_name ON %I.members(first_name, last_name);
        CREATE INDEX idx_%s_members_status ON %I.members(membership_status);
        CREATE INDEX idx_%s_members_tags ON %I.members USING GIN(tags);
        CREATE INDEX idx_%s_members_search ON %I.members USING GIN((first_name || '' '' || last_name) gin_trgm_ops);
        
        -- Event indexes
        CREATE INDEX idx_%s_events_datetime ON %I.events(start_datetime, end_datetime);
        CREATE INDEX idx_%s_events_type ON %I.events(event_type);
        CREATE INDEX idx_%s_events_status ON %I.events(status);
        CREATE INDEX idx_%s_events_created_by ON %I.events(created_by);
        
        -- Prayer request indexes
        CREATE INDEX idx_%s_prayer_status ON %I.prayer_requests(status, priority);
        CREATE INDEX idx_%s_prayer_category ON %I.prayer_requests(category);
        CREATE INDEX idx_%s_prayer_assigned ON %I.prayer_requests(assigned_to);
        CREATE INDEX idx_%s_prayer_requester ON %I.prayer_requests(requester_id);
        
        -- Visit indexes
        CREATE INDEX idx_%s_visits_scheduled ON %I.visits(scheduled_datetime);
        CREATE INDEX idx_%s_visits_pastor ON %I.visits(assigned_pastor);
        CREATE INDEX idx_%s_visits_member ON %I.visits(member_id);
        CREATE INDEX idx_%s_visits_status ON %I.visits(status);
        
        -- Message queue indexes
        CREATE INDEX idx_%s_messages_scheduled ON %I.automated_messages(scheduled_for, status);
        CREATE INDEX idx_%s_messages_recipient ON %I.automated_messages(recipient_id);
        CREATE INDEX idx_%s_messages_status ON %I.automated_messages(status, priority);
        
        -- Chat indexes
        CREATE INDEX idx_%s_chat_messages_conversation ON %I.chat_messages(conversation_id, created_at);
        CREATE INDEX idx_%s_chat_conversations_member ON %I.chat_conversations(member_id);
        CREATE INDEX idx_%s_chat_conversations_assigned ON %I.chat_conversations(assigned_to);
        CREATE INDEX idx_%s_chat_conversations_active ON %I.chat_conversations(is_active, last_activity_at);
        
        -- Donation indexes
        CREATE INDEX idx_%s_donations_donor ON %I.donations(donor_id, donation_date);
        CREATE INDEX idx_%s_donations_date ON %I.donations(donation_date);
        CREATE INDEX idx_%s_donations_category ON %I.donations(category, donation_date);
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
    
    -- Create triggers for updated_at timestamps
    sql_statement := format('
        CREATE OR REPLACE FUNCTION %I.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language plpgsql;
        
        CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON %I.members
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON %I.events
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON %I.prayer_requests
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON %I.visits
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON %I.email_sequences
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
        CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON %I.email_templates
            FOR EACH ROW EXECUTE FUNCTION %I.update_updated_at_column();
    ', 
    p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name, p_schema_name
    );
    
    EXECUTE sql_statement;
    
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- FUNCTION TO DROP TENANT SCHEMA
-- =============================================================================

CREATE OR REPLACE FUNCTION shared.drop_tenant_schema(p_schema_name VARCHAR(100))
RETURNS VOID AS $$
BEGIN
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', p_schema_name);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- SHARED TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Trigger to update updated_at in shared tables
CREATE OR REPLACE FUNCTION shared.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON shared.tenants
    FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at_column();

CREATE TRIGGER update_tenant_users_updated_at BEFORE UPDATE ON shared.tenant_users
    FOR EACH ROW EXECUTE FUNCTION shared.update_updated_at_column();

-- Trigger to create schema when tenant is created
CREATE OR REPLACE FUNCTION shared.create_tenant_schema_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Generate schema name if not provided
    IF NEW.schema_name IS NULL THEN
        NEW.schema_name := 'tenant_' || replace(NEW.id::text, '-', '_');
    END IF;
    
    -- Create the tenant schema after insert
    PERFORM shared.create_tenant_schema(NEW.id, NEW.schema_name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tenant_schema_creation AFTER INSERT ON shared.tenants
    FOR EACH ROW EXECUTE FUNCTION shared.create_tenant_schema_trigger();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert global settings
INSERT INTO shared.global_settings (key, value, description) VALUES
('max_file_size_mb', '50', 'Maximum file upload size in MB'),
('allowed_file_types', '["jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "txt"]', 'Allowed file upload types'),
('default_pagination_size', '25', 'Default number of items per page'),
('session_timeout_minutes', '480', 'User session timeout in minutes'),
('ai_chat_enabled', 'true', 'Enable AI chat functionality'),
('email_rate_limit_per_hour', '100', 'Maximum emails per tenant per hour'),
('sms_rate_limit_per_hour', '50', 'Maximum SMS per tenant per hour')
ON CONFLICT (key) DO NOTHING;

-- Create application roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'church_app') THEN
        CREATE ROLE church_app WITH LOGIN PASSWORD 'your_secure_password_here';
    END IF;
    
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'church_app_readonly') THEN
        CREATE ROLE church_app_readonly WITH LOGIN PASSWORD 'your_readonly_password_here';
    END IF;
END
$$;

-- Grant permissions
GRANT USAGE ON SCHEMA shared TO church_app;
GRANT ALL ON ALL TABLES IN SCHEMA shared TO church_app;
GRANT ALL ON ALL SEQUENCES IN SCHEMA shared TO church_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared GRANT ALL ON TABLES TO church_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared GRANT ALL ON SEQUENCES TO church_app;

-- Read-only access
GRANT USAGE ON SCHEMA shared TO church_app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA shared TO church_app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA shared GRANT SELECT ON TABLES TO church_app_readonly;

-- =============================================================================
-- SAMPLE TENANT CREATION (for testing)
-- =============================================================================

/*
-- Example: Create a test tenant
INSERT INTO shared.tenants (name, subdomain, plan_type, schema_name) 
VALUES ('First Baptist Church', 'firstbaptist', 'premium', 'tenant_firstbaptist');

-- Create admin user for the tenant
INSERT INTO shared.tenant_users (tenant_id, email, password_hash, first_name, last_name, role)
VALUES (
    (SELECT id FROM shared.tenants WHERE subdomain = 'firstbaptist'),
    'admin@firstbaptist.com',
    '$2b$10$example_hash_here', -- Use proper bcrypt hash
    'Admin',
    'User',
    'admin'
);
*/