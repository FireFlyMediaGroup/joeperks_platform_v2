# Epic: Clean Medusa v2 Backend Setup and Cutover

Owner: Backend
Status: Planned
Related: PRD, Architecture, DevOps

## Goal
Stand up a clean, officially supported Medusa v2 backend and admin, verify it locally with Node 20 LTS and PostgreSQL/Supabase, then port our custom functionality in small, testable steps. Cut over from the current apps/api once feature‑parity is reached.

## References
- Official install guide (v2): https://docs.medusajs.com/learn/installation
- create-medusa-app reference: https://docs.medusajs.com/resources/create-medusa-app
- Medusa configurations: https://docs.medusajs.com/learn/configurations/medusa-config
- Commerce modules overview: https://docs.medusajs.com/resources/commerce-modules

## Scope
- In scope: new Medusa app scaffold, DB config, local dev, admin login, CORS, seeding, Kinde auth integration, org/roaster domain, API routes, tests, build/start, cutover.
- Out of scope: storefront rewriting; production deployment details beyond start/build basics (tracked separately).

## Assumptions
- Node 20.x LTS used for Medusa dev per docs.
- PostgreSQL provided by Supabase (DATABASE_URL available). SSL via connection string (sslmode=require) — avoid NODE_TLS_REJECT_UNAUTHORIZED=0.
- Monorepo path for the new app will be apps/api-medusa.

## Risks & Mitigations
- Module autoload/TS bootstrap issues: mitigated by starting from create-medusa-app baseline and Node 20.x.
- Schema differences: plan migrations/seed carefully and validate data model decisions.
- Auth coupling: integrate Kinde cleanly via middleware and env‑driven config; cover with integration tests.

---

## Plan (Phased)

### Phase 1 — Baseline Scaffold & Run
- [ ] P1.1 Scaffold fresh Medusa v2 app
  - Command: `npx create-medusa-app@latest apps/api-medusa`
  - Accept default options (skip storefront for now)
  - Acceptance: Folder structure created; package install completes without errors
- [ ] P1.2 Configure DB connection (.env)
  - Add `DATABASE_URL` (Supabase) with `sslmode=require`
  - Acceptance: Environment file committed securely or managed via dev secrets
- [ ] P1.3 First dev run
  - Command: `npm run dev` (within apps/api-medusa)
  - Acceptance: Server up on http://localhost:9000 and Admin on /app
- [ ] P1.4 Create admin user
  - In Admin UI or via CLI: `npx medusa user -e <email> -p <password>`
  - Acceptance: Login succeeds; Admin dashboard accessible

### Phase 2 — Configuration & Security
- [ ] P2.1 CORS
  - Configure http.storeCors and http.adminCors in medusa-config.ts
  - Acceptance: Store/Admin requests succeed without CORS errors
- [ ] P2.2 SSL/DB driver options
  - Ensure no reliance on `NODE_TLS_REJECT_UNAUTHORIZED=0`
  - Acceptance: DB connections succeed using proper SSL settings only

### Phase 3 — Custom Features Port (Incremental)
- [ ] P3.1 Kinde Auth integration (backend)
  - Implement `setupKinde`, `protectRoute`, `getUser` middleware per our pattern
  - Env: Kinde issuer, client id/secret, etc.
  - Acceptance: Protected test route returns 401 unauthenticated; 200 when authed
- [ ] P3.2 Domain Modeling (Organization, Roaster, etc.)
  - Choose approach: custom module(s) under `src/modules` vs. simple API + services + models
  - Acceptance: Data models compiled; migrations exist if needed; CRUD working in isolation
- [ ] P3.3 API Routes
  - Port minimal org/roaster routes into `src/api`
  - Acceptance: Swagger/route tests return expected payloads; 2xx success

### Phase 4 — Data & Seed
- [ ] P4.1 Seed script
  - Place under `src/scripts` and run via `medusa exec`
  - Acceptance: Demo data inserted idempotently (ON CONFLICT DO NOTHING semantics)
- [ ] P4.2 Migrations
  - Use Medusa’s migration guidance (or Mikro‑ORM within module scope as appropriate)
  - Acceptance: `build` and `start` run without migration/runtime errors

### Phase 5 — Testing & Quality
- [ ] P5.1 Unit & Integration Tests
  - Auth middleware tests (Kinde)
  - API route smoke tests
  - Acceptance: CI/Local test run passes (Node 20.x)
- [ ] P5.2 Lint & Typechecks
  - Ensure repo scripts validate the new app
  - Acceptance: No blocking lints/type errors

### Phase 6 — Build, Start & Cutover
- [ ] P6.1 Production build/start
  - `npx medusa build` and `npx medusa start`
  - Acceptance: Server starts cleanly with all modules
- [ ] P6.2 Cutover plan
  - Update monorepo scripts to point `start:api`/`dev:api` at apps/api-medusa
  - Acceptance: Team uses new backend by default
- [ ] P6.3 Decommission legacy apps/api
  - Archive or remove after safety window
  - Acceptance: No consumers rely on legacy paths; docs updated

### Phase 7 — Documentation & Handover
- [ ] P7.1 Update PRD and Architecture docs
  - Reflect new backend, endpoints, auth, and data model
  - Acceptance: Docs reviewed and approved
- [ ] P7.2 Operations notes
  - Env vars, runbooks, troubleshooting
  - Acceptance: Onboarding time reduced; common issues documented

---

## Acceptance Criteria (Epic)
- A clean Medusa v2 backend runs locally with Node 20.x and connects to Supabase with SSL configured properly.
- Admin UI is accessible; an admin user can be created and logs in successfully.
- Kinde auth works and protects routes; tests cover success/failure paths.
- Organization/Roaster baseline features are ported and tested.
- Build/start succeed without module autoload/TS bootstrap errors.
- Old backend is decommissioned after cutover, with documentation updated.

## Tracking
- Use the checkboxes above to mark progress.
- Each Phase can be converted into Jira/GitHub tickets if needed, linking back to this epic.

