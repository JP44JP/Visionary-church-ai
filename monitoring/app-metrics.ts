// =============================================================================
// APPLICATION PERFORMANCE MONITORING INSTRUMENTATION
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { StatsD } from 'node-statsd';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';

// =============================================================================
// METRICS CLIENT CONFIGURATION
// =============================================================================

// Prometheus metrics registry
collectDefaultMetrics({ register });

// StatsD client for real-time metrics
const statsd = new StatsD({
  host: process.env.STATSD_HOST || 'localhost',
  port: parseInt(process.env.STATSD_PORT || '8125'),
  prefix: 'church.',
  suffix: '',
  globalize: false,
  cacheDns: false,
  mock: process.env.NODE_ENV === 'test',
});

// =============================================================================
// PROMETHEUS METRICS DEFINITIONS
// =============================================================================

// HTTP Request Metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'tenant_id'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

// Business Metrics
export const chatConversationsStarted = new Counter({
  name: 'church_chat_conversations_started_total',
  help: 'Total number of chat conversations started',
  labelNames: ['tenant_id', 'source'],
});

export const chatResponseDuration = new Histogram({
  name: 'church_chat_response_duration_seconds',
  help: 'Duration of chat responses from OpenAI',
  labelNames: ['tenant_id', 'model'],
  buckets: [1, 3, 5, 10, 15, 30, 60],
});

export const prayerRequestsSubmitted = new Counter({
  name: 'church_prayer_requests_submitted_total',
  help: 'Total number of prayer requests submitted',
  labelNames: ['tenant_id', 'category', 'source'],
});

export const prayerRequestsPending = new Gauge({
  name: 'church_prayer_requests_pending_count',
  help: 'Current number of pending prayer requests',
  labelNames: ['tenant_id', 'priority'],
});

export const visitRequestsTotal = new Counter({
  name: 'church_visit_requests_total',
  help: 'Total number of visit requests',
  labelNames: ['tenant_id', 'visit_type'],
});

export const visitConfirmationsTotal = new Counter({
  name: 'church_visit_confirmations_total',
  help: 'Total number of visit confirmations',
  labelNames: ['tenant_id', 'visit_type'],
});

export const eventRegistrationsTotal = new Counter({
  name: 'church_event_registrations_total',
  help: 'Total number of event registrations',
  labelNames: ['tenant_id', 'event_type', 'registration_type'],
});

export const eventRegistrationFailures = new Counter({
  name: 'church_event_registration_failures_total',
  help: 'Total number of failed event registrations',
  labelNames: ['tenant_id', 'failure_reason'],
});

export const followUpSequencesStalled = new Gauge({
  name: 'church_follow_up_sequences_stalled_count',
  help: 'Number of stalled follow-up sequences',
  labelNames: ['tenant_id', 'sequence_type'],
});

export const emailsSentTotal = new Counter({
  name: 'church_emails_sent_total',
  help: 'Total number of emails sent',
  labelNames: ['tenant_id', 'email_type', 'provider'],
});

export const emailsDeliveredTotal = new Counter({
  name: 'church_emails_delivered_total',
  help: 'Total number of emails delivered',
  labelNames: ['tenant_id', 'email_type', 'provider'],
});

export const smsSentTotal = new Counter({
  name: 'church_sms_sent_total',
  help: 'Total number of SMS messages sent',
  labelNames: ['tenant_id', 'sms_type', 'provider'],
});

export const smsDeliveryFailures = new Counter({
  name: 'church_sms_delivery_failures_total',
  help: 'Total number of SMS delivery failures',
  labelNames: ['tenant_id', 'failure_reason', 'provider'],
});

// OpenAI Metrics
export const openaiRequestsTotal = new Counter({
  name: 'church_openai_requests_total',
  help: 'Total number of OpenAI API requests',
  labelNames: ['tenant_id', 'model', 'endpoint'],
});

export const openaiTokensUsed = new Counter({
  name: 'church_openai_tokens_used_total',
  help: 'Total number of OpenAI tokens used',
  labelNames: ['tenant_id', 'model', 'type'], // type: prompt, completion
});

export const openaiQuotaUsage = new Gauge({
  name: 'church_openai_quota_usage_percent',
  help: 'Current OpenAI quota usage percentage',
  labelNames: ['quota_type'],
});

export const openaiErrorsTotal = new Counter({
  name: 'church_openai_errors_total',
  help: 'Total number of OpenAI API errors',
  labelNames: ['tenant_id', 'error_type', 'model'],
});

// Multi-tenant Metrics
export const tenantResourceUsage = new Gauge({
  name: 'church_tenant_resource_usage_percent',
  help: 'Resource usage percentage by tenant',
  labelNames: ['tenant_id', 'resource_type'],
});

