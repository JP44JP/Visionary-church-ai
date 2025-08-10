# Multi-Tenant Church Management SaaS Backend Architecture

## System Overview

A scalable, multi-tenant SaaS platform designed to serve 5,000+ churches with real-time features, AI capabilities, and enterprise-grade security.

## 1. System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Load Balancer (CloudFlare)               │
├─────────────────────────────────────────────────────────────────┤
│                        API Gateway (Kong/AWS ALB)               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │   Auth      │  │   Core API  │  │   Chat AI   │  │   Widget    │ │
│  │  Service    │  │   Service   │  │   Service   │  │   Service   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │  Scheduler  │  │ Notification│  │ Analytics   │  │   File      │ │
│  │  Service    │  │   Service   │  │  Service    │  │  Service    │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                    Message Queue (Redis/RabbitMQ)              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ PostgreSQL  │  │    Redis    │  │  S3 Storage │  │ ElasticSearch│ │
│  │ (Primary)   │  │   Cache     │  │   + CDN     │  │   Logs      │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Technology Stack Recommendations

### Backend Framework
- **Node.js with Express/Fastify** - Rapid development, great ecosystem
- **TypeScript** - Type safety and better maintainability
- **Prisma ORM** - Type-safe database operations with multi-tenant support

### Database Layer
- **PostgreSQL** - Primary database with multi-tenant schemas
- **Redis** - Caching, sessions, and real-time features
- **ClickHouse** - Analytics and reporting (optional)

### Real-time Communication
- **Socket.IO** - WebSocket management for chat
- **Server-Sent Events (SSE)** - Notifications

### Background Jobs
- **BullMQ** - Redis-based job queue
- **Node-cron** - Scheduled tasks

### Authentication & Security
- **JWT** - Stateless authentication
- **bcrypt** - Password hashing
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

### File Storage
- **AWS S3** - File storage with CloudFront CDN
- **Multer** - File upload handling

### Monitoring & Logging
- **Winston** - Logging
- **New Relic/DataDog** - APM
- **Sentry** - Error tracking

### DevOps
- **Docker** - Containerization
- **GitHub Actions** - CI/CD
- **AWS ECS/Fargate** - Container orchestration

## 3. Multi-Tenant Database Schema Design

### Tenant Isolation Strategy: Schema-per-tenant with shared tables

```sql
-- Shared tables (cross-tenant)
CREATE SCHEMA shared;

-- Tenant-specific schemas
CREATE SCHEMA tenant_1;
CREATE SCHEMA tenant_2;
-- ... etc

-- Shared Tables
CREATE TABLE shared.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE shared.tenant_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES shared.tenants(id),
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Template for tenant-specific tables (replicated per tenant)
-- Example for tenant_1 schema:

CREATE TABLE tenant_1.members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address JSONB,
    membership_status VARCHAR(20) DEFAULT 'active',
    baptized_date DATE,
    tags VARCHAR[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type VARCHAR(50) NOT NULL, -- 'service', 'meeting', 'outreach', etc.
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    max_attendees INTEGER,
    registration_required BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES tenant_1.events(id),
    member_id UUID REFERENCES tenant_1.members(id),
    status VARCHAR(20) DEFAULT 'registered', -- 'registered', 'attended', 'cancelled'
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    UNIQUE(event_id, member_id)
);

CREATE TABLE tenant_1.prayer_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requester_id UUID REFERENCES tenant_1.members(id),
    category VARCHAR(50), -- 'healing', 'family', 'guidance', etc.
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'answered', 'closed'
    is_anonymous BOOLEAN DEFAULT false,
    is_public BOOLEAN DEFAULT true,
    assigned_to UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.prayer_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prayer_request_id UUID REFERENCES tenant_1.prayer_requests(id),
    update_text TEXT NOT NULL,
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES tenant_1.members(id),
    visitor_name VARCHAR(255),
    visitor_email VARCHAR(255),
    visitor_phone VARCHAR(20),
    visit_type VARCHAR(50) NOT NULL, -- 'pastoral', 'home', 'hospital', 'coffee'
    scheduled_datetime TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled'
    notes TEXT,
    assigned_pastor UUID REFERENCES shared.tenant_users(id),
    created_by UUID REFERENCES shared.tenant_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.email_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(100) NOT NULL, -- 'new_member', 'first_visit', 'prayer_request'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id UUID REFERENCES tenant_1.email_sequences(id),
    subject VARCHAR(255) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    delay_days INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.automated_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID REFERENCES tenant_1.members(id),
    template_id UUID REFERENCES tenant_1.email_templates(id),
    message_type VARCHAR(20) NOT NULL, -- 'email', 'sms'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    scheduled_for TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tenant_1.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES tenant_1.members(id),
    session_id VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE tenant_1.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES tenant_1.chat_conversations(id),
    sender_type VARCHAR(20) NOT NULL, -- 'user', 'ai', 'staff'
    sender_id UUID, -- member_id or staff_id
    message_text TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_members_email ON tenant_1.members(email);
CREATE INDEX idx_events_datetime ON tenant_1.events(start_datetime, end_datetime);
CREATE INDEX idx_prayer_requests_status ON tenant_1.prayer_requests(status);
CREATE INDEX idx_visits_scheduled ON tenant_1.visits(scheduled_datetime);
CREATE INDEX idx_automated_messages_scheduled ON tenant_1.automated_messages(scheduled_for, status);
CREATE INDEX idx_chat_messages_conversation ON tenant_1.chat_messages(conversation_id, created_at);
```

