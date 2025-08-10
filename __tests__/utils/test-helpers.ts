// Test utilities and helpers for VisionaryChurch-ai
import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { faker } from '@faker-js/faker'
import jwt from 'jsonwebtoken'

// Test providers wrapper
interface AllTheProvidersProps {
  children: React.ReactNode
}

export const createQueryClient = () => 
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  })

export const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createQueryClient()
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }
export * from '@testing-library/react'

// Authentication helpers
export const createMockJWT = (payload: any = {}, secret = 'test-secret') => {
  const defaultPayload = {
    userId: faker.string.uuid(),
    tenantId: faker.string.uuid(),
    email: faker.internet.email(),
    role: 'staff',
    permissions: [],
    type: 'access',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  }
  
  return jwt.sign({ ...defaultPayload, ...payload }, secret)
}

export const createMockUser = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: 'staff',
  permissions: [],
  tenantId: faker.string.uuid(),
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const createMockTenant = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  name: faker.company.name() + ' Church',
  subdomain: faker.internet.domainWord(),
  schemaName: `tenant_${faker.string.alphanumeric(8)}`,
  planType: 'pro',
  status: 'active',
  features: {
    aiChat: true,
    visitPlanning: true,
    eventManagement: true,
    prayerRequests: true,
    followUpSequences: true,
    analytics: true
  },
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Database helpers
export const createTestTransaction = () => ({
  begin: jest.fn().mockResolvedValue(undefined),
  commit: jest.fn().mockResolvedValue(undefined),
  rollback: jest.fn().mockResolvedValue(undefined),
})

export const mockPrismaClient = {
  tenant: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  tenantUser: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
}

export const mockRedisClient = {
  get: jest.fn(),
  set: jest.fn(),
  setex: jest.fn(),
  del: jest.fn(),
  incr: jest.fn(),
  expire: jest.fn(),
  exists: jest.fn(),
  flushall: jest.fn(),
}

// API testing helpers
export const createMockRequest = (overrides: any = {}) => ({
  method: 'GET',
  url: '/api/test',
  headers: {
    'content-type': 'application/json',
  },
  body: {},
  query: {},
  cookies: {},
  ...overrides
})

export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    getHeader: jest.fn(),
    locals: {},
    statusCode: 200,
  }
  return res
}

// Async testing helpers
export const waitFor = async (condition: () => boolean | Promise<boolean>, timeout = 5000) => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

export const waitForElement = async (selector: string, timeout = 5000) => {
  return waitFor(() => document.querySelector(selector) !== null, timeout)
}

// Mock data generators
export const generateMockConversation = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  sessionId: `chat_${Date.now()}_${faker.string.alphanumeric(8)}`,
  memberId: faker.string.uuid(),
  visitorName: faker.person.fullName(),
  visitorEmail: faker.internet.email(),
  conversationType: 'support',
  status: 'active',
  assignedTo: null,
  tags: [],
  isActive: true,
  lastActivityAt: new Date(),
  startedAt: new Date(),
  endedAt: null,
  rating: null,
  feedback: null,
  metadata: {},
  messages: [],
  ...overrides
})

export const generateMockMessage = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  conversationId: faker.string.uuid(),
  senderType: 'user',
  senderId: faker.string.uuid(),
  senderName: faker.person.fullName(),
  messageText: faker.lorem.sentence(),
  messageType: 'text',
  messageData: {},
  isRead: false,
  readAt: null,
  createdAt: new Date(),
  metadata: {},
  ...overrides
})

export const generateMockEvent = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  tenantId: faker.string.uuid(),
  createdBy: faker.string.uuid(),
  title: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  eventType: 'service',
  startDate: faker.date.future(),
  endDate: faker.date.future(),
  location: faker.location.streetAddress(),
  isRecurring: false,
  recurringPattern: null,
  maxAttendees: 100,
  registrationRequired: true,
  registrationDeadline: faker.date.future(),
  price: 0,
  currency: 'USD',
  status: 'published',
  settings: {},
  metadata: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

export const generateMockPrayerRequest = (overrides: any = {}) => ({
  id: faker.string.uuid(),
  tenantId: faker.string.uuid(),
  submittedBy: faker.string.uuid(),
  submitterName: faker.person.fullName(),
  submitterEmail: faker.internet.email(),
  category: 'personal',
  priority: 'medium',
  title: faker.lorem.words(5),
  description: faker.lorem.paragraph(),
  isAnonymous: false,
  status: 'pending',
  assignedTo: null,
  teamIds: [],
  tags: [],
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
  ...overrides
})

// Error testing helpers
export const expectError = (error: any, message?: string, code?: string) => {
  expect(error).toBeInstanceOf(Error)
  if (message) {
    expect(error.message).toContain(message)
  }
  if (code) {
    expect(error.code).toBe(code)
  }
}

export const expectValidationError = (error: any, field?: string) => {
  expect(error).toBeInstanceOf(Error)
  expect(error.message).toContain('validation')
  if (field) {
    expect(error.message).toContain(field)
  }
}

export const expectAuthenticationError = (error: any) => {
  expect(error).toBeInstanceOf(Error)
  expect(error.message).toMatch(/auth|permission|unauthorized/i)
}

// Performance testing helpers
export const measureExecutionTime = async (fn: () => Promise<any>) => {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  return {
    result,
    executionTime: end - start
  }
}

export const expectPerformance = (executionTime: number, maxTime: number) => {
  expect(executionTime).toBeLessThan(maxTime)
}

// Component testing helpers
export const fireUserEvent = async (element: Element, event: string, options?: any) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent[event as keyof typeof fireEvent](element, options)
}

export const getByTestId = (container: Element, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`)
}

export const getAllByTestId = (container: Element, testId: string) => {
  return Array.from(container.querySelectorAll(`[data-testid="${testId}"]`))
}

// Mock timers helpers
export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms)
}

export const runAllTimers = () => {
  jest.runAllTimers()
}

export const clearAllTimers = () => {
  jest.clearAllTimers()
}

// Environment helpers
export const setupTestEnvironment = () => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Reset module registry
  jest.resetModules()
  
  // Setup fake timers
  jest.useFakeTimers()
  
  // Mock console to reduce noise in tests
  jest.spyOn(console, 'log').mockImplementation()
  jest.spyOn(console, 'warn').mockImplementation()
  jest.spyOn(console, 'error').mockImplementation()
}

export const teardownTestEnvironment = () => {
  // Clear all mocks
  jest.clearAllMocks()
  
  // Restore timers
  jest.useRealTimers()
  
  // Restore console
  jest.restoreAllMocks()
}

// Snapshot testing helpers
export const expectSnapshot = (component: any) => {
  expect(component).toMatchSnapshot()
}

export const expectInlineSnapshot = (component: any, snapshot: string) => {
  expect(component).toMatchInlineSnapshot(snapshot)
}

export default {
  render,
  createMockJWT,
  createMockUser,
  createMockTenant,
  createTestTransaction,
  mockPrismaClient,
  mockRedisClient,
  createMockRequest,
  createMockResponse,
  waitFor,
  waitForElement,
  generateMockConversation,
  generateMockMessage,
  generateMockEvent,
  generateMockPrayerRequest,
  expectError,
  expectValidationError,
  expectAuthenticationError,
  measureExecutionTime,
  expectPerformance,
  setupTestEnvironment,
  teardownTestEnvironment
}