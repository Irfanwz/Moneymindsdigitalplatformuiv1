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

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist/

EXPOSE 3001

CMD ["node", "server/index.js"]
