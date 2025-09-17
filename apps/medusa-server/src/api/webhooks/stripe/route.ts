import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import Stripe from "stripe"
import { MARKETPLACE_MODULE } from "../../../modules/marketplace"
import MarketplaceModuleService from "../../../modules/marketplace/service"

// Minimal Stripe webhook handler for Connect account events
// Notes:
// - In production, configure raw body middleware for this route to verify signatures properly.
// - For local/dev, if STRIPE_WEBHOOK_SECRET is not set, we accept parsed JSON for convenience.
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const sk = process.env.STRIPE_SECRET_KEY
  if (!sk) {
    return res.status(501).json({ message: "Stripe not configured" })
  }

  try {
    const stripe = new Stripe(sk, { apiVersion: "2024-06-20" as any })
    const sig = req.headers["stripe-signature"] as string | undefined
    const whSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event: Stripe.Event
    if (whSecret && sig) {
      // Requires raw body. When express.raw is used, req.body is a Buffer.
      const raw = Buffer.isBuffer((req as any).body)
        ? (req as any).body
        : (req as any).rawBody
      if (!raw) {
        return res.status(400).json({ message: "Stripe webhook requires raw body for signature verification" })
      }
      event = stripe.webhooks.constructEvent(raw, sig, whSecret)
    } else {
      event = req.body as any
    }

    // Handle account capability changes
    if (event.type === "account.updated") {
      const account = event.data.object as Stripe.Account
      const accountId = account.id
      // Look up vendor by stored account id
      const marketplace: MarketplaceModuleService = (req as any).scope.resolve(MARKETPLACE_MODULE)
      const vendors = await marketplace.listVendors({ stripe_connect_account_id: accountId } as any)
      const vendor = vendors?.[0]

      if (vendor) {
        const payoutsEnabled = !!account.payouts_enabled
        const cardPayments = (account.capabilities as any)?.card_payments === "active"
        const transfers = (account.capabilities as any)?.transfers === "active"
        const capabilityState = { payoutsEnabled, cardPayments, transfers }

        await marketplace.updateVendors({
          id: vendor.id,
          metadata: {
            ...(vendor as any).metadata,
            stripe_capabilities: capabilityState,
            stripe_last_event_at: new Date().toISOString(),
          },
        } as any)
      }
    }

    return res.status(200).json({ received: true })
  } catch (e: any) {
    const message = e?.message || "Stripe webhook error"
    if (process.env.NODE_ENV !== "production") {
      return res.status(500).json({ message, stack: e?.stack })
    }
    return res.status(500).json({ message })
  }
}

