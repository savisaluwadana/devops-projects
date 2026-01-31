# 🔄 Argo Workflows CI Pipeline

Build a complete CI pipeline using Argo Workflows for container-native automation.

## 🎯 Learning Objectives

- Create Argo Workflows for CI/CD
- Build and push containers in workflows
- Implement test parallelization
- Use artifacts between steps
- Create reusable WorkflowTemplates

## 📋 Prerequisites

- Kubernetes cluster
- Argo Workflows installed
- Container registry access

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│               ARGO WORKFLOWS CI PIPELINE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐                                                   │
│  │  Clone   │                                                   │
│  │   Repo   │                                                   │
│  └────┬─────┘                                                   │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              PARALLEL CHECKS                                 ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        ││
│  │  │  Lint   │  │  Test   │  │ Security│  │  Build  │        ││
│  │  │         │  │  Unit   │  │  Scan   │  │  Docker │        ││
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘        ││
│  └───────┼────────────┼────────────┼────────────┼──────────────┘│
│          └────────────┴────────────┴────────────┘               │
│                            │                                     │
│                            ▼                                     │
│               ┌─────────────────────────┐                       │
│               │      Push Image         │                       │
│               └───────────┬─────────────┘                       │
│                           │                                      │
│                           ▼                                      │
│               ┌─────────────────────────┐                       │
│               │   Deploy to Staging     │                       │
│               └─────────────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Argo Workflows

```bash
# Create namespace
kubectl create namespace argo

# Install Argo Workflows
kubectl apply -n argo -f https://github.com/argoproj/argo-workflows/releases/download/v3.5.2/install.yaml

# Patch auth mode for local testing
kubectl patch deployment \
  argo-server \
  --namespace argo \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/template/spec/containers/0/args", "value": ["server", "--auth-mode=server"]}]'

# Access UI
kubectl -n argo port-forward svc/argo-server 2746:2746 &
echo "Open https://localhost:2746"

# Install CLI
curl -sLO https://github.com/argoproj/argo-workflows/releases/download/v3.5.2/argo-darwin-amd64.gz
gunzip argo-darwin-amd64.gz
chmod +x argo-darwin-amd64
sudo mv argo-darwin-amd64 /usr/local/bin/argo
```

### Lab 2: Basic CI Workflow

```yaml
# ci-workflow.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ci-pipeline-
  namespace: argo
spec:
  entrypoint: ci-pipeline
  
  # Volumes for sharing between steps
  volumeClaimTemplates:
  - metadata:
      name: workspace
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
  
  templates:
  - name: ci-pipeline
    steps:
    # Step 1: Clone
    - - name: clone
        template: git-clone
        arguments:
          parameters:
          - name: repo
            value: "https://github.com/argoproj/argo-workflows.git"
          - name: branch
            value: "main"
    
    # Step 2: Parallel checks
    - - name: lint
        template: run-lint
      - name: test
        template: run-tests
      - name: security-scan
        template: security-scan
    
    # Step 3: Build (after parallel checks)
    - - name: build
        template: docker-build
  
  # Template: Git Clone
  - name: git-clone
    inputs:
      parameters:
      - name: repo
      - name: branch
    container:
      image: alpine/git:latest
      command: [sh, -c]
      args:
      - |
        git clone --depth 1 -b {{inputs.parameters.branch}} \
          {{inputs.parameters.repo}} /workspace/src
        ls -la /workspace/src
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  # Template: Lint
  - name: run-lint
    container:
      image: node:18-alpine
      command: [sh, -c]
      args:
      - |
        cd /workspace/src
        echo "Running linting..."
        # npm run lint || echo "Lint completed with warnings"
        echo "Lint passed!"
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  # Template: Tests
  - name: run-tests
    container:
      image: node:18-alpine
      command: [sh, -c]
      args:
      - |
        cd /workspace/src
        echo "Running tests..."
        # npm test
        echo "Tests passed!"
      volumeMounts:
      - name: workspace
        mountPath: /workspace
    outputs:
      artifacts:
      - name: test-results
        path: /workspace/src/coverage
        optional: true
  
  # Template: Security Scan
  - name: security-scan
    container:
      image: aquasec/trivy:latest
      command: [sh, -c]
      args:
      - |
        cd /workspace/src
        echo "Running security scan..."
        # trivy fs --exit-code 0 --severity HIGH,CRITICAL .
        echo "Security scan complete!"
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  # Template: Docker Build
  - name: docker-build
    container:
      image: gcr.io/kaniko-project/executor:latest
      args:
      - --dockerfile=/workspace/src/Dockerfile
      - --context=/workspace/src
      - --no-push
      - --destination=myapp:latest
      volumeMounts:
      - name: workspace
        mountPath: /workspace
```

