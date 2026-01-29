# 💥 Chaos Engineering

Test system resilience through controlled failure injection.

## 🎯 Learning Objectives

- Understand chaos engineering principles
- Deploy Litmus Chaos
- Create chaos experiments
- Monitor chaos impact
- Build resilient systems

## 📋 Prerequisites

- Kubernetes cluster
- Prometheus monitoring
- Application to test
- kubectl configured

## 🏗️ Chaos Engineering Process

```
┌─────────────────────────────────────────────────────────────────┐
│                    CHAOS ENGINEERING CYCLE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     ┌───────────┐                         ┌───────────┐         │
│     │  Steady   │                         │  Improve  │         │
│     │  State    │◄────────────────────────│  System   │         │
│     └─────┬─────┘                         └─────▲─────┘         │
│           │                                     │               │
│           ▼                                     │               │
│     ┌───────────┐                         ┌─────┴─────┐         │
│     │ Hypothesis│                         │  Analyze  │         │
│     │           │                         │  Results  │         │
│     └─────┬─────┘                         └─────▲─────┘         │
│           │                                     │               │
│           ▼                                     │               │
│     ┌───────────┐      ┌───────────┐     ┌─────┴─────┐         │
│     │  Design   │─────▶│   Run     │────▶│  Observe  │         │
│     │Experiment │      │Experiment │     │  Impact   │         │
│     └───────────┘      └───────────┘     └───────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Litmus
```bash
# Add Litmus Helm repo
helm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/
helm repo update

# Install Litmus
kubectl create namespace litmus
helm install chaos litmuschaos/litmus \
  --namespace=litmus \
  --set portal.frontend.service.type=NodePort

# Get portal URL
kubectl get svc -n litmus chaos-litmus-frontend-service

# ChaosHub for experiments
kubectl apply -f https://hub.litmuschaos.io/api/chaos/3.0.0?file=charts/generic/experiments.yaml
```

### Lab 2: Pod Delete Experiment
```yaml
# pod-delete-experiment.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: nginx-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=nginx'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-delete
      spec:
        components:
          env:
            # Kill 1 pod
            - name: TOTAL_CHAOS_DURATION
              value: '30'
            - name: CHAOS_INTERVAL
              value: '10'
            - name: FORCE
              value: 'false'
            - name: PODS_AFFECTED_PERC
              value: '50'
```

```bash
# Apply experiment
kubectl apply -f pod-delete-experiment.yaml

# Watch experiment
kubectl get chaosengine nginx-chaos -w
kubectl get pods -l app=nginx -w

# Check results
kubectl get chaosresult nginx-chaos-pod-delete -o yaml
```

### Lab 3: Network Chaos
```yaml
# network-loss.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: network-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=frontend'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-network-loss
      spec:
        components:
          env:
            - name: NETWORK_INTERFACE
              value: 'eth0'
            - name: NETWORK_PACKET_LOSS_PERCENTAGE
              value: '50'
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: CONTAINER_RUNTIME
              value: 'containerd'

---
# network-latency.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: latency-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=api'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-network-latency
      spec:
        components:
          env:
            - name: NETWORK_LATENCY
              value: '2000'  # 2 seconds
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: JITTER
              value: '500'
```

### Lab 4: CPU & Memory Stress
```yaml
# cpu-hog.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: cpu-stress
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=worker'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-cpu-hog
      spec:
        components:
          env:
            - name: CPU_CORES
              value: '1'
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: CPU_LOAD
              value: '100'

---
# memory-hog.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: memory-stress
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=worker'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: pod-memory-hog
      spec:
        components:
          env:
            - name: MEMORY_CONSUMPTION
              value: '500'  # MB
            - name: TOTAL_CHAOS_DURATION
              value: '60'
```

### Lab 5: Node Failure
```yaml
# node-drain.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: node-chaos
  namespace: default
spec:
  appinfo:
    appns: 'default'
    applabel: 'app=critical-service'
    appkind: 'deployment'
  chaosServiceAccount: litmus-admin
  experiments:
    - name: node-drain
      spec:
        components:
          env:
            - name: TOTAL_CHAOS_DURATION
              value: '60'
            - name: APP_NODE
              value: 'worker-node-1'

