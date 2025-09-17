/**
 * Authentication Logout Route
 * 
 * Handles user logout and session revocation.
 */

import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createStytchAuthService } from '../../../services/auth.service'

/**
 * POST /auth/logout
 * 
 * Logout user and revoke session
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { token } = (req.body as any)
    const sessionToken = token || req.cookies?.stytch_session

    if (!sessionToken) {
      // Clear cookie anyway and return success
      res.clearCookie('stytch_session')
      return res.status(200).json({
        message: 'Logged out successfully',
        success: true,
      })
    }

    // Create auth service
    const authService = createStytchAuthService()

    // Revoke session
    const revoked = await authService.revokeSession(sessionToken)

    // Clear session cookie
    res.clearCookie('stytch_session')

    if (!revoked) {
      console.warn('Failed to revoke session, but clearing cookie anyway')
    }

    return res.status(200).json({
      message: 'Logged out successfully',
      success: true,
    })
  } catch (error) {
    console.error('Logout error:', error)
    
    // Clear cookie even if there's an error
    res.clearCookie('stytch_session')
    
    return res.status(200).json({
      message: 'Logged out successfully',
      success: true,
    })
  }
}
