# Docker Containerization Specification

This document provides the complete technical specification for Docker containerization of the Tetris Next.js application.

## Table of Contents
1. [Overview](#overview)
2. [Container Architecture](#container-architecture)
3. [Production Dockerfile Specification](#production-dockerfile-specification)
4. [Development Dockerfile Specification](#development-dockerfile-specification)
5. [Docker Compose Specifications](#docker-compose-specifications)
6. [Build Optimization](#build-optimization)
7. [Security Specifications](#security-specifications)
8. [Performance Requirements](#performance-requirements)
9. [Environment Configuration](#environment-configuration)
10. [Deployment Specifications](#deployment-specifications)

## Overview

### Purpose
Containerize the Tetris Next.js application for consistent deployment across development, staging, and production environments.

### Goals
- **Production-ready** containerization with minimal attack surface
- **Development-friendly** environment with hot reloading
- **Optimized build process** with efficient layer caching
- **Security-first** approach with non-root users
- **Performance optimized** with minimal image sizes

### Container Strategy
- **Multi-stage builds** for production optimization
- **Separate development** containers for developer experience
- **Docker Compose** orchestration for environment management
- **Health monitoring** and automatic restart capabilities

## Container Architecture

### Base Image Strategy
```dockerfile
# Production: Node.js 18 Alpine Linux
FROM node:18-alpine

# Rationale:
# - Alpine Linux: Minimal security footprint (~5MB base)
# - Node.js 18: LTS support until April 2025
# - Official image: Regular security updates
```

### Multi-Stage Build Pattern
```
Stage 1: Dependencies  → Install production dependencies only
Stage 2: Builder      → Build Next.js application with Turbopack  
Stage 3: Runner       → Minimal runtime with security hardening
```

### Image Size Targets
- **Production Image**: ≤ 200MB (target: ~150MB)
- **Development Image**: ≤ 600MB (includes dev dependencies)
- **Base Layer Reuse**: 80%+ layer cache hit rate

## Production Dockerfile Specification

### Stage 1: Dependencies Installation
```dockerfile
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production
```

**Requirements:**
- Install only production dependencies
- Use `npm ci` for reproducible builds
- Cache dependencies layer separately from source code
- Include `libc6-compat` for better Node.js compatibility

### Stage 2: Application Builder
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm ci
RUN npm run build
```

**Requirements:**
- Copy production dependencies from previous stage
- Install all dependencies (including devDependencies)
- Build application using Turbopack (`npm run build`)
- Generate Next.js standalone output

### Stage 3: Production Runtime
```dockerfile
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Security: Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy application files
COPY --from=builder /app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

# Health monitoring
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
```

**Requirements:**
- Run as non-root user (`nextjs:nodejs`)
- Set production environment variables
- Proper file ownership and permissions
- Health check for container orchestration
- Standalone Next.js execution

### Next.js Configuration Requirements
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  output: 'standalone',  // Required for containerization
  experimental: {
    turbo: {}           // Enable Turbopack for faster builds
  }
};
```

## Development Dockerfile Specification

### Development Container Requirements
```dockerfile
FROM node:18-alpine
RUN apk add --no-cache libc6-compat
WORKDIR /app
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

EXPOSE 3000
ENV HOSTNAME="0.0.0.0"
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "run", "dev"]
```

**Requirements:**
- Include all dependencies (production + development)
- Enable development environment variables
- Support hot reloading through volume mounts
- Faster health check intervals for development
- Use Turbopack for development builds

## Docker Compose Specifications

### Production Compose (docker-compose.yml)
```yaml
version: '3.8'
services:
  tetris-app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tetris-production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_TELEMETRY_DISABLED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/"]
      interval: 30s
      timeout: 30s
      retries: 3
      start_period: 40s
    networks:
      - tetris-network

networks:
  tetris-network:
    driver: bridge
```

### Development Compose (docker-compose.dev.yml)
```yaml
version: '3.8'
services:
  tetris-dev:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: tetris-development
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - NEXT_TELEMETRY_DISABLED=1
      - WATCHPACK_POLLING=true
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    restart: unless-stopped
    stdin_open: true
    tty: true
    networks:
      - tetris-dev-network
```

**Volume Mount Strategy:**
- **Source Code**: `.:/app` for hot reloading
- **Node Modules**: `/app/node_modules` prevent overwrite
- **Build Cache**: `/app/.next` preserve build artifacts

## Build Optimization

### .dockerignore Specification
```
# Dependencies
node_modules
npm-debug.log*

# Build outputs  
.next/
out/
build/

# Development files
.git
.vscode/
*.log

# Environment files
.env*

# Docker files
Dockerfile*
docker-compose*
.dockerignore
```

**Optimization Goals:**
- Reduce build context size by 90%+
- Exclude unnecessary files from Docker build
- Improve build speed through smaller context

### Layer Caching Strategy
```dockerfile
# 1. Copy package files first (changes infrequently)
COPY package.json package-lock.json* ./

# 2. Install dependencies (cached if package files unchanged)
RUN npm ci

# 3. Copy source code last (changes frequently)
COPY . .
```

**Cache Efficiency Requirements:**
- Dependencies layer: 95%+ cache hit rate
- Build layer: 60%+ cache hit rate when source unchanged
- Total build time: < 5 minutes on cache miss

## Security Specifications

### Container Security Requirements
```dockerfile
# Non-root user execution
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Proper file ownership
COPY --chown=nextjs:nodejs /app/.next/standalone ./

# Minimal base image
FROM node:18-alpine  # ~150MB vs ~900MB for full Ubuntu
```

### Security Checklist
- ✅ **Non-root execution**: Container runs as `nextjs` user
- ✅ **Minimal base image**: Alpine Linux reduces attack surface
- ✅ **No secrets in image**: Environment variables handled externally
- ✅ **Read-only filesystem**: Application files owned by nextjs user
- ✅ **Network isolation**: Custom Docker networks
- ✅ **Health monitoring**: Automatic failure detection

### Vulnerability Scanning Requirements
- Base image security updates within 7 days
- No HIGH or CRITICAL vulnerabilities in final image
- Regular security scanning in CI/CD pipeline

## Performance Requirements

### Build Performance
- **Initial build**: ≤ 10 minutes
- **Cached build**: ≤ 2 minutes  
- **Development startup**: ≤ 30 seconds
- **Production startup**: ≤ 15 seconds

### Runtime Performance
- **Memory usage**: ≤ 512MB under normal load
- **CPU usage**: ≤ 1 CPU core under normal load
- **Response time**: ≤ 100ms for static assets
- **Health check**: ≤ 5 seconds response time

### Resource Limits (Production)
```yaml
services:
  tetris-app:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

## Environment Configuration

### Production Environment Variables
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
HOSTNAME=0.0.0.0
PORT=3000
```

### Development Environment Variables  
```bash
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=true
HOSTNAME=0.0.0.0
PORT=3000
```

### Configuration Management
- Use Docker Compose environment files
- No secrets in Dockerfile or compose files
- Support for external configuration injection
- Environment-specific variable overrides

## Deployment Specifications

### Container Orchestration Requirements
```yaml
# Health checks
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/"]
  interval: 30s
  timeout: 30s
  retries: 3
  start_period: 40s

# Restart policy
restart: unless-stopped

# Resource management
deploy:
  replicas: 1
  update_config:
    parallelism: 1
    order: start-first
```

### Production Deployment Options
1. **Single Container**: Docker Compose
2. **Container Orchestration**: Kubernetes, Docker Swarm
3. **Cloud Platforms**: AWS ECS, Google Cloud Run, Azure Container Instances
4. **CI/CD Integration**: GitLab CI, GitHub Actions, Jenkins

### Monitoring and Logging
- **Health endpoints**: `/` for application health
- **Log aggregation**: JSON structured logging
- **Metrics collection**: Container resource usage
- **Alert thresholds**: Memory >80%, CPU >90%, Health check failures

## NPM Scripts Integration

### Build and Run Scripts
```json
{
  "scripts": {
    "docker:build": "docker build -t tetris-app .",
    "docker:build-dev": "docker build -f Dockerfile.dev -t tetris-app-dev .",
    "docker:run": "docker run -p 3000:3000 --name tetris-container tetris-app",
    "docker:run-dev": "docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules --name tetris-dev-container tetris-app-dev"
  }
}
```

### Docker Compose Scripts
```json
{
  "scripts": {
    "docker:compose": "docker-compose up -d",
    "docker:compose-dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:compose-down": "docker-compose down && docker-compose -f docker-compose.dev.yml down || true"
  }
}
```

### Cleanup and Maintenance Scripts
```json
{
  "scripts": {
    "docker:stop": "docker stop tetris-container tetris-dev-container || true",
    "docker:clean": "docker rm tetris-container tetris-dev-container || true && docker rmi tetris-app tetris-app-dev || true"
  }
}
```

## Validation and Testing

### Container Testing Requirements
- **Image build**: Successful build without errors
- **Application start**: Container starts within timeout
- **Health check**: Passes health validation
- **Port binding**: Application accessible on port 3000
- **Volume mounts**: Development hot reloading functional

### Quality Gates
- **Security scan**: No HIGH/CRITICAL vulnerabilities
- **Performance test**: Meets resource requirements  
- **Integration test**: Application functions correctly in container
- **Smoke test**: Basic Tetris game functionality works

## Maintenance and Updates

### Update Strategy
- **Base image updates**: Monthly security updates
- **Dependency updates**: Regular npm audit and updates
- **Configuration updates**: Version controlled changes
- **Documentation updates**: Keep specifications current

### Rollback Procedures
- **Tagged images**: Use semantic versioning
- **Configuration rollback**: Git-based configuration management
- **Data persistence**: External volume management for stateful data

---

*This specification ensures consistent, secure, and performant containerization of the Tetris Next.js application across all deployment environments.*