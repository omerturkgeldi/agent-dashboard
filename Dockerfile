# Production image of the dashboard. Built and started by the docker-compose.yml in the agent-api repo,
# but also works on its own:  docker build -t agent-dashboard .  &&  docker run -p 3000:3000 -e API_URL=... agent-dashboard

FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:24-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Only the standalone server (output: "standalone" in next.config.ts) and the static files.
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
# API_URL is read when the server runs, not at build time, so one image works with any backend.
CMD ["node", "server.js"]