## 4. API Endpoint Structure

### Authentication Endpoints
```
POST   /api/auth/login
POST   /api/auth/logout  
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
GET    /api/auth/me
```

### Tenant Management
```
GET    /api/tenants/current
PUT    /api/tenants/current/settings
GET    /api/tenants/current/users
POST   /api/tenants/current/users
PUT    /api/tenants/current/users/:id
DELETE /api/tenants/current/users/:id
```

### Member Management
```
GET    /api/members
POST   /api/members
GET    /api/members/:id
PUT    /api/members/:id
DELETE /api/members/:id
GET    /api/members/search?q=:query
POST   /api/members/:id/tags
DELETE /api/members/:id/tags/:tag
```

### Event Management
```
GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/registrations
POST   /api/events/:id/register
PUT    /api/events/:id/registrations/:regId
DELETE /api/events/:id/registrations/:regId
```

### Prayer Request Management
```
GET    /api/prayer-requests
POST   /api/prayer-requests
GET    /api/prayer-requests/:id
PUT    /api/prayer-requests/:id
DELETE /api/prayer-requests/:id
POST   /api/prayer-requests/:id/updates
GET    /api/prayer-requests/:id/updates
```

### Visit Scheduling
```
GET    /api/visits
POST   /api/visits
GET    /api/visits/:id
PUT    /api/visits/:id
DELETE /api/visits/:id
GET    /api/visits/calendar
POST   /api/visits/:id/reschedule
```

### Email/SMS Automation
```
GET    /api/sequences
POST   /api/sequences
GET    /api/sequences/:id
PUT    /api/sequences/:id
DELETE /api/sequences/:id
GET    /api/sequences/:id/templates
POST   /api/sequences/:id/templates
PUT    /api/templates/:id
DELETE /api/templates/:id
```

### Chat & AI
```
POST   /api/chat/conversations
GET    /api/chat/conversations/:id/messages
POST   /api/chat/conversations/:id/messages
WebSocket: /api/chat/ws/:conversationId
```

### Analytics
```
GET    /api/analytics/dashboard
GET    /api/analytics/members
GET    /api/analytics/events
GET    /api/analytics/engagement
GET    /api/analytics/prayer-requests
POST   /api/analytics/reports
```

### Widget Endpoints (Public)
```
GET    /api/widget/:tenantId/config
POST   /api/widget/:tenantId/chat/init
POST   /api/widget/:tenantId/prayer-request
POST   /api/widget/:tenantId/contact
GET    /api/widget/:tenantId/events/upcoming
```

