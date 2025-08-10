import { NextRequest } from 'next/server'
import { createServerSupabaseClient } from './supabase'
import { AppError } from '@/types/index'

export interface AuthUser {
  id: string
  email: string
  role: string
  tenant_id: string
}

export interface AuthContext {
  user: AuthUser
  tenantSchema: string
}

export async function requireAuth(request: NextRequest): Promise<AuthContext> {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 'UNAUTHORIZED', 401)
    }

    const token = authHeader.substring(7)
    
    // Verify the JWT token
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      throw new AppError('Invalid or expired token', 'UNAUTHORIZED', 401)
    }

    // Get user details from tenant_users table
    const { data: tenantUser, error: userError } = await supabase
      .from('shared.tenant_users')
      .select(`
        id,
        email,
        role,
        tenant_id,
        is_active,
        tenants:tenant_id(schema_name, status)
      `)
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (userError || !tenantUser) {
      throw new AppError('User not found or inactive', 'UNAUTHORIZED', 401)
    }

    // Check if tenant is active
    if (tenantUser.tenants?.status !== 'active') {
      throw new AppError('Tenant account is not active', 'TENANT_INACTIVE', 403)
    }

    const authUser: AuthUser = {
      id: tenantUser.id,
      email: tenantUser.email,
      role: tenantUser.role,
      tenant_id: tenantUser.tenant_id
    }

    return {
      user: authUser,
      tenantSchema: tenantUser.tenants?.schema_name || `tenant_${tenantUser.tenant_id.replace(/-/g, '_')}`
    }
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Auth error:', error)
    throw new AppError('Authentication failed', 'AUTH_ERROR', 401)
  }
}

export async function requireRole(user: AuthUser, allowedRoles: string[]): Promise<void> {
  if (!allowedRoles.includes(user.role)) {
    throw new AppError(
      `Access denied. Required roles: ${allowedRoles.join(', ')}`,
      'INSUFFICIENT_PERMISSIONS',
      403
    )
  }
}

export async function getTenantFromRequest(request: NextRequest): Promise<string> {
  // Extract tenant information from request
  // This could be from subdomain, header, or path parameter
  
  // Method 1: From subdomain
  const host = request.headers.get('host')
  if (host) {
    const subdomain = host.split('.')[0]
    if (subdomain && subdomain !== 'www' && subdomain !== 'api') {
      return subdomain
    }
  }

  // Method 2: From X-Tenant header
  const tenantHeader = request.headers.get('x-tenant')
  if (tenantHeader) {
    return tenantHeader
  }

  // Method 3: From path parameter (e.g., /api/tenant/{slug}/...)
  const pathname = new URL(request.url).pathname
  const tenantMatch = pathname.match(/^\/api\/tenant\/([^\/]+)/)
  if (tenantMatch) {
    return tenantMatch[1]
  }

  throw new AppError('Tenant not identified', 'TENANT_NOT_FOUND', 400)
}

export async function getTenantSchema(tenantSlug: string): Promise<string> {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: tenant, error } = await supabase
      .from('shared.tenants')
      .select('schema_name, status')
      .eq('subdomain', tenantSlug)
      .single()

    if (error || !tenant) {
      throw new AppError('Tenant not found', 'TENANT_NOT_FOUND', 404)
    }

    if (tenant.status !== 'active') {
      throw new AppError('Tenant is not active', 'TENANT_INACTIVE', 403)
    }

    return tenant.schema_name
  } catch (error) {
    if (error instanceof AppError) throw error
    console.error('Error getting tenant schema:', error)
    throw new AppError('Failed to get tenant information', 'TENANT_ERROR', 500)
  }
}

// Optional authentication (doesn't throw if no auth)
export async function optionalAuth(request: NextRequest): Promise<AuthContext | null> {
  try {
    return await requireAuth(request)
  } catch (error) {
    // Return null if authentication fails
    return null
  }
}

// Check if user has specific permission
export function hasPermission(user: AuthUser, permission: string): boolean {
  // Define role hierarchies and permissions
  const rolePermissions: Record<string, string[]> = {
    'super_admin': ['*'], // All permissions
    'admin': [
      'sequences.create',
      'sequences.edit',
      'sequences.delete',
      'sequences.view',
      'templates.create',
      'templates.edit',
      'templates.delete',
      'templates.view',
      'analytics.view',
      'users.manage'
    ],
    'church_admin': [
      'sequences.create',
      'sequences.edit',
      'sequences.view',
      'templates.create',
      'templates.edit',
      'templates.view',
      'analytics.view'
    ],
    'pastor': [
      'sequences.create',
      'sequences.edit',
      'sequences.view',
      'templates.view',
      'analytics.view'
    ],
    'staff': [
      'sequences.view',
      'templates.view',
      'analytics.view'
    ],
    'volunteer': [
      'sequences.view',
      'templates.view'
    ]
  }

  const userPermissions = rolePermissions[user.role] || []
  
  // Check for wildcard permission
  if (userPermissions.includes('*')) {
    return true
  }

  return userPermissions.includes(permission)
}

export async function requirePermission(user: AuthUser, permission: string): Promise<void> {
  if (!hasPermission(user, permission)) {
    throw new AppError(
      `Access denied. Missing permission: ${permission}`,
      'INSUFFICIENT_PERMISSIONS',
      403
    )
  }
}

// Rate limiting helpers
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60 * 60 * 1000 // 1 hour
): Promise<void> {
  const now = Date.now()
  const key = `rate_limit_${identifier}`
  const current = rateLimitStore.get(key)

  if (current) {
    if (now < current.resetTime) {
      if (current.count >= limit) {
        throw new AppError('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', 429)
      }
      current.count++
    } else {
      // Reset the window
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
    }
  } else {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
  }
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of rateLimitStore.entries()) {
    if (now >= value.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}, 60 * 60 * 1000) // Clean up every hour

// API key authentication for webhooks
export async function authenticateApiKey(request: NextRequest): Promise<AuthContext> {
  const apiKey = request.headers.get('x-api-key')
  if (!apiKey) {
    throw new AppError('API key required', 'API_KEY_REQUIRED', 401)
  }

  // In a real implementation, you'd validate this against your API keys table
  // For now, we'll just check against environment variables
  const validApiKey = process.env.API_KEY
  if (!validApiKey || apiKey !== validApiKey) {
    throw new AppError('Invalid API key', 'INVALID_API_KEY', 401)
  }

  // Return a system user context
  return {
    user: {
      id: 'system',
      email: 'system@api',
      role: 'system',
      tenant_id: 'system'
    },
    tenantSchema: 'system'
  }
}

// JWT token generation for service-to-service communication
export function generateServiceToken(payload: Record<string, any>): string {
  // This would use a proper JWT library in production
  // For now, returning a basic encoded payload
  return Buffer.from(JSON.stringify({
    ...payload,
    iat: Date.now(),
    exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  })).toString('base64')
}

export function verifyServiceToken(token: string): Record<string, any> {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    
    if (payload.exp && Date.now() > payload.exp) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    throw new AppError('Invalid service token', 'INVALID_SERVICE_TOKEN', 401)
  }
}