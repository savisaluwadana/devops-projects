# 🏢 Internal Developer Portal with Backstage

Build a self-service developer portal for your organization.

## 🎯 Learning Objectives

- Deploy Backstage
- Create software catalog
- Build scaffolder templates
- Integrate plugins
- Implement TechDocs

## 📋 Prerequisites

- Node.js 18+
- Docker
- PostgreSQL
- GitHub/GitLab account

## 🏗️ Platform Engineering Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTERNAL DEVELOPER PORTAL                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Software   │  │ Scaffolder  │  │      Tech Docs          │ │
│  │  Catalog    │  │ (Templates) │  │    (Documentation)      │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Kubernetes  │  │  ArgoCD     │  │    Cost Insights        │ │
│  │   Plugin    │  │   Plugin    │  │      Plugin             │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                        DEVELOPERS                                │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │ Team A │  │ Team B │  │ Team C │  │ Team D │               │
│  └────────┘  └────────┘  └────────┘  └────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Create Backstage App
```bash
# Create new Backstage app
npx @backstage/create-app@latest

# Navigate to app
cd my-backstage-app

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Lab 2: Configure App
```yaml
# app-config.yaml
app:
  title: Platform Portal
  baseUrl: http://localhost:3000

organization:
  name: My Company

backend:
  baseUrl: http://localhost:7007
  listen:
    port: 7007
  database:
    client: pg
    connection:
      host: localhost
      port: 5432
      user: backstage
      password: backstage
      database: backstage

integrations:
  github:
    - host: github.com
      token: ${GITHUB_TOKEN}

catalog:
  import:
    entityFilename: catalog-info.yaml
  rules:
    - allow: [Component, System, API, Resource, Location, Domain, Group, User]
  locations:
    - type: file
      target: ../../examples/entities.yaml
    - type: url
      target: https://github.com/my-org/service-catalog/blob/main/all.yaml

scaffolder:
  defaultAuthor:
    name: Platform Team
    email: platform@company.com
  defaultCommitMessage: "Initial commit from Backstage"
```

### Lab 3: Software Catalog
```yaml
# catalog-info.yaml (in your service repo)
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: user-service
  description: User management microservice
  tags:
    - python
    - fastapi
  annotations:
    github.com/project-slug: my-org/user-service
    backstage.io/techdocs-ref: dir:.
    argocd/app-name: user-service
    prometheus.io/alert: user-service
  links:
    - url: https://user-service.internal.company.com
      title: Production
      icon: dashboard
spec:
  type: service
  lifecycle: production
  owner: team-platform
  system: user-platform
  dependsOn:
    - resource:default/postgres-main
  providesApis:
    - user-api

---
apiVersion: backstage.io/v1alpha1
kind: API
metadata:
  name: user-api
  description: User management REST API
spec:
  type: openapi
  lifecycle: production
  owner: team-platform
  definition:
    $text: ./openapi.yaml

---
apiVersion: backstage.io/v1alpha1
kind: System
metadata:
  name: user-platform
  description: User management platform
spec:
  owner: team-platform
  domain: identity

---
apiVersion: backstage.io/v1alpha1
kind: Resource
metadata:
  name: postgres-main
  description: Main PostgreSQL database
spec:
  type: database
  owner: team-platform
```

### Lab 4: Scaffolder Template
```yaml
# templates/microservice/template.yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: microservice-template
  title: Python Microservice
  description: Create a new Python microservice with FastAPI
  tags:
    - recommended
    - python
    - fastapi
