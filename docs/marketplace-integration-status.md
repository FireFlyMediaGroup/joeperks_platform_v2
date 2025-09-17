# Marketplace Plugin Integration Status

> Note: The community plugin approach is archived. We adopted the official Medusa v2 native marketplace recipe. This document remains as a historical record of the plugin investigation and resolution.


## Overview
This document tracks the status of integrating the @techlabi/medusa-marketplace-plugin into the Joe Perks platform.

## Current Status: ✅ OFFICIAL IMPLEMENTATION IN PROGRESS

### Implementation Summary
Successfully removed the incompatible plugin and started implementing the official Medusa v2 marketplace recipe using native features.

### Technical Details

#### Error Description
```
Error: Workflow with id "create-fulfillment-workflow" and step definition already exists.
```

#### Root Cause
The marketplace plugin attempts to register workflows that already exist in Medusa core v2.10.2, specifically:
- `create-fulfillment-workflow` - This workflow is now part of core Medusa flows

#### Impact
- Server fails to start when the plugin is enabled
- Cannot proceed with marketplace functionality implementation
- Multi-vendor features are not available

## Attempted Solutions

### 1. Plugin Installation ✅
- Successfully installed @techlabi/medusa-marketplace-plugin v0.34.0
- Added to package.json dependencies

### 2. Configuration ✅
- Added plugin to medusa-config.ts (currently disabled)
- Set required environment variables:
  - `API_KEY=supersecret`
  - `VITE_BACKEND_URL=http://localhost:9000`

### 3. Database Migration ⚠️
- Ran migrations successfully with one minor error (pgcrypto extension)
- Marketplace-related tables were created in the database

### 4. Postinstall Script ❌
- Plugin requires postinstall script for admin UI patches
- Script fails because @medusajs/dashboard/dist directory doesn't exist
- This suggests the plugin expects a different Medusa setup

## Alternative Approaches

### Option 1: Plugin Version Compatibility
**Action**: Research if there's a newer version of the marketplace plugin compatible with Medusa v2.10.2
**Status**: Needs investigation
**Risk**: Low - just version checking

### Option 2: Medusa Version Downgrade
**Action**: Downgrade Medusa to a version compatible with the plugin
**Status**: Not recommended
**Risk**: High - may break existing functionality

### Option 3: Custom Multi-Vendor Implementation
**Action**: Implement marketplace functionality using native Medusa v2 features
**Status**: Recommended fallback
**Risk**: Medium - requires custom development

### Option 4: Fork and Fix Plugin
**Action**: Fork the plugin and update it for Medusa v2.10.2 compatibility
**Status**: Possible but time-intensive
**Risk**: High - requires deep understanding of both codebases

## ✅ SOLUTION IMPLEMENTED: Official Medusa v2 Marketplace Recipe

After researching alternatives, I discovered that **Medusa v2 has official documentation for building marketplaces** using native features without requiring external plugins.

### 🎉 COMPLETED IMPLEMENTATION STEPS

#### ✅ Phase 1: Core Marketplace Module (COMPLETED)
1. **✅ Marketplace Module Created**
   - ✅ Vendor data model with id, handle, name, logo, admins relationship
   - ✅ VendorAdmin data model with id, first_name, last_name, email, vendor relationship
   - ✅ MarketplaceModuleService with auto-generated CRUD operations
   - ✅ Module definition and export

2. **✅ Module Links Defined**
   - ✅ vendor-product.ts - Links vendors to products (one-to-many)
   - ✅ vendor-order.ts - Links vendors to orders (one-to-many)
   - ✅ Database migrations generated and applied successfully

3. **✅ Vendor Creation Workflow**
   - ✅ createVendorStep - Creates vendor with compensation function
   - ✅ createVendorAdminStep - Creates vendor admin with compensation function
   - ✅ createVendorWorkflow - Orchestrates vendor and admin creation
   - ✅ Authentication integration with setAuthAppMetadataStep

4. **✅ Vendor API Routes**
   - ✅ POST /vendors - Create vendor with admin
   - ✅ Authentication middleware for vendor actor type
   - ✅ Request validation with Zod schema
   - ✅ Proper error handling and response formatting

#### 🚧 Next Steps: Phase 2 Implementation
- [ ] Product management workflows and API routes
- [ ] Order splitting and management
- [ ] Storefront integration
- [ ] Testing and validation

