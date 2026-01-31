# 📊 Full Observability Stack

Build a complete observability platform: metrics (Prometheus), logs (Loki), traces (Tempo), and visualization (Grafana).

## 🎯 Learning Objectives

- Deploy Prometheus for metrics collection
- Set up Loki for log aggregation
- Configure Tempo for distributed tracing
- Create Grafana dashboards
- Implement alerting

## 📋 Prerequisites

- Kubernetes cluster
- Helm installed
- Basic monitoring concepts

## 🏗️ Observability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                   OBSERVABILITY STACK                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                      GRAFANA                                 ││
│  │     Unified visualization for metrics, logs, and traces    ││
│  └───────────────────────────┬─────────────────────────────────┘│
│                              │                                   │
│        ┌─────────────────────┼─────────────────────┐            │
│        │                     │                     │            │
│        ▼                     ▼                     ▼            │
│  ┌───────────┐        ┌───────────┐        ┌───────────┐       │
│  │PROMETHEUS │        │   LOKI    │        │   TEMPO   │       │
│  │  Metrics  │        │   Logs    │        │  Traces   │       │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘       │
│        │                    │                    │              │
│        │                    │                    │              │
│  ┌─────┴─────┐        ┌─────┴─────┐        ┌─────┴─────┐       │
│  │  Scrape   │        │  Promtail │        │   OTEL    │       │
│  │ Endpoints │        │  Agents   │        │ Collector │       │
│  └─────┬─────┘        └─────┬─────┘        └─────┬─────┘       │
│        │                    │                    │              │
│        └────────────────────┴────────────────────┘              │
│                             │                                    │
│                    ┌────────┴────────┐                          │
│                    │  Applications   │                          │
│                    │   (Your Apps)   │                          │
│                    └─────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Deploy Prometheus Stack

```bash
# Add Helm repos
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Create namespace
kubectl create namespace monitoring

# Install kube-prometheus-stack (Prometheus, Grafana, AlertManager)
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --set grafana.adminPassword=admin123 \
  --set prometheus.prometheusSpec.retention=7d \
  --set prometheus.prometheusSpec.storageSpec.volumeClaimTemplate.spec.resources.requests.storage=10Gi

# Verify installation
kubectl get pods -n monitoring

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring &
echo "Open http://localhost:3000 (admin/admin123)"

# Access Prometheus
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring &
echo "Open http://localhost:9090"
```

### Lab 2: Deploy Loki for Logs

```bash
# Install Loki stack
helm install loki grafana/loki-stack \
  --namespace monitoring \
  --set promtail.enabled=true \
  --set loki.persistence.enabled=true \
  --set loki.persistence.size=10Gi

# Verify
kubectl get pods -n monitoring -l app=loki
kubectl get pods -n monitoring -l app=promtail
```

Configure Loki in Grafana:
```yaml
# values-loki.yaml
loki:
  persistence:
    enabled: true
    size: 10Gi
  config:
    limits_config:
      retention_period: 168h  # 7 days
    table_manager:
      retention_deletes_enabled: true
      retention_period: 168h

promtail:
  enabled: true
  config:
    lokiAddress: http://loki:3100/loki/api/v1/push
    snippets:
      pipelineStages:
      - cri: {}
      - json:
          expressions:
            level: level
            msg: msg
      - labels:
          level:
```

### Lab 3: Deploy Tempo for Traces

```bash
# Install Tempo
helm install tempo grafana/tempo \
  --namespace monitoring \
  --set tempo.storage.trace.backend=local \
  --set tempo.storage.trace.local.path=/var/tempo/traces \
  --set persistence.enabled=true \
  --set persistence.size=10Gi
```

Tempo configuration:
```yaml
# values-tempo.yaml
tempo:
  receivers:
    otlp:
      protocols:
        grpc:
          endpoint: "0.0.0.0:4317"
        http:
          endpoint: "0.0.0.0:4318"
    jaeger:
      protocols:
        thrift_http:
          endpoint: "0.0.0.0:14268"
  
  storage:
    trace:
      backend: local
      local:
        path: /var/tempo/traces
      wal:
        path: /var/tempo/wal
```

### Lab 4: Configure Grafana Data Sources

```yaml
# grafana-datasources.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-datasources
  namespace: monitoring
  labels:
    grafana_datasource: "1"
data:
  datasources.yaml: |
    apiVersion: 1
    datasources:
    # Prometheus
    - name: Prometheus
      type: prometheus
      url: http://prometheus-kube-prometheus-prometheus:9090
      access: proxy
      isDefault: true
      jsonData:
        timeInterval: "15s"
    
    # Loki
    - name: Loki
      type: loki
      url: http://loki:3100
      access: proxy
      jsonData:
        maxLines: 1000
        derivedFields:
          - datasourceUid: tempo
            matcherRegex: "traceID=(\\w+)"
            name: TraceID
            url: "$${__value.raw}"
    
    # Tempo
    - name: Tempo
      type: tempo
      url: http://tempo:3100
      access: proxy
      jsonData:
        httpMethod: GET
        tracesToLogs:
          datasourceUid: loki
          tags: ['app', 'namespace']
          mappedTags: [{ key: 'service.name', value: 'app' }]
          mapTagNamesEnabled: true
          spanStartTimeShift: '-1h'
          spanEndTimeShift: '1h'
          filterByTraceID: true
          filterBySpanID: false
```