spec:
  owner: team-platform
  type: service

  parameters:
    - title: Service Information
      required:
        - name
        - description
        - owner
      properties:
        name:
          title: Name
          type: string
          description: Unique name of the service
          pattern: '^[a-z0-9-]+$'
        description:
          title: Description
          type: string
          description: Brief description of the service
        owner:
          title: Owner
          type: string
          description: Team that owns this service
          ui:field: OwnerPicker
          ui:options:
            allowedKinds:
              - Group

    - title: Repository Configuration
      required:
        - repoUrl
      properties:
        repoUrl:
          title: Repository Location
          type: string
          ui:field: RepoUrlPicker
          ui:options:
            allowedHosts:
              - github.com

    - title: Infrastructure Options
      properties:
        hasDatabase:
          title: Needs Database?
          type: boolean
          default: false
        databaseType:
          title: Database Type
          type: string
          enum:
            - postgresql
            - mysql
            - mongodb
          default: postgresql
          ui:widget: radio

  steps:
    - id: fetch
      name: Fetch Template
      action: fetch:template
      input:
        url: ./skeleton
        values:
          name: ${{ parameters.name }}
          description: ${{ parameters.description }}
          owner: ${{ parameters.owner }}
          hasDatabase: ${{ parameters.hasDatabase }}
          databaseType: ${{ parameters.databaseType }}

    - id: publish
      name: Publish Repository
      action: publish:github
      input:
        allowedHosts: ['github.com']
        repoUrl: ${{ parameters.repoUrl }}
        defaultBranch: main
        description: ${{ parameters.description }}

    - id: register
      name: Register Component
      action: catalog:register
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: '/catalog-info.yaml'

    - id: create-argocd-app
      name: Create ArgoCD Application
      action: argocd:create-resources
      input:
        appName: ${{ parameters.name }}
        argoInstance: main
        namespace: ${{ parameters.name }}
        repoUrl: ${{ steps.publish.output.remoteUrl }}
        path: k8s

  output:
    links:
      - title: Repository
        url: ${{ steps.publish.output.remoteUrl }}
      - title: Open in catalog
        icon: catalog
        entityRef: ${{ steps.register.output.entityRef }}
```

### Lab 5: TechDocs Setup
```yaml
# mkdocs.yml in your service repo
site_name: User Service
site_description: Documentation for User Service
repo_url: https://github.com/my-org/user-service

nav:
  - Home: index.md
  - Getting Started:
      - Installation: getting-started/installation.md
      - Configuration: getting-started/configuration.md
  - API Reference: api-reference.md
  - Architecture: architecture.md
  - Runbook: runbook.md

plugins:
  - techdocs-core

markdown_extensions:
  - admonition
  - pymdownx.highlight
  - pymdownx.superfences
```

```markdown
<!-- docs/index.md -->
# User Service

User management microservice built with FastAPI.

## Overview

This service provides:
- User registration and authentication
- Profile management
- Session handling

## Quick Start

```bash
docker-compose up -d
curl http://localhost:8000/health
```

## Architecture

![Architecture](./images/architecture.png)
```

## 📝 Project: Complete Developer Portal

```yaml
# docker-compose.yml
version: '3.8'

services:
  backstage:
    build: .
    ports:
      - "3000:3000"
      - "7007:7007"
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_PORT=5432
      - POSTGRES_USER=backstage
      - POSTGRES_PASSWORD=backstage
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    depends_on:
      - postgres

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: backstage
      POSTGRES_PASSWORD: backstage
      POSTGRES_DB: backstage
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

CMD ["yarn", "start"]
```

## 🔧 Plugin Installation

```bash
# Add Kubernetes plugin
yarn --cwd packages/app add @backstage/plugin-kubernetes
yarn --cwd packages/backend add @backstage/plugin-kubernetes-backend

# Add ArgoCD plugin
yarn --cwd packages/app add @roadiehq/backstage-plugin-argo-cd

# Add GitHub Actions plugin
yarn --cwd packages/app add @backstage/plugin-github-actions
```

## ✅ Completion Checklist

- [ ] Create Backstage app
- [ ] Configure integrations
- [ ] Set up software catalog
- [ ] Create scaffolder templates
- [ ] Enable TechDocs
- [ ] Install plugins
- [ ] Deploy to production
- [ ] Onboard first services

## 📚 Resources

- [Backstage Docs](https://backstage.io/docs/)
- [Plugin Marketplace](https://backstage.io/plugins)
- [Backstage Community](https://backstage.io/community)

---

**Next Project:** [Kubernetes Operator Development](../k8s-operator/)
