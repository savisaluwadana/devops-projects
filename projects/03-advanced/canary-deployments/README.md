# 🚀 Canary Deployments with Argo Rollouts

Implement progressive delivery patterns: Canary, Blue-Green, and A/B testing with Argo Rollouts.

## 🎯 Learning Objectives

- Understand progressive delivery patterns
- Implement canary deployments
- Configure blue-green deployments
- Set up automated analysis
- Integrate with Prometheus metrics

## 📋 Prerequisites

- Kubernetes cluster
- kubectl configured
- Basic Ingress knowledge
- Prometheus (optional, for analysis)

## 🏗️ Progressive Delivery Patterns

```
┌─────────────────────────────────────────────────────────────────┐
│              PROGRESSIVE DELIVERY STRATEGIES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CANARY DEPLOYMENT                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  Traffic: 100%          90%   →   75%   →   50%   →   0%    ││
│  │            ▼             ▼         ▼         ▼         ▼    ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   ││
│  │  │   Stable     │  │   Stable     │  │     NEW          │   ││
│  │  │   (v1)       │  │   (v1)       │  │     (v2)         │   ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘   ││
│  │                    Traffic: 10%  →   25%  →   50%  →  100%  ││
│  │  Gradual traffic shift with monitoring                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  BLUE-GREEN DEPLOYMENT                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  ┌──────────────┐          ┌──────────────┐                 ││
│  │  │    BLUE      │  switch  │    GREEN     │                 ││
│  │  │    (v1)      │ ───────▶ │    (v2)      │                 ││
│  │  │   Active     │          │   Preview    │                 ││
│  │  └──────────────┘          └──────────────┘                 ││
│  │  Instant cutover, easy rollback                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Argo Rollouts

```bash
# Create namespace
kubectl create namespace argo-rollouts

# Install Argo Rollouts
kubectl apply -n argo-rollouts -f https://github.com/argoproj/argo-rollouts/releases/latest/download/install.yaml

# Install kubectl plugin
brew install argoproj/tap/kubectl-argo-rollouts
# or
curl -LO https://github.com/argoproj/argo-rollouts/releases/latest/download/kubectl-argo-rollouts-darwin-amd64
chmod +x kubectl-argo-rollouts-darwin-amd64
sudo mv kubectl-argo-rollouts-darwin-amd64 /usr/local/bin/kubectl-argo-rollouts

# Verify
kubectl argo rollouts version

# Open dashboard
kubectl argo rollouts dashboard &
# Open http://localhost:3100
```

### Lab 2: Basic Canary Rollout

```yaml
# canary-rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: canary-demo
  namespace: default
spec:
  replicas: 5
  selector:
    matchLabels:
      app: canary-demo
  template:
    metadata:
      labels:
        app: canary-demo
    spec:
      containers:
      - name: app
        image: argoproj/rollouts-demo:blue
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
  
  strategy:
    canary:
      steps:
      # Step 1: 20% traffic to canary
      - setWeight: 20
      - pause: {duration: 30s}
      
      # Step 2: 40% traffic
      - setWeight: 40
      - pause: {duration: 30s}
      
      # Step 3: 60% traffic
      - setWeight: 60
      - pause: {duration: 30s}
      
      # Step 4: 80% traffic
      - setWeight: 80
      - pause: {duration: 30s}
      
      # Final: 100% (implicit)

---
apiVersion: v1
kind: Service
metadata:
  name: canary-demo
spec:
  selector:
    app: canary-demo
  ports:
  - port: 80
    targetPort: 8080
```

Deploy and trigger rollout:
```bash
# Apply rollout
kubectl apply -f canary-rollout.yaml

# Watch status
kubectl argo rollouts get rollout canary-demo --watch

# Trigger update (change image)
kubectl argo rollouts set image canary-demo app=argoproj/rollouts-demo:green

# Promote to next step manually
kubectl argo rollouts promote canary-demo

# Abort rollout if issues
kubectl argo rollouts abort canary-demo

# Rollback
kubectl argo rollouts undo canary-demo
```

### Lab 3: Blue-Green Deployment

```yaml
# blue-green-rollout.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: blue-green-demo
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blue-green-demo
  template:
    metadata:
      labels:
        app: blue-green-demo
    spec:
      containers:
      - name: app
        image: argoproj/rollouts-demo:blue
        ports:
        - containerPort: 8080
  
  strategy:
    blueGreen:
      # Reference to active service
      activeService: blue-green-active
      # Reference to preview service
      previewService: blue-green-preview
      # Auto-promote after preview (optional)
      autoPromotionEnabled: false
      # Scale down delay after switch
      scaleDownDelaySeconds: 30
      # Pre-promotion analysis (optional)
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: blue-green-preview

---
# Active Service (production traffic)
apiVersion: v1
kind: Service
metadata:
  name: blue-green-active
spec:
  selector:
    app: blue-green-demo
  ports:
  - port: 80
    targetPort: 8080

---
# Preview Service (testing new version)
apiVersion: v1
kind: Service
metadata:
  name: blue-green-preview
spec:
  selector:
    app: blue-green-demo
  ports:
  - port: 80
    targetPort: 8080
```

Test blue-green:
```bash
kubectl apply -f blue-green-rollout.yaml

# Update image
kubectl argo rollouts set image blue-green-demo app=argoproj/rollouts-demo:green

# Preview is now running new version
kubectl argo rollouts get rollout blue-green-demo

