import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { z } from "zod"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"
import createVendorWorkflow, { CreateVendorWorkflowInput } from "../../../workflows/marketplace/create-vendor"

// DEV auth shim: allow dev tokens like "dev:actor:<id>" to populate req.auth_context in dev
function devAuthShim(req: any) {
  if (req?.auth_context?.actor_id) return
  const devEnabled = process.env.NODE_ENV !== "production" && process.env.ENABLE_DEV_ENDPOINTS === "true"
  if (!devEnabled) return
  const auth = (req.get?.("authorization") || req.headers?.authorization) as string | undefined
  if (!auth?.startsWith("Bearer ")) return
  const token = auth.slice(7).trim()
  if (token.startsWith("dev:actor:")) {
    const actor_id = token.substring("dev:actor:".length)
    req.auth_context = { ...(req.auth_context || {}), actor_id }
  } else if (token.startsWith("dev:identity:")) {
    const auth_identity_id = token.substring("dev:identity:".length)
    req.auth_context = { ...(req.auth_context || {}), auth_identity_id }
  }
}

export const PostVendorIntakeStartSchema = z.object({
  name: z.string(),
  handle: z.string().optional(),
  admin: z.object({
    email: z.string().email(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
  }).strict(),
}).strict()

export const PutVendorIntakeSchema = z.object({
  // Arbitrary intake sections; we store under vendor.metadata.intake_draft
  intake: z.record(z.any()),
}).strict()

export const PostVendorIntakeSubmitSchema = z.object({}).strict()

type StartBody = z.infer<typeof PostVendorIntakeStartSchema>

type PutBody = z.infer<typeof PutVendorIntakeSchema>

export const POST = async (
  req: AuthenticatedMedusaRequest<StartBody>,
  res: MedusaResponse
) => {
  devAuthShim(req)
  // Start intake: create vendor + admin if not already a vendor admin
  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)

  if (req.auth_context?.actor_id) {
    // Already a vendor admin; just ensure status is intake_in_progress
    const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, {
      relations: ["vendor"],
    })
    if (!admin.vendor?.id) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Could not resolve vendor for authenticated admin.")
    }
    const vendor = await marketplace.updateVendors({
      id: admin.vendor.id,
      vendor_status: "intake_in_progress",
    } as any)
    return res.json({ vendor })
  }

  // If authenticated via Stytch (user email present) but no vendor admin yet, create vendor + admin directly
  const anyReq = req as any
  const stytchEmail: string | undefined = anyReq.user?.email
  if (stytchEmail) {
    // Try to find existing admin by email
    const admins = await (marketplace as any).listVendorAdmins({ email: stytchEmail })
    const existing = admins?.[0]
    if (existing?.id) {
      req.auth_context = req.auth_context || ({} as any)
      req.auth_context.actor_id = existing.id
      const admin = await marketplace.retrieveVendorAdmin(existing.id, { relations: ["vendor"] })
      if (!admin.vendor?.id) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, "Could not resolve vendor for authenticated admin.")
      }
      const vendor = await marketplace.updateVendors({ id: admin.vendor.id, vendor_status: "intake_in_progress" } as any)
      return res.json({ vendor })
    }

    // Create new vendor and admin
    const body = req.validatedBody
    const vendor = await marketplace.createVendors({ name: body.name, handle: body.handle })
    const vadmin = await (marketplace as any).createVendorAdmins({
      email: body.admin?.email || stytchEmail,
      first_name: body.admin?.first_name,
      last_name: body.admin?.last_name,
      vendor_id: vendor.id,
    })

    req.auth_context = req.auth_context || ({} as any)
    req.auth_context.actor_id = vadmin.id

    const updated = await marketplace.updateVendors({ id: vendor.id, vendor_status: "intake_in_progress" } as any)
    return res.json({ vendor: updated })
  }

  // Create vendor via workflow (fallback when neither dev nor Stytch context is available)
  const body = req.validatedBody
  const { result } = await createVendorWorkflow(req.scope).run({
    input: {
      ...body,
      authIdentityId: req.auth_context?.auth_identity_id,
    } as CreateVendorWorkflowInput,
  })

  // Mark vendor status
  const vendor = await marketplace.updateVendors({
    id: result.vendor.id,
    vendor_status: "intake_in_progress",
  } as any)

  return res.json({ vendor })
}

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  devAuthShim(req)
  if (!req.auth_context?.actor_id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vendor authentication required.")
  }

  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, { relations: ["vendor"] })
  const vendorId = admin.vendor?.id
  if (!vendorId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Could not resolve vendor for authenticated admin.")
  }

  const vendor = await marketplace.retrieveVendor(vendorId)
  return res.json({ vendor })
}

export const PUT = async (
  req: AuthenticatedMedusaRequest<PutBody>,
  res: MedusaResponse
) => {
  // Save intake draft into vendor.metadata.intake_draft
  devAuthShim(req)
  if (!req.auth_context?.actor_id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vendor authentication required.")
  }

  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, {
    relations: ["vendor"],
  })
  const vendorId = admin.vendor?.id
  if (!vendorId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Could not resolve vendor for authenticated admin.")
  }

  // Read current metadata and merge
  const vendor = await marketplace.retrieveVendor(vendorId)
  const currentMeta = (vendor as any).metadata || {}
  const nextMeta = { ...currentMeta, intake_draft: req.validatedBody.intake }

  const updated = await marketplace.updateVendors({
    id: vendorId,
    metadata: nextMeta,
    vendor_status: (vendor as any).vendor_status ?? "intake_in_progress",
  } as any)

  return res.json({ vendor: updated })
}

export const POST_SUBMIT = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  // This method will be mounted for /vendors/intake/submit by delegating in index
  devAuthShim(req)
  if (!req.auth_context?.actor_id) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Vendor authentication required.")
  }

  const marketplace: MarketplaceModuleService = req.scope.resolve(MARKETPLACE_MODULE)
  const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, {
    relations: ["vendor"],
  })
  const vendorId = admin.vendor?.id
  if (!vendorId) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Could not resolve vendor for authenticated admin.")
  }

  // Stripe capability gate (configurable)
  const vendor = await marketplace.retrieveVendor(vendorId)
  const requireCaps = process.env.REQUIRE_PAYOUTS_CAPABILITY === "true"
  const accountId = (vendor as any).stripe_connect_account_id
  const caps = ((vendor as any).metadata || {}).stripe_capabilities || {}

  if (!accountId) {
    return res.status(400).json({
      message: "Stripe Connect account is required before submitting. Please complete Stripe onboarding.",
      code: "STRIPE_ACCOUNT_REQUIRED",
    })
  }

  if (requireCaps) {
    const payoutsOk = !!caps.payoutsEnabled
    const transfersOk = caps.transfers === true || caps.transfers === "active"
    if (!payoutsOk || !transfersOk) {
      return res.status(400).json({
        message: "Stripe payouts/transfers are not active yet. Please finish onboarding and try again.",
        code: "STRIPE_CAPABILITIES_PENDING",
        details: { payoutsEnabled: !!caps.payoutsEnabled, transfers: caps.transfers ?? false },
      })
    }
  }

  const updated = await marketplace.updateVendors({
    id: vendorId,
    vendor_status: "submitted",
  } as any)

  return res.json({ vendor: updated })
}

// Note: The Medusa file-based router will treat this file as /vendors/intake. For /vendors/intake/submit,
// we will create a sibling file route in a `submit` subdirectory that calls POST_SUBMIT.

