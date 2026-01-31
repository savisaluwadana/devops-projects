# ⚙️ Complete Argo Workflows Guide

A comprehensive guide for workflow automation with Argo Workflows.

---

## Table of Contents
1. [Fundamentals](#1-fundamentals)
2. [Installation](#2-installation)
3. [Workflow Templates](#3-workflow-templates)
4. [DAG & Steps](#4-dag--steps)
5. [Advanced Patterns](#5-advanced-patterns)

---

## 1. Fundamentals

### Workflow Orchestration Theory

Workflow orchestration is the automated coordination of multiple tasks to achieve a complex goal. Unlike simple scripts that run tasks sequentially, workflow engines provide:

- **Dependency Management**: Execute tasks based on dependencies, not order
- **Parallelization**: Run independent tasks simultaneously
- **Fault Tolerance**: Handle failures gracefully with retries and fallbacks
- **Observability**: Track progress, logs, and artifacts centrally

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Why Workflow Engines?                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  SIMPLE SCRIPT:                        WORKFLOW ENGINE:             │
│                                                                      │
│  task_1()                              ┌───────┐                    │
│  task_2()  ──▶  Sequential,            │task_1 │                    │
│  task_3()      No parallelism          └───┬───┘                    │
│  task_4()                              ┌───┴───┐                    │
│                                    ┌───┴───┐   │                    │
│                                    │task_2 │  ┌┴───────┐            │
│                                    └───┬───┘  │task_3  │            │
│                                        └──┬───┴────────┘            │
│                                           │                         │
│                                       ┌───┴───┐                     │
│                                       │task_4 │  Parallel DAG       │
│                                       └───────┘                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Directed Acyclic Graphs (DAGs)

Argo Workflows uses **DAGs** to represent task dependencies. A DAG is a graph where:
- **Directed**: Edges have direction (task A → task B means B depends on A)
- **Acyclic**: No cycles (you can't have A → B → C → A)

```
           ┌─────────────────────────────────────────┐
           │          DAG Execution Model             │
           ├─────────────────────────────────────────┤
           │                                          │
           │     ┌─────┐                             │
           │     │  A  │  Ready: no dependencies     │
           │     └──┬──┘                             │
           │     ┌──┴──┐                             │
           │     ▼     ▼                             │
           │   ┌───┐ ┌───┐  Ready when A completes   │
           │   │ B │ │ C │                           │
           │   └─┬─┘ └─┬─┘                           │
           │     └──┬──┘                             │
           │        ▼                                │
           │      ┌───┐   Ready when B AND C done    │
           │      │ D │                              │
           │      └───┘                              │
           └─────────────────────────────────────────┘

Execution order: A → (B, C in parallel) → D
```

### Kubernetes Controller Pattern

Argo Workflows is built on the **Kubernetes controller pattern**:

1. **Custom Resource (CR)**: `Workflow` object defines desired state
2. **Controller**: Watches for Workflow CRs and creates Pods to execute tasks
3. **Reconciliation**: Continuously ensures actual state matches desired state

```
┌────────────────────────────────────────────────────────────────────┐
│                 Argo Workflows Controller Pattern                   │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  User submits         Argo Controller        Kubernetes Cluster    │
│  ┌──────────┐         ┌─────────────┐        ┌─────────────────┐  │
│  │ Workflow │────────▶│   Watch +   │───────▶│  Create Pods    │  │
│  │   YAML   │         │ Reconcile   │        │  for each task  │  │
│  └──────────┘         └─────────────┘        └─────────────────┘  │
│                              │                       │             │
│                              │       ┌───────────────┘             │
│                              ▼       ▼                             │
│                        ┌─────────────────┐                        │
│                        │ Update Workflow │                        │
│                        │     Status      │                        │
│                        └─────────────────┘                        │
└────────────────────────────────────────────────────────────────────┘
```

### Comparison with Other Workflow Engines

| Feature | Argo Workflows | Apache Airflow | Tekton | Jenkins |
|---------|---------------|----------------|--------|---------|
| Runtime | Kubernetes-native | Python workers | Kubernetes-native | JVM |
| Definition | YAML | Python DAGs | YAML | Groovy/DSL |
| Scalability | Pod per task | Worker-based | Pod per task | Agent-based |
| Use Case | CI/CD, ML pipelines | Data pipelines | CI/CD | General CI/CD |
| Learning Curve | Medium | Medium | Medium | Low-Medium |

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Workflow** | K8s custom resource defining the complete execution |
| **Template** | Reusable task definition (container, script, DAG, or steps) |
| **DAG** | Directed Acyclic Graph for parallel tasks with dependencies |
| **Steps** | Sequential task execution (can have parallel inner steps) |
| **Artifacts** | Input/output data passed between tasks via S3, GCS, or local storage |
| **Parameters** | Values passed between templates for dynamic configuration |

---

## 2. Installation

```bash
# Install Argo Workflows
kubectl create namespace argo
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.5.0/install.yaml

# Install CLI
brew install argo

# Access UI
kubectl -n argo port-forward deployment/argo-server 2746:2746

# Submit workflow
argo submit -n argo workflow.yaml --watch
```

---

## 3. Workflow Templates

### Basic Workflow
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: hello-world-
spec:
  entrypoint: hello
  
  templates:
    - name: hello
      container:
        image: alpine:latest
        command: [echo]
        args: ["Hello, World!"]
```

### With Parameters
```yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: param-workflow-
spec:
  entrypoint: main
  arguments:
    parameters:
      - name: message
        value: "Hello"
  
  templates:
    - name: main
      inputs:
        parameters:
          - name: message
      container:
        image: alpine:latest
        command: [echo]
        args: ["{{inputs.parameters.message}}"]
```

### Script Template
```yaml
templates:
  - name: python-script
    script:
      image: python:3.11
      command: [python]
      source: |
        import json
        result = {"status": "success", "count": 42}
        print(json.dumps(result))
```

---

## 4. DAG & Steps

### Steps (Sequential)
```yaml
spec:
  entrypoint: main
  templates:
    - name: main
      steps:
        - - name: step-1
            template: task-a
        - - name: step-2a
            template: task-b
          - name: step-2b
            template: task-c
        - - name: step-3
            template: task-d

    - name: task-a
      container:
        image: alpine
        command: [echo, "Task A"]
```

### DAG (Dependencies)
```yaml
spec:
  entrypoint: main
  templates:
    - name: main
      dag:
        tasks:
          - name: checkout
            template: git-clone
          
          - name: build
            dependencies: [checkout]
            template: build-app
          
          - name: test-unit
            dependencies: [build]
            template: run-tests
            arguments:
              parameters:
                - name: type
                  value: unit
          
          - name: test-integration
            dependencies: [build]
            template: run-tests
            arguments:
              parameters:
                - name: type
                  value: integration
          
          - name: deploy
            dependencies: [test-unit, test-integration]
            template: deploy-app
```

---

## 5. Advanced Patterns

### Artifacts
```yaml
templates:
  - name: generate
    container:
      image: alpine
      command: [sh, -c]
      args: ["echo 'data' > /tmp/output.txt"]
    outputs:
      artifacts:
        - name: output
          path: /tmp/output.txt

  - name: consume
    inputs:
      artifacts:
        - name: input
          path: /tmp/input.txt
    container:
      image: alpine
      command: [cat, /tmp/input.txt]
```

### Loops
```yaml
templates:
  - name: loop-example
    steps:
      - - name: process
          template: task
          arguments:
            parameters:
              - name: item
                value: "{{item}}"
          withItems:
            - item1
            - item2
            - item3
```

### Conditionals
```yaml
dag:
  tasks:
    - name: deploy-prod
      template: deploy
      when: "{{workflow.parameters.env}} == 'production'"
    
    - name: deploy-staging
      template: deploy
      when: "{{workflow.parameters.env}} == 'staging'"
```

### Retry & Timeout
```yaml
templates:
  - name: retry-task
    retryStrategy:
      limit: 3
      retryPolicy: "Always"
      backoff:
        duration: "1s"
        factor: 2
        maxDuration: "1m"
    container:
      image: alpine
      command: [sh, -c, "exit 1"]
    
  - name: timeout-task
    timeout: "5m"
    container:
      image: alpine
      command: [sleep, "600"]
```

### WorkflowTemplate (Reusable)
```yaml
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: ci-template
spec:
  entrypoint: ci-pipeline
  arguments:
    parameters:
      - name: repo
      - name: branch
        value: main
  
  templates:
    - name: ci-pipeline
      dag:
        tasks:
          - name: build
            template: build-task
          - name: test
            dependencies: [build]
            template: test-task

---
# Use WorkflowTemplate
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ci-run-
spec:
  workflowTemplateRef:
    name: ci-template
  arguments:
    parameters:
      - name: repo
        value: https://github.com/org/repo.git
```

### CronWorkflow
```yaml
apiVersion: argoproj.io/v1alpha1
kind: CronWorkflow
metadata:
  name: nightly-backup
spec:
  schedule: "0 2 * * *"
  timezone: "America/New_York"
  concurrencyPolicy: Replace
  startingDeadlineSeconds: 0
  workflowSpec:
    entrypoint: backup
    templates:
      - name: backup
        container:
          image: backup-tool:latest
          command: [./backup.sh]
```

### Quick Reference
```bash
# CLI Commands
argo submit workflow.yaml              # Submit
argo submit workflow.yaml --watch      # Submit and watch
argo list                              # List workflows
argo get workflow-name                 # Get details
argo logs workflow-name                # View logs
argo delete workflow-name              # Delete
argo terminate workflow-name           # Terminate
argo retry workflow-name               # Retry failed

# Templates
argo template create template.yaml     # Create template
argo template list                     # List templates

# Cron workflows
argo cron create cron.yaml            # Create cron
argo cron list                        # List crons
```

---
*This completes the Argo Workflows guide.*
