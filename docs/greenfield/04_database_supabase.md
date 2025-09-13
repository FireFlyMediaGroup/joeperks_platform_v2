# 04 — Database: Supabase Postgres (No Local Docker)

## Create Supabase project
1) In Supabase dashboard, create a new project per environment (dev, staging, prod).
2) Retrieve the Postgres connection string (include `sslmode=require`).

Example:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require"
```

## Configure Medusa .env (dev)
```bash
cp apps/medusa-server/.env.example apps/medusa-server/.env
# Fill DATABASE_URL with Supabase connection string
```

## Run baseline migrations
```bash
pnpm nx run medusa-server:migrate
```

If first run fails due to missing DB/privileges, verify:
- SSL required
- IP allowlist (if applicable)

## Tests
- For test runs, set `TEST_DATABASE_URL` (also Supabase dev branch or isolated db).

## Notes
- We do not provision local Postgres by default. Any local DB is opt-in and not part of baseline.

