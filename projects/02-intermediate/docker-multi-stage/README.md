# 🐳 Docker Multi-Stage Builds & Security

Master advanced Docker techniques: multi-stage builds, security best practices, and image optimization.

## 🎯 Learning Objectives

- Build optimized images with multi-stage builds
- Implement Docker security best practices
- Scan images for vulnerabilities
- Reduce image size dramatically
- Create secure, production-ready containers

## 📋 Prerequisites

- Docker basics
- Dockerfile fundamentals
- Container concepts

## 🏗️ Multi-Stage Build Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    MULTI-STAGE BUILD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage 1: BUILD                    Stage 2: RUNTIME             │
│  ┌───────────────────────────┐    ┌───────────────────────────┐ │
│  │ Full SDK/Compiler         │    │ Minimal Runtime           │ │
│  │ ┌─────────────────────┐   │    │ ┌─────────────────────┐   │ │
│  │ │ Source Code         │   │    │ │ Compiled Binary     │   │ │
│  │ │ Dependencies        │   │───▶│ │ Runtime Deps Only   │   │ │
│  │ │ Build Tools         │   │    │ │                     │   │ │
│  │ │ Dev Dependencies    │   │    │ └─────────────────────┘   │ │
│  │ └─────────────────────┘   │    │                           │ │
│  │ Size: ~1GB               │    │ Size: ~50MB              │ │
│  └───────────────────────────┘    └───────────────────────────┘ │
│                                                                  │
│  ❌ Build artifacts, source     ✅ Only production runtime      │
│  ❌ Compilers, SDKs              ✅ Minimal attack surface       │
│  ❌ Test dependencies            ✅ Fast deployment              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Basic Multi-Stage Build

```dockerfile
# Dockerfile.basic
# ========== STAGE 1: Build ==========
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# ========== STAGE 2: Production ==========
FROM node:18-alpine AS production

WORKDIR /app

# Copy only production artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs
USER nodejs

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Compare sizes:
```bash
# Build both versions
docker build -f Dockerfile.basic --target builder -t app:builder .
docker build -f Dockerfile.basic -t app:production .

# Compare sizes
docker images | grep app
# app:builder     ~400MB
# app:production  ~90MB
```

### Lab 2: Go Application Multi-Stage

```dockerfile
# Dockerfile.go
# ========== Stage 1: Build ==========
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o main .

# ========== Stage 2: Minimal Runtime ==========
FROM scratch

# Copy CA certificates for HTTPS
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

# Copy binary
COPY --from=builder /app/main /main

EXPOSE 8080
ENTRYPOINT ["/main"]
```

Results:
```bash
# Build and check size
docker build -f Dockerfile.go -t go-app .
docker images go-app
# go-app  latest  ~10MB (compared to ~300MB with full Go image!)
```

### Lab 3: Python Multi-Stage with Pip

```dockerfile
# Dockerfile.python
# ========== Stage 1: Dependencies ==========
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create virtualenv and install deps
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ========== Stage 2: Production ==========
FROM python:3.11-slim AS production

WORKDIR /app

# Copy virtualenv from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy application
COPY . .

# Security: non-root user
RUN useradd -m -u 1000 appuser
USER appuser

EXPOSE 8000
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

### Lab 4: Security Best Practices

```dockerfile
# Dockerfile.secure
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine

# 1. Use specific version, not 'latest'
# Already done: node:18-alpine

# 2. Don't run as root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# 3. Set proper ownership
WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# 4. Remove unnecessary tools
RUN apk del --purge apk-tools

# 5. Set environment
ENV NODE_ENV=production

# 6. Use read-only filesystem where possible
# (configured at runtime: docker run --read-only)

# 7. Drop all capabilities (at runtime)
# docker run --cap-drop=ALL

# 8. Limit resources (at runtime)
# docker run --memory=256m --cpus=0.5

# 9. Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# 10. Switch to non-root user
USER nodejs

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Lab 5: Vulnerability Scanning

```bash
# Using Trivy (recommended)
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image myapp:latest

