// Authentication and Authorization Middleware
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { prisma, redis, logger } from '../app';
import { TenantContextError, AuthenticationError, AuthorizationError } from '../utils/errors';

// Enhanced request interface with user and tenant context
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    permissions: string[];
    isActive: boolean;
  };
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
    schemaName: string;
    plan: string;
    settings: any;
    features: any;
  };
  requestId?: string;
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  permissions: string[];
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
}

// Permission definitions by role
const ROLE_PERMISSIONS = {
  'super_admin': ['*'], // All permissions
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
  'member': [
    'events:read',
    'prayers:read'
  ]
};

/**
 * Generate request ID for tracing
 */
export const generateRequestId = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.requestId = req.headers['x-request-id'] as string || 
                  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('x-request-id', req.requestId);
  next();
};

/**
 * Extract tenant context from subdomain or header
 */
export const extractTenant = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    let tenantIdentifier: string | undefined;
    
    // Method 1: Extract from subdomain
    const host = req.get('host');
    if (host) {
      const subdomain = host.split('.')[0];
      if (subdomain && !['api', 'www', 'admin', 'localhost'].includes(subdomain)) {
        tenantIdentifier = subdomain;
      }
    }
    
    // Method 2: Extract from header
    if (!tenantIdentifier) {
      tenantIdentifier = req.header('x-tenant-id');
    }
    
    // Method 3: Extract from JWT token if authenticated
    if (!tenantIdentifier) {
      const token = req.header('Authorization')?.replace('Bearer ', '');
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
          tenantIdentifier = decoded.tenantId;
        } catch {
          // Token invalid, but we might still find tenant from subdomain/header
        }
      }
    }
    
    // For public widget routes, tenant ID comes from URL params
    if (!tenantIdentifier && req.path.startsWith('/api/widget/')) {
      tenantIdentifier = req.params.tenantId;
    }
    
    if (tenantIdentifier) {
      // Check cache first
      const cacheKey = `tenant:${tenantIdentifier}`;
      let tenant = await redis.get(cacheKey);
      
      if (tenant) {
        req.tenant = JSON.parse(tenant);
      } else {
        // Query database
        const tenantQuery = tenantIdentifier.includes('-') || tenantIdentifier.length > 20
          ? { id: tenantIdentifier }
          : { subdomain: tenantIdentifier };
        
        const tenantRecord = await prisma.tenant.findFirst({
          where: {
            ...tenantQuery,
            status: 'active'
          },
          select: {
            id: true,
            name: true,
            subdomain: true,
            schemaName: true,
            planType: true,
            settings: true,
            features: true
          }
        });
        
        if (tenantRecord) {
          const tenantData = {
            id: tenantRecord.id,
            name: tenantRecord.name,
            subdomain: tenantRecord.subdomain,
            schemaName: tenantRecord.schemaName,
            plan: tenantRecord.planType,
            settings: tenantRecord.settings || {},
            features: tenantRecord.features || {}
          };
          
          req.tenant = tenantData;
          
          // Cache tenant data
          await redis.setex(cacheKey, config.cache.tenantConfig, JSON.stringify(tenantData));
        }
      }
    }
    
    // For protected routes, tenant is required
    const publicPaths = ['/api/widget/', '/api/public/', '/health'];
    const isPublicPath = publicPaths.some(path => req.path.startsWith(path));
    
    if (!req.tenant && !isPublicPath) {
      throw new TenantContextError('Tenant context required');
    }
    
    next();
  } catch (error) {
    logger.error('Tenant extraction error:', {
      error: error.message,
      path: req.path,
      host: req.get('host'),
      requestId: req.requestId
    });
    
    if (error instanceof TenantContextError) {
      return res.status(400).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      requestId: req.requestId
    });
  }
};

/**
 * Authenticate user with JWT token
 */
