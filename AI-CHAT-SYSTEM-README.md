# AI-Powered Chat Widget System for Church SaaS Platform

## Overview

This is a comprehensive AI-powered chat widget system designed specifically for churches. It provides intelligent conversation handling, lead capture, visitor guidance, and seamless human handoff capabilities. The system serves as the core differentiator for the church SaaS platform.

## Key Features

### 🤖 Intelligent AI Assistant
- **Church-Specific AI Training**: Custom trained on church information, beliefs, and common visitor questions
- **Intent Detection**: Automatically identifies visitor needs (service times, visit planning, prayer requests, etc.)
- **Contextual Responses**: Provides relevant, helpful responses based on church data
- **Multi-Model Support**: Uses both OpenAI GPT-4 and Anthropic Claude for optimal responses

### 💬 Smart Chat Widget
- **Embeddable Widget**: Easy to embed on any church website
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Customizable Theming**: Matches church branding and colors
- **Quick Replies**: Pre-configured common questions for easy interaction

### 📊 Lead Capture & Scoring
- **Intelligent Lead Scoring**: Automatically scores visitor engagement and likelihood to visit
- **Contact Information Collection**: Natural conversation flow to collect visitor details
- **Visit Planning Integration**: Helps visitors plan their first church visit
- **CRM Integration**: Automatically creates leads and member records

### 👥 Human Handoff System
- **Smart Escalation**: Automatically escalates complex or sensitive conversations
- **Staff Dashboard**: Real-time dashboard for church staff to monitor and join conversations
- **Seamless Transition**: Smooth handoff from AI to human assistance
- **Multiple Staff Support**: Multiple staff members can collaborate on conversations

### 📈 Analytics & Insights
- **Conversation Analytics**: Track engagement, satisfaction, and resolution rates
- **Intent Analysis**: Understand what visitors are most interested in
- **Staff Performance**: Monitor response times and satisfaction ratings
- **Lead Generation Metrics**: Track conversation-to-visit conversion rates

## System Architecture

### Backend Components

1. **AI Chat Service** (`ai-chat-service.ts`)
   - Core AI processing engine
   - OpenAI and Anthropic integration
   - Intent detection and response generation
   - Church context management
   - Conversation analytics

2. **WebSocket Handler** (`chat-websocket-handler.ts`)
   - Real-time communication management
   - Message routing and broadcasting
   - Staff notification system
   - Conversation state management

3. **API Extensions** (`api-implementation.ts`)
   - Widget configuration endpoints
   - Conversation management APIs
   - Analytics and reporting endpoints
   - Staff dashboard APIs

4. **Database Extensions** (`chat-database-extension.sql`)
   - Enhanced chat conversation tables
   - AI analytics tracking
   - Lead scoring system
   - Staff performance metrics

### Frontend Components

1. **Chat Widget** (`chat-widget.tsx`)
   - React-based embeddable widget
   - Real-time messaging interface
   - Information collection forms
   - Satisfaction rating system

2. **Embed Script** (`widget-embed-script.js`)
   - Vanilla JavaScript embedding solution
   - Auto-initialization and configuration
   - Cross-domain compatibility
   - Lightweight and fast loading

3. **Staff Dashboard** (`staff-chat-dashboard.tsx`)
   - Real-time conversation monitoring
   - Staff chat interface
   - Analytics and reporting
   - Configuration management

## Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 6+
- OpenAI API Key
- Anthropic API Key

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/church_db

# Redis
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# JWT
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRATION=24h

# Server
PORT=3000
NODE_ENV=production

# Allowed Origins
ALLOWED_ORIGINS=https://yourchurch.com,https://api.yourchurch.com
```

### Database Setup

1. **Run the main database setup:**
   ```sql
   -- Execute database-setup.sql first
   psql -d church_db -f database-setup.sql
   ```

2. **Add chat system extensions:**
   ```sql
   -- Execute chat database extensions
   psql -d church_db -f chat-database-extension.sql
   ```

3. **Create a test tenant:**
   ```sql
   INSERT INTO shared.tenants (name, subdomain, plan_type, schema_name) 
   VALUES ('First Baptist Church', 'firstbaptist', 'premium', 'tenant_firstbaptist');
   ```

### Server Deployment

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the application:**
   ```bash
   npm run build
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

### Widget Integration

#### Option 1: Script Tag Integration

```html
<!-- Add this script tag to your church website -->
<script 
  src="https://api.yourchurchsaas.com/widget/embed.js"
  data-church-chat-tenant-id="your-tenant-id"
  data-church-chat-position="bottom-right"
  async
></script>
```

