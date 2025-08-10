-- Prayer Request Management System Database Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enums for prayer request system
CREATE TYPE prayer_category AS ENUM (
  'healing', 'guidance', 'thanksgiving', 'family', 'financial',
  'relationships', 'grief', 'addiction', 'mental_health', 
  'spiritual_growth', 'salvation', 'protection', 'employment',
  'travel', 'other'
);

CREATE TYPE prayer_urgency AS ENUM ('routine', 'urgent', 'emergency');

CREATE TYPE prayer_privacy_level AS ENUM (
  'public', 'prayer_team_only', 'leadership_only', 'private'
);

CREATE TYPE prayer_status AS ENUM (
  'submitted', 'assigned', 'in_progress', 'praying', 
  'follow_up_needed', 'answered', 'ongoing', 'closed', 'archived'
);

CREATE TYPE prayer_member_role AS ENUM ('leader', 'member', 'trainee');

CREATE TYPE prayer_response_type AS ENUM (
  'prayer', 'encouragement', 'scripture', 'resource', 'follow_up'
);

CREATE TYPE assignment_status AS ENUM (
  'assigned', 'accepted', 'declined', 'completed', 'transferred'
);

CREATE TYPE communication_type AS ENUM (
  'status_update', 'follow_up', 'encouragement', 'question', 'notification'
);

CREATE TYPE delivery_method AS ENUM ('email', 'sms', 'in_app', 'phone');

-- Prayer Requests Table
CREATE TABLE prayer_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name VARCHAR(100),
  requester_email VARCHAR(255),
  requester_phone VARCHAR(20),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  category prayer_category NOT NULL,
  urgency prayer_urgency NOT NULL DEFAULT 'routine',
  privacy_level prayer_privacy_level NOT NULL DEFAULT 'prayer_team_only',
  status prayer_status NOT NULL DEFAULT 'submitted',
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  allow_updates BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  assigned_team_members UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Prayer Teams Table
CREATE TABLE prayer_teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  specialties prayer_category[] DEFAULT '{}',
  max_capacity INTEGER NOT NULL DEFAULT 10,
  current_load INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  meeting_schedule JSONB,
  leader_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Team Members Table
CREATE TABLE prayer_team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES prayer_teams(id) ON DELETE CASCADE,
  role prayer_member_role NOT NULL DEFAULT 'member',
  specialties prayer_category[] DEFAULT '{}',
  availability JSONB DEFAULT '{}',
  current_load INTEGER NOT NULL DEFAULT 0,
  max_capacity INTEGER NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT true,
  phone VARCHAR(20),
  email VARCHAR(255),
  emergency_contact BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, team_id)
);

-- Prayer Assignments Table
CREATE TABLE prayer_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  team_member_id UUID NOT NULL REFERENCES prayer_team_members(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status assignment_status NOT NULL DEFAULT 'assigned',
  priority INTEGER NOT NULL DEFAULT 1,
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Responses Table
CREATE TABLE prayer_responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES prayer_team_members(id) ON DELETE CASCADE,
  responder_name VARCHAR(100) NOT NULL,
  response_type prayer_response_type NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  scripture_references TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prayer Communications Table
CREATE TABLE prayer_communications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prayer_request_id UUID NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  sender_role VARCHAR(50) NOT NULL,
  recipient_id UUID REFERENCES users(id) ON DELETE SET NULL,
  message_type communication_type NOT NULL,
  subject VARCHAR(200),
  content TEXT NOT NULL,
  delivery_method delivery_method NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Prayer Analytics Reports Table (for storing custom reports)
CREATE TABLE prayer_analytics_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  configuration JSONB NOT NULL,
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_prayer_requests_church_id ON prayer_requests(church_id);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX idx_prayer_requests_urgency ON prayer_requests(urgency);
CREATE INDEX idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at);
CREATE INDEX idx_prayer_requests_assigned_members ON prayer_requests USING GIN(assigned_team_members);
CREATE INDEX idx_prayer_requests_tags ON prayer_requests USING GIN(tags);
CREATE INDEX idx_prayer_requests_archived ON prayer_requests(archived_at) WHERE archived_at IS NOT NULL;