export const tenantDbConnections = new Gauge({
  name: 'church_tenant_db_connections',
  help: 'Number of database connections per tenant',
  labelNames: ['tenant_id'],
});

export const tenantStorageUsage = new Gauge({
  name: 'church_tenant_storage_usage_percent',
  help: 'Storage usage percentage by tenant',
  labelNames: ['tenant_id'],
});

export const tenantRateLimitExceeded = new Counter({
  name: 'church_tenant_rate_limit_exceeded_total',
  help: 'Total number of rate limit violations by tenant',
  labelNames: ['tenant_id', 'endpoint'],
});

// User Experience Metrics
export const pageLoadDuration = new Histogram({
  name: 'church_page_load_duration_seconds',
  help: 'Page load duration in seconds',
  labelNames: ['tenant_id', 'page', 'device_type'],
  buckets: [0.5, 1, 2, 3, 5, 10, 15],
});

export const searchQueryDuration = new Histogram({
  name: 'church_search_query_duration_seconds',
  help: 'Search query duration in seconds',
  labelNames: ['tenant_id', 'search_type'],
  buckets: [0.1, 0.5, 1, 2, 3, 5],
});

export const mobileCrashes = new Counter({
  name: 'church_mobile_crashes_total',
  help: 'Total number of mobile app crashes',
  labelNames: ['tenant_id', 'platform', 'version'],
});

// Security Metrics
export const failedLoginAttempts = new Counter({
  name: 'church_failed_login_attempts_total',
  help: 'Total number of failed login attempts',
  labelNames: ['source_ip', 'tenant_id', 'user_agent'],
});

export const unauthorizedApiRequests = new Counter({
  name: 'church_api_unauthorized_requests_total',
  help: 'Total number of unauthorized API requests',
  labelNames: ['endpoint', 'source_ip', 'tenant_id'],
});

export const passwordFailures = new Counter({
  name: 'church_password_failures_total',
  help: 'Total number of password failures',
  labelNames: ['source_ip', 'tenant_id'],
});

export const sqlInjectionAttempts = new Counter({
  name: 'church_sql_injection_attempts_total',
  help: 'Total number of SQL injection attempts',
  labelNames: ['source_ip', 'endpoint'],
});

// =============================================================================
// MIDDLEWARE FOR REQUEST TRACKING
// =============================================================================

export interface RequestMetrics {
  startTime: [number, number];
  tenantId?: string;
  userId?: string;
  route: string;
}

export function createRequestMetrics(req: NextRequest): RequestMetrics {
  const startTime = process.hrtime();
  const tenantId = extractTenantId(req);
  const userId = extractUserId(req);
  const route = extractRoute(req);

  return {
    startTime,
    tenantId,
    userId,
    route,
  };
}

export function trackRequestCompletion(
  req: NextRequest,
  res: NextResponse,
  metrics: RequestMetrics
) {
  const duration = getDurationInSeconds(metrics.startTime);
  const method = req.method;
  const statusCode = res.status.toString();
  const route = metrics.route;
  const tenantId = metrics.tenantId || 'unknown';

  // Prometheus metrics
  httpRequestsTotal.inc({ method, route, status_code: statusCode, tenant_id: tenantId });
  httpRequestDuration.observe(
    { method, route, status_code: statusCode, tenant_id: tenantId },
    duration
  );

  // StatsD metrics for real-time monitoring
  statsd.increment('http.requests', 1, [`method:${method}`, `status:${statusCode}`, `tenant:${tenantId}`]);
  statsd.histogram('http.response_time', duration * 1000, [`method:${method}`, `tenant:${tenantId}`]);

  // Log slow requests
  if (duration > 2) {
    console.warn(`Slow request detected: ${method} ${route} took ${duration}s for tenant ${tenantId}`);
    statsd.increment('http.slow_requests', 1, [`method:${method}`, `tenant:${tenantId}`]);
  }

  // Track error rates
  if (res.status >= 400) {
    statsd.increment('http.errors', 1, [
      `method:${method}`,
      `status:${statusCode}`,
      `tenant:${tenantId}`,
    ]);
  }
}

// =============================================================================
// BUSINESS METRICS TRACKING FUNCTIONS
// =============================================================================

export function trackChatConversation(tenantId: string, source: string = 'widget') {
  chatConversationsStarted.inc({ tenant_id: tenantId, source });
  statsd.increment('chat.conversations_started', 1, [`tenant:${tenantId}`, `source:${source}`]);
}

export function trackChatResponse(tenantId: string, duration: number, model: string = 'gpt-3.5-turbo') {
  chatResponseDuration.observe({ tenant_id: tenantId, model }, duration);
  statsd.histogram('chat.response_time', duration * 1000, [`tenant:${tenantId}`, `model:${model}`]);
}

