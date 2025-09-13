# 09 — Frontend Apps (Next.js, Nx)

Apps created in step 02:
- apps/storefront-customer
- apps/admin-platform
- apps/dashboard-organization
- apps/portal-roaster

## Common packages
```bash
pnpm -w add next react react-dom
pnpm -w add @tanstack/react-query zustand zod react-hook-form
pnpm -w add tailwindcss postcss autoprefixer
pnpm -w dlx tailwindcss init -p
```

Configure Tailwind per app (postcss.config.js, tailwind.config.ts, globals.css). Add shared UI via `libs/shared-ui`.

## Auth wiring (Stytch)
- Add Stytch provider wrapper in `_app.tsx` or root layout.
- Create higher-order components/hooks for role-guarded routes.

## Storefront-customer
- Medusa Storefront SDK: `pnpm add @medusajs/js-sdk`
- Configure base URL to backend (env driven).
- Implement cart/checkout -> calls to backend API.

## Admin-platform
- Stytch-only access; surfaces super admin tools (vendor management, approvals), global analytics, dispute tooling.
- Uses backend APIs (Medusa custom endpoints) for platform-specific data.

## Dashboard-organization
- Campaign CRUD, branding, marketing assets, analytics.

## Portal-roaster
- Catalog management, orders/fulfillment documents, shipping settings, analytics.

## Testing
- Add Vitest/Jest per app and basic RTL tests for guards and forms.

