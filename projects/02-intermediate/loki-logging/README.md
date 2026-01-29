# 📊 Grafana Loki Logging

Implement log aggregation with Grafana Loki.

## 🎯 Learning Objectives
- Deploy Loki stack
- Configure Promtail
- Query logs with LogQL
- Create log dashboards

---

## Lab 1: Setup

### Docker Compose
```yaml
version: "3.8"
services:
  loki:
    image: grafana/loki:2.9.0
    ports:
      - "3100:3100"
    volumes:
      - ./loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml

  promtail:
    image: grafana/promtail:2.9.0
    volumes:
      - /var/log:/var/log:ro
      - ./promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_AUTH_ANONYMOUS_ENABLED=true
```

### Loki Config
```yaml
# loki-config.yml
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
  filesystem:
    directory: /loki/chunks
```

---

## Lab 2: Promtail

```yaml
# promtail-config.yml
server:
  http_listen_port: 9080

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*.log

  - job_name: docker
    docker_sd_configs:
      - host: unix:///var/run/docker.sock
    relabel_configs:
      - source_labels: [__meta_docker_container_name]
        target_label: container
```

---

## Lab 3: LogQL Queries

```logql
# Basic queries
{job="varlogs"}
{container="nginx"} |= "error"
{app="myapp"} |~ "ERROR|WARN"

# JSON parsing
{app="api"} | json | level="error"
{app="api"} | json | status >= 400

# Line formatting
{app="api"} | json | line_format "{{.method}} {{.path}} {{.status}}"

# Metrics from logs
rate({app="api"} |= "error" [5m])
sum by (status) (count_over_time({app="api"} | json [1h]))
```

---

## Lab 4: Kubernetes

```yaml
# Helm installation
helm repo add grafana https://grafana.github.io/helm-charts
helm install loki grafana/loki-stack \
  --set grafana.enabled=true \
  --set promtail.enabled=true
```

---

## ✅ Completion Checklist
- [ ] Deployed Loki stack
- [ ] Configured Promtail
- [ ] Queried with LogQL
- [ ] Created Grafana dashboards