# Promote when ready
kubectl argo rollouts promote blue-green-demo
```

### Lab 4: Canary with Traffic Splitting (Nginx)

```yaml
# canary-with-ingress.yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: canary-nginx
spec:
  replicas: 4
  selector:
    matchLabels:
      app: canary-nginx
  template:
    metadata:
      labels:
        app: canary-nginx
    spec:
      containers:
      - name: app
        image: argoproj/rollouts-demo:blue
        ports:
        - containerPort: 8080
  
  strategy:
    canary:
      # Stable service receives most traffic
      stableService: canary-stable
      # Canary service receives canary traffic
      canaryService: canary-canary
      
      trafficRouting:
        nginx:
          stableIngress: canary-ingress
          annotationPrefix: nginx.ingress.kubernetes.io
      
      steps:
      - setWeight: 10
      - pause: {duration: 1m}
      - setWeight: 25
      - pause: {duration: 1m}
      - setWeight: 50
      - pause: {duration: 2m}
      - setWeight: 75
      - pause: {duration: 2m}

---
apiVersion: v1
kind: Service
metadata:
  name: canary-stable
spec:
  selector:
    app: canary-nginx
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: v1
kind: Service
metadata:
  name: canary-canary
spec:
  selector:
    app: canary-nginx
  ports:
  - port: 80
    targetPort: 8080

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: canary-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  ingressClassName: nginx
  rules:
  - host: canary.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: canary-stable
            port:
              number: 80
```

### Lab 5: Automated Analysis

```yaml
# analysis-templates.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
  - name: service-name
  metrics:
  - name: success-rate
    # Run every 30 seconds for 5 minutes
    interval: 30s
    count: 10
    successCondition: result[0] >= 0.95
    failureLimit: 3
    provider:
      prometheus:
        address: http://prometheus:9090
        query: |
          sum(irate(
            http_requests_total{service="{{args.service-name}}",status=~"2.*"}[1m]
          )) / 
          sum(irate(
            http_requests_total{service="{{args.service-name}}"}[1m]
          ))

---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: latency-check
spec:
  args:
  - name: service-name
  metrics:
  - name: p99-latency
    interval: 1m
    count: 5
    successCondition: result[0] < 500  # 500ms
    provider:
      prometheus:
        address: http://prometheus:9090
        query: |
          histogram_quantile(0.99, 
            sum(rate(http_request_duration_seconds_bucket{service="{{args.service-name}}"}[5m])) 
            by (le)
          ) * 1000

---
# Rollout with Analysis
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: analyzed-canary
spec:
  replicas: 5
  selector:
    matchLabels:
      app: analyzed-canary
  template:
    metadata:
      labels:
        app: analyzed-canary
    spec:
      containers:
      - name: app
        image: myapp:v1
        ports:
        - containerPort: 8080
  
  strategy:
    canary:
      steps:
      - setWeight: 20
      - pause: {duration: 1m}
      
      # Run analysis
      - analysis:
          templates:
          - templateName: success-rate
          - templateName: latency-check
          args:
          - name: service-name
            value: analyzed-canary
      
      - setWeight: 50
      - pause: {duration: 2m}
      
      - analysis:
          templates:
          - templateName: success-rate
          args:
          - name: service-name
            value: analyzed-canary
      
      - setWeight: 100
```

## 📝 Project: Production-Ready Progressive Delivery

Complete setup with all components:

```yaml
# complete-rollout.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: production-app
  namespace: production
spec:
  replicas: 10
  revisionHistoryLimit: 3
  selector:
    matchLabels:
      app: production-app
  template:
    metadata:
      labels:
        app: production-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
    spec:
      containers:
      - name: app
        image: myapp:v1.0.0
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: "100m"
            memory: "128Mi"
          limits:
            cpu: "500m"
            memory: "512Mi"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
  
  strategy:
    canary:
      stableService: app-stable
      canaryService: app-canary
      
      trafficRouting:
        nginx:
          stableIngress: app-ingress
      
      # Anti-affinity to spread pods
      antiAffinity:
        preferredDuringSchedulingIgnoredDuringExecution:
          weight: 100
      
      steps:
      # Start with 5% to catch major issues
      - setWeight: 5
      - pause: {duration: 2m}
      
      # Automated analysis gate
      - analysis:
          templates:
          - templateName: success-rate
          - templateName: error-rate
          - templateName: latency-p99
      
      # If analysis passes, increase to 25%
      - setWeight: 25
      - pause: {duration: 5m}
      
      # Another analysis checkpoint
      - analysis:
          templates:
          - templateName: success-rate
      
      # Gradual increase
      - setWeight: 50
      - pause: {duration: 5m}
      
      - setWeight: 75
      - pause: {duration: 5m}
      
      # Final: full rollout
```

## ✅ Completion Checklist

- [ ] Install Argo Rollouts
- [ ] Create basic canary rollout
- [ ] Implement blue-green deployment
- [ ] Configure traffic splitting
- [ ] Set up analysis templates
- [ ] Integrate with Prometheus
- [ ] Test rollback scenarios
- [ ] Deploy production-ready setup

## 📚 Resources

- [Argo Rollouts Docs](https://argoproj.github.io/argo-rollouts/)
- [Analysis Templates](https://argoproj.github.io/argo-rollouts/features/analysis/)
- [Traffic Management](https://argoproj.github.io/argo-rollouts/features/traffic-management/)

---

**Next Project:** [Observability Stack](../observability-stack/)
