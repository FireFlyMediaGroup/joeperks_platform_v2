# 12 — CI/CD and Environment Management

## GitHub Actions (example high-level)
- Install deps with pnpm cache
- Type check and lint
- Build Medusa and Next apps
- Run Medusa migrations (dry run)
- Run unit/integration tests

## Environment variables
- Use Vercel envs for Next.js apps
- Use Railway envs for Medusa backend
- No secrets in repo; use managers/KMS

## Caching
- Nx remote cache optional; otherwise rely on GitHub Actions cache+pnpm store

## Webhooks in CI
- Provide scripts to register Stripe webhooks for preview deployments if needed

## Branching
- Feature branches → PRs → main; protected branch with checks

