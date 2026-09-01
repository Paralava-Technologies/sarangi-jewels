# Sarangi Jewels

Monorepo for the Sarangi Jewels brand store: customer web/mobile, admin web/mobile, and a central API.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 9+
- Docker (for local Postgres, Redis, MinIO)

## Quick start

```bash
# Install dependencies
pnpm install

# Start infrastructure
docker compose -f infrastructure/docker/docker-compose.yml up -d

# Default host ports (avoid conflicts with local services):
#   Postgres 5433  (system Postgres often uses 5432)
#   Redis    6380  (system Redis often uses 6379)
# Override: SARANGI_POSTGRES_PORT=5432 SARANGI_REDIS_PORT=6379 docker compose ...

# Configure API
cp .env.example apps/api/.env

# Database
pnpm db:generate
pnpm db:migrate
# If guest-cart schema changed, also run: pnpm --filter @sarangi/api exec prisma db push
pnpm db:seed

# Run all apps (or individually)
pnpm dev
```

## Apps

| App | Package | Dev URL | Description |
|-----|---------|---------|-------------|
| API | `@sarangi/api` | http://localhost:3001 | NestJS backend |
| Web store | `@sarangi/web-store` | http://localhost:3000 | Customer storefront |
| Web admin | `@sarangi/web-admin` | http://localhost:3002 | Admin dashboard |
| Mobile store | `@sarangi/mobile-store` | Expo dev tools | Customer mobile |
| Mobile admin | `@sarangi/mobile-admin` | Expo dev tools | Fulfillment mobile |

## HTTPS (production)

Local development uses **http://localhost**. In production:

- **Web store & admin** — `middleware.ts` redirects HTTP → HTTPS when `NODE_ENV=production` and `x-forwarded-proto: http` (set by your load balancer or [nginx](./infrastructure/nginx/nginx.conf)).
- **API** — redirects when `FORCE_HTTPS=true` or `NODE_ENV=production`; set `trust proxy` for `x-forwarded-proto`.
- Set `NEXT_PUBLIC_API_URL` and `CORS_ORIGINS` to **https://** URLs in production `.env` files.

## Brand theme

Purple & gold tokens live in `@sarangi/ui-tokens` (primary `#4A148C`, accent `#D4AF37`).

## Scripts

```bash
pnpm dev              # All apps in parallel
pnpm dev:api          # API only
pnpm dev:web-store    # Storefront only
pnpm build            # Production build
pnpm lint             # Lint all packages
pnpm typecheck        # Typecheck all packages
```

## Documentation

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — system design and folder layout
- [docs/UI_DESIGN_LAYOUT.md](./docs/UI_DESIGN_LAYOUT.md) — storefront UI/UX spec
- [docs/WORK_TRACKER.md](./docs/WORK_TRACKER.md) — progress tracker (done / pending)
