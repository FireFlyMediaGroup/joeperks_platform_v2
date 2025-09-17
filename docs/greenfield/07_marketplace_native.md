# 07 — Marketplace (Medusa v2 Native Recipe)

Last updated: 2025-09-15

## Why this change?
We evaluated the community marketplace plugin (`@techlabi/medusa-marketplace-plugin`) and found incompatibilities with Medusa v2 (workflow conflicts). We are implementing the marketplace using Medusa v2’s official recipe based on native modules, workflows, and module links — no external plugin.

- Official recipe: https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors

## Outcome
- Marketplace foundation implemented using native Medusa v2 features
- Custom module with `Vendor` and `VendorAdmin` models
- Links: Vendor ↔ Product, Vendor ↔ Order
- Workflow: `create-vendor` with compensation and auth identity association
- API: `POST /vendors` to create vendor + admin

---

## 1) Remove plugin (if previously installed)
```bash
pnpm remove @techlabi/medusa-marketplace-plugin
```
Update Medusa config to remove the plugin entry (if present).

---

## 2) Register marketplace module (native)
apps/medusa-server/medusa-config.ts:

```ts
modules: [
  { resolve: "./src/modules/marketplace" },
]
```

We keep core services (cache/file/notification/fulfillment) under the standard modules config.

---

## 3) Data models (native module)
Created under `apps/medusa-server/src/modules/marketplace`:
- models/vendor.ts — `id`, `handle`, `name`, `logo`, relation: `admins`
- models/vendor-admin.ts — `id`, `email`, optional `first_name`, `last_name`, relation: `vendor`
- service.ts — `MarketplaceModuleService` (auto CRUD)
- index.ts — module registration/export

---

## 4) Module links
Created under `apps/medusa-server/src/links`:
- vendor-product.ts — link vendor → product (one-to-many)
- vendor-order.ts — link vendor → order (one-to-many)

---

## 5) Workflow: create vendor + admin
Location: `apps/medusa-server/src/workflows/marketplace/create-vendor`
- Step: `steps/create-vendor.ts` — creates Vendor (with compensation delete)
- Step: `steps/create-vendor-admin.ts` — creates VendorAdmin (with compensation delete)
- Index: `index.ts` — orchestrates steps and sets auth app metadata:
  - `setAuthAppMetadataStep({ actorType: "vendor", value: vendorAdmin.id })`

---

## 6) API route and middlewares
- Route: `apps/medusa-server/src/api/vendors/route.ts`
  - POST schema:
    ```json
    {
      "name": "Acme Roasters",
      "handle": "acme",
      "logo": "https://.../logo.png",
      "admin": {
        "email": "owner@acme.com",
        "first_name": "Ava",
        "last_name": "Bean"
      }
    }
    ```
  - Responds with `{ vendor: { ... , admins: [...] } }`

- Middlewares: `apps/medusa-server/src/api/middlewares.ts`
  - `authenticate("vendor", ["session", "bearer"], { allowUnregistered: true })`
  - `validateAndTransformBody(PostVendorCreateSchema)`

Note: `allowUnregistered: true` lets an authenticated identity without a vendor actor finish registration by creating their vendor.

---

## 7) Database migration
From apps/medusa-server:
```bash
npx medusa db:generate marketplace
npx medusa db:migrate
```
(or using Nx targets if configured)

---

## 8) Quick test
1) Obtain an auth token (e.g., via Stytch login in dev) to populate `auth_identity_id`
2) Create vendor:
```bash
curl -X POST http://localhost:9000/vendors \
  -H "Authorization: Bearer <DEV_TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Acme Roasters",
    "handle": "acme",
    "admin": { "email": "owner@acme.com", "first_name": "Ava", "last_name": "Bean" }
  }'
```
3) Expect 200 with vendor payload including admins.

---

## 9) Mapping to PRD
- “Roaster” maps to our `Vendor`
- Vendor isolation via links to products and orders
- Super/admin capabilities handled via platform admin app; vendor admins are a custom actor type

---

## 10) Next steps
- Vendor product management endpoints (create/list by vendor)
- Order splitting workflow (group cart by vendor; create child orders)
- Vendor dashboards (orders, catalog)



---

## 11) Organizations and Campaigns (Fundraising mapping)

Definitions
- Organization (fundraiser): runs Campaigns. Not a Vendor.
- Campaign: the purchasable context of a fundraiser. Maps 1:1 to a Medusa Sales Channel.
- Vendor (roaster): supplies products and fulfills orders.

Key mapping
- Campaign = Sales Channel
  - On Campaign create → auto-create Sales Channel and persist its id on the Campaign.
  - Approved vendor products are attached to Campaign(s) by adding to the Campaign’s Sales Channel.
  - Orders and Customers for a Campaign are filterable by that Sales Channel in Medusa Admin.

Recommended modules (custom)
- Organization module: org profile, contacts, payout share settings.
- Campaign module: name, timeframe, fundraising split, salesChannelId, orgId.

Admin usage
- Medusa Admin: filter Products/Orders/Customers by the Campaign’s Sales Channel.
- Platform Admin: manage Organizations/Campaigns; attach/detach products to campaigns.

---

## 12) Roaster onboarding & approval automation (Dev steps)

Lifecycle
- Invited → Registered → IntakeInProgress → Submitted → UnderReview → Approved | Rejected | Suspended

Schema additions (Vendor)
- Payouts: stripe_connect_account_id, payout_schedule, commission_rate, tax_forms_status
- Ops: default_stock_location_id, shipping_profile_id
- Status: vendor_status (enum)

