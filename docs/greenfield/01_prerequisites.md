# 01 — Prerequisites

## Install tooling (local)
- Node.js 20 LTS (use nvm if needed)
- pnpm 9+
- Git + GitHub account
- Nx CLI (optional, we’ll also use pnpm dlx): `pnpm dlx nx@latest --version`

Verify:
```bash
node -v   # v20.x
pnpm -v   # 9.x
```

## Accounts & services
- Supabase account (Postgres project per env)
- Redis provider (Upstash/Redis Cloud) — one database per env
- Stripe account (test mode enabled); configure Connect Express
- Stytch account (project per env)
- SendGrid account (API key)
- Twilio account (phone number + messaging service)
- Vercel account (for Next.js apps)
- Railway account (for Medusa backend)

## Domain
- Primary domain (e.g., joeperks.com)
- Ability to configure wildcard subdomains (*.joeperks.com) in DNS (for prod). For dev, use lvh.me.

