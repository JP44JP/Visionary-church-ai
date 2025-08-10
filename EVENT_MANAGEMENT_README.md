# Comprehensive Event Management System

A complete event management solution for the church SaaS platform, designed to handle everything from small group meetings to large worship services and special events.

## Features Overview

### 1. Event Creation and Management
- **Recurring and one-time events** with flexible recurrence patterns
- **Multi-location support** for churches with multiple venues
- **Capacity limits and waitlist management** to handle high-demand events
- **Age group and audience targeting** for demographic-specific events
- **Cost management** supporting free, paid, donation, and suggested donation models
- **Resource booking** for rooms, equipment, volunteers, and vendors

### 2. Registration System
- **Public RSVP** with guest management capabilities
- **Dynamic registration forms** with custom fields
- **Payment processing integration** via Stripe
- **Group registration** for families and organizations
- **Registration deadline management** with automated cutoffs
- **Cancellation and refund policies** with flexible terms

### 3. Communication and Reminders
- **Event announcements** with multi-channel delivery
- **Automated reminder sequences** via email and SMS
- **QR codes for check-in** and mobile app integration
- **Last-minute changes** and cancellation notifications
- **Post-event thank you** and feedback collection

### 4. Volunteer Management
- **Role definitions** with skill requirements
- **Sign-up and scheduling** system
- **Skill matching** and preference tracking
- **Communication portal** for volunteer coordination
- **Service hour tracking** and reporting
- **Appreciation system** for volunteer recognition

### 5. Attendance Tracking
- **Multi-method check-in** (QR codes, manual, mobile app, kiosk)
- **Real-time attendance monitoring**
- **No-show tracking** and automated follow-up
- **Attendance analytics** and trend analysis
- **Member engagement scoring**
- **Follow-up campaigns** for missed events

### 6. Resource Management
- **Facility booking** with conflict detection
- **Equipment reservation** system
- **Catering and supply coordination**
- **Budget tracking** and cost reporting
- **Vendor management** with contact information
- **Setup and teardown** planning tools

### 7. Analytics and Reporting
- **Event attendance trends** over time
- **Registration conversion rates** analysis
- **Revenue and cost analysis** with ROI calculations
- **Volunteer participation metrics**
- **Member engagement insights**
- **Demographic breakdowns** and targeting insights

## Technical Architecture

### Database Schema

The system uses 6 core tables with comprehensive relationships:

- `events` - Main event information with recurrence patterns
- `event_registrations` - Registration data with payment tracking
- `event_volunteers` - Volunteer assignments and hour tracking
- `event_resources` - Resource bookings and vendor management
- `event_communications` - Message history and scheduling
- `event_attendance` - Check-in data and attendance analytics

### API Endpoints

#### Public Endpoints
- `GET /api/events/public` - Public event listings
- `POST /api/events/[id]/register` - Event registration

#### Admin Endpoints
- `GET /api/events` - List all events with filtering
- `POST /api/events` - Create new event
- `GET /api/events/[id]` - Get event details
- `PUT /api/events/[id]` - Update event
- `DELETE /api/events/[id]` - Delete event

#### Registration Management
- `GET /api/events/[id]/attendees` - Get attendee list
- `PUT /api/events/[id]/checkin` - Check in attendee
- `POST /api/events/[id]/checkin/qr` - Generate QR code

#### Volunteer Management
- `GET /api/events/[id]/volunteers` - List volunteers
- `POST /api/events/[id]/volunteers` - Add volunteer
- `PUT /api/events/[id]/volunteers/[volunteerId]` - Update volunteer status

#### Resource Management
- `GET /api/events/[id]/resources` - List resources
- `POST /api/events/[id]/resources` - Add resource

#### Analytics
- `GET /api/events/[id]/analytics` - Event-specific analytics
- `GET /api/admin/events/analytics` - Overall event analytics

### Services

#### EventService
Core business logic for event management including:
- CRUD operations for events
- Registration processing
- Volunteer management
- Resource booking
- Attendance tracking
- Analytics calculation
- Recurring event generation

#### CommunicationService
Handles all event-related communications:
- Template management for different message types
- Multi-channel delivery (email, SMS, push notifications)
- Scheduled messaging
- Variable substitution
- Delivery tracking

#### PaymentService
Stripe integration for event payments:
- Payment intent creation
- Payment confirmation
- Refund processing
- Customer management
- Subscription handling for recurring donations
- Receipt generation

### Frontend Components

#### EventDashboard
Main dashboard showing:
- Event statistics overview
- Upcoming and recent events
- Quick actions
- Alert notifications
- Popular event types

#### EventList
Comprehensive event listing with:
- Advanced filtering
- Sorting options
- Pagination
- Search functionality
- Bulk operations

#### EventCard
Reusable event display component with:
- Event details
- Registration status
- Action buttons
- Status indicators
- Responsive design

#### EventFilters
Advanced filtering interface supporting:
- Date range selection
- Event type filtering
- Status filtering
- Audience targeting
- Cost-based filtering
- Location filtering

## Key Features Deep Dive

