// =============================================================================
// SYNTHETIC MONITORING & USER EXPERIENCE TRACKING
// VisionaryChurch-AI SaaS Platform
// =============================================================================

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import { trackPageLoadDuration, trackSearchQueryDuration, updateHealthCheck } from './app-metrics';

// =============================================================================
// SYNTHETIC MONITORING CONFIGURATION
// =============================================================================

interface SyntheticTest {
  name: string;
  url: string;
  actions: SyntheticAction[];
  frequency: number; // seconds
  timeout: number; // milliseconds
  critical: boolean;
  locations: string[]; // geographic locations
  tenant?: string; // for tenant-specific tests
}

interface SyntheticAction {
  type: 'navigate' | 'click' | 'fill' | 'wait' | 'assert' | 'custom';
  selector?: string;
  value?: string;
  text?: string;
  timeout?: number;
  assertion?: string;
  customFunction?: (page: Page) => Promise<any>;
}

interface TestResult {
  test_name: string;
  status: 'success' | 'failure' | 'timeout';
  duration: number;
  timestamp: string;
  location: string;
  tenant?: string;
  metrics: {
    page_load_time: number;
    first_contentful_paint: number;
    largest_contentful_paint: number;
    cumulative_layout_shift: number;
    time_to_interactive: number;
    dom_content_loaded: number;
    network_requests: number;
    failed_requests: number;
    total_bytes: number;
  };
  errors: string[];
  screenshots?: string[];
}

// =============================================================================
// SYNTHETIC TEST DEFINITIONS
// =============================================================================

