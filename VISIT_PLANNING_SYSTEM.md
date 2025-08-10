# Visit Planning System Documentation

## Overview

The Visit Planning System is a comprehensive solution for managing church visitor scheduling, from initial interest to successful visit completion and follow-up. It integrates seamlessly with the existing chat system and provides a complete visitor journey management experience.

## Features

### 🏛️ Core Functionality

1. **Multi-Tenant Service Time Management**
   - Church-specific service schedules
   - Visitor-friendly service identification
   - Capacity management and availability tracking
   - Special notes and accommodation support

2. **Comprehensive Visit Planning**
   - Intuitive visitor information collection
   - Party size management (adults/children)
   - Special needs and accommodation requests
   - Contact preference management

3. **Automated Communication System**
   - Email confirmation with visit details
   - Reminder emails (3 days, 1 day, 2 hours before)
   - Calendar integration (iCal format)
   - Post-visit follow-up sequences

4. **Admin Dashboard**
   - Real-time visit management
   - Status tracking and updates
   - Analytics and reporting
   - Lead source analysis

5. **Chat Integration**
   - Automatic conversation analysis
   - Visit intent detection
   - Seamless conversion from chat to visit plan
   - Lead scoring and qualification

## Database Schema

### Core Tables

#### `service_times`
Manages church service schedules with visitor-friendly options.

```sql
- id (UUID)
- name (VARCHAR) - "Sunday Morning Worship"
- day_of_week (INTEGER) - 0=Sunday, 6=Saturday
- start_time/end_time (TIME)
- service_type (VARCHAR) - worship, bible_study, youth, etc.
- capacity (INTEGER)
- is_visitor_friendly (BOOLEAN)
- special_notes (TEXT)
- location (VARCHAR)
- requires_registration (BOOLEAN)
```

#### `visit_plans`
Central table for all visit bookings and tracking.

```sql
- id (UUID)
- service_time_id (UUID FK)
- visitor_name/email/phone (VARCHAR)
- planned_date (DATE)
- party_size/adults_count/children_count (INTEGER)
- children_ages (INTEGER[])
- special accommodations (BOOLEAN fields)
- status (ENUM: planned, confirmed, attended, no_show, cancelled)
- lead_source (VARCHAR)
- chat_conversation_id (UUID)
- Follow-up tracking fields
- Analytics fields (utm_source, etc.)
```

#### `visit_confirmation_tokens`
Secure email confirmation tokens with expiration.

#### `visit_communications`
Complete audit trail of all visitor communications.

#### `visit_analytics`
Daily metrics and conversion tracking.

#### `first_time_visitors`
Detailed first-time visitor tracking for follow-up.

## API Endpoints

### Public Endpoints

- `GET /api/visits/services` - Get available service times
- `POST /api/visits/plan` - Create new visit plan
- `GET /api/visits/:id` - Get visit details
- `GET /api/visits/confirm/:token` - Confirm visit via email token
- `GET /api/visits/:id/calendar` - Download calendar file

### Admin Endpoints

- `PUT /api/visits/:id/status` - Update visit status
- `GET /api/admin/visits` - Get all visits (paginated, filtered)
- `GET /api/admin/visits/analytics` - Visit analytics and metrics

### Query Parameters

#### Service Times (`/api/visits/services`)
```javascript
{
  start_date: "2024-01-01",          // Required
  end_date: "2024-03-31",            // Optional (defaults to +90 days)
  service_type: "worship",           // Optional filter
  visitor_friendly_only: true       // Optional (default: true)
}
```

#### Admin Visits (`/api/admin/visits`)
```javascript
{
  page: 1,                          // Page number
  limit: 25,                        // Results per page
  status: "confirmed",              // Filter by status
  service_id: "uuid",               // Filter by service
  start_date: "2024-01-01",         // Date range filter
  end_date: "2024-01-31",
  search: "john doe"                // Search name/email
}
```

## Component Architecture

### React Components

#### `VisitPlanningForm`
Multi-step form for collecting visitor information:
- Service selection with availability display
- Contact information collection
- Party size and children details
- Special accommodations
- Lead source tracking