Submit and monitor:
```bash
argo submit -n argo ci-workflow.yaml --watch
argo list -n argo
argo logs @latest -n argo
```

### Lab 3: WorkflowTemplate for Reusability

```yaml
# workflow-templates.yaml
---
apiVersion: argoproj.io/v1alpha1
kind: WorkflowTemplate
metadata:
  name: ci-templates
  namespace: argo
spec:
  templates:
  
  # Git Clone Template
  - name: git-clone
    inputs:
      parameters:
      - name: repo
      - name: branch
        default: "main"
      - name: path
        default: "/workspace/src"
    container:
      image: alpine/git:2.40.1
      command: [sh, -c]
      args:
      - |
        set -e
        git clone --depth 1 -b {{inputs.parameters.branch}} \
          {{inputs.parameters.repo}} {{inputs.parameters.path}}
        cd {{inputs.parameters.path}}
        echo "Cloned $(git rev-parse HEAD)"
  
  # Node.js Test Template
  - name: node-test
    inputs:
      parameters:
      - name: working-dir
        default: "/workspace/src"
      - name: node-version
        default: "18"
    container:
      image: "node:{{inputs.parameters.node-version}}-alpine"
      command: [sh, -c]
      args:
      - |
        cd {{inputs.parameters.working-dir}}
        npm ci
        npm test -- --coverage
      workingDir: "{{inputs.parameters.working-dir}}"
    outputs:
      artifacts:
      - name: coverage
        path: "{{inputs.parameters.working-dir}}/coverage"
        optional: true
  
  # Docker Build with Kaniko
  - name: kaniko-build
    inputs:
      parameters:
      - name: image
      - name: tag
      - name: dockerfile
        default: "Dockerfile"
      - name: context
        default: "/workspace/src"
    container:
      image: gcr.io/kaniko-project/executor:v1.18.0
      args:
      - --dockerfile={{inputs.parameters.context}}/{{inputs.parameters.dockerfile}}
      - --context={{inputs.parameters.context}}
      - --destination={{inputs.parameters.image}}:{{inputs.parameters.tag}}
      - --cache=true

---
# Use the template
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: app-ci-
  namespace: argo
spec:
  entrypoint: main
  
  volumeClaimTemplates:
  - metadata:
      name: workspace
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 2Gi
  
  arguments:
    parameters:
    - name: repo
      value: "https://github.com/user/app.git"
    - name: image
      value: "ghcr.io/user/app"
  
  templates:
  - name: main
    steps:
    - - name: clone
        templateRef:
          name: ci-templates
          template: git-clone
        arguments:
          parameters:
          - name: repo
            value: "{{workflow.parameters.repo}}"
    
    - - name: test
        templateRef:
          name: ci-templates
          template: node-test
    
    - - name: build
        templateRef:
          name: ci-templates
          template: kaniko-build
        arguments:
          parameters:
          - name: image
            value: "{{workflow.parameters.image}}"
          - name: tag
            value: "{{workflow.uid}}"
```

### Lab 4: DAG with Dependencies

