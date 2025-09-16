# Medusa Server (Backend API) – Getting Started

This guide helps you run the Medusa backend locally, apply migrations, and smoke test key endpoints used by the apps.

For deeper architecture notes, see `docs/architecture/` and `docs/greenfield/03_backend_medusa_v2.md`.


## Prerequisites

- Node.js and pnpm installed
- Database URL configured (Supabase PostgreSQL recommended)
- Optional: Redis URL for cache/sessions

Suggested env (dev):
- `DATABASE_URL=postgres://...`
- `REDIS_URL=redis://...` (optional)
- `PORT=9000`
- Any feature flags (e.g., `ENABLE_DEV_ENDPOINTS=true`)


## Install and run

```bash
# Install deps at repo root
pnpm install

# Start Medusa server in dev
pnpm -C apps/medusa-server dev
```

Build (CI parity):
```bash
pnpm -C apps/medusa-server build && pnpm -C apps/medusa-server start
```


## Database

- Migrations live under `apps/medusa-server/src/**/migrations`
- To apply migrations during development, follow project scripts, e.g.,

```bash
pnpm nx run medusa-server:migrate
```

If you encounter DB issues, verify `DATABASE_URL` and that your user has permissions to create/alter tables.


## Smoke tests

- Health or root: `GET http://localhost:9000/`
- Vendors self endpoint: `GET http://localhost:9000/vendors/me` (requires `Authorization: Bearer <stytch_session_token>`)
- Org orders (dev-only if enabled): `GET http://localhost:9000/organizations/orders`


## Troubleshooting

- Build errors: ensure TypeScript version matches monorepo, run `pnpm nx reset`
- CORS: set allowed origins as needed
- 401 from protected routes: verify Stytch session token header and server-side auth mapping


## Next steps

- Implement vendor-scoped orders endpoint (`GET /vendors/orders`)
- Wire event subscribers to automatically compute order splits post-placement/capture
- Add admin-only endpoints for platform operations (separate admin app)


## Related docs

- Security: `docs/architecture/security-considerations.md`
- Marketplace status: `docs/marketplace-integration-status.md`
- Order splitting workflow: `apps/medusa-server/src/workflows/marketplace/calculate-order-splits/`
