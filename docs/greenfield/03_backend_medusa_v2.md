# 03 — Backend: Medusa v2 Server

## Scaffold Medusa v2 under apps/medusa-server
Option A (recommended): use Medusa v2 starter via CLI inside workspace.

```bash
# Create folder and scaffold
mkdir -p apps/medusa-server
cd apps/medusa-server
pnpm dlx @medusajs/cli@latest new . --starter medusa-starter-default

# Ensure Node >= 20
pnpm i
cd ../../
```

Register Medusa app with Nx (custom targets):
```jsonc
// apps/medusa-server/project.json
{
  "name": "medusa-server",
  "root": "apps/medusa-server",
  "sourceRoot": "apps/medusa-server/src",
  "projectType": "application",
  "targets": {
    "serve": {
      "executor": "nx:run-commands",
      "options": { "cwd": "apps/medusa-server", "command": "pnpm dev" }
    },
    "build": {
      "executor": "nx:run-commands",
      "options": { "cwd": "apps/medusa-server", "command": "pnpm build" }
    },
    "migrate": {
      "executor": "nx:run-commands",
      "options": { "cwd": "apps/medusa-server", "command": "pnpm exec medusa db:migrate" }
    }
  }
}
```

Install core Medusa deps (if not already present):
```bash
cd apps/medusa-server
pnpm add @medusajs/framework @medusajs/medusa @medusajs/admin-sdk @mikro-orm/core @mikro-orm/knex @mikro-orm/migrations @mikro-orm/postgresql pg
pnpm add -D @mikro-orm/cli @medusajs/test-utils typescript @swc/core @swc/jest jest @types/jest ts-node
cd ../../
```

Configure medusa-config.ts (database, http secrets, modules list present – marketplace module added in Step 07):
```ts
// apps/medusa-server/medusa-config.ts
import { loadEnv, defineConfig } from '@medusajs/framework/utils'
loadEnv(process.env.NODE_ENV || 'development', process.cwd())
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET!,
      cookieSecret: process.env.COOKIE_SECRET!,
    },
  },
  modules: [],
})
```

Create env example:
```bash
cat > apps/medusa-server/.env.example << 'EOF'
DATABASE_URL=
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:4000
AUTH_CORS=http://localhost:3000
JWT_SECRET=change-me
COOKIE_SECRET=change-me
REDIS_URL=

EOF
```

Commit:
```bash
git add . && git commit -m "feat(api): medusa v2 server scaffold"
```

> Next: proceed to Step 07 — Marketplace (Medusa v2 Native Recipe): docs/greenfield/07_marketplace_native.md