CREATE INDEX idx_prayer_teams_church_id ON prayer_teams(church_id);
CREATE INDEX idx_prayer_teams_active ON prayer_teams(is_active);
CREATE INDEX idx_prayer_teams_specialties ON prayer_teams USING GIN(specialties);

CREATE INDEX idx_prayer_team_members_user_id ON prayer_team_members(user_id);
CREATE INDEX idx_prayer_team_members_team_id ON prayer_team_members(team_id);
CREATE INDEX idx_prayer_team_members_active ON prayer_team_members(is_active);
CREATE INDEX idx_prayer_team_members_emergency ON prayer_team_members(emergency_contact);

CREATE INDEX idx_prayer_assignments_request_id ON prayer_assignments(prayer_request_id);
CREATE INDEX idx_prayer_assignments_member_id ON prayer_assignments(team_member_id);
CREATE INDEX idx_prayer_assignments_status ON prayer_assignments(status);
CREATE INDEX idx_prayer_assignments_priority ON prayer_assignments(priority);

CREATE INDEX idx_prayer_responses_request_id ON prayer_responses(prayer_request_id);
CREATE INDEX idx_prayer_responses_responder_id ON prayer_responses(responder_id);
CREATE INDEX idx_prayer_responses_type ON prayer_responses(response_type);

CREATE INDEX idx_prayer_communications_request_id ON prayer_communications(prayer_request_id);
CREATE INDEX idx_prayer_communications_sender_id ON prayer_communications(sender_id);
CREATE INDEX idx_prayer_communications_recipient_id ON prayer_communications(recipient_id);
CREATE INDEX idx_prayer_communications_sent_at ON prayer_communications(sent_at);

-- Full-text search indexes
CREATE INDEX idx_prayer_requests_search ON prayer_requests USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX idx_prayer_responses_search ON prayer_responses USING GIN(to_tsvector('english', content));

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_prayer_requests_updated_at BEFORE UPDATE ON prayer_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_teams_updated_at BEFORE UPDATE ON prayer_teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_team_members_updated_at BEFORE UPDATE ON prayer_team_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prayer_assignments_updated_at BEFORE UPDATE ON prayer_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to automatically update team member load
CREATE OR REPLACE FUNCTION update_team_member_load()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increase load when assignment is created
        UPDATE prayer_team_members 
        SET current_load = current_load + 1 
        WHERE id = NEW.team_member_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Decrease load when assignment is completed
        IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
            UPDATE prayer_team_members 
            SET current_load = GREATEST(current_load - 1, 0) 
            WHERE id = NEW.team_member_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Decrease load when assignment is deleted
        UPDATE prayer_team_members 
        SET current_load = GREATEST(current_load - 1, 0) 
        WHERE id = OLD.team_member_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_member_load_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON prayer_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_team_member_load();

-- Create function to automatically archive old prayer requests
CREATE OR REPLACE FUNCTION auto_archive_old_requests()
RETURNS void AS $$
BEGIN
    UPDATE prayer_requests 
    SET archived_at = NOW()
    WHERE status IN ('closed', 'answered') 
      AND created_at < NOW() - INTERVAL '1 year'
      AND archived_at IS NULL;
END;
$$ language 'plpgsql';

