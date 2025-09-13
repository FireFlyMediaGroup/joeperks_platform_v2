# 05 — Cache/Queues: Redis 7 (Managed)

## Provision Redis
- Use Upstash Redis or Redis Cloud. Create one db per environment and copy the `REDIS_URL`.

## Configure Medusa to use Redis (sessions/cache)
Add to `apps/medusa-server/.env`:
```bash
REDIS_URL=redis://<user>:<password>@<host>:<port>
```

Refer to Medusa docs for enabling specific Redis-backed features (sessions, caching, queues) via configuration or modules as needed.

## Notes
- No local Redis is provisioned by default. Use managed Redis for dev/staging/prod.