### Lab 5: Sample Application with Full Telemetry

```yaml
# sample-app.yaml
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: demo-app
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: demo-app
  template:
    metadata:
      labels:
        app: demo-app
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: app
        image: grafana/tns-app:latest
        ports:
        - name: http
          containerPort: 8080
        - name: metrics
          containerPort: 8081
        env:
        - name: JAEGER_AGENT_HOST
          value: "tempo.monitoring.svc.cluster.local"
        - name: JAEGER_AGENT_PORT
          value: "6831"
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://tempo.monitoring.svc.cluster.local:4317"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 200m
            memory: 256Mi

---
apiVersion: v1
kind: Service
metadata:
  name: demo-app
  labels:
    app: demo-app
spec:
  selector:
    app: demo-app
  ports:
  - name: http
    port: 80
    targetPort: 8080
  - name: metrics
    port: 8081
    targetPort: 8081

---
# ServiceMonitor for Prometheus
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: demo-app
  namespace: default
  labels:
    release: prometheus
spec:
  selector:
    matchLabels:
      app: demo-app
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

### Lab 6: Alerting Rules

```yaml
# alerting-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: application-alerts
  namespace: monitoring
  labels:
    release: prometheus
spec:
  groups:
  - name: application
    interval: 30s
    rules:
    
    # High error rate
    - alert: HighErrorRate
      expr: |
        (
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / 
          sum(rate(http_requests_total[5m]))
        ) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value | humanizePercentage }} for the last 5 minutes"
    
    # High latency
    - alert: HighLatency
      expr: |
        histogram_quantile(0.99, 
          sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
        ) > 1
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High latency detected"
        description: "P99 latency is {{ $value | humanizeDuration }}"
    
    # Pod not ready
    - alert: PodNotReady
      expr: |
        kube_pod_status_ready{condition="true"} == 0
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "Pod not ready"
        description: "Pod {{ $labels.namespace }}/{{ $labels.pod }} is not ready"

  - name: infrastructure
    rules:
    
    # High CPU usage
    - alert: HighCPUUsage
      expr: |
        (1 - avg(rate(node_cpu_seconds_total{mode="idle"}[5m])) by (instance)) > 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "High CPU usage on {{ $labels.instance }}"
    
    # High memory usage
    - alert: HighMemoryUsage
      expr: |
        (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) > 0.85
      for: 10m
      labels:
        severity: warning
      annotations:
        summary: "High memory usage on {{ $labels.instance }}"
    
    # Disk space low
    - alert: DiskSpaceLow
      expr: |
        (node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"} / node_filesystem_size_bytes) < 0.1
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Disk space low on {{ $labels.instance }}"
```

## 📝 Project: Complete Observability Dashboard

Create comprehensive Grafana dashboard:

```json
{
  "dashboard": {
    "title": "Application Observability",
    "panels": [
      {
        "title": "Request Rate",
        "type": "timeseries",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (service)",
            "legendFormat": "{{service}}"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
          }
        ],
        "options": {
          "colorMode": "background",
          "thresholds": {
            "steps": [
              {"value": 0, "color": "green"},
              {"value": 0.01, "color": "yellow"},
              {"value": 0.05, "color": "red"}
            ]
          }
        }
      },
      {
        "title": "Latency Distribution",
        "type": "heatmap",
        "targets": [
          {
            "expr": "sum(rate(http_request_duration_seconds_bucket[5m])) by (le)"
          }
        ]
      },
      {
        "title": "Recent Logs",
        "type": "logs",
        "datasource": "Loki",
        "targets": [
          {
            "expr": "{app=\"demo-app\"} |= \"error\""
          }
        ]
      },
      {
        "title": "Traces",
        "type": "traces",
        "datasource": "Tempo"
      }
    ]
  }
}
```

## ✅ Completion Checklist

- [ ] Deploy Prometheus stack
- [ ] Configure ServiceMonitors
- [ ] Install Loki and Promtail
- [ ] Set up Tempo for tracing
- [ ] Configure Grafana data sources
- [ ] Create alerting rules
- [ ] Build unified dashboard
- [ ] Test end-to-end observability

## 📚 Resources

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Loki](https://grafana.com/docs/loki/)
- [Grafana Tempo](https://grafana.com/docs/tempo/)
- [kube-prometheus-stack](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack)

---

**Next Project:** [Backstage IDP](../../04-platform-engineering/backstage-idp/)
</Parameter>
<parameter name="Complexity">5