export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new AuthenticationError('Access token required');
    }
    
    // Verify JWT
    const decoded = jwt.verify(token, config.jwt.secret) as JWTPayload;
    
    if (decoded.type !== 'access') {
      throw new AuthenticationError('Invalid token type');
    }
    
    // Check if token is blacklisted
    const blacklistKey = `blacklist:${token}`;
    const isBlacklisted = await redis.get(blacklistKey);
    
    if (isBlacklisted) {
      throw new AuthenticationError('Token has been revoked');
    }
    
    // Get user details from cache or database
    const userCacheKey = `user:${decoded.userId}`;
    let user = await redis.get(userCacheKey);
    
    if (user) {
      req.user = JSON.parse(user);
    } else {
      const userRecord = await prisma.tenantUser.findFirst({
        where: {
          id: decoded.userId,
          tenantId: decoded.tenantId,
          isActive: true
        },
        select: {
          id: true,
          tenantId: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          permissions: true,
          isActive: true
        }
      });
      
      if (!userRecord) {
        throw new AuthenticationError('User not found or inactive');
      }
      
      // Get effective permissions (role + explicit permissions)
      const rolePermissions = ROLE_PERMISSIONS[userRecord.role as keyof typeof ROLE_PERMISSIONS] || [];
      const effectivePermissions = [...new Set([...rolePermissions, ...userRecord.permissions])];
      
      const userData = {
        id: userRecord.id,
        tenantId: userRecord.tenantId,
        email: userRecord.email,
        firstName: userRecord.firstName,
        lastName: userRecord.lastName,
        role: userRecord.role,
        permissions: effectivePermissions,
        isActive: userRecord.isActive
      };
      
      req.user = userData;
      
      // Cache user data
      await redis.setex(userCacheKey, config.cache.userSession, JSON.stringify(userData));
    }
    
    // Verify tenant match
    if (req.tenant && req.user.tenantId !== req.tenant.id) {
      throw new AuthenticationError('Token tenant mismatch');
    }
    
    // Update last activity
    await redis.setex(`user:activity:${req.user.id}`, 300, new Date().toISOString()); // 5 min TTL
    
    next();
  } catch (error) {
    logger.error('Authentication error:', {
      error: error.message,
      path: req.path,
      requestId: req.requestId
    });
    
    if (error instanceof jwt.JsonWebTokenError || error instanceof AuthenticationError) {
      return res.status(401).json({
        success: false,
        error: error.message,
        requestId: req.requestId
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Authentication service unavailable',
      requestId: req.requestId
    });
  }
};

/**
 * Optional authentication (for public endpoints that benefit from user context)
 */
export const optionalAuthenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (token) {
    // Try to authenticate, but don't fail if it doesn't work
    await authenticate(req, res, (error) => {
      if (error) {
        // Authentication failed, but continue without user context
        req.user = undefined;
      }
      next();
    });
  } else {
    next();
  }
};

/**
 * Authorize user with required permission
 */
export const authorize = (...requiredPermissions: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        requestId: req.requestId
      });
    }
    
    const { role, permissions } = req.user;
    
    // Super admin and tenant admin have all permissions
    if (role === 'super_admin' || permissions.includes('*')) {
      return next();
    }
    
    // Check if user has any of the required permissions
    const hasPermission = requiredPermissions.some(permission => 
      permissions.includes(permission)
    );
    
    if (!hasPermission) {
      logger.warn('Authorization failed:', {
        userId: req.user.id,
        userRole: role,
        userPermissions: permissions,
        requiredPermissions,
        path: req.path,
        requestId: req.requestId
      });
      
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: requiredPermissions,
        requestId: req.requestId
      });
    }
    
    next();
  };
};

/**
 * Authorize resource ownership (user can only access their own resources)
 */
export const authorizeOwnership = (resourceIdParam = 'id') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        requestId: req.requestId
      });
    }
    
    // Admins and pastors can access any resource
    if (['admin', 'pastor'].includes(req.user.role)) {
      return next();
    }
    
    const resourceId = req.params[resourceIdParam];
    const userId = req.user.id;
    
    // For member resources, check if the resource belongs to the user
    if (resourceId === userId) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      error: 'Access denied: insufficient ownership permissions',
      requestId: req.requestId
    });
  };
};

/**
 * Validate request body with Zod schema
 */
export const validateBody = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.errors,
          requestId: (req as AuthenticatedRequest).requestId
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Validation service error',
        requestId: (req as AuthenticatedRequest).requestId
      });
    }
  };
};

/**
 * Validate query parameters with Zod schema
 */
export const validateQuery = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Query validation error',
          details: error.errors,
          requestId: (req as AuthenticatedRequest).requestId
        });
      }
      
      return res.status(500).json({
        success: false,
        error: 'Validation service error',
        requestId: (req as AuthenticatedRequest).requestId
      });
    }
  };
};

/**
 * Check tenant feature access
 */
export const requireFeature = (featureName: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.tenant) {
      return res.status(400).json({
        success: false,
        error: 'Tenant context required',
        requestId: req.requestId
      });
    }
    
    const hasFeature = req.tenant.features[featureName] === true;
    
    if (!hasFeature) {
      return res.status(403).json({
        success: false,
        error: `Feature '${featureName}' not available on current plan`,
        requestId: req.requestId
      });
    }
    
    next();
  };
};

/**
 * Rate limiting by user ID
 */
export const rateLimitByUser = (windowMs: number, max: number) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip rate limiting if not authenticated
    }
    
    const key = `rateLimit:user:${req.user.id}:${Math.floor(Date.now() / windowMs)}`;
    const current = await redis.incr(key);
    
    if (current === 1) {
      await redis.expire(key, Math.ceil(windowMs / 1000));
    }
    
    if (current > max) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(windowMs / 1000),
        requestId: req.requestId
      });
    }
    
    next();
  };
};