# 13 — Deployment: Vercel (Next.js) + Railway (Medusa)

## Railway — Medusa backend
1) Create a new service from the `apps/medusa-server` subdir repo
2) Set env vars:
```
DATABASE_URL= (Supabase)
REDIS_URL= (Upstash/Redis Cloud)
JWT_SECRET, COOKIE_SECRET
STORE_CORS, ADMIN_CORS, AUTH_CORS
API_KEY (plugin)
STYTCH_*, STRIPE_*, SENDGRID_*, TWILIO_*
NODE_ENV=production
```
3) Build command: `pnpm build`
4) Start command: `pnpm start` (or `pnpm dev` for preview)
5) Run migrations: `pnpm exec medusa db:migrate`

## Vercel — Next.js apps
- For each app: connect Git repo & set framework = Next.js
- Env vars per app:
```
NEXT_PUBLIC_PLATFORM_DOMAIN=joeperks.com
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://<railway-app>.up.railway.app
NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN=...
```
- Set custom domains and wildcard subdomains for storefront.
- Rewrites for API if any proxying is needed.

## Post-deploy checks
- Health endpoint on Medusa
- Stripe webhooks delivering to Railway URL
- Multi-tenant subdomains resolving