```yaml
# dag-workflow.yaml
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  generateName: ci-dag-
  namespace: argo
spec:
  entrypoint: ci-dag
  
  volumeClaimTemplates:
  - metadata:
      name: workspace
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 2Gi
  
  templates:
  - name: ci-dag
    dag:
      tasks:
      # Root: Clone
      - name: clone
        template: clone
      
      # Parallel after clone
      - name: lint
        template: lint
        dependencies: [clone]
      
      - name: unit-tests
        template: test
        dependencies: [clone]
      
      - name: integration-tests
        template: integration-test
        dependencies: [clone]
      
      - name: security-scan
        template: security
        dependencies: [clone]
      
      # Build after all checks pass
      - name: build
        template: build
        dependencies: [lint, unit-tests, security-scan]
      
      # Deploy after build
      - name: deploy-staging
        template: deploy
        dependencies: [build, integration-tests]
        arguments:
          parameters:
          - name: environment
            value: staging
  
  - name: clone
    container:
      image: alpine/git
      command: [sh, -c]
      args: ["git clone --depth 1 https://github.com/user/app /workspace/src"]
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  - name: lint
    container:
      image: node:18-alpine
      command: [sh, -c]
      args: ["cd /workspace/src && echo 'Linting...' && sleep 5"]
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  - name: test
    container:
      image: node:18-alpine
      command: [sh, -c]
      args: ["cd /workspace/src && echo 'Unit testing...' && sleep 10"]
      volumeMounts:
      - name: workspace
        mountPath: /workspace
  
  - name: integration-test
    container:
      image: node:18-alpine
      command: [sh, -c]
      args: ["echo 'Integration testing...' && sleep 15"]
  
  - name: security
    container:
      image: alpine
      command: [sh, -c]
      args: ["echo 'Security scanning...' && sleep 5"]
  
  - name: build
    container:
      image: alpine
      command: [sh, -c]
      args: ["echo 'Building Docker image...' && sleep 10"]
  
  - name: deploy
    inputs:
      parameters:
      - name: environment
    container:
      image: bitnami/kubectl
      command: [sh, -c]
      args: ["echo 'Deploying to {{inputs.parameters.environment}}...'"]
```

### Lab 5: CronWorkflow for Scheduled Jobs

```yaml
# cron-workflow.yaml
apiVersion: argoproj.io/v1alpha1
kind: CronWorkflow
metadata:
  name: nightly-build
  namespace: argo
spec:
  schedule: "0 2 * * *"  # 2 AM daily
  timezone: "America/New_York"
  concurrencyPolicy: "Replace"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 3
  
  workflowSpec:
    entrypoint: nightly
    templates:
    - name: nightly
      steps:
      - - name: build
          template: build-and-test
      - - name: notify
          template: slack-notify
    
    - name: build-and-test
      container:
        image: node:18-alpine
        command: [sh, -c]
        args:
        - |
          echo "Running nightly build at $(date)"
          echo "Pulling latest code..."
          echo "Running full test suite..."
          echo "Building production artifacts..."
    
    - name: slack-notify
      container:
        image: curlimages/curl
        command: [sh, -c]
        args:
        - |
          curl -X POST $SLACK_WEBHOOK -d '{"text":"Nightly build completed!"}'
        env:
        - name: SLACK_WEBHOOK
          valueFrom:
            secretKeyRef:
              name: slack-webhook
              key: url
```

## ✅ Completion Checklist

- [ ] Install Argo Workflows
- [ ] Create basic CI workflow
- [ ] Implement parallel steps
- [ ] Use DAG for dependencies
- [ ] Create reusable WorkflowTemplates
- [ ] Build Docker images with Kaniko
- [ ] Set up CronWorkflow
- [ ] Add notifications

## 📚 Resources

- [Argo Workflows Docs](https://argoproj.github.io/argo-workflows/)
- [Workflow Examples](https://github.com/argoproj/argo-workflows/tree/master/examples)

---

**Next Project:** [Terraform AWS VPC](../terraform-aws-vpc/)
