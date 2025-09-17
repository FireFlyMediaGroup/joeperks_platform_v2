/**
 * Authentication Validation Route
 * 
 * Validates JWT tokens and returns user context.
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createStytchAuthService } from '../../../services/auth.service'

/**
 * POST /auth/validate
 * 
 * Validate a JWT token and return user context
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { token } = (req.body as any)

    if (!token) {
      return res.status(400).json({
        error: 'Missing token',
        message: 'Token is required for validation',
      })
    }

    // Create auth service
    const authService = createStytchAuthService()

    // Validate token
    const result = await authService.validateToken(token)

    if (!result.isValid || !result.user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: result.error || 'Token validation failed',
      })
    }

    // Return user context and permissions
    return res.status(200).json({
      user: result.user,
      permissions: authService.getUserPermissions(result.user),
      isValid: true,
    })
  } catch (error) {
    console.error('Token validation error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during token validation',
    })
  }
}

/**
 * GET /auth/validate
 * 
 * Validate session from cookie
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const sessionToken = req.cookies?.stytch_session

    if (!sessionToken) {
      return res.status(401).json({
        error: 'No session',
        message: 'No session token found',
        isValid: false,
      })
    }

    // Create auth service
    const authService = createStytchAuthService()

    // Validate session token
    const result = await authService.validateToken(sessionToken)

    if (!result.isValid || !result.user) {
      // Clear invalid session cookie
      res.clearCookie('stytch_session')
      
      return res.status(401).json({
        error: 'Invalid session',
        message: result.error || 'Session validation failed',
        isValid: false,
      })
    }

    // Return user context and permissions
    return res.status(200).json({
      user: result.user,
      permissions: authService.getUserPermissions(result.user),
      isValid: true,
    })
  } catch (error) {
    console.error('Session validation error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during session validation',
    })
  }
}
