/**
 * Authentication Login Route
 * 
 * Handles user login via Stytch authentication.
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createStytchAuthService } from '../../../services/auth.service'
import { LoginRequest, LoginResponse } from 'shared-types'

/**
 * POST /auth/login
 * 
 * Authenticate user with email and password
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { email, password, organizationId, redirectUrl } = (req.body as any) as LoginRequest

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and password are required',
      })
    }

    // Create auth service
    const authService = createStytchAuthService()

    // Authenticate user
    const result = await authService.createSession(email, password)

    if (!result.isValid || !result.user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: result.error || 'Invalid credentials',
      })
    }

    // Check organization access if specified
    if (organizationId && !authService.canAccessOrganization(result.user, organizationId)) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'User cannot access the specified organization',
      })
    }

    // Create response
    const response: LoginResponse = {
      sessionToken: result.user.sessionId,
      user: result.user,
      redirectUrl,
    }

    // Set secure cookie with session token
    res.cookie('stytch_session', result.user.sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    })

    return res.status(200).json(response)
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred during login',
    })
  }
}
