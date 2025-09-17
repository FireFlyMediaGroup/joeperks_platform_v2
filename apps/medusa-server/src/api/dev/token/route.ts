import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

/**
 * DEV ONLY: Issue a development bearer token for vendor flows
 *
 * POST /dev/token
 * Body examples:
 *  { "type": "identity", "id": "dev-identity-1" }
 *  { "type": "identity", "email": "owner@example.com" } // id will be derived from email
 *  { "type": "actor", "vendor_admin_id": "vadmin_123" }
 *  { "type": "actor", "email": "owner@example.com" } // resolve existing vendor admin by email
 *
 * Returns: { token: "dev:identity:<id>" } or { token: "dev:actor:<vendor_admin_id>" }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
  const expected = process.env.DEV_ENDPOINT_SECRET
  const provided = (req.get("x-dev-secret") || req.get("X-Dev-Secret")) as string | undefined
  if (!devEnabled || !expected || provided !== expected) {
    return res.status(404).json({ message: "Not found" })
  }

  try {
    const { type, id, email, vendor_admin_id } = (req.body as any) || {}

    if (type !== "identity" && type !== "actor") {
      return res.status(400).json({ message: "type must be 'identity' or 'actor'" })
    }

    if (type === "identity") {
      const identityId: string = id || (email ? `email_${encodeURIComponent(email)}` : "")
      if (!identityId) {
        return res.status(400).json({ message: "Provide 'id' or 'email' for identity token" })
      }
      return res.status(200).json({ token: `dev:identity:${identityId}` })
    }

    // type === 'actor'
    let actorId: string | undefined = vendor_admin_id
    if (!actorId && email) {
      const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
      const admins = await marketplace.listVendorAdmins({ email })
      actorId = admins?.[0]?.id
    }

    if (!actorId) {
      return res.status(400).json({ message: "Provide 'vendor_admin_id' or resolvable 'email' for actor token" })
    }

    return res.status(200).json({ token: `dev:actor:${actorId}` })
  } catch (e) {
    return res.status(500).json({ message: "Failed to issue dev token" })
  }
}

