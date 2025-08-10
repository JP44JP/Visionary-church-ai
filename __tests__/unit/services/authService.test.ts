// AuthService Unit Tests
import { AuthService } from '@/services/authService'
import { createMockUser, createMockTenant, mockPrismaClient, mockRedisClient } from '../../utils/test-helpers'
import { AuthenticationError, ValidationError } from '@/utils/errors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

// Mock dependencies
jest.mock('bcrypt')
jest.mock('jsonwebtoken')
jest.mock('@/app', () => ({
  prisma: mockPrismaClient,
  redis: mockRedisClient,
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}))
jest.mock('@/services/emailService', () => ({
  EmailService: {
    getInstance: () => ({
      sendWelcomeEmail: jest.fn(),
      sendPasswordResetEmail: jest.fn(),
    })
  }
}))

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('AuthService', () => {
  let authService: AuthService
  let mockUser: any
  let mockTenant: any

  beforeEach(() => {
    jest.clearAllMocks()
    authService = AuthService.getInstance()
    mockUser = createMockUser()
    mockTenant = createMockTenant()
  })

  describe('login', () => {
    const loginCredentials = {
      email: 'test@example.com',
      password: 'password123'
    }

    beforeEach(() => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        tenant: mockTenant
      })
      mockBcrypt.compare.mockResolvedValue(true)
      mockJwt.sign.mockReturnValue('mock-token')
      mockJwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
      mockRedisClient.get.mockResolvedValue(null)
      mockRedisClient.setex.mockResolvedValue('OK')
      mockRedisClient.del.mockResolvedValue(1)
    })

    it('should successfully log in a user with valid credentials', async () => {
      const result = await authService.login(mockTenant.id, loginCredentials)

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tenant')
      expect(result).toHaveProperty('tokens')
      expect(result.user.email).toBe(mockUser.email)
      expect(result.tenant.id).toBe(mockTenant.id)
      expect(mockPrismaClient.tenantUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { lastLoginAt: expect.any(Date) }
      })
    })

    it('should throw AuthenticationError for invalid email', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(null)

      await expect(authService.login(mockTenant.id, loginCredentials))
        .rejects.toThrow(AuthenticationError)
    })

    it('should throw AuthenticationError for wrong password', async () => {
      mockBcrypt.compare.mockResolvedValue(false)

      await expect(authService.login(mockTenant.id, loginCredentials))
        .rejects.toThrow(AuthenticationError)
    })

    it('should handle account lockout after failed attempts', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(null)
      mockRedisClient.incr.mockResolvedValue(5)

      await expect(authService.login(mockTenant.id, loginCredentials))
        .rejects.toThrow(AuthenticationError)

      expect(mockRedisClient.incr).toHaveBeenCalled()
      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        expect.stringMatching(/^lockout:/),
        1800, // 30 minutes
        'locked'
      )
    })

    it('should prevent login for locked account', async () => {
      mockRedisClient.get.mockResolvedValue('locked')

      await expect(authService.login(mockTenant.id, loginCredentials))
        .rejects.toThrow('Account temporarily locked')
    })

    it('should prevent login for inactive tenant', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        tenant: { ...mockTenant, status: 'suspended' }
      })

      await expect(authService.login(mockTenant.id, loginCredentials))
        .rejects.toThrow(AuthenticationError)
    })
  })

  describe('register', () => {
    const registerData = {
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'staff' as const
    }

    beforeEach(() => {
      mockPrismaClient.tenantUser.findFirst
        .mockResolvedValueOnce({ ...mockUser, role: 'admin' }) // Admin check
        .mockResolvedValueOnce(null) // Email exists check
      mockBcrypt.hash.mockResolvedValue('hashed-password')
      mockPrismaClient.tenantUser.create.mockResolvedValue(mockUser)
    })

    it('should successfully register a new user', async () => {
      const result = await authService.register(mockTenant.id, mockUser.id, registerData)

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('tempPassword')
      expect(mockPrismaClient.tenantUser.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: mockTenant.id,
          email: registerData.email.toLowerCase(),
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          role: registerData.role
        })
      })
    })

    it('should throw AuthenticationError for non-admin user', async () => {
      mockPrismaClient.tenantUser.findFirst
        .mockResolvedValueOnce(null) // Admin check fails

      await expect(authService.register(mockTenant.id, mockUser.id, registerData))
        .rejects.toThrow('Only administrators can register new users')
    })

    it('should throw ValidationError for existing email', async () => {
      mockPrismaClient.tenantUser.findFirst
        .mockResolvedValueOnce({ ...mockUser, role: 'admin' }) // Admin check
        .mockResolvedValueOnce(mockUser) // Email exists

      await expect(authService.register(mockTenant.id, mockUser.id, registerData))
        .rejects.toThrow('Email already registered')
    })
  })

  describe('refreshToken', () => {
    const refreshToken = 'valid-refresh-token'

    beforeEach(() => {
      mockJwt.verify.mockReturnValue({
        userId: mockUser.id,
        tenantId: mockTenant.id,
        type: 'refresh'
      })
      mockRedisClient.get.mockResolvedValue(refreshToken)
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(mockUser)
      mockJwt.sign.mockReturnValue('new-access-token')
      mockJwt.decode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 })
    })

    it('should successfully refresh access token', async () => {
      const result = await authService.refreshToken(refreshToken)

      expect(result).toHaveProperty('accessToken')
      expect(result).toHaveProperty('expiresIn')
      expect(mockJwt.verify).toHaveBeenCalledWith(refreshToken, expect.any(String))
      expect(mockJwt.sign).toHaveBeenCalled()
    })

    it('should throw AuthenticationError for invalid token type', async () => {
      mockJwt.verify.mockReturnValue({
        userId: mockUser.id,
        tenantId: mockTenant.id,
        type: 'access'
      })

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('Invalid token type')
    })

    it('should throw AuthenticationError for mismatched stored token', async () => {
      mockRedisClient.get.mockResolvedValue('different-token')

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('Invalid refresh token')
    })

    it('should throw AuthenticationError for inactive user', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        isActive: false
      })

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('User not found or inactive')
    })
  })

  describe('logout', () => {
    const accessToken = 'valid-access-token'

    beforeEach(() => {
      mockJwt.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) + 3600
      })
      mockRedisClient.setex.mockResolvedValue('OK')
      mockRedisClient.del.mockResolvedValue(1)
    })

    it('should successfully logout user', async () => {
      await authService.logout(mockUser.id, accessToken)

      expect(mockRedisClient.setex).toHaveBeenCalledWith(
        `blacklist:${accessToken}`,
        expect.any(Number),
        'revoked'
      )
      expect(mockRedisClient.del).toHaveBeenCalledWith(`refresh_token:${mockUser.id}`)
      expect(mockRedisClient.del).toHaveBeenCalledWith(`user:${mockUser.id}`)
    })

    it('should handle logout with expired token gracefully', async () => {
      mockJwt.decode.mockReturnValue({
        exp: Math.floor(Date.now() / 1000) - 3600 // Expired
      })

      await authService.logout(mockUser.id, accessToken)

      expect(mockRedisClient.del).toHaveBeenCalledWith(`refresh_token:${mockUser.id}`)
    })
  })

  describe('forgotPassword', () => {
    const email = 'user@example.com'

    beforeEach(() => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(mockUser)
      mockPrismaClient.tenantUser.update.mockResolvedValue(mockUser)
    })

    it('should send password reset email for valid user', async () => {
      await authService.forgotPassword(mockTenant.id, email)

      expect(mockPrismaClient.tenantUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          passwordResetToken: expect.any(String),
          passwordResetExpires: expect.any(Date)
        }
      })
    })

    it('should not throw error for non-existent email', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(null)

      await expect(authService.forgotPassword(mockTenant.id, email))
        .resolves.not.toThrow()
    })
  })

  describe('resetPassword', () => {
    const resetData = {
      token: 'valid-reset-token',
      password: 'newpassword123'
    }

    beforeEach(() => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        passwordResetToken: resetData.token,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000)
      })
      mockBcrypt.hash.mockResolvedValue('hashed-new-password')
      mockPrismaClient.tenantUser.update.mockResolvedValue(mockUser)
      mockRedisClient.del.mockResolvedValue(1)
    })

    it('should successfully reset password', async () => {
      await authService.resetPassword(resetData)

      expect(mockPrismaClient.tenantUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          passwordHash: 'hashed-new-password',
          passwordResetToken: null,
          passwordResetExpires: null,
          emailVerified: true
        }
      })
    })

    it('should throw AuthenticationError for invalid token', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue(null)

      await expect(authService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired reset token')
    })

    it('should throw AuthenticationError for expired token', async () => {
      mockPrismaClient.tenantUser.findFirst.mockResolvedValue({
        ...mockUser,
        passwordResetExpires: new Date(Date.now() - 60 * 60 * 1000) // Expired
      })

      await expect(authService.resetPassword(resetData))
        .rejects.toThrow('Invalid or expired reset token')
    })
  })

  describe('changePassword', () => {
    const passwordData = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123'
    }

    beforeEach(() => {
      mockPrismaClient.tenantUser.findUnique.mockResolvedValue(mockUser)
      mockBcrypt.compare.mockResolvedValue(true)
      mockBcrypt.hash.mockResolvedValue('hashed-new-password')
      mockPrismaClient.tenantUser.update.mockResolvedValue(mockUser)
      mockRedisClient.del.mockResolvedValue(1)
    })

    it('should successfully change password', async () => {
      await authService.changePassword(mockUser.id, passwordData)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        passwordData.currentPassword,
        mockUser.passwordHash
      )
      expect(mockPrismaClient.tenantUser.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: 'hashed-new-password' }
      })
    })

    it('should throw AuthenticationError for wrong current password', async () => {
      mockBcrypt.compare.mockResolvedValue(false)

      await expect(authService.changePassword(mockUser.id, passwordData))
        .rejects.toThrow('Current password is incorrect')
    })
  })

  describe('hasPermission', () => {
    beforeEach(() => {
      mockPrismaClient.tenantUser.findUnique.mockResolvedValue({
        ...mockUser,
        role: 'staff',
        permissions: ['events:read', 'prayers:write']
      })
    })

    it('should return true for role-based permission', async () => {
      const hasPermission = await authService.hasPermission(mockUser.id, 'members:read')
      expect(hasPermission).toBe(true)
    })

    it('should return true for explicit permission', async () => {
      const hasPermission = await authService.hasPermission(mockUser.id, 'prayers:write')
      expect(hasPermission).toBe(true)
    })

    it('should return false for missing permission', async () => {
      const hasPermission = await authService.hasPermission(mockUser.id, 'tenant:delete')
      expect(hasPermission).toBe(false)
    })

    it('should return false for non-existent user', async () => {
      mockPrismaClient.tenantUser.findUnique.mockResolvedValue(null)
      
      const hasPermission = await authService.hasPermission('non-existent', 'any:permission')
      expect(hasPermission).toBe(false)
    })
  })

  describe('getEffectivePermissions', () => {
    it('should return correct permissions for admin role', () => {
      const authServiceInstance = authService as any
      const permissions = authServiceInstance.getEffectivePermissions('admin')
      
      expect(permissions).toContain('tenant:delete')
      expect(permissions).toContain('users:delete')
      expect(permissions).toContain('analytics:export')
    })

    it('should return correct permissions for staff role', () => {
      const authServiceInstance = authService as any
      const permissions = authServiceInstance.getEffectivePermissions('staff')
      
      expect(permissions).toContain('members:read')
      expect(permissions).toContain('events:write')
      expect(permissions).not.toContain('tenant:delete')
    })

    it('should combine role and explicit permissions', () => {
      const authServiceInstance = authService as any
      const permissions = authServiceInstance.getEffectivePermissions('volunteer', ['special:permission'])
      
      expect(permissions).toContain('members:read')
      expect(permissions).toContain('special:permission')
      expect(permissions).not.toContain('members:write')
    })
  })
})