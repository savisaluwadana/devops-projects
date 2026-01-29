# 🛡️ Policy as Code with OPA Gatekeeper

Enforce security and compliance policies in Kubernetes.

## 🎯 Learning Objectives

- Understand policy as code concepts
- Deploy OPA Gatekeeper
- Write Rego policies
- Create constraint templates
- Implement security guardrails

## 📋 Prerequisites

- Kubernetes cluster
- kubectl configured
- Basic understanding of admission controllers

## 🔬 Hands-On Labs

### Lab 1: Install Gatekeeper
```bash
# Install Gatekeeper
kubectl apply -f https://raw.githubusercontent.com/open-policy-agent/gatekeeper/v3.14.0/deploy/gatekeeper.yaml

# Verify installation
kubectl get pods -n gatekeeper-system
kubectl get crd | grep gatekeeper
```

### Lab 2: First Constraint Template
```yaml
# require-labels-template.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequiredlabels
spec:
  crd:
    spec:
      names:
        kind: K8sRequiredLabels
      validation:
        openAPIV3Schema:
          type: object
          properties:
            labels:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequiredlabels

        violation[{"msg": msg}] {
          provided := {label | input.review.object.metadata.labels[label]}
          required := {label | label := input.parameters.labels[_]}
          missing := required - provided
          count(missing) > 0
          msg := sprintf("Missing required labels: %v", [missing])
        }
```

```yaml
# require-labels-constraint.yaml
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequiredLabels
metadata:
  name: require-app-labels
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
      - apiGroups: ["apps"]
        kinds: ["Deployment"]
  parameters:
    labels:
      - "app"
      - "environment"
```

### Lab 3: Container Security Policies
```yaml
# disallow-privileged.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sdisallowprivileged
spec:
  crd:
    spec:
      names:
        kind: K8sDisallowPrivileged
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sdisallowprivileged

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          container.securityContext.privileged == true
          msg := sprintf("Privileged containers are not allowed: %v", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.initContainers[_]
          container.securityContext.privileged == true
          msg := sprintf("Privileged init containers are not allowed: %v", [container.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sDisallowPrivileged
metadata:
  name: disallow-privileged-containers
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
```

### Lab 4: Resource Limits
```yaml
# require-resources.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequireresources
spec:
  crd:
    spec:
      names:
        kind: K8sRequireResources
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequireresources

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.limits.cpu
          msg := sprintf("Container %v must have CPU limits", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.limits.memory
          msg := sprintf("Container %v must have memory limits", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.requests.cpu
          msg := sprintf("Container %v must have CPU requests", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not container.resources.requests.memory
          msg := sprintf("Container %v must have memory requests", [container.name])
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sRequireResources
metadata:
  name: require-resource-limits
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
    excludedNamespaces:
      - kube-system
      - gatekeeper-system
```

### Lab 5: Image Registry Restrictions
```yaml
# allowed-repos.yaml
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sallowedrepos
spec:
  crd:
    spec:
      names:
        kind: K8sAllowedRepos
      validation:
        openAPIV3Schema:
          type: object
          properties:
            repos:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sallowedrepos

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not startswith_any(container.image, input.parameters.repos)
          msg := sprintf("Container %v uses image %v which is not from an allowed repository. Allowed: %v", [container.name, container.image, input.parameters.repos])
        }

        startswith_any(image, repos) {
          repo := repos[_]
          startswith(image, repo)
        }

---
apiVersion: constraints.gatekeeper.sh/v1beta1
kind: K8sAllowedRepos
metadata:
  name: allowed-repos
spec:
  match:
    kinds:
      - apiGroups: [""]
        kinds: ["Pod"]
  parameters:
    repos:
      - "gcr.io/my-org/"
      - "docker.io/mycompany/"
      - "ghcr.io/my-org/"
```

## 📝 Project: Complete Policy Bundle

```yaml
# policy-bundle/
# ├── templates/
# │   ├── require-labels.yaml
# │   ├── disallow-privileged.yaml
# │   ├── require-resources.yaml
# │   ├── allowed-repos.yaml
# │   ├── disallow-latest-tag.yaml
# │   └── require-probes.yaml
# └── constraints/
#     ├── production-policies.yaml
#     └── staging-policies.yaml

---
# Disallow latest tag
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8sdisallowlatesttag
spec:
  crd:
    spec:
      names:
        kind: K8sDisallowLatestTag
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8sdisallowlatesttag

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          endswith(container.image, ":latest")
          msg := sprintf("Container %v uses 'latest' tag which is not allowed", [container.name])
        }

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          not contains(container.image, ":")
          msg := sprintf("Container %v has no image tag specified (defaults to latest)", [container.name])
        }

---
# Require health probes
apiVersion: templates.gatekeeper.sh/v1
kind: ConstraintTemplate
metadata:
  name: k8srequireprobes
spec:
  crd:
    spec:
      names:
        kind: K8sRequireProbes
      validation:
        openAPIV3Schema:
          type: object
          properties:
            probes:
              type: array
              items:
                type: string
  targets:
    - target: admission.k8s.gatekeeper.sh
      rego: |
        package k8srequireprobes

        violation[{"msg": msg}] {
          container := input.review.object.spec.containers[_]
          probe := input.parameters.probes[_]
          not has_probe(container, probe)
          msg := sprintf("Container %v must have %v probe", [container.name, probe])
        }

        has_probe(container, "readinessProbe") {
          container.readinessProbe
        }

        has_probe(container, "livenessProbe") {
          container.livenessProbe
        }
```

## 🔧 Gatekeeper Commands

```bash
# View constraints
kubectl get constraints

# View constraint template
kubectl get constrainttemplates

# View violations
kubectl get K8sRequiredLabels -o yaml

# Audit mode (dry-run)
# Add to constraint:
# spec:
#   enforcementAction: dryrun

# Test policy with conftest
conftest test deployment.yaml --policy policy/
```

## ✅ Completion Checklist

- [ ] Install Gatekeeper
- [ ] Create constraint templates
- [ ] Write Rego policies
- [ ] Deploy constraints
- [ ] Test policy enforcement
- [ ] Implement security policies
- [ ] Set up audit mode
- [ ] Create policy bundle

## 📚 Resources

- [Gatekeeper Docs](https://open-policy-agent.github.io/gatekeeper/)
- [Rego Playground](https://play.openpolicyagent.org/)
- [Policy Library](https://github.com/open-policy-agent/gatekeeper-library)

---

**Next Project:** [Crossplane Infrastructure](../crossplane/)