### Official Medusa Marketplace Recipe
- **Documentation**: https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors
- **Repository**: https://github.com/medusajs/medusa/tree/develop/examples/marketplace
- **Approach**: Uses Medusa's native module system, workflows, and API routes

### Key Benefits of Official Approach
1. **No Plugin Dependencies** - Uses only native Medusa v2 features
2. **Full Compatibility** - Guaranteed to work with current Medusa version
3. **Official Support** - Maintained by Medusa team
4. **Customizable** - Full control over implementation
5. **Production Ready** - Based on Medusa's best practices

## Recommended Implementation Plan

### Phase 1: Core Marketplace Module (1-2 weeks)
1. **Create Marketplace Module**
   - Vendor data model with handle, name, logo
   - VendorAdmin data model for vendor management
   - Module service with CRUD operations

2. **Define Module Links**
   - Link vendors to products
   - Link vendors to orders
   - Enable cross-module data relationships

3. **Authentication Setup**
   - Custom "vendor" actor type for vendor admins
   - Registration and login workflows
   - JWT token management

### Phase 2: Vendor Management (1-2 weeks)
4. **Vendor Creation Workflow**
   - Create vendor and admin in single transaction
   - Associate auth identity with vendor admin
   - Handle rollback scenarios

5. **Vendor API Routes**
   - POST /vendors - Create vendor with admin
   - Authentication and validation middlewares
   - Proper error handling

### Phase 3: Product Management (1-2 weeks)
6. **Vendor Product Workflows**
   - Create products linked to vendors
   - Retrieve vendor-specific products
   - Product management permissions

7. **Product API Routes**
   - POST /vendors/products - Create vendor products
   - GET /vendors/products - List vendor products
   - Vendor-only access controls

### Phase 4: Order Processing (2-3 weeks)
8. **Order Splitting Logic**
   - Group cart items by vendor
   - Create parent order + child orders per vendor
   - Link orders to respective vendors

9. **Order Management**
   - Vendor-specific order retrieval
   - Order status management per vendor
   - Compensation functions for failures

### Phase 5: Integration & Testing (1 week)
10. **Storefront Integration**
    - Modify checkout flow to use custom order creation
    - Vendor filtering and display
    - Multi-vendor cart handling

11. **Admin Dashboard**
    - Vendor management interface
    - Cross-vendor analytics
    - Super admin capabilities

## Technical Architecture Notes

### Database Schema
The plugin successfully created these marketplace-related tables:
- Vendor store management tables
- Entity-store relationship tables
- Multi-tenant isolation structures

### Required Features for Joe Perks Marketplace
1. **Vendor Store Isolation**
   - Each roaster operates as independent vendor
   - Separate product catalogs per vendor
   - Independent order management

2. **Super Admin Capabilities**
   - Cross-vendor analytics and management
   - Vendor onboarding and approval
   - Platform-wide configuration

3. **Customer Experience**
   - Single storefront with multiple vendors
   - Unified cart and checkout
   - Vendor-specific product filtering

## Files Modified
- `package.json` - Added plugin dependency
- `apps/medusa-server/medusa-config.ts` - Plugin configuration (disabled)
- `apps/medusa-server/.env` - Environment variables
- Database - Marketplace tables created via migrations

## Environment Variables Set
```bash
API_KEY=supersecret
VITE_BACKEND_URL=http://localhost:9000
```

## Current Plugin Status
```typescript
// In medusa-config.ts - DISABLED due to compatibility issues
plugins: [
  // { resolve: "@techlabi/medusa-marketplace-plugin", options: {} },
],
```

## Next Immediate Steps

1. **Start with Phase 1** - Create the marketplace module following the official recipe
2. **Reference Implementation** - Use the official example repository as a guide
3. **Adapt for Joe Perks** - Customize the vendor model for coffee roaster requirements
4. **Incremental Development** - Build and test each phase before proceeding

## Estimated Timeline
- **Total Development Time**: 6-9 weeks
- **MVP (Phases 1-3)**: 4-6 weeks
- **Full Implementation**: 6-9 weeks
- **Testing & Deployment**: +1-2 weeks

---