### File Management
```
POST   /api/files/upload
GET    /api/files/:id
DELETE /api/files/:id
GET    /api/files/signed-url
```

## 5. Scalability Considerations

### Database Scaling
- **Read Replicas**: Implement read replicas for heavy read operations
- **Connection Pooling**: Use pgBouncer for connection management
- **Partitioning**: Partition large tables by date (events, messages)
- **Tenant Sharding**: Distribute tenants across multiple databases as scale increases

### Caching Strategy
- **Redis Cluster**: Multi-node Redis setup for high availability
- **Application-level caching**: Cache frequent queries (member lists, event data)
- **CDN**: Static assets and public widget content
- **Database query caching**: Cache expensive analytics queries

### Microservices Decomposition (Future)
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │   Member    │  │   Event     │
│  Service    │  │  Service    │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Prayer    │  │  Notification│  │  Analytics  │
│  Service    │  │   Service   │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Auto-scaling Configuration
- **Horizontal Pod Autoscaler**: Scale based on CPU/memory
- **Vertical Pod Autoscaler**: Adjust resource limits
- **Database auto-scaling**: Read replicas based on load
- **Queue-based scaling**: Scale workers based on job queue depth

## 6. Security Implementation Plan

### Authentication & Authorization
```typescript
// JWT Token Structure
interface JWTPayload {
  userId: string;
  tenantId: string;
  role: 'admin' | 'pastor' | 'staff' | 'volunteer';
  permissions: string[];
  iat: number;
  exp: number;
}

// Role-based permissions
const PERMISSIONS = {
  'admin': ['*'],
  'pastor': [
    'members:read', 'members:write', 'members:delete',
    'events:read', 'events:write', 'events:delete',
    'prayer:read', 'prayer:write', 'prayer:delete',
    'visits:read', 'visits:write', 'visits:delete',
    'analytics:read'
  ],
  'staff': [
    'members:read', 'members:write',
    'events:read', 'events:write',
    'prayer:read', 'prayer:write',
    'visits:read', 'visits:write'
  ],
  'volunteer': [
    'members:read',
    'events:read',
    'prayer:read'
  ]
};
```

### Input Validation & Sanitization
```typescript
// Joi schema example
const memberCreateSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  address: Joi.object().optional(),
  tags: Joi.array().items(Joi.string().max(50)).optional()
});
```

### Rate Limiting Strategy
```typescript
// Different limits for different endpoints
const rateLimits = {
  '/api/auth/login': { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  '/api/chat': { windowMs: 60 * 1000, max: 30 }, // 30 messages per minute
  '/api/files/upload': { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
  '/api/widget/*': { windowMs: 60 * 1000, max: 100 }, // 100 requests per minute
  'default': { windowMs: 15 * 60 * 1000, max: 100 } // 100 requests per 15 minutes
};
```

### Data Encryption
- **At Rest**: PostgreSQL encryption, encrypted S3 buckets
- **In Transit**: TLS 1.3 for all connections
- **Application Level**: Encrypt sensitive fields (SSN, payment info)
- **Key Management**: AWS KMS or HashiCorp Vault

### Security Headers
```typescript
// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));
```

## 7. Real-time Implementation

### WebSocket Architecture
```typescript
// Socket.IO namespace organization
const io = new Server(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') }
});

// Tenant isolation
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  socket.tenantId = decoded.tenantId;
  socket.userId = decoded.userId;
  socket.join(`tenant:${decoded.tenantId}`);
  next();
});

// Chat namespace
const chatNamespace = io.of('/chat');
chatNamespace.on('connection', (socket) => {
  socket.on('join-conversation', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
  });
  
  socket.on('send-message', async (data) => {
    // Process message, save to DB
    const message = await saveMessage(data);
    
    // Broadcast to conversation participants
    socket.to(`conversation:${data.conversationId}`)
          .emit('new-message', message);
    
    // Trigger AI response if needed
    if (data.requiresAI) {
      processAIResponse(data.conversationId, message);
    }
  });
});
```

