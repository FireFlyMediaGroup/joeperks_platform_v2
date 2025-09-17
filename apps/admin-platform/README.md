# Platform Admin (Operator Console)

This app is the marketplace operator console. It is not the Medusa Admin. Use it to:

- Onboard/approve vendors (coffee roasters)
- Review and approve vendor‑submitted products before publishing
- Manage commissions/payouts (Stripe Connect)
- Configure platform integrations and flags (Stytch, Supabase, Stripe)

Medusa Admin (/app) remains the back‑office “system of record” for the commerce engine and shows the full catalog across all vendors. Do not expose Medusa Admin to vendors.

## Run locally

- Start the Medusa backend (port 9000) as usual.
- Serve this app via Nx:

```bash
pnpm nx serve admin-platform
# or
nx serve admin-platform
```

Defaults:
- Dev server: http://localhost:3001
- Uses Next.js with Nx (@nx/next)

## Authentication

Wire Stytch for SSO and Supabase for multi‑tenant context. Store secrets in env vars.

## Product flow (high level)

- Vendors create Draft products in the Vendor Portal.
- Operators review/approve here in Platform Admin.
- Approved products are set to Published and added to the correct Sales Channel(s).
- All products (Draft/Published) are visible internally in Medusa Admin.

## See also

- Clarification of roles and flow: docs/marketplace-integration-status.md (section: "Clarification — Admin panels and product visibility")

