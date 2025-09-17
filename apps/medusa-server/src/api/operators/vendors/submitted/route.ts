import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../modules/marketplace/service"

function assertDevOperator(req: any) {
  const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
  const expected = process.env.DEV_ENDPOINT_SECRET
  const provided = (req.get?.("x-dev-secret") || req.get?.("X-Dev-Secret")) as string | undefined
  if (!devEnabled || !expected || provided !== expected) {
    const err: any = new Error("Operator access denied. Configure real operator auth before production.")
    err.status = 403
    throw err
  }
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    assertDevOperator(req)

    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
    const take = Math.min(Number((req as any).query?.take ?? 50), 200)
    const skip = Number((req as any).query?.skip ?? 0)

    const vendors = await marketplace.listVendors({ vendor_status: "submitted" } as any, { skip, take })
    res.json({ vendors })
  } catch (e: any) {
    const status = e?.status ?? 500
    return res.status(status).json({ message: e?.message || "error" })
  }
}

