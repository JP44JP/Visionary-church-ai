// Test fixtures for VisionaryChurch-ai
import { faker } from '@faker-js/faker'

// User fixtures
export const createTestUser = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  role: 'staff',
  tenantId: faker.string.uuid(),
  passwordHash: '$2b$12$testhashedpassword',
  isActive: true,
  emailVerified: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginAt: new Date(),
  permissions: [],
  ...overrides
})

// Tenant fixtures
export const createTestTenant = (overrides: Partial<any> = {}) => ({
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

// Conversation fixtures
export const createTestConversation = (overrides: Partial<any> = {}) => ({
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
  ...overrides
})

// Message fixtures
export const createTestMessage = (overrides: Partial<any> = {}) => ({
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

// Prayer request fixtures
export const createTestPrayerRequest = (overrides: Partial<any> = {}) => ({
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

// Event fixtures
export const createTestEvent = (overrides: Partial<any> = {}) => ({
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

// Event registration fixtures
export const createTestEventRegistration = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  eventId: faker.string.uuid(),
  attendeeId: faker.string.uuid(),
  attendeeName: faker.person.fullName(),
  attendeeEmail: faker.internet.email(),
  attendeePhone: faker.phone.number(),
  ticketType: 'general',
  quantity: 1,
  totalAmount: 0,
  paymentStatus: 'completed',
  paymentId: null,
  status: 'confirmed',
  checkedInAt: null,
  specialRequests: '',
  registrationData: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
})

// Visit fixtures
export const createTestVisit = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  tenantId: faker.string.uuid(),
  conversationId: faker.string.uuid(),
  requestedBy: faker.string.uuid(),
  visitorName: faker.person.fullName(),
  visitorEmail: faker.internet.email(),
  visitorPhone: faker.phone.number(),
  visitType: 'pastoral',
  priority: 'medium',
  preferredDate: faker.date.future(),
  preferredTime: '10:00',
  alternativeDate: faker.date.future(),
  alternativeTime: '14:00',
  location: faker.location.streetAddress(),
  reason: faker.lorem.paragraph(),
  status: 'pending',
  assignedTo: null,
  scheduledDate: null,
  scheduledTime: null,
  completedAt: null,
  notes: '',
  followUpRequired: false,
  confirmationToken: faker.string.alphanumeric(32),
  reminderSent: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
  ...overrides
})

// Follow-up sequence fixtures
export const createTestFollowUpSequence = (overrides: Partial<any> = {}) => ({
  id: faker.string.uuid(),
  tenantId: faker.string.uuid(),
  name: faker.lorem.words(3),
  description: faker.lorem.sentence(),
  triggerType: 'manual',
  triggerConditions: {},
  isActive: true,
  steps: [
    {
      id: faker.string.uuid(),
      type: 'email',
      delay: 1,
      delayUnit: 'day',
      template: 'welcome_email',
      conditions: {}
    }
  ],
  tags: [],
  createdBy: faker.string.uuid(),
  createdAt: new Date(),
  updatedAt: new Date(),
  metadata: {},
  ...overrides
})

// Test data collections
export const testFixtures = {
  users: Array.from({ length: 5 }, () => createTestUser()),
  tenants: Array.from({ length: 3 }, () => createTestTenant()),
  conversations: Array.from({ length: 10 }, () => createTestConversation()),
  messages: Array.from({ length: 25 }, () => createTestMessage()),
  prayerRequests: Array.from({ length: 8 }, () => createTestPrayerRequest()),
  events: Array.from({ length: 6 }, () => createTestEvent()),
  eventRegistrations: Array.from({ length: 15 }, () => createTestEventRegistration()),
  visits: Array.from({ length: 12 }, () => createTestVisit()),
  followUpSequences: Array.from({ length: 4 }, () => createTestFollowUpSequence()),
}

// Clean data generators for specific test scenarios
export const cleanTestData = {
  adminUser: () => createTestUser({ role: 'admin', permissions: ['*'] }),
  pastorUser: () => createTestUser({ role: 'pastor' }),
  staffUser: () => createTestUser({ role: 'staff' }),
  volunteerUser: () => createTestUser({ role: 'volunteer' }),
  
  activeTenant: () => createTestTenant({ status: 'active' }),
  suspendedTenant: () => createTestTenant({ status: 'suspended' }),
  
  activeConversation: () => createTestConversation({ status: 'active' }),
  resolvedConversation: () => createTestConversation({ status: 'resolved' }),
  
  urgentPrayerRequest: () => createTestPrayerRequest({ priority: 'urgent', category: 'emergency' }),
  anonymousPrayerRequest: () => createTestPrayerRequest({ isAnonymous: true }),
  
  recurringEvent: () => createTestEvent({ 
    isRecurring: true, 
    recurringPattern: { frequency: 'weekly', interval: 1 }
  }),
  paidEvent: () => createTestEvent({ price: 2500, registrationRequired: true }),
  
  completedVisit: () => createTestVisit({ status: 'completed', completedAt: new Date() }),
  scheduledVisit: () => createTestVisit({ status: 'scheduled', scheduledDate: faker.date.future() }),
}

export default testFixtures