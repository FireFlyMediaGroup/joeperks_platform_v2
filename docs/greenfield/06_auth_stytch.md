# 06 — Authentication: Stytch (All Apps)

## Create Stytch project(s)
- One per environment. Collect:
  - STYTCH_PROJECT_ID
  - STYTCH_SECRET
  - NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN (frontend)

## Backend (Medusa) integration
- Strategy: Validate incoming JWTs/session tokens on protected routes, resolve user+org/roaster roles, inject request context.
- Install SDK:
```bash
cd apps/medusa-server
pnpm add stytch
cd ../../
```
- Create a small auth utility (example path) to validate tokens via Stytch and map roles: platform_admin, roaster, organization, customer.

Env for backend (`apps/medusa-server/.env`):
```bash
STYTCH_PROJECT_ID=
STYTCH_SECRET=
```

## Frontend integration (Next.js apps)
Install Stytch React/Next packages:
```bash
pnpm -w add @stytch/nextjs @stytch/vanilla-js
```

Per app `.env.local` (Vercel vars in prod):
```bash
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=
STYTCH_PROJECT_ID=
STYTCH_SECRET=
```

Implement login/logout flows and session provider in each app. Protect routes by role (RBAC) using Stytch session claims.

## RBAC mapping
- Define a shared enum in `libs/shared-types` and helpers in `libs/shared-utils`.
- Source of truth: Stytch roles/permissions mapped to our four roles.

## Tests
- Unit test token validation and route guards.

