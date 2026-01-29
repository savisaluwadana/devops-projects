# 🕸️ Service Mesh with Istio

Implement secure, observable microservices communication.

## 🎯 Learning Objectives

- Understand service mesh concepts
- Deploy and configure Istio
- Implement traffic management
- Enable mTLS between services
- Set up observability

## 📋 Prerequisites

- Kubernetes cluster (8GB+ RAM)
- kubectl configured
- Helm installed

## 🏗️ Service Mesh Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        ISTIO SERVICE MESH                       │
├────────────────────────────────────────────────────────────────┤
│  Control Plane                                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                        │
│  │  Pilot  │  │ Citadel │  │ Galley  │                        │
│  │(config) │  │ (certs) │  │(validate)│                        │
│  └────┬────┘  └────┬────┘  └────┬────┘                        │
│       └────────────┼────────────┘                              │
│                    │                                            │
├────────────────────┼────────────────────────────────────────────┤
│  Data Plane        │                                            │
│  ┌─────────────────┴─────────────────┐                        │
│  │         Pod: Frontend              │                        │
│  │  ┌─────────┐    ┌─────────────┐   │                        │
│  │  │   App   │◄──►│ Envoy Proxy │◄──┼──►                     │
│  │  └─────────┘    └─────────────┘   │                        │
│  └───────────────────────────────────┘                        │
│                         ▲                                       │
│                    mTLS │                                       │
│                         ▼                                       │
│  ┌───────────────────────────────────┐                        │
│  │         Pod: Backend              │                        │
│  │  ┌─────────┐    ┌─────────────┐   │                        │
│  │  │   App   │◄──►│ Envoy Proxy │   │                        │
│  │  └─────────┘    └─────────────┘   │                        │
│  └───────────────────────────────────┘                        │
└────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Istio
```bash
# Download Istio
curl -L https://istio.io/downloadIstio | sh -
cd istio-*
export PATH=$PWD/bin:$PATH

# Install with demo profile
istioctl install --set profile=demo -y

# Enable sidecar injection
kubectl label namespace default istio-injection=enabled

# Verify installation
kubectl get pods -n istio-system
istioctl verify-install
```

### Lab 2: Deploy Sample Application
```yaml
# bookinfo.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: bookinfo
  labels:
    istio-injection: enabled

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: productpage
  namespace: bookinfo
spec:
  replicas: 1
  selector:
    matchLabels:
      app: productpage
  template:
    metadata:
      labels:
        app: productpage
        version: v1
    spec:
      containers:
      - name: productpage
        image: docker.io/istio/examples-bookinfo-productpage-v1:1.17.0
        ports:
        - containerPort: 9080

---
apiVersion: v1
kind: Service
metadata:
  name: productpage
  namespace: bookinfo
spec:
  ports:
  - port: 9080
    name: http
  selector:
    app: productpage
```

### Lab 3: Traffic Management
```yaml
# destination-rule.yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews
  namespace: bookinfo
spec:
  host: reviews
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        h2UpgradePolicy: UPGRADE
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  - name: v3
    labels:
      version: v3

---
# virtual-service.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews
  namespace: bookinfo
spec:
  hosts:
  - reviews
  http:
  # Route based on user header
  - match:
    - headers:
        end-user:
          exact: jason
    route:
    - destination:
        host: reviews
        subset: v3
  # Canary: 90% v1, 10% v2
  - route:
    - destination:
        host: reviews
        subset: v1
      weight: 90
    - destination:
        host: reviews
        subset: v2
      weight: 10
```

### Lab 4: Security (mTLS)
```yaml
# peer-authentication.yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: bookinfo
spec:
  mtls:
    mode: STRICT

---
# authorization-policy.yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: productpage-viewer
  namespace: bookinfo
spec:
  selector:
    matchLabels:
      app: productpage
  action: ALLOW
  rules:
  - from:
    - source:
        namespaces: ["istio-system"]
  - to:
    - operation:
        methods: ["GET"]
        paths: ["/productpage", "/static/*", "/api/v1/*"]
```

### Lab 5: Circuit Breaking
```yaml
# circuit-breaker.yaml
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: reviews
  namespace: bookinfo
spec:
  host: reviews
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 100
        http2MaxRequests: 1000
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 5
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 100

---
# retry.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: reviews
  namespace: bookinfo
spec:
  hosts:
  - reviews
  http:
  - route:
    - destination:
        host: reviews
    timeout: 10s
    retries:
      attempts: 3
      perTryTimeout: 2s
      retryOn: 5xx,reset,connect-failure
```

## 📝 Project: Canary Deployment

```yaml
# Full canary deployment with monitoring
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
  namespace: production
spec:
  hosts:
  - myapp
  http:
  - match:
    - headers:
        x-canary:
          exact: "true"
    route:
    - destination:
        host: myapp
        subset: canary
  - route:
    - destination:
        host: myapp
        subset: stable
      weight: 95
    - destination:
        host: myapp
        subset: canary
      weight: 5

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: myapp
  namespace: production
spec:
  host: myapp
  subsets:
  - name: stable
    labels:
      version: stable
  - name: canary
    labels:
      version: canary
```

## 🔧 Istio Commands

```bash
# Analyze configuration
istioctl analyze

# View proxy config
istioctl proxy-config routes <pod-name>
istioctl proxy-config clusters <pod-name>

# Debug
istioctl proxy-status
kubectl logs -n istio-system -l app=istiod

# Dashboard
istioctl dashboard kiali
istioctl dashboard grafana
istioctl dashboard jaeger
```

## ✅ Completion Checklist

- [ ] Install Istio
- [ ] Enable sidecar injection
- [ ] Deploy sample application
- [ ] Configure traffic routing
- [ ] Enable mTLS
- [ ] Set up authorization policies
- [ ] Implement circuit breaking
- [ ] Create canary deployment

## 📚 Resources

- [Istio Docs](https://istio.io/latest/docs/)
- [Envoy Proxy](https://www.envoyproxy.io/)
- [Kiali Dashboard](https://kiali.io/)

---

**Next Project:** [Vault Secrets Management](../vault-secrets/)