# Using Docker Scout (built-in)
docker scout cves myapp:latest

# Using Snyk
docker scan myapp:latest

# Create scanning script
cat << 'EOF' > scan.sh
#!/bin/bash
IMAGE=$1
SEVERITY=${2:-HIGH,CRITICAL}

echo "🔍 Scanning $IMAGE for vulnerabilities..."

# Run Trivy scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image \
    --exit-code 1 \
    --severity $SEVERITY \
    --no-progress \
    $IMAGE

if [ $? -eq 0 ]; then
    echo "✅ No $SEVERITY vulnerabilities found!"
else
    echo "❌ Vulnerabilities detected!"
    exit 1
fi
EOF
chmod +x scan.sh

# Use it
./scan.sh myapp:latest HIGH,CRITICAL
```

### Lab 6: Build Optimization

```dockerfile
# Optimized Dockerfile with all best practices
# syntax=docker/dockerfile:1.4

FROM node:18-alpine AS base
WORKDIR /app
RUN apk add --no-cache tini

# ===== Dependencies Stage =====
FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production

# ===== Builder Stage =====
FROM base AS builder
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
RUN npm run build

# ===== Production Stage =====
FROM base AS production

# Labels for metadata
LABEL org.opencontainers.image.source="https://github.com/user/repo"
LABEL org.opencontainers.image.description="Production container"
LABEL org.opencontainers.image.version="1.0.0"

# Security hardening
RUN addgroup -g 1001 -S app && \
    adduser -S app -u 1001 -G app && \
    chown -R app:app /app

# Copy artifacts
COPY --from=deps --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/dist ./dist
COPY --chown=app:app package.json ./

ENV NODE_ENV=production
USER app

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]
```

## 📝 Project: Secure CI/CD Image Pipeline

Complete security-focused build:

```yaml
# docker-compose.build.yml
version: '3.8'

services:
  build:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
      args:
        - BUILD_DATE=${BUILD_DATE:-$(date -u +'%Y-%m-%dT%H:%M:%SZ')}
        - VCS_REF=${VCS_REF:-$(git rev-parse --short HEAD)}
    image: ${REGISTRY:-local}/myapp:${TAG:-latest}

  scan:
    image: aquasec/trivy:latest
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: image --exit-code 1 --severity HIGH,CRITICAL ${REGISTRY:-local}/myapp:${TAG:-latest}
```

Build script:
```bash
#!/bin/bash
set -e

REGISTRY="${REGISTRY:-ghcr.io/myorg}"
IMAGE="myapp"
TAG="${TAG:-$(git rev-parse --short HEAD)}"

echo "🏗️  Building $REGISTRY/$IMAGE:$TAG"

# Build with BuildKit
DOCKER_BUILDKIT=1 docker build \
    --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
    --build-arg VCS_REF=$(git rev-parse --short HEAD) \
    --cache-from $REGISTRY/$IMAGE:latest \
    --tag $REGISTRY/$IMAGE:$TAG \
    --tag $REGISTRY/$IMAGE:latest \
    .

echo "🔍 Scanning for vulnerabilities..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image --exit-code 1 --severity CRITICAL $REGISTRY/$IMAGE:$TAG

echo "📤 Pushing to registry..."
docker push $REGISTRY/$IMAGE:$TAG
docker push $REGISTRY/$IMAGE:latest

echo "✅ Done! Image: $REGISTRY/$IMAGE:$TAG"
```

## ✅ Completion Checklist

- [ ] Create multi-stage Dockerfile
- [ ] Optimize layer caching
- [ ] Reduce image size by 80%+
- [ ] Implement non-root user
- [ ] Add health checks
- [ ] Scan for vulnerabilities
- [ ] Use BuildKit features
- [ ] Create secure production image

## 📚 Resources

- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)
- [Trivy Scanner](https://trivy.dev/)

---

**Next Project:** [Kubernetes Networking](../k8s-networking/)