#### Option 2: Programmatic Integration

```html
<script src="https://api.yourchurchsaas.com/widget/embed.js"></script>
<script>
  window.ChurchChatConfig = {
    tenantId: 'your-tenant-id',
    position: 'bottom-right',
    theme: {
      primaryColor: '#3B82F6',
      secondaryColor: '#EF4444'
    },
    welcomeMessage: 'Welcome to our church! How can I help you today?',
    quickReplies: [
      'What are your service times?',
      'I\'d like to plan a visit',
      'Tell me about kids programs'
    ]
  };
</script>
```

#### Option 3: React Component

```tsx
import { ChurchChatWidget } from './chat-widget';

function App() {
  const config = {
    tenantId: 'your-tenant-id',
    apiUrl: 'https://api.yourchurchsaas.com',
    socketUrl: 'https://api.yourchurchsaas.com',
    theme: {
      primaryColor: '#3B82F6',
      // ... other theme options
    }
  };

  return (
    <div>
      {/* Your church website content */}
      <ChurchChatWidget config={config} />
    </div>
  );
}
```

## Configuration

### Church Information Setup

Configure your church information through the admin dashboard or API:

```json
{
  "churchInfo": {
    "name": "First Baptist Church",
    "address": "123 Main St, Anytown, USA",
    "phone": "+1-555-123-4567",
    "email": "info@firstbaptist.com",
    "website": "https://firstbaptist.com",
    "pastorName": "Pastor John Smith",
    "denomination": "Southern Baptist",
    "serviceTimes": [
      {
        "day": "Sunday",
        "time": "9:00 AM",
        "serviceType": "Traditional Worship",
        "description": "Classic hymns and traditional liturgy"
      },
      {
        "day": "Sunday",
        "time": "11:00 AM",
        "serviceType": "Contemporary Worship",
        "description": "Modern music and casual atmosphere"
      }
    ],
    "beliefs": [
      "We believe in the Trinity - Father, Son, and Holy Spirit",
      "We believe in salvation by faith through grace",
      "We believe in the authority of Scripture"
    ],
    "ministries": [
      {
        "name": "Children's Ministry",
        "description": "Programs for kids from nursery through 5th grade",
        "meetingTime": "Sundays during worship services"
      }
    ],
    "kidsProgramInfo": "We have age-appropriate programs for all children including nursery care, Sunday school, and children's church.",
    "customFAQs": [
      {
        "question": "What should I expect on my first visit?",
        "answer": "Come as you are! Our greeters will help you find your way and we'd love to connect with you after the service.",
        "category": "visiting"
      }
    ]
  }
}
```

### AI Configuration

Customize AI behavior through the settings API:

```json
{
  "aiConfig": {
    "autoAssignToStaff": false,
    "maxConversationLength": 20,
    "escalationKeywords": ["emergency", "crisis", "urgent"],
    "businessHours": {
      "monday": { "start": "09:00", "end": "17:00" },
      "tuesday": { "start": "09:00", "end": "17:00" },
      "wednesday": { "start": "09:00", "end": "17:00" },
      "thursday": { "start": "09:00", "end": "17:00" },
      "friday": { "start": "09:00", "end": "17:00" },
      "saturday": { "closed": true },
      "sunday": { "start": "08:00", "end": "12:00" }
    }
  }
}
```

## API Documentation

### Widget Endpoints

#### Get Widget Configuration
```http
GET /api/widget/{tenantId}/config
```

Returns widget configuration including church information, theme, and quick replies.

#### Create Conversation
```http
POST /api/widget/{tenantId}/conversation
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://churchwebsite.com"
}
```

#### Get Conversation Messages
```http
GET /api/widget/{tenantId}/conversation/{conversationId}/messages?page=1&limit=50
```

### Staff Dashboard Endpoints

#### Get Conversations
```http
GET /api/chat/conversations?status=active&assigned=unassigned
Authorization: Bearer {jwt-token}
```

#### Get Conversation Details
```http
GET /api/chat/conversations/{conversationId}
Authorization: Bearer {jwt-token}
```

#### Assign Conversation
```http
PUT /api/chat/conversations/{conversationId}/assign
Authorization: Bearer {jwt-token}
Content-Type: application/json

{
  "assignedTo": "staff-user-id"
}
```

#### Get Analytics
```http
GET /api/chat/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer {jwt-token}
```

### WebSocket Events