---
# node-taint.yaml
apiVersion: litmuschaos.io/v1alpha1
kind: ChaosEngine
metadata:
  name: node-taint
  namespace: default
spec:
  chaosServiceAccount: litmus-admin
  experiments:
    - name: node-taint
      spec:
        components:
          env:
            - name: NODE_LABEL
              value: 'kubernetes.io/hostname=worker-1'
            - name: TAINTS
              value: 'chaos=true:NoSchedule'
            - name: TOTAL_CHAOS_DURATION
              value: '60'
```

## 📝 Project: Complete Chaos Workflow

```yaml
# chaos-workflow.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: chaos-workflow
  namespace: litmus
spec:
  entrypoint: chaos-test
  serviceAccountName: argo-chaos
  templates:
    - name: chaos-test
      steps:
        - - name: steady-state-check
            template: http-probe
        - - name: inject-pod-delete
            template: pod-delete-chaos
        - - name: verify-recovery
            template: http-probe
        - - name: inject-network-chaos
            template: network-chaos
        - - name: final-validation
            template: http-probe

    - name: http-probe
      container:
        image: curlimages/curl
        command: ["/bin/sh", "-c"]
        args:
          - |
            for i in $(seq 1 10); do
              response=$(curl -s -o /dev/null -w "%{http_code}" http://my-app/health)
              if [ "$response" != "200" ]; then
                echo "Health check failed: $response"
                exit 1
              fi
              sleep 2
            done
            echo "All health checks passed"

    - name: pod-delete-chaos
      resource:
        action: create
        manifest: |
          apiVersion: litmuschaos.io/v1alpha1
          kind: ChaosEngine
          metadata:
            name: pod-delete-{{workflow.uid}}
            namespace: default
          spec:
            appinfo:
              appns: 'default'
              applabel: 'app=my-app'
              appkind: 'deployment'
            chaosServiceAccount: litmus-admin
            experiments:
              - name: pod-delete
                spec:
                  components:
                    env:
                      - name: TOTAL_CHAOS_DURATION
                        value: '30'

    - name: network-chaos
      resource:
        action: create
        manifest: |
          apiVersion: litmuschaos.io/v1alpha1
          kind: ChaosEngine
          metadata:
            name: network-{{workflow.uid}}
            namespace: default
          spec:
            appinfo:
              appns: 'default'
              applabel: 'app=my-app'
              appkind: 'deployment'
            chaosServiceAccount: litmus-admin
            experiments:
              - name: pod-network-latency
                spec:
                  components:
                    env:
                      - name: NETWORK_LATENCY
                        value: '1000'
                      - name: TOTAL_CHAOS_DURATION
                        value: '30'
```

## 🔧 Monitoring Chaos

```yaml
# Prometheus alerts for chaos
groups:
  - name: chaos-alerts
    rules:
      - alert: ChaosExperimentRunning
        expr: litmuschaos_experiment_running_status == 1
        for: 0m
        labels:
          severity: info
        annotations:
          summary: "Chaos experiment is running"

      - alert: ChaosExperimentFailed
        expr: litmuschaos_experiment_verdict{verdict="Fail"} == 1
        for: 0m
        labels:
          severity: warning
        annotations:
          summary: "Chaos experiment failed"
```

## ✅ Completion Checklist

- [ ] Install Litmus Chaos
- [ ] Run pod delete experiment
- [ ] Test network chaos
- [ ] Inject CPU/memory stress
- [ ] Simulate node failure
- [ ] Create chaos workflow
- [ ] Monitor with Prometheus
- [ ] Document findings

## 📚 Resources

- [Litmus Docs](https://litmuschaos.io/docs/)
- [Chaos Hub](https://hub.litmuschaos.io/)
- [Principles of Chaos](https://principlesofchaos.org/)

---

**Congratulations!** You've completed the Platform Engineering roadmap! 🎉
