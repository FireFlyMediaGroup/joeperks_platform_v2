# Roaster Portal – Getting Started

This short guide helps you run and verify the Roaster (Vendor) portal locally and understand the essentials: login, slug routing, and security.

For a deeper dive, see the detailed doc: `docs/epics/roaster-portal/02-roaster-admin-panel.md`.


## Prerequisites

- Monorepo installed with pnpm
- Medusa server configured and running locally
- Stytch project credentials configured (see `docs/setup/06-stytch-auth-summary.md`)
- Recommended env var for the portal:
  - `NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000`


## Start the services

1) Start the Medusa backend (port 9000)

```bash
pnpm -C apps/medusa-server dev
```

2) Start the roaster portal (port 3002)

```bash
pnpm -C apps/portal-roaster dev
```


## Sign in

- Open: `http://localhost:3002/auth/login`
- Request a magic link (Stytch) and complete the flow.
- On successful callback, the app will:
  - Store `stytch_session_token` in localStorage
  - Set an httpOnly cookie `jp_session` via `/api/session/set`
  - Redirect to `/o/me/dashboard`


## Org slug routing

- The portal uses org slugs for clarity: `/o/{slug}/...`
- After login, `/o/me/dashboard` will fetch your canonical slug from the backend and redirect to `/o/{slug}/dashboard`.
- If you manually change the slug in the URL, the app will correct it back to the canonical one.


## Verify backend identity

- The backend provides a self-service endpoint:
  - `GET {MEDUSA_URL}/vendors/me`
  - Send header: `Authorization: Bearer <stytch_session_token>`
- It returns the authenticated vendor and a canonical slug. The backend ignores any client-provided slug/IDs for authorization.


## Security notes (must know)

- Slug is UX-only, not a security boundary.
- The backend scopes all data using the authenticated vendor admin actor derived from the Stytch session.
- The httpOnly `jp_session` cookie protects the portal routes; the Bearer token authorizes backend API calls.
- Avoid passing org/vendor IDs from the client—let the server derive them from auth context.


## Troubleshooting

- Loop to login: confirm `/api/session/set` returns 200 and `jp_session` is present (Browser DevTools → Application → Cookies).
- 401 from `/vendors/me`: ensure the `Authorization: Bearer <token>` header is set and the Medusa server’s Stytch validation is active.
- Wrong slug in URL: expected; the page will redirect to the canonical slug.


## What’s next?

- Use the Orders page at `/o/{slug}/orders` to view orders (dev placeholder for now).
- We’ll replace the dev fetch with a vendor-scoped endpoint (`GET /vendors/orders`) that derives vendor from auth and returns only that vendor’s orders.
- For in-depth architecture and future dev guidance, read:
  - `docs/epics/roaster-portal/02-roaster-admin-panel.md`
