# Follow-up Sequences System

A comprehensive automated follow-up sequence system for the church SaaS platform that enables personalized email and SMS campaigns to nurture visitors, members, and prayer request contacts.

## Overview

The follow-up sequences system provides:

- **Multi-channel Communication**: Email and SMS support
- **Automated Triggers**: Event-based and time-based sequence triggers
- **Personalization**: Dynamic content with template variables
- **Analytics & Tracking**: Open rates, click-through rates, conversions
- **Deliverability**: Multiple provider support with failover
- **Compliance**: Unsubscribe management and preference handling

## Architecture

### Database Schema

The system extends the existing multi-tenant database with new tables in each tenant schema:

- `follow_up_sequences` - Sequence definitions
- `sequence_steps` - Individual steps within sequences
- `message_templates` - Reusable message templates
- `sequence_enrollments` - User enrollments in sequences
- `sequence_messages` - Message queue and delivery history
- `communication_preferences` - User preferences and unsubscribe management
- `sequence_analytics` - Performance metrics
- Supporting tables for A/B testing, webhooks, and optimization

### Services Architecture

```
SequenceService (Main business logic)
├── EmailService (Multi-provider email delivery)
├── SMSService (Multi-provider SMS delivery)
└── SequenceProcessor (Background job processing)
```

### API Endpoints

#### Sequences Management
- `GET /api/sequences` - List sequences
- `POST /api/sequences` - Create sequence
- `PUT /api/sequences/[id]` - Update sequence
- `DELETE /api/sequences/[id]` - Delete sequence

#### Enrollments
- `POST /api/sequences/enroll` - Enroll user in sequence
- `PUT /api/sequences/[id]/pause` - Pause/resume enrollment
- `GET /api/sequences/enroll` - Get enrollments

#### Templates
- `GET /api/sequences/templates` - List templates
- `POST /api/sequences/templates` - Create template
- `PUT /api/sequences/templates/[id]` - Update template
- `DELETE /api/sequences/templates/[id]` - Delete template

#### Analytics
- `GET /api/admin/sequences/analytics` - Get analytics data

#### Processing
- `POST /api/sequences/process` - Manual processing trigger
- `GET /api/sequences/process` - Processing status

#### Webhooks
- `POST /api/webhooks/email-delivery` - Email delivery status
- `POST /api/webhooks/sms-delivery` - SMS delivery status
- `POST /api/unsubscribe` - Handle unsubscribe requests

## Features

### 1. Email Sequence Management

**Welcome Series Example:**
```typescript
const welcomeSequence = {
  name: "New Member Welcome",
  sequence_type: "welcome",
  trigger_event: "new_member",
  steps: [
    {
      step_order: 1,
      step_type: "email",
      name: "Welcome Email",
      subject: "Welcome to {{church_name}}!",
      content_template: "Dear {{first_name}}, welcome to our church family...",
      delay_after_previous: 0
    },
    {
      step_order: 2,
      step_type: "email", 
      name: "Getting Started",
      subject: "Your next steps at {{church_name}}",
      content_template: "Hi {{first_name}}, here's how to get involved...",
      delay_after_previous: 10080 // 7 days in minutes
    }
  ]
}
```

**Pre-visit Reminders:**
- 3 days before: "Looking forward to seeing you"
- 1 day before: "Tomorrow is the day!"
- 2 hours before: SMS reminder with address

### 2. SMS Integration

**Supported Providers:**
- Twilio (primary)
- MessageBird
- Vonage (formerly Nexmo)
- AWS SNS (planned)

**Features:**
- Automatic message splitting for long messages
- Opt-out handling ("STOP" keyword)
- Delivery status tracking
- Rate limiting

### 3. Trigger System

**Event-based Triggers:**
- `new_member` - New member registration
- `visit_scheduled` - Visit appointment booked
- `visit_completed` - Visit marked as completed
- `visit_missed` - No-show for scheduled visit
- `prayer_request_created` - New prayer request submitted
- `chat_completed` - AI chat session ended
- `form_submitted` - Contact form submitted

**Time-based Triggers:**
- Birthday sequences
- Anniversary sequences
- Seasonal campaigns

### 4. Template Management

**Variable System:**
Available variables include:
- `{{first_name}}`, `{{last_name}}`, `{{full_name}}`
- `{{email}}`, `{{phone}}`
- `{{church_name}}`, `{{church_address}}`, `{{pastor_name}}`
- `{{visit_date}}`, `{{visit_time}}`, `{{visit_type}}`
- `{{prayer_request}}`
- `{{unsubscribe_url}}`

