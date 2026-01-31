# 🌐 Kubernetes Networking Deep Dive

Master Kubernetes networking: Services, Ingress, NetworkPolicies, and DNS.

## 🎯 Learning Objectives

- Understand K8s networking model
- Configure different Service types
- Set up Ingress controllers
- Implement NetworkPolicies
- Debug networking issues

## 📋 Prerequisites

- Kubernetes basics (Pods, Deployments)
- kubectl configured
- Local cluster (Kind/Minikube)

## 🏗️ Kubernetes Networking Model

```
┌─────────────────────────────────────────────────────────────────┐
│                 KUBERNETES NETWORKING                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  External Traffic                                                │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    INGRESS CONTROLLER                        ││
│  │     Routes external traffic to Services based on rules      ││
│  └─────────────────────────────┬───────────────────────────────┘│
│                                │                                 │
│       ┌────────────────────────┼────────────────────────┐       │
│       ▼                        ▼                        ▼       │
│  ┌─────────────┐         ┌─────────────┐         ┌─────────────┐│
│  │  Service A  │         │  Service B  │         │  Service C  ││
│  │ ClusterIP   │         │ ClusterIP   │         │ ClusterIP   ││
│  └──────┬──────┘         └──────┬──────┘         └──────┬──────┘│
│         │                       │                       │       │
│    ┌────┴────┐             ┌────┴────┐             ┌────┴────┐  │
│    ▼    ▼    ▼             ▼    ▼    ▼             ▼    ▼    ▼  │
│  ┌───┐┌───┐┌───┐         ┌───┐┌───┐┌───┐         ┌───┐┌───┐    │
│  │Pod││Pod││Pod│         │Pod││Pod││Pod│         │Pod││Pod│    │
│  └───┘└───┘└───┘         └───┘└───┘└───┘         └───┘└───┘    │
│                                                                  │
│  Network Policies control pod-to-pod communication              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Cluster Setup with Ingress

```bash
# Create Kind cluster with Ingress support
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
  - containerPort: 443
    hostPort: 443
    protocol: TCP
EOF

# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/kind/deploy.yaml

# Wait for controller to be ready
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=90s
```

### Lab 2: Service Types

```yaml
# services.yaml
---
# ClusterIP (internal only)
apiVersion: v1
kind: Service
metadata:
  name: backend-clusterip
  namespace: demo
spec:
  type: ClusterIP  # Default type
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080

---
# NodePort (expose on node's IP)
apiVersion: v1
kind: Service
metadata:
  name: backend-nodeport
  namespace: demo
spec:
  type: NodePort
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080
    nodePort: 30080  # 30000-32767

---
# LoadBalancer (cloud provider LB)
apiVersion: v1
kind: Service
metadata:
  name: backend-lb
  namespace: demo
spec:
  type: LoadBalancer
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8080

---
# Headless Service (direct pod DNS)
apiVersion: v1
kind: Service
metadata:
  name: backend-headless
  namespace: demo
spec:
  clusterIP: None  # Headless!
  selector:
    app: backend
  ports:
  - port: 8080
```

Apply and test:
```bash
kubectl create namespace demo
kubectl apply -f services.yaml

# View services
kubectl get svc -n demo

# Test ClusterIP from within cluster
kubectl run test --rm -it --image=alpine -n demo -- wget -qO- backend-clusterip

# Test NodePort
curl http://localhost:30080

# DNS resolution
kubectl run test --rm -it --image=alpine -n demo -- nslookup backend-clusterip
# Returns: backend-clusterip.demo.svc.cluster.local

kubectl run test --rm -it --image=alpine -n demo -- nslookup backend-headless
# Returns individual pod IPs (not ClusterIP)
```

### Lab 3: Ingress Configuration

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  namespace: demo
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  ingressClassName: nginx
  rules:
  # Host-based routing
  - host: api.example.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 80
  
  # Path-based routing
  - host: app.example.local
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: api-service
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 80

---
# TLS Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: tls-ingress
  namespace: demo
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - secure.example.com
    secretName: secure-tls
  rules:
  - host: secure.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: secure-app
            port:
              number: 80
```

