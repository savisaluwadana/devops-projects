# 🌍 Kubernetes Multi-Cluster with ArgoCD

Deploy and manage applications across multiple Kubernetes clusters with ArgoCD.

## 🎯 Learning Objectives

- Configure ArgoCD for multi-cluster management
- Implement ApplicationSets for fleet management
- Use Git generators for dynamic deployments
- Set up cluster-specific configurations
- Manage secrets across clusters

## 📋 Prerequisites

- Multiple Kubernetes clusters
- ArgoCD installed
- kubectl configured for all clusters

## 🏗️ Multi-Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                MULTI-CLUSTER MANAGEMENT                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────┐                          │
│                    │     GitHub      │                          │
│                    │   (GitOps Repo) │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│                             ▼                                    │
│                    ┌─────────────────┐                          │
│                    │     ArgoCD      │                          │
│                    │  (Control Hub)  │                          │
│                    └────────┬────────┘                          │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         ▼                   ▼                   ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Cluster A  │    │  Cluster B  │    │  Cluster C  │         │
│  │  (us-east)  │    │  (eu-west)  │    │  (ap-south) │         │
│  │ ┌─────────┐ │    │ ┌─────────┐ │    │ ┌─────────┐ │         │
│  │ │  Apps   │ │    │ │  Apps   │ │    │ │  Apps   │ │         │
│  │ └─────────┘ │    │ └─────────┘ │    │ └─────────┘ │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Setup Test Clusters

```bash
# Create multiple Kind clusters
for cluster in hub us-east eu-west; do
  kind create cluster --name $cluster
done

# Switch to hub cluster for ArgoCD
kubectl config use-context kind-hub

# Install ArgoCD on hub
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for ready
kubectl wait --for=condition=available deployment/argocd-server -n argocd --timeout=300s

# Get admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port forward
kubectl port-forward svc/argocd-server -n argocd 8443:443 &
```

### Lab 2: Register External Clusters

```bash
# Login to ArgoCD CLI
argocd login localhost:8443 --insecure

# Add clusters to ArgoCD
argocd cluster add kind-us-east --name us-east
argocd cluster add kind-eu-west --name eu-west

# Verify clusters
argocd cluster list

# Alternative: Using Kubernetes secrets
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Secret
metadata:
  name: cluster-us-east
  namespace: argocd
  labels:
    argocd.argoproj.io/secret-type: cluster
type: Opaque
stringData:
  name: us-east
  server: https://us-east-api.example.com
  config: |
    {
      "bearerToken": "$(kubectl config view -o jsonpath='{.users[?(@.name=="kind-us-east")].user.token}')",
      "tlsClientConfig": {
        "insecure": true
      }
    }
EOF
```

### Lab 3: ApplicationSet for Multi-Cluster

```yaml
# multi-cluster-appset.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: multi-cluster-app
  namespace: argocd
spec:
  generators:
  # List generator - deploy to specific clusters
  - list:
      elements:
      - cluster: us-east
        url: https://kubernetes.default.svc  # or external URL
        region: us-east-1
        replicas: "3"
      - cluster: eu-west
        url: https://eu-west-api.example.com
        region: eu-west-1
        replicas: "2"
      - cluster: ap-south
        url: https://ap-south-api.example.com
        region: ap-south-1
        replicas: "2"
  
  template:
    metadata:
      name: "myapp-{{cluster}}"
    spec:
      project: default
      
      source:
        repoURL: https://github.com/org/gitops-repo.git
        targetRevision: HEAD
        path: "apps/myapp/overlays/{{cluster}}"
        helm:
          valueFiles:
          - "values-{{cluster}}.yaml"
          parameters:
          - name: replicas
            value: "{{replicas}}"
          - name: region
            value: "{{region}}"
      
      destination:
        server: "{{url}}"
        namespace: myapp
      
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true
```

### Lab 4: Cluster Generator Pattern

```yaml
# cluster-generator.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: platform-apps
  namespace: argocd
spec:
  generators:
  # Automatically deploy to all registered clusters
  - clusters:
      selector:
        matchLabels:
          environment: production
  
  template:
    metadata:
      name: "platform-{{name}}"
    spec:
      project: platform
      source:
        repoURL: https://github.com/org/platform-apps.git
        path: "manifests"
        targetRevision: HEAD
      destination:
        server: "{{server}}"
        namespace: platform
      syncPolicy:
        automated:
          prune: true
          selfHeal: true

---
# Deploy monitoring to all clusters
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: monitoring-stack
  namespace: argocd
spec:
  generators:
  - clusters: {}  # All clusters
  
  template:
    metadata:
      name: "monitoring-{{name}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/org/monitoring.git
        path: charts/monitoring
        targetRevision: HEAD
        helm:
          releaseName: monitoring
          valueFiles:
          - values.yaml
          # Cluster-specific values if they exist
          - "values-{{name}}.yaml"
      destination:
        server: "{{server}}"
        namespace: monitoring
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true
```

