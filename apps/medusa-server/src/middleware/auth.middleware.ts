/**
 * Authentication Middleware
 * 
 * Handles JWT token validation and user context injection for protected routes.
 * Integrates with Stytch authentication service.
 */

import { StytchAuthService, createStytchAuthService } from '../services/auth.service'
import { UserRole, Permission, StytchUserContext } from 'shared-types'


/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  required?: boolean
  roles?: UserRole[]
  permissions?: Permission[]
  organizationAccess?: boolean
  roasterAccess?: boolean
}

/**
 * Create authentication middleware
 */
export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const authService = createStytchAuthService()

  return async (req: any, res: any, next: any) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.authorization
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

      // If no token and auth is not required, continue
      if (!token && !options.required) {
        req.authService = authService
        return next()
      }

      // If no token but auth is required, return unauthorized
      if (!token && options.required) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'No authentication token provided',
        })
      }

      // Validate token
      const validation = await authService.validateToken(token!)
      
      if (!validation.isValid || !validation.user) {
        return res.status(401).json({
          error: 'Invalid token',
          message: validation.error || 'Token validation failed',
        })
      }

      // Add user and auth service to request
      req.user = validation.user
      req.authService = authService

      // Check role requirements
      if (options.roles && options.roles.length > 0) {
        const hasRequiredRole = options.roles.some(role => 
          authService.hasRole(validation.user!, role)
        )
        
        if (!hasRequiredRole) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'User does not have required role',
            required_roles: options.roles,
            user_roles: validation.user.roles,
          })
        }
      }

      // Check permission requirements
      if (options.permissions && options.permissions.length > 0) {
        const hasRequiredPermission = options.permissions.some(permission => 
          authService.hasPermission(validation.user!, permission)
        )
        
        if (!hasRequiredPermission) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'User does not have required permission',
            required_permissions: options.permissions,
            user_permissions: authService.getUserPermissions(validation.user),
          })
        }
      }

      // Check organization access
      if (options.organizationAccess) {
        const organizationId = req.params.organizationId || req.body.organizationId
        
        if (organizationId && !authService.canAccessOrganization(validation.user, organizationId)) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'User cannot access this organization',
            organization_id: organizationId,
          })
        }
      }

      // Check roaster access
      if (options.roasterAccess) {
        const roasterId = req.params.roasterId || req.body.roasterId
        
        if (roasterId && !authService.canAccessRoaster(validation.user, roasterId)) {
          return res.status(403).json({
            error: 'Access denied',
            message: 'User cannot access this roaster',
            roaster_id: roasterId,
          })
        }
      }

      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      return res.status(500).json({
        error: 'Authentication error',
        message: 'Internal server error during authentication',
      })
    }
  }
}

/**
 * Middleware for routes that require authentication
 */
export const requireAuth = createAuthMiddleware({ required: true })

/**
 * Middleware for routes that require platform admin role
 */
export const requirePlatformAdmin = createAuthMiddleware({
  required: true,
  roles: [UserRole.PLATFORM_ADMIN],
})

/**
 * Middleware for routes that require organization admin role
 */
export const requireOrganizationAdmin = createAuthMiddleware({
  required: true,
  roles: [UserRole.ORGANIZATION_ADMIN, UserRole.PLATFORM_ADMIN],
  organizationAccess: true,
})

/**
 * Middleware for routes that require campaign manager role
 */
export const requireCampaignManager = createAuthMiddleware({
  required: true,
  roles: [UserRole.CAMPAIGN_MANAGER, UserRole.ORGANIZATION_ADMIN, UserRole.PLATFORM_ADMIN],
  organizationAccess: true,
})

/**
 * Middleware for routes that require roaster admin role
 */
export const requireRoasterAdmin = createAuthMiddleware({
  required: true,
  roles: [UserRole.ROASTER_ADMIN, UserRole.PLATFORM_ADMIN],
  roasterAccess: true,
})

/**
 * Middleware for routes that require roaster staff role
 */
export const requireRoasterStaff = createAuthMiddleware({
  required: true,
  roles: [UserRole.ROASTER_STAFF, UserRole.ROASTER_ADMIN, UserRole.PLATFORM_ADMIN],
  roasterAccess: true,
})

/**
 * Middleware for customer routes
 */
export const requireCustomer = createAuthMiddleware({
  required: true,
  roles: [UserRole.CUSTOMER, UserRole.ORGANIZATION_ADMIN, UserRole.CAMPAIGN_MANAGER, UserRole.PLATFORM_ADMIN],
})

/**
 * Optional authentication middleware (doesn't require auth but adds user context if available)
 */
export const optionalAuth = createAuthMiddleware({ required: false })

/**
 * Helper function to check if user has specific permission in route handler
 */
export function checkPermission(req: any, permission: Permission): boolean {
  if (!req.user || !req.authService) {
    return false
  }
  
  return req.authService.hasPermission(req.user, permission)
}

/**
 * Helper function to check if user has specific role in route handler
 */
export function checkRole(req: any, role: UserRole): boolean {
  if (!req.user || !req.authService) {
    return false
  }
  
  return req.authService.hasRole(req.user, role)
}

/**
 * Helper function to get user permissions in route handler
 */
export function getUserPermissions(req: any): Permission[] {
  if (!req.user || !req.authService) {
    return []
  }
  
  return req.authService.getUserPermissions(req.user)
}
