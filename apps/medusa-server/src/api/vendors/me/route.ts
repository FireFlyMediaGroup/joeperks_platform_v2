import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"

function slugify(input?: string): string {
  const base = (input || "").toLowerCase().trim()
  const slug = base
    .normalize("NFKD")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  return slug || "roaster"
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const anyReq: any = req as any
    if (!anyReq.auth_context?.actor_id) {
      return res.status(401).json({ message: "Authentication required" })
    }

    const marketplace: any = req.scope.resolve(MARKETPLACE_MODULE)
    const admin = await marketplace.retrieveVendorAdmin(anyReq.auth_context.actor_id, {
      relations: ["vendor"],
    })

    const vendor = admin?.vendor
    if (!vendor?.id) {
      return res.status(404).json({ message: "Vendor not found for current user" })
    }

    const slug = vendor?.metadata?.slug || slugify(vendor?.name || vendor?.id)

    return res.json({
      vendor: {
        id: vendor.id,
        name: vendor.name,
        metadata: vendor.metadata,
      },
      slug,
      admin: { id: admin.id, email: (admin as any).email },
    })
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || "error" })
  }
}

