# Docker Containerization Guide

This guide explains how to run the Tetris application using Docker containers for both development and production environments.

## 📋 Prerequisites

- Docker installed (version 20.10+)
- Docker Compose installed (version 2.0+)
- At least 2GB free disk space for images

## 🏗️ Architecture Overview

Our Docker setup includes:

- **Multi-stage production build** (`Dockerfile`) - Optimized for deployment
- **Development container** (`Dockerfile.dev`) - Hot reloading support
- **Docker Compose** configurations for both environments
- **Optimized build process** with proper caching and security

## 🚀 Quick Start

### Development Environment

```bash
# Start development container with hot reloading
npm run docker:compose-dev

# Or using Docker Compose directly
docker-compose -f docker-compose.dev.yml up
```

Access the application at: http://localhost:3000

### Production Environment

```bash
# Build and start production container
npm run docker:compose

# Or using Docker Compose directly
docker-compose up -d
```

## 📝 Available Scripts

### Build Scripts
```bash
# Build production image
npm run docker:build

# Build development image  
npm run docker:build-dev
```

### Run Scripts
```bash
# Run production container
npm run docker:run

# Run development container with volume mounts
npm run docker:run-dev
```

### Docker Compose Scripts
```bash
# Start production environment (detached)
npm run docker:compose

# Start development environment (with logs)
npm run docker:compose-dev

# Stop all containers
npm run docker:compose-down
```

### Cleanup Scripts
```bash
# Stop containers
npm run docker:stop

# Clean up containers and images
npm run docker:clean
```

## 🏭 Production Configuration

### Dockerfile Features

**Multi-stage Build:**
1. **Dependencies stage** - Install production dependencies
2. **Builder stage** - Build the Next.js application with Turbopack  
3. **Runner stage** - Minimal runtime environment

**Optimizations:**
- Node.js 18 Alpine Linux (minimal base image ~150MB)
- Non-root user for security
- Standalone Next.js output
- Layer caching for faster rebuilds
- Health checks for container orchestration

### Production Environment Variables
```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
HOSTNAME=0.0.0.0
PORT=3000
```

## 🔧 Development Configuration

### Development Features
- **Hot Reloading** - Code changes reflected immediately
- **Volume Mounts** - Live source code synchronization
- **Debug Support** - Interactive TTY and STDIN
- **Turbopack** - Fast development builds

### Development Environment Variables
```bash
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1
WATCHPACK_POLLING=true  # Better file watching in containers
```

## 🐳 Docker Commands Reference

### Manual Docker Commands

**Build Production Image:**
```bash
docker build -t tetris-app .
```

**Build Development Image:**
```bash
docker build -f Dockerfile.dev -t tetris-app-dev .
```

**Run Production Container:**
```bash
docker run -p 3000:3000 --name tetris-container tetris-app
```

**Run Development Container:**
```bash
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --name tetris-dev-container \
  tetris-app-dev
```

### Docker Compose Commands

**Production:**
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Development:**
```bash
# Start development services
docker-compose -f docker-compose.dev.yml up

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down
```

## 📊 Performance & Optimization

### Image Sizes
- **Production**: ~150MB (Alpine + standalone Next.js)
- **Development**: ~500MB (includes dev dependencies)

### Build Time Optimizations
- **Layer Caching**: Dependencies cached separately from source code
- **Multi-stage**: Only production files in final image
- **Turbopack**: Faster development builds
- **.dockerignore**: Excludes unnecessary files

### Runtime Optimizations
- **Health Checks**: Automatic container health monitoring
- **Non-root User**: Enhanced security in production
- **Standalone Output**: Minimal runtime dependencies

## 🔒 Security Features

### Production Security
- **Non-root User**: Container runs as `nextjs` user (UID 1001)
- **Minimal Base Image**: Alpine Linux reduces attack surface
- **No Dev Dependencies**: Production image excludes development packages
- **Read-only Filesystem**: Application files owned by nextjs user

### Development Security
- **Isolated Network**: Custom Docker network for container communication
- **Volume Permissions**: Proper file ownership handling
- **Environment Isolation**: Development environment variables

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use:**
```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
docker run -p 3001:3000 tetris-app
```

**Volume Mount Issues (Windows/WSL):**
```bash
# Use absolute path
docker run -v /absolute/path/to/project:/app tetris-app-dev
```

**Build Failures:**
```bash
# Clean build cache
docker builder prune

# Build without cache
docker build --no-cache -t tetris-app .
```

**Container Won't Start:**
```bash
# Check container logs
docker logs tetris-container

# Run container interactively
docker run -it tetris-app sh
```

### Health Check Status
```bash
# Check container health
docker ps

# View health check logs
docker inspect tetris-container --format='{{json .State.Health}}'
```

## 🔄 Development Workflow

### Typical Development Flow
1. **Start development container:**
   ```bash
   npm run docker:compose-dev
   ```

2. **Edit code** - Changes are reflected immediately via volume mounts

3. **View logs:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs -f
   ```

4. **Stop when done:**
   ```bash
   npm run docker:compose-down
   ```

### Production Deployment Flow
1. **Build production image:**
   ```bash
   npm run docker:build
   ```

2. **Test production container:**
   ```bash
   npm run docker:run
   ```

3. **Deploy with orchestration:**
   ```bash
   npm run docker:compose
   ```

## 📈 Monitoring & Logging

### Container Logs
```bash
# Follow logs
docker logs -f tetris-container

# View recent logs
docker logs --tail 50 tetris-container
```

### Container Stats
```bash
# Real-time resource usage
docker stats tetris-container

# Container processes
docker top tetris-container
```

### Health Monitoring
- **Health checks** run every 30 seconds
- **Startup period** allows 40 seconds for application start
- **Failure threshold** marks unhealthy after 3 consecutive failures

## 🌐 Production Deployment Options

### Single Container
```bash
# Production ready container
docker-compose up -d
```

### Container Orchestration
- **Kubernetes**: Use production Dockerfile
- **Docker Swarm**: Scale with Docker Compose
- **Cloud Platforms**: Deploy to AWS ECS, Google Cloud Run, Azure Container Instances

### Environment Variables for Production
```yaml
environment:
  - NODE_ENV=production
  - NEXT_TELEMETRY_DISABLED=1
  # Add custom environment variables here
```

---

*This Docker setup provides a production-ready containerization solution for the Tetris Next.js application with optimal performance, security, and developer experience.*