# Organization Dashboard  Getting Started

This guide helps you run the Organization Dashboard app locally and validate the basic flows (org-scoped orders view, auth, and sales channel context).

For design details and multi-tenant patterns, see `docs/architecture/high-level-architecture.md` and `docs/greenfield/10_multitenancy_routing.md`.


## Purpose

- Organization-facing dashboard (non-roaster) used by school/club/org staff
- View orders placed through their sales channels/campaigns
- Manage campaign context and analytics (future)


## Prerequisites

- Monorepo installed with pnpm
- Medusa server running locally
- Auth flow configured for org users (currently dev-gated in places; will evolve)

Recommended env:
- `NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000`


## Start the app (local)

```bash
pnpm -C apps/dashboard-organization dev
```

Default port is typically 3001 (adjust if needed).


## Smoke test

- Visit `http://localhost:3001/`
- Navigate to Orders page (e.g., `/orders`) if present
- In dev, the table may fetch via a dev-gated backend endpoint filtered by sales channel


## Troubleshooting

- If you see no orders, confirm your sales channel ID and that seed/test orders exist
- For 401s, ensure whatever auth/dev guard is currently enabled for this app
- Backend errors: tail the Medusa server logs for the corresponding API calls


## Next steps

- Replace dev-gated endpoints with production org-scoped APIs
- Persist and pass org context derived from authenticated user/session
- Add campaign switching, date filters, CSV export


## Related docs

- Order management story: `docs/stories/6.1.order-management-service.md`
- Multi-tenancy: `docs/greenfield/10_multitenancy_routing.md`
- Security: `docs/architecture/security-considerations.md`
