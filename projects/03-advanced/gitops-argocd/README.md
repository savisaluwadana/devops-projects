# 🔄 GitOps with ArgoCD

Implement declarative, Git-based continuous delivery for Kubernetes.

## 🎯 Learning Objectives

- Understand GitOps principles
- Deploy and configure ArgoCD
- Implement App of Apps pattern
- Use sync waves and hooks
- Set up automated deployments

## 📋 Prerequisites

- Kubernetes cluster
- kubectl configured
- Git repository for manifests

## 🏗️ GitOps Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────────────┐
│ Developer   │────▶│   GitHub    │────▶│      ArgoCD         │
│ pushes code │     │ Repository  │     │ (watches & syncs)   │
└─────────────┘     └─────────────┘     └──────────┬──────────┘
                                                    │
                                                    ▼
                                        ┌─────────────────────┐
                                        │  Kubernetes Cluster │
                                        │  ┌───────────────┐  │
                                        │  │  Deployments  │  │
                                        │  │  Services     │  │
                                        │  │  ConfigMaps   │  │
                                        │  └───────────────┘  │
                                        └─────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install ArgoCD
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n argocd --timeout=300s

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward for UI access
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Or use CLI
brew install argocd
argocd login localhost:8080
```

### Lab 2: First Application
```yaml
# application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: guestbook
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/argoproj/argocd-example-apps
    targetRevision: HEAD
    path: guestbook
  destination:
    server: https://kubernetes.default.svc
    namespace: guestbook
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
```

```bash
kubectl apply -f application.yaml
argocd app get guestbook
argocd app sync guestbook
```

### Lab 3: App of Apps Pattern
```yaml
# apps/application.yaml (root app)
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: apps
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

---
# apps/frontend.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: frontend
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: services/frontend
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true

---
# apps/backend.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: backend
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: services/backend
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### Lab 4: Sync Waves & Hooks
```yaml
# Database first (wave 0)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postgres
  annotations:
    argocd.argoproj.io/sync-wave: "0"
spec:
  # ...

---
# Then API (wave 1)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  annotations:
    argocd.argoproj.io/sync-wave: "1"
spec:
  # ...

---
# Then frontend (wave 2)
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  annotations:
    argocd.argoproj.io/sync-wave: "2"
spec:
  # ...

---
# Pre-sync hook: run migrations
apiVersion: batch/v1
kind: Job
metadata:
  name: db-migration
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

---
# Post-sync hook: notify
apiVersion: batch/v1
kind: Job
metadata:
  name: notify-slack
  annotations:
    argocd.argoproj.io/hook: PostSync
    argocd.argoproj.io/hook-delete-policy: HookSucceeded
spec:
  template:
    spec:
      containers:
      - name: notify
        image: curlimages/curl
        command: ["curl", "-X", "POST", "-d", "Deployment complete!", "$(SLACK_WEBHOOK)"]
      restartPolicy: Never
```

### Lab 5: Kustomize with ArgoCD
```yaml
# kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: production

resources:
  - deployment.yaml
  - service.yaml

images:
  - name: myapp
    newTag: v1.2.3

commonLabels:
  environment: production

configMapGenerator:
  - name: app-config
    literals:
      - LOG_LEVEL=info
      - API_URL=https://api.example.com

---
# ArgoCD Application using Kustomize
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-production
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
```

## 📝 Project: Multi-Environment GitOps

```
k8s-manifests/
├── base/
│   ├── kustomization.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   └── configmap.yaml
├── overlays/
│   ├── development/
│   │   ├── kustomization.yaml
│   │   └── patch-replicas.yaml
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── patch-resources.yaml
│   └── production/
│       ├── kustomization.yaml
│       ├── patch-replicas.yaml
│       └── patch-resources.yaml
└── apps/
    ├── apps.yaml              # Root app
    ├── development.yaml
    ├── staging.yaml
    └── production.yaml
```

```yaml
# apps/apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: applications
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: apps
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true

---
# apps/production.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: myapp-production
  namespace: argocd
  labels:
    environment: production
spec:
  project: production
  source:
    repoURL: https://github.com/your-org/k8s-manifests
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
```

## 🔧 ArgoCD CLI Commands

```bash
# App management
argocd app list
argocd app get myapp
argocd app sync myapp
argocd app diff myapp

# Rollback
argocd app history myapp
argocd app rollback myapp <revision>

# Project management
argocd proj list
argocd proj create production --dest '*,production'

# Repository management
argocd repo add https://github.com/your-org/repo --username git --password token

# Sync options
argocd app sync myapp --prune
argocd app sync myapp --force
argocd app sync myapp --dry-run
```

## ✅ Completion Checklist

- [ ] Install ArgoCD on cluster
- [ ] Deploy first application
- [ ] Implement App of Apps pattern
- [ ] Use sync waves for ordering
- [ ] Configure sync hooks
- [ ] Set up Kustomize overlays
- [ ] Create multi-environment setup
- [ ] Configure RBAC projects

## 📚 Resources

- [ArgoCD Docs](https://argo-cd.readthedocs.io/)
- [GitOps Principles](https://opengitops.dev/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/user-guide/best_practices/)

---

**Next Project:** [Service Mesh with Istio](../istio-mesh/)
