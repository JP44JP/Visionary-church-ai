// Authentication and Authorization Security Tests
import { AuthService } from '@/services/authService'
import { createMockUser, createMockTenant, expectAuthenticationError } from '../utils/test-helpers'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Mock dependencies
jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('@/app', () => ({
  prisma: {
    tenantUser: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    tenant: {
      findUnique: jest.fn(),
    },
  },
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    incr: jest.fn(),
    expire: jest.fn(),
  },
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('Authentication Security Tests', () => {
  let authService: AuthService
  let mockUser: any
  let mockTenant: any

  beforeEach(() => {
    jest.clearAllMocks()
    authService = AuthService.getInstance()
    mockUser = createMockUser()
    mockTenant = createMockTenant()
  })

  describe('Password Security', () => {
    it('should prevent login with common weak passwords during registration', async () => {
      const weakPasswords = [
        'password',
        '123456',
        'password123',
        'admin',
        'qwerty',
        'letmein',
        'welcome',
        '111111'
      ]

      for (const weakPassword of weakPasswords) {
        // Mock admin user for registration
        require('@/app').prisma.tenantUser.findFirst.mockResolvedValue({
          ...mockUser,
          role: 'admin'
        })

        await expect(authService.register(mockTenant.id, mockUser.id, {
          email: 'test@example.com',
          password: weakPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'staff'
        })).rejects.toThrow(/password.*strong/i)
      }
    })

    it('should enforce password complexity requirements', async () => {
      const invalidPasswords = [
        'short',           // Too short
        'alllowercase123', // No uppercase
        'ALLUPPERCASE123', // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecialChars1', // No special characters
      ]

      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        role: 'admin'
      })

      for (const password of invalidPasswords) {
        await expect(authService.register(mockTenant.id, mockUser.id, {
          email: 'test@example.com',
          password,
          firstName: 'Test',
          lastName: 'User',
          role: 'staff'
        })).rejects.toThrow(/password.*requirements/i)
      }
    })

    it('should require strong passwords for password changes', async () => {
      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)

      await expect(authService.changePassword(mockUser.id, {
        currentPassword: 'oldpassword',
        newPassword: 'weak'
      })).rejects.toThrow(/password.*requirements/i)
    })

    it('should prevent password reuse', async () => {
      // Mock user with password history
      const userWithHistory = {
        ...mockUser,
        passwordHistory: ['old-hash-1', 'old-hash-2', 'old-hash-3']
      }

      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(userWithHistory)
      mockBcrypt.compare.mockResolvedValue(true)
      mockBcrypt.compare.mockResolvedValueOnce(false) // Current password check
      mockBcrypt.compare.mockResolvedValueOnce(true)  // History check

      await expect(authService.changePassword(mockUser.id, {
        currentPassword: 'currentPassword123!',
        newPassword: 'previousPassword123!'
      })).rejects.toThrow(/password.*recently used/i)
    })
  })

  describe('Brute Force Protection', () => {
    it('should implement progressive delays for failed login attempts', async () => {
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(false) // Wrong password

      const redis = require('@/app').redis
      
      // First attempt - immediate failure
      redis.incr.mockResolvedValue(1)
      const start1 = Date.now()
      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow()
      const duration1 = Date.now() - start1
      expect(duration1).toBeLessThan(100) // Should be immediate

      // Third attempt - should have delay
      redis.incr.mockResolvedValue(3)
      const start3 = Date.now()
      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow()
      const duration3 = Date.now() - start3
      expect(duration3).toBeGreaterThan(1000) // Should have delay

      // Fifth attempt - longer delay
      redis.incr.mockResolvedValue(5)
      const start5 = Date.now()
      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow()
      const duration5 = Date.now() - start5
      expect(duration5).toBeGreaterThan(duration3) // Should have longer delay
    })

    it('should lock accounts after multiple failed attempts', async () => {
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue(mockUser)
      const redis = require('@/app').redis

      // Simulate 5 failed attempts
      redis.incr.mockResolvedValue(5)
      redis.get.mockResolvedValue(null) // No existing lockout

      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow()

      // Should set lockout
      expect(redis.setex).toHaveBeenCalledWith(
        expect.stringContaining('lockout:'),
        1800, // 30 minutes
        'locked'
      )
    })

    it('should prevent login during lockout period', async () => {
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue(mockUser)
      const redis = require('@/app').redis
      redis.get.mockResolvedValue('locked')

      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'correctpassword'
      })).rejects.toThrow(/locked/)
    })

    it('should detect and prevent distributed brute force attacks', async () => {
      // Simulate attacks from multiple IPs
      const ips = ['192.168.1.1', '192.168.1.2', '192.168.1.3']
      const redis = require('@/app').redis

      for (const ip of ips) {
        // Mock IP-based rate limiting
        redis.incr.mockResolvedValue(10) // High attempt count from this IP
        
        // Should detect coordinated attack
        const result = await authService.detectSuspiciousActivity(ip, 'test@example.com')
        expect(result.isSuspicious).toBe(true)
        expect(result.reason).toContain('distributed')
      }
    })
  })

  describe('Session Security', () => {
    it('should generate cryptographically secure tokens', async () => {
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        tenant: mockTenant
      })
      mockBcrypt.compare.mockResolvedValue(true)

      // Mock JWT to capture generated token
      let generatedToken = ''
      mockJwt.sign.mockImplementation((payload, secret, options) => {
        generatedToken = 'secure.jwt.token'
        return generatedToken
      })
      mockJwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })

      const redis = require('@/app').redis
      redis.get.mockResolvedValue(null)
      redis.setex.mockResolvedValue('OK')

      const result = await authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'password'
      })

      // Token should be present and reasonably complex
      expect(result.tokens.accessToken).toBeTruthy()
      expect(result.tokens.accessToken.length).toBeGreaterThan(20)
      
      // Should have appropriate expiration
      expect(result.tokens.expiresIn).toBeLessThan(3600) // Max 1 hour
    })

    it('should invalidate sessions on suspicious activity', async () => {
      const redis = require('@/app').redis
      redis.del.mockResolvedValue(1)

      // Mock suspicious activity detection
      await authService.invalidateAllSessions(mockUser.id, 'suspicious_activity')

      // Should clear all session data
      expect(redis.del).toHaveBeenCalledWith(`refresh_token:${mockUser.id}`)
      expect(redis.del).toHaveBeenCalledWith(`user:${mockUser.id}`)
      expect(redis.setex).toHaveBeenCalledWith(
        expect.stringContaining('blacklist:'),
        expect.any(Number),
        'suspicious_activity'
      )
    })

    it('should enforce session timeout policies', async () => {
      const redis = require('@/app').redis
      
      // Mock expired refresh token
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date())
      })

      await expect(authService.refreshToken('expired.token'))
        .rejects.toThrow(/expired|invalid/i)
    })

    it('should prevent session fixation attacks', async () => {
      const redis = require('@/app').redis
      
      // Mock existing session
      redis.get.mockResolvedValue('existing-token')
      
      // Should generate new session ID on login
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        tenant: mockTenant
      })
      mockBcrypt.compare.mockResolvedValue(true)
      
      let newTokenGenerated = false
      mockJwt.sign.mockImplementation(() => {
        newTokenGenerated = true
        return 'new.session.token'
      })
      
      await authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'password'
      })

      expect(newTokenGenerated).toBe(true)
    })
  })

  describe('Authorization Security', () => {
    it('should enforce strict role-based access control', async () => {
      const volunteerUser = { ...mockUser, role: 'volunteer' }
      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(volunteerUser)

      // Volunteer should not have admin permissions
      const hasAdminAccess = await authService.hasPermission(volunteerUser.id, 'tenant:delete')
      expect(hasAdminAccess).toBe(false)

      // Should not be able to escalate privileges
      const hasUserManagement = await authService.hasPermission(volunteerUser.id, 'users:delete')
      expect(hasUserManagement).toBe(false)
    })

    it('should prevent horizontal privilege escalation', async () => {
      const user1 = { ...mockUser, id: 'user-1', tenantId: 'tenant-1' }
      const user2 = { ...mockUser, id: 'user-2', tenantId: 'tenant-2' }

      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(user1)

      // User 1 should not be able to access user 2's resources
      const canAccessOtherTenant = await authService.canAccessResource(
        user1.id, 
        'conversation', 
        'conv-in-tenant-2'
      )
      expect(canAccessOtherTenant).toBe(false)
    })

    it('should validate tenant isolation', async () => {
      const tenant1User = { ...mockUser, tenantId: 'tenant-1' }
      const tenant2User = { ...mockUser, tenantId: 'tenant-2' }

      // Users from different tenants should not see each other's data
      const isolation = await authService.validateTenantIsolation(tenant1User.id, tenant2User.id)
      expect(isolation.isIsolated).toBe(true)
      expect(isolation.canAccess).toBe(false)
    })

    it('should prevent permission tampering', async () => {
      const userWithLimitedPerms = {
        ...mockUser,
        role: 'staff',
        permissions: ['events:read', 'prayers:read']
      }

      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(userWithLimitedPerms)

      // Should not be able to add permissions at runtime
      await expect(authService.modifyPermissions(userWithLimitedPerms.id, ['admin:all']))
        .rejects.toThrow(/unauthorized/i)
    })
  })

  describe('Input Validation Security', () => {
    it('should prevent SQL injection in login attempts', async () => {
      const sqlInjectionAttempts = [
        "admin'; DROP TABLE users; --",
        "admin' OR '1'='1",
        "admin' UNION SELECT * FROM passwords --",
        "admin'; INSERT INTO users VALUES ('hacker', 'pass'); --"
      ]

      for (const maliciousInput of sqlInjectionAttempts) {
        await expect(authService.login(mockTenant.id, {
          email: maliciousInput,
          password: 'password'
        })).rejects.toThrow(/invalid.*format/i)
      }
    })

    it('should sanitize email inputs', async () => {
      const maliciousEmails = [
        '<script>alert("xss")</script>@test.com',
        'test@<script>alert("xss")</script>.com',
        'javascript:alert("xss")@test.com'
      ]

      for (const email of maliciousEmails) {
        await expect(authService.login(mockTenant.id, {
          email,
          password: 'password'
        })).rejects.toThrow(/invalid.*email/i)
      }
    })

    it('should prevent NoSQL injection attempts', async () => {
      const nosqlInjectionAttempts = [
        { $ne: null },
        { $regex: '.*' },
        { $where: 'function() { return true; }' },
        { $gt: '' }
      ]

      for (const injection of nosqlInjectionAttempts) {
        await expect(authService.login(mockTenant.id, {
          email: JSON.stringify(injection),
          password: 'password'
        })).rejects.toThrow(/invalid.*format/i)
      }
    })
  })

  describe('Token Security', () => {
    it('should detect and prevent JWT tampering', async () => {
      const tamperedTokens = [
        'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ',
        'malformed.jwt.token',
        'valid.header.but.wrong.signature'
      ]

      for (const token of tamperedTokens) {
        mockJwt.verify.mockImplementation(() => {
          throw new jwt.JsonWebTokenError('invalid token')
        })

        await expect(authService.refreshToken(token))
          .rejects.toThrow(/invalid.*token/i)
      }
    })

    it('should enforce token expiration strictly', async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date())
      })

      await expect(authService.refreshToken('expired.token'))
        .rejects.toThrow(/expired/i)
    })

    it('should prevent token replay attacks', async () => {
      const redis = require('@/app').redis
      
      // Mock token already used
      redis.get.mockResolvedValue('used')
      
      mockJwt.verify.mockReturnValue({
        userId: mockUser.id,
        tenantId: mockTenant.id,
        type: 'refresh',
        jti: 'unique-token-id'
      })

      await expect(authService.refreshToken('already.used.token'))
        .rejects.toThrow(/invalid.*token/i)
    })
  })

  describe('Rate Limiting', () => {
    it('should enforce API rate limits per user', async () => {
      const redis = require('@/app').redis
      
      // Mock high request count
      redis.incr.mockResolvedValue(101) // Over limit of 100/minute
      
      const isRateLimited = await authService.checkRateLimit(mockUser.id, 'api_requests')
      expect(isRateLimited).toBe(true)
    })

    it('should enforce stricter limits for sensitive operations', async () => {
      const redis = require('@/app').redis
      
      // Mock password reset attempts
      redis.incr.mockResolvedValue(6) // Over limit of 5/hour
      
      const isLimited = await authService.checkRateLimit(mockUser.id, 'password_reset')
      expect(isLimited).toBe(true)
    })

    it('should implement exponential backoff for repeated violations', async () => {
      const redis = require('@/app').redis
      
      // Mock repeated violations
      redis.get.mockResolvedValue('3') // Third violation
      
      const backoffTime = await authService.calculateBackoff(mockUser.id, 'login_attempts')
      expect(backoffTime).toBeGreaterThan(1000) // Should have significant backoff
    })
  })

  describe('Audit Logging', () => {
    it('should log all authentication attempts', async () => {
      require('@/app').prisma.tenantUser.findFirst.mockResolvedValue(null)
      
      const logger = require('@/app').logger
      
      await expect(authService.login(mockTenant.id, {
        email: 'test@example.com',
        password: 'wrong'
      })).rejects.toThrow()

      expect(logger.warn).toHaveBeenCalledWith(
        'Failed login attempt',
        expect.objectContaining({
          email: 'test@example.com',
          tenantId: mockTenant.id
        })
      )
    })

    it('should log privilege escalation attempts', async () => {
      const logger = require('@/app').logger
      const limitedUser = { ...mockUser, role: 'volunteer' }
      
      require('@/app').prisma.tenantUser.findUnique.mockResolvedValue(limitedUser)
      
      await authService.hasPermission(limitedUser.id, 'admin:all')

      expect(logger.warn).toHaveBeenCalledWith(
        'Unauthorized permission check',
        expect.objectContaining({
          userId: limitedUser.id,
          permission: 'admin:all',
          userRole: 'volunteer'
        })
      )
    })
  })
})