-- Create function for sensitive information detection (basic implementation)
CREATE OR REPLACE FUNCTION detect_sensitive_info(content TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic patterns for sensitive information
    -- This is a simple implementation - in production, you'd want more sophisticated detection
    RETURN content ~* '\b\d{3}-\d{2}-\d{4}\b'  -- SSN pattern
        OR content ~* '\b\d{16}\b'              -- Credit card pattern
        OR content ~* '\b(suicide|self-harm|abuse|violence)\b'; -- Crisis keywords
END;
$$ language 'plpgsql';

-- Create function to get prayer request statistics
CREATE OR REPLACE FUNCTION get_prayer_statistics(
    church_uuid UUID,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() - INTERVAL '30 days',
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS TABLE(
    total_requests BIGINT,
    active_requests BIGINT,
    completed_requests BIGINT,
    avg_response_time_hours NUMERIC,
    category_stats JSONB,
    urgency_stats JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE status NOT IN ('closed', 'archived')) as active,
            COUNT(*) FILTER (WHERE status IN ('answered', 'closed')) as completed,
            -- Calculate average response time (simplified)
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600) as avg_hours
        FROM prayer_requests 
        WHERE church_id = church_uuid 
          AND created_at BETWEEN start_date AND end_date
    ),
    category_breakdown AS (
        SELECT jsonb_object_agg(category, count) as categories
        FROM (
            SELECT category, COUNT(*) as count
            FROM prayer_requests 
            WHERE church_id = church_uuid 
              AND created_at BETWEEN start_date AND end_date
            GROUP BY category
        ) t
    ),
    urgency_breakdown AS (
        SELECT jsonb_object_agg(urgency, count) as urgencies
        FROM (
            SELECT urgency, COUNT(*) as count
            FROM prayer_requests 
            WHERE church_id = church_uuid 
              AND created_at BETWEEN start_date AND end_date
            GROUP BY urgency
        ) t
    )
    SELECT 
        s.total,
        s.active,
        s.completed,
        s.avg_hours,
        c.categories,
        u.urgencies
    FROM stats s
    CROSS JOIN category_breakdown c
    CROSS JOIN urgency_breakdown u;
END;
$$ language 'plpgsql';

-- Row Level Security (RLS) Policies

-- Enable RLS on all prayer tables
ALTER TABLE prayer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_analytics_reports ENABLE ROW LEVEL SECURITY;

-- Prayer Requests policies
CREATE POLICY "Church members can view prayer requests based on privacy level" ON prayer_requests
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
        AND (
            privacy_level = 'public'
            OR (privacy_level = 'prayer_team_only' AND EXISTS (
                SELECT 1 FROM prayer_team_members ptm
                JOIN prayer_teams pt ON ptm.team_id = pt.id
                WHERE ptm.user_id = auth.uid() AND pt.church_id = prayer_requests.church_id
            ))
            OR (privacy_level = 'leadership_only' AND EXISTS (
                SELECT 1 FROM users 
                WHERE id = auth.uid() 
                AND church_id = prayer_requests.church_id
                AND role IN ('church_admin', 'prayer_team_leader', 'super_admin')
            ))
            OR (privacy_level = 'private' AND (
                requester_id = auth.uid()
                OR auth.uid() IN (SELECT unnest(assigned_team_members))
            ))
        )
    );

CREATE POLICY "Anyone can submit prayer requests" ON prayer_requests
    FOR INSERT WITH CHECK (
        church_id IN (SELECT id FROM churches WHERE id = prayer_requests.church_id)
    );

CREATE POLICY "Assigned team members and leadership can update requests" ON prayer_requests
    FOR UPDATE USING (
        auth.uid() IN (SELECT unnest(assigned_team_members))
        OR EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND church_id = prayer_requests.church_id
            AND role IN ('church_admin', 'prayer_team_leader', 'super_admin')
        )
    );

-- Prayer Teams policies
CREATE POLICY "Church members can view their church's prayer teams" ON prayer_teams
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Church admins can manage prayer teams" ON prayer_teams
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND church_id = prayer_teams.church_id
            AND role IN ('church_admin', 'prayer_team_leader', 'super_admin')
        )
    );

-- Prayer Team Members policies
CREATE POLICY "Team members can view team membership" ON prayer_team_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR team_id IN (
            SELECT team_id FROM prayer_team_members WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM prayer_teams pt
            JOIN users u ON u.church_id = pt.church_id
            WHERE pt.id = prayer_team_members.team_id
            AND u.id = auth.uid()
            AND u.role IN ('church_admin', 'prayer_team_leader', 'super_admin')
        )
    );

-- Prayer Assignments policies
CREATE POLICY "Assigned members can view their assignments" ON prayer_assignments
    FOR SELECT USING (
        team_member_id IN (
            SELECT id FROM prayer_team_members WHERE user_id = auth.uid()
        )
        OR EXISTS (
            SELECT 1 FROM prayer_team_members ptm
            JOIN prayer_teams pt ON ptm.team_id = pt.id
            JOIN users u ON u.church_id = pt.church_id
            WHERE ptm.id = prayer_assignments.team_member_id
            AND u.id = auth.uid()
            AND u.role IN ('church_admin', 'prayer_team_leader', 'super_admin')
        )
    );

