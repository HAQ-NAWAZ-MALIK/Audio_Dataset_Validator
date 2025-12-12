FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variable for build
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy public folder
COPY --from=builder /app/public ./public

# Copy built application
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Create /data directory for HF Spaces persistent storage
RUN mkdir -p /data && chmod 777 /data

# Create local dataset directory as fallback
RUN mkdir -p /app/dataset && chmod 777 /app/dataset

# Set default data directory
ENV DATA_DIR=/data

# HF Spaces uses port 7860 by default
EXPOSE 7860

ENV PORT=7860
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
