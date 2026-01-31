# 💰 Cloud Cost Optimization (FinOps)

Implement FinOps practices for Kubernetes and cloud cost management.

## 🎯 Learning Objectives

- Understand FinOps principles
- Implement Kubernetes cost visibility
- Right-size workloads
- Set up budgets and alerts
- Optimize resource usage

## 📋 Prerequisites

- Kubernetes cluster
- kubectl access
- Cloud provider account (optional)

## 🏗️ FinOps Framework

```
┌─────────────────────────────────────────────────────────────────┐
│                     FINOPS FRAMEWORK                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   INFORM    │───▶│  OPTIMIZE   │───▶│   OPERATE   │         │
│  │             │    │             │    │             │         │
│  │ Visibility  │    │ Right-size  │    │ Governance  │         │
│  │ Allocation  │    │ Savings     │    │ Automation  │         │
│  │ Benchmarks  │    │ Scheduling  │    │ Policies    │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                  │
│  Key Metrics:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  CPU Utilization    Memory Utilization    Cost/Pod          ││
│  │  Reserved vs Used   Idle Resources        Cost/Namespace    ││
│  │  Cloud Spend        Savings Potential     Cost/Team         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Kubecost

```bash
# Add Kubecost Helm repo
helm repo add kubecost https://kubecost.github.io/cost-analyzer/
helm repo update

# Install Kubecost
helm install kubecost kubecost/cost-analyzer \
  --namespace kubecost \
  --create-namespace \
  --set kubecostToken="your-token" # Get free at kubecost.com

# Wait for ready
kubectl wait --for=condition=available deployment/kubecost-cost-analyzer -n kubecost --timeout=300s

# Access UI
kubectl port-forward -n kubecost svc/kubecost-cost-analyzer 9090:9090 &
echo "Open http://localhost:9090"
```

### Lab 2: Resource Requests Analysis Script

```bash
#!/bin/bash
# analyze-resources.sh - Analyze resource usage vs requests

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           KUBERNETES RESOURCE ANALYSIS                        ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Get all pods with resource info
echo "📊 Resource Requests vs Limits per Namespace:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

kubectl get pods --all-namespaces -o json | jq -r '
  .items[] | 
  select(.status.phase == "Running") |
  {
    namespace: .metadata.namespace,
    pod: .metadata.name,
    containers: [.spec.containers[] | {
      name: .name,
      cpu_request: .resources.requests.cpu // "not set",
      cpu_limit: .resources.limits.cpu // "not set",
      mem_request: .resources.requests.memory // "not set",
      mem_limit: .resources.limits.memory // "not set"
    }]
  }
' | head -100

echo ""
echo "📈 Pods WITHOUT Resource Requests (PROBLEM):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

kubectl get pods --all-namespaces -o json | jq -r '
  .items[] | 
  select(.status.phase == "Running") |
  select(.spec.containers[].resources.requests == null) |
  "\(.metadata.namespace)/\(.metadata.name)"
'

echo ""
echo "💡 Recommendations:"
echo "━━━━━━━━━━━━━━━━━━━━"
echo "1. Set resource requests for all pods"
echo "2. Use VPA recommendations for right-sizing"
echo "3. Review pods with high request vs actual usage gap"
```

### Lab 3: Install Vertical Pod Autoscaler

```bash
# Clone VPA repo
git clone https://github.com/kubernetes/autoscaler.git
cd autoscaler/vertical-pod-autoscaler/

# Install VPA
./hack/vpa-up.sh

# Verify
kubectl get pods -n kube-system | grep vpa

# Create VPA for a deployment
cat <<EOF | kubectl apply -f -
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: myapp-vpa
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  updatePolicy:
    updateMode: "Off"  # Just recommend, don't auto-update
  resourcePolicy:
    containerPolicies:
    - containerName: "*"
      minAllowed:
        cpu: 50m
        memory: 64Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
EOF

# View recommendations
kubectl get vpa myapp-vpa -o yaml
```

### Lab 4: Resource Quota and LimitRange

```yaml
# namespace-limits.yaml
---
apiVersion: v1
kind: Namespace
metadata:
  name: dev-team-a
  labels:
    team: team-a
    environment: development

---
# Quota: Maximum resources for the namespace
apiVersion: v1
kind: ResourceQuota
metadata:
  name: team-quota
  namespace: dev-team-a
spec:
  hard:
    requests.cpu: "10"
    requests.memory: 20Gi
    limits.cpu: "20"
    limits.memory: 40Gi
    pods: "50"
    persistentvolumeclaims: "10"
    services.loadbalancers: "2"

---
# LimitRange: Defaults and constraints per pod
apiVersion: v1
kind: LimitRange
metadata:
  name: team-limits
  namespace: dev-team-a
spec:
  limits:
  # Default limits if not specified
  - default:
      cpu: "500m"
      memory: "512Mi"
    defaultRequest:
      cpu: "100m"
      memory: "128Mi"
    max:
      cpu: "2"
      memory: "4Gi"
    min:
      cpu: "50m"
      memory: "64Mi"
    type: Container
  
  # PVC limits
  - max:
      storage: "50Gi"
    min:
      storage: "1Gi"
    type: PersistentVolumeClaim
