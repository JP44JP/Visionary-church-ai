// Testing Library setup
import '@testing-library/jest-dom'

// Global test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
process.env.OPENAI_API_KEY = 'test-openai-key'
process.env.SENDGRID_API_KEY = 'test-sendgrid-key'
process.env.TWILIO_ACCOUNT_SID = 'test-twilio-sid'
process.env.TWILIO_AUTH_TOKEN = 'test-twilio-token'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5433/visionarychurch_test'
process.env.REDIS_URL = 'redis://localhost:6380'

// Mock global fetch
import { TextEncoder, TextDecoder } from 'util'
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock Crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => '00000000-0000-4000-8000-000000000000',
    getRandomValues: (arr) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256)
      }
      return arr
    },
    subtle: {
      digest: jest.fn().mockResolvedValue(new ArrayBuffer(32))
    }
  }
})

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  // Suppress console.log, console.warn unless explicitly testing them
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }
}

// Mock timers for consistent testing
jest.useFakeTimers({
  legacyFakeTimers: false
})

// Increase timeout for integration tests
jest.setTimeout(30000)

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks()
  jest.clearAllTimers()
})

// Global test utilities
global.testUtils = {
  // Generate test data
  generateTestUser: (overrides = {}) => ({
    id: crypto.randomUUID(),
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'staff',
    tenantId: crypto.randomUUID(),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  generateTestTenant: (overrides = {}) => ({
    id: crypto.randomUUID(),
    name: 'Test Church',
    subdomain: 'testchurch',
    schemaName: 'tenant_test',
    planType: 'pro',
    status: 'active',
    features: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  }),
  
  generateTestConversation: (overrides = {}) => ({
    id: crypto.randomUUID(),
    sessionId: `chat_${Date.now()}_test`,
    conversationType: 'support',
    status: 'active',
    visitorName: 'Test Visitor',
    visitorEmail: 'visitor@example.com',
    isActive: true,
    startedAt: new Date(),
    lastActivityAt: new Date(),
    tags: [],
    metadata: {},
    ...overrides
  }),
  
  // Wait utility for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock API response
  mockApiResponse: (data, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  }),
  
  // Error matchers
  expectError: (error, message, code) => {
    expect(error).toBeInstanceOf(Error)
    if (message) expect(error.message).toContain(message)
    if (code) expect(error.code).toBe(code)
  }
}

// Database transaction rollback for tests
global.dbTransaction = {
  begin: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn()
}