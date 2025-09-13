# 07 — Marketplace Plugin (@techlabi/medusa-marketplace-plugin)

## Install (backend-only path)
```bash
pnpm add -w @techlabi/medusa-marketplace-plugin
```

## Register in Medusa config
```ts
// apps/medusa-server/medusa-config.ts
plugins: [
  { resolve: "@techlabi/medusa-marketplace-plugin", options: {} },
],
```

## Env
```bash
# apps/medusa-server/.env
API_KEY=supersecret
# Optional if using Medusa Admin UI widgets
# VITE_BACKEND_URL=http://localhost:9000
```

## Migrate and bootstrap super admin
```bash
pnpm nx run medusa-server:migrate
curl -X POST http://localhost:9000/stores/super \
  -d '{ "email":"admin@test.com", "password":"supersecret" }' \
  -H 'Content-Type: application/json' -H 'Authorization: supersecret'
```

## Map “vendor store” → “roaster”
Document that each roaster operates as an isolated vendor store (products, orders, customers, shipping profiles, stock locations, users).

## Optional track: Medusa Admin UI integration
If adopting Medusa Admin UI alongside custom apps:
1) Add postinstall script in root package.json:
```json
"postinstall": "node node_modules/@techlabi/medusa-marketplace-plugin/.medusa/server/src/patch-admin.js"
```
2) Set `VITE_BACKEND_URL` in Medusa .env.
3) Reinstall deps: `pnpm i`

Use Admin UI for super admin/vendor ops; keep custom Platform Admin for PRD-specific UX.

