# ⚡ GitHub Actions CI/CD Introduction

Build your first CI/CD pipelines with GitHub Actions.

## 🎯 Learning Objectives

- Understand GitHub Actions concepts
- Create workflow files
- Use actions from the marketplace
- Handle secrets and environment variables
- Build and test code automatically

## 📋 Prerequisites

- GitHub account
- Repository with code to build/test
- Basic YAML knowledge

## 🔬 Hands-On Labs

### Lab 1: First Workflow
```yaml
# .github/workflows/hello.yml
name: Hello World

on:
  push:
    branches: [main]
  workflow_dispatch:  # Manual trigger

jobs:
  greet:
    runs-on: ubuntu-latest
    steps:
      - name: Say Hello
        run: echo "Hello, GitHub Actions!"
      
      - name: Show Environment
        run: |
          echo "Repository: ${{ github.repository }}"
          echo "Branch: ${{ github.ref_name }}"
          echo "Actor: ${{ github.actor }}"
          echo "Event: ${{ github.event_name }}"
```

### Lab 2: Build & Test Pipeline
```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

### Lab 3: Matrix Builds
```yaml
name: Matrix CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [16, 18, 20]
        exclude:
          - os: windows-latest
            node-version: 16
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      
      - run: npm ci
      - run: npm test
```

### Lab 4: Docker Build & Push
```yaml
name: Docker Build

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Lab 5: Secrets & Environments
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-staging:
    runs-on: ubuntu-latest
    environment: staging
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        env:
          API_KEY: ${{ secrets.API_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
        run: |
          echo "Deploying to staging..."
          ./deploy.sh staging

  deploy-production:
    runs-on: ubuntu-latest
    needs: deploy-staging
    environment:
      name: production
      url: https://myapp.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        env:
          API_KEY: ${{ secrets.API_KEY }}
        run: |
          echo "Deploying to production..."
          ./deploy.sh production
```

## 📝 Project: Complete CI/CD Pipeline

Create a production-ready pipeline:

```yaml
# .github/workflows/complete-ci-cd.yml
name: Complete CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # Job 1: Lint and Test
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-dev.txt
      
      - name: Lint with flake8
        run: flake8 src/ tests/
      
      - name: Format check with black
        run: black --check src/ tests/
      
      - name: Type check with mypy
        run: mypy src/
      
      - name: Run tests
        run: pytest tests/ -v --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  # Job 2: Security Scan
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          severity: 'CRITICAL,HIGH'

  # Job 3: Build Docker Image
  build:
    runs-on: ubuntu-latest
    needs: [test, security]
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha,prefix=
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # Job 4: Deploy to Staging
  deploy-staging:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    environment:
      name: staging
      url: https://staging.myapp.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Staging
        run: |
          echo "Deploying ${{ needs.build.outputs.image-tag }} to staging"
          # kubectl set image deployment/app app=${{ needs.build.outputs.image-tag }}

  # Job 5: Deploy to Production
  deploy-production:
    runs-on: ubuntu-latest
    needs: [build, deploy-staging]
    if: github.event_name == 'release'
    environment:
      name: production
      url: https://myapp.com
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Production
        run: |
          echo "Deploying to production"
          # Production deployment steps
```

## 🔧 Useful Patterns

```yaml
# Conditional execution
- name: Only on main
  if: github.ref == 'refs/heads/main'
  run: echo "On main branch"

# Artifact sharing
- uses: actions/upload-artifact@v4
  with:
    name: build-output
    path: dist/

- uses: actions/download-artifact@v4
  with:
    name: build-output

# Caching
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

# Reusable workflows
jobs:
  call-workflow:
    uses: ./.github/workflows/reusable.yml
    with:
      environment: staging
    secrets: inherit
```

## ✅ Completion Checklist

- [ ] Create basic workflows
- [ ] Use checkout and setup actions
- [ ] Implement matrix builds
- [ ] Build Docker images in CI
- [ ] Use secrets securely
- [ ] Set up environments
- [ ] Create complete CI/CD pipeline
- [ ] Add caching for faster builds

## 📚 Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Actions Marketplace](https://github.com/marketplace?type=actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**Next Level:** [Kubernetes Basics](../../02-intermediate/k8s-basics/)
