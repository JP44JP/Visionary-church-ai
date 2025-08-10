// Global setup for Playwright E2E tests
import { chromium, FullConfig } from '@playwright/test'
import { execSync } from 'child_process'
import { createHash } from 'crypto'

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test environment setup...')

  // Start test database if not already running
  try {
    console.log('📊 Setting up test database...')
    execSync('npm run setup:test-db', { stdio: 'inherit' })
  } catch (error) {
    console.error('Failed to setup test database:', error)
    process.exit(1)
  }

  // Seed test data
  try {
    console.log('🌱 Seeding test data...')
    await seedTestData()
  } catch (error) {
    console.error('Failed to seed test data:', error)
    process.exit(1)
  }

  // Start application server if needed
  const baseURL = config.projects[0].use?.baseURL
  if (baseURL && !process.env.CI) {
    console.log(`🏗️  Starting development server at ${baseURL}...`)
    // In real scenario, you might want to start the dev server here
    // This is handled by the webServer config in playwright.config.ts
  }

  // Create test admin user with known credentials
  try {
    console.log('👤 Creating test admin user...')
    await createTestUsers()
  } catch (error) {
    console.error('Failed to create test users:', error)
    process.exit(1)
  }

  // Warm up the browser for faster tests
  console.log('🌡️  Warming up browser...')
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  
  try {
    await page.goto(baseURL || 'http://localhost:3000', { waitUntil: 'networkidle' })
    console.log('✅ Application is responding')
  } catch (error) {
    console.error('Application is not responding:', error)
    process.exit(1)
  } finally {
    await browser.close()
  }

  console.log('✨ E2E test environment setup complete!')
}

async function seedTestData() {
  // This would connect to your test database and create test data
  // Using your actual database client
  
  const testData = {
    tenants: [
      {
        id: 'test-tenant-1',
        name: 'Test Church',
        subdomain: 'testchurch',
        schemaName: 'tenant_test1',
        planType: 'pro',
        status: 'active',
        features: {
          aiChat: true,
          visitPlanning: true,
          eventManagement: true,
          prayerRequests: true,
          followUpSequences: true,
          analytics: true
        }
      }
    ],
    users: [
      {
        id: 'test-admin-1',
        tenantId: 'test-tenant-1',
        email: 'admin@testchurch.ai',
        firstName: 'Test',
        lastName: 'Admin',
        role: 'admin',
        passwordHash: await hashPassword('TestPassword123!'),
        isActive: true,
        emailVerified: true
      },
      {
        id: 'test-staff-1',
        tenantId: 'test-tenant-1',
        email: 'staff@testchurch.ai',
        firstName: 'Test',
        lastName: 'Staff',
        role: 'staff',
        passwordHash: await hashPassword('TestPassword123!'),
        isActive: true,
        emailVerified: true
      }
    ],
    events: [
      {
        id: 'test-event-1',
        tenantId: 'test-tenant-1',
        title: 'Sunday Service',
        description: 'Weekly Sunday worship service',
        eventType: 'service',
        startDate: new Date('2024-08-25T10:00:00Z'),
        endDate: new Date('2024-08-25T12:00:00Z'),
        location: 'Main Sanctuary',
        maxAttendees: 200,
        registrationRequired: true,
        price: 0,
        status: 'published'
      }
    ],
    prayerRequests: [
      {
        id: 'test-prayer-1',
        tenantId: 'test-tenant-1',
        title: 'Healing Prayer',
        description: 'Please pray for my recovery',
        category: 'health',
        priority: 'medium',
        status: 'pending',
        submitterName: 'John Doe',
        submitterEmail: 'john@example.com'
      }
    ]
  }

  // In a real implementation, you would insert this data into your test database
  console.log('Test data prepared:', Object.keys(testData))
}

async function createTestUsers() {
  // Create test users that can be used across all E2E tests
  const testUsers = [
    {
      email: 'admin@testchurch.ai',
      password: 'TestPassword123!',
      role: 'admin'
    },
    {
      email: 'staff@testchurch.ai',
      password: 'TestPassword123!',
      role: 'staff'
    },
    {
      email: 'visitor@example.com',
      password: 'TestPassword123!',
      role: 'visitor'
    }
  ]

  // Store test user credentials for use in tests
  process.env.TEST_ADMIN_EMAIL = testUsers[0].email
  process.env.TEST_ADMIN_PASSWORD = testUsers[0].password
  process.env.TEST_STAFF_EMAIL = testUsers[1].email
  process.env.TEST_STAFF_PASSWORD = testUsers[1].password
  process.env.TEST_VISITOR_EMAIL = testUsers[2].email
  process.env.TEST_VISITOR_PASSWORD = testUsers[2].password

  console.log('Test user credentials configured')
}

async function hashPassword(password: string): Promise<string> {
  // Simple hash for testing - in real implementation use bcrypt
  return createHash('sha256').update(password).digest('hex')
}

export default globalSetup