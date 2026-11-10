# Multi-stage Dockerfile for AdminBelgique (Production Ready)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
RUN npm ci

# Copy source code and build client and standalone backend
COPY . .
RUN npm run build
RUN npx esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.js

# Production runtime stage (Ultra-lightweight)
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/data ./data
COPY --from=builder /app/adminbelgique-platform.zip ./adminbelgique-platform.zip
COPY --from=builder /app/adminbelgique-android-project.zip ./adminbelgique-android-project.zip

EXPOSE 3000

CMD ["node", "server.js"]
