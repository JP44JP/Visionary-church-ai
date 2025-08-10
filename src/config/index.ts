// Application Configuration
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().url(),
  
  // Redis
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('24h'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // CORS
  ALLOWED_ORIGINS: z.string().transform(s => s.split(',')).default('http://localhost:3000,http://localhost:3001'),
  
  // AWS S3
  AWS_REGION: z.string().default('us-east-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  S3_BUCKET: z.string().default('visionary-church-files'),
  S3_PUBLIC_URL: z.string().url().optional(),
  
  // Email (SendGrid)
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@visionarychurch.ai'),
  FROM_NAME: z.string().default('VisionaryChurch'),
  
  // SMS (Twilio)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  
  // Analytics
  GOOGLE_ANALYTICS_ID: z.string().optional(),
  
  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).default('12'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  
  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default('52428800'), // 50MB
  ALLOWED_FILE_TYPES: z.string().transform(s => s.split(',')).default('jpg,jpeg,png,gif,pdf,doc,docx,txt,mp4,mp3'),
  
  // Feature Flags
  ENABLE_AI_CHAT: z.string().transform(s => s === 'true').default('true'),
  ENABLE_EMAIL_AUTOMATION: z.string().transform(s => s === 'true').default('true'),
  ENABLE_SMS_NOTIFICATIONS: z.string().transform(s => s === 'true').default('true'),
  ENABLE_ANALYTICS: z.string().transform(s => s === 'true').default('true'),
});

// Validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  env: env.NODE_ENV,
  port: env.PORT,
  
  database: {
    url: env.DATABASE_URL,
  },
  
  redis: {
    url: env.REDIS_URL,
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  
  cors: {
    allowedOrigins: env.ALLOWED_ORIGINS,
  },
  
  aws: {
    region: env.AWS_REGION,
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    s3: {
      bucket: env.S3_BUCKET,
      publicUrl: env.S3_PUBLIC_URL,
    },
  },
  
  email: {
    sendgrid: {
      apiKey: env.SENDGRID_API_KEY,
    },
    from: {
      email: env.FROM_EMAIL,
      name: env.FROM_NAME,
    },
  },
  
  sms: {
    twilio: {
      accountSid: env.TWILIO_ACCOUNT_SID,
      authToken: env.TWILIO_AUTH_TOKEN,
      phoneNumber: env.TWILIO_PHONE_NUMBER,
    },
  },
  
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
      model: env.OPENAI_MODEL,
    },
  },
  
  analytics: {
    googleAnalyticsId: env.GOOGLE_ANALYTICS_ID,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    rateLimit: {
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
    },
  },
  
  fileUpload: {
    maxSize: env.MAX_FILE_SIZE,
    allowedTypes: env.ALLOWED_FILE_TYPES,
  },
  
  features: {
    aiChat: env.ENABLE_AI_CHAT,
    emailAutomation: env.ENABLE_EMAIL_AUTOMATION,
    smsNotifications: env.ENABLE_SMS_NOTIFICATIONS,
    analytics: env.ENABLE_ANALYTICS,
  },
  
  // Rate limiting configurations for different endpoints
  rateLimits: {
    auth: {
      login: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
      register: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 registrations per hour
      forgotPassword: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
      resetPassword: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
    },
    api: {
      general: { windowMs: 15 * 60 * 1000, max: 1000 }, // 1000 requests per 15 minutes
      upload: { windowMs: 60 * 1000, max: 10 }, // 10 uploads per minute
      chat: { windowMs: 60 * 1000, max: 30 }, // 30 chat messages per minute
      email: { windowMs: 60 * 60 * 1000, max: 100 }, // 100 emails per hour per tenant
      sms: { windowMs: 60 * 60 * 1000, max: 50 }, // 50 SMS per hour per tenant
    },
    widget: {
      general: { windowMs: 60 * 1000, max: 100 }, // 100 widget requests per minute
      chat: { windowMs: 60 * 1000, max: 20 }, // 20 widget chat messages per minute
      contact: { windowMs: 60 * 60 * 1000, max: 10 }, // 10 contact submissions per hour
    },
  },
  
  // Pagination defaults
  pagination: {
    defaultLimit: 25,
    maxLimit: 100,
  },
  
  // Cache TTL (in seconds)
  cache: {
    tenantConfig: 300, // 5 minutes
    userSession: 3600, // 1 hour
    analyticsData: 900, // 15 minutes
    publicContent: 1800, // 30 minutes
  },
  
  // Queue configurations
  queues: {
    email: {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 2000 },
        delay: 0,
      },
    },
    sms: {
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: { type: 'exponential' as const, delay: 2000 },
        delay: 0,
      },
    },
    analytics: {
      defaultJobOptions: {
        removeOnComplete: 50,
        removeOnFail: 25,
        attempts: 2,
        backoff: { type: 'exponential' as const, delay: 5000 },
        delay: 0,
      },
    },
  },
  
  // AI Configuration
  aiConfig: {
    maxTokens: 2000,
    temperature: 0.7,
    systemPrompts: {
      general: `You are a helpful AI assistant for a church. You provide supportive, respectful, and informative responses about church activities, services, and general Christian fellowship. Always maintain a warm, welcoming tone.`,
      prayer: `You are assisting with prayer requests. Respond with empathy, compassion, and appropriate spiritual guidance while being sensitive to personal struggles.`,
      pastoral: `You are helping with pastoral care inquiries. Provide thoughtful, biblically-informed responses while encouraging people to also connect with their church leadership for personal matters.`,
    },
  },
};

// Environment-specific overrides
if (config.env === 'production') {
  // Production-specific settings
  config.security.bcryptRounds = 15;
  config.rateLimits.api.general.max = 10000; // Higher limits for production
}

if (config.env === 'test') {
  // Test-specific settings
  config.security.bcryptRounds = 4; // Faster for tests
  config.jwt.expiresIn = '1h';
}

export type Config = typeof config;