**Multi-language Support:**
Templates can be created in multiple languages with automatic selection based on user preferences.

### 5. Analytics & Tracking

**Key Metrics:**
- Enrollment rates
- Open rates (email)
- Click-through rates
- Conversion rates
- Unsubscribe rates
- Revenue attribution

**Performance Tracking:**
- Sequence performance comparison
- A/B testing support
- Step-by-step analysis
- Time-to-conversion metrics

### 6. Deliverability Features

**Email Providers:**
- SendGrid (primary)
- Mailgun
- SMTP fallback
- AWS SES (planned)

**Deliverability Optimization:**
- Multiple provider failover
- Bounce and complaint handling
- Send time optimization
- Rate limiting
- Reputation monitoring

## Setup Instructions

### 1. Database Setup

Run the database migration:
```sql
-- Execute the follow-up-sequences-database.sql file
-- This creates all necessary tables and default data
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Email Configuration
SENDGRID_API_KEY=your_sendgrid_key
MAILGUN_DOMAIN=your_mailgun_domain
MAILGUN_API_KEY=your_mailgun_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
DEFAULT_FROM_EMAIL=noreply@yourchurch.com

# SMS Configuration  
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890
MESSAGEBIRD_API_KEY=your_messagebird_key
MESSAGEBIRD_ORIGINATOR=YourChurch
VONAGE_API_KEY=your_vonage_key
VONAGE_API_SECRET=your_vonage_secret
VONAGE_FROM_NUMBER=YourChurch

# Rate Limiting
EMAIL_RATE_LIMIT_PER_HOUR=100
SMS_RATE_LIMIT_PER_HOUR=50

# Webhooks
WEBHOOK_VERIFY_TOKEN=your_webhook_token
API_KEY=your_api_key

# App URLs
NEXT_PUBLIC_APP_URL=https://yourapp.com
```

### 3. Start the Sequence Processor

The background processor handles sequence execution:

```typescript
// In your main application startup
import { startSequenceProcessor } from '@/services/sequenceProcessor'

startSequenceProcessor({
  intervalMs: 60000,  // Check every minute
  batchSize: 100,     // Process 100 messages per batch
  maxRetries: 3       // Retry failed messages 3 times
})
```

### 4. Configure Webhooks

Set up webhooks with your providers:

**SendGrid Webhook URL:**
```
https://yourapp.com/api/webhooks/email-delivery
Headers: x-email-provider: sendgrid
```

**Twilio Webhook URL:**
```
https://yourapp.com/api/webhooks/sms-delivery  
Headers: x-sms-provider: twilio
```

## Usage Examples

### 1. Create a Welcome Sequence

```typescript
const response = await fetch('/api/sequences', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: "New Visitor Welcome",
    sequence_type: "welcome",
    trigger_event: "visit_completed",
    steps: [
      {
        step_type: "email",
        name: "Thank You",
        subject: "Thank you for visiting {{church_name}}!",
        content_template: `Dear {{first_name}},
        
Thank you for visiting us today! It was wonderful to meet you.

We'd love to stay connected. Here are some ways to get involved:
- Join us next Sunday at 10 AM
- Connect with us on social media
- Consider joining a small group

Blessings,
{{pastor_name}}

{{unsubscribe_url}}`,
        delay_after_previous: 60 // 1 hour after visit
      }
    ]
  })
})
```

### 2. Enroll a User

```typescript
const enrollment = await fetch('/api/sequences/enroll', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    sequence_id: "sequence-uuid",
    member_id: "member-uuid",
    trigger_event: "visit_completed",
    enrollment_data: {
      church_name: "First Baptist Church",
      pastor_name: "Pastor John",
      visit_date: "2024-01-15",
      visit_type: "first_time"
    }
  })
})
```

### 3. Get Analytics

```typescript
const analytics = await fetch('/api/admin/sequences/analytics?sequence_id=uuid&start_date=2024-01-01', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})

const data = await analytics.json()
// Returns: open rates, click rates, conversion data, etc.
```

## Best Practices

### 1. Content Guidelines

**Email Best Practices:**
- Keep subject lines under 50 characters
- Include clear call-to-actions
- Always include unsubscribe links
- Test across email clients
- Use responsive HTML templates

**SMS Best Practices:**
- Keep messages under 160 characters when possible
- Include opt-out instructions
- Use clear, actionable language
- Respect quiet hours (default: 10 PM - 8 AM)

### 2. Sequence Design

