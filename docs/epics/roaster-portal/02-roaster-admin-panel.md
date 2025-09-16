# Roaster Admin Panel

This document describes the Roaster (Vendor) portal: its URL structure, authentication, org slug routing, security boundaries, and how future developers should extend it safely.


## Overview

The Roaster portal is a Next.js app at `apps/portal-roaster` that enables coffee roasters (aka vendors) to:
- Sign in via Stytch magic links
- Land on an organization-specific dashboard scoped to their roaster account
- View orders and manage products (incrementally built)

Key security principles:
- Server is the authority. The portal and backend always scope by the authenticated vendor admin actor; client-provided slugs or IDs are never trusted for authorization.
- URL slugs improve UX only. The slug `/o/{org-slug}/…` is not a security boundary. It is validated against the authenticated vendor and corrected if wrong.


## URLs and Routing

- Sign-in:
  - Prod: `https://portal.<your-domain>/auth/login`
  - Dev: `http://localhost:3002/auth/login`
- Auth callback: `/auth/callback`
- Post-login: `/o/me/dashboard` → page fetches canonical slug and redirects to `/o/{slug}/dashboard`
- Org-scoped pages (examples):
  - `/o/{slug}/dashboard`
  - `/o/{slug}/orders`
  - `/o/{slug}/products` (future)

Middleware (`apps/portal-roaster/src/middleware.ts`) protects all non-public routes and currently requires a valid session cookie.


## Authentication Flow (Stytch)

1) User requests magic link on `/auth/login`.
2) Stytch redirects to `/auth/callback` with discovery/magic link params.
3) We complete Stytch auth, obtain a `session_token`, and persist it:
   - `localStorage.stytch_session_token` (used for API Bearer auth to Medusa)
   - Set `jp_session` httpOnly cookie via POST `/api/session/set`
4) Redirect to `/o/me/dashboard`.

Files:
- Login: `apps/portal-roaster/src/app/auth/login/page.tsx`
- Callback: `apps/portal-roaster/src/app/auth/callback/page.tsx`
- Session cookie API: `apps/portal-roaster/src/app/api/session/set/route.ts`

Environment:
- `NEXT_PUBLIC_MEDUSA_URL` (e.g., `http://localhost:9000`)
- `NODE_ENV` impacts cookie `secure` flag


## Cookies and Client Storage

- `jp_session` (httpOnly):
  - Purpose: Protect portal routes and signal logged-in state to middleware
  - Security: httpOnly, sameSite=lax, secure in production
  - Set by: `/api/session/set` after Stytch callback completes

- `jp_org` (httpOnly, optional):
  - Purpose: UX hint for last-used org slug; never trusted for authorization
  - Optional; safe to remove if not needed

- LocalStorage:
  - `stytch_session_token`: Used to send `Authorization: Bearer` to backend Medusa routes (server validates this token)
  - `stytch_user_email`: UX-only for displaying current user email


## Org Slug Routing and Validation

- The portal uses `/o/{org-slug}/…` routes for clarity and shareable URLs.
- Slug is validated by fetching the current vendor from the backend and comparing to the route param. If mismatched, the page redirects to the canonical slug.
- Pages:
  - `apps/portal-roaster/src/app/o/[org]/dashboard/page.tsx`
  - `apps/portal-roaster/src/app/o/[org]/orders/page.tsx`


## Backend Endpoints (Medusa Server)

- `GET /vendors/me` → returns the authenticated vendor and a canonical slug.
  - File: `apps/medusa-server/src/api/vendors/me/route.ts`
  - Source of truth for vendor identity comes from the server’s `auth_context.actor_id` (populated via Stytch auth middleware in the server).
  - Slug logic: use `vendor.metadata.slug` if present, otherwise a deterministic slugified `vendor.name` fallback.

- Vendor-scoped orders endpoint (planned):
  - `GET /vendors/orders` → list orders for the authenticated vendor (not yet implemented; see Roadmap below).

- Dev-gated endpoints: We currently have some dev/ops endpoints (e.g., org orders, operator split runner). These are shielded by `ENABLE_DEV_ENDPOINTS` and an `X-Dev-Secret` header in development.


## Security Model and Best Practices

- Never trust client-provided `orgSlug` or `orgId`. Resolve org/vendor from the server-side authenticated actor on each request.
- Treat the slug as UX-only. Always validate slug against the current vendor; redirect if it doesn’t match.
- Use httpOnly cookies (`jp_session`) to guard portal routes in middleware.
- Send the Stytch session token as a Bearer token on backend API calls. The backend must validate it and map to a vendor admin actor.
- Avoid passing free-form org/vendor IDs in client requests; the backend should derive them from auth context.
- Separate platform admin capabilities (see Platform Admin Separation) to reduce risk of cross-tenant data exposure.


