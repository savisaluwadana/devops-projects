# 🐳 Docker Fundamentals

Master containerization - the foundation of cloud-native applications.

## 🎯 Learning Objectives

- Understand container concepts
- Write production-ready Dockerfiles
- Manage images and containers
- Use Docker volumes and networks
- Build multi-stage images

## 📋 Prerequisites

- Docker Desktop or Docker Engine installed
- Basic Linux command knowledge

## 🔬 Hands-On Labs

### Lab 1: First Container
```bash
# Run your first container
docker run hello-world

# Interactive container
docker run -it ubuntu:22.04 bash

# Background container
docker run -d -p 8080:80 --name webserver nginx

# Container management
docker ps
docker logs webserver
docker exec -it webserver bash
docker stop webserver
docker rm webserver
```

### Lab 2: Image Management
```bash
# Pull images
docker pull python:3.11-slim
docker pull node:18-alpine

# List images
docker images

# Image details
docker inspect python:3.11-slim

# Remove unused images
docker image prune -a
```

### Lab 3: Writing Dockerfiles
```dockerfile
# Simple Python App
FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Non-root user
RUN useradd -m appuser
USER appuser

EXPOSE 8000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t my-python-app .
docker run -p 8000:8000 my-python-app
```

### Lab 4: Multi-Stage Builds
```dockerfile
# Frontend build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production image
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
```

### Lab 5: Volumes & Networking
```bash
# Named volumes
docker volume create mydata
docker run -v mydata:/data alpine echo "Hello" > /data/hello.txt

# Bind mounts (development)
docker run -v $(pwd):/app -p 3000:3000 node:18-alpine npm run dev

# Custom networks
docker network create myapp-network

docker run -d --name db --network myapp-network postgres:15
docker run -d --name api --network myapp-network \
  -e DATABASE_URL=postgres://db:5432/myapp my-api
```

## 📝 Project: Containerized Web Application

Create a complete containerized application:

**app.py:**
```python
from flask import Flask, jsonify
import os
import socket

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        'message': 'Hello from Docker!',
        'hostname': socket.gethostname(),
        'version': os.getenv('APP_VERSION', '1.0.0')
    })

@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

**requirements.txt:**
```
flask==3.0.0
gunicorn==21.2.0
```

**Dockerfile:**
```dockerfile
FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

FROM base AS builder

RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install --target=/app/deps -r requirements.txt

FROM base AS runtime

COPY --from=builder /app/deps /app/deps
ENV PYTHONPATH=/app/deps

COPY . .

RUN useradd -m -r appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["python", "-m", "gunicorn", "-b", "0.0.0.0:8000", "app:app"]
```

**.dockerignore:**
```
__pycache__
*.pyc
*.pyo
.git
.gitignore
.env
*.md
.pytest_cache
.venv
```

Build and run:
```bash
docker build -t flask-app:1.0.0 .
docker run -d -p 8000:8000 --name myapp flask-app:1.0.0
curl http://localhost:8000
```

## 🔧 Best Practices

| Practice | Reason |
|----------|--------|
| Use specific tags | Reproducible builds |
| Multi-stage builds | Smaller images |
| Non-root user | Security |
| .dockerignore | Faster builds, smaller context |
| Layer caching | Faster rebuilds |
| HEALTHCHECK | Container orchestration |
| Labels | Metadata/organization |

## ✅ Completion Checklist

- [ ] Run and manage containers
- [ ] Write Dockerfiles
- [ ] Build multi-stage images
- [ ] Use volumes for persistence
- [ ] Create custom networks
- [ ] Implement health checks
- [ ] Follow security best practices
- [ ] Use .dockerignore

## 📚 Resources

- [Docker Documentation](https://docs.docker.com/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Next Project:** [Docker Compose](../docker-compose/)
