# 🌐 Helm Charts

Package and deploy Kubernetes applications with Helm.

## 🎯 Learning Objectives
- Create Helm charts
- Manage releases
- Use Helm repositories
- Template best practices

---

## Lab 1: Helm Basics

### Installation
```bash
# macOS
brew install helm

# Verify
helm version
```

### Basic Commands
```bash
# Add repository
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

# Search charts
helm search repo nginx
helm search hub wordpress

# Install
helm install my-nginx bitnami/nginx
helm install my-nginx bitnami/nginx -n production --create-namespace

# List releases
helm list
helm list -A  # All namespaces

# Upgrade
helm upgrade my-nginx bitnami/nginx --set replicaCount=3

# Uninstall
helm uninstall my-nginx
```

---

## Lab 2: Create Chart

### Chart Structure
```bash
helm create myapp

myapp/
├── Chart.yaml        # Chart metadata
├── values.yaml       # Default values
├── templates/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── ingress.yaml
│   ├── _helpers.tpl
│   └── NOTES.txt
└── charts/           # Dependencies
```

### Chart.yaml
```yaml
apiVersion: v2
name: myapp
description: My application Helm chart
version: 1.0.0
appVersion: "1.0.0"
dependencies:
  - name: postgresql
    version: "12.x.x"
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
```

### values.yaml
```yaml
replicaCount: 2

image:
  repository: myapp
  tag: "1.0.0"
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  host: myapp.example.com

resources:
  limits:
    cpu: 200m
    memory: 256Mi
  requests:
    cpu: 100m
    memory: 128Mi

postgresql:
  enabled: true
  auth:
    database: myapp
```

---

## Lab 3: Templates

### deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "myapp.fullname" . }}
  labels:
    {{- include "myapp.labels" . | nindent 4 }}
spec:
  replicas: {{ .Values.replicaCount }}
  selector:
    matchLabels:
      {{- include "myapp.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      labels:
        {{- include "myapp.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .Chart.Name }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
          ports:
            - containerPort: 8080
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "myapp.fullname" . }}-secret
                  key: database-url
```

### _helpers.tpl
```yaml
{{- define "myapp.fullname" -}}
{{- printf "%s-%s" .Release.Name .Chart.Name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "myapp.labels" -}}
app.kubernetes.io/name: {{ .Chart.Name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version }}
{{- end }}
```

---

## Lab 4: Advanced Usage

### Install with Values
```bash
# From file
helm install myapp ./myapp -f production-values.yaml

# Override values
helm install myapp ./myapp \
  --set image.tag=2.0.0 \
  --set replicaCount=5

# Template preview
helm template myapp ./myapp -f values.yaml

# Dry run
helm install myapp ./myapp --dry-run --debug
```

### Package & Push
```bash
# Package
helm package ./myapp

# Push to OCI registry
helm push myapp-1.0.0.tgz oci://registry.example.com/charts
```

---

## ✅ Completion Checklist
- [ ] Installed Helm
- [ ] Created custom chart
- [ ] Used templates effectively
- [ ] Managed releases
- [ ] Packaged and distributed chart