## Local Development

- Set environment variables:
  - Portal: `NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000`
  - Optional in dev: `NEXT_PUBLIC_DEV_ENDPOINT_SECRET=...` (if calling dev-gated endpoints)
- Start services:
  - `pnpm -C apps/medusa-server dev` (or `build`/`start` as configured)
  - `pnpm -C apps/portal-roaster dev`
- Visit `http://localhost:3002/auth/login` and complete the Stytch flow.
- You should land on `/o/me/dashboard`, which will correct to `/o/{slug}/dashboard`.


## Testing and QA

- Unauthenticated access to `/o/{slug}/...` should redirect to `/auth/login`.
- After login, reloading `/o/{slug}/dashboard` should not cause loops.
- Changing the slug in the URL manually should redirect back to the canonical slug.
- Verify `jp_session` is set as httpOnly and `secure` in production.
- Ensure backend returns vendor and slug on `GET /vendors/me` only for authenticated vendor admins.


## Platform Admin Separation (Planned)

- A separate app (e.g., `apps/platform-admin`) with its own login and admin actor type.
- Admin-only server routes and UI that can list/search all orgs/vendors/orders system-wide.
- The roaster portal will remain strictly vendor-scoped; it should not acquire admin capabilities to avoid privilege bleed.


## Roadmap / Future Work

1) Vendor-scoped Orders API
   - Add `GET /vendors/orders` on Medusa backend:
     - Derive vendor from auth context; do not accept vendor/org IDs from client.
     - Option A: Link orders directly to vendors via a module link and query by that link.
     - Option B: Derive via order items → variants → products → vendor links.
   - Update `/o/[org]/orders` to use this endpoint (replace current dev placeholder).

2) Persist and Enforce Unique Slugs
   - Store `metadata.slug` at vendor creation (and when missing) using the slugification utility.
   - Enforce uniqueness at the DB level or at least at the app level with retries.
   - Consider an admin-only control to update slugs and a redirect strategy for old slugs.

3) Auth Hardening and Observability
   - Centralize Stytch token validation on the server with robust error handling.
   - Add audit logs for vendor login, slug changes, orders access.
   - Add rate limiting and anomaly detection for auth endpoints.

4) UX Enhancements
   - Org switcher UI for multi-organization members (via Stytch discovery response).
   - First-time setup checklist in dashboard.

5) Documentation and Samples
   - Add Postman or REST Client examples for `/vendors/me` and vendor orders.
   - Add an end-to-end test covering login → slug correction → orders fetch.


## Troubleshooting

- Loop back to login:
  - Ensure `/api/session/set` returns 200 and sets `jp_session` (check browser devtools → Application → Cookies).
  - If in dev over http, ensure `secure` cookies aren’t blocked by your browser settings.

- 401 on `/vendors/me`:
  - Verify `Authorization: Bearer <stytch_session_token>` header is sent.
  - Ensure backend Stytch validation middleware is active and mapping to a vendor admin actor.

- Wrong slug redirecting:
  - This is expected. The page will auto-redirect to the canonical slug from the server.


## Code Map (Quick Links)

- Portal
  - Middleware: `apps/portal-roaster/src/middleware.ts`
  - Session Cookie API: `apps/portal-roaster/src/app/api/session/set/route.ts`
  - Auth Callback: `apps/portal-roaster/src/app/auth/callback/page.tsx`
  - Org Dashboard: `apps/portal-roaster/src/app/o/[org]/dashboard/page.tsx`
  - Org Orders (placeholder fetch): `apps/portal-roaster/src/app/o/[org]/orders/page.tsx`

- Backend
  - Vendor service: `apps/medusa-server/src/modules/marketplace/service.ts`
  - Vendor model: `apps/medusa-server/src/modules/marketplace/models/vendor.ts`
  - Vendor admin model: `apps/medusa-server/src/modules/marketplace/models/vendor-admin.ts`
  - Vendors “me” API: `apps/medusa-server/src/api/vendors/me/route.ts`
  - Order split workflow (context): `apps/medusa-server/src/workflows/marketplace/calculate-order-splits/index.ts`


## Developer Notes / Do’s and Don’ts

- Do scope all backend queries by the authenticated vendor from `auth_context`.
- Don’t accept `vendorId` or `orgSlug` from the client as an authority.
- Do prefer server-derived context over client inputs for all authorization decisions.
- Don’t surface admin-level data in the roaster portal.
- Do write unit/integration tests whenever changing auth or routing logic.
- Do update this documentation when adding new portal features or routes.

