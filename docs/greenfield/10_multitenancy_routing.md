# 10 — Multi-tenancy Routing (Subdomains + Path Fallback)

## Subdomain strategy
- Production: `orgslug.joeperks.com`
- Dev: `orgslug.lvh.me` (lvh.me resolves to 127.0.0.1)

## Next.js middleware example (storefront-customer)
- Read `host` header.
- If host is subdomain of platform domain and not root, extract `orgSlug`.
- Rewrite to `/{orgSlug}{pathname}` and set `x-organization-slug` header.

## Backend context
- Middleware on Medusa server extracts `orgSlug` from header/path and resolves tenant context.
- Enforce tenant filters in all service calls.

## Custom domains (future)
- Map hostnames to org IDs; bypass platform domain check.

## Tests
- E2E: requests with `orgslug.lvh.me` route to org-scoped pages and APIs; cross-tenant access blocked.

