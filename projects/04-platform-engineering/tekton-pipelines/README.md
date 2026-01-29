# 🔄 Tekton Pipelines

Build cloud-native CI/CD with Tekton.

## 🎯 Learning Objectives
- Install Tekton
- Create Tasks and Pipelines
- Use TriggerTemplates
- Implement GitOps pipelines

---

## Lab 1: Installation

```bash
# Install Tekton Pipelines
kubectl apply -f https://storage.googleapis.com/tekton-releases/pipeline/latest/release.yaml

# Install Triggers
kubectl apply -f https://storage.googleapis.com/tekton-releases/triggers/latest/release.yaml

# Install Dashboard
kubectl apply -f https://storage.googleapis.com/tekton-releases/dashboard/latest/release.yaml

# Access dashboard
kubectl port-forward svc/tekton-dashboard 9097:9097 -n tekton-pipelines
```

---

## Lab 2: Tasks

### Git Clone Task
```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: git-clone
spec:
  params:
    - name: url
      type: string
    - name: revision
      type: string
      default: main
  workspaces:
    - name: output
  steps:
    - name: clone
      image: alpine/git
      script: |
        git clone $(params.url) $(workspaces.output.path)
        cd $(workspaces.output.path)
        git checkout $(params.revision)
```

### Build Task
```yaml
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: build-push
spec:
  params:
    - name: image
      type: string
  workspaces:
    - name: source
  steps:
    - name: build
      image: gcr.io/kaniko-project/executor:latest
      args:
        - --dockerfile=$(workspaces.source.path)/Dockerfile
        - --destination=$(params.image)
        - --context=$(workspaces.source.path)
```

---

## Lab 3: Pipelines

```yaml
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: build-deploy
spec:
  params:
    - name: repo-url
    - name: image
    - name: revision
      default: main
  
  workspaces:
    - name: shared-workspace
  
  tasks:
    - name: clone
      taskRef:
        name: git-clone
      params:
        - name: url
          value: $(params.repo-url)
        - name: revision
          value: $(params.revision)
      workspaces:
        - name: output
          workspace: shared-workspace
    
    - name: build
      taskRef:
        name: build-push
      runAfter:
        - clone
      params:
        - name: image
          value: $(params.image)
      workspaces:
        - name: source
          workspace: shared-workspace
    
    - name: deploy
      taskRef:
        name: kubectl-deploy
      runAfter:
        - build
      params:
        - name: image
          value: $(params.image)
```

---

## Lab 4: Triggers

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerTemplate
metadata:
  name: pipeline-template
spec:
  params:
    - name: gitrevision
    - name: gitrepositoryurl
  resourcetemplates:
    - apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        generateName: build-run-
      spec:
        pipelineRef:
          name: build-deploy
        params:
          - name: repo-url
            value: $(tt.params.gitrepositoryurl)
          - name: revision
            value: $(tt.params.gitrevision)
        workspaces:
          - name: shared-workspace
            volumeClaimTemplate:
              spec:
                accessModes:
                  - ReadWriteOnce
                resources:
                  requests:
                    storage: 1Gi
```

---

## ✅ Completion Checklist
- [ ] Installed Tekton
- [ ] Created custom Tasks
- [ ] Built Pipelines
- [ ] Set up Triggers
