# 🏭 Crossplane Infrastructure

Manage cloud infrastructure with Kubernetes.

## 🎯 Learning Objectives
- Install Crossplane
- Create cloud resources
- Build compositions
- Implement GitOps for infrastructure

---

## Lab 1: Installation

```bash
# Install Crossplane
helm repo add crossplane https://charts.crossplane.io/stable
helm install crossplane crossplane/crossplane \
  --namespace crossplane-system \
  --create-namespace

# Wait for pods
kubectl wait --for=condition=Ready pods --all -n crossplane-system

# Install AWS Provider
kubectl apply -f - <<EOF
apiVersion: pkg.crossplane.io/v1
kind: Provider
metadata:
  name: provider-aws
spec:
  package: xpkg.upbound.io/upbound/provider-aws:v0.40.0
EOF
```

---

## Lab 2: AWS Resources

### S3 Bucket
```yaml
apiVersion: s3.aws.upbound.io/v1beta1
kind: Bucket
metadata:
  name: my-bucket
spec:
  forProvider:
    region: us-east-1
    tags:
      Environment: production
  providerConfigRef:
    name: aws-provider
```

### RDS Database
```yaml
apiVersion: rds.aws.upbound.io/v1beta1
kind: Instance
metadata:
  name: my-database
spec:
  forProvider:
    region: us-east-1
    engine: postgres
    engineVersion: "15"
    instanceClass: db.t3.micro
    allocatedStorage: 20
    dbName: myapp
    masterUsername: admin
    masterPasswordSecretRef:
      name: db-password
      namespace: default
      key: password
```

---

## Lab 3: Compositions

### Composite Definition
```yaml
apiVersion: apiextensions.crossplane.io/v1
kind: CompositeResourceDefinition
metadata:
  name: xdatabases.platform.example.com
spec:
  group: platform.example.com
  names:
    kind: XDatabase
    plural: xdatabases
  versions:
    - name: v1alpha1
      served: true
      referenceable: true
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                size:
                  type: string
                  enum: ["small", "medium", "large"]
                engine:
                  type: string
                  default: postgres
```

### Composition
```yaml
apiVersion: apiextensions.crossplane.io/v1
kind: Composition
metadata:
  name: database-aws
spec:
  compositeTypeRef:
    apiVersion: platform.example.com/v1alpha1
    kind: XDatabase
  resources:
    - name: rds-instance
      base:
        apiVersion: rds.aws.upbound.io/v1beta1
        kind: Instance
        spec:
          forProvider:
            engine: postgres
            region: us-east-1
      patches:
        - fromFieldPath: spec.size
          toFieldPath: spec.forProvider.instanceClass
          transforms:
            - type: map
              map:
                small: db.t3.micro
                medium: db.t3.small
                large: db.t3.medium
```

---

## Lab 4: Usage

```yaml
# Create database via platform API
apiVersion: platform.example.com/v1alpha1
kind: XDatabase
metadata:
  name: my-app-db
spec:
  size: medium
  engine: postgres
```

---

## ✅ Completion Checklist
- [ ] Installed Crossplane
- [ ] Created cloud resources
- [ ] Built compositions
- [ ] Used platform APIs
