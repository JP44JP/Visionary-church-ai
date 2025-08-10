// Error Handling Middleware
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../app';
import { AuthenticatedRequest } from './auth';

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method,
    requestId: req.requestId
  });
};

/**
 * Global error handler
 */
export const errorHandler = (
  error: Error,
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let details: any = undefined;
  
  // Log error details
  const errorContext = {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    tenantId: req.tenant?.id,
    requestId: req.requestId,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  };
  
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    code = error.code || 'APP_ERROR';
    
    // Log operational errors as warnings, programming errors as errors
    if (error.isOperational) {
      logger.warn('Operational error:', errorContext);
    } else {
      logger.error('Programming error:', errorContext);
    }
  } else {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation error';
      code = 'VALIDATION_ERROR';
      details = (error as any).details;
    } else if (error.name === 'JsonWebTokenError') {
      statusCode = 401;
      message = 'Invalid token';
      code = 'INVALID_TOKEN';
    } else if (error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Token expired';
      code = 'TOKEN_EXPIRED';
    } else if (error.name === 'MulterError') {
      statusCode = 400;
      message = 'File upload error';
      code = 'FILE_UPLOAD_ERROR';
      
      // Handle specific multer errors
      if ((error as any).code === 'LIMIT_FILE_SIZE') {
        message = 'File too large';
      } else if ((error as any).code === 'LIMIT_UNEXPECTED_FILE') {
        message = 'Unexpected file field';
      }
    } else if (error.message?.includes('ECONNREFUSED')) {
      statusCode = 503;
      message = 'Database connection failed';
      code = 'DATABASE_CONNECTION_ERROR';
    } else if (error.message?.includes('duplicate key value')) {
      statusCode = 409;
      message = 'Resource already exists';
      code = 'DUPLICATE_RESOURCE';
    } else if (error.message?.includes('violates foreign key constraint')) {
      statusCode = 400;
      message = 'Invalid reference';
      code = 'FOREIGN_KEY_VIOLATION';
    }
    
    // Log unexpected errors as errors
    logger.error('Unexpected error:', errorContext);
  }
  
  // Don't expose internal error details in production
  const errorResponse: any = {
    success: false,
    error: message,
    code,
    requestId: req.requestId
  };
  
  if (details) {
    errorResponse.details = details;
  }
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
    errorResponse.path = req.path;
    errorResponse.method = req.method;
  }
  
  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Handle uncaught exceptions
 */
export const handleUncaughtException = () => {
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', {
      error: error.message,
      stack: error.stack
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Handle unhandled promise rejections
 */
export const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error('Unhandled Rejection:', {
      reason: reason?.message || reason,
      stack: reason?.stack,
      promise: promise.toString()
    });
    
    // Graceful shutdown
    process.exit(1);
  });
};

/**
 * Database error handler
 */
export const handleDatabaseError = (error: any): AppError => {
  if (error.code === 'P2002') {
    // Unique constraint violation
    return new AppError('Resource already exists', 409);
  } else if (error.code === 'P2003') {
    // Foreign key constraint violation
    return new AppError('Invalid reference', 400);
  } else if (error.code === 'P2025') {
    // Record not found
    return new AppError('Resource not found', 404);
  } else if (error.code === 'P1001') {
    // Connection error
    return new AppError('Database connection failed', 503);
  } else if (error.code === 'P2004') {
    // Constraint failed
    return new AppError('Data validation failed', 400);
  }
  
  // Generic database error
  return new AppError('Database operation failed', 500);
};

/**
 * Rate limit error handler
 */
export const handleRateLimitError = (req: AuthenticatedRequest, res: Response) => {
  logger.warn('Rate limit exceeded:', {
    ip: req.ip,
    path: req.path,
    userId: req.user?.id,
    tenantId: req.tenant?.id
  });
  
  res.status(429).json({
    success: false,
    error: 'Too many requests',
    code: 'RATE_LIMIT_EXCEEDED',
    requestId: req.requestId
  });
};

/**
 * CORS error handler
 */
export const handleCorsError = (req: Request, res: Response) => {
  logger.warn('CORS error:', {
    origin: req.get('Origin'),
    path: req.path,
    method: req.method
  });
  
  res.status(403).json({
    success: false,
    error: 'CORS policy violation',
    code: 'CORS_ERROR'
  });
};