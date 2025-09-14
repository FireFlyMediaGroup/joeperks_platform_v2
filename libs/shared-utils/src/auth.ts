/**
 * Shared Authentication Utilities
 * 
 * Common authentication helpers used across frontend and backend applications.
 */

import {
  UserRole,
  Permission,
  StytchUserContext,
  AuthSession,
  hasRole as hasRoleUtil,
  hasPermission as hasPermissionUtil,
  getUserPermissions as getUserPermissionsUtil,
  canAccessOrganization as canAccessOrganizationUtil,
  canAccessRoaster as canAccessRoasterUtil
} from 'shared-types'

/**
 * Check if user has specific role
 */
export function hasRole(user: StytchUserContext | null | undefined, role: UserRole): boolean {
  if (!user) return false
  return hasRoleUtil(user, role)
}

/**
 * Check if user has specific permission
 */
export function hasPermission(user: StytchUserContext | null | undefined, permission: Permission): boolean {
  if (!user) return false
  return hasPermissionUtil(user, permission)
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: StytchUserContext | null | undefined): Permission[] {
  if (!user) return []
  return getUserPermissionsUtil(user)
}

/**
 * Check if user can access organization
 */
export function canAccessOrganization(user: StytchUserContext | null | undefined, organizationId: string): boolean {
  if (!user) return false
  return canAccessOrganizationUtil(user, organizationId)
}

/**
 * Check if user can access roaster
 */
export function canAccessRoaster(user: StytchUserContext | null | undefined, roasterId: string): boolean {
  if (!user) return false
  return canAccessRoasterUtil(user, roasterId)
}

/**
 * Check if user is platform admin
 */
export function isPlatformAdmin(user: StytchUserContext | null | undefined): boolean {
  return hasRole(user, UserRole.PLATFORM_ADMIN)
}

/**
 * Check if user is organization admin
 */
export function isOrganizationAdmin(user: StytchUserContext | null | undefined): boolean {
  return hasRole(user, UserRole.ORGANIZATION_ADMIN) || isPlatformAdmin(user)
}

/**
 * Check if user is roaster admin
 */
export function isRoasterAdmin(user: StytchUserContext | null | undefined): boolean {
  return hasRole(user, UserRole.ROASTER_ADMIN) || isPlatformAdmin(user)
}

/**
 * Check if user is customer
 */
export function isCustomer(user: StytchUserContext | null | undefined): boolean {
  return hasRole(user, UserRole.CUSTOMER)
}

/**
 * Get user's primary role (highest privilege)
 */
export function getPrimaryRole(user: StytchUserContext | null | undefined): UserRole | null {
  if (!user || !user.roles.length) return null

  // Priority order (highest to lowest)
  const rolePriority = [
    UserRole.PLATFORM_ADMIN,
    UserRole.ORGANIZATION_ADMIN,
    UserRole.ROASTER_ADMIN,
    UserRole.CAMPAIGN_MANAGER,
    UserRole.ROASTER_STAFF,
    UserRole.ORGANIZATION_VIEWER,
    UserRole.CUSTOMER,
  ]

  for (const role of rolePriority) {
    if (user.roles.includes(role)) {
      return role
    }
  }

  return user.roles[0] // Fallback to first role
}

/**
 * Get user's display name based on role
 */
export function getUserDisplayRole(user: StytchUserContext | null | undefined): string {
  const primaryRole = getPrimaryRole(user)
  
  switch (primaryRole) {
    case UserRole.PLATFORM_ADMIN:
      return 'Platform Administrator'
    case UserRole.ORGANIZATION_ADMIN:
      return 'Organization Administrator'
    case UserRole.CAMPAIGN_MANAGER:
      return 'Campaign Manager'
    case UserRole.ORGANIZATION_VIEWER:
      return 'Organization Member'
    case UserRole.ROASTER_ADMIN:
      return 'Roaster Administrator'
    case UserRole.ROASTER_STAFF:
      return 'Roaster Staff'
    case UserRole.CUSTOMER:
      return 'Customer'
    default:
      return 'User'
  }
}

/**
 * Check if session is expired
 */
export function isSessionExpired(user: StytchUserContext | null | undefined): boolean {
  if (!user) return true
  return Date.now() > user.expiresAt
}

/**
 * Check if session is expiring soon (within 5 minutes)
 */
export function isSessionExpiringSoon(user: StytchUserContext | null | undefined): boolean {
  if (!user) return true
  const fiveMinutes = 5 * 60 * 1000
  return Date.now() > (user.expiresAt - fiveMinutes)
}

/**
 * Format session expiry time
 */
export function formatSessionExpiry(user: StytchUserContext | null | undefined): string {
  if (!user) return 'Unknown'
  
  const expiryDate = new Date(user.expiresAt)
  return expiryDate.toLocaleString()
}

/**
 * Get redirect URL based on user role
 */
export function getDefaultRedirectUrl(user: StytchUserContext | null | undefined): string {
  const primaryRole = getPrimaryRole(user)
  
  switch (primaryRole) {
    case UserRole.PLATFORM_ADMIN:
      return '/admin'
    case UserRole.ORGANIZATION_ADMIN:
    case UserRole.CAMPAIGN_MANAGER:
    case UserRole.ORGANIZATION_VIEWER:
      return '/dashboard'
    case UserRole.ROASTER_ADMIN:
    case UserRole.ROASTER_STAFF:
      return '/portal'
    case UserRole.CUSTOMER:
    default:
      return '/storefront'
  }
}

/**
 * Create empty auth session
 */
export function createEmptyAuthSession(): AuthSession {
  return {
    user: null as any,
    permissions: [],
    isAuthenticated: false,
    isLoading: false,
  }
}

/**
 * Create auth session from user context
 */
export function createAuthSession(user: StytchUserContext, isLoading = false): AuthSession {
  return {
    user,
    permissions: getUserPermissions(user),
    isAuthenticated: true,
    isLoading,
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generate secure random string for state/nonce
 */
export function generateSecureRandomString(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Storage keys for authentication data
 */
export const AUTH_STORAGE_KEYS = {
  SESSION_TOKEN: 'stytch_session_token',
  USER_DATA: 'stytch_user_data',
  REDIRECT_URL: 'auth_redirect_url',
  STATE: 'auth_state',
} as const