**Timing Recommendations:**
- Welcome series: Day 0, Day 3, Day 7, Day 14
- Pre-visit: 3 days, 1 day, 2 hours before
- Post-visit: 1 hour, 1 week after
- Prayer follow-up: 1 day, 1 week after

**Personalization:**
- Use first names in greetings
- Reference specific events (visit date, prayer request)
- Customize based on church information
- Segment based on visitor type or interests

### 3. Compliance

**Email Compliance:**
- Include physical address in emails
- Honor unsubscribe requests immediately
- Maintain suppression lists
- Follow CAN-SPAM regulations

**SMS Compliance:**
- Obtain explicit consent before sending
- Honor STOP requests immediately
- Include opt-out instructions
- Follow TCPA regulations

### 4. Testing

**A/B Testing:**
- Test subject lines
- Test send times
- Test content variations
- Test sequence timing

**Quality Assurance:**
- Test all template variables
- Verify unsubscribe links work
- Check mobile rendering
- Test across providers

## Monitoring & Maintenance

### 1. Key Metrics to Monitor

- **Delivery Rates**: >95% for email, >98% for SMS
- **Open Rates**: 15-25% average for church emails
- **Click Rates**: 2-5% average
- **Unsubscribe Rates**: <1% per campaign
- **Bounce Rates**: <5% for email

### 2. Regular Maintenance Tasks

**Daily:**
- Monitor processing queue
- Check delivery failures
- Review unsubscribe requests

**Weekly:**
- Analyze sequence performance
- Review and handle bounces
- Update suppression lists

**Monthly:**
- Clean up old data
- Review and optimize sequences
- Update templates based on performance

**Quarterly:**
- Provider performance review
- Cost analysis and optimization
- Sequence effectiveness audit

## Troubleshooting

### Common Issues

**Messages Not Sending:**
1. Check sequence processor is running
2. Verify provider credentials
3. Check rate limits
4. Review message queue status

**Low Open Rates:**
1. Check subject lines
2. Verify sender reputation
3. Review send times
4. Check for spam folder delivery

**High Unsubscribe Rates:**
1. Review message frequency
2. Check content relevance
3. Verify targeting accuracy
4. Consider sequence timing

### Debugging

Enable debug logging:
```typescript
// Set environment variable
DEBUG_SEQUENCES=true

// Check logs for processing details
tail -f logs/sequences.log
```

## Security Considerations

### 1. Data Protection

- All personal data is encrypted at rest
- API keys are stored securely
- Webhook payloads are verified
- Rate limiting prevents abuse

### 2. Access Control

- Role-based permissions for sequence management
- Audit logs for all sequence operations
- Secure API authentication
- Tenant data isolation

### 3. Compliance Features

- GDPR-compliant data handling
- Automatic data retention policies
- User consent tracking
- Right to be forgotten support

## Performance Optimization

### 1. Database Optimization

- Proper indexing on frequently queried columns
- Partitioning for large message tables
- Regular cleanup of old data
- Connection pooling for high concurrency

### 2. Processing Optimization

- Batch processing for efficiency
- Queue prioritization
- Parallel processing across tenants
- Smart retry logic with exponential backoff

### 3. Caching Strategy

- Template caching for frequently used content
- User preference caching
- Sequence metadata caching
- Provider rate limit caching

## Future Enhancements

### Planned Features

1. **Advanced Personalization**
   - AI-powered content optimization
   - Dynamic send time optimization
   - Behavioral trigger sequences

2. **Additional Channels**
   - Push notifications
   - Social media messaging
   - Voice messages

3. **Enhanced Analytics**
   - Predictive analytics
   - Revenue attribution
   - Lifecycle value tracking

4. **Integration Improvements**
   - CRM system integration
   - Calendar system integration
   - Payment system integration

### API Versioning

The system is built with API versioning in mind:
- Current version: v1
- Backward compatibility guaranteed
- Deprecation notices for breaking changes
- Migration guides for major updates

## Support and Documentation

### Resources

- **API Documentation**: Available at `/api/docs`
- **Sequence Templates**: Library of pre-built sequences
- **Video Tutorials**: Setup and configuration guides
- **Best Practices Guide**: Industry-specific recommendations

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides and examples
- **Community Forum**: User discussions and tips
- **Priority Support**: Available for enterprise customers

## Conclusion

The follow-up sequences system provides a robust, scalable solution for automated church communication. With multi-channel support, advanced analytics, and enterprise-grade reliability, it enables churches to nurture relationships and grow their communities effectively.

The system is designed to grow with your church, supporting everything from small congregations to large multi-campus organizations. With proper setup and maintenance, it can significantly improve visitor retention, member engagement, and overall church growth metrics.