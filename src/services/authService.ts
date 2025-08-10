// Authentication Service
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { config } from '../config';
import { prisma, redis, logger } from '../app';
import { AuthenticationError, ValidationError, NotFoundError } from '../utils/errors';
import { EmailService } from './emailService';

// Validation schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['admin', 'pastor', 'staff', 'volunteer']).default('staff'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
  };
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    plan: string;
    features: any;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class AuthService {
  private static instance: AuthService;
  private emailService: EmailService;
  
  private constructor() {
    this.emailService = EmailService.getInstance();
  }
  
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  /**
   * Generate JWT tokens (access + refresh)
   */
  private generateTokens(user: any): { accessToken: string; refreshToken: string; expiresIn: number } {
    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    };
    
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
    
    // Get expiration time in seconds
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
    
    return { accessToken, refreshToken, expiresIn };
  }
  
  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, config.security.bcryptRounds);
  }
  
  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
  
  /**
   * Generate secure random token
   */
  private generateSecureToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
  
  /**
   * Get effective permissions for user (role + explicit permissions)
   */
  private getEffectivePermissions(role: string, explicitPermissions: string[] = []): string[] {
    const rolePermissions: Record<string, string[]> = {
      'admin': [
        'tenant:read', 'tenant:write', 'tenant:delete',
        'users:read', 'users:write', 'users:delete',
        'members:read', 'members:write', 'members:delete', 'members:export',
        'events:read', 'events:write', 'events:delete',
        'prayers:read', 'prayers:write', 'prayers:delete',
        'visits:read', 'visits:write', 'visits:delete',
        'notifications:read', 'notifications:write', 'notifications:send',
        'analytics:read', 'analytics:export',
        'files:read', 'files:write', 'files:delete',
        'settings:read', 'settings:write'
      ],
      'pastor': [
        'members:read', 'members:write',
        'events:read', 'events:write',
        'prayers:read', 'prayers:write',
        'visits:read', 'visits:write',
        'notifications:read', 'notifications:write',
        'analytics:read',
        'files:read', 'files:write'
      ],
      'staff': [
        'members:read', 'members:write',
        'events:read', 'events:write',
        'prayers:read', 'prayers:write',
        'visits:read', 'visits:write',
        'files:read', 'files:write'
      ],
      'volunteer': [
        'members:read',
        'events:read',
        'prayers:read',
        'files:read'
      ],
    };
    
    const rolePerms = rolePermissions[role] || [];
    return [...new Set([...rolePerms, ...explicitPermissions])];
  }
  
  /**
   * User login
   */
  async login(tenantId: string, credentials: z.infer<typeof loginSchema>): Promise<LoginResponse> {
    try {
      // Find user by email and tenant
      const user = await prisma.tenantUser.findFirst({
        where: {
          email: credentials.email.toLowerCase(),
          tenantId,
          isActive: true
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              planType: true,
              features: true,
              status: true
            }
          }
        }
      });
      
      if (!user || user.tenant.status !== 'active') {
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, user.passwordHash);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid credentials');
      }
      
      // Check account lockout
      const lockoutKey = `lockout:${user.id}`;
      const isLockedOut = await redis.get(lockoutKey);
      if (isLockedOut) {
        throw new AuthenticationError('Account temporarily locked due to multiple failed attempts');
      }
      
      // Get effective permissions
      const permissions = this.getEffectivePermissions(user.role, user.permissions);
      
      // Generate tokens
      const userWithPermissions = { ...user, permissions };
      const tokens = this.generateTokens(userWithPermissions);
      
      // Store refresh token in Redis
      await redis.setex(
        `refresh_token:${user.id}`,
        7 * 24 * 60 * 60, // 7 days
        tokens.refreshToken
      );
      
      // Update last login
      await prisma.tenantUser.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
      });
      
      // Clear any failed login attempts
      await redis.del(`failed_logins:${credentials.email.toLowerCase()}`);
      
      // Log successful login
      logger.info('User logged in successfully', {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role
      });
      
      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          role: user.role,
          permissions
        },
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
          plan: user.tenant.planType,
          features: user.tenant.features || {}
        },
        tokens
      };
      
    } catch (error) {
      // Track failed login attempts
      const attemptsKey = `failed_logins:${credentials.email.toLowerCase()}`;
      const attempts = await redis.incr(attemptsKey);
      await redis.expire(attemptsKey, 15 * 60); // 15 minutes
      
      if (attempts >= 5) {
        // Lock account for 30 minutes after 5 failed attempts
        const user = await prisma.tenantUser.findFirst({
          where: { email: credentials.email.toLowerCase(), tenantId }
        });
        
        if (user) {
          await redis.setex(`lockout:${user.id}`, 30 * 60, 'locked');
        }
      }
      
      logger.warn('Failed login attempt', {
        email: credentials.email,
        tenantId,
        attempts,
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Register new user (only admin can register users)
   */
  async register(tenantId: string, adminUserId: string, userData: z.infer<typeof registerSchema>): Promise<{
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    tempPassword: string;
  }> {
    // Verify admin permissions
    const admin = await prisma.tenantUser.findFirst({
      where: {
        id: adminUserId,
        tenantId,
        role: 'admin',
        isActive: true
      }
    });
    
    if (!admin) {
      throw new AuthenticationError('Only administrators can register new users');
    }
    
    // Check if email already exists in tenant
    const existingUser = await prisma.tenantUser.findFirst({
      where: {
        email: userData.email.toLowerCase(),
        tenantId
      }
    });
    
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }
    
    // Generate temporary password
    const tempPassword = this.generateSecureToken(12);
    const hashedPassword = await this.hashPassword(tempPassword);
    
    // Create user
    const user = await prisma.tenantUser.create({
      data: {
        tenantId,
        email: userData.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        permissions: [],
        emailVerified: false,
        isActive: true
      }
    });
    
    // Send welcome email with temporary password
    try {
      await this.emailService.sendWelcomeEmail(
        user.email,
        user.firstName,
        tempPassword,
        tenantId
      );
    } catch (emailError) {
      logger.error('Failed to send welcome email:', emailError);
      // Don't fail user creation if email fails
    }
    
    logger.info('New user registered', {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId,
      registeredBy: adminUserId
    });
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role
      },
      tempPassword
    };
  }
  
  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid token type');
      }
      
      // Check if refresh token exists in Redis
      const storedToken = await redis.get(`refresh_token:${decoded.userId}`);
      if (!storedToken || storedToken !== refreshToken) {
        throw new AuthenticationError('Invalid refresh token');
      }
      
      // Get current user data
      const user = await prisma.tenantUser.findFirst({
        where: {
          id: decoded.userId,
          tenantId: decoded.tenantId,
          isActive: true
        }
      });
      
      if (!user) {
        throw new AuthenticationError('User not found or inactive');
      }
      
      // Generate new access token
      const permissions = this.getEffectivePermissions(user.role, user.permissions);
      const accessToken = jwt.sign(
        {
          userId: user.id,
          tenantId: user.tenantId,
          email: user.email,
          role: user.role,
          permissions,
          type: 'access'
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      const decodedAccess = jwt.decode(accessToken) as any;
      const expiresIn = decodedAccess.exp - Math.floor(Date.now() / 1000);
      
      return { accessToken, expiresIn };
      
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      }
      throw error;
    }
  }
  
  /**
   * Logout user (invalidate tokens)
   */
  async logout(userId: string, accessToken: string): Promise<void> {
    try {
      // Add access token to blacklist
      const decoded = jwt.decode(accessToken) as any;
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redis.setex(`blacklist:${accessToken}`, ttl, 'revoked');
        }
      }
      
      // Remove refresh token
      await redis.del(`refresh_token:${userId}`);
      
      // Clear user session cache
      await redis.del(`user:${userId}`);
      
      logger.info('User logged out', { userId });
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }
  
  /**
   * Forgot password - send reset link
   */
  async forgotPassword(tenantId: string, email: string): Promise<void> {
    const user = await prisma.tenantUser.findFirst({
      where: {
        email: email.toLowerCase(),
        tenantId,
        isActive: true
      }
    });
    
    if (!user) {
      // Don't reveal if email exists or not
      logger.info('Password reset requested for non-existent email', { email, tenantId });
      return;
    }
    
    // Generate reset token
    const resetToken = this.generateSecureToken(32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    // Save reset token to database
    await prisma.tenantUser.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires
      }
    });
    
    // Send reset email
    try {
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.firstName || 'User',
        resetToken,
        tenantId
      );
      
      logger.info('Password reset email sent', { userId: user.id, email: user.email });
    } catch (error) {
      logger.error('Failed to send password reset email:', error);
      throw new Error('Failed to send reset email');
    }
  }
  
  /**
   * Reset password using reset token
   */
  async resetPassword(resetData: z.infer<typeof resetPasswordSchema>): Promise<void> {
    const user = await prisma.tenantUser.findFirst({
      where: {
        passwordResetToken: resetData.token,
        passwordResetExpires: {
          gt: new Date()
        },
        isActive: true
      }
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid or expired reset token');
    }
    
    // Hash new password
    const hashedPassword = await this.hashPassword(resetData.password);
    
    // Update password and clear reset token
    await prisma.tenantUser.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerified: true // Verify email on password reset
      }
    });
    
    // Invalidate all existing sessions
    await redis.del(`refresh_token:${user.id}`);
    await redis.del(`user:${user.id}`);
    
    logger.info('Password reset successful', { userId: user.id });
  }
  
  /**
   * Change password (authenticated user)
   */
  async changePassword(userId: string, passwordData: z.infer<typeof changePasswordSchema>): Promise<void> {
    const user = await prisma.tenantUser.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    // Verify current password
    const isValidPassword = await this.verifyPassword(passwordData.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new AuthenticationError('Current password is incorrect');
    }
    
    // Hash new password
    const hashedPassword = await this.hashPassword(passwordData.newPassword);
    
    // Update password
    await prisma.tenantUser.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword }
    });
    
    // Invalidate all existing sessions except current one
    await redis.del(`user:${userId}`);
    
    logger.info('Password changed successfully', { userId });
  }
  
  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await prisma.tenantUser.findFirst({
      where: {
        emailVerificationToken: token,
        isActive: true
      }
    });
    
    if (!user) {
      throw new AuthenticationError('Invalid verification token');
    }
    
    await prisma.tenantUser.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null
      }
    });
    
    logger.info('Email verified successfully', { userId: user.id });
  }
  
  /**
   * Check if user has permission
   */
  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const user = await prisma.tenantUser.findUnique({
      where: { id: userId },
      select: { role: true, permissions: true }
    });
    
    if (!user) {
      return false;
    }
    
    const effectivePermissions = this.getEffectivePermissions(user.role, user.permissions);
    return effectivePermissions.includes(permission) || effectivePermissions.includes('*');
  }
}

export default AuthService;