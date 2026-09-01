# ─── Stage 1: deps ──────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /repo

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY apps/api/package.json ./apps/api/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/validation/package.json ./packages/validation/
COPY packages/config-typescript/package.json ./packages/config-typescript/

RUN pnpm install --frozen-lockfile --filter @sarangi/api...

# ─── Stage 2: build ─────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /repo

# Copy source
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

WORKDIR /repo/apps/api

# Generate Prisma client
RUN npx prisma generate

# Build NestJS
RUN pnpm build

# ─── Stage 3: runtime ───────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nestjs

# Copy built output + Prisma artifacts
COPY --from=builder /repo/apps/api/dist         ./dist
COPY --from=builder /repo/apps/api/node_modules  ./node_modules
COPY --from=builder /repo/apps/api/prisma        ./prisma

# Prisma engines live inside node_modules; copy the generated client too
COPY --from=builder /repo/apps/api/node_modules/.prisma ./node_modules/.prisma

USER nestjs

EXPOSE 3001

CMD ["node", "dist/main"]