### Notification System
```typescript
// Server-Sent Events for notifications
app.get('/api/notifications/stream', authenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  const userId = req.user.id;
  const tenantId = req.user.tenantId;
  
  // Join notification room
  notificationManager.addClient(userId, res);
  
  // Send heartbeat every 30 seconds
  const heartbeat = setInterval(() => {
    res.write('data: {"type": "heartbeat"}\n\n');
  }, 30000);
  
  req.on('close', () => {
    clearInterval(heartbeat);
    notificationManager.removeClient(userId);
  });
});
```

## 8. Background Job Processing

### Queue Architecture
```typescript
// Job queue setup with BullMQ
import { Queue, Worker } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

const smsQueue = new Queue('sms', {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

// Job types
interface EmailJob {
  tenantId: string;
  templateId: string;
  recipientId: string;
  variables: Record<string, any>;
  scheduledFor?: Date;
}

interface SMSJob {
  tenantId: string;
  to: string;
  message: string;
  scheduledFor?: Date;
}

// Workers
const emailWorker = new Worker('email', async (job) => {
  const { tenantId, templateId, recipientId, variables } = job.data;
  
  // Get tenant context
  const tenant = await getTenant(tenantId);
  
  // Get email template
  const template = await getEmailTemplate(tenantId, templateId);
  
  // Get recipient
  const recipient = await getMember(tenantId, recipientId);
  
  // Render template with variables
  const renderedEmail = renderTemplate(template, { ...variables, recipient, tenant });
  
  // Send email
  await sendEmail({
    to: recipient.email,
    subject: renderedEmail.subject,
    html: renderedEmail.html,
    text: renderedEmail.text
  });
  
  // Log delivery
  await logEmailDelivery(tenantId, recipientId, templateId, 'sent');
  
}, { connection: redisConnection });
```

### Scheduled Jobs
```typescript
// Cron job for automated sequences
import cron from 'node-cron';

// Check for automated messages every minute
cron.schedule('* * * * *', async () => {
  const pendingMessages = await db.query(`
    SELECT am.*, t.name as template_subject, t.body_html, t.body_text, m.email, m.phone
    FROM shared.tenants ten
    CROSS JOIN LATERAL (
      SELECT am.*, t.subject, t.body_html, t.body_text, m.email, m.phone
      FROM ${ten.schema_name}.automated_messages am
      JOIN ${ten.schema_name}.email_templates t ON am.template_id = t.id
      JOIN ${ten.schema_name}.members m ON am.recipient_id = m.id
      WHERE am.status = 'pending' 
        AND am.scheduled_for <= NOW()
      LIMIT 100
    ) messages ON true
  `);
  
  for (const message of pendingMessages) {
    if (message.message_type === 'email') {
      await emailQueue.add('send-automated-email', message);
    } else if (message.message_type === 'sms') {
      await smsQueue.add('send-automated-sms', message);
    }
    
    // Mark as processing
    await updateMessageStatus(message.tenant_id, message.id, 'processing');
  }
});

// Daily analytics aggregation
cron.schedule('0 2 * * *', async () => {
  await aggregateDailyAnalytics();
});

// Weekly reports
cron.schedule('0 9 * * 1', async () => {
  await generateWeeklyReports();
});
```

This comprehensive backend architecture provides:

1. **Scalable multi-tenant design** with schema-per-tenant approach
2. **Complete API structure** with proper REST endpoints
3. **Real-time capabilities** using WebSockets and SSE
4. **Robust security** with JWT, RBAC, and proper validation
5. **Background job processing** for automated workflows
6. **Analytics and reporting** capabilities
7. **Embeddable widget support** with public APIs
8. **Enterprise-grade monitoring** and logging

The architecture is designed for rapid development while maintaining scalability to handle 5,000+ churches with millions of users. Each component can be independently scaled and the modular design allows for easy feature additions and microservices migration in the future.

Key files created:
- `/Users/peterz/VisionaryChurch-ai/backend-architecture.md` - Complete architectural documentation

Would you like me to elaborate on any specific component or create implementation examples for particular services?