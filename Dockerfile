# Multi-Stage Production Dockerfile for TaskFlow
# Stage 1: Dependency resolution and optimization
FROM node:20-alpine AS dependencies

WORKDIR /app/backend

# Copy backend package manifests
COPY backend/package*.json ./

# Install production dependencies only (clean, deterministic install)
RUN npm ci --omit=dev

# Stage 2: Minimal, secure production runtime
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment
ENV NODE_ENV=production
ENV PORT=5050

# Install curl/wget for healthchecks (busybox wget is built-in)
RUN apk --no-cache add curl

# Copy production node_modules from dependencies stage
COPY --chown=node:node --from=dependencies /app/backend/node_modules /app/backend/node_modules

# Copy backend application source
COPY --chown=node:node backend /app/backend

# Copy frontend static assets
COPY --chown=node:node frontend /app/frontend

# Set execution directory to backend
WORKDIR /app/backend

# Switch to non-root user for container security
USER node

# Expose web service port
EXPOSE 5050

# Health check probe (Kubernetes / Docker Compose readiness)
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5050/health || exit 1

# Start application server
CMD ["node", "server.js"]
