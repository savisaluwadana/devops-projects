# 🔐 HashiCorp Vault Secrets Management

Centralize and secure your secrets with Vault.

## 🎯 Learning Objectives

- Deploy and initialize Vault
- Store and retrieve secrets
- Implement dynamic secrets
- Integrate with Kubernetes
- Set up PKI and certificates

## 📋 Prerequisites

- Docker or Kubernetes cluster
- Vault CLI installed
- Basic understanding of encryption

## 🔬 Hands-On Labs

### Lab 1: Quick Start with Docker
```bash
# Run Vault in dev mode
docker run -d --name vault \
  -p 8200:8200 \
  -e 'VAULT_DEV_ROOT_TOKEN_ID=myroot' \
  -e 'VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200' \
  hashicorp/vault:latest

# Configure CLI
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='myroot'

# Verify
vault status
```

### Lab 2: KV Secrets Engine
```bash
# Enable KV v2 secrets engine
vault secrets enable -path=secret kv-v2

# Store secrets
vault kv put secret/myapp/config \
  database_url="postgres://localhost:5432/mydb" \
  api_key="abc123xyz"

# Read secrets
vault kv get secret/myapp/config
vault kv get -field=api_key secret/myapp/config

# List secrets
vault kv list secret/myapp

# Delete secrets
vault kv delete secret/myapp/config

# Versioning
vault kv get -version=1 secret/myapp/config
vault kv rollback -version=1 secret/myapp/config
```

### Lab 3: Authentication Methods
```bash
# AppRole authentication (for applications)
vault auth enable approle

vault write auth/approle/role/myapp \
  secret_id_ttl=10m \
  token_num_uses=10 \
  token_ttl=20m \
  token_max_ttl=30m \
  secret_id_num_uses=40 \
  policies="myapp-policy"

# Get role ID and secret ID
vault read auth/approle/role/myapp/role-id
vault write -f auth/approle/role/myapp/secret-id

# Login with AppRole
vault write auth/approle/login \
  role_id="<role-id>" \
  secret_id="<secret-id>"

# Kubernetes authentication
vault auth enable kubernetes

vault write auth/kubernetes/config \
  kubernetes_host="https://$KUBERNETES_SERVICE_HOST:$KUBERNETES_SERVICE_PORT"

vault write auth/kubernetes/role/myapp \
  bound_service_account_names=myapp \
  bound_service_account_namespaces=default \
  policies=myapp-policy \
  ttl=1h
```

### Lab 4: Policies
```hcl
# myapp-policy.hcl
path "secret/data/myapp/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

path "secret/metadata/myapp/*" {
  capabilities = ["list"]
}

path "database/creds/myapp" {
  capabilities = ["read"]
}
```

```bash
# Create policy
vault policy write myapp-policy myapp-policy.hcl

# List policies
vault policy list

# Read policy
vault policy read myapp-policy
```

### Lab 5: Dynamic Database Secrets
```bash
# Enable database secrets engine
vault secrets enable database

# Configure PostgreSQL
vault write database/config/postgres \
  plugin_name=postgresql-database-plugin \
  allowed_roles="readonly,readwrite" \
  connection_url="postgresql://{{username}}:{{password}}@postgres:5432/mydb" \
  username="vaultadmin" \
  password="adminpassword"

# Create role for dynamic credentials
vault write database/roles/readonly \
  db_name=postgres \
  creation_statements="CREATE ROLE \"{{name}}\" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT SELECT ON ALL TABLES IN SCHEMA public TO \"{{name}}\";" \
  default_ttl="1h" \
  max_ttl="24h"

# Get dynamic credentials
vault read database/creds/readonly
```

## 📝 Project: Kubernetes Integration

```yaml
# Deploy Vault on Kubernetes
# vault-values.yaml
server:
  ha:
    enabled: true
    replicas: 3
    raft:
      enabled: true
  
  dataStorage:
    enabled: true
    size: 10Gi
    storageClass: gp2

  auditStorage:
    enabled: true
    size: 10Gi

injector:
  enabled: true

ui:
  enabled: true
  serviceType: LoadBalancer
```

```bash
# Install with Helm
helm repo add hashicorp https://helm.releases.hashicorp.com
helm install vault hashicorp/vault -f vault-values.yaml -n vault --create-namespace
```

```yaml
# Application with Vault sidecar injection
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
      annotations:
        vault.hashicorp.com/agent-inject: "true"
        vault.hashicorp.com/role: "myapp"
        vault.hashicorp.com/agent-inject-secret-config.txt: "secret/data/myapp/config"
        vault.hashicorp.com/agent-inject-template-config.txt: |
          {{- with secret "secret/data/myapp/config" -}}
          DATABASE_URL={{ .Data.data.database_url }}
          API_KEY={{ .Data.data.api_key }}
          {{- end }}
    spec:
      serviceAccountName: myapp
      containers:
      - name: app
        image: myapp:latest
        command: ["/bin/sh", "-c"]
        args:
          - "source /vault/secrets/config.txt && ./start.sh"

---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: myapp
```

```yaml
# External Secrets Operator (alternative)
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
spec:
  provider:
    vault:
      server: "http://vault.vault:8200"
      path: "secret"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "myapp"
          serviceAccountRef:
            name: myapp

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: myapp-secrets
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: myapp-secrets
    creationPolicy: Owner
  data:
  - secretKey: database_url
    remoteRef:
      key: myapp/config
      property: database_url
  - secretKey: api_key
    remoteRef:
      key: myapp/config
      property: api_key
```

## 🔧 Vault Commands

```bash
# Seal/unseal
vault operator seal
vault operator unseal <key>

# Token management
vault token create -policy=myapp-policy
vault token lookup
vault token revoke <token>

# Audit
vault audit enable file file_path=/var/log/vault/audit.log

# Lease management
vault lease revoke <lease_id>
vault lease renew <lease_id>
```

## ✅ Completion Checklist

- [ ] Deploy Vault
- [ ] Store secrets in KV engine
- [ ] Configure authentication methods
- [ ] Create policies
- [ ] Enable dynamic secrets
- [ ] Integrate with Kubernetes
- [ ] Use Vault agent sidecar
- [ ] Set up External Secrets Operator

## 📚 Resources

- [Vault Docs](https://www.vaultproject.io/docs)
- [Vault on K8s](https://www.vaultproject.io/docs/platform/k8s)
- [External Secrets](https://external-secrets.io/)

---

**Next Level:** [Platform Engineering](../../04-platform-engineering/backstage-idp/)
