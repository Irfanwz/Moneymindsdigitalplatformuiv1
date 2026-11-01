# Stage 1: Build the frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# Copy package files and install production deps only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server code
COPY server/ ./server/
COPY shared/ ./shared/

# Reviewed migrations run at startup when AUTO_MIGRATE=true.
COPY supabase/migrations/ ./supabase/migrations/
COPY supabase/auto-migrations.json ./supabase/auto-migrations.json

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist/

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=120s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.API_PORT || 3001) + '/api/health').then(r => { if (!r.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["node", "server/index.js"]