### Recurring Events
The system supports complex recurrence patterns:
```typescript
interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every X days/weeks/months/years
  byWeekDay?: number[]; // 0 = Sunday, 1 = Monday, etc.
  byMonthDay?: number[]; // Day of month (1-31)
  byMonth?: number[]; // Month (1-12)
  until?: string; // End date
  count?: number; // Number of occurrences
}
```

### Registration System
Flexible registration with:
- Individual, group, and family registrations
- Custom form fields
- Payment processing
- Waitlist management
- Automatic confirmation emails

### Check-in System
Multiple check-in methods:
- QR code scanning
- Manual check-in by staff
- Mobile app integration
- Kiosk mode for self-service

### Analytics Dashboard
Comprehensive metrics including:
- Attendance rates
- Registration conversion
- Revenue tracking
- Volunteer participation
- Member engagement scoring

## Integration Points

### Calendar Systems
- iCal feed generation
- Google Calendar sync
- Outlook integration
- Website calendar widgets

### Payment Processing
- Stripe integration for card payments
- ACH payments for large donations
- Recurring payment support
- Automated refund processing

### Communication Channels
- SendGrid for email delivery
- Twilio for SMS notifications
- Firebase for push notifications
- In-app messaging system

### Mobile App
- Event browsing and registration
- QR code check-in
- Volunteer scheduling
- Push notifications

### Website Integration
- Embeddable event widgets
- Public event calendar
- Registration forms
- Payment processing

## Security and Permissions

### Row Level Security (RLS)
- Church-based data isolation
- Role-based access control
- Event creator permissions
- Volunteer self-management

### API Security
- JWT authentication
- Rate limiting
- Input validation with Zod
- CORS configuration

### Payment Security
- PCI compliance via Stripe
- Encrypted payment data
- Secure webhook handling
- Fraud detection

## Scalability Considerations

### Database Optimization
- Comprehensive indexing strategy
- Query optimization
- Connection pooling
- Read replicas for analytics

### Caching Strategy
- Event data caching
- User session caching
- Analytics data caching
- CDN for static assets

### Performance Monitoring
- API response time tracking
- Database query analysis
- Error rate monitoring
- User experience metrics

## Deployment and Configuration

### Environment Variables
```env
# Database
DATABASE_URL=
REDIS_URL=

# Payment Processing
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Communication Services
SENDGRID_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=

# Feature Flags
ENABLE_EMAIL_AUTOMATION=true
ENABLE_SMS_NOTIFICATIONS=true
ENABLE_ANALYTICS=true
```

### Database Migration
Run the migration script to create all necessary tables:
```bash
psql -d your_database < database/migrations/create_events_tables.sql
```

## Usage Examples

### Creating a Recurring Event
```typescript
const eventData: EventCreateRequest = {
  title: "Weekly Bible Study",
  description: "Join us every Wednesday for biblical study and discussion",
  location: "Fellowship Hall",
  startDate: "2024-01-03",
  endDate: "2024-01-03",
  startTime: "19:00",
  endTime: "20:30",
  eventType: "bible_study",
  category: "Weekly Study",
  capacity: 30,
  costType: "free",
  audienceType: "adults",
  registrationRequired: true,
  isRecurring: true,
  recurrencePattern: {
    frequency: "weekly",
    interval: 1,
    byWeekDay: [3], // Wednesday
    count: 52 // One year
  },
  settings: {
    allowWaitlist: true,
    sendReminders: true,
    reminderSchedule: [
      { days: 7, hours: 0 },
      { days: 1, hours: 0 }
    ],
    customFields: [],
    cancellationPolicy: {
      allowCancellation: true,
      deadlineHours: 24,
      refundPolicy: "Full refund if cancelled 24 hours before"
    },
    checkInSettings: {
      enableQRCode: true,
      enableManualCheckIn: true,
      enableMobileApp: true,
      requireCheckOut: false
    }
  }
};

const event = await eventService.createEvent(churchId, userId, eventData);
```

### Processing Registration
```typescript
const registrationData: EventRegistrationRequest = {
  eventId: "event-uuid",
  registrationType: "family",
  attendeeCount: 4,
  userDetails: {
    userId: "user-uuid"
  },
  guestDetails: [
    { name: "John Doe", ageGroup: "adult" },
    { name: "Jane Doe", ageGroup: "adult" },
    { name: "Jimmy Doe", ageGroup: "child" },
    { name: "Jenny Doe", ageGroup: "child" }
  ],
  customFields: {
    dietary_restrictions: "No nuts",
    emergency_contact: "555-0123"
  },
  paymentInfo: {
    amount: 50.00,
    method: "credit_card"
  }
};

const registration = await eventService.registerForEvent(registrationData);
```

### Check-in Attendee
```typescript
const result = await eventService.checkInAttendee(
  eventId,
  registrationId,
  'qr_code'
);

if (result.success) {
  console.log('Check-in successful:', result.attendeeInfo);
} else {
  console.error('Check-in failed:', result.message);
}
```

This comprehensive event management system provides everything needed to run successful church events, from planning and promotion to execution and follow-up. The modular architecture allows for easy customization and extension while maintaining security and performance at scale.