# syntax=docker/dockerfile:1

# ---------- Stage 1: install dependencies ----------
FROM node:22-alpine AS deps
# All following instructions in this stage run relative to /app
WORKDIR /app
# Alpine uses musl instead of glibc; some native Node addons expect glibc, so this compat package prevents them from failing at runtime
RUN apk add --no-cache libc6-compat
# Copy only the manifest + lockfile first so this layer (and the slow npm ci below) is cache-reused when only source code changes, not dependencies
COPY package.json package-lock.json ./
# Install exact versions from package-lock.json (reproducible, faster, and stricter than `npm install`)
RUN npm ci


# ---------- Stage 2: build the app ----------
FROM node:22-alpine AS builder
WORKDIR /app
# Reuse the node_modules already installed in the deps stage instead of reinstalling
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the project source (respecting .dockerignore)
COPY . .

# Only needed so prisma.config.ts's process.env["DATABASE_URL"] is defined
# during `prisma generate` (no DB connection is made at generate time).
ENV DATABASE_URL="postgresql://user:password@localhost:5432/db"

# Generate the Prisma Client into src/app/generated/prisma before the build, since it's git-ignored and next build imports it
RUN npx prisma generate
# Compile the Next.js app; because next.config.ts has output: "standalone", this also emits a pruned .next/standalone server bundle
RUN npm run build


# ---------- Stage 3: run the app ----------
FROM node:22-alpine AS runner
WORKDIR /app
# Prisma's toolchain (schema engine) relies on OpenSSL even when the query engine itself isn't used
RUN apk add --no-cache openssl

# Tells Next.js it's running in production (disables dev-only checks/overhead)
ENV NODE_ENV=production
# Port the standalone server listens on, matched by EXPOSE below
ENV PORT=3000
# Bind to all interfaces so the container is reachable from outside itself
ENV HOSTNAME="0.0.0.0"

# Create an unprivileged user/group to run the app as, instead of root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Static assets (images, favicon, etc.) — not included in .next/standalone automatically
COPY --from=builder /app/public ./public
# The pruned server bundle (server.js + only the node_modules it actually needs), owned by the non-root user
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# Prebuilt JS/CSS/etc. served to the browser — also excluded from .next/standalone and must be copied separately
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Drop root privileges for the actual running process
USER nextjs

# Documents which port the container listens on (informational; doesn't actually publish it)
EXPOSE 3000

# Start the standalone server directly with Node (no `next start` or npm needed)
CMD ["node", "server.js"]
