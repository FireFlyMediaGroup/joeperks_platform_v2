import { createWorkflow, WorkflowResponse, createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export type CalculateOrderSplitsInput = {
  order_id: string
}

export type OrderSplitLine = {
  vendor_id: string
  gross_amount: number
  platform_amount: number
  organization_amount: number
  vendor_amount: number
}

export type CalculateOrderSplitsOutput = {
  order_id: string
  sales_channel_id?: string
  platform_fee_bps: number
  organization_commission_bps: number
  lines: OrderSplitLine[]
  totals: {
    gross: number
    platform: number
    organization: number
    vendor: number
  }
}

const loadOrderStep = createStep("calculate-splits.load-order", async (orderId: string, ctx) => {
  const remoteQuery = ctx.container.resolve(ContainerRegistrationKeys.REMOTE_QUERY)
  const query = {
    entryPoint: "orders",
    fields: [
      "id",
      "sales_channel_id",
      "items.id",
      "items.unit_price",
      "items.quantity",
      "items.variant_id",
    ],
    variables: { id: orderId },
  }
  const { rows } = await remoteQuery(query)
  const order = rows?.[0]
  return new StepResponse(order)
})

const resolveVariantProductsStep = createStep(
  "calculate-splits.resolve-variant-products",
  async (variantIds: string[], ctx) => {
    if (!variantIds.length) return new StepResponse({})
    const productService: any = ctx.container.resolve(Modules.PRODUCT)
    const variants = await productService.listVariants({ id: variantIds })
    // Map variant_id -> product_id
    const map: Record<string, string> = {}
    for (const v of variants) {
      if (v?.id && (v as any).product_id) {
        map[v.id] = (v as any).product_id
      }
    }
    return new StepResponse(map)
  }
)

const resolveVendorsForProductsStep = createStep(
  "calculate-splits.resolve-vendors",
  async (productIds: string[], ctx) => {
    const link = ctx.container.resolve(ContainerRegistrationKeys.LINK)
    const linkSvc: any = link.getLinkModule("marketplace", "vendor_id", Modules.PRODUCT, "product_id")
    const vendorsByProduct: Record<string, string> = {}

    if (productIds.length) {
      const links = await linkSvc.list({ product_id: productIds }, { select: ["product_id", "vendor_id"] })
      for (const l of links) {
        vendorsByProduct[l.product_id] = l.vendor_id
      }
    }

    return new StepResponse(vendorsByProduct)
  }
)

const computeSplitsStep = createStep(
  "calculate-splits.compute",
  async (
    input: any,
    ctx
  ) => {
    const platformFeeBps = Number(process.env.PLATFORM_FEE_BPS ?? 1000) // 10% default

    // Try to read org commission bps from sales channel metadata; fallback to env
    let orgBps = Number(process.env.ORG_COMMISSION_BPS ?? 0)
    try {
      if (input.order?.sales_channel_id) {
        const salesModule: any = ctx.container.resolve(Modules.SALES_CHANNEL)
        const sc = await salesModule.retrieve(input.order.sales_channel_id)
        if (sc?.metadata?.org_commission_bps != null) {
          orgBps = Number(sc.metadata.org_commission_bps)
        }
      }
    } catch {}

    const linesByVendor: Record<string, { gross: number }> = {}
    let grossTotal = 0

    for (const it of input.order?.items || []) {
      const variantId = it.variant_id
      const productId = input.variantToProduct[variantId]
      const vendorId = input.vendorsByProduct[productId]
      const gross = Number(it.unit_price || 0) * Number(it.quantity || 0)
      grossTotal += gross
      if (!vendorId) continue
      linesByVendor[vendorId] = linesByVendor[vendorId] || { gross: 0 }
      linesByVendor[vendorId].gross += gross
    }

    const lines = [] as OrderSplitLine[]
    let platformSum = 0
    let orgSum = 0
    let vendorSum = 0

    for (const [vendor_id, v] of Object.entries(linesByVendor)) {
      const platform_amount = Math.floor((v.gross * platformFeeBps) / 10_000)
      const organization_amount = Math.floor((v.gross * orgBps) / 10_000)
      const vendor_amount = v.gross - platform_amount - organization_amount
      platformSum += platform_amount
      orgSum += organization_amount
      vendorSum += vendor_amount
      lines.push({ vendor_id, gross_amount: v.gross, platform_amount, organization_amount, vendor_amount })
    }

    const out: CalculateOrderSplitsOutput = {
      order_id: input.order.id,
      sales_channel_id: input.order.sales_channel_id,
      platform_fee_bps: platformFeeBps,
      organization_commission_bps: orgBps,
      lines,
      totals: { gross: grossTotal, platform: platformSum, organization: orgSum, vendor: vendorSum },
    }

    return new StepResponse(out)
  }
)

const persistSplitsOnOrderStep = createStep(
  "calculate-splits.persist",
  async (input: CalculateOrderSplitsOutput, ctx) => {
    try {
      const orderModule: any = ctx.container.resolve(Modules.ORDER)
      // Persist under metadata.splits
      await orderModule.updateOrders({
        id: input.order_id,
        metadata: {
          splits: input,
        },
      })
    } catch {}
    return new StepResponse(input)
  }
)

const calculateOrderSplits = createWorkflow(
  "calculate-order-splits",
  function (input: CalculateOrderSplitsInput) {
    const order = loadOrderStep(input.order_id)
    const variantToProduct = resolveVariantProductsStep(order.items.map((i: any) => i.variant_id))
    const vendorsByProduct = resolveVendorsForProductsStep(Object.values(variantToProduct as any))
    const result = computeSplitsStep({ order, variantToProduct, vendorsByProduct } as any)
    const persisted = persistSplitsOnOrderStep(result as any)
    return new WorkflowResponse(persisted)
  }
)

export default calculateOrderSplits

