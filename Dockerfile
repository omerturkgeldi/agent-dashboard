# The dashboard as a small production image: `docker build -t cleanbase-web .`, then
# `docker run -p 3000:3000 -e API_URL=http://<backend>:8080 cleanbase-web`.
# API_URL is read when the server starts, not at build time, so one image works with any backend.

FROM node:24-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Dependencies, cached until package-lock.json changes.
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# 2. Build. output: "standalone" (next.config.ts) puts the server and only the node_modules it needs in .next/standalone.
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && mkdir -p public

# 3. Runtime: no npm, no sources, not root.
FROM base AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
