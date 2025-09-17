# Joe Perks — Greenfield Build Guide (From Blank Folder)

Authoritative, step-by-step instructions to create the platform exactly as defined in the PRD using:
- Nx monorepo (pnpm)
- Medusa v2 backend with native marketplace module (no external plugin)
- Supabase Postgres (dev/staging/prod)
- Redis 7 (managed, no local docker by default)
- Stytch (auth + RBAC) across all apps
- Stripe Connect (payouts to roasters)
- Next.js apps (storefront, platform admin, organization dashboard, roaster portal)
- Vercel (Next.js) + Railway (Medusa) deployments
- SendGrid (email) + Twilio (SMS)

This folder contains atomic, linear steps. Hand to any dev team and they can boot from zero.

## Decision points (confirmed)
- Package manager: pnpm
- Nx monorepo with best-practice names (all PRD apps included)
- Medusa v2 (MikroORM) + Redis 7
- Stytch for auth (all apps)
- Supabase Postgres URL for dev/test/prod (no local Postgres by default)
- Marketplace: native Medusa v2 marketplace (modules, workflows, module links); plugin approach archived
- Stripe Connect: Express accounts; payouts to roasters
- Multi-tenancy: subdomain-based, path fallback in dev
- Deploy: Vercel (Next.js) + Railway (Medusa)
- Node: 20 LTS
- Notifications: SendGrid + Twilio

## Medusa Admin UI or Custom Platform Admin?
You can achieve PRD’s platform admin functionality either by:
- A) Using Medusa Admin UI + plugin extension points for a fast operational console (super admin + vendor mgmt, impersonation). Pros: fastest to get marketplace ops. Cons: customizing auth (Stytch SSO), campaign/fundraising UX, and cross-app navigation can be more constrained.
- B) Custom Next.js Platform Admin app (recommended for PRD fit), while optionally keeping Medusa Admin for internal ops. Pros: unified Stytch auth, exact PRD UX, consistent theming and analytics. Cons: more initial work.

This guide defaults to B (custom Platform Admin) and documents A as an optional track.

## How to use this guide
Follow the numbered docs in order:
1) 01_prerequisites.md
2) 02_bootstrap_monorepo.md
3) 03_backend_medusa_v2.md
4) 04_database_supabase.md
5) 05_cache_redis.md
6) 06_auth_stytch.md
7) 07_marketplace_native.md
   - (Legacy reference: 07_marketplace_plugin.md — archived)

8) 08_payments_stripe_connect.md
9) 09_frontend_apps.md
10) 10_multitenancy_routing.md
11) 11_email_sms_notifications.md
12) 12_ci_cd_and_envs.md
13) 13_deployment.md
14) 14_acceptance_checklists.md

All commands assume a blank parent folder and Node 20 LTS.

