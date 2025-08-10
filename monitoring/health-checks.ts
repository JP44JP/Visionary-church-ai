// =============================================================================
// COMPREHENSIVE HEALTH CHECKS AND UPTIME MONITORING
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import { OpenAI } from 'openai';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { updateHealthCheck } from './app-metrics';

// =============================================================================
// HEALTH CHECK CONFIGURATION
// =============================================================================

interface HealthCheck {
  name: string;
  check: () => Promise<HealthResult>;
  timeout: number; // milliseconds
  critical: boolean; // affects overall system health
}

interface HealthResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  duration: number; // milliseconds
  details?: Record<string, any>;
}

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: Record<string, HealthResult>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    critical_failures: number;
  };
}

// =============================================================================
// EXTERNAL SERVICE CLIENTS
// =============================================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  connectTimeout: 5000,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// =============================================================================
// HEALTH CHECK IMPLEMENTATIONS
// =============================================================================

const healthChecks: HealthCheck[] = [
  // Database Health Checks
  {
    name: 'database_connection',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .from('health_check')
          .select('count')
          .limit(1);
          
        if (error) throw error;
        
        return {
          status: 'healthy',
          message: 'Database connection successful',
          duration: Date.now() - start,
          details: { rows: data?.length || 0 },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Database connection failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 5000,
    critical: true,
  },

  {
    name: 'database_performance',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        // Test query performance with a simple aggregation
        const { data, error } = await supabase
          .rpc('get_tenant_count');
          
        if (error) throw error;
        
        const duration = Date.now() - start;
        const status = duration > 2000 ? 'degraded' : duration > 5000 ? 'unhealthy' : 'healthy';
        
        return {
          status,
          message: `Database query completed in ${duration}ms`,
          duration,
          details: { tenant_count: data || 0 },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Database performance check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 10000,
    critical: false,
  },

  {
    name: 'database_deadlocks',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const { data, error } = await supabase
          .rpc('check_database_deadlocks');
          
        if (error) throw error;
        
        const deadlockCount = data || 0;
        const status = deadlockCount > 10 ? 'unhealthy' : deadlockCount > 5 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Found ${deadlockCount} recent deadlocks`,
          duration: Date.now() - start,
          details: { deadlock_count: deadlockCount },
        };
      } catch (error: any) {
        return {
          status: 'degraded',
          message: `Deadlock check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 5000,
    critical: false,
  },

  // Cache Health Checks
  {
    name: 'redis_connection',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        await redis.ping();
        
        return {
          status: 'healthy',
          message: 'Redis connection successful',
          duration: Date.now() - start,
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Redis connection failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 3000,
    critical: false,
  },

  {
    name: 'redis_performance',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const testKey = `health_check:${Date.now()}`;
        const testValue = 'test_value';
        
        // Test write performance
        await redis.set(testKey, testValue, 'EX', 60);
        
        // Test read performance
        const retrievedValue = await redis.get(testKey);
        
        // Cleanup
        await redis.del(testKey);
        
        const duration = Date.now() - start;
        const status = duration > 100 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Redis read/write completed in ${duration}ms`,
          duration,
          details: { 
            write_successful: true,
            read_successful: retrievedValue === testValue,
          },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Redis performance check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 5000,
    critical: false,
  },

  {
    name: 'redis_memory',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const info = await redis.info('memory');
        const lines = info.split('\r\n');
        const memoryData: Record<string, string> = {};
        
        lines.forEach(line => {
          if (line.includes(':')) {
            const [key, value] = line.split(':');
            memoryData[key] = value;
          }
        });
        
        const usedMemory = parseInt(memoryData.used_memory || '0');
        const maxMemory = parseInt(memoryData.maxmemory || '0');
        const memoryUsagePercent = maxMemory > 0 ? (usedMemory / maxMemory) * 100 : 0;
        
        const status = memoryUsagePercent > 90 ? 'unhealthy' : memoryUsagePercent > 80 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Redis memory usage: ${memoryUsagePercent.toFixed(1)}%`,
          duration: Date.now() - start,
          details: {
            used_memory_mb: Math.round(usedMemory / 1024 / 1024),
            max_memory_mb: Math.round(maxMemory / 1024 / 1024),
            usage_percent: memoryUsagePercent,
          },
        };
      } catch (error: any) {
        return {
          status: 'degraded',
          message: `Redis memory check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 3000,
    critical: false,
  },

  // External Service Health Checks
  {
    name: 'openai_api',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const models = await openai.models.list();
        
        const duration = Date.now() - start;
        const status = duration > 5000 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `OpenAI API responding in ${duration}ms`,
          duration,
          details: { 
            model_count: models.data.length,
            available_models: models.data.slice(0, 5).map(m => m.id),
          },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `OpenAI API check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 10000,
    critical: false,
  },

  {
    name: 'openai_quota',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        // This is a mock check - in reality you'd query OpenAI usage API
        // For now we'll check if we can make a minimal request
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 1,
        });
        
        const duration = Date.now() - start;
        
        return {
          status: 'healthy',
          message: 'OpenAI quota check successful',
          duration,
          details: {
            tokens_used: completion.usage?.total_tokens || 0,
            model: completion.model,
          },
        };
      } catch (error: any) {
        const status = error.message.includes('quota') ? 'unhealthy' : 'degraded';
        return {
          status,
          message: `OpenAI quota check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 15000,
    critical: false,
  },

  {
    name: 'email_service',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        await emailTransporter.verify();
        
        return {
          status: 'healthy',
          message: 'Email service connection verified',
          duration: Date.now() - start,
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Email service check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 10000,
    critical: false,
  },

  {
    name: 'sms_service',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        // Check Twilio account status
        const account = await twilioClient.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        
        const status = account.status === 'active' ? 'healthy' : 'degraded';
        
        return {
          status,
          message: `Twilio account status: ${account.status}`,
          duration: Date.now() - start,
          details: {
            account_status: account.status,
            account_type: account.type,
          },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `SMS service check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 10000,
    critical: false,
  },

  // System Health Checks
  {
    name: 'disk_space',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const { execSync } = require('child_process');
        const output = execSync('df -h /', { encoding: 'utf8' });
        const lines = output.trim().split('\n');
        const data = lines[1].split(/\s+/);
        
        const usagePercent = parseInt(data[4].replace('%', ''));
        const status = usagePercent > 90 ? 'unhealthy' : usagePercent > 80 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Disk usage: ${usagePercent}%`,
          duration: Date.now() - start,
          details: {
            total: data[1],
            used: data[2],
            available: data[3],
            usage_percent: usagePercent,
          },
        };
      } catch (error: any) {
        return {
          status: 'degraded',
          message: `Disk space check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 5000,
    critical: true,
  },

  {
    name: 'memory_usage',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        const memUsage = process.memoryUsage();
        const totalMemory = require('os').totalmem();
        const freeMemory = require('os').freemem();
        
        const usedMemoryPercent = ((totalMemory - freeMemory) / totalMemory) * 100;
        const heapUsedPercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
        
        const status = usedMemoryPercent > 90 || heapUsedPercent > 90 ? 'unhealthy' : 
                      usedMemoryPercent > 80 || heapUsedPercent > 80 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Memory usage: ${usedMemoryPercent.toFixed(1)}%, Heap: ${heapUsedPercent.toFixed(1)}%`,
          duration: Date.now() - start,
          details: {
            system_memory_percent: usedMemoryPercent,
            heap_used_mb: Math.round(memUsage.heapUsed / 1024 / 1024),
            heap_total_mb: Math.round(memUsage.heapTotal / 1024 / 1024),
            external_mb: Math.round(memUsage.external / 1024 / 1024),
          },
        };
      } catch (error: any) {
        return {
          status: 'degraded',
          message: `Memory usage check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 3000,
    critical: true,
  },

  // Business Logic Health Checks
  {
    name: 'tenant_isolation',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        // Test that tenant isolation is working correctly
        const { data: tenantCount, error } = await supabase
          .rpc('verify_tenant_isolation');
          
        if (error) throw error;
        
        return {
          status: 'healthy',
          message: 'Tenant isolation verified',
          duration: Date.now() - start,
          details: { active_tenants: tenantCount },
        };
      } catch (error: any) {
        return {
          status: 'unhealthy',
          message: `Tenant isolation check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 8000,
    critical: true,
  },

  {
    name: 'queue_processing',
    check: async (): Promise<HealthResult> => {
      const start = Date.now();
      try {
        // Check queue lengths and processing delays
        const queueLengths = await redis.mget(
          'queue:emails:length',
          'queue:sms:length',
          'queue:follow_ups:length'
        );
        
        const totalQueueLength = queueLengths
          .map(len => parseInt(len || '0'))
          .reduce((sum, len) => sum + len, 0);
        
        const status = totalQueueLength > 1000 ? 'unhealthy' : 
                      totalQueueLength > 500 ? 'degraded' : 'healthy';
        
        return {
          status,
          message: `Total queued jobs: ${totalQueueLength}`,
          duration: Date.now() - start,
          details: {
            email_queue: parseInt(queueLengths[0] || '0'),
            sms_queue: parseInt(queueLengths[1] || '0'),
            follow_up_queue: parseInt(queueLengths[2] || '0'),
          },
        };
      } catch (error: any) {
        return {
          status: 'degraded',
          message: `Queue processing check failed: ${error.message}`,
          duration: Date.now() - start,
          details: { error: error.message },
        };
      }
    },
    timeout: 5000,
    critical: false,
  },
];

// =============================================================================
// HEALTH CHECK EXECUTION ENGINE
// =============================================================================

async function executeHealthCheck(healthCheck: HealthCheck): Promise<HealthResult> {
  const timeoutPromise = new Promise<HealthResult>((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Health check timeout after ${healthCheck.timeout}ms`));
    }, healthCheck.timeout);
  });

  try {
    const result = await Promise.race([
      healthCheck.check(),
      timeoutPromise,
    ]);

    // Update metrics
    updateHealthCheck(
      healthCheck.name, 
      'check', 
      result.status === 'healthy'
    );

    return result;
  } catch (error: any) {
    const result: HealthResult = {
      status: 'unhealthy',
      message: `Health check failed: ${error.message}`,
      duration: healthCheck.timeout,
      details: { error: error.message, timeout: true },
    };

    updateHealthCheck(healthCheck.name, 'check', false);
    return result;
  }
}

