# Platform Admin App – Getting Started

This guide helps you bring up the Platform Admin application locally and understand the basics: purpose, run commands, environment, and first checks. We’ll expand this as the app is scaffolded.

For architecture separation and rationale, see `docs/medusa-vs-platform-admin-interfaces-guide.md`.


## Purpose

- Central, privileged interface for platform operators
- View/search across all organizations, roasters, orders, payouts (future)
- Manage approvals, flags, audits, and configuration (future)

Security note: This app will be protected by an admin-only actor type. Do not blend admin capabilities into tenant-facing portals.


## Prerequisites

- Monorepo setup with pnpm
- Medusa server running locally (API provider)
- Admin authentication configured (Stytch admin flow or Medusa admin auth – TBD)

Recommended env:
- `NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000`


## Start the app (local)

```bash
pnpm -C apps/admin-platform dev
```

By default the app runs on port 4000 (adjust if your workspace uses a different port).


## First-time checks

- Visit `http://localhost:4000/`
- Login page should render (placeholder if not yet scaffolded)
- On login (once implemented), an admin-only home/dashboard should load


## Troubleshooting

- Build issues: run `pnpm nx reset` then re-run dev
- 401s on API: ensure admin auth flow is configured and tokens/headers are sent
- CORS: if calling Medusa from a different origin, ensure allowed origins are configured in the server


## What’s next

- Implement admin auth guard (separate admin actor type)
- Add an “All Orders” table powered by backend admin-scoped endpoint
- Wire filters: org, roaster, date range, status


## Related docs

- Admin vs other interfaces: `docs/medusa-vs-platform-admin-interfaces-guide.md`
- Architecture & security: `docs/architecture/security-considerations.md`
- Payments roadmap: `docs/stories/5.2.multi-party-payment-processing.md`
