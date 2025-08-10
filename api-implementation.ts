// Multi-Tenant Church Management API Implementation
// Node.js + Express + TypeScript + Prisma

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import winston from 'winston';
import Joi from 'joi';
import AIChatService from './ai-chat-service';
import ChatWebSocketHandler from './chat-websocket-handler';

// =============================================================================
// TYPES AND INTERFACES
// =============================================================================

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    permissions: string[];
  };
  tenant?: {
    id: string;
    name: string;
    schemaName: string;
    settings: any;
  };
}

interface JWTPayload {
  userId: string;
  tenantId: string;
  role: string;
  permissions: string[];
  iat: number;
  exp: number;
}

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

interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =============================================================================
// CONFIGURATION
// =============================================================================

const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpiration: process.env.JWT_EXPIRATION || '24h',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/church_db',
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3Bucket: process.env.S3_BUCKET || 'church-management-files',
  openaiApiKey: process.env.OPENAI_API_KEY,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
  twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

// =============================================================================
// LOGGING SETUP
// =============================================================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'church-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// =============================================================================
// DATABASE AND REDIS SETUP
// =============================================================================

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

const redis = new Redis(config.redisUrl);

const s3Client = new S3Client({
  region: config.awsRegion,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// =============================================================================
// AI CHAT SERVICE SETUP
// =============================================================================

const aiChatService = new AIChatService(
  config.openaiApiKey!,
  config.anthropicApiKey!,
  prisma,
  redis,
  logger
);

// =============================================================================
// QUEUE SETUP
// =============================================================================

const emailQueue = new Queue('email', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

const smsQueue = new Queue('sms', {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  }
});

// Email worker
const emailWorker = new Worker('email', async (job) => {
  const { tenantId, templateId, recipientId, variables } = job.data as EmailJob;
  
  try {
    // Implementation would go here
    logger.info(`Processing email job for tenant ${tenantId}`);
    
    // Get tenant and template data
    // Render template
    // Send email via SendGrid
    // Log delivery
    
  } catch (error) {
    logger.error('Email job failed:', error);
    throw error;
  }
}, { connection: redis });

// SMS worker
const smsWorker = new Worker('sms', async (job) => {
  const { tenantId, to, message } = job.data as SMSJob;
  
  try {
    logger.info(`Processing SMS job for tenant ${tenantId}`);
    
    // Send SMS via Twilio
    // Log delivery
    
  } catch (error) {
    logger.error('SMS job failed:', error);
    throw error;
  }
}, { connection: redis });

// =============================================================================
// EXPRESS APP SETUP
// =============================================================================

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const createRateLimit = (windowMs: number, max: number) => 
  rateLimit({ windowMs, max, standardHeaders: true, legacyHeaders: false });

const rateLimits = {
  '/api/auth/login': createRateLimit(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  '/api/chat': createRateLimit(60 * 1000, 30), // 30 messages per minute
  '/api/files/upload': createRateLimit(60 * 1000, 10), // 10 uploads per minute
  '/api/widget/*': createRateLimit(60 * 1000, 100), // 100 requests per minute
  'default': createRateLimit(15 * 60 * 1000, 100) // 100 requests per 15 minutes
};

// Apply rate limits
Object.entries(rateLimits).forEach(([path, limiter]) => {
  if (path === 'default') {
    app.use(limiter);
  } else {
    app.use(path, limiter);
  }
});

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

const memberCreateSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().pattern(/^\+?[\d\s\-\(\)]+$/).optional(),
  dateOfBirth: Joi.date().optional(),
  address: Joi.object().optional(),
  membershipStatus: Joi.string().valid('active', 'inactive', 'deceased', 'transferred').default('active'),
  tags: Joi.array().items(Joi.string().max(50)).optional(),
  customFields: Joi.object().optional(),
  notes: Joi.string().optional()
});

const eventCreateSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().optional(),
  eventType: Joi.string().required(),
  startDatetime: Joi.date().required(),
  endDatetime: Joi.date().required(),
  location: Joi.string().optional(),
  maxAttendees: Joi.number().integer().min(1).optional(),
  registrationRequired: Joi.boolean().default(false),
  registrationDeadline: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const prayerRequestSchema = Joi.object({
  title: Joi.string().min(1).max(255).required(),
  description: Joi.string().min(1).required(),
  category: Joi.string().optional(),
  priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal'),
  isAnonymous: Joi.boolean().default(false),
  isPublic: Joi.boolean().default(true),
  requesterName: Joi.string().when('isAnonymous', { is: false, then: Joi.optional(), otherwise: Joi.required() }),
  requesterEmail: Joi.string().email().optional()
});

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    tenantId: (req as AuthenticatedRequest).tenant?.id
  });
  next();
});

