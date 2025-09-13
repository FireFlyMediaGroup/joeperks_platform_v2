# Joe Perks Marketplace Implementation Plan

Medusa v2 + Marketplace Plugin + Stytch + Supabase + Stripe Connect

Last updated: 2025-09-12

## 1) Purpose and Summary

This document consolidates what we learned from our review of the PRD, current repo state, and the Medusa 2 marketplace plugin by Tech-Labi. It defines an atomic, step-by-step plan to bring the project into alignment with our stated goals:

- Medusa v2 backend with marketplace capabilities
- Supabase Postgres for development (no local Postgres by default)
- Stytch for authentication and RBAC (replace Kinde)
- Stripe Connect for multi-party payouts
- Multi-tenant data isolation and campaign-based fundraising flows

## 2) Current State (Concise)

- Monorepo: Nx-based with multiple Next.js apps (customer-storefront, platform-admin, organization-dashboard, coffee-roaster)
- Backend: Medusa v2 app present at `apps/medusa-server` using MikroORM; configured with `DATABASE_URL`
- Storefront: Two parallel storefronts exist (`apps/storefront` and `customer-storefront`) causing confusion
- Auth: Kinde presently referenced in code/libs; our decision is to standardize on Stytch
- DB: Local Postgres/Redis suggested by setup-dev.sh; our decision is Supabase Postgres for dev
- Marketplace: No vendor isolation modules yet; plugin candidate identified: `@techlabi/medusa-marketplace-plugin`
- Payments: Stripe provider references on frontend; backend Connect logic not yet implemented

## 3) Guiding Principles

- Single source of truth: backend business logic in Medusa v2 modules/services
- Multi-tenant by default: every request resolves tenant context and enforces it in DB/service layer
- Cloud-first dev: Supabase Postgres via `DATABASE_URL` (no local DB by default)
- Minimal patching: adopt marketplace plugin backend-only first; add UI patch later only if needed
- Security: Stytch for auth; principle of least privilege; secure secrets management

## 4) Atomic Step-by-Step Plan

The plan is sequenced; each step should be a small mergeable PR with tests/checks.

### Phase 0 — Repo hygiene and docs
0.1 Decide the canonical storefront: choose either `apps/storefront` (Medusa starter) or `customer-storefront`.
0.2 Align Nx scripts, Vercel config, and CI to the chosen app. Remove/archive the other to avoid drift.
0.3 Update README and docs to reflect the chosen storefront path.

Deliverables:
- Consistent dev/build scripts
- Single storefront path in Vercel config

### Phase 1 — Medusa v2 baseline hardening
1.1 Confirm `apps/medusa-server/medusa-config.ts` has correct CORS and secrets.
1.2 Ensure `.env` for Medusa reads `DATABASE_URL` (works with Supabase). Add `.env.example` entries for all required secrets.
1.3 Add a minimal health route test or script to validate server boots on `DATABASE_URL`.

Deliverables:
- Bootable Medusa v2 with Supabase URL
- Smoke test proving server up on localhost:9000

### Phase 2 — Supabase-first development
2.1 Remove local Postgres defaults from `setup-dev.sh` (make Docker DB optional via a flag like `USE_LOCAL_DB=1`).
2.2 Update test bootstrap (`test/setup.ts`) to require `TEST_DATABASE_URL`; fail loudly if unset (no localhost fallback).
2.3 Document how to get Supabase credentials and set `DATABASE_URL` for dev and test.

Deliverables:
- Dev/test run from Supabase URLs
- Clear docs; optional local DB behind explicit flag

### Phase 3 — Auth migration to Stytch
3.1 Inventory all Kinde usage (frontend libs, middleware, shared libs) and replace with Stytch SDKs.
3.2 Define role model and claims mapping (platform_admin, roaster, organization, customer) via Stytch RBAC.
3.3 Implement server-side token validation and session middleware on backend routes.
3.4 Update frontend login/logout flows and guards; replace Kinde envs with Stytch envs in `.env` files.
3.5 Backfill unit tests for token validation, RBAC checks, and protected routes.

Deliverables:
- Stytch-powered auth and RBAC across apps
- Tests covering role checks and session validation

### Phase 4 — Integrate Marketplace Plugin (backend-only)
4.1 Add plugin to workspace root (pnpm workspace):
- `pnpm add -w @techlabi/medusa-marketplace-plugin`
4.2 Register plugin in `apps/medusa-server/medusa-config.ts` plugins array.
4.3 Add `API_KEY` to `apps/medusa-server/.env` (super admin creation secret). If not using Medusa Admin UI, skip `VITE_BACKEND_URL`.
4.4 Run migrations: `npx medusa db:migrate` from `apps/medusa-server`.
4.5 Create super admin via `POST /stores/super` with `Authorization: API_KEY`.
4.6 Map plugin “vendor store” to our domain “roaster”; document entity ownership and isolation.

