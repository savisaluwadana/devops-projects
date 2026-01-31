# 🛤️ Golden Path Templates

Create developer self-service templates for consistent, best-practice application scaffolding.

## 🎯 Learning Objectives

- Design golden path templates
- Create Cookiecutter/Copier templates
- Implement service templates with Backstage
- Generate CI/CD pipelines automatically
- Enforce organizational standards

## 📋 Prerequisites

- Python 3.8+ (for Cookiecutter)
- Understanding of project scaffolding
- CI/CD basics

## 🏗️ Golden Path Concept

```
┌─────────────────────────────────────────────────────────────────┐
│                    GOLDEN PATH TEMPLATES                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  The "Golden Path" is the recommended, well-lit path for        │
│  developers to follow when creating new services.               │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Template                     Generated Project              ││
│  │  ┌───────────────┐           ┌───────────────────────────┐  ││
│  │  │ cookiecutter/ │           │ my-new-service/           │  ││
│  │  │   template/   │  ──────▶  │   src/                    │  ││
│  │  │   {{name}}/   │           │   Dockerfile              │  ││
│  │  │              │           │   .github/workflows/      │  ││
│  │  └───────────────┘           │   kubernetes/             │  ││
│  │                              │   README.md               │  ││
│  │                              └───────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Benefits:                                                       │
│  ✅ Consistent project structure                                │
│  ✅ Built-in CI/CD pipelines                                    │
│  ✅ Security best practices                                     │
│  ✅ Observability configured                                    │
│  ✅ Documentation templates                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Basic Cookiecutter Template

```bash
# Install Cookiecutter
pip install cookiecutter

# Create template structure
mkdir -p golden-path-templates/node-api
cd golden-path-templates/node-api
```

Create the template structure:

```
node-api/
├── cookiecutter.json
├── hooks/
│   └── post_gen_project.py
└── {{cookiecutter.project_slug}}/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml
    ├── src/
    │   ├── index.js
    │   └── routes/
    │       └── health.js
    ├── kubernetes/
    │   ├── deployment.yaml
    │   └── service.yaml
    ├── Dockerfile
    ├── package.json
    └── README.md
```

```json
// cookiecutter.json
{
  "project_name": "My API Service",
  "project_slug": "{{ cookiecutter.project_name.lower().replace(' ', '-') }}",
  "description": "A Node.js API service",
  "author_name": "Developer",
  "author_email": "dev@example.com",
  "version": "1.0.0",
  "node_version": "18",
  "port": "3000",
  "include_database": ["none", "postgresql", "mongodb"],
  "include_redis": ["no", "yes"],
  "team_name": "platform",
  "environment": ["development", "staging", "production"]
}
```

### Lab 2: Template Files

```javascript
// {{cookiecutter.project_slug}}/src/index.js
const express = require('express');
const prometheus = require('prom-client');

const app = express();
const port = process.env.PORT || {{ cookiecutter.port }};

// Metrics
prometheus.collectDefaultMetrics();

// Health routes
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: '{{ cookiecutter.project_slug }}' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
});

// Start server
app.listen(port, () => {
  console.log(`{{ cookiecutter.project_name }} running on port ${port}`);
});
```

```dockerfile
# {{cookiecutter.project_slug}}/Dockerfile
FROM node:{{ cookiecutter.node_version }}-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:{{ cookiecutter.node_version }}-alpine

WORKDIR /app

# Security: non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --chown=nodejs:nodejs . .

USER nodejs
EXPOSE {{ cookiecutter.port }}

HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -qO- http://localhost:{{ cookiecutter.port }}/health || exit 1

CMD ["node", "src/index.js"]
```

```yaml
# {{cookiecutter.project_slug}}/kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ cookiecutter.project_slug }}
  labels:
    app: {{ cookiecutter.project_slug }}
    team: {{ cookiecutter.team_name }}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: {{ cookiecutter.project_slug }}
  template:
    metadata:
      labels:
        app: {{ cookiecutter.project_slug }}
        team: {{ cookiecutter.team_name }}
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "{{ cookiecutter.port }}"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: {{ cookiecutter.project_slug }}
        image: ghcr.io/org/{{ cookiecutter.project_slug }}:latest
        ports:
        - containerPort: {{ cookiecutter.port }}
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: {{ cookiecutter.port }}
          initialDelaySeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: {{ cookiecutter.port }}
          initialDelaySeconds: 5
