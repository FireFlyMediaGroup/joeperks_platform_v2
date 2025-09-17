import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import Stripe from "stripe"
import { MARKETPLACE_MODULE } from "../../../../modules/marketplace"


// DEV auth shim: allow dev tokens like "dev:actor:<id>" to populate req.auth_context
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

// Stripe Connect onboarding link endpoint
// - Vendor-auth protected; dev tokens supported via devAuthShim
export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const sk = process.env.STRIPE_SECRET_KEY
  if (!sk) {
    return res.status(501).json({
      configured: false,
      message: "Stripe is not configured. Set STRIPE_SECRET_KEY (and STRIPE_PUBLISHABLE_KEY) in your environment.",
    })
  }

  // Populate auth_context for dev tokens in non-prod
  devAuthShim(req)

  if (!req.auth_context?.actor_id) {
    return res.status(401).json({ message: "Vendor authentication required." })
  }

  try {
    const stripe = new Stripe(sk, { apiVersion: "2024-06-20" as any })

    // Resolve vendor id of the authenticated vendor admin
    // MARKETPLACE_MODULE imported statically at top
    const marketplace: any = (req as any).scope.resolve(MARKETPLACE_MODULE)
    const admin = await marketplace.retrieveVendorAdmin(req.auth_context.actor_id, { relations: ["vendor"] })
    const vendorId = admin?.vendor?.id
    if (!vendorId) {
      return res.status(400).json({ message: "Could not resolve vendor for authenticated admin." })
    }

    // Ensure a Connect account exists
    let accountId = admin.vendor.stripe_connect_account_id as string | undefined
    if (!accountId) {
      const acct = await stripe.accounts.create({
        type: "express",
        metadata: { vendor_id: vendorId },
      })
      accountId = acct.id
      await marketplace.updateVendors({ id: vendorId, stripe_connect_account_id: accountId } as any)
    }

    // Create an onboarding account link
    const portalUrl = process.env.PORTAL_ROASTER_URL || "http://localhost:3002/status"
    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${portalUrl}?onboarding=refresh`,
      return_url: `${portalUrl}?onboarding=return`,
      type: "account_onboarding",
    })

    return res.json({ url: link.url, account_id: accountId })
  } catch (e: any) {
    const message = e?.message || "Stripe onboarding error"
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message, stack: e?.stack })
    }
    return res.status(500).json({ message })
  }
}