**Last Updated**: 2025-09-15
**Status**: ✅ PHASE 1 COMPLETED - Core marketplace module implemented using official Medusa v2 recipe
**Next Action**: Begin Phase 2 - Product management workflows and API routes
**Reference**: https://docs.medusajs.com/resources/recipes/marketplace/examples/vendors

### Files Created/Modified in Implementation
- ✅ `apps/medusa-server/src/modules/marketplace/` - Complete marketplace module
- ✅ `apps/medusa-server/src/links/` - Vendor-product and vendor-order links
- ✅ `apps/medusa-server/src/workflows/marketplace/create-vendor/` - Vendor creation workflow
- ✅ `apps/medusa-server/src/api/vendors/route.ts` - Vendor API endpoint
- ✅ `apps/medusa-server/src/api/middlewares.ts` - Authentication and validation
- ✅ `apps/medusa-server/medusa-config.ts` - Module configuration
- ✅ Database migrations applied successfully


## Update — Internal API routing and vendor products (2025-09-14)

- Decision: Keep internal routing conventions (no `/api/v1` for now).
- Added endpoint: `POST /vendors/products`
  - Auth: vendor actor (session or bearer)
  - Creates product(s) via Product module and links them to the authenticated vendor using the vendor↔product link
- Added endpoint: `GET /vendors/products`
  - Auth: vendor actor
  - Lists products that belong to the authenticated vendor using Remote Query filters over the vendor↔product link
- Validation: Zod schema wired in middleware for POST

Example (POST create single product):

```json
{
  "product": {
    "title": "Sample Coffee",
    "description": "12oz bag",
    "options": [{ "title": "Size", "values": ["12oz"] }],
    "variants": [
      {
        "title": "12oz",
        "options": { "Size": "12oz" },
        "prices": [{ "amount": 1299, "currency_code": "usd" }]
      }
    ]
  }
}
```


## Dev-only endpoints and auth gating (2025-09-14)

To safely use dev-only helpers while sharing the same database:

- Dev helpers are disabled unless BOTH are true:
  - ENABLE_DEV_ENDPOINTS=true
  - X-Dev-Secret request header equals DEV_ENDPOINT_SECRET
