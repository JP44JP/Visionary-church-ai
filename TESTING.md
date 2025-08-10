# VisionaryChurch-ai Testing Guide

This comprehensive guide covers all aspects of testing for the VisionaryChurch-ai SaaS platform, including unit testing, integration testing, E2E testing, performance testing, and security testing.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Test Coverage](#test-coverage)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy ensures platform reliability, security, and performance across all major systems:

- **Multi-tenant authentication system**
- **AI-powered chat widget with OpenAI integration**
- **Visit planning system with email confirmations**
- **Automated follow-up sequences (email/SMS)**
- **Prayer request management with team routing**
- **Event management with registrations and payments**
- **Analytics dashboard and reporting**
- **Church admin panel with role-based access**

### Testing Pyramid

```
    /\     E2E Tests (Playwright)
   /  \    - Complete user journeys
  /____\   - Cross-browser testing
 /      \  - Accessibility testing
/________\
Integration Tests (Jest + Supertest)
- API endpoint testing
- Database integration
- External service mocking
- Multi-tenant isolation

Unit Tests (Jest)
- Service layer logic
- Utility functions
- Business rules
- Error handling
```

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up test database:**
   ```bash
   npm run setup:test-db
   ```

3. **Run all tests:**
   ```bash
   npm test
   ```

### Environment Setup

The test suite automatically sets up isolated environments for each test type:

- **Unit/Integration Tests**: Use Docker containers for PostgreSQL and Redis
- **E2E Tests**: Use dedicated test database with seeded data
- **Performance Tests**: Use production-like data volumes
- **Security Tests**: Use vulnerability scanning and penetration testing tools

## Test Structure

```
__tests__/
├── components/          # Component tests
│   ├── chat/
│   ├── dashboard/
│   └── forms/
├── e2e/                # End-to-end tests
│   ├── visitor-journey.spec.ts
│   ├── admin-workflows.spec.ts
│   └── mobile-experience.spec.ts
├── fixtures/           # Test data and fixtures
│   └── index.ts
├── integration/        # Integration tests
│   ├── api/
│   └── database/
├── mocks/             # Mock implementations
│   ├── openai.mock.ts
│   ├── sendgrid.mock.ts
│   └── twilio.mock.ts
├── performance/       # Performance tests
│   └── load-testing.test.ts
├── security/          # Security tests
│   └── auth-security.test.ts
├── unit/              # Unit tests
│   ├── services/
│   └── utils/
└── utils/             # Test utilities
    └── test-helpers.ts
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
npm run test:component
npm run test:e2e
npm run test:performance
npm run test:security

# Watch mode for development
npm run test:watch

# Run tests for specific files
npm test -- --testPathPattern=authService
npm test -- --testNamePattern="should login successfully"
```

### Advanced Commands

```bash
# Run tests with debugging
npm run test:debug

# Run tests in CI mode
npm run test:ci

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run performance benchmarks
npm run test:performance -- --benchmark

# Run security scans
npm run test:security -- --full-scan
```

### Browser-Specific E2E Tests

```bash
# Run tests on specific browsers
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run mobile tests
npm run test:e2e -- --project="Mobile Chrome"
npm run test:e2e -- --project="Mobile Safari"
```

## Writing Tests

### Unit Tests

Unit tests focus on individual functions and methods in isolation:

```typescript
// __tests__/unit/services/authService.test.ts
import { AuthService } from '@/services/authService'
import { createMockUser } from '../../utils/test-helpers'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = AuthService.getInstance()
  })

  it('should successfully login with valid credentials', async () => {
    // Arrange
    const mockUser = createMockUser()
    const credentials = {
      email: 'test@example.com',
      password: 'ValidPassword123!'
    }

    // Act
    const result = await authService.login('tenant-id', credentials)

    // Assert
    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('tokens')
    expect(result.user.email).toBe(credentials.email)
  })

  it('should throw AuthenticationError for invalid credentials', async () => {
    // Arrange & Act & Assert
    await expect(authService.login('tenant-id', {
      email: 'test@example.com',
      password: 'wrongpassword'
    })).rejects.toThrow('Invalid credentials')
  })
})
```

### Integration Tests

Integration tests verify API endpoints and database interactions:

```typescript
// __tests__/integration/api/chat.test.ts
import request from 'supertest'
import { app } from '@/app'
import { createMockJWT } from '../../utils/test-helpers'

describe('Chat API', () => {
  it('should create a new conversation', async () => {
    const conversationData = {
      visitorName: 'John Doe',
      visitorEmail: 'john@example.com',
      conversationType: 'support',
      initialMessage: 'Hello, I need help'
    }

    const response = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${createMockJWT()}`)
      .send(conversationData)
      .expect(200)

    expect(response.body.success).toBe(true)
    expect(response.body.data).toHaveProperty('id')
  })
})
```

### Component Tests

Component tests verify React component behavior:

```typescript
// __tests__/components/chat/ChatWidget.test.tsx
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ChatWidget from '@/components/chat/ChatWidget'

