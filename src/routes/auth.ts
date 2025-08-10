// Authentication Routes
import { Router } from 'express';
import { z } from 'zod';
import { 
  extractTenant, 
  authenticate, 
  validateBody, 
  AuthenticatedRequest,
  rateLimitByUser 
} from '../middleware/auth';
import { AuthService, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../services/authService';
import { logger } from '../app';

const router = Router();
const authService = AuthService.getInstance();

/**
 * @route POST /api/auth/login
 * @desc User login
 */
router.post('/login', 
  extractTenant,
  validateBody(loginSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required',
          requestId: req.requestId
        });
      }
      
      const loginData = await authService.login(req.tenant.id, req.body);
      
      res.json({
        success: true,
        data: loginData,
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Login error:', { 
        error: error.message, 
        tenantId: req.tenant?.id,
        requestId: req.requestId 
      });
      
      res.status(401).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/register
 * @desc Register new user (admin only)
 */
const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin', 'pastor', 'staff', 'volunteer']).default('staff')
});

router.post('/register',
  extractTenant,
  authenticate,
  validateBody(registerSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.tenant || !req.user) {
        return res.status(400).json({
          success: false,
          error: 'Authentication and tenant context required',
          requestId: req.requestId
        });
      }
      
      // Only admins can register new users
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Only administrators can register new users',
          requestId: req.requestId
        });
      }
      
      const registrationData = await authService.register(
        req.tenant.id,
        req.user.id,
        req.body
      );
      
      res.status(201).json({
        success: true,
        data: registrationData,
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Registration error:', { 
        error: error.message, 
        tenantId: req.tenant?.id,
        adminId: req.user?.id,
        requestId: req.requestId 
      });
      
      const statusCode = error.message.includes('already registered') ? 409 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh access token
 */
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

router.post('/refresh',
  validateBody(refreshTokenSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      const tokenData = await authService.refreshToken(req.body.refreshToken);
      
      res.json({
        success: true,
        data: tokenData,
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Token refresh error:', { 
        error: error.message,
        requestId: req.requestId 
      });
      
      res.status(401).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/logout
 * @desc User logout
 */
router.post('/logout',
  extractTenant,
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          requestId: req.requestId
        });
      }
      
      const token = req.header('Authorization')?.replace('Bearer ', '') || '';
      await authService.logout(req.user.id, token);
      
      res.json({
        success: true,
        message: 'Logged out successfully',
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Logout error:', { 
        error: error.message,
        userId: req.user?.id,
        requestId: req.requestId 
      });
      
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route GET /api/auth/me
 * @desc Get current user info
 */
router.get('/me',
  extractTenant,
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      res.json({
        success: true,
        data: {
          user: req.user,
          tenant: req.tenant
        },
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Get user info error:', { 
        error: error.message,
        userId: req.user?.id,
        requestId: req.requestId 
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get user information',
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 */
router.post('/forgot-password',
  extractTenant,
  validateBody(forgotPasswordSchema),
  rateLimitByUser(60 * 60 * 1000, 3), // 3 requests per hour
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.tenant) {
        return res.status(400).json({
          success: false,
          error: 'Tenant context required',
          requestId: req.requestId
        });
      }
      
      await authService.forgotPassword(req.tenant.id, req.body.email);
      
      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Forgot password error:', { 
        error: error.message,
        email: req.body.email,
        tenantId: req.tenant?.id,
        requestId: req.requestId 
      });
      
      // Always return success to prevent email enumeration
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent',
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 */
router.post('/reset-password',
  validateBody(resetPasswordSchema),
  rateLimitByUser(15 * 60 * 1000, 5), // 5 attempts per 15 minutes
  async (req: AuthenticatedRequest, res) => {
    try {
      await authService.resetPassword(req.body);
      
      res.json({
        success: true,
        message: 'Password reset successfully',
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Password reset error:', { 
        error: error.message,
        requestId: req.requestId 
      });
      
      const statusCode = error.message.includes('Invalid or expired') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/change-password
 * @desc Change password (authenticated user)
 */
router.post('/change-password',
  extractTenant,
  authenticate,
  validateBody(changePasswordSchema),
  rateLimitByUser(15 * 60 * 1000, 3), // 3 attempts per 15 minutes
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          requestId: req.requestId
        });
      }
      
      await authService.changePassword(req.user.id, req.body);
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Change password error:', { 
        error: error.message,
        userId: req.user?.id,
        requestId: req.requestId 
      });
      
      const statusCode = error.message.includes('Current password is incorrect') ? 400 : 500;
      
      res.status(statusCode).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route GET /api/auth/verify-email/:token
 * @desc Verify email address
 */
router.get('/verify-email/:token',
  async (req: AuthenticatedRequest, res) => {
    try {
      await authService.verifyEmail(req.params.token);
      
      res.json({
        success: true,
        message: 'Email verified successfully',
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Email verification error:', { 
        error: error.message,
        token: req.params.token,
        requestId: req.requestId 
      });
      
      res.status(400).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route POST /api/auth/check-permission
 * @desc Check if user has specific permission
 */
const checkPermissionSchema = z.object({
  permission: z.string().min(1)
});

router.post('/check-permission',
  extractTenant,
  authenticate,
  validateBody(checkPermissionSchema),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          requestId: req.requestId
        });
      }
      
      const hasPermission = await authService.hasPermission(req.user.id, req.body.permission);
      
      res.json({
        success: true,
        data: {
          permission: req.body.permission,
          hasPermission
        },
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Check permission error:', { 
        error: error.message,
        userId: req.user?.id,
        permission: req.body.permission,
        requestId: req.requestId 
      });
      
      res.status(500).json({
        success: false,
        error: 'Permission check failed',
        requestId: req.requestId
      });
    }
  }
);

/**
 * @route GET /api/auth/sessions
 * @desc Get active user sessions (admin only)
 */
router.get('/sessions',
  extractTenant,
  authenticate,
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          requestId: req.requestId
        });
      }
      
      // This would require implementing session tracking in Redis
      // For now, return empty array as placeholder
      res.json({
        success: true,
        data: {
          sessions: [],
          total: 0
        },
        requestId: req.requestId
      });
      
    } catch (error) {
      logger.error('Get sessions error:', { 
        error: error.message,
        userId: req.user?.id,
        requestId: req.requestId 
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get active sessions',
        requestId: req.requestId
      });
    }
  }
);

export default router;