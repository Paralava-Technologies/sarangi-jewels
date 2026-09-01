# ─── Stage 1: deps ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web-store/package.json  ./apps/web-store/
COPY packages/shared-types/package.json  ./packages/shared-types/
COPY packages/api-client/package.json    ./packages/api-client/
COPY packages/ui-tokens/package.json     ./packages/ui-tokens/
COPY packages/config-typescript/package.json ./packages/config-typescript/

RUN pnpm install --frozen-lockfile --filter @sarangi/web-store...

# ─── Stage 2: build ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /repo

COPY packages/ ./packages/
COPY apps/web-store/ ./apps/web-store/

WORKDIR /repo/apps/web-store

# Build Next.js
ARG NEXT_PUBLIC_API_URL=https://api.sarangijewels.com/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ─── Stage 3: runtime ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /repo/apps/web-store/public         ./public
COPY --from=builder /repo/apps/web-store/.next/standalone ./
COPY --from=builder /repo/apps/web-store/.next/static    ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