- Applies to:
  - POST /dev/token
  - POST /dev/vendors
  - Dev bearer shortcut on /vendors/* (Authorization: Bearer dev:identity:… or dev:actor:…)

Environment variables:

```bash
# Only set locally; do NOT set in production
ENABLE_DEV_ENDPOINTS=true
DEV_ENDPOINT_SECRET=replace-with-a-strong-random-value
```

Example usage:

```bash
curl -s -X POST http://localhost:9000/dev/token \
  -H 'Content-Type: application/json' \
  -H 'X-Dev-Secret: REPLACE_ME' \
  -d '{"type":"identity","email":"owner@example.com"}'

curl -i -X POST http://localhost:9000/dev/vendors \
  -H 'Content-Type: application/json' \
  -H 'X-Dev-Secret: REPLACE_ME' \
  -d '{"name":"Test Vendor","handle":"test-vendor","admin":{"email":"owner@example.com"}}'

# Use returned token as Authorization: Bearer dev:actor:<vendor_admin_id>
```


## Clarification — Admin panels and product visibility (2025-09-15)

- Medusa Admin (/app) is the system of record and master list for ALL products across all vendors. Treat it as your internal back office; do not expose it to vendors.
- Platform Admin (apps/admin-platform) is the operator console for vendor onboarding/approval, product publishing decisions, commissions/payouts, and platform-wide settings (Stytch/Stripe/Supabase).
- Vendor Portal (apps/portal-roaster) is the vendor-scoped UI for roasters to create and manage their own products. Access is limited to their organization.

Typical data flow

```mermaid
flowchart LR
  V[Vendor Portal (Roaster)] --> A[POST /vendors/products (vendor auth)]
  A --> P[Medusa Product module (create Draft product)]
  P --> L[vendor↔product link stored]
  P --> R[Platform Admin: review/approve]
  R --> Pub[Publish + add to Sales Channel(s)]
  Pub --> S[Storefront visible]
  P --> M[Medusa Admin: full catalog view]
```

Notes
- Inventory is managed with Medusa Inventory/Stock Locations. Use locations and policies to scope stock per vendor/organization.
- Customer visibility is controlled by product status (Draft/Published) and Sales Channels. Vendors submit Drafts; operators approve/publish and assign channels.
- Filtering by vendor in Medusa Admin can be simplified via a vendor tag/metadata or by querying via the vendor↔product link.
- Vendors should NOT access Medusa Admin; they use the Vendor Portal. Operators use Platform Admin and Medusa Admin.
- Dev-only helpers (/dev/token, /dev/vendors) are guarded by ENABLE_DEV_ENDPOINTS + DEV_ENDPOINT_SECRET and must remain disabled in production.


## Clarification — Organizations vs Vendors, Campaigns, and Medusa Admin (2025-09-15)

Definitions
- Vendor (Coffee Roaster): supplies products and fulfills orders. Implemented as a Vendor entity in the marketplace module with vendor↔product and vendor↔order links. Operationally may have its own Stock Location and optional vendor-only Sales Channel for internal filtering.
- Organization (Fundraiser): runs Campaigns. Organizations are NOT vendors.
- Campaign: the purchasable context for a fundraiser. Maps 1:1 to a Medusa Sales Channel and owns the curation of products for that fundraiser.

Key mapping
- Campaign = Sales Channel
  - Creating a Campaign should auto-create a Medusa Sales Channel and store its id on the Campaign.
  - Approved vendor products are attached to one or more Campaigns by adding them to the Campaign’s Sales Channel(s).
  - Orders placed via a Campaign storefront are naturally tagged with that Sales Channel.

How this ties into Medusa Admin
- Products: filter by a Campaign’s Sales Channel to see only products curated for that fundraiser.
- Orders: filter by the Campaign’s Sales Channel to see that fundraiser’s orders.
- Customers: “customers of a campaign” are those with orders in that Sales Channel (derive via orders). Surface a report in Platform Admin.
- Vendors: use Inventory Locations, tags/metadata (vendor:{handle}), and/or optional vendor channels for vendor-centric views.

Revised end-to-end flow

```mermaid
flowchart LR
  subgraph Vendors
    V1[Vendor Portal (Roaster)] --> D[Create Draft Product(s)]
  end
  D --> L[vendor↔product link]
  D --> R[Platform Admin Review]
  subgraph Fundraising
    O[Organization] --> C[Campaign]
    C --> SC[Sales Channel]
  end
  R --> |Approve & Assign| SC
  SC --> SF[Storefront (queries by channel)]
  SF --> Odr[Orders (channel = campaign)]
  Odr --> Payouts[Vendor payouts (Stripe Connect)]
  Odr --> Share[Org fundraising share]
  D --> MA[Medusa Admin: full catalog]
```

Notes
- A single product can belong to multiple Campaigns by being added to multiple Sales Channels.
- Keep vendor inventory in vendor-specific Stock Locations; assign appropriate fulfillment/shipping profiles per vendor.
- Platform Admin is where Organizations and Campaigns are managed; Medusa Admin remains the commerce back office.

Proposed next steps
- Add Organization and Campaign modules.
- Workflow: when creating a Campaign, auto-create a Medusa Sales Channel and store its id on the Campaign.
- Platform Admin screens: Organizations list/detail; Campaigns list/detail; “Attach/detach products to campaign” (add/remove from channel).
- Reports in Platform Admin: Orders per campaign, Customers per campaign, Vendor earnings vs Organization share.


## Roaster onboarding and approval automation (2025-09-15)

Goals
- Make it easy for coffee roasters to self-serve onboarding while ensuring compliance and payout readiness.
- Give operators a clear review queue and one-click approve/reject with audit trail.
- Automatically provision all Medusa/Stripe resources on approval.

States (vendor lifecycle)
- Invited → Registered → IntakeInProgress → Submitted → UnderReview → Approved | Rejected | Suspended

Key entities/fields
- Vendor (roaster): legal_name, doing_business_as, handle, website, support_email, support_phone, shipping_origin (address), tax_id (optional), metadata
- VendorAdmin (primary contact): name, email, phone, auth_identity_id (Stytch)
- Payouts: stripe_connect_account_id, payout_schedule, commission_rate, tax_forms_status
- Ops: default_stock_location_id, shipping_profile_id, fulfillment_prefs

Intake flow (Vendor Portal)
1) Account creation: Stytch email/password or magic link → create VendorAdmin with auth identity.
2) Business profile: legal info, address, contacts.
3) Stripe Connect onboarding: redirect to Express onboarding; return with account id; poll/receive webhooks until capabilities active.
4) Shipping & fulfillment: origin location, carriers, lead times, packaging.
5) Tax/compliance files: W‑9 (US) or equivalent; stored in secure storage (e.g., Supabase Storage) with restricted access.
6) Bank confirmation & preview: show calculated commissions and payout schedule.
7) Submit for review: transitions to Submitted.

Operator review (Platform Admin)
- Queue: shows Submitted vendors with key readiness checks (Stripe capabilities, required docs, completeness score).
- Detail: diff view of intake answers, flags, risk notes, comments.
- Actions: Approve, Reject (with reason), Request changes.

Automations on Approve
- Create Medusa Stock Location for the vendor.
- Optionally create a vendor-specific Sales Channel (internal filtering only; products will primarily attach to campaign channels).
- Create/assign Shipping Profile as per vendor prefs.
- Persist commission rate and payout config.
- Mark vendor status=Approved; notify vendor via email.

Automations on Reject
- Set status=Rejected with reason, notify vendor, allow resubmission edits.

Stripe integration
- Use Connect Express onboarding link; store stripe_connect_account_id on Vendor.
- Listen to account.updated webhooks; keep capabilities state in Vendor metadata.
- Block approval if payouts capability is not active.

API surface (Medusa server)
- POST /vendors/intake/start → create draft Vendor tied to auth identity
- PUT /vendors/intake → upsert intake sections (autosave)
- POST /vendors/intake/submit → Submitted
- GET /operators/vendors/submitted → review queue (operator-only)
- POST /operators/vendors/:id/approve → triggers approval workflow
- POST /operators/vendors/:id/reject → sets Rejected with reason

Workflows (Medusa v2)
- start-vendor-intake-workflow: create Vendor + VendorAdmin, initialize defaults
- submit-vendor-intake-workflow: validate completeness; require Stripe account id
- approve-vendor-workflow: create Stock Location, Shipping Profile, persist commission & payout settings, send notifications

Validation gates
- Required fields present (business + contact + shipping origin)
- Stripe Connect account exists and payouts capability active
- Required tax documents uploaded and verified (operator checklist)

Permissions
- Vendor endpoints guarded by vendor actor auth; operator endpoints guarded by operator/admin auth (Platform Admin only).

Medusa Admin tie-in
- After approval, vendor can create products; these appear in the Medusa Admin Products list (draft/published as usual).
- Inventory managed under the vendor’s Stock Location.
- Orders attributable to the vendor via vendor↔order link; operator can reconcile payouts.

UI checklist (to implement next)
- Vendor Portal: wizard with sections, autosave, Stripe Connect link, submit button, status banner.
- Platform Admin: review queue, detail view with readiness checks, Approve/Reject actions.
- Notifications: email templates for invite, request changes, approved, rejected.


## Developer Steps Summary — Intake and Operator Endpoints (2025-09-15)

Implemented now (dev-gated where noted):
- Vendor intake
  - POST /vendors/intake  → start (allows unregistered vendor auth)
  - PUT  /vendors/intake  → autosave intake draft into vendor.metadata.intake_draft
  - POST /vendors/intake/submit → mark status=submitted
- Operator review (dev-gated via ENABLE_DEV_ENDPOINTS + X-Dev-Secret)
  - GET  /operators/vendors/submitted → queue
  - POST /operators/vendors/:id/approve → status=approved, persist commission/payout schedule
  - POST /operators/vendors/:id/reject  → status=rejected with reason

Notes
- Vendor model extended with status/payout/ops fields and metadata; migration added.
- Replace dev-gated operator auth with Platform Admin auth before production.
- Next: implement approve workflow to provision Stock Location + Shipping Profile, and wire Stripe checks on submit/approve.


## Dev operator access and smoke testing (2025-09-15)

To exercise the dev-gated operator endpoints locally, set the following and restart the Medusa server:

```bash
# Only set locally; do NOT set in production
ENABLE_DEV_ENDPOINTS=true
DEV_ENDPOINT_SECRET=<choose-a-strong-random-value>
```

Example requests:

```bash
# Queue
curl -s http://localhost:9000/operators/vendors/submitted \
  -H "X-Dev-Secret: $DEV_ENDPOINT_SECRET"

# Approve with commission and payout schedule
curl -s -X POST http://localhost:9000/operators/vendors/<vendor_id>/approve \
  -H "Content-Type: application/json" \
  -H "X-Dev-Secret: $DEV_ENDPOINT_SECRET" \
  -d '{"commission_rate_bps": 1000, "payout_schedule": "weekly"}'
```

Note: Replace this dev gating with real Platform Admin auth before production.

## Stripe Connect onboarding endpoint (stub) (2025-09-15)

New route (vendor-auth): `POST /vendors/stripe/onboarding`

- If Stripe is not configured (no STRIPE_SECRET_KEY), returns 501 with guidance
- If Stripe is configured, currently returns 501 with next steps until SDK wiring is added

Env vars to add (local/dev):
```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

Planned implementation:
- Install stripe SDK
- Create Express account and onboarding link
- Persist vendor.stripe_connect_account_id
- Handle account.updated webhook to gate submit/approve based on capabilities

Approve-vendor workflow has been implemented to provision Stock Location + Shipping Profile and update vendor status. Next: wire real Stripe onboarding flow.



## Update — Approve-vendor workflow (2025-09-15)

- New workflow: approve-vendor
  - Creates a per-vendor Stock Location (Inventory module)
  - Creates a per-vendor Shipping Profile (Fulfillment module)
  - Updates Vendor: status=approved, saves commission_rate_bps/payout_schedule, stores references
- Route updated: POST /operators/vendors/:id/approve now runs the workflow (dev-gated)

Example:

```bash
curl -s -X POST http://localhost:9000/operators/vendors/<vendor_id>/approve \
  -H "Content-Type: application/json" \
  -H "X-Dev-Secret: $DEV_ENDPOINT_SECRET" \
  -d '{"commission_rate_bps": 1000, "payout_schedule": "weekly"}'
```



## Update — Stripe Connect onboarding implemented (2025-09-15)

- New vendor-auth route: POST /vendors/stripe/onboarding
  - Creates a Connect Express account per vendor (if missing) and persists vendor.stripe_connect_account_id
  - Creates an onboarding Account Link and returns { url }
  - Env: STRIPE_SECRET_KEY required; optional STRIPE_PUBLISHABLE_KEY
- New webhook: POST /webhooks/stripe
  - Handles account.updated events; stores capability flags under vendor.metadata.stripe_capabilities
  - In production, configure raw-body middleware and STRIPE_WEBHOOK_SECRET for signature verification

Example (dev):

```bash
export STRIPE_SECRET_KEY=sk_test_...
# optional: export STRIPE_WEBHOOK_SECRET=whsec_...

curl -s -X POST http://localhost:9000/vendors/stripe/onboarding \
 -H "Authorization: Bearer dev:actor:<vendor_admin_id>"
```

## Update — Intake status endpoint (2025-09-15)

- New route: GET /vendors/intake (vendor-auth)
  - Returns the authenticated vendor including vendor_status and metadata

## Update — Portal Roaster scaffolding (2025-09-15)

- New pages in apps/portal-roaster:
  - /intake → start intake, autosave draft, and submit (uses /vendors/intake endpoints)
  - /status → displays vendor status and starts Stripe onboarding (calls /vendors/stripe/onboarding)
- Uses NEXT_PUBLIC_MEDUSA_URL or defaults to http://localhost:9000
- Dev token is read from localStorage key dev_token (format: dev:actor:<vendor_admin_id>)



## Update — Stytch vendor auth integration (2025-09-16)

- Vendor endpoints now support Bearer Stytch session_token directly via middleware that validates with Stytch and maps to Medusa vendor admin.
- POST /vendors ensures a proper Medusa Auth Identity exists for provider "stytch" (entity_id = Stytch user_id) and passes its id to the create-vendor workflow, which then associates the identity with the created VendorAdmin via setAuthAppMetadataStep.
- Env required in apps/medusa-server:
  - STYTCH_PROJECT_ID
  - STYTCH_SECRET
- Dev note: You can still use dev-gated bearer helpers (Bearer dev:identity:… or dev:actor:…) during local development.
