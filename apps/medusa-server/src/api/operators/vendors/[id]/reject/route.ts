import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import { MARKETPLACE_MODULE } from "../../../../../modules/marketplace"
import MarketplaceModuleService from "../../../../../modules/marketplace/service"

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

export const PostRejectSchema = z.object({
  reason: z.string().min(3),
}).strict()

export const POST = async (
  req: AuthenticatedMedusaRequest<z.infer<typeof PostRejectSchema>>,
  res: MedusaResponse
) => {
  try {
    assertDevOperator(req)

    const vendorId = (req as any).params?.id as string
    if (!vendorId) {
      return res.status(400).json({ message: "Missing vendor id" })
    }

    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
    const body = (req as any).validatedBody || {}

    const vendor = await marketplace.updateVendors({
      id: vendorId,
      vendor_status: "rejected",
      metadata: { rejected_at: new Date().toISOString(), reject_reason: body.reason },
    } as any)

    return res.json({ vendor })
  } catch (e: any) {
    const status = e?.status ?? 500
    return res.status(status).json({ message: e?.message || "error" })
  }
}