#### Chat Namespace (`/chat`)

**Client to Server:**
- `send-message`: Send a user message
- `info-collected`: Submit collected information
- `satisfaction-rating`: Submit satisfaction rating
- `typing` / `stop-typing`: Typing indicators

**Server to Client:**
- `ai-response`: AI-generated response
- `new-message`: New message in conversation
- `human-joined`: Staff member joined conversation
- `ai-typing`: AI is processing response

#### Staff Chat Namespace (`/staff-chat`)

**Client to Server:**
- `join-conversation`: Join a specific conversation
- `send-staff-message`: Send message as staff
- `end-conversation`: End/resolve conversation
- `transfer-conversation`: Transfer to another staff member

**Server to Client:**
- `new-chat-started`: New visitor conversation started
- `visitor-message`: New message from visitor
- `human-assistance-requested`: Visitor needs human help
- `conversation-assigned`: Conversation assigned to staff

## Lead Scoring Algorithm

The system uses an intelligent lead scoring algorithm that considers:

1. **Engagement Level** (0-25 points)
   - Number of messages sent
   - Session duration
   - Return visits

2. **Contact Information** (0-20 points)
   - Email provided: +20 points
   - Phone provided: +15 points
   - Name provided: +10 points

3. **Intent Analysis** (0-30 points)
   - Visit planning interest: +25 points
   - Ministry involvement: +20 points
   - Prayer request: +15 points
   - General questions: +5 points

4. **Interaction Quality** (0-25 points)
   - Specific questions asked
   - Detailed responses provided
   - Follow-up questions

**Lead Score Ranges:**
- 80-100: Very High Priority (likely to visit)
- 60-79: High Priority (strong interest)
- 40-59: Medium Priority (moderate interest)
- 0-39: Low Priority (basic inquiry)

## Escalation Rules

The system automatically escalates conversations based on:

### Emergency Keywords
- Priority: **Urgent**
- Keywords: "emergency", "crisis", "suicide", "dying", "hospital"
- Action: Immediate staff assignment + notification

### Pastoral Care
- Priority: **High**
- Keywords: "prayer", "counseling", "grief", "marriage", "addiction"
- Action: Assign to pastoral staff

### Complex Theology
- Priority: **Medium**
- Indicators: Long theological questions, doctrinal disputes
- Action: Assign to pastor or trained staff

### Long Conversations
- Priority: **Medium**
- Trigger: >15 messages without resolution
- Action: Suggest human assistance

### High Lead Score
- Priority: **High**
- Trigger: Lead score >70 with contact info
- Action: Notify pastoral team for follow-up

## Analytics & Reporting

### Key Metrics Tracked

1. **Conversation Metrics**
   - Total conversations
   - Active vs resolved conversations
   - Average conversation length
   - Response time (AI and human)
   - Satisfaction ratings

2. **Intent Analytics**
   - Most common visitor questions
   - Intent detection accuracy
   - Conversation topics trending

3. **Lead Generation**
   - Conversations with contact info collected
   - Lead score distribution
   - Conversion to actual visits
   - Follow-up effectiveness

4. **Staff Performance**
   - Response times by staff member
   - Satisfaction ratings by staff
   - Conversations handled per staff
   - Peak activity times

5. **AI Performance**
   - Intent detection confidence
   - Response relevance scores
   - Escalation rates
   - Cost per conversation

### Reports Available

- **Daily Chat Summary**: Key metrics for each day
- **Weekly Staff Report**: Individual staff performance
- **Monthly Analytics**: Comprehensive monthly overview
- **Lead Generation Report**: Conversion tracking
- **Visitor Intent Analysis**: Understanding visitor needs

## Best Practices

### For Church Staff

1. **Response Times**
   - Aim for <2 minutes during business hours
   - Set expectations for after-hours responses
   - Use auto-responses when offline

2. **Conversation Handling**
   - Always introduce yourself when joining
   - Read conversation history before responding
   - Use warm, welcoming tone
   - Follow up on commitments made

3. **Lead Follow-up**
   - Contact high-scoring leads within 24 hours
   - Use multiple contact methods (email, phone, text)
   - Personalize follow-up based on conversation
   - Track follow-up outcomes

### For Church Administrators

1. **Content Management**
   - Keep church information current
   - Update service times seasonally
   - Add special events regularly
   - Review and improve FAQ responses

2. **Staff Training**
   - Train staff on dashboard usage
   - Establish response protocols
   - Regular review of conversation quality
   - Share best practices across team

