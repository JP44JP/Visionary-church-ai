# Prayer Request Management System

## Overview

The Prayer Request Management System is a comprehensive solution for churches to handle prayer requests efficiently, compassionately, and securely. The system provides public submission forms, intelligent routing, team management, and detailed analytics while maintaining HIPAA-compliant data handling.

## Key Features

### 1. Prayer Request Submission
- **Public Forms**: Embeddable forms for church websites
- **Chat Widget Integration**: Direct prayer request capture through AI chat
- **Anonymous Requests**: Option for anonymous submissions
- **Category Classification**: 15 predefined categories (healing, guidance, etc.)
- **Urgency Levels**: Routine, urgent, and emergency classifications
- **Privacy Settings**: Public, prayer team only, leadership only, or private

### 2. Intelligent Routing and Assignment
- **Auto-Assignment**: Automatic routing based on multiple algorithms
- **Load Balancing**: Distributes requests evenly among team members
- **Skill-Based Routing**: Matches requests to specialized team members
- **Emergency Escalation**: Immediate notification for urgent requests
- **Pastor Notifications**: Automatic alerts for sensitive situations

### 3. Prayer Team Management
- **Role-Based Access**: Team leaders, members, and trainees
- **Availability Scheduling**: Configurable availability windows
- **Capacity Management**: Prevents team member overload
- **Specialty Assignments**: Members can specialize in specific prayer areas
- **Emergency Contacts**: On-call members for crisis situations

### 4. Communication System
- **Status Updates**: Automated notifications to requesters
- **Internal Messaging**: Team communication and coordination
- **Email Integration**: Confirmation and update emails
- **Anonymous Feedback**: Safe communication channels
- **Follow-up Tracking**: Scheduled follow-up reminders

### 5. Analytics and Reporting
- **Volume Tracking**: Request trends and patterns
- **Response Times**: Team performance metrics
- **Category Analysis**: Popular prayer request types
- **Satisfaction Ratings**: User feedback collection
- **Custom Reports**: Configurable analytics dashboards

### 6. Security and Privacy
- **HIPAA Compliance**: Secure handling of sensitive information
- **Data Encryption**: All sensitive data encrypted at rest and in transit
- **Access Controls**: Role-based permissions and audit logs
- **Auto-Archival**: Automatic cleanup of old requests
- **Consent Management**: Clear consent tracking and management

## System Architecture

### Database Design
- **prayer_requests**: Core prayer request data with metadata
- **prayer_teams**: Team structure and configuration
- **prayer_team_members**: Individual team member profiles
- **prayer_assignments**: Request-to-member assignments
- **prayer_responses**: Team responses and updates
- **prayer_communications**: Communication logs and history

### API Endpoints
- `POST /api/prayers/submit` - Submit new prayer request
- `GET /api/prayers/team/:id` - Get assigned prayers for team member
- `PUT /api/prayers/:id/status` - Update prayer request status
- `POST /api/prayers/:id/respond` - Add prayer response
- `GET /api/admin/prayers/analytics` - Administrative analytics

### Integration Points
- **Chat Widget**: Seamless prayer request capture
- **Email System**: Automated notifications and updates
- **Church Dashboard**: Administrative interface
- **Mobile App**: Future mobile application support

## Implementation Files

### Core Service Layer
- `/src/services/prayerService.ts` - Main service class with all prayer management functionality

### API Endpoints
- `/src/app/api/prayers/submit/route.ts` - Prayer submission endpoint
- `/src/app/api/prayers/team/[id]/route.ts` - Team member dashboard endpoint
- `/src/app/api/prayers/[id]/status/route.ts` - Status update endpoint
- `/src/app/api/prayers/[id]/respond/route.ts` - Response submission endpoint
- `/src/app/api/admin/prayers/analytics/route.ts` - Analytics and reporting endpoint

### Frontend Components
- `/src/components/prayer/PrayerRequestForm.tsx` - Public submission form
- `/src/components/prayer/PrayerDashboard.tsx` - Team management dashboard
- `/src/components/prayer/PrayerRequestDetail.tsx` - Request details view
- `/src/components/prayer/PrayerAnalyticsDashboard.tsx` - Analytics visualization

### Database Schema
- `/supabase/migrations/20240810000001_prayer_request_system.sql` - Complete database schema with tables, indexes, triggers, and security policies

### Chat Widget Integration
- Enhanced chat widget with prayer request capture functionality
- Form-based prayer submission within chat interface
- Automatic routing to prayer teams

## Usage Examples

### Submitting a Prayer Request (Public Form)
```typescript
import { PrayerRequestForm } from '@/components/prayer/PrayerRequestForm'

<PrayerRequestForm 
  churchId="church-uuid"
  onSuccess={(requestId) => console.log('Request submitted:', requestId)}
  onError={(error) => console.error('Submission failed:', error)}
/>
```

### Team Dashboard Integration
```typescript
import { PrayerDashboard } from '@/components/prayer/PrayerDashboard'

<PrayerDashboard 
  churchId="church-uuid"
  userRole="prayer_team_member"
  userId="user-uuid"
/>
```

### Chat Widget Prayer Request
The chat widget automatically detects prayer request intents and provides an inline form for submission. When users mention prayer needs, the AI presents a comprehensive prayer request form within the chat interface.

## Security Considerations

### Data Protection
- All prayer requests are encrypted at rest
- Sensitive information detection and flagging
- Automatic anonymization of old requests
- Secure deletion of archived data

### Access Control
- Row-level security policies in Supabase
- Role-based access control
- Session-based authentication
- API rate limiting and validation

### Compliance
- HIPAA-compliant data handling procedures
- Consent tracking and management
- Audit logs for all data access
- Data retention policies

## Configuration

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SMTP_HOST=your-email-host
SMTP_USER=your-email-user
SMTP_PASS=your-email-password
```

### Church Settings
```typescript
interface PrayerSettings {
  auto_assignment: boolean
  assignment_algorithm: 'round_robin' | 'load_based' | 'specialty_based'
  max_requests_per_member: number
  emergency_escalation_time: number // minutes
  follow_up_schedule: {
    initial: number // hours
    ongoing: number // days
  }
  notification_preferences: {
    new_requests: boolean
    assignments: boolean
    follow_ups: boolean
    emergencies: boolean
  }
}
```

## Future Enhancements

### Planned Features
- Mobile application for team members
- Advanced sentiment analysis for request categorization
- Integration with calendar systems for follow-up scheduling
- Multilingual support for international churches
- Voice-to-text prayer request submission
- Integration with pastoral care systems

### API Expansions
- Bulk import/export capabilities
- Third-party integration webhooks
- Advanced search and filtering
- Custom field definitions
- Automated report generation and delivery

## Support and Maintenance

### Monitoring
- Request volume and response time monitoring
- Team performance dashboards
- System health checks and alerts
- User satisfaction tracking

### Backup and Recovery
- Automated database backups
- Point-in-time recovery capabilities
- Data export tools for compliance
- Disaster recovery procedures

This prayer request management system provides churches with a professional, secure, and caring way to handle their community's prayer needs while maintaining the highest standards of privacy and pastoral care.