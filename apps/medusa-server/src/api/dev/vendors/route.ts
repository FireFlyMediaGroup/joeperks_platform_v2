import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

/**
 * DEV ONLY: Create a vendor with an admin quickly (bypasses Auth Identity)
 *
 * POST /dev/vendors
 * Body:
 *  {
 *    "name": "Vendor Name",
 *    "handle": "vendor-handle",
 *    "logo": "https://...",
 *    "admin": { "email": "owner@example.com", "first_name": "Owner", "last_name": "Vendor" }
 *  }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
  const expected = process.env.DEV_ENDPOINT_SECRET
  const provided = (req.get("x-dev-secret") || req.get("X-Dev-Secret")) as string | undefined
  if (!devEnabled || !expected || provided !== expected) {
    return res.status(404).json({ message: "Not found" })
  }

  try {
    const { name, handle, logo, admin } = (req.body as any) || {}
    if (!name || !admin?.email) {
      return res.status(400).json({ message: "Missing required fields: name, admin.email" })
    }

    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

    // Create vendor
    const vendor = await marketplace.createVendors({ name, handle, logo })

    // Create vendor admin and link to vendor
    const vadmin = await marketplace.createVendorAdmins({
      email: admin.email,
      first_name: admin.first_name,
      last_name: admin.last_name,
      vendor_id: vendor.id,
    })

    return res.status(200).json({ vendor, vendor_admin: vadmin })
  } catch (e) {
    return res.status(500).json({ message: "Failed to create dev vendor" })
  }
}

