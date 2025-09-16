# Storefront (Customer) App – Getting Started

This guide helps you bring up the customer-facing storefront(s) locally. It covers environment, run commands, and first checks.

For campaign/storefront mapping details, see `docs/stories/4.1.campaign-management-service.md` and `docs/architecture/high-level-architecture.md`.


## Purpose

- Public storefronts for customers supporting organizations via campaigns/sales channels
- Dynamic product catalogs sourced from Medusa
- Will incorporate vendor/organization attribution and fee splits (downstream)


## Prerequisites

- Monorepo setup with pnpm
- Medusa server running locally with seeded products

Recommended env:
- `NEXT_PUBLIC_MEDUSA_URL=http://localhost:9000`
- Optional per-storefront config, e.g., `NEXT_PUBLIC_SALES_CHANNEL_ID=<id>`


## Start the app (local)

```bash
pnpm -C apps/storefront-customer dev
```

Default port is 3000.


## Smoke test

- Visit `http://localhost:3000/`
- Home page renders; product list shows items from Medusa
- If using sales channel scoping, verify only channel products are shown


## Troubleshooting

- Empty catalog: confirm Medusa has products and (if used) correct sales channel ID
- CORS or 401: ensure Medusa allows the storefront origin and public routes are enabled
- Build errors: `pnpm nx reset` then re-run


## Next steps

- Theming, branding, and per-organization storefront routing
- Campaign landing pages and analytics
- Checkout wiring (once payments/Stripe Connect are enabled)


## Related docs

- High-level architecture: `docs/architecture/high-level-architecture.md`
- Marketplace plan: `docs/marketplace_integration_plan.md`
- Revenue splitting: `docs/stories/5.3.revenue-splitting-audit-trail.md`
