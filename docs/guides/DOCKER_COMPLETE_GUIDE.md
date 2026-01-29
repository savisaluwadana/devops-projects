# 🐳 Complete Docker Guide

A comprehensive guide covering Docker from basics to advanced production patterns.

---

## Table of Contents

1. [Docker Fundamentals](#1-docker-fundamentals)
2. [Container Lifecycle](#2-container-lifecycle)
3. [Images & Dockerfiles](#3-images--dockerfiles)
4. [Networking](#4-networking)
5. [Storage & Volumes](#5-storage--volumes)
6. [Docker Compose](#6-docker-compose)
7. [Multi-Stage Builds](#7-multi-stage-builds)
8. [Security Best Practices](#8-security-best-practices)
9. [Performance Optimization](#9-performance-optimization)
10. [Production Patterns](#10-production-patterns)

---

## 1. Docker Fundamentals

### Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                         Docker Host                             │
├────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     Docker Daemon                          │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │ │
│  │  │   Images    │ │ Containers  │ │      Networks       │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │ │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │ │
│  │  │   Volumes   │ │   Plugins   │ │     BuildKit        │  │ │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              ▲                                  │
│                              │ REST API                         │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                     Docker CLI                             │ │
│  └───────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Container vs VM

```
┌─────────────────────────┐     ┌─────────────────────────┐
│      Virtual Machine    │     │        Container        │
├─────────────────────────┤     ├─────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐  │     │  ┌────┐ ┌────┐ ┌────┐  │
│  │App1│ │App2│ │App3│  │     │  │App1│ │App2│ │App3│  │
│  ├────┤ ├────┤ ├────┤  │     │  └────┘ └────┘ └────┘  │
│  │Bins│ │Bins│ │Bins│  │     │  ┌─────────────────────┐│
│  │Libs│ │Libs│ │Libs│  │     │  │     Docker Engine   ││
│  ├────┤ ├────┤ ├────┤  │     │  └─────────────────────┘│
│  │ OS │ │ OS │ │ OS │  │     │  ┌─────────────────────┐│
│  └────┘ └────┘ └────┘  │     │  │      Host OS        ││
│  ┌─────────────────────┐│     │  └─────────────────────┘│
│  │     Hypervisor      ││     │  ┌─────────────────────┐│
│  └─────────────────────┘│     │  │      Hardware       ││
│  ┌─────────────────────┐│     │  └─────────────────────┘│
│  │      Hardware       ││     └─────────────────────────┘
│  └─────────────────────┘│
└─────────────────────────┘
       Heavy & Slow                  Light & Fast
```

### Installation

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker info
docker run hello-world

# Enable Docker at boot
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 2. Container Lifecycle

### Running Containers

```bash
# Basic run
docker run nginx                         # Run nginx (foreground)
docker run -d nginx                      # Run in background (detached)
docker run -d --name webserver nginx     # With custom name
docker run -d -p 8080:80 nginx           # Map port 8080 to container port 80
docker run -it ubuntu bash               # Interactive terminal

# Run options
docker run -d \
  --name myapp \
  --hostname myapp \
  -p 8080:80 \
  -p 8443:443 \
  -v /host/data:/container/data \
  -v named_volume:/data \
  -e "NODE_ENV=production" \
  -e "API_KEY=secret" \
  --env-file .env \
  -w /app \
  --user 1000:1000 \
  --restart unless-stopped \
  --memory="512m" \
  --cpus="1.0" \
  --network mynetwork \
  --health-cmd="curl -f http://localhost/ || exit 1" \
  --health-interval=30s \
  nginx:alpine
```

### Container Management

```bash
# List containers
docker ps                    # Running containers
docker ps -a                 # All containers (including stopped)
docker ps -q                 # Only container IDs
docker ps -s                 # With size

# Container information
docker inspect container_name
docker logs container_name
docker logs -f container_name        # Follow logs
docker logs --tail 100 container_name
docker logs --since="2023-01-01" container_name

# Container status
docker stats                 # Live resource usage
docker top container_name    # Running processes

# Execute commands
docker exec container_name command
docker exec -it container_name bash
docker exec -u root container_name command

# Container lifecycle
docker start container_name
docker stop container_name
docker restart container_name
docker pause container_name
docker unpause container_name
docker kill container_name

# Remove containers
docker rm container_name
docker rm -f container_name          # Force remove running container
docker rm $(docker ps -aq)           # Remove all stopped containers
docker container prune               # Remove all stopped containers
```

### Copy Files

```bash
# Copy from host to container
docker cp file.txt container_name:/path/to/dest/

# Copy from container to host
docker cp container_name:/path/to/file.txt ./local/

# Copy entire directories
docker cp container_name:/var/log/ ./logs/
```

---

## 3. Images & Dockerfiles

### Image Management

```bash
# Pull images
docker pull nginx                    # Latest tag
docker pull nginx:1.25               # Specific version
docker pull nginx:alpine             # Alpine variant
docker pull gcr.io/google-containers/nginx  # From other registry

# List images
docker images
docker images -a                     # Include intermediate images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Image information
docker inspect nginx
docker history nginx                 # Show layers

# Remove images
docker rmi nginx
docker rmi -f nginx                  # Force remove
docker rmi $(docker images -q)       # Remove all images
docker image prune                   # Remove unused images
docker image prune -a                # Remove all unused images

# Tag and push
docker tag myapp:latest myregistry/myapp:v1.0
docker push myregistry/myapp:v1.0

# Save and load
docker save -o myimage.tar myimage:latest
docker load -i myimage.tar

# Export and import (container filesystem)
docker export container_name > container.tar
docker import container.tar newimage:tag
```

### Dockerfile Syntax

```dockerfile
# ============================================
# Complete Dockerfile Reference
# ============================================

# Base image (required first instruction)
FROM ubuntu:22.04
FROM python:3.11-slim AS builder
FROM scratch                          # Empty base image

# Metadata
LABEL maintainer="you@example.com"
LABEL version="1.0"
LABEL description="My application"

# Arguments (build-time variables)
ARG VERSION=1.0
ARG BUILD_DATE

# Environment variables
ENV NODE_ENV=production
ENV APP_HOME=/app
ENV PATH="$APP_HOME/bin:$PATH"

# Working directory
WORKDIR /app

# Copy files
COPY . .                              # Copy all
COPY package*.json ./                 # Copy specific files
COPY --chown=user:group src/ ./src/   # With ownership
COPY --from=builder /app/dist ./dist  # Multi-stage copy

# Add files (can extract tar and download URLs)
ADD archive.tar.gz /opt/
ADD https://example.com/file.tar.gz /opt/

# Run commands
RUN apt-get update && apt-get install -y \
    package1 \
    package2 \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# Switch user
USER appuser

# Expose ports (documentation)
EXPOSE 80
EXPOSE 443

# Volumes
VOLUME /data
VOLUME ["/var/log", "/var/data"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Default command
CMD ["nginx", "-g", "daemon off;"]

# Entrypoint (not overridden by docker run arguments)
ENTRYPOINT ["python", "app.py"]
ENTRYPOINT ["/docker-entrypoint.sh"]

# Combine ENTRYPOINT and CMD
ENTRYPOINT ["python", "app.py"]
CMD ["--help"]                        # Default args, can be overridden

# Stop signal
STOPSIGNAL SIGTERM

# Shell form vs exec form
RUN apt-get update               # Shell form (runs in /bin/sh -c)
RUN ["apt-get", "update"]        # Exec form (no shell)
```

### Complete Dockerfile Examples

**Python Application:**
```dockerfile
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install dependencies first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser \
    && chown -R appuser:appgroup /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:create_app()"]
```

**Node.js Application:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs
USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

**Go Application:**
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Download dependencies
COPY go.mod go.sum ./
RUN go mod download

# Build
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /app/main

# Runtime stage
FROM scratch

COPY --from=builder /app/main /main
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/

EXPOSE 8080

ENTRYPOINT ["/main"]
```

### Build Commands

```bash
# Basic build
docker build -t myapp .
docker build -t myapp:v1.0 .
docker build -f Dockerfile.prod -t myapp .

# Build with arguments
docker build --build-arg VERSION=1.0 -t myapp .

# Build with no cache
docker build --no-cache -t myapp .

# Build with target (multi-stage)
docker build --target builder -t myapp:build .

# Build with platform
docker build --platform linux/amd64 -t myapp .

# BuildKit (faster, better caching)
DOCKER_BUILDKIT=1 docker build -t myapp .
```

---

## 4. Networking

### Network Types

```bash
# List networks
docker network ls

# Network types:
# - bridge:  Default network, containers can communicate
# - host:    Use host's network directly
# - none:    No networking
# - overlay: Multi-host networking (Swarm)
# - macvlan: Assign MAC address to container

# Create network
docker network create mynetwork
docker network create --driver bridge mybridge
docker network create --subnet=172.20.0.0/16 mynetwork

# Inspect network
docker network inspect bridge

# Connect/disconnect containers
docker network connect mynetwork container_name
docker network disconnect mynetwork container_name

# Run with network
docker run -d --network mynetwork --name app nginx
docker run -d --network host nginx
docker run -d --network none nginx

# Remove network
docker network rm mynetwork
docker network prune        # Remove unused networks
```

### Container Communication

```bash
# Containers on same custom network can communicate by name
docker network create app-network

docker run -d --name db --network app-network postgres
docker run -d --name api --network app-network \
  -e DATABASE_HOST=db \      # Use container name
  myapi

# Link (legacy, use networks instead)
docker run -d --name db postgres
docker run -d --link db:database myapp

# Port publishing
docker run -d -p 8080:80 nginx                    # Specific port
docker run -d -p 80 nginx                         # Random host port
docker run -d -p 127.0.0.1:8080:80 nginx          # Bind to localhost only
docker run -d -p 8080-8090:80-90 nginx            # Port range
docker run -d -P nginx                            # Publish all exposed ports
```

### DNS and Service Discovery

```bash
# Built-in DNS for custom networks
# Containers can resolve each other by name

# Example
docker network create mynet
docker run -d --name web --network mynet nginx
docker run -it --network mynet alpine ping web   # Works!

# Custom DNS
docker run --dns 8.8.8.8 nginx
docker run --dns-search example.com nginx

# Add host entry
docker run --add-host host.docker.internal:host-gateway nginx
```

---

## 5. Storage & Volumes

### Volume Types

```
┌─────────────────────────────────────────────────────────────────┐
│                     Storage Options                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Volumes (Managed by Docker)                                  │
│     docker volume create mydata                                  │
│     docker run -v mydata:/data nginx                            │
│                                                                  │
│  2. Bind Mounts (Host path)                                      │
│     docker run -v /host/path:/container/path nginx              │
│                                                                  │
│  3. tmpfs (Memory)                                               │
│     docker run --tmpfs /app/temp nginx                          │
└─────────────────────────────────────────────────────────────────┘
```

### Volume Management

```bash
# Create volume
docker volume create mydata
docker volume create --driver local mydata

# List volumes
docker volume ls

# Inspect volume
docker volume inspect mydata

# Remove volumes
docker volume rm mydata
docker volume prune                   # Remove unused volumes

# Use volume
docker run -v mydata:/data nginx
docker run --mount source=mydata,target=/data nginx

# Anonymous volume
docker run -v /data nginx             # Docker creates volume

# Read-only volume
docker run -v mydata:/data:ro nginx
```

### Bind Mounts

```bash
# Bind mount (absolute path)
docker run -v /host/path:/container/path nginx

# Bind mount (current directory)
docker run -v $(pwd):/app nginx

# Bind mount (read-only)
docker run -v /host/path:/container/path:ro nginx

# Using --mount (more explicit)
docker run --mount type=bind,source=/host/path,target=/container/path nginx

# Bind mount specific file
docker run -v /host/config.yaml:/app/config.yaml:ro nginx
```

### tmpfs Mounts

```bash
# tmpfs mount (memory only, not persisted)
docker run --tmpfs /app/temp nginx

docker run --mount type=tmpfs,destination=/app/temp,tmpfs-size=100m nginx
```

---

## 6. Docker Compose

### Compose File Reference

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Frontend service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        NODE_ENV: production
      target: production
    image: myapp/frontend:${TAG:-latest}
    container_name: frontend
    hostname: frontend
    ports:
      - "3000:3000"
      - "3001:3001"
    volumes:
      - ./frontend/src:/app/src:ro
      - frontend_node_modules:/app/node_modules
    environment:
      - NODE_ENV=production
      - API_URL=http://api:8000
    env_file:
      - .env
      - .env.production
    depends_on:
      api:
        condition: service_healthy
    networks:
      - frontend-network
      - backend-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  # API service
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
    ports:
      - "8000:8000"
    volumes:
      - ./api:/app
      - /app/node_modules
    environment:
      DATABASE_URL: postgres://user:password@db:5432/myapp
      REDIS_URL: redis://cache:6379
      SECRET_KEY: ${SECRET_KEY}
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - backend-network
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  # Database service
  db:
    image: postgres:15-alpine
    container_name: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-network
    restart: unless-stopped

  # Cache service
  cache:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend-network
    restart: unless-stopped

  # Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - api
    networks:
      - frontend-network
      - backend-network
    restart: unless-stopped

  # Worker service
  worker:
    build: ./worker
    command: celery -A tasks worker --loglevel=info
    volumes:
      - ./worker:/app
    environment:
      - REDIS_URL=redis://cache:6379
    depends_on:
      - cache
    networks:
      - backend-network
    restart: unless-stopped
    deploy:
      replicas: 2

# Volumes
volumes:
  postgres_data:
    driver: local
  redis_data:
  frontend_node_modules:

# Networks
networks:
  frontend-network:
    driver: bridge
  backend-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

### Compose Commands

```bash
# Start services
docker compose up
docker compose up -d                   # Detached mode
docker compose up --build              # Rebuild images
docker compose up service1 service2    # Specific services
docker compose up --scale worker=3     # Scale service

# Stop services
docker compose down
docker compose down -v                 # Remove volumes
docker compose down --rmi all          # Remove images
docker compose stop                    # Stop without removing

# View status
docker compose ps
docker compose ps -a
docker compose top

# Logs
docker compose logs
docker compose logs -f                 # Follow
docker compose logs service_name
docker compose logs --tail 100

# Execute commands
docker compose exec service_name command
docker compose exec db psql -U user -d myapp

# Build
docker compose build
docker compose build --no-cache
docker compose build service_name

# Other commands
docker compose pull                    # Pull latest images
docker compose restart                 # Restart services
docker compose config                  # Validate and view config
docker compose config --services       # List services
docker compose images                  # List images
docker compose port service 80         # Show port mapping
```

### Environment Files

```bash
# .env file (automatically loaded)
TAG=v1.0
SECRET_KEY=mysecretkey
DATABASE_PASSWORD=password

# Multiple env files
docker compose --env-file .env.production up

# In compose file
services:
  app:
    env_file:
      - .env
      - .env.local
```

---

## 7. Multi-Stage Builds

### Pattern: Build and Runtime Separation

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine AS runtime

WORKDIR /app

# Copy only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Non-root user
USER node

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Pattern: Multi-Environment Builds

```dockerfile
# Base stage
FROM python:3.11-slim AS base
WORKDIR /app
COPY requirements.txt .

# Development stage
FROM base AS development
RUN pip install -r requirements.txt
RUN pip install pytest pytest-cov black flake8
COPY . .
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--debug"]

# Test stage
FROM development AS test
RUN pytest tests/

# Production stage
FROM base AS production
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
RUN useradd -r appuser && chown -R appuser /app
USER appuser
CMD ["gunicorn", "-b", "0.0.0.0:8000", "app:app"]
```

### Build Specific Targets

```bash
# Build development image
docker build --target development -t myapp:dev .

# Build production image
docker build --target production -t myapp:prod .

# Build test image and run tests
docker build --target test -t myapp:test .
```

---

## 8. Security Best Practices

### Dockerfile Security

```dockerfile
# 1. Use specific base image versions
FROM python:3.11.4-slim-bookworm    # Not python:latest

# 2. Create and use non-root user
RUN groupadd -r appgroup && useradd -r -g appgroup appuser
USER appuser

# 3. Use COPY instead of ADD (unless extracting tar)
COPY requirements.txt .              # Preferred
#ADD requirements.txt .              # Avoid

# 4. Don't store secrets in images
# Use secrets at runtime, not build time
# Bad: ENV API_KEY=secret
# Good: Pass at runtime with -e or secrets

# 5. Use multi-stage builds to exclude build tools
FROM node:18 AS builder
# ... build steps
FROM node:18-slim
COPY --from=builder /app/dist ./dist

# 6. Scan for vulnerabilities
# docker scan myimage

# 7. Set read-only filesystem where possible
# docker run --read-only myimage

# 8. Drop capabilities
# docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE myimage

# 9. Use .dockerignore
# Create .dockerignore file
```

### .dockerignore Example

```dockerignore
# Git
.git
.gitignore

# Docker
Dockerfile*
docker-compose*
.docker

# Dependencies
node_modules
vendor
__pycache__
*.pyc

# IDE
.idea
.vscode
*.swp
*.swo

# Testing
coverage
.pytest_cache
.nyc_output

# Environment
.env
.env.*
*.local

# Logs
*.log
logs

# Build artifacts
dist
build
*.tar.gz

# Documentation
docs
*.md
!README.md

# Secrets
*.pem
*.key
secrets
```

### Runtime Security

```bash
# Run as non-root
docker run --user 1000:1000 myimage

# Read-only filesystem
docker run --read-only myimage
docker run --read-only --tmpfs /tmp myimage

# Drop capabilities
docker run --cap-drop=ALL myimage
docker run --cap-drop=ALL --cap-add=CHOWN myimage

# Security options
docker run --security-opt=no-new-privileges myimage
docker run --security-opt apparmor=docker-default myimage

# Resource limits
docker run --memory="512m" --cpus="1.0" myimage
docker run --pids-limit=100 myimage

# Network restrictions
docker run --network=none myimage

# Read-only mounts
docker run -v /host/path:/container/path:ro myimage
```

### Image Scanning

```bash
# Docker Scout (built-in)
docker scout cves myimage
docker scout recommendations myimage

# Trivy
trivy image myimage

# Snyk
snyk container test myimage

# Anchore
anchore-cli image add myimage
anchore-cli image vuln myimage
```

---

## 9. Performance Optimization

### Build Optimization

```dockerfile
# 1. Order layers from least to most frequently changed
FROM python:3.11-slim
WORKDIR /app

# Rarely changes
COPY requirements.txt .
RUN pip install -r requirements.txt

# Changes often
COPY . .

# 2. Combine RUN commands to reduce layers
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        package1 \
        package2 && \
    rm -rf /var/lib/apt/lists/*

# 3. Use .dockerignore to reduce context size

# 4. Use BuildKit
DOCKER_BUILDKIT=1 docker build .

# 5. Use cache mounts
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt
```

### Runtime Optimization

```bash
# Resource limits
docker run \
  --memory="512m" \
  --memory-swap="1g" \
  --cpus="1.5" \
  --cpu-shares=512 \
  myimage

# Logging limits
docker run \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myimage

# Storage driver
# Use overlay2 (default on modern Docker)

# Check image size
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

# Analyze layers
docker history myimage
dive myimage  # Third-party tool for layer analysis
```

### Image Size Optimization

```dockerfile
# Use slim/alpine base images
FROM python:3.11-slim      # Instead of python:3.11
FROM node:18-alpine        # Instead of node:18

# Remove package manager cache
RUN apt-get update && \
    apt-get install -y package && \
    rm -rf /var/lib/apt/lists/*

RUN apk add --no-cache package  # Alpine

# Don't install dev dependencies in production
RUN npm ci --only=production

# Use multi-stage builds
FROM builder AS final
COPY --from=builder /app/dist ./dist

# Remove unnecessary files
RUN rm -rf /tmp/* /var/tmp/*
```

---

## 10. Production Patterns

### Container Orchestration Readiness

```dockerfile
# Production-ready Dockerfile
FROM python:3.11-slim AS base

# Security: Create non-root user
RUN groupadd -r app && useradd -r -g app app

# Performance: Set environment
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependencies first (caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Application
COPY --chown=app:app . .

USER app

EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Graceful shutdown
STOPSIGNAL SIGTERM

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "app:app"]
```

### Entrypoint Scripts

```bash
#!/bin/bash
# docker-entrypoint.sh
set -e

# Wait for dependencies
wait_for_service() {
    host=$1
    port=$2
    echo "Waiting for $host:$port..."
    while ! nc -z "$host" "$port"; do
        sleep 1
    done
    echo "$host:$port is available"
}

# Wait for database
if [ -n "$DATABASE_HOST" ]; then
    wait_for_service "$DATABASE_HOST" "${DATABASE_PORT:-5432}"
fi

# Run migrations
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "Running migrations..."
    python manage.py migrate
fi

# Execute main command
exec "$@"
```

```dockerfile
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["gunicorn", "app:app"]
```

### Logging Best Practices

```dockerfile
# Log to stdout/stderr (not files)
CMD ["app", "--log-format", "json", "--log-output", "stdout"]
```

```bash
# Docker logging drivers
docker run --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  myimage

# Other drivers: syslog, journald, fluentd, awslogs, gcplogs
```

### Quick Reference

```bash
# === CONTAINER LIFECYCLE ===
docker run -d --name app -p 8080:80 nginx
docker exec -it app bash
docker logs -f app
docker stop app && docker rm app

# === IMAGES ===
docker build -t myapp:v1 .
docker push registry/myapp:v1
docker pull registry/myapp:v1
docker images && docker rmi imageid

# === VOLUMES ===
docker volume create data
docker run -v data:/app/data myapp
docker run -v $(pwd):/app myapp

# === NETWORKS ===
docker network create mynet
docker run --network mynet myapp

# === COMPOSE ===
docker compose up -d
docker compose down -v
docker compose logs -f

# === CLEANUP ===
docker system prune -af --volumes
```

---

*This guide covers Docker comprehensively. Continue to the Kubernetes guide for container orchestration.*
