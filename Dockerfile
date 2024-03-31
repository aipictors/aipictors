FROM imbios/bun-node:latest-current-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb ./
RUN bun install

FROM base AS builder
COPY . .
COPY --from=deps /app/node_modules ./node_modules
ENV NODE_ENV=production
RUN bun run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/public ./public

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json yarn.lock* ./

RUN yarn --frozen-lockfile

# Builder

FROM node:20-alpine AS builder

ARG SENTRY_AUTH_TOKEN

ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn run build

# Runner

FROM node:20-buster-slim AS runner

WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD HOSTNAME="0.0.0.0" node server.js