// Tenant extraction middleware
const extractTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let tenantId: string | undefined;
    
    // Try to get tenant from subdomain first
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && subdomain !== 'api' && subdomain !== 'www') {
        const tenant = await prisma.$queryRaw`
          SELECT id, name, schema_name as "schemaName", settings 
          FROM shared.tenants 
          WHERE subdomain = ${subdomain} AND status = 'active'
        `;
        if (Array.isArray(tenant) && tenant.length > 0) {
          req.tenant = tenant[0] as any;
          tenantId = tenant[0].id;
        }
      }
    }
    
    // If no tenant from subdomain, try from JWT token
    if (!tenantId) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
        const tenant = await prisma.$queryRaw`
          SELECT id, name, schema_name as "schemaName", settings 
          FROM shared.tenants 
          WHERE id = ${decoded.tenantId} AND status = 'active'
        `;
        if (Array.isArray(tenant) && tenant.length > 0) {
          req.tenant = tenant[0] as any;
          tenantId = tenant[0].id;
        }
      }
    }
    
    // If still no tenant for protected routes, return error
    if (!req.tenant && !req.path.startsWith('/api/widget/') && !req.path.startsWith('/api/public/')) {
      return res.status(400).json({
        success: false,
        error: 'Tenant not found or inactive'
      });
    }
    
    next();
  } catch (error) {
    logger.error('Tenant extraction error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// Authentication middleware
const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }
    
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    // Get user details
    const user = await prisma.$queryRaw`
      SELECT u.id, u.tenant_id as "tenantId", u.role, u.permissions, u.is_active as "isActive"
      FROM shared.tenant_users u
      WHERE u.id = ${decoded.userId} AND u.tenant_id = ${decoded.tenantId}
    `;
    
    if (!Array.isArray(user) || user.length === 0 || !user[0].isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user inactive'
      });
    }
    
    req.user = user[0] as any;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

// Authorization middleware
const authorize = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const { role, permissions } = req.user;
    
    // Admin has all permissions
    if (role === 'admin') {
      return next();
    }
    
    // Check if user has specific permission
    if (permissions.includes(requiredPermission) || permissions.includes('*')) {
      return next();
    }
    
    res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    });
  };
};

// Validation middleware
const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

// Pagination helper
const parsePagination = (req: Request): PaginationParams => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 25));
  const sortBy = req.query.sortBy as string;
  const sortOrder = (req.query.sortOrder as string) === 'desc' ? 'desc' : 'asc';
  
  return { page, limit, sortBy, sortOrder };
};

// =============================================================================
// AUTHENTICATION ROUTES
// =============================================================================

app.post('/api/auth/login', extractTenant, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        error: 'Tenant required for login'
      });
    }
    
    // Find user
    const users = await prisma.$queryRaw`
      SELECT id, tenant_id as "tenantId", email, password_hash as "passwordHash", 
             first_name as "firstName", last_name as "lastName", role, permissions, is_active as "isActive"
      FROM shared.tenant_users 
      WHERE email = ${email} AND tenant_id = ${req.tenant.id}
    `;
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const user = users[0] as any;
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is inactive'
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        tenantId: user.tenantId,
        role: user.role,
        permissions: user.permissions
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiration }
    );
    
    // Update last login
    await prisma.$executeRaw`
      UPDATE shared.tenant_users 
      SET last_login_at = NOW() 
      WHERE id = ${user.id}
    `;
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions
        },
        tenant: req.tenant
      }
    });
    
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/auth/me', extractTenant, authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      tenant: req.tenant
    }
  });
});

