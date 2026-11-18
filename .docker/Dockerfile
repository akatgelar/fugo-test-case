FROM node:22-alpine AS deps
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--dns-result-order=ipv4first
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build \
    && rm -rf .next/cache \
    && rm -rf .next/standalone/node_modules/@img \
              .next/standalone/node_modules/sharp \
              .next/standalone/node_modules/typescript \
              .next/standalone/node_modules/caniuse-lite

FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/bcryptjs ./node_modules/bcryptjs

RUN mkdir -p /opt/prisma && cd /opt/prisma \
    && npm init -y >/dev/null 2>&1 \
    && npm install --no-audit --no-fund --omit=optional prisma@6.19.3 \
    && npm cache clean --force

EXPOSE 3000
CMD ["sh", "-c", "/opt/prisma/node_modules/.bin/prisma migrate deploy --schema /app/prisma/schema.prisma && node /app/prisma/seed.mjs && node server.js"]