### Lab 5: Git Generator for Environment Matrix

```yaml
# git-generator-matrix.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-matrix
  namespace: argocd
spec:
  generators:
  # Matrix: clusters × environments
  - matrix:
      generators:
      # Clusters from labels
      - clusters:
          selector:
            matchExpressions:
            - key: type
              operator: In
              values: [production, staging]
      # Environments from Git directories
      - git:
          repoURL: https://github.com/org/apps.git
          revision: HEAD
          directories:
          - path: "apps/*"
  
  template:
    metadata:
      name: "{{path.basename}}-{{name}}"
      labels:
        app: "{{path.basename}}"
        cluster: "{{name}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/org/apps.git
        path: "{{path}}/overlays/{{metadata.labels.type}}"
        targetRevision: HEAD
      destination:
        server: "{{server}}"
        namespace: "{{path.basename}}"
      syncPolicy:
        automated:
          prune: true
          selfHeal: true

---
# Git directory structure:
# apps/
#   frontend/
#     base/
#     overlays/
#       production/
#       staging/
#   backend/
#     base/
#     overlays/
#       production/
#       staging/
```

### Lab 6: Cluster-Specific Secrets

```yaml
# external-secrets.yaml
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: external-secrets
  namespace: argocd
spec:
  generators:
  - clusters: {}
  
  template:
    metadata:
      name: "secrets-{{name}}"
    spec:
      project: default
      source:
        repoURL: https://github.com/org/secrets-config.git
        path: "clusters/{{name}}"
        targetRevision: HEAD
      destination:
        server: "{{server}}"
        namespace: external-secrets

---
# Per-cluster secret store
# clusters/us-east/secret-store.yaml
apiVersion: external-secrets.io/v1beta1
kind: ClusterSecretStore
metadata:
  name: aws-secrets
spec:
  provider:
    aws:
      service: SecretsManager
      region: us-east-1
      auth:
        jwt:
          serviceAccountRef:
            name: external-secrets
            namespace: external-secrets
```

## 📝 Project: Complete Multi-Cluster Platform

```yaml
# platform-appset.yaml
---
# Core platform services deployed to all clusters
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: core-platform
  namespace: argocd
spec:
  generators:
  - clusters:
      selector:
        matchLabels:
          platform: "true"
  
  template:
    metadata:
      name: "core-{{name}}"
      finalizers:
      - resources-finalizer.argocd.argoproj.io
    spec:
      project: platform
      source:
        repoURL: https://github.com/org/platform.git
        path: core
        targetRevision: HEAD
      destination:
        server: "{{server}}"
        namespace: platform
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
        syncOptions:
        - CreateNamespace=true
      ignoreDifferences:
      - group: apps
        kind: Deployment
        jsonPointers:
        - /spec/replicas

---
# App deployments with wave ordering
apiVersion: argoproj.io/v1alpha1
kind: ApplicationSet
metadata:
  name: app-deployments
  namespace: argocd
spec:
  generators:
  - matrix:
      generators:
      - list:
          elements:
          - app: frontend
            wave: "1"
          - app: backend
            wave: "2"
          - app: worker
            wave: "3"
      - clusters:
          selector:
            matchLabels:
              environment: production
  
  template:
    metadata:
      name: "{{app}}-{{name}}"
      annotations:
        argocd.argoproj.io/sync-wave: "{{wave}}"
    spec:
      project: apps
      source:
        repoURL: https://github.com/org/apps.git
        path: "{{app}}"
        targetRevision: HEAD
        kustomize:
          namePrefix: "{{name}}-"
      destination:
        server: "{{server}}"
        namespace: apps
      syncPolicy:
        automated:
          prune: true
          selfHeal: true
```

## ✅ Completion Checklist

- [ ] Install ArgoCD on hub cluster
- [ ] Register external clusters
- [ ] Create multi-cluster ApplicationSet
- [ ] Use cluster generator pattern
- [ ] Implement Git directory generator
- [ ] Configure cluster-specific secrets
- [ ] Deploy complete platform stack
- [ ] Test failover scenarios

## 📚 Resources

- [ArgoCD Multi-Cluster](https://argo-cd.readthedocs.io/en/stable/operator-manual/declarative-setup/#clusters)
- [ApplicationSet Generators](https://argo-cd.readthedocs.io/en/stable/operator-manual/applicationset/)

---

**Next Project:** [Golden Path Templates](../../04-platform-engineering/golden-path-templates/)
