import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError, Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { z } from "zod"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

export const PostVendorProductCreateSchema = z.object({
  // Accept either a single product or an array for flexibility
  product: z.record(z.any()).optional(),
  products: z.array(z.record(z.any())).optional(),
}).refine((data) => !!data.product || !!data.products, {
  message: "Provide either 'product' or 'products'",
})

type PostBody = z.infer<typeof PostVendorProductCreateSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<PostBody>,
  res: MedusaResponse
) => {
  try {
    if (!req.auth_context?.actor_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Vendor authentication required."
      )
    }

    // Resolve vendor_id of the authenticated vendor admin
    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
    const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, {
      relations: ["vendor"],
    })
    const vendorId = admin.vendor?.id
    if (!vendorId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Could not resolve vendor for authenticated admin."
      )
    }

    // Normalize input to an array of products
    const inputProducts = req.validatedBody?.products
      ?? (req.validatedBody?.product ? [req.validatedBody.product] : [])

    if (!inputProducts?.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "No product payload provided."
      )
    }

    // Create products via Product module
    const productService = req.scope.resolve(Modules.PRODUCT)
    const created = await productService.createProducts(inputProducts as any)
    const createdProducts = Array.isArray(created) ? created : [created]

    // Link products to vendor via link module (ensure correct link order)
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
    const linkSvc = link.getLinkModule(
      MARKETPLACE_MODULE,
      "vendor_id",
      Modules.PRODUCT,
      "product_id"
    )

    await Promise.all(createdProducts.map((p) => linkSvc!.create(vendorId, p.id)))

    res.json({ products: createdProducts })
  } catch (e: any) {
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message: e?.message || "error", stack: e?.stack })
    }
    throw e
  }
}


export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  try {
    if (!req.auth_context?.actor_id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Vendor authentication required."
      )
    }

    const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
    const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, {
      relations: ["vendor"],
    })
    const vendorId = admin.vendor?.id
    if (!vendorId) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Could not resolve vendor for authenticated admin."
      )
    }

    const take = Math.min(Number((req as any).query?.take ?? 50), 200)
    const skip = Number((req as any).query?.skip ?? 0)

    // Fetch linked product IDs from the link module
    const link = req.scope.resolve(ContainerRegistrationKeys.LINK)
    const linkSvc = link.getLinkModule(MARKETPLACE_MODULE, "vendor_id", Modules.PRODUCT, "product_id")
    const links = await linkSvc!.list({ vendor_id: vendorId }, { select: ["product_id"], skip, take })
    const productIds = links.map((l: any) => l.product_id)

    // Fetch products by IDs
    const productService = req.scope.resolve(Modules.PRODUCT)
    const products = await productService.listProducts({ id: productIds })

    res.json({ products })
  } catch (e: any) {
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message: e?.message || "error", stack: e?.stack })
    }
    throw e
  }
}
