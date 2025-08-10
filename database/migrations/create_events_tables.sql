-- Event Management System Database Migration
-- This creates all tables and enums for the comprehensive event management system

-- Create enums for event management
CREATE TYPE event_type AS ENUM (
  'worship', 'bible_study', 'prayer', 'fellowship', 'outreach', 
  'youth', 'children', 'ministry', 'special', 'conference', 
  'retreat', 'wedding', 'funeral', 'other'
);

CREATE TYPE cost_type AS ENUM (
  'free', 'paid', 'donation', 'suggested_donation'
);

CREATE TYPE audience_type AS ENUM (
  'all', 'members', 'visitors', 'youth', 'children', 
  'adults', 'seniors', 'families', 'men', 'women'
);

CREATE TYPE event_status AS ENUM (
  'draft', 'published', 'cancelled', 'completed', 'postponed'
);

CREATE TYPE registration_type AS ENUM (
  'individual', 'group', 'family'
);

CREATE TYPE registration_status AS ENUM (
  'pending', 'confirmed', 'waitlisted', 'cancelled', 'no_show'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'completed', 'failed', 'refunded', 'waived'
);

CREATE TYPE volunteer_status AS ENUM (
  'interested', 'confirmed', 'checked_in', 'completed', 'cancelled'
);

CREATE TYPE resource_type AS ENUM (
  'facility', 'equipment', 'catering', 'supplies', 'transport', 'other'
);

CREATE TYPE booking_status AS ENUM (
  'requested', 'confirmed', 'cancelled', 'pending'
);

CREATE TYPE communication_type AS ENUM (
  'announcement', 'reminder', 'update', 'cancellation', 'thank_you', 'feedback_request'
);

CREATE TYPE communication_channel AS ENUM (
  'email', 'sms', 'push_notification', 'in_app'
);

CREATE TYPE communication_status AS ENUM (
  'draft', 'scheduled', 'sent', 'failed', 'cancelled'
);

CREATE TYPE attendance_status AS ENUM (
  'present', 'absent', 'late', 'early_departure'
);

CREATE TYPE check_in_method AS ENUM (
  'qr_code', 'manual', 'mobile_app', 'kiosk'
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id UUID NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  event_type event_type NOT NULL,
  category VARCHAR(100) NOT NULL,
  capacity INTEGER,
  cost DECIMAL(10,2),
  cost_type cost_type NOT NULL DEFAULT 'free',
  age_groups TEXT[],
  audience_type audience_type NOT NULL DEFAULT 'all',
  registration_required BOOLEAN DEFAULT FALSE,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  waitlist_enabled BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern JSONB,
  status event_status DEFAULT 'draft',
  image_url TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations table
CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  visitor_id UUID REFERENCES visitors(id),
  registration_type registration_type NOT NULL DEFAULT 'individual',
  status registration_status DEFAULT 'pending',
  attendee_count INTEGER DEFAULT 1,
  guest_details JSONB,
  custom_fields JSONB,
  payment_status payment_status DEFAULT 'completed',
  payment_amount DECIMAL(10,2),
  payment_reference VARCHAR(255),
  checked_in BOOLEAN DEFAULT FALSE,
  check_in_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT event_registrations_user_or_visitor_check 
    CHECK ((user_id IS NOT NULL) OR (visitor_id IS NOT NULL))
);

-- Event volunteers table
CREATE TABLE event_volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  role VARCHAR(100) NOT NULL,
  description TEXT,
  requirements TEXT[],
  capacity INTEGER,
  status volunteer_status DEFAULT 'interested',
  hours_served DECIMAL(5,2),
  check_in_time TIMESTAMP WITH TIME ZONE,
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event resources table
CREATE TABLE event_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  resource_type resource_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity_needed INTEGER DEFAULT 1,
  quantity_confirmed INTEGER DEFAULT 0,
  booking_status booking_status DEFAULT 'requested',
  vendor_contact TEXT,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event communications table