const syntheticTests: SyntheticTest[] = [
  // Critical User Journeys
  {
    name: 'homepage_load',
    url: 'https://visionarychurch.ai',
    frequency: 60,
    timeout: 10000,
    critical: true,
    locations: ['us-east-1', 'us-west-2', 'eu-west-1'],
    actions: [
      { type: 'navigate', selector: '', value: '' },
      { type: 'wait', selector: '[data-testid="hero-section"]', timeout: 5000 },
      { type: 'assert', assertion: 'page.title().includes("VisionaryChurch")' },
      { type: 'custom', customFunction: measureCoreWebVitals },
    ],
  },
  
  // Chat Widget Functionality
  {
    name: 'chat_widget_interaction',
    url: 'https://demo.visionarychurch.ai',
    frequency: 300,
    timeout: 30000,
    critical: true,
    locations: ['us-east-1', 'us-west-2'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="chat-widget"]', timeout: 5000 },
      { type: 'click', selector: '[data-testid="chat-widget-toggle"]' },
      { type: 'wait', selector: '[data-testid="chat-input"]', timeout: 3000 },
      { type: 'fill', selector: '[data-testid="chat-input"]', value: 'Hello, I need prayer' },
      { type: 'click', selector: '[data-testid="chat-send-button"]' },
      { type: 'wait', selector: '[data-testid="chat-response"]', timeout: 15000 },
      { type: 'assert', assertion: 'await page.locator("[data-testid=\"chat-response\"]").count() > 0' },
    ],
  },
  
  // Prayer Request Submission
  {
    name: 'prayer_request_submission',
    url: 'https://demo.visionarychurch.ai/prayer-request',
    frequency: 600,
    timeout: 15000,
    critical: false,
    locations: ['us-east-1'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="prayer-form"]', timeout: 5000 },
      { type: 'fill', selector: '[name="name"]', value: 'Test User' },
      { type: 'fill', selector: '[name="email"]', value: 'test@example.com' },
      { type: 'fill', selector: '[name="request"]', value: 'Please pray for healing' },
      { type: 'click', selector: '[data-testid="submit-prayer"]' },
      { type: 'wait', selector: '[data-testid="success-message"]', timeout: 8000 },
      { type: 'assert', assertion: 'await page.locator("[data-testid=\"success-message\"]").isVisible()' },
    ],
  },
  
  // Visit Planning Flow
  {
    name: 'visit_planning_flow',
    url: 'https://demo.visionarychurch.ai/visit',
    frequency: 900,
    timeout: 20000,
    critical: false,
    locations: ['us-east-1'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="visit-form"]', timeout: 5000 },
      { type: 'fill', selector: '[name="visitor_name"]', value: 'John Smith' },
      { type: 'fill', selector: '[name="visitor_email"]', value: 'john@example.com' },
      { type: 'fill', selector: '[name="visitor_phone"]', value: '555-0123' },
      { type: 'click', selector: '[data-testid="preferred-time"]' },
      { type: 'click', selector: '[data-testid="time-slot-morning"]' },
      { type: 'fill', selector: '[name="special_requests"]', value: 'First time visitor' },
      { type: 'click', selector: '[data-testid="schedule-visit"]' },
      { type: 'wait', selector: '[data-testid="confirmation-screen"]', timeout: 8000 },
    ],
  },
  
  // Event Registration
  {
    name: 'event_registration',
    url: 'https://demo.visionarychurch.ai/events',
    frequency: 1800,
    timeout: 25000,
    critical: false,
    locations: ['us-east-1', 'us-west-2'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="events-list"]', timeout: 5000 },
      { type: 'click', selector: '[data-testid="event-card"]:first-child' },
      { type: 'wait', selector: '[data-testid="registration-form"]', timeout: 3000 },
      { type: 'fill', selector: '[name="attendee_name"]', value: 'Test Attendee' },
      { type: 'fill', selector: '[name="attendee_email"]', value: 'attendee@example.com' },
      { type: 'click', selector: '[data-testid="register-button"]' },
      { type: 'wait', selector: '[data-testid="registration-success"]', timeout: 10000 },
    ],
  },
  
  // Admin Dashboard Access
  {
    name: 'admin_dashboard_access',
    url: 'https://demo.visionarychurch.ai/admin',
    frequency: 1200,
    timeout: 15000,
    critical: false,
    locations: ['us-east-1'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="login-form"]', timeout: 5000 },
      { type: 'fill', selector: '[name="email"]', value: 'admin@demochurch.com' },
      { type: 'fill', selector: '[name="password"]', value: 'demo_password_123' },
      { type: 'click', selector: '[data-testid="login-button"]' },
      { type: 'wait', selector: '[data-testid="dashboard-metrics"]', timeout: 10000 },
      { type: 'assert', assertion: 'await page.locator("[data-testid=\"metrics-cards\"]").count() >= 4' },
    ],
  },
  
  // API Health Checks
  {
    name: 'api_health_check',
    url: 'https://api.visionarychurch.ai/health',
    frequency: 30,
    timeout: 5000,
    critical: true,
    locations: ['us-east-1', 'us-west-2', 'eu-west-1'],
    actions: [
      { type: 'navigate' },
      { type: 'assert', assertion: 'page.url().includes("/health")' },
      { type: 'custom', customFunction: checkAPIHealth },
    ],
  },
  
  // OpenAI Integration Test
  {
    name: 'openai_integration_test',
    url: 'https://demo.visionarychurch.ai/chat-test',
    frequency: 900,
    timeout: 45000,
    critical: false,
    locations: ['us-east-1'],
    tenant: 'demo-church',
    actions: [
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="ai-test-chat"]', timeout: 5000 },
      { type: 'fill', selector: '[data-testid="test-input"]', value: 'How can I join your church?' },
      { type: 'click', selector: '[data-testid="test-send"]' },
      { type: 'wait', selector: '[data-testid="ai-response"]', timeout: 30000 },
      { type: 'assert', assertion: 'await page.locator("[data-testid=\"ai-response\"]").textContent().length > 10' },
    ],
  },
  
  // Mobile Performance Test
  {
    name: 'mobile_homepage_performance',
    url: 'https://visionarychurch.ai',
    frequency: 300,
    timeout: 15000,
    critical: false,
    locations: ['us-east-1', 'us-west-2'],
    actions: [
      { type: 'custom', customFunction: setMobileViewport },
      { type: 'navigate' },
      { type: 'wait', selector: '[data-testid="mobile-nav"]', timeout: 5000 },
      { type: 'custom', customFunction: measureMobilePerformance },
    ],
  },
];

