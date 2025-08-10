-- VisionaryChurch.ai - Simplified Database Setup for Supabase
-- This version works with Supabase's PostgreSQL setup

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- MAIN TABLES (Simplified for quick setup)
-- =============================================================================

-- Churches table
CREATE TABLE public.churches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    zip VARCHAR(10),
    website VARCHAR(255),
    description TEXT,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Church users (staff, pastors, admins)
CREATE TABLE public.church_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(church_id, email)
);

-- Visitors table
CREATE TABLE public.visitors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    source VARCHAR(100) DEFAULT 'chat',
    status VARCHAR(50) DEFAULT 'new',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES public.visitors(id),
    session_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL, -- 'visitor' or 'assistant'
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service times
CREATE TABLE public.service_times (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME,
    service_type VARCHAR(100) DEFAULT 'Sunday Service',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit plans
CREATE TABLE public.visit_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
    service_time_id UUID REFERENCES public.service_times(id),
    planned_date DATE NOT NULL,
    party_size INTEGER DEFAULT 1,
    children_count INTEGER DEFAULT 0,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'planned',
    confirmation_token VARCHAR(255),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    location VARCHAR(255),
    capacity INTEGER,
    registration_required BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prayer requests
CREATE TABLE public.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
    visitor_id UUID REFERENCES public.visitors(id),
    title VARCHAR(255),
    request_text TEXT NOT NULL,
    category VARCHAR(100),
    urgency VARCHAR(20) DEFAULT 'normal',
    privacy_level VARCHAR(20) DEFAULT 'team_only',
    status VARCHAR(50) DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Church indexes
CREATE INDEX idx_churches_slug ON public.churches(slug);

-- Visitor indexes
CREATE INDEX idx_visitors_church ON public.visitors(church_id);
CREATE INDEX idx_visitors_email ON public.visitors(email);
CREATE INDEX idx_visitors_status ON public.visitors(church_id, status);

-- Chat indexes
CREATE INDEX idx_chat_sessions_church ON public.chat_sessions(church_id);
CREATE INDEX idx_chat_sessions_visitor ON public.chat_sessions(visitor_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);

-- Service times indexes
CREATE INDEX idx_service_times_church ON public.service_times(church_id);
CREATE INDEX idx_service_times_active ON public.service_times(church_id, is_active);

-- Visit plans indexes
CREATE INDEX idx_visit_plans_church ON public.visit_plans(church_id);
CREATE INDEX idx_visit_plans_visitor ON public.visit_plans(visitor_id);
CREATE INDEX idx_visit_plans_date ON public.visit_plans(church_id, planned_date);
CREATE INDEX idx_visit_plans_status ON public.visit_plans(church_id, status);

-- Events indexes
CREATE INDEX idx_events_church ON public.events(church_id);
CREATE INDEX idx_events_date ON public.events(church_id, start_date);
CREATE INDEX idx_events_public ON public.events(church_id, is_public);

-- Prayer requests indexes
CREATE INDEX idx_prayer_requests_church ON public.prayer_requests(church_id);
CREATE INDEX idx_prayer_requests_visitor ON public.prayer_requests(visitor_id);
CREATE INDEX idx_prayer_requests_status ON public.prayer_requests(church_id, status);

-- =============================================================================
-- SAMPLE DATA
-- =============================================================================

-- Insert sample church
INSERT INTO public.churches (name, slug, email, phone, address, city, state, zip, description, settings) VALUES
('Grace Community Church', 'grace-community', 'info@gracecommunity.org', '(555) 123-4567', '123 Church Street', 'Springfield', 'IL', '62701', 'A welcoming community where everyone belongs.', 
'{"brand_color": "#3B82F6", "welcome_message": "Welcome to Grace Community Church! How can we help you today?", "features": {"chat_enabled": true, "visit_planning": true}}');

-- Get the church ID for sample data
DO $$ 
DECLARE 
    sample_church_id UUID;
    sample_visitor_id UUID;
    sample_session_id UUID;
    sample_service_id UUID;
BEGIN
    -- Get the sample church ID
    SELECT id INTO sample_church_id FROM public.churches WHERE slug = 'grace-community';
    
    -- Insert sample service times
    INSERT INTO public.service_times (church_id, day_of_week, start_time, service_type, description) VALUES
    (sample_church_id, 0, '09:00:00', 'Traditional Service', 'Classic hymns and traditional worship'),
    (sample_church_id, 0, '11:00:00', 'Contemporary Service', 'Modern music and relaxed atmosphere'),
    (sample_church_id, 3, '19:00:00', 'Midweek Service', 'Bible study and prayer time');
    
    -- Insert sample visitor
    INSERT INTO public.visitors (church_id, email, first_name, last_name, phone, source, status) VALUES
    (sample_church_id, 'john.doe@email.com', 'John', 'Doe', '(555) 987-6543', 'chat', 'new')
    RETURNING id INTO sample_visitor_id;
    
    -- Insert sample chat session
    INSERT INTO public.chat_sessions (church_id, visitor_id, session_id, status) VALUES
    (sample_church_id, sample_visitor_id, 'demo-session-1', 'active')
    RETURNING id INTO sample_session_id;
    
    -- Insert sample chat messages
    INSERT INTO public.chat_messages (session_id, message, sender_type) VALUES
    (sample_session_id, 'Hi, I''m interested in visiting your church. What time are your services?', 'visitor'),
    (sample_session_id, 'Welcome to Grace Community Church! We have two Sunday services: 9:00 AM (Traditional) and 11:00 AM (Contemporary). Both are welcoming to visitors. Would you like me to help you plan a visit?', 'assistant'),
    (sample_session_id, 'Yes, I''d like to visit this Sunday with my family.', 'visitor'),
    (sample_session_id, 'That''s wonderful! Let me help you plan your visit. How many people will be in your group, and do you have any children?', 'assistant');
    
    -- Get a service time ID
    SELECT id INTO sample_service_id FROM public.service_times WHERE church_id = sample_church_id LIMIT 1;
    
    -- Insert sample visit plan
    INSERT INTO public.visit_plans (church_id, visitor_id, service_time_id, planned_date, party_size, children_count, status) VALUES
    (sample_church_id, sample_visitor_id, sample_service_id, CURRENT_DATE + INTERVAL '3 days', 4, 2, 'planned');
    
    -- Insert sample event
    INSERT INTO public.events (church_id, title, description, start_date, location, capacity, registration_required) VALUES
    (sample_church_id, 'Community Potluck', 'Join us for food, fellowship, and fun! Bring a dish to share.', 
     CURRENT_TIMESTAMP + INTERVAL '10 days', 'Fellowship Hall', 100, true);
    
    -- Insert sample prayer request
    INSERT INTO public.prayer_requests (church_id, visitor_id, title, request_text, category, status) VALUES
    (sample_church_id, sample_visitor_id, 'Family Health', 'Please pray for my mother''s recovery from surgery.', 'health', 'open');
END $$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.church_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_requests ENABLE ROW LEVEL SECURITY;

-- Simple policies for testing (you can make these more restrictive later)
CREATE POLICY "Public read access" ON public.churches FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.service_times FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.events FOR SELECT USING (is_public = true);

-- Allow inserts for visitor-facing features
CREATE POLICY "Public insert access" ON public.visitors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.chat_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.visit_plans FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert access" ON public.prayer_requests FOR INSERT WITH CHECK (true);

-- Allow reading own data
CREATE POLICY "Read own data" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "Read own data" ON public.chat_sessions FOR SELECT USING (true);
CREATE POLICY "Read own data" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Read own data" ON public.visit_plans FOR SELECT USING (true);

-- Basic update policies
CREATE POLICY "Update own data" ON public.visitors FOR UPDATE USING (true);
CREATE POLICY "Update own data" ON public.chat_sessions FOR UPDATE USING (true);
CREATE POLICY "Update own data" ON public.visit_plans FOR UPDATE USING (true);

-- =============================================================================
-- SUCCESS MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE 'VisionaryChurch.ai database setup completed successfully!';
    RAISE NOTICE 'Sample church created: Grace Community Church (grace-community)';
    RAISE NOTICE 'You can now test the platform at http://localhost:3000';
END $$;