#### `AdminVisitsDashboard`
Complete admin interface featuring:
- Analytics cards with key metrics
- Filterable visits table
- Bulk status updates
- Visit detail modal
- Export capabilities

#### `VisitConfirmation`
Visitor confirmation experience:
- Token-based or ID-based access
- Visit details display
- Calendar download
- Confirmation actions

#### `ChatToVisitIntegration`
AI-powered chat conversion:
- Automatic information extraction
- Conversation analysis
- Pre-filled form data
- Conversion tracking

### Service Classes

#### `VisitPlanningService`
Core business logic for visit management:
```typescript
class VisitPlanningService {
  async getAvailableServices(query)
  async createVisitPlan(data, metadata)
  async updateVisitStatus(id, updates)
  async confirmVisit(token)
  async getVisitsForAdmin(params)
  async getVisitAnalytics(startDate, endDate)
  async generateCalendarData(visitId)
}
```

#### `VisitEmailService`
Comprehensive email communication system:
```typescript
class VisitEmailService {
  async sendVisitConfirmation(visit)
  async sendVisitReminder(visit, daysUntilVisit)
  async sendPostVisitFollowUp(visit, attended)
}
```

## Email Templates

### Confirmation Email
- Welcome message with visit details
- Service information and special notes
- Accommodation confirmations
- What to expect section
- Contact information
- Calendar download link

### Reminder Emails
- 3 days before: General reminder with details
- 1 day before: Detailed preparation information
- 2 hours before: Final reminder with directions

### Follow-up Emails
- **Attended**: Thank you with next steps
- **No-show**: Gentle re-engagement invitation

## Integration Points

### Chat System Integration

1. **Conversation Analysis**
   - Intent detection for visit planning
   - Information extraction from messages
   - Lead scoring based on engagement

2. **Seamless Conversion**
   - One-click conversion from chat to visit plan
   - Pre-populated forms with extracted data
   - Conversation context preservation

3. **Lead Tracking**
   - Chat conversation ID linking
   - Attribution tracking
   - Engagement analytics

### Calendar Integration

1. **iCal Generation**
   - Standard calendar format
   - Automatic reminders
   - Event details and location
   - Contact information

2. **Popular Calendar Support**
   - Google Calendar
   - Apple Calendar
   - Outlook
   - Yahoo Calendar

### Analytics Integration

1. **Visit Funnel Tracking**
   - Planned → Confirmed → Attended
   - Drop-off point identification
   - Conversion optimization

2. **Lead Source Analysis**
   - Website, chat, referral tracking
   - Campaign attribution
   - ROI measurement

## Setup and Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...

# Email Configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Application URLs
NEXT_PUBLIC_BASE_URL=https://yourchurch.com

# Church Information
CHURCH_NAME=Your Church Name
CHURCH_ADDRESS=123 Church St, City, State 12345
CHURCH_PHONE=+1-234-567-8900
CHURCH_EMAIL=info@yourchurch.com
CHURCH_WEBSITE=https://yourchurch.com
```

### Database Setup

1. Run the main database setup:
   ```sql
   -- Execute database-setup.sql
   ```

2. Add visit planning tables:
   ```sql
   -- Execute visit-planning-database.sql
   ```

3. Configure service times:
   ```sql
   INSERT INTO service_times (name, day_of_week, start_time, end_time, ...)
   VALUES ('Sunday Morning', 0, '09:00', '10:30', ...);
   ```

### Component Usage

#### Basic Visit Planning Form
```tsx
import { VisitPlanningForm } from '@/components/VisitPlanning/VisitPlanningForm';

<VisitPlanningForm
  onSuccess={(visit) => console.log('Visit planned:', visit)}
  prefillData={{
    visitor_name: 'John Doe',
    visitor_email: 'john@example.com',
    lead_source: 'website'
  }}
/>
```

#### Admin Dashboard
```tsx
import { AdminVisitsDashboard } from '@/components/VisitPlanning/AdminVisitsDashboard';

