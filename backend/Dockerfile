# Multi-stage build for TypeScript backend
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create app directory
WORKDIR /usr/src/app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy environment template (optional)
COPY .env.example .env.example

# Create logs directory with proper permissions
RUN mkdir -p logs && chown -R nodeuser:nodejs logs

# Change ownership of the app directory
RUN chown -R nodeuser:nodejs /usr/src/app

# Switch to non-root user
USER nodeuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.js"]
