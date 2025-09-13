# 08 — Payments: Stripe Connect (Payouts to Roasters)

## Setup
1) In Stripe Dashboard, enable Connect (Express).
2) Create a restricted API key for server; keep standard secret for general ops.
3) Add webhook endpoint(s) per env (backend URL): `/webhooks/stripe`.

Env (apps/medusa-server/.env):
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
PLATFORM_FEE_BPS=300    # example: 3%
```

## Onboarding roasters
- Create Connect accounts for roasters and onboarding links via Stripe API.
- Store `stripe_connect_account_id` on the roaster/vendor entity.

## Payment flow (high level)
1) Customer checkout -> PaymentIntent created (with `transfer_group`=order_id).
2) On payment success webhook: compute splits.
3) Create transfers:
   - To roaster account: wholesale + shipping
   - To organization account (optional): fundraising amount (or retain in platform and payout later)
   - Platform fee retained
4) Persist transfer IDs in an audit table.

## Implementation notes
- Idempotency: use order/payment ids for safe retries.
- Currency and rounding: ensure consistent smallest unit math.
- Disputes/refunds: implement reversal flows.

## Tests
- Unit: split calculator, onboarding URL builder
- Integration: webhook handler with Stripe test events