<AdminVisitsDashboard tenantId="your-tenant-id" />
```

#### Chat Integration
```tsx
import { ChatToVisitIntegration } from '@/components/VisitPlanning/ChatToVisitIntegration';

<ChatToVisitIntegration
  conversationId="chat-uuid"
  messages={chatMessages}
  onVisitPlanned={(visit) => handleVisitPlanned(visit)}
/>
```

## Security Considerations

### Data Protection
- All visitor data encrypted at rest
- Secure token generation for confirmations
- GDPR-compliant data handling
- PII data retention policies

### Access Control
- Role-based admin access
- Tenant isolation
- Audit logging for all changes
- Rate limiting on public endpoints

### Token Security
- Cryptographically secure token generation
- Automatic expiration (7 days)
- Single-use confirmation tokens
- Secure URL construction

## Analytics and Reporting

### Key Metrics

1. **Conversion Funnel**
   - Visit Plans Created
   - Confirmations Sent
   - Visits Confirmed
   - Actual Attendance
   - Follow-up Completion

2. **Lead Analysis**
   - Source attribution
   - Quality scoring
   - Conversion rates by source
   - Time to conversion

3. **Service Performance**
   - Popular service times
   - Capacity utilization
   - No-show rates
   - Repeat visitor rates

### Dashboard Views

1. **Executive Summary**
   - Top-line metrics
   - Trend analysis
   - Goal tracking

2. **Operational Dashboard**
   - Upcoming visits
   - Required actions
   - Communication status
   - Capacity planning

3. **Detailed Reports**
   - Visit history
   - Visitor demographics
   - Service analysis
   - Follow-up effectiveness

## Performance Optimization

### Database Optimization
- Appropriate indexing on frequently queried fields
- Partitioning for large datasets
- Query optimization for dashboard views
- Automated cleanup of expired tokens

### Caching Strategy
- Service times cached for quick access
- Analytics data cached with refresh intervals
- Static content CDN distribution

### Email Performance
- Queue-based email sending
- Template caching
- Delivery tracking and optimization
- Bounce handling and list hygiene

## Testing Strategy

### Unit Tests
- Service class methods
- Data validation
- Email template generation
- Calendar generation

### Integration Tests
- API endpoint functionality
- Database operations
- Email sending
- Chat integration

### End-to-End Tests
- Complete visitor journey
- Admin workflows
- Email confirmation flow
- Calendar integration

## Monitoring and Maintenance

### Health Checks
- Database connectivity
- Email service status
- API response times
- Queue processing

### Alerts
- Failed email deliveries
- High no-show rates
- System errors
- Capacity issues

### Maintenance Tasks
- Token cleanup (daily)
- Analytics aggregation (nightly)
- Email bounce processing
- Database optimization (weekly)

## Future Enhancements

### Planned Features
1. SMS notifications and reminders
2. Multi-language support
3. Advanced visitor segmentation
4. Integration with church management systems
5. Mobile app for staff
6. Automated pastoral assignment
7. Video call integration for virtual visits
8. Advanced analytics and ML insights

### API Extensions
1. Webhook support for external integrations
2. Bulk operations for data import/export
3. Advanced filtering and search
4. Custom field support
5. Multi-church/campus support

## Troubleshooting

### Common Issues

1. **Emails not sending**
   - Check SMTP configuration
   - Verify email service status
   - Check rate limits

2. **Calendar downloads not working**
   - Verify base URL configuration
   - Check file permissions
   - Test calendar generation

3. **Chat integration not working**
   - Verify conversation ID linking
   - Check message format
   - Test information extraction

### Debug Endpoints

- `GET /api/debug/email-config` - Test email configuration
- `GET /api/debug/calendar/:visitId` - Test calendar generation
- `POST /api/debug/extract-info` - Test chat information extraction

## Support and Documentation

### Additional Resources
- API documentation: `/api/docs`
- Component documentation: Storybook
- Database schema: Auto-generated docs
- Email template previews: Admin interface

### Getting Help
- GitHub Issues for bug reports
- Documentation wiki
- Community forum
- Professional support available

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: Next.js 14+, React 18+, Node.js 18+