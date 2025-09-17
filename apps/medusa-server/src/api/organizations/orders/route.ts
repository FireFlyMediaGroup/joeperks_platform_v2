import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys, remoteQueryObjectFromString } from "@medusajs/framework/utils"

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

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    // Dev-gated endpoint until org auth is implemented
    assertDevAccess(req)

    const q = (req as any).query || {}
    const salesChannelId = q.sales_channel_id as string | undefined
    const take = Math.min(Number(q.take ?? 50), 200)
    const skip = Number(q.skip ?? 0)

    const filters: Record<string, any> = { is_draft_order: false }
    if (salesChannelId) {
      filters.sales_channel_id = salesChannelId
    }

    const remoteQuery = (req as any).scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
    const query = remoteQueryObjectFromString({
      entryPoint: "orders",
      variables: {
        filters,
        skip,
        take,
      },
      fields: [
        "id",
        "created_at",
        "status",
        "email",
        "currency_code",
        "items.*",
        "sales_channel_id",
        "customer_id",
        "total",
      ],
    })

    const { rows, metadata } = await remoteQuery(query)
    return res.json({
      orders: rows,
      count: metadata.count,
      offset: metadata.skip,
      limit: metadata.take,
    })
  } catch (e: any) {
    const status = e?.status ?? 500
    return res.status(status).json({ message: e?.message || "error" })
  }
}

