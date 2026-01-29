# 🎼 Docker Compose Multi-Service Apps

Orchestrate multi-container applications for development and testing.

## 🎯 Learning Objectives

- Define multi-container applications
- Manage service dependencies
- Configure networking between services
- Use volumes for data persistence
- Handle environment configuration

## 📋 Prerequisites

- Completed Docker Basics project
- Docker Compose installed

## 🔬 Hands-On Labs

### Lab 1: First Compose File
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html:ro
```

```bash
# Create content
mkdir html
echo "<h1>Hello from Compose!</h1>" > html/index.html

# Run
docker compose up -d
curl http://localhost:8080

# Stop
docker compose down
```

### Lab 2: Web + Database Stack
```yaml
version: '3.8'

services:
  api:
    build: ./api
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgres://user:password@db:5432/myapp
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d myapp"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - backend

volumes:
  postgres_data:

networks:
  backend:
```

### Lab 3: Full Stack Application
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      target: development
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - api
    networks:
      - frontend

  api:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app
      - REDIS_URL=redis://cache:6379
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - frontend
      - backend

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    volumes:
      - db_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - backend

  cache:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - backend

  adminer:
    image: adminer
    ports:
      - "8081:8080"
    networks:
      - backend

volumes:
  db_data:
  redis_data:

networks:
  frontend:
  backend:
```

### Lab 4: Environment Configuration
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    env_file:
      - .env
      - .env.local
    environment:
      - NODE_ENV=${NODE_ENV:-development}
```

**.env:**
```bash
DATABASE_URL=postgres://localhost:5432/app
API_SECRET=development-secret
DEBUG=true
```

**docker-compose.override.yml** (auto-loaded for dev):
```yaml
version: '3.8'

services:
  app:
    volumes:
      - .:/app
    command: npm run dev
```

**docker-compose.prod.yml:**
```yaml
version: '3.8'

services:
  app:
    environment:
      - NODE_ENV=production
    command: npm start
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## 📝 Project: Complete Development Stack

Create a full development environment:

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  # Frontend - React with hot reload
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    networks:
      - app-network

  # Backend - Python API
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/devdb
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=dev-secret-key
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - app-network

  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: devdb
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init:/docker-entrypoint-initdb.d
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Redis Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - app-network

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

  # Mailhog for email testing
  mailhog:
    image: mailhog/mailhog
    ports:
      - "1025:1025"  # SMTP
      - "8025:8025"  # Web UI
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

**nginx/nginx.conf:**
```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8000;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
        }

        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

## 🔧 Useful Commands

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f api

# Scale service
docker compose up -d --scale api=3

# Execute command in service
docker compose exec db psql -U postgres

# Rebuild and restart
docker compose up -d --build

# Stop and remove everything
docker compose down -v

# Use specific compose file
docker compose -f docker-compose.prod.yml up -d
```

## ✅ Completion Checklist

- [ ] Create multi-service compose files
- [ ] Configure service dependencies
- [ ] Set up custom networks
- [ ] Use volumes for persistence
- [ ] Handle environment variables
- [ ] Implement health checks
- [ ] Create dev/prod configurations
- [ ] Build complete dev stack

## 📚 Resources

- [Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Compose Networking](https://docs.docker.com/compose/networking/)

---

**Next Project:** [GitHub Actions Intro](../github-actions-intro/)