// =============================================================================
// SYNTHETIC MONITORING ENGINE
// =============================================================================

class SyntheticMonitor {
  private browser?: Browser;
  private contexts: Map<string, BrowserContext> = new Map();
  private runningTests: Set<string> = new Set();

  async initialize(): Promise<void> {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
      ],
    });

    console.log('Synthetic monitoring browser initialized');
  }

  async createContext(location: string, tenant?: string): Promise<BrowserContext> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const contextKey = `${location}-${tenant || 'default'}`;
    
    if (!this.contexts.has(contextKey)) {
      const context = await this.browser.newContext({
        userAgent: 'VisionaryChurch-SyntheticMonitor/1.0',
        viewport: { width: 1920, height: 1080 },
        locale: 'en-US',
        timezoneId: 'America/New_York',
        extraHTTPHeaders: {
          'X-Synthetic-Test': 'true',
          'X-Test-Location': location,
          ...(tenant && { 'X-Tenant-ID': tenant }),
        },
      });

      // Enable request/response tracking
      context.on('request', request => {
        console.log(`Request: ${request.method()} ${request.url()}`);
      });

      context.on('response', response => {
        if (response.status() >= 400) {
          console.warn(`Failed response: ${response.status()} ${response.url()}`);
        }
      });

      this.contexts.set(contextKey, context);
    }

    return this.contexts.get(contextKey)!;
  }

  async runTest(test: SyntheticTest, location: string): Promise<TestResult> {
    const testKey = `${test.name}-${location}-${test.tenant || 'default'}`;
    
    if (this.runningTests.has(testKey)) {
      throw new Error(`Test ${testKey} is already running`);
    }

    this.runningTests.add(testKey);
    const startTime = Date.now();

    try {
      const context = await this.createContext(location, test.tenant);
      const page = await context.newPage();

      // Set up performance monitoring
      await page.addInitScript(() => {
        // @ts-ignore
        window.__syntheticTestMetrics = {
          navigationStart: performance.now(),
          requests: [],
          errors: []
        };
      });

      // Track network requests
      page.on('request', request => {
        // @ts-ignore
        page.evaluate(url => window.__syntheticTestMetrics.requests.push({
          url,
          startTime: performance.now(),
          method: request.method()
        }), request.url());
      });

      // Track errors
      page.on('pageerror', error => {
        console.error(`Page error in ${test.name}:`, error.message);
        // @ts-ignore
        page.evaluate(message => window.__syntheticTestMetrics.errors.push(message), error.message);
      });

      const result: TestResult = {
        test_name: test.name,
        status: 'success',
        duration: 0,
        timestamp: new Date().toISOString(),
        location,
        tenant: test.tenant,
        metrics: {
          page_load_time: 0,
          first_contentful_paint: 0,
          largest_contentful_paint: 0,
          cumulative_layout_shift: 0,
          time_to_interactive: 0,
          dom_content_loaded: 0,
          network_requests: 0,
          failed_requests: 0,
          total_bytes: 0,
        },
        errors: [],
        screenshots: [],
      };

      // Execute test actions
      for (const action of test.actions) {
        await this.executeAction(page, action, test);
      }

      // Collect performance metrics
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        // @ts-ignore
        const testMetrics = window.__syntheticTestMetrics;
        
        return {
          page_load_time: navigation.loadEventEnd - navigation.navigationStart,
          dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.navigationStart,
          network_requests: testMetrics.requests.length,
          errors: testMetrics.errors,
        };
      });

      // Get Core Web Vitals if available
      const webVitals = await this.getCoreWebVitals(page);
      
      result.metrics = { ...result.metrics, ...performanceMetrics, ...webVitals };
      result.errors = performanceMetrics.errors;
      result.duration = Date.now() - startTime;

      // Take screenshot for analysis
      if (result.status === 'failure' || result.errors.length > 0) {
        const screenshot = await page.screenshot({ type: 'png', fullPage: true });
        result.screenshots = [screenshot.toString('base64')];
      }

      await page.close();

      // Update health metrics
      updateHealthCheck(test.name, 'synthetic_test', result.status === 'success');

      // Track performance metrics
      if (test.tenant) {
        trackPageLoadDuration(test.tenant, result.metrics.page_load_time / 1000, test.name, 'desktop');
      }

      return result;

    } catch (error: any) {
      const result: TestResult = {
        test_name: test.name,
        status: 'failure',
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
        location,
        tenant: test.tenant,
        metrics: {
          page_load_time: 0,
          first_contentful_paint: 0,
          largest_contentful_paint: 0,
          cumulative_layout_shift: 0,
          time_to_interactive: 0,
          dom_content_loaded: 0,
          network_requests: 0,
          failed_requests: 0,
          total_bytes: 0,
        },
        errors: [error.message],
        screenshots: [],
      };

      updateHealthCheck(test.name, 'synthetic_test', false);
      return result;
    } finally {
      this.runningTests.delete(testKey);
    }
  }

  async executeAction(page: Page, action: SyntheticAction, test: SyntheticTest): Promise<void> {
    const timeout = action.timeout || test.timeout || 10000;

    switch (action.type) {
      case 'navigate':
        await page.goto(test.url, { timeout, waitUntil: 'networkidle' });
        break;

      case 'click':
        if (action.selector) {
          await page.click(action.selector, { timeout });
        }
        break;

      case 'fill':
        if (action.selector && action.value !== undefined) {
          await page.fill(action.selector, action.value, { timeout });
        }
        break;

      case 'wait':
        if (action.selector) {
          await page.waitForSelector(action.selector, { timeout });
        } else if (action.value) {
          await page.waitForTimeout(parseInt(action.value));
        }
        break;

      case 'assert':
        if (action.assertion) {
          const result = await page.evaluate(action.assertion);
          if (!result) {
            throw new Error(`Assertion failed: ${action.assertion}`);
          }
        }
        break;

      case 'custom':
        if (action.customFunction) {
          await action.customFunction(page);
        }
        break;
    }
  }

  async getCoreWebVitals(page: Page): Promise<Partial<TestResult['metrics']>> {
    try {
      return await page.evaluate(() => {
        return new Promise((resolve) => {
          let fcp = 0, lcp = 0, cls = 0;

          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (entry.name === 'first-contentful-paint') {
                fcp = entry.startTime;
              }
            }
          }).observe({ entryTypes: ['paint'] });

          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              lcp = entry.startTime;
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });

          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                cls += entry.value;
              }
            }
          }).observe({ entryTypes: ['layout-shift'] });

          setTimeout(() => {
            resolve({
              first_contentful_paint: fcp,
              largest_contentful_paint: lcp,
              cumulative_layout_shift: cls,
            });
          }, 5000);
        });
      });
    } catch (error) {
      console.warn('Failed to collect Core Web Vitals:', error);
      return {};
    }
  }

  async shutdown(): Promise<void> {
    for (const context of this.contexts.values()) {
      await context.close();
    }
    this.contexts.clear();

    if (this.browser) {
      await this.browser.close();
    }

    console.log('Synthetic monitoring browser shutdown');
  }
}