export function trackPrayerRequest(
  tenantId: string,
  category: string = 'general',
  source: string = 'form'
) {
  prayerRequestsSubmitted.inc({ tenant_id: tenantId, category, source });
  statsd.increment('prayers.submitted', 1, [`tenant:${tenantId}`, `category:${category}`]);
}

export function updatePendingPrayerRequests(tenantId: string, count: number, priority: string = 'normal') {
  prayerRequestsPending.set({ tenant_id: tenantId, priority }, count);
  statsd.gauge('prayers.pending', count, [`tenant:${tenantId}`, `priority:${priority}`]);
}

export function trackVisitRequest(tenantId: string, visitType: string = 'general') {
  visitRequestsTotal.inc({ tenant_id: tenantId, visit_type: visitType });
  statsd.increment('visits.requested', 1, [`tenant:${tenantId}`, `type:${visitType}`]);
}

export function trackVisitConfirmation(tenantId: string, visitType: string = 'general') {
  visitConfirmationsTotal.inc({ tenant_id: tenantId, visit_type: visitType });
  statsd.increment('visits.confirmed', 1, [`tenant:${tenantId}`, `type:${visitType}`]);
}

export function trackEventRegistration(
  tenantId: string,
  eventType: string = 'service',
  registrationType: string = 'online'
) {
  eventRegistrationsTotal.inc({
    tenant_id: tenantId,
    event_type: eventType,
    registration_type: registrationType,
  });
  statsd.increment('events.registrations', 1, [
    `tenant:${tenantId}`,
    `event_type:${eventType}`,
    `reg_type:${registrationType}`,
  ]);
}

export function trackEventRegistrationFailure(tenantId: string, failureReason: string) {
  eventRegistrationFailures.inc({ tenant_id: tenantId, failure_reason: failureReason });
  statsd.increment('events.registration_failures', 1, [
    `tenant:${tenantId}`,
    `reason:${failureReason}`,
  ]);
}

export function updateStalledSequences(tenantId: string, count: number, sequenceType: string = 'welcome') {
  followUpSequencesStalled.set({ tenant_id: tenantId, sequence_type: sequenceType }, count);
  statsd.gauge('sequences.stalled', count, [`tenant:${tenantId}`, `type:${sequenceType}`]);
}

export function trackEmailSent(
  tenantId: string,
  emailType: string = 'notification',
  provider: string = 'sendgrid'
) {
  emailsSentTotal.inc({ tenant_id: tenantId, email_type: emailType, provider });
  statsd.increment('emails.sent', 1, [`tenant:${tenantId}`, `type:${emailType}`, `provider:${provider}`]);
}

export function trackEmailDelivered(
  tenantId: string,
  emailType: string = 'notification',
  provider: string = 'sendgrid'
) {
  emailsDeliveredTotal.inc({ tenant_id: tenantId, email_type: emailType, provider });
  statsd.increment('emails.delivered', 1, [`tenant:${tenantId}`, `type:${emailType}`, `provider:${provider}`]);
}

export function trackSMSSent(
  tenantId: string,
  smsType: string = 'notification',
  provider: string = 'twilio'
) {
  smsSentTotal.inc({ tenant_id: tenantId, sms_type: smsType, provider });
  statsd.increment('sms.sent', 1, [`tenant:${tenantId}`, `type:${smsType}`, `provider:${provider}`]);
}

export function trackSMSDeliveryFailure(
  tenantId: string,
  failureReason: string,
  provider: string = 'twilio'
) {
  smsDeliveryFailures.inc({ tenant_id: tenantId, failure_reason: failureReason, provider });
  statsd.increment('sms.failures', 1, [
    `tenant:${tenantId}`,
    `reason:${failureReason}`,
    `provider:${provider}`,
  ]);
}

// =============================================================================
// OPENAI METRICS TRACKING
// =============================================================================

export function trackOpenAIRequest(
  tenantId: string,
  model: string,
  endpoint: string = 'chat/completions'
) {
  openaiRequestsTotal.inc({ tenant_id: tenantId, model, endpoint });
  statsd.increment('openai.requests', 1, [`tenant:${tenantId}`, `model:${model}`, `endpoint:${endpoint}`]);
}

export function trackOpenAITokenUsage(
  tenantId: string,
  model: string,
  promptTokens: number,
  completionTokens: number
) {
  openaiTokensUsed.inc({ tenant_id: tenantId, model, type: 'prompt' }, promptTokens);
  openaiTokensUsed.inc({ tenant_id: tenantId, model, type: 'completion' }, completionTokens);
  
  statsd.increment('openai.tokens', promptTokens, [`tenant:${tenantId}`, `model:${model}`, `type:prompt`]);
  statsd.increment('openai.tokens', completionTokens, [`tenant:${tenantId}`, `model:${model}`, `type:completion`]);
}