CREATE TABLE event_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  communication_type communication_type NOT NULL,
  channel communication_channel NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  recipients JSONB NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  sent_time TIMESTAMP WITH TIME ZONE,
  status communication_status DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendance table
CREATE TABLE event_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  visitor_id UUID REFERENCES visitors(id),
  registration_id UUID REFERENCES event_registrations(id),
  attendance_status attendance_status NOT NULL DEFAULT 'present',
  check_in_method check_in_method NOT NULL DEFAULT 'manual',
  check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
  check_out_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT event_attendance_user_or_visitor_check 
    CHECK ((user_id IS NOT NULL) OR (visitor_id IS NOT NULL))
);

-- Create indexes for better query performance
CREATE INDEX idx_events_church_id ON events(church_id);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_event_type ON events(event_type);
CREATE INDEX idx_events_created_by ON events(created_by);

CREATE INDEX idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX idx_event_registrations_visitor_id ON event_registrations(visitor_id);
CREATE INDEX idx_event_registrations_status ON event_registrations(status);

CREATE INDEX idx_event_volunteers_event_id ON event_volunteers(event_id);
CREATE INDEX idx_event_volunteers_user_id ON event_volunteers(user_id);
CREATE INDEX idx_event_volunteers_status ON event_volunteers(status);

CREATE INDEX idx_event_resources_event_id ON event_resources(event_id);
CREATE INDEX idx_event_resources_resource_type ON event_resources(resource_type);
CREATE INDEX idx_event_resources_booking_status ON event_resources(booking_status);

CREATE INDEX idx_event_communications_event_id ON event_communications(event_id);
CREATE INDEX idx_event_communications_status ON event_communications(status);
CREATE INDEX idx_event_communications_scheduled_time ON event_communications(scheduled_time);

CREATE INDEX idx_event_attendance_event_id ON event_attendance(event_id);
CREATE INDEX idx_event_attendance_user_id ON event_attendance(user_id);
CREATE INDEX idx_event_attendance_visitor_id ON event_attendance(visitor_id);
CREATE INDEX idx_event_attendance_check_in_time ON event_attendance(check_in_time);

-- Create composite indexes for common query patterns
CREATE INDEX idx_events_church_date_status ON events(church_id, start_date, status);
CREATE INDEX idx_registrations_event_status ON event_registrations(event_id, status);
CREATE INDEX idx_attendance_event_date ON event_attendance(event_id, check_in_time);

-- Create triggers for updating updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_registrations_updated_at BEFORE UPDATE ON event_registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_volunteers_updated_at BEFORE UPDATE ON event_volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_resources_updated_at BEFORE UPDATE ON event_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_communications_updated_at BEFORE UPDATE ON event_communications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_event_attendance_updated_at BEFORE UPDATE ON event_attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendance ENABLE ROW LEVEL SECURITY;

-- Events policies
CREATE POLICY "Users can view events from their church" ON events
  FOR SELECT USING (church_id = (SELECT church_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Church admins can insert events" ON events
  FOR INSERT WITH CHECK (
    church_id = (SELECT church_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff')
  );

CREATE POLICY "Event creators and church admins can update events" ON events
  FOR UPDATE USING (
    church_id = (SELECT church_id FROM users WHERE id = auth.uid()) AND
    (created_by = auth.uid() OR (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff'))
  );

CREATE POLICY "Church admins can delete events" ON events
  FOR DELETE USING (
    church_id = (SELECT church_id FROM users WHERE id = auth.uid()) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff')
  );

-- Event registrations policies
CREATE POLICY "Users can view registrations from their church events" ON event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own registrations" ON event_registrations
  FOR UPDATE USING (user_id = auth.uid() OR visitor_id = auth.uid());

-- Event volunteers policies
CREATE POLICY "Users can view volunteers from their church events" ON event_volunteers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can volunteer for events" ON event_volunteers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

-- Event resources policies
CREATE POLICY "Users can view resources from their church events" ON event_resources
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Church staff can manage event resources" ON event_resources
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    ) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff')
  );

-- Event communications policies
CREATE POLICY "Users can view communications from their church events" ON event_communications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Church staff can manage event communications" ON event_communications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    ) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff')
  );

-- Event attendance policies
CREATE POLICY "Users can view attendance from their church events" ON event_attendance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Church staff can manage event attendance" ON event_attendance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM events e 
      WHERE e.id = event_id AND e.church_id = (SELECT church_id FROM users WHERE id = auth.uid())
    ) AND
    (SELECT role FROM users WHERE id = auth.uid()) IN ('church_admin', 'staff')
  );

