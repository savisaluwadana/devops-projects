# 🔄 Complete ArgoCD Guide

A comprehensive guide for GitOps with ArgoCD.

---

## Table of Contents
1. [Fundamentals](#1-fundamentals)
2. [Installation](#2-installation)
3. [Applications](#3-applications)
4. [Sync Strategies](#4-sync-strategies)
5. [ApplicationSets](#5-applicationsets)
6. [Advanced Patterns](#6-advanced-patterns)

---

## 1. Fundamentals

### GitOps Principles
- **Declarative**: Desired state in Git
- **Versioned**: Git as source of truth
- **Automated**: Changes applied automatically
- **Auditable**: Git history = audit log

### Architecture
```
┌─────────────────────────────────────────────────┐
│                    ArgoCD                        │
├─────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ API      │  │ Repo     │  │ Application  │  │
│  │ Server   │  │ Server   │  │ Controller   │  │
│  └──────────┘  └──────────┘  └──────────────┘  │
│        │              │              │          │
│        │              ▼              ▼          │
│        │       ┌──────────┐   ┌──────────┐    │
│        │       │   Git    │   │ Kubernetes│    │
│        │       │   Repos  │   │  Cluster  │    │
│        └──────▶└──────────┘   └──────────┘    │
└─────────────────────────────────────────────────┘
```

---

## 2. Installation

```bash
# Install ArgoCD
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Install CLI
brew install argocd

# Login
argocd login localhost:8080 --username admin --password <password>
```

---

## 3. Applications

### Application Manifest
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  
  source:
    repoURL: https://github.com/org/repo.git
    targetRevision: main
    path: k8s/overlays/production
    
    # For Helm
    helm:
      valueFiles:
        - values.yaml
        - values-prod.yaml
      parameters:
        - name: image.tag
          value: "v1.0.0"
    
    # For Kustomize
    kustomize:
      images:
        - myapp=myregistry/myapp:v1.0.0
  
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
```

### CLI Commands
```bash
# Create app
argocd app create myapp \
  --repo https://github.com/org/repo.git \
  --path k8s \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace default

# List apps
argocd app list

# Get app details
argocd app get myapp

# Sync app
argocd app sync myapp
argocd app sync myapp --prune

# Delete app
argocd app delete myapp
```

---

## 4. Sync Strategies

### Manual Sync
```yaml
syncPolicy: {}  # No automated sync
```

### Auto Sync
```yaml
syncPolicy:
  automated:
    prune: true      # Delete resources removed from Git
    selfHeal: true   # Revert manual changes
```

### Sync Waves
```yaml
# Deploy in order using annotations
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "-1"  # Deploy first
---
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "0"   # Then this
---
metadata:
  annotations:
    argocd.argoproj.io/sync-wave: "1"   # Finally this
```

### Sync Hooks
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migrate
  annotations:
    argocd.argoproj.io/hook: PreSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
        - name: migrate
          image: myapp:latest
          command: ["./migrate.sh"]
      restartPolicy: Never
```

---

## 5. ApplicationSets

### Generator Types

```yaml
# List Generator
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: myapp-set
  namespace: argocd
spec:
  generators:
    - list:
        elements:
          - cluster: dev
            url: https://dev.k8s.local
          - cluster: staging
            url: https://staging.k8s.local
          - cluster: prod
            url: https://prod.k8s.local
  
  template:
    metadata:
      name: 'myapp-{{cluster}}'
    spec:
      project: default
      source:
        repoURL: https://github.com/org/repo.git
        targetRevision: main
        path: 'k8s/overlays/{{cluster}}'
      destination:
        server: '{{url}}'
        namespace: myapp
```

```yaml
# Git Directory Generator
spec:
  generators:
    - git:
        repoURL: https://github.com/org/repo.git
        revision: main
        directories:
          - path: apps/*
  
  template:
    metadata:
      name: '{{path.basename}}'
    spec:
      source:
        path: '{{path}}'
```

```yaml
# Cluster Generator
spec:
  generators:
    - clusters:
        selector:
          matchLabels:
            env: production
```

---

## 6. Advanced Patterns

### Multi-Cluster
```yaml
# Add cluster
argocd cluster add my-cluster-context

# Application for remote cluster
spec:
  destination:
    server: https://remote-cluster:6443
    namespace: default
```

### Image Updater
```yaml
# Install Image Updater
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj-labs/argocd-image-updater/stable/manifests/install.yaml

# Application with auto-update
metadata:
  annotations:
    argocd-image-updater.argoproj.io/image-list: myapp=myregistry/myapp
    argocd-image-updater.argoproj.io/myapp.update-strategy: semver
```

### Notifications
```yaml
# ConfigMap for notifications
apiVersion: v1
kind: ConfigMap
metadata:
  name: argocd-notifications-cm
data:
  service.slack: |
    token: $slack-token
  
  template.app-sync-succeeded: |
    message: |
      Application {{.app.metadata.name}} sync succeeded.
  
  trigger.on-sync-succeeded: |
    - when: app.status.operationState.phase in ['Succeeded']
      send: [app-sync-succeeded]
```

### Quick Reference
```bash
# App management
argocd app list
argocd app get myapp
argocd app sync myapp
argocd app diff myapp
argocd app history myapp
argocd app rollback myapp <id>

# Cluster management
argocd cluster list
argocd cluster add <context>

# Project management  
argocd proj list
argocd proj create myproject

# Repository management
argocd repo add https://github.com/org/repo.git
argocd repo list
```

---
*Continue to CircleCI guide for CI/CD.*