export async function performHealthChecks(): Promise<SystemHealth> {
  const startTime = Date.now();
  const checks: Record<string, HealthResult> = {};
  
  // Execute all health checks in parallel
  const checkPromises = healthChecks.map(async (healthCheck) => {
    const result = await executeHealthCheck(healthCheck);
    checks[healthCheck.name] = result;
    return { name: healthCheck.name, result, critical: healthCheck.critical };
  });

  const results = await Promise.all(checkPromises);

  // Calculate summary
  const summary = {
    total: results.length,
    healthy: results.filter(r => r.result.status === 'healthy').length,
    degraded: results.filter(r => r.result.status === 'degraded').length,
    unhealthy: results.filter(r => r.result.status === 'unhealthy').length,
    critical_failures: results.filter(r => r.critical && r.result.status === 'unhealthy').length,
  };

  // Determine overall system status
  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  
  if (summary.critical_failures > 0) {
    overallStatus = 'unhealthy';
  } else if (summary.unhealthy > 0 || summary.degraded > 2) {
    overallStatus = 'degraded';
  } else if (summary.degraded > 0) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const systemHealth: SystemHealth = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    summary,
  };

  console.log(`Health check completed in ${Date.now() - startTime}ms - Status: ${overallStatus}`);
  return systemHealth;
}