describe('ChatWidget', () => {
  it('should send message when send button is clicked', async () => {
    render(<ChatWidget tenantId="test" churchName="Test Church" isOpen={true} />)

    const input = screen.getByPlaceholderText('Type your message...')
    const sendButton = screen.getByRole('button', { name: /send/i })

    await userEvent.type(input, 'Hello, I need help!')
    await userEvent.click(sendButton)

    await waitFor(() => {
      expect(screen.getByText('Hello, I need help!')).toBeInTheDocument()
    })
  })
})
```

### E2E Tests

E2E tests verify complete user journeys:

```typescript
// __tests__/e2e/visitor-journey.spec.ts
import { test, expect } from '@playwright/test'

test('complete visitor journey from chat to visit scheduling', async ({ page }) => {
  // Visit the church website
  await page.goto('/')
  
  // Open chat widget
  await page.click('[data-testid="chat-widget-toggle"]')
  
  // Provide visitor information
  await page.fill('[placeholder="Your name"]', 'John Doe')
  await page.fill('[placeholder="Your email"]', 'john@example.com')
  await page.click('button:text("Start Chat")')
  
  // Send initial message
  await page.fill('[placeholder="Type your message..."]', 'I would like to schedule a visit')
  await page.press('[placeholder="Type your message..."]', 'Enter')
  
  // Verify AI response and visit scheduling option
  await expect(page.locator('button:text("Schedule a Visit")')).toBeVisible()
})
```

### Performance Tests

Performance tests verify response times and resource usage:

```typescript
// __tests__/performance/load-testing.test.ts
import { measureExecutionTime, expectPerformance } from '../utils/test-helpers'

describe('Performance Tests', () => {
  it('should respond to chat API within acceptable time', async () => {
    const { executionTime } = await measureExecutionTime(async () => {
      // Simulate API call
      return await chatService.sendMessage(mockData)
    })
    
    expectPerformance(executionTime, 200) // Should complete within 200ms
  })
})
```

### Security Tests

Security tests verify authentication, authorization, and vulnerability protection:

```typescript
// __tests__/security/auth-security.test.ts
describe('Authentication Security', () => {
  it('should prevent SQL injection in login attempts', async () => {
    const maliciousInput = "admin'; DROP TABLE users; --"
    
    await expect(authService.login('tenant-id', {
      email: maliciousInput,
      password: 'password'
    })).rejects.toThrow(/invalid.*format/i)
  })
})
```

## Test Coverage

### Coverage Targets

- **Overall Coverage**: Minimum 80%
- **Unit Tests**: Minimum 90%
- **Integration Tests**: Minimum 85%
- **Component Tests**: Minimum 80%
- **Security Tests**: 100% for auth flows

### Viewing Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Check coverage thresholds
npm run coverage:check
```

### Coverage Configuration

Coverage thresholds are configured in `jest.config.js`:

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80
  },
  './src/services/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

## CI/CD Integration

### GitHub Actions Workflows

1. **Main Test Workflow** (`.github/workflows/test.yml`):
   - Runs on every push and PR
   - Executes all test types in parallel
   - Generates coverage reports
   - Creates test result summaries

2. **Coverage Analysis** (`.github/workflows/test-coverage.yml`):
   - Detailed coverage analysis
   - SonarQube integration
   - Mutation testing
   - Visual regression testing

### Quality Gates

Tests must pass these gates before deployment:

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ Coverage threshold met (80%)
- ✅ No high-severity security issues
- ✅ Performance benchmarks met

### Test Environment Management

- **Development**: Local Docker containers
- **CI/CD**: Ephemeral test environments
- **Staging**: Production-like test environment
- **Production**: Smoke tests and monitoring

## Best Practices

### Writing Effective Tests

1. **Follow the AAA Pattern**:
   ```typescript
   it('should do something', async () => {
     // Arrange
     const mockData = createMockData()
     
     // Act
     const result = await serviceUnderTest.method(mockData)
     
     // Assert
     expect(result).toEqual(expectedResult)
   })
   ```

2. **Use Descriptive Test Names**:
   ```typescript
   // Good
   it('should return 401 when user is not authenticated')
   
   // Bad
   it('should fail')
   ```

3. **Test One Thing at a Time**:
   ```typescript
   // Good - focused test
   it('should validate email format')
   it('should hash password securely')
   
   // Bad - testing multiple things
   it('should validate input and hash password')
   ```

4. **Use Test Data Builders**:
   ```typescript
   const user = createTestUser()
     .withRole('admin')
     .withPermissions(['users:write'])
     .build()
   ```

