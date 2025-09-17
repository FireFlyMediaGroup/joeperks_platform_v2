import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import calculateOrderSplits from "../../../../../workflows/marketplace/calculate-order-splits"

function assertDevAccess(req: any) {
  const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
  const expected = process.env.DEV_ENDPOINT_SECRET
  const provided = (req.get?.("x-dev-secret") || req.get?.("X-Dev-Secret") || req.headers?.["x-dev-secret"] || req.headers?.["X-Dev-Secret"]) as string | undefined
  if (!devEnabled || !expected || provided !== expected) {
    const err: any = new Error("Unauthorized")
    err.status = 401
    throw err
  }
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    assertDevAccess(req)
    const { id } = (req as any).params || (req as any)
    if (!id) {
      return res.status(400).json({ message: "order id is required" })
    }

    const wf = (calculateOrderSplits as any)(req.scope)
    const { result } = await wf.run({ input: { order_id: id } })

    return res.json({ splits: result })
  } catch (e: any) {
    const status = e?.status ?? 500
    return res.status(status).json({ message: e?.message || "error" })
  }
}

