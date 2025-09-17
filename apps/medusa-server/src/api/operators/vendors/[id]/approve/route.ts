import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { z } from "zod"
import approveVendorWorkflow from "../../../../../workflows/marketplace/approve-vendor"
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

export const PostApproveSchema = z.object({
  commission_rate_bps: z.number().int().min(0).max(10000).optional(),
  payout_schedule: z.string().optional(),
}).strict()

export const POST = async (
  req: AuthenticatedMedusaRequest<z.infer<typeof PostApproveSchema>>,
  res: MedusaResponse
) => {
  try {
    assertDevOperator(req)

    const vendorId = (req as any).params?.id as string
    if (!vendorId) {
      return res.status(400).json({ message: "Missing vendor id" })
    }

    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

    // Stripe capability gate (configurable)
    const vendor = await marketplace.retrieveVendor(vendorId)
    const requireCaps = process.env.REQUIRE_PAYOUTS_CAPABILITY === "true"
    const accountId = (vendor as any).stripe_connect_account_id
    const caps = ((vendor as any).metadata || {}).stripe_capabilities || {}
    if (!accountId) {
      return res.status(400).json({
        message: "Stripe Connect account is required before approval.",
        code: "STRIPE_ACCOUNT_REQUIRED",
      })
    }
    if (requireCaps) {
      const payoutsOk = !!caps.payoutsEnabled
      const transfersOk = caps.transfers === true || caps.transfers === "active"
      if (!payoutsOk || !transfersOk) {
        return res.status(400).json({
          message: "Stripe payouts/transfers are not active yet.",
          code: "STRIPE_CAPABILITIES_PENDING",
          details: { payoutsEnabled: !!caps.payoutsEnabled, transfers: caps.transfers ?? false },
        })
      }
    }

    // Run approve-vendor workflow (creates stock location + shipping profile and updates vendor)
    const body = (req as any).validatedBody || {}
    const { result } = await approveVendorWorkflow(req.scope).run({
      input: {
        vendor_id: vendorId,
        commission_rate_bps: body.commission_rate_bps,
        payout_schedule: body.payout_schedule,
      },
    })

    return res.json(result)
  } catch (e: any) {
    const status = e?.status ?? 500
    return res.status(status).json({ message: e?.message || "error" })
  }
}

