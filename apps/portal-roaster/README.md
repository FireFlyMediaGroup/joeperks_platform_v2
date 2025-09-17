# Vendor Portal (Coffee Roaster)

This app is the vendor-facing portal. It is not the Medusa Admin. Vendors use it to:

- Sign in via Stytch and access their organization only
- Create and manage their own products
- Monitor orders, payouts, settlements (as operator features are added)

Platform Admin is for marketplace operators; Medusa Admin (/app) is the internal back office.

## Run locally

- Start the Medusa backend (port 9000) as usual.
- Serve this app via Nx:

```bash
pnpm nx serve portal-roaster
# or
nx serve portal-roaster
```

Defaults:
- Dev server: http://localhost:3002
- Uses Next.js with Nx (@nx/next)

## Authentication

Use Stytch for login, with organization scoping via Supabase. Store secrets in env vars.

## Product flow (vendor perspective)

- Create products here (Draft by default) via /vendors/products API.
- Operator reviews in Platform Admin and publishes when approved.
- Once Published and assigned to Sales Channel(s), products are visible on the storefront.

## See also

- Clarification of roles and flow: docs/marketplace-integration-status.md (section: "Clarification — Admin panels and product visibility")