APIs (Medusa server)
- Vendor-side (Vendor Portal)
  - POST /vendors/intake/start → create draft Vendor linked to auth identity
  - PUT /vendors/intake → autosave intake sections
  - POST /vendors/intake/submit → status=Submitted
- Operator-side (Platform Admin)
  - GET /operators/vendors/submitted → review queue
  - POST /operators/vendors/:id/approve → runs approval workflow
  - POST /operators/vendors/:id/reject  → sets Rejected with reason

Workflows (Medusa v2)
- start-vendor-intake-workflow: seed Vendor + VendorAdmin; set status=IntakeInProgress
- submit-vendor-intake-workflow: validate required fields; require Stripe account id
- approve-vendor-workflow: create Stock Location + Shipping Profile; persist payouts/commission; notify

Stripe Connect
- Generate Express onboarding link; store account id on return.
- Listen to account.updated webhook; block approval until payouts capability is active.

Automations on Approve
- Create Medusa Stock Location for vendor.
- Optionally create vendor-only Sales Channel (internal filtering)
- Persist commission/payout settings; set vendor_status=Approved; email vendor.

UI scope
- Vendor Portal: multi-step wizard (profile, Stripe, shipping, tax docs) with autosave + submit.
- Platform Admin: review queue + detail; Approve/Reject/Request changes.

Security
- Vendor endpoints require vendor actor auth; operator endpoints restricted to operator/admin.
- Dev helpers remain disabled in production (guarded by env flags/secret).


---

## 13) Best practices (Marketplace v2)

- Domain boundaries
  - Separate modules: Vendor (roaster), Organization (fundraiser), Campaign (maps 1:1 to Sales Channel)
  - Use module links for vendor↔product and vendor↔order; prefer Remote Query for cross-module joins
- Workflows
  - Use workflows for lifecycle transitions: submit, approve, reject, suspend
  - Include compensation and idempotency; record who/when/why in metadata
- Inventory/fulfillment
  - Create a Stock Location per vendor at approval time
  - Create a Shipping Profile for vendor products; later add per-vendor Shipping Options
- Security/auth
  - Vendors use the Portal app; Operators use Platform Admin; never expose Admin to vendors
  - Keep dev-only helpers behind ENABLE_DEV_ENDPOINTS + DEV_ENDPOINT_SECRET
- Money/compliance
  - Amounts in smallest unit; commissions in bps
  - Stripe Connect: store only account id + capability states; verify webhooks
- Data/migrations
  - Extend Vendor with status/payout/ops fields; use jsonb metadata for intake drafts
  - Validate request bodies with Zod at API boundaries
- Observability
  - Structured logs with correlation ids; emit workflow step durations
  - Basic audit in metadata: approved_at, approved_by, reject_reason

---

## 14) Recommended implementation sequence

1) Approve-vendor workflow
   - Create Stock Location + Shipping Profile; persist commission/payout schedule; set status=approved
   - Wire POST /operators/vendors/:id/approve to run the workflow
2) Vendor Portal (Portal Roaster) intake UI (MVP)
   - /intake wizard with autosave → POST/PUT /vendors/intake; submit → POST /vendors/intake/submit
   - /status page showing lifecycle and next steps
3) Stripe Connect onboarding
   - Install stripe SDK, create Express accounts + onboarding links; webhook account.updated
   - Gate submit/approve on payouts capability
4) Real operator auth
   - Replace dev gating with operator roles for review/approve/reject
5) Organization + Campaign modules
   - On Campaign create → auto-create Sales Channel; assign approved vendor products to campaigns via channel
6) Product publishing flow
   - Vendor drafts → Operator reviews/publishes → assign to campaign channel(s)
7) Notifications
   - Emails: invite, changes requested, approved, rejected
8) Reporting
   - Orders per campaign, vendor earnings, org share; CSV export
9) Hardening
   - Validation, rate limits, webhook signature checks, DB constraints, indexes, tests

---

## 15) Dev operator access and smoke testing

- Enable: set ENABLE_DEV_ENDPOINTS=true and DEV_ENDPOINT_SECRET in env
- Use header X-Dev-Secret: <secret>
- Review queue: GET /operators/vendors/submitted
- Decision: POST /operators/vendors/:id/approve | /reject
- Vendor dev token: POST /dev/token → use Authorization: Bearer dev:identity:<id>

---

## 16) Stripe Connect onboarding

- POST /vendors/stripe/onboarding (vendor-auth)
  - If STRIPE_SECRET_KEY is not set → 501 with guidance
  - If set → creates a Connect Express account (if missing), persists vendor.stripe_connect_account_id, creates an Account Link and returns { url }
- POST /webhooks/stripe
  - Handles account.updated; stores capability flags under vendor.metadata.stripe_capabilities
  - Production: configure raw-body middleware and STRIPE_WEBHOOK_SECRET for signature verification

---

## 17) Vendor Portal (Portal Roaster) scaffolding (MVP)

- App: apps/portal-roaster (Next.js, dev at http://localhost:3002)
- Implemented pages
  - /intake → start intake, autosave, submit (uses POST/PUT /vendors/intake and POST /vendors/intake/submit)
  - /status → shows vendor_status and starts Stripe onboarding (POST /vendors/stripe/onboarding)
- API usage
  - GET /vendors/intake → fetch authenticated vendor + status
  - POST/PUT /vendors/intake, POST /vendors/intake/submit
  - POST /vendors/stripe/onboarding
