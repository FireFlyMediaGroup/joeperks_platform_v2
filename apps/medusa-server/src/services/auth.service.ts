/**
 * Stytch Authentication Service
 * 
 * Handles authentication and authorization for the Joe Perks platform
 * using Stytch as the identity provider.
 */

import { Client as StytchClient } from 'stytch'
import {
  UserRole,
  Permission,
  StytchUserContext,
  ROLE_PERMISSIONS,
  hasRole,
  hasPermission,
  getUserPermissions,
  canAccessOrganization,
  canAccessRoaster
} from 'shared-types'

export interface StytchConfig {
  projectId: string
  secret: string
  environment: 'test' | 'live'
}

export interface TokenValidationResult {
  isValid: boolean
  user?: StytchUserContext
  error?: string
}

export interface SessionValidationResult {
  isValid: boolean
  user?: StytchUserContext
  error?: string
}

/**
 * Stytch Authentication Service
 * 
 * Provides authentication and authorization functionality using Stytch.
 * Handles JWT token validation, session management, and RBAC.
 */
export class StytchAuthService {
  private client: StytchClient
  private config: StytchConfig

  constructor(config: StytchConfig) {
    this.config = config
    this.client = new StytchClient({
      project_id: config.projectId,
      secret: config.secret,
      env: config.environment,
    })
  }

  /**
   * Validate a Stytch JWT token
   */
  async validateToken(token: string): Promise<TokenValidationResult> {
    try {
      const response = await this.client.sessions.authenticate({
        session_token: token,
      })

      if (response.status_code !== 200) {
        return {
          isValid: false,
          error: 'Invalid token',
        }
      }

      const user = this.mapStytchUserToContext(response)
      
      return {
        isValid: true,
        user,
      }
    } catch (error) {
      console.error('Token validation error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Token validation failed',
      }
    }
  }

  /**
   * Validate a Stytch session
   */
  async validateSession(sessionId: string): Promise<SessionValidationResult> {
    try {
      const response = await this.client.sessions.get({
        user_id: sessionId,
      })

      if (response.status_code !== 200) {
        return {
          isValid: false,
          error: 'Invalid session',
        }
      }

      const user = this.mapStytchUserToContext(response)
      
      return {
        isValid: true,
        user,
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Session validation failed',
      }
    }
  }

  /**
   * Create a new user session
   */
  async createSession(email: string, password: string): Promise<TokenValidationResult> {
    try {
      const response = await this.client.passwords.authenticate({
        email,
        password,
      })

      if (response.status_code !== 200) {
        return {
          isValid: false,
          error: 'Authentication failed',
        }
      }

      const user = this.mapStytchUserToContext(response)
      
      return {
        isValid: true,
        user,
      }
    } catch (error) {
      console.error('Session creation error:', error)
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }
    }
  }

  /**
   * Revoke a user session
   */
  async revokeSession(sessionToken: string): Promise<boolean> {
    try {
      const response = await this.client.sessions.revoke({
        session_token: sessionToken,
      })

      return response.status_code === 200
    } catch (error) {
      console.error('Session revocation error:', error)
      return false
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(user: StytchUserContext, role: UserRole): boolean {
    return hasRole(user, role)
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(user: StytchUserContext, permission: Permission): boolean {
    return hasPermission(user, permission)
  }

  /**
   * Get all permissions for a user
   */
  getUserPermissions(user: StytchUserContext): Permission[] {
    return getUserPermissions(user)
  }

  /**
   * Check if user can access organization
   */
  canAccessOrganization(user: StytchUserContext, organizationId: string): boolean {
    return canAccessOrganization(user, organizationId)
  }

  /**
   * Check if user can access roaster
   */
  canAccessRoaster(user: StytchUserContext, roasterId: string): boolean {
    return canAccessRoaster(user, roasterId)
  }

  /**
   * Map Stytch response to our user context
   */
  private mapStytchUserToContext(response: any): StytchUserContext {
    const user = response.user || response.session?.user
    const session = response.session

    // Extract roles from Stytch custom claims or attributes
    const roles = this.extractRolesFromStytchUser(user)
    
    // Extract organization/roaster IDs from custom attributes
    const organizationId = user.attributes?.organization_id
    const roasterId = user.attributes?.roaster_id

    return {
      userId: user.user_id,
      email: user.emails?.[0]?.email || '',
      roles,
      organizationId,
      roasterId,
      sessionId: session?.session_id || '',
      issuedAt: session?.started_at ? new Date(session.started_at).getTime() : Date.now(),
      expiresAt: session?.expires_at ? new Date(session.expires_at).getTime() : Date.now() + 24 * 60 * 60 * 1000, // 24 hours default
    }
  }

  /**
   * Extract roles from Stytch user data
   * This will need to be customized based on how roles are stored in Stytch
   */
  private extractRolesFromStytchUser(user: any): UserRole[] {
    // Default implementation - customize based on your Stytch setup
    const roles: UserRole[] = []
    
    // Check custom attributes for roles
    if (user.attributes?.roles) {
      const userRoles = Array.isArray(user.attributes.roles) 
        ? user.attributes.roles 
        : [user.attributes.roles]
      
      userRoles.forEach((role: string) => {
        if (Object.values(UserRole).includes(role as UserRole)) {
          roles.push(role as UserRole)
        }
      })
    }
    
    // Default to customer role if no roles specified
    if (roles.length === 0) {
      roles.push(UserRole.CUSTOMER)
    }
    
    return roles
  }
}

/**
 * Create Stytch Auth Service instance
 */
export function createStytchAuthService(): StytchAuthService {
  const config: StytchConfig = {
    projectId: process.env.STYTCH_PROJECT_ID!,
    secret: process.env.STYTCH_SECRET!,
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
  }

  if (!config.projectId || !config.secret) {
    throw new Error('Stytch configuration missing. Please set STYTCH_PROJECT_ID and STYTCH_SECRET environment variables.')
  }

  return new StytchAuthService(config)
}