```

### Lab 5: Cost Allocation Labels

```yaml
# Standardized labels for cost allocation
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  labels:
    # Business context
    app.kubernetes.io/name: user-service
    app.kubernetes.io/component: backend
    app.kubernetes.io/part-of: ecommerce
    
    # Cost allocation
    cost-center: "CC-12345"
    team: backend-team
    environment: production
    product: ecommerce-platform
    
    # Ownership
    owner: backend-team@company.com
    
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        cost-center: "CC-12345"
        team: backend-team
        environment: production
    spec:
      containers:
      - name: api
        image: user-service:v1
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

### Lab 6: Prometheus Cost Metrics

```yaml
# prometheus-cost-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: cost-metrics
  namespace: monitoring
spec:
  groups:
  - name: cost
    interval: 1h
    rules:
    # CPU cost per namespace
    - record: namespace:container_cpu_usage_cost:sum
      expr: |
        sum by (namespace) (
          container_cpu_usage_seconds_total{container!=""}
        ) * 0.031611  # $0.031611 per CPU hour

    # Memory cost per namespace  
    - record: namespace:container_memory_usage_cost:sum
      expr: |
        sum by (namespace) (
          container_memory_usage_bytes{container!=""}
        ) / 1024 / 1024 / 1024 * 0.004237  # $0.004237 per GB hour

    # Resource efficiency
    - record: namespace:cpu_efficiency:ratio
      expr: |
        sum by (namespace) (rate(container_cpu_usage_seconds_total[1h]))
        /
        sum by (namespace) (kube_pod_container_resource_requests{resource="cpu"})

    - record: namespace:memory_efficiency:ratio
      expr: |
        sum by (namespace) (container_memory_usage_bytes)
        /
        sum by (namespace) (kube_pod_container_resource_requests{resource="memory"})

  - name: cost-alerts
    rules:
    # Alert on low resource efficiency
    - alert: LowCPUEfficiency
      expr: namespace:cpu_efficiency:ratio < 0.2
      for: 24h
      labels:
        severity: warning
      annotations:
        summary: "Low CPU efficiency in {{ $labels.namespace }}"
        description: "CPU utilization is only {{ $value | humanizePercentage }} of requested"

    - alert: OverProvisionedNamespace
      expr: |
        (sum by (namespace) (kube_pod_container_resource_requests{resource="memory"}) 
        - 
        sum by (namespace) (container_memory_usage_bytes)) / 1024 / 1024 / 1024 > 10
      for: 7d
      labels:
        severity: info
      annotations:
        summary: "{{ $labels.namespace }} has {{ $value }}GB unused memory"
```

## 📝 Project: Cost Dashboard

Create a comprehensive Grafana dashboard:

```json
{
  "dashboard": {
    "title": "Kubernetes Cost Dashboard",
    "panels": [
      {
        "title": "Total Monthly Cost Estimate",
        "type": "stat",
        "targets": [{
          "expr": "sum(namespace:container_cpu_usage_cost:sum) + sum(namespace:container_memory_usage_cost:sum)"
        }],
        "unit": "currencyUSD"
      },
      {
        "title": "Cost by Namespace",
        "type": "piechart",
        "targets": [{
          "expr": "sum by (namespace) (namespace:container_cpu_usage_cost:sum + namespace:container_memory_usage_cost:sum)",
          "legendFormat": "{{namespace}}"
        }]
      },
      {
        "title": "Resource Efficiency",
        "type": "gauge",
        "targets": [{
          "expr": "avg(namespace:cpu_efficiency:ratio)"
        }],
        "options": {
          "thresholds": [
            {"value": 0, "color": "red"},
            {"value": 0.3, "color": "yellow"},
            {"value": 0.6, "color": "green"}
          ]
        }
      },
      {
        "title": "Wasted Resources (Unused CPU)",
        "type": "timeseries",
        "targets": [{
          "expr": "sum by (namespace) (kube_pod_container_resource_requests{resource=\"cpu\"} - on(pod) rate(container_cpu_usage_seconds_total[1h]))",
          "legendFormat": "{{namespace}}"
        }]
      },
      {
        "title": "Cost Trend (7 days)",
        "type": "timeseries",
        "targets": [{
          "expr": "sum(namespace:container_cpu_usage_cost:sum + namespace:container_memory_usage_cost:sum)"
        }],
        "options": {
          "timeRange": "7d"
        }
      }
    ]
  }
}
```

## 🔧 Quick Wins

| Action | Potential Savings |
|--------|------------------|
| Right-size pods based on VPA | 20-40% |
| Scale down non-prod at night | 30-50% |
| Use spot/preemptible nodes | 60-80% |
| Remove unused PVCs | Varies |
| Consolidate idle namespaces | 10-30% |

## ✅ Completion Checklist

- [ ] Install Kubecost for visibility
- [ ] Create resource analysis script
- [ ] Install VPA for recommendations
- [ ] Set up ResourceQuotas per namespace
- [ ] Implement cost allocation labels
- [ ] Create Prometheus cost metrics
- [ ] Build cost dashboard in Grafana
- [ ] Set up cost alerts

## 📚 Resources

- [Kubecost](https://www.kubecost.com/)
- [FinOps Foundation](https://www.finops.org/)
- [Kubernetes VPA](https://github.com/kubernetes/autoscaler/tree/master/vertical-pod-autoscaler)

---

**Next Project:** [Chaos Engineering](../chaos-engineering/)