// =============================================================================
// CUSTOM ACTION FUNCTIONS
// =============================================================================

async function measureCoreWebVitals(page: Page): Promise<void> {
  // Measure Core Web Vitals and update metrics
  const vitals = await page.evaluate(() => {
    return {
      fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime || 0,
      ttfb: performance.getEntriesByType('navigation')[0]?.responseStart || 0,
    };
  });

  console.log('Core Web Vitals:', vitals);
}

async function checkAPIHealth(page: Page): Promise<void> {
  const response = await page.evaluate(() => {
    return document.body.textContent;
  });

  const healthData = JSON.parse(response || '{}');
  if (healthData.status !== 'healthy') {
    throw new Error(`API health check failed: ${healthData.message}`);
  }
}

async function setMobileViewport(page: Page): Promise<void> {
  await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12 Pro
}

async function measureMobilePerformance(page: Page): Promise<void> {
  // Mobile-specific performance measurements
  const mobileMetrics = await page.evaluate(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return {
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
    };
  });

  console.log('Mobile Performance Metrics:', mobileMetrics);
}

// =============================================================================
// SYNTHETIC MONITORING SCHEDULER
// =============================================================================

class SyntheticScheduler {
  private monitor: SyntheticMonitor;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.monitor = new SyntheticMonitor();
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    await this.monitor.initialize();
    this.isRunning = true;

