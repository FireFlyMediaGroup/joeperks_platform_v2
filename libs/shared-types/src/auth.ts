/**
 * Authentication and Authorization Types
 * 
 * Defines the role-based access control (RBAC) system for the Joe Perks platform.
 * These types are shared across all applications and services.
 */

/**
 * User roles in the Joe Perks platform
 * Maps to Stytch roles and permissions
 */
export enum UserRole {
  // Platform Administration
  PLATFORM_ADMIN = 'platform_admin',
  
  // Organization Roles
  ORGANIZATION_ADMIN = 'organization_admin',
  CAMPAIGN_MANAGER = 'campaign_manager',
  ORGANIZATION_VIEWER = 'organization_viewer',
  
  // Roaster Roles
  ROASTER_ADMIN = 'roaster_admin',
  ROASTER_STAFF = 'roaster_staff',
  
  // Customer Role
  CUSTOMER = 'customer',
}

/**
 * Permissions for different actions in the platform
 */
export enum Permission {
  // Platform Management
  MANAGE_PLATFORM = 'manage_platform',
  VIEW_PLATFORM_ANALYTICS = 'view_platform_analytics',
  MANAGE_USERS = 'manage_users',
  
  // Organization Management
  MANAGE_ORGANIZATION = 'manage_organization',
  CREATE_CAMPAIGNS = 'create_campaigns',
  MANAGE_CAMPAIGNS = 'manage_campaigns',
  VIEW_ORGANIZATION_ANALYTICS = 'view_organization_analytics',
  INVITE_ORGANIZATION_MEMBERS = 'invite_organization_members',
  
  // Roaster Management
  MANAGE_ROASTER = 'manage_roaster',
  MANAGE_PRODUCTS = 'manage_products',
  FULFILL_ORDERS = 'fulfill_orders',
  VIEW_ROASTER_ANALYTICS = 'view_roaster_analytics',
  MANAGE_PARTNERSHIPS = 'manage_partnerships',
  
  // Customer Actions
  PLACE_ORDERS = 'place_orders',
  VIEW_ORDER_HISTORY = 'view_order_history',
  MANAGE_PROFILE = 'manage_profile',
}

/**
 * Role to permissions mapping
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.PLATFORM_ADMIN]: [
    Permission.MANAGE_PLATFORM,
    Permission.VIEW_PLATFORM_ANALYTICS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ORGANIZATION,
    Permission.CREATE_CAMPAIGNS,
    Permission.MANAGE_CAMPAIGNS,
    Permission.VIEW_ORGANIZATION_ANALYTICS,
    Permission.INVITE_ORGANIZATION_MEMBERS,
    Permission.MANAGE_ROASTER,
    Permission.MANAGE_PRODUCTS,
    Permission.FULFILL_ORDERS,
    Permission.VIEW_ROASTER_ANALYTICS,
    Permission.MANAGE_PARTNERSHIPS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.ORGANIZATION_ADMIN]: [
    Permission.MANAGE_ORGANIZATION,
    Permission.CREATE_CAMPAIGNS,
    Permission.MANAGE_CAMPAIGNS,
    Permission.VIEW_ORGANIZATION_ANALYTICS,
    Permission.INVITE_ORGANIZATION_MEMBERS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.CAMPAIGN_MANAGER]: [
    Permission.CREATE_CAMPAIGNS,
    Permission.MANAGE_CAMPAIGNS,
    Permission.VIEW_ORGANIZATION_ANALYTICS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.ORGANIZATION_VIEWER]: [
    Permission.VIEW_ORGANIZATION_ANALYTICS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.ROASTER_ADMIN]: [
    Permission.MANAGE_ROASTER,
    Permission.MANAGE_PRODUCTS,
    Permission.FULFILL_ORDERS,
    Permission.VIEW_ROASTER_ANALYTICS,
    Permission.MANAGE_PARTNERSHIPS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.ROASTER_STAFF]: [
    Permission.FULFILL_ORDERS,
    Permission.VIEW_ROASTER_ANALYTICS,
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
  
  [UserRole.CUSTOMER]: [
    Permission.PLACE_ORDERS,
    Permission.VIEW_ORDER_HISTORY,
    Permission.MANAGE_PROFILE,
  ],
}

/**
 * User context from Stytch JWT token
 */
export interface StytchUserContext {
  userId: string
  email: string
  roles: UserRole[]
  organizationId?: string
  roasterId?: string
  sessionId: string
  issuedAt: number
  expiresAt: number
}

/**
 * Authentication session data
 */
export interface AuthSession {
  user: StytchUserContext
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string
  password?: string
  organizationId?: string
  redirectUrl?: string
}

/**
 * Login response
 */
export interface LoginResponse {
  sessionToken: string
  user: StytchUserContext
  redirectUrl?: string
}

/**
 * Organization invitation data
 */
export interface OrganizationInvite {
  email: string
  role: UserRole
  organizationId: string
  invitedBy: string
  expiresAt: Date
}

/**
 * Roaster invitation data
 */
export interface RoasterInvite {
  email: string
  role: UserRole
  roasterId: string
  invitedBy: string
  expiresAt: Date
}

/**
 * Type guard to check if user has specific role
 */
export function hasRole(user: StytchUserContext, role: UserRole): boolean {
  return user.roles.includes(role)
}

/**
 * Type guard to check if user has specific permission
 */
export function hasPermission(user: StytchUserContext, permission: Permission): boolean {
  return user.roles.some(role => ROLE_PERMISSIONS[role].includes(permission))
}

/**
 * Get all permissions for a user based on their roles
 */
export function getUserPermissions(user: StytchUserContext): Permission[] {
  const permissions = new Set<Permission>()
  
  user.roles.forEach(role => {
    ROLE_PERMISSIONS[role].forEach(permission => {
      permissions.add(permission)
    })
  })
  
  return Array.from(permissions)
}

/**
 * Check if user can access a specific organization
 */
export function canAccessOrganization(user: StytchUserContext, organizationId: string): boolean {
  // Platform admins can access any organization
  if (hasRole(user, UserRole.PLATFORM_ADMIN)) {
    return true
  }
  
  // Users can only access their own organization
  return user.organizationId === organizationId
}

/**
 * Check if user can access a specific roaster
 */
export function canAccessRoaster(user: StytchUserContext, roasterId: string): boolean {
  // Platform admins can access any roaster
  if (hasRole(user, UserRole.PLATFORM_ADMIN)) {
    return true
  }
  
  // Users can only access their own roaster
  return user.roasterId === roasterId
}
