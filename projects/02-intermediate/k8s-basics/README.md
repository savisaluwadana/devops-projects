# ☸️ Kubernetes Core Concepts

Deploy and manage containerized applications at scale with Kubernetes.

## 🎯 Learning Objectives

- Understand Kubernetes architecture
- Deploy applications with Deployments
- Expose services with Services and Ingress
- Configure apps with ConfigMaps and Secrets
- Manage resource requests and limits

## 📋 Prerequisites

- Docker fundamentals
- kubectl installed
- Local Kubernetes (Kind, Minikube, or Docker Desktop)

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                    │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐                                        │
│  │ Control Plane│                                        │
│  │ ┌─────────┐ │     ┌──────────────────────────────┐  │
│  │ │API Server│◄────►│         Worker Nodes          │  │
│  │ ├─────────┤ │     │ ┌────────┐ ┌────────┐        │  │
│  │ │ etcd    │ │     │ │ Pod    │ │ Pod    │        │  │
│  │ ├─────────┤ │     │ │┌──────┐│ │┌──────┐│        │  │
│  │ │Scheduler│ │     │ ││ App  ││ ││ App  ││        │  │
│  │ ├─────────┤ │     │ │└──────┘│ │└──────┘│        │  │
│  │ │Controller│ │     │ └────────┘ └────────┘        │  │
│  │ └─────────┘ │     └──────────────────────────────┘  │
│  └─────────────┘                                        │
└─────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Create Local Cluster
```bash
# Using Kind
cat <<EOF | kind create cluster --config=-
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
  - containerPort: 443
    hostPort: 443
EOF

# Verify
kubectl cluster-info
kubectl get nodes
```

### Lab 2: First Pod
```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
  labels:
    app: nginx
spec:
  containers:
  - name: nginx
    image: nginx:alpine
    ports:
    - containerPort: 80
    resources:
      requests:
        memory: "64Mi"
        cpu: "100m"
      limits:
        memory: "128Mi"
        cpu: "200m"
```

```bash
kubectl apply -f pod.yaml
kubectl get pods
kubectl describe pod nginx-pod
kubectl logs nginx-pod
kubectl exec -it nginx-pod -- sh
kubectl delete pod nginx-pod
```

### Lab 3: Deployments
```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  labels:
    app: web
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: app
        image: nginx:alpine
        ports:
        - containerPort: 80
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 5
```

```bash
kubectl apply -f deployment.yaml
kubectl get deployments
kubectl get rs
kubectl get pods -l app=web

# Scale
kubectl scale deployment web-app --replicas=5

# Rolling update
kubectl set image deployment/web-app app=nginx:1.25

# Rollback
kubectl rollout undo deployment/web-app
kubectl rollout history deployment/web-app
```

### Lab 4: Services
```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: web-service
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
  type: ClusterIP

---
# NodePort for local access
apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  selector:
    app: web
  ports:
  - port: 80
    targetPort: 80
    nodePort: 30080
  type: NodePort
```

```bash
kubectl apply -f service.yaml
kubectl get svc

# Test connectivity
kubectl run test --rm -it --image=alpine -- wget -qO- web-service
```

### Lab 5: ConfigMaps & Secrets
```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: production
  LOG_LEVEL: info
  config.json: |
    {
      "database": {
        "host": "db.example.com",
        "port": 5432
      }
    }

---
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
stringData:
  DATABASE_PASSWORD: supersecret123
  API_KEY: abc123xyz
```

```yaml
# deployment-with-config.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: configured-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: configured
  template:
    metadata:
      labels:
        app: configured
    spec:
      containers:
      - name: app
        image: busybox
        command: ["sh", "-c", "env && sleep 3600"]
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        volumeMounts:
        - name: config-volume
          mountPath: /etc/config
      volumes:
      - name: config-volume
        configMap:
          name: app-config
```

## 📝 Project: Complete Application Deployment

Deploy a full application stack:

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: myapp

---
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: api
        image: hashicorp/http-echo
        args: ["-text=Hello from Backend API"]
        ports:
        - containerPort: 5678
        resources:
          requests:
            memory: "32Mi"
            cpu: "50m"
          limits:
            memory: "64Mi"
            cpu: "100m"
        livenessProbe:
          httpGet:
            path: /
            port: 5678
          initialDelaySeconds: 3
          periodSeconds: 10

---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: myapp
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 5678

---
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: myapp
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: web
        image: nginx:alpine
        ports:
        - containerPort: 80
        volumeMounts:
        - name: nginx-config
          mountPath: /etc/nginx/conf.d
      volumes:
      - name: nginx-config
        configMap:
          name: nginx-config

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
  namespace: myapp
data:
  default.conf: |
    server {
        listen 80;
        location / {
            root /usr/share/nginx/html;
        }
        location /api/ {
            proxy_pass http://backend/;
        }
    }

---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: myapp
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: NodePort
```

```bash
# Deploy everything
kubectl apply -f .

# Check status
kubectl get all -n myapp

# Port forward to test
kubectl port-forward -n myapp svc/frontend 8080:80

# Clean up
kubectl delete namespace myapp
```

## 🔧 Essential kubectl Commands

```bash
# Get resources
kubectl get pods,svc,deploy -A
kubectl get pods -o wide
kubectl get pods -o yaml

# Describe resources
kubectl describe pod <pod-name>

# Logs
kubectl logs <pod-name> -f
kubectl logs <pod-name> -c <container-name>
kubectl logs -l app=web --all-containers

# Debug
kubectl run debug --rm -it --image=alpine -- sh
kubectl exec -it <pod-name> -- bash
kubectl top pods

# Apply/Delete
kubectl apply -f manifest.yaml
kubectl delete -f manifest.yaml
kubectl delete pod --all -n namespace
```

## ✅ Completion Checklist

- [ ] Create local Kubernetes cluster
- [ ] Deploy Pods
- [ ] Create Deployments with scaling
- [ ] Expose with Services
- [ ] Configure with ConfigMaps
- [ ] Manage Secrets
- [ ] Set resource limits
- [ ] Implement health checks
- [ ] Deploy complete application stack

## 📚 Resources

- [Kubernetes Docs](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Kubernetes Patterns](https://k8spatterns.io/)

---

**Next Project:** [Kubernetes Networking & Ingress](../k8s-networking/)
