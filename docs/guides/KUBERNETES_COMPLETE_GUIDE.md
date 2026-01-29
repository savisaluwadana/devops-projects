# ☸️ Complete Kubernetes Guide

A comprehensive guide covering Kubernetes from basics to advanced production patterns.

---

## Table of Contents

1. [Kubernetes Architecture](#1-kubernetes-architecture)
2. [Core Objects](#2-core-objects)
3. [Workloads](#3-workloads)
4. [Services & Networking](#4-services--networking)
5. [Storage](#5-storage)
6. [Configuration](#6-configuration)
7. [Security](#7-security)
8. [Scheduling](#8-scheduling)
9. [Observability](#9-observability)
10. [Production Best Practices](#10-production-best-practices)

---

## 1. Kubernetes Architecture

### Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     KUBERNETES CLUSTER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────── Control Plane ───────────────────────────┐│
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │  API Server  │  │  Scheduler   │  │   etcd       │      ││
│  │  │   (kube-    │  │              │  │  (key-value  │      ││
│  │  │  apiserver)  │  │              │  │   store)     │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│  │  │  Controller  │  │    Cloud     │  │   Admission  │      ││
│  │  │   Manager    │  │  Controller  │  │  Controllers │      ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│  └───────────────────────────────────────────────────────────────┘│
│                              │                                   │
│                              │ API                               │
│                              ▼                                   │
│  ┌────────────────────── Worker Nodes ─────────────────────────┐│
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │  Node 1                                               │  ││
│  │  │  ┌──────────┐  ┌──────────┐  ┌────────────────────┐  │  ││
│  │  │  │ kubelet  │  │kube-proxy│  │ Container Runtime  │  │  ││
│  │  │  └──────────┘  └──────────┘  │   (containerd)     │  │  ││
│  │  │  ┌──────────────────────────┴────────────────────┐│  │  ││
│  │  │  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐         ││  │  ││
│  │  │  │  │ Pod │  │ Pod │  │ Pod │  │ Pod │         ││  │  ││
│  │  │  │  └─────┘  └─────┘  └─────┘  └─────┘         ││  │  ││
│  │  │  └─────────────────────────────────────────────┘│  │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │  Node 2 ...                                           │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  └───────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Installing kubectl

```bash
# macOS
brew install kubectl

# Linux
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# Verify
kubectl version --client

# Enable bash completion
echo 'source <(kubectl completion bash)' >> ~/.bashrc
echo 'alias k=kubectl' >> ~/.bashrc
echo 'complete -o default -F __start_kubectl k' >> ~/.bashrc
```

### Cluster Management

```bash
# Cluster info
kubectl cluster-info
kubectl get nodes
kubectl get nodes -o wide
kubectl describe node node-name

# Context management
kubectl config get-contexts
kubectl config current-context
kubectl config use-context context-name
kubectl config set-context --current --namespace=default

# API resources
kubectl api-resources
kubectl api-versions
kubectl explain pod
kubectl explain pod.spec.containers
```

---

## 2. Core Objects

### Namespaces

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
  labels:
    env: dev
```

```bash
# Namespace commands
kubectl get namespaces
kubectl create namespace myns
kubectl delete namespace myns
kubectl config set-context --current --namespace=myns
```

### Pods

```yaml
# pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
  namespace: default
  labels:
    app: myapp
    tier: frontend
  annotations:
    description: "My application pod"
spec:
  containers:
    - name: app
      image: nginx:1.25
      ports:
        - containerPort: 80
          name: http
      env:
        - name: ENV
          value: "production"
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: secret-key
      resources:
        requests:
          memory: "64Mi"
          cpu: "100m"
        limits:
          memory: "128Mi"
          cpu: "200m"
      livenessProbe:
        httpGet:
          path: /healthz
          port: 80
        initialDelaySeconds: 5
        periodSeconds: 10
      readinessProbe:
        httpGet:
          path: /ready
          port: 80
        initialDelaySeconds: 5
        periodSeconds: 10
      volumeMounts:
        - name: config
          mountPath: /etc/config
          readOnly: true
        - name: data
          mountPath: /data
  
  initContainers:
    - name: init-db
      image: busybox
      command: ['sh', '-c', 'until nc -z db 5432; do sleep 2; done']
  
  volumes:
    - name: config
      configMap:
        name: app-config
    - name: data
      persistentVolumeClaim:
        claimName: app-data-pvc
  
  restartPolicy: Always
  nodeSelector:
    disktype: ssd
  tolerations:
    - key: "node.kubernetes.io/not-ready"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 300
```

```bash
# Pod commands
kubectl get pods
kubectl get pods -o wide
kubectl get pods --all-namespaces
kubectl get pods -l app=myapp
kubectl get pods -w                    # Watch
kubectl describe pod myapp
kubectl logs myapp
kubectl logs myapp -c container-name   # Multi-container
kubectl logs -f myapp                  # Follow
kubectl logs --previous myapp          # Previous container
kubectl exec -it myapp -- /bin/bash
kubectl exec myapp -- ls /app
kubectl port-forward myapp 8080:80
kubectl cp myapp:/path/file ./local
kubectl delete pod myapp
kubectl delete pod myapp --grace-period=0 --force
```

---

## 3. Workloads

### Deployment

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: myapp:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 8080
            initialDelaySeconds: 10
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          volumeMounts:
            - name: config
              mountPath: /etc/config
      volumes:
        - name: config
          configMap:
            name: app-config
```

```bash
# Deployment commands
kubectl get deployments
kubectl describe deployment myapp
kubectl rollout status deployment myapp
kubectl rollout history deployment myapp
kubectl rollout undo deployment myapp
kubectl rollout undo deployment myapp --to-revision=2
kubectl rollout restart deployment myapp
kubectl scale deployment myapp --replicas=5
kubectl set image deployment/myapp app=myapp:v2.0.0
kubectl autoscale deployment myapp --min=3 --max=10 --cpu-percent=80
```

### StatefulSet

```yaml
# statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres
  replicas: 3
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
        - name: postgres
          image: postgres:15
          ports:
            - containerPort: 5432
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgres-secret
                  key: password
            - name: POD_NAME
              valueFrom:
                fieldRef:
                  fieldPath: metadata.name
          volumeMounts:
            - name: data
              mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
    - metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        storageClassName: standard
        resources:
          requests:
            storage: 10Gi
```

### DaemonSet

```yaml
# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: fluentd
  labels:
    app: fluentd
spec:
  selector:
    matchLabels:
      app: fluentd
  template:
    metadata:
      labels:
        app: fluentd
    spec:
      tolerations:
        - key: node-role.kubernetes.io/control-plane
          effect: NoSchedule
      containers:
        - name: fluentd
          image: fluent/fluentd:v1.16
          resources:
            limits:
              memory: 200Mi
            requests:
              cpu: 100m
              memory: 200Mi
          volumeMounts:
            - name: varlog
              mountPath: /var/log
            - name: containers
              mountPath: /var/lib/docker/containers
              readOnly: true
      volumes:
        - name: varlog
          hostPath:
            path: /var/log
        - name: containers
          hostPath:
            path: /var/lib/docker/containers
```

### Job & CronJob

```yaml
# job.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: backup-job
spec:
  completions: 1
  parallelism: 1
  backoffLimit: 3
  activeDeadlineSeconds: 3600
  ttlSecondsAfterFinished: 86400
  template:
    spec:
      containers:
        - name: backup
          image: backup-tool:latest
          command: ["/bin/sh", "-c", "backup.sh"]
          env:
            - name: BACKUP_DEST
              value: "s3://bucket/backups"
      restartPolicy: Never

---
# cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: backup-cronjob
spec:
  schedule: "0 2 * * *"           # Daily at 2 AM
  concurrencyPolicy: Forbid       # Don't run if previous job running
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: backup-tool:latest
              command: ["/bin/sh", "-c", "backup.sh"]
          restartPolicy: Never
```

---

## 4. Services & Networking

### Service Types

```yaml
# ClusterIP (default)
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  type: ClusterIP
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080

---
# NodePort
apiVersion: v1
kind: Service
metadata:
  name: myapp-nodeport
spec:
  type: NodePort
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080        # 30000-32767

---
# LoadBalancer
apiVersion: v1
kind: Service
metadata:
  name: myapp-lb
spec:
  type: LoadBalancer
  selector:
    app: myapp
  ports:
    - port: 80
      targetPort: 8080

---
# Headless Service (for StatefulSet)
apiVersion: v1
kind: Service
metadata:
  name: myapp-headless
spec:
  clusterIP: None
  selector:
    app: myapp
  ports:
    - port: 8080
```

### Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: myapp-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - myapp.example.com
      secretName: myapp-tls
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend
                port:
                  number: 80
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 8080
```

### Network Policies

```yaml
# network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: api-network-policy
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: api
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: production
        - podSelector:
            matchLabels:
              app: frontend
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - podSelector:
            matchLabels:
              app: database
      ports:
        - protocol: TCP
          port: 5432
    - to:
        - namespaceSelector: {}
          podSelector:
            matchLabels:
              k8s-app: kube-dns
      ports:
        - protocol: UDP
          port: 53
```

---

## 5. Storage

### Persistent Volumes

```yaml
# persistent-volume.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: pv-data
spec:
  capacity:
    storage: 100Gi
  accessModes:
    - ReadWriteOnce
  persistentVolumeReclaimPolicy: Retain
  storageClassName: standard
  hostPath:
    path: /data/pv
  # Or cloud provider:
  # awsElasticBlockStore:
  #   volumeID: vol-123456
  #   fsType: ext4

---
# persistent-volume-claim.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: myapp-data
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: standard
  resources:
    requests:
      storage: 10Gi

---
# Using PVC in Pod
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
    - name: app
      image: myapp:latest
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: myapp-data
```

### Storage Classes

```yaml
# storage-class.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
reclaimPolicy: Delete
allowVolumeExpansion: true
volumeBindingMode: WaitForFirstConsumer
```

---

## 6. Configuration

### ConfigMaps

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  # Simple key-value
  database_host: "postgres.db.svc.cluster.local"
  database_port: "5432"
  
  # File content
  app.properties: |
    server.port=8080
    logging.level=INFO
    feature.enabled=true
  
  nginx.conf: |
    server {
      listen 80;
      location / {
        proxy_pass http://backend:8080;
      }
    }
```

```yaml
# Using ConfigMap in Pod
spec:
  containers:
    - name: app
      image: myapp:latest
      # As environment variables
      env:
        - name: DB_HOST
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: database_host
      # All keys as env vars
      envFrom:
        - configMapRef:
            name: app-config
      # As volume
      volumeMounts:
        - name: config
          mountPath: /etc/config
  volumes:
    - name: config
      configMap:
        name: app-config
        items:
          - key: app.properties
            path: app.properties
```

### Secrets

```yaml
# secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
type: Opaque
data:
  # Base64 encoded
  password: cGFzc3dvcmQxMjM=
  api-key: c2VjcmV0LWFwaS1rZXk=
stringData:
  # Plain text (encoded by k8s)
  username: admin

---
# TLS Secret
apiVersion: v1
kind: Secret
metadata:
  name: tls-secret
type: kubernetes.io/tls
data:
  tls.crt: <base64-encoded-cert>
  tls.key: <base64-encoded-key>

---
# Docker registry secret
apiVersion: v1
kind: Secret
metadata:
  name: regcred
type: kubernetes.io/dockerconfigjson
data:
  .dockerconfigjson: <base64-encoded-docker-config>
```

```bash
# Create secrets
kubectl create secret generic app-secrets \
  --from-literal=password=mypassword \
  --from-literal=api-key=myapikey

kubectl create secret docker-registry regcred \
  --docker-server=registry.example.com \
  --docker-username=user \
  --docker-password=pass

kubectl create secret tls tls-secret \
  --cert=tls.crt \
  --key=tls.key
```

---

## 7. Security

### RBAC

```yaml
# service-account.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: app-service-account
  namespace: production

---
# role.yaml (namespace-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: pod-reader
  namespace: production
rules:
  - apiGroups: [""]
    resources: ["pods"]
    verbs: ["get", "list", "watch"]
  - apiGroups: [""]
    resources: ["pods/log"]
    verbs: ["get"]

---
# cluster-role.yaml (cluster-scoped)
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: secret-reader
rules:
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list"]

---
# role-binding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: read-pods
  namespace: production
subjects:
  - kind: ServiceAccount
    name: app-service-account
    namespace: production
  - kind: User
    name: jane
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: Role
  name: pod-reader
  apiGroup: rbac.authorization.k8s.io

---
# cluster-role-binding.yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: read-secrets-global
subjects:
  - kind: Group
    name: developers
    apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: secret-reader
  apiGroup: rbac.authorization.k8s.io
```

### Pod Security

```yaml
# pod-security-context.yaml
apiVersion: v1
kind: Pod
metadata:
  name: secure-pod
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 3000
    fsGroup: 2000
    seccompProfile:
      type: RuntimeDefault
  containers:
    - name: app
      image: myapp:latest
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
      volumeMounts:
        - name: tmp
          mountPath: /tmp
  volumes:
    - name: tmp
      emptyDir: {}
```

---

## 8. Scheduling

### Node Selectors & Affinity

```yaml
# node-affinity.yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  # Simple node selector
  nodeSelector:
    disktype: ssd
    region: us-east-1
  
  # Node affinity (more flexible)
  affinity:
    nodeAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        nodeSelectorTerms:
          - matchExpressions:
              - key: kubernetes.io/os
                operator: In
                values:
                  - linux
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 1
          preference:
            matchExpressions:
              - key: zone
                operator: In
                values:
                  - us-east-1a
    
    # Pod affinity
    podAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              app: cache
          topologyKey: kubernetes.io/hostname
    
    # Pod anti-affinity
    podAntiAffinity:
      preferredDuringSchedulingIgnoredDuringExecution:
        - weight: 100
          podAffinityTerm:
            labelSelector:
              matchLabels:
                app: myapp
            topologyKey: kubernetes.io/hostname
  
  containers:
    - name: app
      image: myapp:latest
```

### Taints & Tolerations

```bash
# Taint node
kubectl taint nodes node1 key=value:NoSchedule
kubectl taint nodes node1 key=value:NoExecute
kubectl taint nodes node1 key=value:PreferNoSchedule

# Remove taint
kubectl taint nodes node1 key=value:NoSchedule-
```

```yaml
# toleration.yaml
spec:
  tolerations:
    - key: "key"
      operator: "Equal"
      value: "value"
      effect: "NoSchedule"
    - key: "key"
      operator: "Exists"
      effect: "NoExecute"
      tolerationSeconds: 3600
```

### Resource Quotas & Limits

```yaml
# resource-quota.yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: production
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    pods: "50"
    services: "10"
    secrets: "20"
    configmaps: "20"
    persistentvolumeclaims: "10"
    requests.storage: "100Gi"

---
# limit-range.yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: default-limits
  namespace: production
spec:
  limits:
    - type: Container
      default:
        cpu: "500m"
        memory: "256Mi"
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      max:
        cpu: "2"
        memory: "2Gi"
      min:
        cpu: "50m"
        memory: "64Mi"
```

### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: myapp-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  minReplicas: 3
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
```

---

## 9. Observability

### Logging

```bash
# Pod logs
kubectl logs myapp
kubectl logs myapp -c container-name
kubectl logs -f myapp                  # Follow
kubectl logs --previous myapp          # Previous container
kubectl logs -l app=myapp              # By label
kubectl logs --since=1h myapp
kubectl logs --tail=100 myapp

# Node logs
kubectl logs -n kube-system kube-proxy-xxxxx
```

### Metrics

```bash
# Metrics Server
kubectl top nodes
kubectl top pods
kubectl top pods --containers

# Resource usage
kubectl describe node | grep -A5 "Allocated resources"
```

### Debugging

```bash
# Debug pods
kubectl describe pod myapp
kubectl get events --sort-by='.lastTimestamp'
kubectl get events --field-selector type=Warning

# Debug containers
kubectl exec -it myapp -- /bin/sh
kubectl exec myapp -- cat /etc/config/app.properties

# Debug crashed pods
kubectl logs myapp --previous
kubectl describe pod myapp | grep -A10 "State"

# Ephemeral debug containers
kubectl debug myapp -it --image=busybox

# Debug nodes
kubectl debug node/mynode -it --image=busybox

# Port forwarding
kubectl port-forward pod/myapp 8080:80
kubectl port-forward svc/myapp 8080:80
```

---

## 10. Production Best Practices

### High Availability Deployment

```yaml
# Production-ready deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      # Anti-affinity for HA
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchLabels:
                    app: myapp
                topologyKey: kubernetes.io/hostname
      
      # Topology spread for zone distribution
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: ScheduleAnyway
          labelSelector:
            matchLabels:
              app: myapp
      
      containers:
        - name: app
          image: myapp:v1.0.0
          ports:
            - containerPort: 8080
          
          # Resource management
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          
          # Health checks
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          
          startupProbe:
            httpGet:
              path: /healthz
              port: 8080
            failureThreshold: 30
            periodSeconds: 10
          
          # Security context
          securityContext:
            runAsNonRoot: true
            runAsUser: 1000
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop:
                - ALL
          
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      
      volumes:
        - name: tmp
          emptyDir: {}
      
      # Graceful shutdown
      terminationGracePeriodSeconds: 30

---
# Pod Disruption Budget
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: myapp-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: myapp
```

### Quick Reference

```bash
# === CLUSTER INFO ===
kubectl cluster-info
kubectl get nodes -o wide
kubectl api-resources

# === WORKLOADS ===
kubectl get pods,deployments,services
kubectl describe pod myapp
kubectl logs -f myapp
kubectl exec -it myapp -- /bin/bash

# === DEPLOYMENTS ===
kubectl rollout status deployment myapp
kubectl rollout history deployment myapp
kubectl rollout undo deployment myapp
kubectl scale deployment myapp --replicas=5

# === CONFIG ===
kubectl create configmap myconfig --from-file=config/
kubectl create secret generic mysecret --from-literal=key=value

# === DEBUG ===
kubectl get events --sort-by='.lastTimestamp'
kubectl top pods
kubectl describe node
kubectl debug pod/myapp -it --image=busybox

# === CLEANUP ===
kubectl delete pod myapp
kubectl delete -f manifest.yaml
kubectl delete pods --all -n namespace
```

---

*This guide covers Kubernetes comprehensively. Continue to the Terraform guide for Infrastructure as Code.*