Test ingress:
```bash
kubectl apply -f ingress.yaml

# Add to /etc/hosts for local testing
echo "127.0.0.1 api.example.local app.example.local" | sudo tee -a /etc/hosts

# Test routes
curl http://api.example.local/
curl http://app.example.local/
curl http://app.example.local/api/health
```

### Lab 4: Network Policies

```yaml
# network-policies.yaml
---
# Deny all ingress by default
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-ingress
  namespace: demo
spec:
  podSelector: {}  # Apply to all pods
  policyTypes:
  - Ingress

---
# Allow frontend to reach backend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-frontend-to-backend
  namespace: demo
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8080

---
# Allow ingress controller to reach frontend
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-frontend
  namespace: demo
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx
    ports:
    - protocol: TCP
      port: 80

---
# Backend can reach database
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: backend-to-database
  namespace: demo
spec:
  podSelector:
    matchLabels:
      app: database
  policyTypes:
  - Ingress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: backend
    ports:
    - protocol: TCP
      port: 5432

---
# Deny all egress except DNS
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: restrict-egress
  namespace: demo
spec:
  podSelector:
    matchLabels:
      app: backend
  policyTypes:
  - Egress
  egress:
  # Allow DNS
  - to:
    - namespaceSelector: {}
      podSelector:
        matchLabels:
          k8s-app: kube-dns
    ports:
    - protocol: UDP
      port: 53
  # Allow database
  - to:
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432
```

### Lab 5: DNS Debugging

```bash
# Deploy DNS debug pod
kubectl run dnsutils --image=registry.k8s.io/e2e-test-images/jessie-dnsutils:1.3 \
    --restart=Never -n demo -- sleep infinity

# Test DNS resolution
kubectl exec -it dnsutils -n demo -- nslookup kubernetes.default
kubectl exec -it dnsutils -n demo -- nslookup backend-service.demo.svc.cluster.local

# Check CoreDNS
kubectl get pods -n kube-system -l k8s-app=kube-dns
kubectl logs -n kube-system -l k8s-app=kube-dns

# View CoreDNS configmap
kubectl get configmap coredns -n kube-system -o yaml
```

## 📝 Project: Multi-Tier Application with Security

Deploy a complete application with proper networking:

```yaml
# complete-app.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: secure-app
  labels:
    pod-security.kubernetes.io/enforce: restricted

---
# Frontend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: secure-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
        tier: web
    spec:
      containers:
      - name: nginx
        image: nginx:alpine
        ports:
        - containerPort: 80
        securityContext:
          allowPrivilegeEscalation: false
          runAsNonRoot: true
          runAsUser: 101
          capabilities:
            drop:
            - ALL

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: secure-app
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80

---
# Backend API
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: secure-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        tier: backend
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo
        args: ["-text=API Response"]
        ports:
        - containerPort: 5678

---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: secure-app
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 5678

---
# Database (Headless for StatefulSet)
apiVersion: v1
kind: Service
metadata:
  name: database
  namespace: secure-app
spec:
  clusterIP: None
  selector:
    app: database
  ports:
  - port: 5432

---
# Ingress
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  namespace: secure-app
spec:
  ingressClassName: nginx
  rules:
  - host: app.local
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 80
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80

---
# Network Policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: secure-app
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-ingress-to-frontend
  namespace: secure-app
spec:
  podSelector:
    matchLabels:
      app: frontend
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx

---
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: frontend-to-api
  namespace: secure-app
spec:
  podSelector:
    matchLabels:
      app: api
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: ingress-nginx
```

## ✅ Completion Checklist

- [ ] Set up cluster with Ingress controller
- [ ] Create different Service types
- [ ] Configure host and path-based Ingress
- [ ] Implement default deny NetworkPolicy
- [ ] Allow specific pod-to-pod traffic
- [ ] Debug DNS resolution
- [ ] Deploy multi-tier app with security

## 📚 Resources

- [Kubernetes Networking](https://kubernetes.io/docs/concepts/services-networking/)
- [Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/)
- [Ingress Controllers](https://kubernetes.io/docs/concepts/services-networking/ingress-controllers/)

---

**Next Project:** [Argo Workflows Pipeline](../argo-workflows-pipeline/)