Deliverables:
- Vendor store isolation enabled in backend
- Super admin account for marketplace oversight

### Phase 5 — Stripe Connect payouts (marketplace)
5.1 Create onboarding flow for roasters (Connect accounts) and organizations if needed.
5.2 Implement webhook handlers (payment_intent.*, transfer.*, account.updated).
5.3 Implement transfer logic per order: split wholesale + shipping to roaster, fundraising amount to organization, platform fee captured.
5.4 Add reconciliation job and audit trail (persist transfer IDs).
5.5 Add tests: unit for split calc; integration for webhook and transfer execution (using Stripe test keys).

Deliverables:
- End-to-end payout flow with audit trail
- Tests validating splits, idempotency, and webhooks

### Phase 6 — Campaigns and fundraising
6.1 Implement Campaign and Organization models in Medusa modules (or link to existing tables if retained), and expose CRUD APIs.
6.2 Link Orders -> Campaign -> Organization; persist fundraising amounts and totals.
6.3 Add storefront campaign context (pricing banners, progress, availability rules).
6.4 Add analytics endpoints for orgs and platform admin.

Deliverables:
- Campaign lifecycle and attribution to orders
- Basic analytics endpoints per PRD

### Phase 7 — Multi-tenant enforcement
7.1 Tenant extraction: from subdomain/headers to resolve org/roaster context.
7.2 Enforce tenant filters in all read/write paths of Medusa services (and/or DB-level policies where feasible).
7.3 Add end-to-end tests to ensure cross-tenant access is not possible.

Deliverables:
- Verified tenant isolation with tests

### Phase 8 — Admin UIs alignment
8.1 Platform Admin app: super admin functions (vendor management, impersonation, approvals, global analytics).
8.2 Roaster Portal: vendor-context views for catalog, orders, fulfillment documents.
8.3 Organization Dashboard: campaign management, storefront branding, marketing tools.
8.4 Optional: If we adopt Medusa Admin, enable plugin’s postinstall patch; otherwise keep our custom UIs.

Deliverables:
- Role-specific admin UIs matching PRD

### Phase 9 — CI/CD, environments, observability
9.1 CI: Nx cache, Medusa build, migrations, unit/integration tests; add Stripe webhook mocking.
9.2 Environments: Dev (Supabase, Stripe test), Staging (separate Supabase project), Prod; secrets via env managers.
9.3 Observability: request/response logging (PII-safe), error tracking; performance metrics for KPIs.

Deliverables:
- Reliable pipeline with environment parity checks

### Phase 10 — Acceptance criteria and verification
10.1 For each phase, define acceptance tests and smoke checks (e.g., create vendor, create campaign, purchase coffee, transfers executed, analytics updated).
10.2 Document rollback steps and feature flags where applicable.

Deliverables:
- Checklists per phase; smoke scripts where possible

## 5) Code/Config Snippets (for reference)

Medusa plugin registration (apps/medusa-server/medusa-config.ts):

```ts
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: { /* CORS + secrets */ },
  },
  plugins: [
    { resolve: "@techlabi/medusa-marketplace-plugin", options: {} },
  ],
})
```

Plugin env (.env for apps/medusa-server):

```bash
# Marketplace plugin
API_KEY=supersecret
# Optional if using Medusa Admin UI widgets
# VITE_BACKEND_URL=http://localhost:9000
```

Create super admin (after migrations):

```bash
curl -X POST http://localhost:9000/stores/super \
  -d '{ "email":"admin@test.com", "password": "supersecret" }' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: supersecret'
```

Stripe Connect high-level split (pseudo):

```ts
const { subtotal, shipping_cost } = order
const platform_fee = calcPlatformFee(order)
const organization_amount = calcFundraisingAmount(order)
const roaster_amount = subtotal - organization_amount + shipping_cost
// Create transfers after payment success
```

## 6) Risks and Mitigations

- Auth migration scope: phased replacement, feature flags, integration tests
- Plugin admin patch risk: avoid initially by backend-only adoption
- Stripe Connect complexity: start with minimal flows; extensive tests; idempotency keys
- Tenant isolation: enforce at service layer; add exhaustive access tests

## 7) Timeline (indicative)

- Week 1: Phases 0–2
- Week 2: Phase 3 (Stytch) — begin Phase 4
- Week 3: Finish Phase 4; start Phase 5 (Stripe Connect)
- Week 4: Phase 6–7 (campaigns + isolation)
- Week 5: Phase 8–9 (admin UIs + CI/CD)
- Week 6: Phase 10 (acceptance, hardening)

## 8) Definition of Done (overall)

- Single storefront path; Medusa v2 stable on Supabase
- Stytch auth live with RBAC
- Marketplace plugin powering vendor separation (roasters)
- Stripe Connect payouts live with audit trail
- Campaign workflows integrated; multi-tenant isolation enforced
- CI/CD green; docs up-to-date; acceptance checks pass

