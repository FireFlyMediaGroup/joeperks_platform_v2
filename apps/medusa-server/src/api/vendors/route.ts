import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { z } from "zod"
import createVendorWorkflow, {
  CreateVendorWorkflowInput,
} from "../../workflows/marketplace/create-vendor"

export const PostVendorCreateSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  logo: z.string().optional(),
  admin: z.object({
    email: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).strict(),
}).strict()

type RequestBody = z.infer<typeof PostVendorCreateSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<RequestBody>,
  res: MedusaResponse
) => {
  // If `actor_id` is present, the request carries 
  // authentication for an existing vendor admin
  if (req.auth_context?.actor_id) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "Request already authenticated as a vendor."
    )
  }

  const vendorData = req.validatedBody

  // Ensure a Medusa Auth Identity exists for this Stytch user and get its ID
  let authIdentityId: string | undefined = req.auth_context?.auth_identity_id as any
  try {
    const anyReq: any = req
    const stytchUser: { email?: string; userId?: string } | undefined = anyReq.user

    const authService: any = req.scope.resolve(Modules.AUTH)

    if (!authIdentityId) {
      if (!stytchUser?.userId && !stytchUser?.email) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Missing Stytch authentication. Provide a valid Bearer Stytch session_token."
        )
      }

      // Try to find existing identity by provider/entity
      try {
        const existing = await authService.listAuthIdentities(
          {
            provider_identities: {
              entity_id: stytchUser.userId || stytchUser.email,
              provider: "stytch",
            },
          },
          { take: 1 }
        )
        if (existing?.[0]?.id) {
          authIdentityId = existing[0].id
        }
      } catch {
        // ignore and attempt create
      }

      if (!authIdentityId) {
        const created = await authService.createAuthIdentities({
          provider_identities: [
            {
              provider: "stytch",
              entity_id: stytchUser.userId || stytchUser.email,
              provider_metadata: { email: stytchUser.email },
            },
          ],
        })
        authIdentityId = created.id
      }
    }
  } catch (e) {
    if (process.env.NODE_ENV !== "production") {
      return res.status(400).json({ message: (e as any)?.message || "Auth identity error" })
    }
    throw e
  }

  // create vendor admin
  const { result } = await createVendorWorkflow(req.scope)
    .run({
      input: {
        ...vendorData,
        authIdentityId: authIdentityId!,
      } as CreateVendorWorkflowInput,
    })

  res.json({
    vendor: result.vendor,
  })
}
