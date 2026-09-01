# ─── Stage 1: deps ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /repo

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/web-admin/package.json     ./apps/web-admin/
COPY packages/shared-types/package.json  ./packages/shared-types/
COPY packages/api-client/package.json    ./packages/api-client/
COPY packages/config-typescript/package.json ./packages/config-typescript/

RUN pnpm install --frozen-lockfile --filter @sarangi/web-admin...

# ─── Stage 2: build ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /repo

COPY packages/ ./packages/
COPY apps/web-admin/ ./apps/web-admin/

WORKDIR /repo/apps/web-admin

ARG NEXT_PUBLIC_API_URL=https://api.sarangijewels.com/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN pnpm build

# ─── Stage 3: runtime ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3002

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

COPY --from=builder /repo/apps/web-admin/public          ./public
COPY --from=builder /repo/apps/web-admin/.next/standalone ./
COPY --from=builder /repo/apps/web-admin/.next/static     ./.next/static

USER nextjs

EXPOSE 3002

CMD ["node", "server.js"]