-- Prayer Responses policies
CREATE POLICY "Authorized users can view prayer responses" ON prayer_responses
    FOR SELECT USING (
        responder_id IN (
            SELECT id FROM prayer_team_members WHERE user_id = auth.uid()
        )
        OR prayer_request_id IN (
            SELECT id FROM prayer_requests WHERE requester_id = auth.uid()
        )
        OR prayer_request_id IN (
            SELECT prayer_request_id FROM prayer_assignments
            WHERE team_member_id IN (
                SELECT id FROM prayer_team_members WHERE user_id = auth.uid()
            )
        )
    );

-- Create default prayer team for new churches
CREATE OR REPLACE FUNCTION create_default_prayer_team()
RETURNS TRIGGER AS $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the church admin user
    SELECT id INTO admin_user_id 
    FROM users 
    WHERE church_id = NEW.id 
    AND role = 'church_admin' 
    LIMIT 1;

    -- Create default prayer team if admin exists
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO prayer_teams (
            church_id, 
            name, 
            description, 
            leader_id,
            specialties,
            max_capacity
        ) VALUES (
            NEW.id,
            'Main Prayer Team',
            'Primary prayer team for handling prayer requests',
            admin_user_id,
            ARRAY['healing', 'guidance', 'family', 'other']::prayer_category[],
            20
        );
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: Trigger creation depends on churches table existing
-- This would be created after the churches table trigger is set up

-- Create view for prayer request dashboard
CREATE VIEW prayer_dashboard_view AS
SELECT 
    pr.*,
    CASE 
        WHEN pr.is_anonymous THEN 'Anonymous'
        ELSE pr.requester_name
    END as display_name,
    pt.name as assigned_team_name,
    ptm.user_id as assigned_user_id,
    u.full_name as assigned_user_name,
    COUNT(pres.id) as response_count,
    MAX(pres.created_at) as last_response_at
FROM prayer_requests pr
LEFT JOIN prayer_assignments pa ON pr.id = pa.prayer_request_id
LEFT JOIN prayer_team_members ptm ON pa.team_member_id = ptm.id
LEFT JOIN prayer_teams pt ON ptm.team_id = pt.id
LEFT JOIN users u ON ptm.user_id = u.id
LEFT JOIN prayer_responses pres ON pr.id = pres.prayer_request_id
WHERE pr.archived_at IS NULL
GROUP BY pr.id, pt.name, ptm.user_id, u.full_name;

-- Create materialized view for analytics (refreshed periodically)
CREATE MATERIALIZED VIEW prayer_analytics_mv AS
SELECT 
    pr.church_id,
    DATE_TRUNC('day', pr.created_at) as date,
    pr.category,
    pr.urgency,
    pr.status,
    COUNT(*) as request_count,
    AVG(EXTRACT(EPOCH FROM (pr.updated_at - pr.created_at))/3600) as avg_response_time_hours
FROM prayer_requests pr
WHERE pr.created_at >= NOW() - INTERVAL '1 year'
GROUP BY 
    pr.church_id,
    DATE_TRUNC('day', pr.created_at),
    pr.category,
    pr.urgency,
    pr.status;

-- Create unique index for materialized view
CREATE UNIQUE INDEX idx_prayer_analytics_mv_unique 
ON prayer_analytics_mv (church_id, date, category, urgency, status);

-- Create function to refresh analytics
CREATE OR REPLACE FUNCTION refresh_prayer_analytics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY prayer_analytics_mv;
END;
$$ language 'plpgsql';

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON prayer_requests TO authenticated;
GRANT ALL ON prayer_teams TO authenticated;
GRANT ALL ON prayer_team_members TO authenticated;
GRANT ALL ON prayer_assignments TO authenticated;
GRANT ALL ON prayer_responses TO authenticated;
GRANT ALL ON prayer_communications TO authenticated;
GRANT ALL ON prayer_analytics_reports TO authenticated;
GRANT SELECT ON prayer_dashboard_view TO authenticated;
GRANT SELECT ON prayer_analytics_mv TO authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;