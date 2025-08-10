// =============================================================================
// SECURITY METRICS API ENDPOINT
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { getSecurityMetrics } from '../../../../../monitoring/app-metrics';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1h';
    const format = searchParams.get('format') || 'json';
    const includeDetails = searchParams.get('include_details') === 'true';

    // Get security metrics from monitoring system
    const prometheusMetrics = await getSecurityMetrics();

    // Get real-time security data from database and logs
    const securityData = await getRealtimeSecurityMetrics(timeframe, includeDetails);

    const response = {
      ...prometheusMetrics,
      realtime_data: securityData,
      metadata: {
        timeframe,
        include_details: includeDetails,
        generated_at: new Date().toISOString(),
      },
    };

    if (format === 'prometheus') {
      // Return Prometheus format for scraping
      const prometheusFormat = convertToPrometheusFormat(response);
      return new NextResponse(prometheusFormat, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; version=0.0.4; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Generated-At': new Date().toISOString(),
        'X-Security-Level': determineSecurityLevel(securityData),
      },
    });
  } catch (error) {
    console.error('Error generating security metrics:', error);
    
    return NextResponse.json({
      error: 'Failed to generate security metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

async function getRealtimeSecurityMetrics(timeframe: string = '1h', includeDetails: boolean = false) {
  try {
    // Calculate time range
    const timeRangeMinutes = parseTimeframe(timeframe);
    const startTime = new Date(Date.now() - timeRangeMinutes * 60 * 1000).toISOString();

    // Get security events from database
    const { data: authLogs, error: authError } = await supabase
      .from('auth_logs')
      .select('id, event_type, ip_address, user_agent, tenant_id, created_at, success')
      .gte('created_at', startTime)
      .order('created_at', { ascending: false });

    if (authError) {
      console.error('Error fetching auth logs:', authError);
    }

    // Get API access logs
    const { data: apiLogs, error: apiError } = await supabase
      .from('api_access_logs')
      .select('id, method, endpoint, ip_address, status_code, tenant_id, created_at, response_time')
      .gte('created_at', startTime)
      .order('created_at', { ascending: false });

    if (apiError) {
      console.error('Error fetching API logs:', apiError);
    }

    // Process security metrics
    const metrics = {
      authentication: {
        total_attempts: authLogs?.length || 0,
        failed_attempts: authLogs?.filter(log => !log.success).length || 0,
        success_rate: calculateSuccessRate(authLogs),
        unique_ips: getUniqueIPs(authLogs),
        suspicious_ips: getSuspiciousIPs(authLogs),
        brute_force_attempts: detectBruteForce(authLogs),
        by_tenant: aggregateByTenant(authLogs),
      },
      api_access: {
        total_requests: apiLogs?.length || 0,
        error_requests: apiLogs?.filter(log => log.status_code >= 400).length || 0,
        error_rate: calculateErrorRate(apiLogs),
        unauthorized_requests: apiLogs?.filter(log => log.status_code === 401 || log.status_code === 403).length || 0,
        rate_limited_requests: apiLogs?.filter(log => log.status_code === 429).length || 0,
        slow_requests: apiLogs?.filter(log => log.response_time > 5000).length || 0,
        by_endpoint: aggregateByEndpoint(apiLogs),
        by_status_code: aggregateByStatusCode(apiLogs),
      },
      threat_detection: {
        sql_injection_attempts: detectSQLInjection(apiLogs),
        xss_attempts: detectXSSAttempts(apiLogs),
        path_traversal_attempts: detectPathTraversal(apiLogs),
        abnormal_request_patterns: detectAbnormalPatterns(apiLogs),
        geographic_anomalies: detectGeographicAnomalies(authLogs),
      },
      security_score: calculateSecurityScore(authLogs, apiLogs),
    };

    // Add detailed information if requested
    if (includeDetails) {
      metrics.details = {
        recent_failed_logins: authLogs?.filter(log => !log.success).slice(0, 10) || [],
        recent_errors: apiLogs?.filter(log => log.status_code >= 400).slice(0, 10) || [],
        top_error_endpoints: getTopErrorEndpoints(apiLogs),
        suspicious_user_agents: getSuspiciousUserAgents(authLogs, apiLogs),
      };
    }

    return metrics;
  } catch (error) {
    console.error('Error fetching realtime security metrics:', error);
    return {
      error: 'Failed to fetch realtime security metrics',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function parseTimeframe(timeframe: string): number {
  const match = timeframe.match(/^(\d+)([mhd])$/);
  if (!match) return 60; // Default to 60 minutes

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'm':
      return value;
    case 'h':
      return value * 60;
    case 'd':
      return value * 24 * 60;
    default:
      return 60;
  }
}

function calculateSuccessRate(logs: any[] | null): number {
  if (!logs || logs.length === 0) return 100;
  
  const successCount = logs.filter(log => log.success).length;
  return Math.round((successCount / logs.length) * 100);
}

function calculateErrorRate(logs: any[] | null): number {
  if (!logs || logs.length === 0) return 0;
  
  const errorCount = logs.filter(log => log.status_code >= 400).length;
  return Math.round((errorCount / logs.length) * 100);
}

function getUniqueIPs(logs: any[] | null): number {
  if (!logs) return 0;
  
  const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean));
  return uniqueIPs.size;
}

function getSuspiciousIPs(logs: any[] | null): string[] {
  if (!logs) return [];
  
  // Count failed attempts per IP
  const ipFailureCounts: Record<string, number> = {};
  
  logs.filter(log => !log.success).forEach(log => {
    if (log.ip_address) {
      ipFailureCounts[log.ip_address] = (ipFailureCounts[log.ip_address] || 0) + 1;
    }
  });
  
  // Return IPs with more than 5 failures
  return Object.entries(ipFailureCounts)
    .filter(([_, count]) => count > 5)
    .map(([ip, _]) => ip);
}

function detectBruteForce(logs: any[] | null): Record<string, number> {
  if (!logs) return {};
  
  const ipAttempts: Record<string, { count: number; timeWindow: number }> = {};
  
  logs.filter(log => !log.success).forEach(log => {
    if (log.ip_address) {
      const logTime = new Date(log.created_at).getTime();
      
      if (!ipAttempts[log.ip_address]) {
        ipAttempts[log.ip_address] = { count: 1, timeWindow: logTime };
      } else {
        // Check if within 5-minute window
        if (logTime - ipAttempts[log.ip_address].timeWindow < 5 * 60 * 1000) {
          ipAttempts[log.ip_address].count++;
        } else {
          // Reset window
          ipAttempts[log.ip_address] = { count: 1, timeWindow: logTime };
        }
      }
    }
  });
  
  // Return IPs with potential brute force (>10 attempts in 5 minutes)
  const bruteForceAttempts: Record<string, number> = {};
  Object.entries(ipAttempts).forEach(([ip, data]) => {
    if (data.count > 10) {
      bruteForceAttempts[ip] = data.count;
    }
  });
  
  return bruteForceAttempts;
}

function aggregateByTenant(logs: any[] | null): Record<string, number> {
  if (!logs) return {};
  
  return logs.reduce((acc, log) => {
    const tenant = log.tenant_id || 'unknown';
    acc[tenant] = (acc[tenant] || 0) + 1;
    return acc;
  }, {});
}

function aggregateByEndpoint(logs: any[] | null): Record<string, number> {
  if (!logs) return {};
  
  return logs.reduce((acc, log) => {
    const endpoint = log.endpoint || 'unknown';
    acc[endpoint] = (acc[endpoint] || 0) + 1;
    return acc;
  }, {});
}

function aggregateByStatusCode(logs: any[] | null): Record<string, number> {
  if (!logs) return {};
  
  return logs.reduce((acc, log) => {
    const statusCode = log.status_code?.toString() || 'unknown';
    acc[statusCode] = (acc[statusCode] || 0) + 1;
    return acc;
  }, {});
}

function detectSQLInjection(logs: any[] | null): number {
  if (!logs) return 0;
  
  const sqlPatterns = [
    /(\s|^)(union|select|insert|update|delete|drop|exec|execute)(\s|$)/i,
    /(\s|^)(or|and)\s+1\s*=\s*1(\s|$)/i,
    /(\s|^)(or|and)\s+\w+\s*=\s*\w+(\s|$)/i,
    /('|\s|^)(;|--|\|\|)(\s|$)/i,
  ];
  
  return logs.filter(log => {
    const endpoint = (log.endpoint || '').toLowerCase();
    return sqlPatterns.some(pattern => pattern.test(endpoint));
  }).length;
}

function detectXSSAttempts(logs: any[] | null): number {
  if (!logs) return 0;
  
  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /on(load|click|error|mouseover)\s*=/i,
    /<iframe[\s\S]*?>/i,
  ];
  
  return logs.filter(log => {
    const endpoint = (log.endpoint || '').toLowerCase();
    return xssPatterns.some(pattern => pattern.test(endpoint));
  }).length;
}

function detectPathTraversal(logs: any[] | null): number {
  if (!logs) return 0;
  
  const traversalPatterns = [
    /\.\.\/|\.\.\\/i,
    /%2e%2e%2f|%2e%2e%5c/i,
    /\/etc\/passwd|\/windows\/system32/i,
  ];
  
  return logs.filter(log => {
    const endpoint = (log.endpoint || '').toLowerCase();
    return traversalPatterns.some(pattern => pattern.test(endpoint));
  }).length;
}

function detectAbnormalPatterns(logs: any[] | null): number {
  if (!logs) return 0;
  
  // Detect requests with unusually long URLs or parameters
  return logs.filter(log => {
    const endpoint = log.endpoint || '';
    return endpoint.length > 1000 || (endpoint.match(/[&?]/g) || []).length > 50;
  }).length;
}

function detectGeographicAnomalies(logs: any[] | null): number {
  if (!logs) return 0;
  
  // This would typically involve GeoIP lookups
  // For now, return 0 as placeholder
  return 0;
}

function calculateSecurityScore(authLogs: any[] | null, apiLogs: any[] | null): number {
  let score = 100; // Start with perfect score
  
  // Deduct points for security issues
  if (authLogs) {
    const failureRate = (authLogs.filter(log => !log.success).length / authLogs.length) * 100;
    score -= failureRate * 0.5; // Deduct up to 50 points for auth failures
  }
  
  if (apiLogs) {
    const errorRate = (apiLogs.filter(log => log.status_code >= 400).length / apiLogs.length) * 100;
    score -= errorRate * 0.3; // Deduct up to 30 points for API errors
    
    // Deduct for specific threats
    score -= detectSQLInjection(apiLogs) * 2;
    score -= detectXSSAttempts(apiLogs) * 2;
    score -= detectPathTraversal(apiLogs) * 3;
  }
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getTopErrorEndpoints(logs: any[] | null, limit: number = 5): Array<{endpoint: string, count: number}> {
  if (!logs) return [];
  
  const errorEndpoints = logs.filter(log => log.status_code >= 400);
  const counts = aggregateByEndpoint(errorEndpoints);
  
  return Object.entries(counts)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, limit)
    .map(([endpoint, count]) => ({ endpoint, count: count as number }));
}

function getSuspiciousUserAgents(authLogs: any[] | null, apiLogs: any[] | null): string[] {
  const allLogs = [...(authLogs || []), ...(apiLogs || [])];
  
  const suspiciousPatterns = [
    /bot|crawler|spider/i,
    /curl|wget|python/i,
    /scan|test|hack/i,
    /^$/,
  ];
  
  const suspiciousAgents = new Set<string>();
  
  allLogs.forEach(log => {
    const userAgent = log.user_agent || '';
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      suspiciousAgents.add(userAgent);
    }
  });
  
  return Array.from(suspiciousAgents).slice(0, 10);
}

function determineSecurityLevel(securityData: any): string {
  if (securityData.error) return 'unknown';
  
  const score = securityData.security_score;
  
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'fair';
  if (score >= 60) return 'poor';
  return 'critical';
}

function convertToPrometheusFormat(data: any): string {
  let prometheus = '';
  
  if (data.realtime_data && !data.realtime_data.error) {
    const metrics = data.realtime_data;
    
    // Authentication metrics
    prometheus += `# HELP church_auth_attempts_total Total authentication attempts\n`;
    prometheus += `# TYPE church_auth_attempts_total counter\n`;
    prometheus += `church_auth_attempts_total{timeframe="${data.metadata.timeframe}"} ${metrics.authentication.total_attempts}\n`;
    
    prometheus += `# HELP church_auth_failures_total Total authentication failures\n`;
    prometheus += `# TYPE church_auth_failures_total counter\n`;
    prometheus += `church_auth_failures_total{timeframe="${data.metadata.timeframe}"} ${metrics.authentication.failed_attempts}\n`;
    
    // API metrics
    prometheus += `# HELP church_api_requests_total Total API requests\n`;
    prometheus += `# TYPE church_api_requests_total counter\n`;
    prometheus += `church_api_requests_total{timeframe="${data.metadata.timeframe}"} ${metrics.api_access.total_requests}\n`;
    
    prometheus += `# HELP church_api_errors_total Total API errors\n`;
    prometheus += `# TYPE church_api_errors_total counter\n`;
    prometheus += `church_api_errors_total{timeframe="${data.metadata.timeframe}"} ${metrics.api_access.error_requests}\n`;
    
    // Threat detection metrics
    prometheus += `# HELP church_sql_injection_attempts_total Total SQL injection attempts\n`;
    prometheus += `# TYPE church_sql_injection_attempts_total counter\n`;
    prometheus += `church_sql_injection_attempts_total{timeframe="${data.metadata.timeframe}"} ${metrics.threat_detection.sql_injection_attempts}\n`;
    
    prometheus += `# HELP church_xss_attempts_total Total XSS attempts\n`;
    prometheus += `# TYPE church_xss_attempts_total counter\n`;
    prometheus += `church_xss_attempts_total{timeframe="${data.metadata.timeframe}"} ${metrics.threat_detection.xss_attempts}\n`;
    
    // Security score
    prometheus += `# HELP church_security_score Current security score (0-100)\n`;
    prometheus += `# TYPE church_security_score gauge\n`;
    prometheus += `church_security_score{timeframe="${data.metadata.timeframe}"} ${metrics.security_score}\n`;
  }
  
  return prometheus;
}