```

```yaml
# {{cookiecutter.project_slug}}/.github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: {% raw %}${{ github.repository }}{% endraw %}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '{{ cookiecutter.node_version }}'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linter
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: {% raw %}${{ env.REGISTRY }}{% endraw %}
        username: {% raw %}${{ github.actor }}{% endraw %}
        password: {% raw %}${{ secrets.GITHUB_TOKEN }}{% endraw %}
    
    - name: Build and push
      uses: docker/build-push-action@v5
      with:
        push: true
        tags: |
          {% raw %}${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}{% endraw %}
          {% raw %}${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest{% endraw %}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Kubernetes
      run: |
        # Update image tag and apply
        kubectl set image deployment/{{ cookiecutter.project_slug }} \
          {{ cookiecutter.project_slug }}={% raw %}${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}{% endraw %}
```

### Lab 3: Post-Generation Hooks

```python
# hooks/post_gen_project.py
import os
import subprocess

def init_git():
    """Initialize git repository"""
    subprocess.run(['git', 'init'])
    subprocess.run(['git', 'add', '.'])
    subprocess.run(['git', 'commit', '-m', 'Initial commit from golden path template'])

def install_dependencies():
    """Install npm dependencies"""
    subprocess.run(['npm', 'install'])

def setup_database():
    """Add database configurations if selected"""
    database = '{{ cookiecutter.include_database }}'
    
    if database == 'postgresql':
        # Add pg package
        subprocess.run(['npm', 'install', 'pg'])
        print("PostgreSQL driver installed")
    elif database == 'mongodb':
        subprocess.run(['npm', 'install', 'mongoose'])
        print("MongoDB driver installed")

def main():
    print("\n🚀 Setting up {{ cookiecutter.project_name }}...")
    
    init_git()
    install_dependencies()
    setup_database()
    
    print("""
╔══════════════════════════════════════════════════════════════╗
║  🎉 Project {{ cookiecutter.project_slug }} created successfully!  ║
╠══════════════════════════════════════════════════════════════╣
║                                                                ║
║  Next steps:                                                   ║
║  1. cd {{ cookiecutter.project_slug }}                         ║
║  2. npm run dev                                                ║
║  3. Open http://localhost:{{ cookiecutter.port }}              ║
║                                                                ║
║  To deploy:                                                    ║
║  1. Push to GitHub                                             ║
║  2. GitHub Actions will build and deploy automatically        ║
║                                                                ║
╚══════════════════════════════════════════════════════════════╝
    """)

if __name__ == '__main__':
    main()
```

### Lab 4: Use the Template

```bash
# Generate new project
cookiecutter golden-path-templates/node-api

# Answer prompts:
# project_name [My API Service]: User Service
# project_slug [user-service]: 
# description [A Node.js API service]: User management API
# node_version [18]: 
# port [3000]: 8080
# include_database [none]: postgresql
# include_redis [no]: yes
# team_name [platform]: backend

# Project is created!
cd user-service
npm run dev
```

### Lab 5: Copier Template (Alternative)

```bash
# Install Copier (more modern alternative to Cookiecutter)
pip install copier

# Create template with Copier
mkdir -p templates/python-api
```

```yaml
# templates/python-api/copier.yml
_subdirectory: template

project_name:
  type: str
  help: "Name of your service"
  
project_slug:
  type: str
  default: "{{ project_name | lower | replace(' ', '-') }}"
  
python_version:
  type: str
  default: "3.11"
  choices:
    - "3.10"
    - "3.11"
    - "3.12"
    
framework:
  type: str
  default: fastapi
  choices:
    - fastapi
    - flask
    - django

include_docker:
  type: bool
  default: true
  
include_kubernetes:
  type: bool
  default: true
  
include_github_actions:
  type: bool
  default: true
```

Use Copier:
```bash
copier copy templates/python-api my-new-service

# Update existing project from template
copier update my-new-service
```

## 📝 Project: Complete Template Library

Create a comprehensive template library:

```
golden-paths/
├── templates/
│   ├── node-api/
│   │   ├── cookiecutter.json
│   │   └── {{cookiecutter.project_slug}}/
│   ├── python-api/
│   │   ├── copier.yml
│   │   └── template/
│   ├── go-service/
│   ├── react-app/
│   └── data-pipeline/
├── docs/
│   ├── GETTING_STARTED.md
│   └── TEMPLATE_GUIDE.md
├── catalog-info.yaml  # Backstage integration
└── README.md
```

```yaml
# catalog-info.yaml (for Backstage integration)
apiVersion: backstage.io/v1alpha1
kind: Template
metadata:
  name: node-api-template
  title: Node.js API Service
  description: Create a production-ready Node.js API
  tags:
    - recommended
    - node
    - api
spec:
  owner: platform-team
  type: service
  
  parameters:
    - title: Service Details
      required:
        - name
        - owner
      properties:
        name:
          title: Name
          type: string
          description: Service name
        owner:
          title: Owner
          type: string
          description: Team owning this service
          ui:field: OwnerPicker
          
    - title: Infrastructure
      properties:
        includeDatabase:
          title: Include Database
          type: string
          enum: [none, postgresql, mongodb]
          default: none
  
  steps:
    - id: fetch-template
      name: Fetch Template
      action: fetch:cookiecutter
      input:
        url: ./templates/node-api
        values:
          project_name: ${{ parameters.name }}
          
    - id: publish
      name: Publish to GitHub
      action: publish:github
      input:
        repoUrl: github.com?owner=org&repo=${{ parameters.name }}
        
    - id: register
      name: Register in Catalog
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
```

## ✅ Completion Checklist

- [ ] Create Cookiecutter template structure
- [ ] Add Dockerfile with best practices
- [ ] Include Kubernetes manifests
- [ ] Add GitHub Actions workflow
- [ ] Create post-generation hooks
- [ ] Test template generation
- [ ] Try Copier alternative
- [ ] Integrate with Backstage (optional)

## 📚 Resources

- [Cookiecutter Docs](https://cookiecutter.readthedocs.io/)
- [Copier Docs](https://copier.readthedocs.io/)
- [Backstage Software Templates](https://backstage.io/docs/features/software-templates/)

---

**Next Project:** [Cost Optimization](../cost-optimization/)