### Mock Management

1. **Mock External Services**:
   ```typescript
   import { mockOpenAI } from '../mocks/openai.mock'
   
   beforeEach(() => {
     mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse)
   })
   ```

2. **Reset Mocks Between Tests**:
   ```typescript
   afterEach(() => {
     jest.clearAllMocks()
   })
   ```

3. **Use Mock Factories**:
   ```typescript
   const createMockUser = (overrides = {}) => ({
     id: faker.string.uuid(),
     email: faker.internet.email(),
     ...overrides
   })
   ```

### Performance Testing Guidelines

1. **Set Realistic Expectations**:
   ```typescript
   expectPerformance(executionTime, 200) // API calls < 200ms
   expectPerformance(dbQueryTime, 100)   // DB queries < 100ms
   ```

2. **Test Under Load**:
   ```typescript
   const concurrentRequests = Array.from({ length: 100 }, () => 
     makeRequest()
   )
   await Promise.all(concurrentRequests)
   ```

### Security Testing Guidelines

1. **Test Authentication Flows**:
   ```typescript
   it('should prevent unauthorized access')
   it('should enforce rate limiting')
   it('should validate input sanitization')
   ```

2. **Test Authorization**:
   ```typescript
   it('should enforce role-based access control')
   it('should prevent privilege escalation')
   it('should ensure tenant isolation')
   ```

## Troubleshooting

### Common Issues

1. **Tests Timing Out**:
   ```typescript
   // Increase timeout for slow operations
   jest.setTimeout(30000)
   
   // Or per test
   it('slow test', async () => {
     // test code
   }, 30000)
   ```

2. **Database Connection Issues**:
   ```bash
   # Check if test database is running
   npm run setup:test-db
   
   # Restart containers
   docker-compose down
   docker-compose up -d
   ```

3. **Mock Issues**:
   ```typescript
   // Clear mocks between tests
   beforeEach(() => {
     jest.clearAllMocks()
   })
   
   // Reset modules
   beforeEach(() => {
     jest.resetModules()
   })
   ```

4. **E2E Test Failures**:
   ```bash
   # Run with debug mode
   npm run test:e2e:debug
   
   # Check screenshots
   ls test-results/
   
   # Run specific test
   npx playwright test visitor-journey.spec.ts --debug
   ```

### Debugging Tests

1. **Add Debug Output**:
   ```typescript
   console.log('Debug info:', { variable, state })
   ```

2. **Use Jest Debug Mode**:
   ```bash
   npm run test:debug
   ```

3. **Use Playwright Debug Tools**:
   ```bash
   npx playwright test --debug
   npx playwright codegen
   ```

### Performance Debugging

1. **Profile Test Execution**:
   ```bash
   npm test -- --verbose --profile
   ```

2. **Identify Slow Tests**:
   ```bash
   npm test -- --verbose --detectSlowTests
   ```

3. **Memory Leak Detection**:
   ```bash
   npm test -- --logHeapUsage --detectLeaks
   ```

## Maintenance

### Regular Maintenance Tasks

1. **Update Test Dependencies**:
   ```bash
   npm update
   npm audit fix
   ```

2. **Review Test Coverage**:
   ```bash
   npm run test:coverage
   # Review coverage/index.html
   ```

3. **Clean Up Test Data**:
   ```bash
   npm run teardown:test-db
   npm run setup:test-db
   ```

4. **Update Test Fixtures**:
   ```bash
   # Review and update test data in __tests__/fixtures/
   ```

### Adding New Tests

When adding new features:

1. **Start with Unit Tests**: Test business logic in isolation
2. **Add Integration Tests**: Test API endpoints and database interactions
3. **Create Component Tests**: Test React component behavior
4. **Write E2E Tests**: Test complete user workflows
5. **Include Security Tests**: Test authentication and authorization
6. **Add Performance Tests**: Test response times and resource usage

### Test Documentation

Keep tests well-documented:

```typescript
/**
 * Tests the complete visitor journey from initial chat contact
 * through visit scheduling to follow-up sequences.
 * 
 * This test verifies:
 * - Chat widget functionality
 * - Visitor information collection
 * - AI response generation
 * - Visit scheduling workflow
 * - Email confirmation delivery
 * - Follow-up sequence enrollment
 */
test('complete visitor journey', async ({ page }) => {
  // Test implementation
})
```

---

## Getting Help

- **Slack**: #dev-testing
- **Documentation**: Check this guide and inline comments
- **Code Reviews**: Ask team members to review test patterns
- **Stack Overflow**: Search for Jest/Playwright/Testing Library issues

Remember: Good tests are an investment in code quality and team productivity. Take time to write clear, maintainable tests that will help the team ship features with confidence!