// =============================================================================
// HEALTH CHECK API ENDPOINTS
// =============================================================================

export async function handleHealthCheck(req: NextRequest): Promise<NextResponse> {
  try {
    const systemHealth = await performHealthChecks();
    
    const statusCode = systemHealth.status === 'healthy' ? 200 : 
                      systemHealth.status === 'degraded' ? 200 : 503;
    
    return NextResponse.json(systemHealth, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      message: `Health check system failure: ${error.message}`,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

export async function handleQuickHealthCheck(req: NextRequest): Promise<NextResponse> {
  try {
    const quickChecks = [
      'database_connection',
      'redis_connection',
      'disk_space',
      'memory_usage',
    ];
    
    const relevantChecks = healthChecks.filter(check => 
      quickChecks.includes(check.name)
    );
    
    const checkPromises = relevantChecks.map(async (healthCheck) => {
      const result = await executeHealthCheck(healthCheck);
      return { name: healthCheck.name, result, critical: healthCheck.critical };
    });

    const results = await Promise.all(checkPromises);
    
    const hasFailures = results.some(r => 
      r.critical && r.result.status === 'unhealthy'
    );
    
    return NextResponse.json({
      status: hasFailures ? 'unhealthy' : 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: results.reduce((acc, r) => {
        acc[r.name] = r.result;
        return acc;
      }, {} as Record<string, HealthResult>),
    }, { 
      status: hasFailures ? 503 : 200 
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

// =============================================================================
// STARTUP HEALTH VALIDATION
// =============================================================================

export async function validateStartupHealth(): Promise<boolean> {
  console.log('Performing startup health validation...');
  
  const criticalChecks = healthChecks.filter(check => check.critical);
  const results = await Promise.all(
    criticalChecks.map(check => executeHealthCheck(check))
  );
  
  const failures = results.filter(result => result.status === 'unhealthy');
  
  if (failures.length > 0) {
    console.error('Startup health validation failed:');
    failures.forEach(failure => {
      console.error(`- ${failure.message}`);
    });
    return false;
  }
  
  console.log('Startup health validation passed');
  return true;
}

// =============================================================================
// SCHEDULED HEALTH CHECK MONITORING
// =============================================================================

let healthCheckInterval: NodeJS.Timeout | null = null;

export function startHealthCheckScheduler(intervalMs: number = 30000) {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }
  
  healthCheckInterval = setInterval(async () => {
    try {
      const health = await performHealthChecks();
      
      if (health.status === 'unhealthy') {
        console.error('CRITICAL: System health is unhealthy!', {
          critical_failures: health.summary.critical_failures,
          unhealthy_checks: Object.entries(health.checks)
            .filter(([_, result]) => result.status === 'unhealthy')
            .map(([name, result]) => ({ name, message: result.message })),
        });
      }
    } catch (error) {
      console.error('Health check scheduler error:', error);
    }
  }, intervalMs);
  
  console.log(`Health check scheduler started (interval: ${intervalMs}ms)`);
}

export function stopHealthCheckScheduler() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    console.log('Health check scheduler stopped');
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  stopHealthCheckScheduler();
  redis.disconnect();
});

process.on('SIGTERM', () => {
  stopHealthCheckScheduler();
  redis.disconnect();
});