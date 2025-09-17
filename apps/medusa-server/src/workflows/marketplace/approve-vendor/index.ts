import { createWorkflow, WorkflowResponse, createStep, StepResponse, transform } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export type ApproveVendorWorkflowInput = {
  vendor_id: string
  commission_rate_bps?: number
  payout_schedule?: string
}

const loadVendorStep = createStep(
  "approve-vendor.load-vendor",
  async (vendorId: string, ctx) => {
    const marketplace: MarketplaceModuleService = ctx.container.resolve(MARKETPLACE_MODULE)
    const vendors = await marketplace.listVendors({ id: [vendorId] } as any)
    return new StepResponse(vendors?.[0])
  }
)

const createStockLocationStep = createStep(
  "approve-vendor.create-stock-location",
  async ({ name }: { name: string }, ctx) => {
    const stockLocationService: any = ctx.container.resolve(Modules.STOCK_LOCATION)
    const stockLocation = await stockLocationService.createStockLocations({ name } as any)
    return new StepResponse(stockLocation)
  }
)

const createShippingProfileStep = createStep(
  "approve-vendor.create-shipping-profile",
  async ({ name, type }: { name: string; type: string }, ctx) => {
    const fulfillmentService: any = ctx.container.resolve(Modules.FULFILLMENT)
    const profile = await fulfillmentService.createShippingProfiles({ name, type } as any)
    return new StepResponse(profile)
  }
)

const updateVendorStep = createStep(
  "approve-vendor.update-vendor",
  async (
    data: {
      vendor_id: string
      default_stock_location_id: string
      shipping_profile_id: string
      commission_rate_bps?: number
      payout_schedule?: string
      metadata?: Record<string, any>
    },
    ctx
  ) => {
    const marketplace: MarketplaceModuleService = ctx.container.resolve(MARKETPLACE_MODULE)
    const updated = await marketplace.updateVendors({
      id: data.vendor_id,
      vendor_status: "approved",
      default_stock_location_id: data.default_stock_location_id,
      shipping_profile_id: data.shipping_profile_id,
      ...(data.commission_rate_bps != null ? { commission_rate_bps: data.commission_rate_bps } : {}),
      ...(data.payout_schedule ? { payout_schedule: data.payout_schedule } : {}),
      ...(data.metadata ? { metadata: data.metadata } : {}),
    } as any)
    return new StepResponse(updated)
  }
)

const approveVendorWorkflow = createWorkflow(
  "approve-vendor",
  function (input: ApproveVendorWorkflowInput) {
    const vendor = loadVendorStep(input.vendor_id)

    const vendorName = transform({ vendor }, ({ vendor }) => vendor?.name || "Vendor")

    const stockLocation = createStockLocationStep(
      transform({ vendorName }, ({ vendorName }) => ({ name: `${vendorName} Location` }))
    )

    const shippingProfile = createShippingProfileStep(
      transform({ vendorName }, ({ vendorName }) => ({ name: `${vendorName} Shipping`, type: "default" }))
    )

    const updatedVendor = updateVendorStep(
      transform({ input, vendor, stockLocation, shippingProfile }, ({ input, vendor, stockLocation, shippingProfile }) => ({
        vendor_id: input.vendor_id,
        default_stock_location_id: (stockLocation as any).id,
        shipping_profile_id: (shippingProfile as any).id,
        commission_rate_bps: input.commission_rate_bps,
        payout_schedule: input.payout_schedule,
        metadata: {
          ...(vendor?.metadata || {}),
          approved_at: new Date().toISOString(),
        },
      }))
    )

    return new WorkflowResponse({
      vendor: updatedVendor,
      stock_location_id: (stockLocation as any).id,
      shipping_profile_id: (shippingProfile as any).id,
    })
  }
)

export default approveVendorWorkflow