-- Create views for common queries
CREATE VIEW event_registrations_with_details AS
SELECT 
  er.*,
  e.title as event_title,
  e.start_date,
  e.start_time,
  e.location,
  u.full_name as user_name,
  u.email as user_email,
  u.phone as user_phone,
  v.full_name as visitor_name,
  v.email as visitor_email,
  v.phone as visitor_phone
FROM event_registrations er
LEFT JOIN events e ON er.event_id = e.id
LEFT JOIN users u ON er.user_id = u.id
LEFT JOIN visitors v ON er.visitor_id = v.id;

CREATE VIEW event_statistics AS
SELECT 
  e.id,
  e.title,
  e.start_date,
  e.capacity,
  COUNT(er.id) as total_registrations,
  COUNT(CASE WHEN er.status = 'confirmed' THEN 1 END) as confirmed_registrations,
  COUNT(CASE WHEN er.status = 'waitlisted' THEN 1 END) as waitlisted_registrations,
  COUNT(CASE WHEN er.checked_in = true THEN 1 END) as checked_in_count,
  COUNT(ev.id) as total_volunteers,
  COUNT(CASE WHEN ev.status = 'confirmed' THEN 1 END) as confirmed_volunteers,
  COALESCE(SUM(er.payment_amount), 0) as total_revenue
FROM events e
LEFT JOIN event_registrations er ON e.id = er.event_id AND er.status != 'cancelled'
LEFT JOIN event_volunteers ev ON e.id = ev.event_id
GROUP BY e.id, e.title, e.start_date, e.capacity;

-- Insert some sample data for testing
INSERT INTO events (
  church_id, title, description, location, start_date, end_date, start_time, end_time,
  event_type, category, capacity, cost_type, audience_type, registration_required,
  status, created_by
) VALUES (
  (SELECT id FROM churches LIMIT 1),
  'Sunday Morning Worship',
  'Join us for our weekly worship service with inspiring music and biblical teaching.',
  'Main Sanctuary',
  CURRENT_DATE + INTERVAL '7 days',
  CURRENT_DATE + INTERVAL '7 days',
  '10:00:00',
  '11:30:00',
  'worship',
  'Weekly Service',
  200,
  'free',
  'all',
  false,
  'published',
  (SELECT id FROM users WHERE role = 'church_admin' LIMIT 1)
),
(
  (SELECT id FROM churches LIMIT 1),
  'Youth Group Game Night',
  'A fun evening of games, fellowship, and snacks for our youth group.',
  'Youth Room',
  CURRENT_DATE + INTERVAL '14 days',
  CURRENT_DATE + INTERVAL '14 days',
  '18:00:00',
  '20:00:00',
  'youth',
  'Fellowship',
  30,
  'free',
  'youth',
  true,
  'published',
  (SELECT id FROM users WHERE role = 'church_admin' LIMIT 1)
),
(
  (SELECT id FROM churches LIMIT 1),
  'Annual Church Retreat',
  'A weekend getaway for spiritual renewal and community building.',
  'Pine Valley Retreat Center',
  CURRENT_DATE + INTERVAL '60 days',
  CURRENT_DATE + INTERVAL '62 days',
  '18:00:00',
  '15:00:00',
  'retreat',
  'Special Event',
  80,
  'paid',
  'adults',
  true,
  'published',
  (SELECT id FROM users WHERE role = 'church_admin' LIMIT 1)
);

-- Grant appropriate permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON events, event_registrations, event_volunteers, event_resources, event_communications, event_attendance TO authenticated;