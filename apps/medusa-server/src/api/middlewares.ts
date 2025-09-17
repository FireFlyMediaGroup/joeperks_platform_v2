import {
  defineMiddlewares,
  authenticate,
  validateAndTransformBody,
} from "@medusajs/framework/http"
import { PostVendorCreateSchema } from "./vendors/route"
import { PostVendorProductCreateSchema } from "./vendors/products/route"
import { PostVendorIntakeStartSchema, PutVendorIntakeSchema } from "./vendors/intake/route"
import { PostVendorIntakeSubmitSchemaExport as PostVendorIntakeSubmitSchema } from "./vendors/intake/submit/route"

import { MARKETPLACE_MODULE } from "../modules/marketplace"
import MarketplaceModuleService from "../modules/marketplace/service"
import { createStytchAuthService } from "../services/auth.service"

const stytchAuth = (() => {
  try {
    return createStytchAuthService()
  } catch {
    return undefined
  }
})()

const devOrVendorAuth = (allowUnregistered = false) => {
  const baseAuth = authenticate(
    "vendor",
    ["session", "bearer"],
    allowUnregistered ? { allowUnregistered: true } : undefined
  )

  return async (req: any, res: any, next: any) => {
    // Dev-only shortcut: requires ENABLE_DEV_ENDPOINTS and X-Dev-Secret header
    const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
    const expectedSecret = process.env.DEV_ENDPOINT_SECRET
    const providedSecret = (req.get("x-dev-secret") || req.get("X-Dev-Secret")) as string | undefined

    if (devEnabled && expectedSecret && providedSecret === expectedSecret) {
      const auth = req.headers["authorization"] || req.headers["Authorization"]
      if (typeof auth === "string" && auth.startsWith("Bearer dev:")) {
        const token = auth.substring("Bearer ".length) // dev:...
        const parts = token.split(":")
        if (parts.length === 3) {
          const [, kind, id] = parts
          ;(req as any).auth_context = (req as any).auth_context || {}
          if (kind === "identity") {
            ;(req as any).auth_context.auth_identity_id = id
          } else if (kind === "actor") {
            ;(req as any).auth_context.actor_id = id
          }
          return next()
        }
      }
    }

    // If Authorization is a Stytch session token, validate and map without requiring Medusa auth
    try {
      const authHeader = (req.headers["authorization"] || req.headers["Authorization"]) as string | undefined
      if (authHeader && authHeader.startsWith("Bearer ") && !authHeader.startsWith("Bearer dev:")) {
        const token = authHeader.slice("Bearer ".length)
        if (stytchAuth) {
          const result = await stytchAuth.validateToken(token)
          if (result.isValid && result.user?.email) {
            const anyReq = req as any
            // Expose minimal user info for downstream mapping
            anyReq.user = { email: result.user.email, userId: result.user.userId }
            // Map to vendor admin by email
            if (anyReq.scope?.resolve) {
              const marketplace: MarketplaceModuleService = anyReq.scope.resolve(MARKETPLACE_MODULE)
              const admins = await (marketplace as any).listVendorAdmins({ email: result.user.email })
              const admin = admins?.[0]
              anyReq.auth_context = anyReq.auth_context || {}
              if (admin?.id) {
                anyReq.auth_context.actor_id = admin.id
              } else if (!anyReq.auth_context.auth_identity_id && result.user.userId) {
                anyReq.auth_context.auth_identity_id = result.user.userId
              }
            }
            return next()
          }
        }
      }
    } catch (e) {
      // Ignore and fall back to base auth
    }


    // Fallback to configured auth strategies, but map Stytch user -> vendor actor after auth
    return (baseAuth as any)(req as any, res as any, async () => {
      try {
        const anyReq = req as any
        // If Medusa auth didn't set actor_id but we have a verified Stytch user, map by email
        if (!anyReq.auth_context?.actor_id && anyReq.user?.email && anyReq.scope?.resolve) {
          const marketplace: MarketplaceModuleService = anyReq.scope.resolve(MARKETPLACE_MODULE)
          const admins = await (marketplace as any).listVendorAdmins({ email: anyReq.user.email })
          const admin = admins?.[0]
          anyReq.auth_context = anyReq.auth_context || {}
          if (admin?.id) {
            anyReq.auth_context.actor_id = admin.id
          } else if (!anyReq.auth_context.auth_identity_id && anyReq.user?.userId) {
            // Provide identity id so creation workflows can associate
            anyReq.auth_context.auth_identity_id = anyReq.user.userId
          }
        }
      } catch (e) {
        // Non-fatal mapping failure; continue
      }
      return next()
    })
  }
}

export default defineMiddlewares({
  routes: [
    // Stripe webhook must receive raw body for signature verification
    {
      matcher: "/webhooks/stripe",
      method: ["POST"],
      middlewares: [
        // Placeholder middleware; Stripe signature verification will be re-enabled when payments are wired
        (req: any, _res: any, next: any) => next(),
      ],
    },

    {
      matcher: "/vendors",
      method: ["POST"],
      middlewares: [
        devOrVendorAuth(true),
        validateAndTransformBody(PostVendorCreateSchema as any),
      ],
    },
    {
      matcher: "/vendors/products",
      method: ["POST"],
      middlewares: [
        devOrVendorAuth(),
        validateAndTransformBody(PostVendorProductCreateSchema as any),
      ],
    },
    {
      matcher: "/vendors/intake",
      method: ["POST"],
      middlewares: [
        devOrVendorAuth(true),
        validateAndTransformBody(PostVendorIntakeStartSchema as any),
      ],
    },
    {
      matcher: "/vendors/intake",
      method: ["PUT"],
      middlewares: [
        devOrVendorAuth(),
        validateAndTransformBody(PutVendorIntakeSchema as any),
      ],
    },
    {
      matcher: "/vendors/intake/submit",
      method: ["POST"],
      middlewares: [
        devOrVendorAuth(),
        validateAndTransformBody(PostVendorIntakeSubmitSchema as any),
      ],
    },

    {
      matcher: "/vendors/*",
      middlewares: [
        devOrVendorAuth(),
      ],
    },
  ],
})