// =============================================================================
// MEMBER MANAGEMENT ROUTES
// =============================================================================

app.get('/api/members', extractTenant, authenticate, authorize('members:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, sortBy = 'first_name', sortOrder } = parsePagination(req);
    const search = req.query.search as string;
    const status = req.query.status as string;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (search) {
      whereClause += ` AND (first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    if (status) {
      whereClause += ` AND membership_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    const schemaName = req.tenant!.schemaName;
    
    // Get total count
    const countResult = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM ${schemaName}.members
      ${whereClause}
    `, ...params);
    
    const total = parseInt((countResult as any)[0].count);
    
    // Get paginated results
    const members = await prisma.$queryRawUnsafe(`
      SELECT id, member_number, first_name, last_name, email, phone, 
             membership_status, tags, created_at
      FROM ${schemaName}.members
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, offset);
    
    res.json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    logger.error('Get members error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/members', extractTenant, authenticate, authorize('members:write'), validate(memberCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const memberData = req.body;
    const schemaName = req.tenant!.schemaName;
    
    // Generate member number
    const memberNumber = `MEM${Date.now()}`;
    
    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.members (
        member_number, first_name, last_name, email, phone, date_of_birth,
        address, membership_status, tags, custom_fields, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, 
      memberNumber,
      memberData.firstName,
      memberData.lastName,
      memberData.email || null,
      memberData.phone || null,
      memberData.dateOfBirth || null,
      JSON.stringify(memberData.address || {}),
      memberData.membershipStatus || 'active',
      memberData.tags || [],
      JSON.stringify(memberData.customFields || {}),
      memberData.notes || null
    );
    
    // Trigger welcome sequence if configured
    if (memberData.email) {
      await emailQueue.add('trigger-sequence', {
        tenantId: req.tenant!.id,
        recipientId: (result as any)[0].id,
        triggerEvent: 'new_member'
      });
    }
    
    res.status(201).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Create member error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// EVENT MANAGEMENT ROUTES
// =============================================================================

app.get('/api/events', extractTenant, authenticate, authorize('events:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, sortBy = 'start_datetime', sortOrder } = parsePagination(req);
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const eventType = req.query.eventType as string;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (startDate) {
      whereClause += ` AND start_datetime >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    
    if (endDate) {
      whereClause += ` AND end_datetime <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }
    
    if (eventType) {
      whereClause += ` AND event_type = $${paramIndex}`;
      params.push(eventType);
      paramIndex++;
    }
    
    const schemaName = req.tenant!.schemaName;
    
    const events = await prisma.$queryRawUnsafe(`
      SELECT e.*, u.first_name || ' ' || u.last_name as created_by_name,
             (SELECT COUNT(*) FROM ${schemaName}.event_registrations WHERE event_id = e.id) as registration_count
      FROM ${schemaName}.events e
      LEFT JOIN shared.tenant_users u ON e.created_by = u.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, offset);
    
    res.json({
      success: true,
      data: events
    });
    
  } catch (error) {
    logger.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/events', extractTenant, authenticate, authorize('events:write'), validate(eventCreateSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const eventData = req.body;
    const schemaName = req.tenant!.schemaName;
    
    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.events (
        title, description, event_type, start_datetime, end_datetime,
        location, max_attendees, registration_required, registration_deadline,
        tags, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, 
      eventData.title,
      eventData.description || null,
      eventData.eventType,
      eventData.startDatetime,
      eventData.endDatetime,
      eventData.location || null,
      eventData.maxAttendees || null,
      eventData.registrationRequired || false,
      eventData.registrationDeadline || null,
      eventData.tags || [],
      req.user!.id
    );
    
    res.status(201).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// PRAYER REQUEST ROUTES
// =============================================================================

app.get('/api/prayer-requests', extractTenant, authenticate, authorize('prayer:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, sortBy = 'created_at', sortOrder = 'desc' } = parsePagination(req);
    const status = req.query.status as string || 'active';
    const category = req.query.category as string;
    const offset = (page - 1) * limit;
    
    let whereClause = `WHERE status = $1`;
    const params: any[] = [status];
    let paramIndex = 2;
    
    if (category) {
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }
    
    const schemaName = req.tenant!.schemaName;
    
    const prayerRequests = await prisma.$queryRawUnsafe(`
      SELECT pr.*, 
             m.first_name || ' ' || m.last_name as requester_name,
             u.first_name || ' ' || u.last_name as assigned_to_name,
             (SELECT COUNT(*) FROM ${schemaName}.prayer_updates WHERE prayer_request_id = pr.id) as update_count
      FROM ${schemaName}.prayer_requests pr
      LEFT JOIN ${schemaName}.members m ON pr.requester_id = m.id
      LEFT JOIN shared.tenant_users u ON pr.assigned_to = u.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, offset);
    
    res.json({
      success: true,
      data: prayerRequests
    });
    
  } catch (error) {
    logger.error('Get prayer requests error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/prayer-requests', extractTenant, authenticate, authorize('prayer:write'), validate(prayerRequestSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const prayerData = req.body;
    const schemaName = req.tenant!.schemaName;
    
    const result = await prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.prayer_requests (
        title, description, category, priority, is_anonymous, is_public,
        requester_name, requester_email
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, 
      prayerData.title,
      prayerData.description,
      prayerData.category || 'general',
      prayerData.priority || 'normal',
      prayerData.isAnonymous || false,
      prayerData.isPublic || true,
      prayerData.requesterName || null,
      prayerData.requesterEmail || null
    );
    
    res.status(201).json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Create prayer request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// WEBSOCKET SETUP
// =============================================================================

const io = new SocketIOServer(server, {
  cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'] }
});

// Initialize chat websocket handler
const chatHandler = new ChatWebSocketHandler(
  io,
  prisma,
  redis,
  logger,
  aiChatService
);

// Socket authentication middleware
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    
    socket.data.tenantId = decoded.tenantId;
    socket.data.userId = decoded.userId;
    socket.data.role = decoded.role;
    
    // Join tenant room
    socket.join(`tenant:${decoded.tenantId}`);
    
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

// Chat namespace
const chatNamespace = io.of('/chat');

chatNamespace.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    socket.data = { ...socket.data, ...decoded };
    next();
  } catch (error) {
    next(new Error('Authentication failed'));
  }
});

chatNamespace.on('connection', (socket) => {
  logger.info(`Chat connection established for user ${socket.data.userId}`);
  
  socket.on('join-conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    logger.info(`User ${socket.data.userId} joined conversation ${conversationId}`);
  });
  
  socket.on('send-message', async (data: { conversationId: string; message: string; type: string }) => {
    try {
      // Save message to database
      const schemaName = `tenant_${socket.data.tenantId.replace(/-/g, '_')}`;
      
      const result = await prisma.$queryRawUnsafe(`
        INSERT INTO ${schemaName}.chat_messages (
          conversation_id, sender_type, sender_id, message_text, message_type
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `, data.conversationId, 'user', socket.data.userId, data.message, data.type || 'text');
      
      // Broadcast to conversation participants
      chatNamespace.to(`conversation:${data.conversationId}`)
                   .emit('new-message', (result as any)[0]);
      
      // Trigger AI response if needed
      if (data.type === 'ai-query') {
        // Queue AI processing job
        await emailQueue.add('process-ai-chat', {
          tenantId: socket.data.tenantId,
          conversationId: data.conversationId,
          userMessage: data.message
        });
      }
      
    } catch (error) {
      logger.error('Send message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });
  
  socket.on('disconnect', () => {
    logger.info(`Chat disconnection for user ${socket.data.userId}`);
  });
});

// =============================================================================
// PUBLIC WIDGET ROUTES
// =============================================================================

app.get('/api/widget/:tenantId/config', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    
    const tenant = await prisma.$queryRaw`
      SELECT name, settings
      FROM shared.tenants 
      WHERE id = ${tenantId} AND status = 'active'
    `;
    
    if (!Array.isArray(tenant) || tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    const tenantData = tenant[0] as any;
    const settings = tenantData.settings || {};
    
    // Get church context for widget
    const churchInfo = await aiChatService.getChurchContext(tenantId);
    
    const config = {
      tenantId,
      tenantName: tenantData.name,
      chatEnabled: true,
      prayerRequestsEnabled: true,
      contactEnabled: true,
      theme: settings.widgetTheme || {
        primaryColor: '#3B82F6',
        secondaryColor: '#EF4444',
        textColor: '#1F2937',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      },
      welcomeMessage: settings.welcomeMessage || `Welcome to ${tenantData.name}! I'm here to help answer your questions and connect you with our church community.`,
      quickReplies: settings.quickReplies || [
        "What are your service times?",
        "I'd like to plan a visit",
        "Tell me about kids programs",
        "How can I get involved?"
      ],
      churchInfo: {
        name: churchInfo.name,
        phone: churchInfo.phone,
        email: churchInfo.email,
        address: churchInfo.address,
        serviceTimes: churchInfo.serviceTimes
      }
    };
    
    res.json({
      success: true,
      data: config
    });
    
  } catch (error) {
    logger.error('Widget config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Create new chat conversation
app.post('/api/widget/:tenantId/conversation', async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { sessionId, userAgent, referrer } = req.body;
    
    // Validate tenant
    const tenant = await prisma.$queryRaw`
      SELECT id, schema_name as "schemaName"
      FROM shared.tenants 
      WHERE id = ${tenantId} AND status = 'active'
    `;
    
    if (!Array.isArray(tenant) || tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }
    
    const tenantData = tenant[0] as any;
    const schemaName = tenantData.schemaName;
    
    // Create conversation
    const conversation = await prisma.$queryRawUnsafe(`
      INSERT INTO ${schemaName}.chat_conversations (
        session_id, conversation_type, status, metadata
      ) VALUES ($1, $2, $3, $4)
      RETURNING id, session_id, status, started_at
    `, 
      sessionId,
      'support',
      'active',
      JSON.stringify({
        userAgent,
        referrer,
        source: 'website_widget',
        startedAt: new Date().toISOString()
      })
    );
    
    const conv = (conversation as any[])[0];
    
    // Track analytics
    await redis.hincrby(`chat:analytics:${tenantId}:${new Date().toISOString().split('T')[0]}`, 'conversations_started', 1);
    
    res.status(201).json({
      success: true,
      data: {
        id: conv.id,
        sessionId: conv.session_id,
        status: conv.status,
        startedAt: conv.started_at
      }
    });
    
  } catch (error) {
    logger.error('Create conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get conversation history
app.get('/api/widget/:tenantId/conversation/:conversationId/messages', async (req: Request, res: Response) => {
  try {
    const { tenantId, conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    const schemaName = `tenant_${tenantId.replace(/-/g, '_')}`;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const messages = await prisma.$queryRawUnsafe(`
      SELECT id, sender_type, sender_name, message_text, message_type, 
             message_data, created_at
      FROM ${schemaName}.chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `, conversationId, parseInt(limit as string), offset);
    
    res.json({
      success: true,
      data: (messages as any[]).map(m => ({
        id: m.id,
        role: m.sender_type === 'user' ? 'user' : 'assistant',
        content: m.message_text,
        senderName: m.sender_name,
        messageType: m.message_type,
        metadata: m.message_data,
        timestamp: m.created_at
      }))
    });
    
  } catch (error) {
    logger.error('Get conversation messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Widget analytics endpoint
app.get('/api/widget/:tenantId/analytics', authenticate, authorize('analytics:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    
    const analytics = await aiChatService.getChatAnalytics(tenantId, { start, end });
    
    res.json({
      success: true,
      data: analytics
    });
    
  } catch (error) {
    logger.error('Widget analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// CHAT MANAGEMENT ROUTES (Staff Dashboard)
// =============================================================================

app.get('/api/chat/conversations', extractTenant, authenticate, authorize('chat:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page, limit, sortBy = 'last_activity_at', sortOrder = 'desc' } = parsePagination(req);
    const { status, assigned } = req.query;
    const schemaName = req.tenant!.schemaName;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (status) {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (assigned === 'me') {
      whereClause += ` AND assigned_to = $${paramIndex}`;
      params.push(req.user!.id);
      paramIndex++;
    } else if (assigned === 'unassigned') {
      whereClause += ` AND assigned_to IS NULL`;
    }
    
    const conversations = await prisma.$queryRawUnsafe(`
      SELECT c.*, 
             u.first_name || ' ' || u.last_name as assigned_to_name,
             (SELECT COUNT(*) FROM ${schemaName}.chat_messages WHERE conversation_id = c.id) as message_count
      FROM ${schemaName}.chat_conversations c
      LEFT JOIN shared.tenant_users u ON c.assigned_to = u.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, ...params, limit, offset);
    
    res.json({
      success: true,
      data: conversations
    });
    
  } catch (error) {
    logger.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/chat/conversations/:conversationId', extractTenant, authenticate, authorize('chat:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const schemaName = req.tenant!.schemaName;
    
    // Get conversation details
    const conversation = await prisma.$queryRawUnsafe(`
      SELECT c.*, 
             u.first_name || ' ' || u.last_name as assigned_to_name,
             m.first_name || ' ' || m.last_name as member_name
      FROM ${schemaName}.chat_conversations c
      LEFT JOIN shared.tenant_users u ON c.assigned_to = u.id
      LEFT JOIN ${schemaName}.members m ON c.member_id = m.id
      WHERE c.id = $1
    `, conversationId);
    
    if (!Array.isArray(conversation) || conversation.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    // Get messages
    const messages = await prisma.$queryRawUnsafe(`
      SELECT id, sender_type, sender_name, message_text, message_type, 
             message_data, created_at
      FROM ${schemaName}.chat_messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, conversationId);
    
    res.json({
      success: true,
      data: {
        conversation: conversation[0],
        messages
      }
    });
    
  } catch (error) {
    logger.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.put('/api/chat/conversations/:conversationId/assign', extractTenant, authenticate, authorize('chat:write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { assignedTo } = req.body;
    const schemaName = req.tenant!.schemaName;
    
    await prisma.$queryRawUnsafe(`
      UPDATE ${schemaName}.chat_conversations 
      SET assigned_to = $2, status = 'active'
      WHERE id = $1
    `, conversationId, assignedTo || req.user!.id);
    
    res.json({
      success: true,
      message: 'Conversation assigned successfully'
    });
    
  } catch (error) {
    logger.error('Assign conversation error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// AI CHAT CONFIGURATION ROUTES
// =============================================================================

app.get('/api/chat/config', extractTenant, authenticate, authorize('settings:read'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const churchInfo = await aiChatService.getChurchContext(req.tenant!.id);
    
    res.json({
      success: true,
      data: {
        churchInfo,
        aiEnabled: true,
        autoAssignToStaff: req.tenant!.settings?.autoAssignToStaff || false,
        businessHours: req.tenant!.settings?.businessHours || {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' },
          saturday: { closed: true },
          sunday: { start: '08:00', end: '12:00' }
        }
      }
    });
    
  } catch (error) {
    logger.error('Get chat config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.put('/api/chat/config', extractTenant, authenticate, authorize('settings:write'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { churchInfo, autoAssignToStaff, businessHours, widgetTheme, welcomeMessage, quickReplies } = req.body;
    
    // Update tenant settings
    const updatedSettings = {
      ...req.tenant!.settings,
      autoAssignToStaff,
      businessHours,
      widgetTheme,
      welcomeMessage,
      quickReplies,
      ...churchInfo
    };
    
    await prisma.$queryRaw`
      UPDATE shared.tenants 
      SET settings = ${JSON.stringify(updatedSettings)}
      WHERE id = ${req.tenant!.id}
    `;
    
    // Update AI service cache
    if (churchInfo) {
      await aiChatService.updateChurchContext(req.tenant!.id, churchInfo);
    }
    
    res.json({
      success: true,
      message: 'Chat configuration updated successfully'
    });
    
  } catch (error) {
    logger.error('Update chat config error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// =============================================================================
// ERROR HANDLING
// =============================================================================

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// =============================================================================
// SERVER STARTUP
// =============================================================================

server.listen(config.port, () => {
  logger.info(`Church Management API server running on port ${config.port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  await prisma.$disconnect();
  await redis.quit();
  
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { app, server, io };