export function updateOpenAIQuotaUsage(quotaType: string, usagePercent: number) {
  openaiQuotaUsage.set({ quota_type: quotaType }, usagePercent);
  statsd.gauge('openai.quota_usage', usagePercent, [`type:${quotaType}`]);
}

export function trackOpenAIError(tenantId: string, errorType: string, model: string) {
  openaiErrorsTotal.inc({ tenant_id: tenantId, error_type: errorType, model });
  statsd.increment('openai.errors', 1, [`tenant:${tenantId}`, `error:${errorType}`, `model:${model}`]);
}

// =============================================================================
// SECURITY METRICS TRACKING
// =============================================================================

export function trackFailedLogin(sourceIp: string, tenantId: string, userAgent?: string) {
  failedLoginAttempts.inc({
    source_ip: hashIP(sourceIp),
    tenant_id: tenantId,
    user_agent: userAgent?.substring(0, 50) || 'unknown',
  });
  statsd.increment('security.failed_logins', 1, [`tenant:${tenantId}`, `ip:${hashIP(sourceIp)}`]);
}

export function trackUnauthorizedAccess(endpoint: string, sourceIp: string, tenantId?: string) {
  unauthorizedApiRequests.inc({
    endpoint,
    source_ip: hashIP(sourceIp),
    tenant_id: tenantId || 'unknown',
  });
  statsd.increment('security.unauthorized', 1, [`endpoint:${endpoint}`, `ip:${hashIP(sourceIp)}`]);
}

export function trackSQLInjectionAttempt(sourceIp: string, endpoint: string) {
  sqlInjectionAttempts.inc({ source_ip: hashIP(sourceIp), endpoint });
  statsd.increment('security.sql_injection', 1, [`endpoint:${endpoint}`, `ip:${hashIP(sourceIp)}`]);
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

function extractTenantId(req: NextRequest): string | undefined {
  // Try to extract tenant ID from various sources
  const fromHeader = req.headers.get('x-tenant-id');
  if (fromHeader) return fromHeader;

  const fromQuery = req.nextUrl.searchParams.get('tenant');
  if (fromQuery) return fromQuery;

  // Extract from subdomain
  const host = req.headers.get('host') || '';
  const subdomain = host.split('.')[0];
  if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
    return subdomain;
  }

  return undefined;
}

function extractUserId(req: NextRequest): string | undefined {
  return req.headers.get('x-user-id') || undefined;
}

function extractRoute(req: NextRequest): string {
  const pathname = req.nextUrl.pathname;
  // Normalize route by removing IDs and parameters
  return pathname.replace(/\/\d+/g, '/:id').replace(/\/[a-f0-9-]{36}/g, '/:uuid');
}

function getDurationInSeconds(startTime: [number, number]): number {
  const [seconds, nanoseconds] = process.hrtime(startTime);
  return seconds + nanoseconds / 1e9;
}

function hashIP(ip: string): string {
  // Hash IP addresses for privacy while maintaining uniqueness for monitoring
  return createHash('sha256').update(ip).digest('hex').substring(0, 8);
}

// =============================================================================
// HEALTH CHECK METRICS
// =============================================================================

export const healthCheckStatus = new Gauge({
  name: 'church_health_check_success',
  help: 'Health check status (1 = healthy, 0 = unhealthy)',
  labelNames: ['service', 'check_type'],
});

export function updateHealthCheck(service: string, checkType: string, isHealthy: boolean) {
  healthCheckStatus.set({ service, check_type: checkType }, isHealthy ? 1 : 0);
  statsd.gauge('health.check', isHealthy ? 1 : 0, [`service:${service}`, `type:${checkType}`]);
}

// =============================================================================
// EXPORT METRICS ENDPOINTS
// =============================================================================

export async function getPrometheusMetrics(): Promise<string> {
  return register.metrics();
}

export async function getBusinessMetrics(): Promise<object> {
  return {
    timestamp: new Date().toISOString(),
    metrics: {
      conversations_started: await chatConversationsStarted.get(),
      prayer_requests_submitted: await prayerRequestsSubmitted.get(),
      visit_requests: await visitRequestsTotal.get(),
      event_registrations: await eventRegistrationsTotal.get(),
      emails_sent: await emailsSentTotal.get(),
      sms_sent: await smsSentTotal.get(),
    },
  };
}

export async function getSecurityMetrics(): Promise<object> {
  return {
    timestamp: new Date().toISOString(),
    security_events: {
      failed_logins: await failedLoginAttempts.get(),
      unauthorized_requests: await unauthorizedApiRequests.get(),
      sql_injection_attempts: await sqlInjectionAttempts.get(),
    },
  };
}