    // Schedule all synthetic tests
    for (const test of syntheticTests) {
      for (const location of test.locations) {
        const intervalKey = `${test.name}-${location}`;
        
        const interval = setInterval(async () => {
          try {
            const result = await this.monitor.runTest(test, location);
            await this.publishResult(result);
            
            if (result.status === 'failure') {
              console.error(`Synthetic test failed: ${test.name} in ${location}`, result.errors);
              await this.handleTestFailure(test, result);
            }
          } catch (error) {
            console.error(`Error running synthetic test ${test.name}:`, error);
          }
        }, test.frequency * 1000);

        this.intervals.set(intervalKey, interval);
      }
    }

    console.log(`Started ${this.intervals.size} synthetic test schedules`);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    // Clear all intervals
    for (const interval of this.intervals.values()) {
      clearInterval(interval);
    }
    this.intervals.clear();

    await this.monitor.shutdown();
    this.isRunning = false;

    console.log('Synthetic monitoring scheduler stopped');
  }

  private async publishResult(result: TestResult): Promise<void> {
    // Send to monitoring backend
    try {
      const response = await fetch('https://monitoring.visionarychurch.ai/synthetic-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MONITORING_API_TOKEN}`,
        },
        body: JSON.stringify(result),
      });

      if (!response.ok) {
        console.warn('Failed to publish synthetic test result:', response.statusText);
      }
    } catch (error) {
      console.warn('Error publishing synthetic test result:', error);
    }

    // Log for local monitoring
    console.log(`Synthetic Test Result: ${result.test_name} - ${result.status} (${result.duration}ms)`);
  }

  private async handleTestFailure(test: SyntheticTest, result: TestResult): Promise<void> {
    if (test.critical) {
      // Send alert for critical test failures
      try {
        await fetch('https://alerts.visionarychurch.ai/critical-failure', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ALERTS_API_TOKEN}`,
          },
          body: JSON.stringify({
            test_name: test.name,
            location: result.location,
            tenant: result.tenant,
            errors: result.errors,
            duration: result.duration,
            timestamp: result.timestamp,
          }),
        });
      } catch (error) {
        console.error('Failed to send critical failure alert:', error);
      }
    }
  }
}

// =============================================================================
// EXPORT AND STARTUP
// =============================================================================

export { SyntheticMonitor, SyntheticScheduler, syntheticTests };

// Auto-start if this is the main module
if (require.main === module) {
  const scheduler = new SyntheticScheduler();
  
  scheduler.start().catch(error => {
    console.error('Failed to start synthetic monitoring:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down synthetic monitoring...');
    await scheduler.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('Shutting down synthetic monitoring...');
    await scheduler.stop();
    process.exit(0);
  });
}