3. **Analytics Review**
   - Weekly analytics review meetings
   - Identify conversation trends
   - Adjust AI responses based on data
   - Track ROI and visitor conversion

## Troubleshooting

### Common Issues

1. **Widget Not Loading**
   - Check tenant ID configuration
   - Verify CORS settings
   - Check browser console for errors
   - Ensure script URL is correct

2. **AI Not Responding**
   - Check API keys (OpenAI, Anthropic)
   - Verify Redis connection
   - Check rate limits
   - Review error logs

3. **Messages Not Sending**
   - Check WebSocket connection
   - Verify authentication tokens
   - Check network connectivity
   - Review CORS configuration

4. **Staff Dashboard Issues**
   - Verify JWT token validity
   - Check user permissions
   - Refresh browser cache
   - Check WebSocket connection

### Error Codes

- `CHAT_001`: Invalid tenant ID
- `CHAT_002`: Conversation not found
- `CHAT_003`: Authentication failed
- `CHAT_004`: Rate limit exceeded
- `CHAT_005`: AI service unavailable
- `CHAT_006`: WebSocket connection failed

## Performance Optimization

### Caching Strategy

1. **Church Context Cache**
   - Redis cache: 1 hour TTL
   - Invalidates on settings update
   - Reduces database queries

2. **Intent Detection Cache**
   - Redis cache: 5 minutes TTL
   - Caches similar queries
   - Improves response time

3. **Analytics Cache**
   - Redis cache: 15 minutes TTL
   - Daily metrics cached longer
   - Background refresh jobs

### Database Optimization

1. **Indexing Strategy**
   - Conversation lookup by tenant
   - Message search by conversation
   - Analytics queries optimized
   - Lead scoring indexes

2. **Query Optimization**
   - Use prepared statements
   - Limit result sets
   - Efficient JOIN operations
   - Regular query analysis

3. **Data Archival**
   - Archive old conversations (90+ days)
   - Compress historical analytics
   - Regular maintenance jobs
   - Performance monitoring

### Scaling Considerations

1. **Horizontal Scaling**
   - Load balance API servers
   - Redis clustering
   - Database read replicas
   - CDN for widget assets

2. **Resource Management**
   - Monitor API costs (OpenAI/Anthropic)
   - Implement rate limiting
   - Connection pooling
   - Memory usage optimization

## Security Considerations

### Data Protection

1. **PII Handling**
   - Encrypt sensitive data at rest
   - Secure transmission (HTTPS/WSS)
   - Regular data purging
   - GDPR compliance measures

2. **Authentication**
   - JWT token expiration
   - Secure token storage
   - Permission-based access
   - Session management

3. **Input Validation**
   - Sanitize all user inputs
   - Prevent injection attacks
   - Rate limiting protection
   - CORS configuration

### Monitoring & Alerts

1. **Security Monitoring**
   - Failed authentication attempts
   - Unusual traffic patterns
   - Data access logging
   - Regular security audits

2. **Performance Alerts**
   - High error rates
   - Slow response times
   - Resource utilization
   - Database connection issues

## Support & Maintenance

### Regular Maintenance Tasks

1. **Daily**
   - Monitor system health
   - Check error logs
   - Review chat quality
   - Update staff assignments

2. **Weekly**
   - Analytics review
   - Performance optimization
   - Content updates
   - Staff feedback review

3. **Monthly**
   - Comprehensive system review
   - Cost analysis
   - Feature usage analysis
   - Security audit

### Getting Help

- **Documentation**: This README and inline code comments
- **Support Portal**: https://support.yourchurchsaas.com
- **Emergency Contact**: support@yourchurchsaas.com
- **Community Forum**: https://community.yourchurchsaas.com

## Roadmap & Future Enhancements

### Phase 2 Features
- [ ] Voice message support
- [ ] Video chat integration
- [ ] Multi-language support
- [ ] Advanced chatbot personality customization
- [ ] Integration with church management systems

### Phase 3 Features
- [ ] AI-powered sermon recommendations
- [ ] Automated event registration
- [ ] SMS chat integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration

### Phase 4 Features
- [ ] AI-generated conversation summaries
- [ ] Predictive lead scoring
- [ ] Automated follow-up campaigns
- [ ] Integration with social media
- [ ] Advanced personalization

## License

This project is proprietary software for the VisionaryChurch SaaS platform. All rights reserved.

---

**Built with ❤️ for churches to better connect with their communities**

For technical support or questions, please contact the development team.