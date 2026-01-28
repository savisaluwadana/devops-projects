**DevOps Capstone — The Cloud-Native Enterprise Stack**

Overview
- **Goal**: Demonstrate a GitOps CI/CD pipeline for a full-stack app (Next.js frontend, Spring Boot backend, PostgreSQL) running on Kubernetes (Kind) with Argo CD and WSO2 API Manager as the front door.
- This guide contains architecture description, Terraform + Ansible scaffolding for local infra, Dockerfiles, GitHub Actions pipeline, Argo CD Application manifest, sample Kubernetes manifests, and WSO2 integration steps.

Architecture Diagram (textual description)
- Developer pushes code to GitHub (two repositories recommended): `app-repo` (frontend/backend) and `k8s-manifests` (Kubernetes YAML manifests).
- GitHub Actions (CI) builds Docker images for `frontend` and `backend`, pushes images to registry (Docker Hub/GHCR) and updates `k8s-manifests` with new image tags.
- Argo CD watches `k8s-manifests` and automatically syncs changes to the Kubernetes cluster.
- WSO2 API Manager (deployed via Helm) sits in front of the backend service, exposing public endpoints, enforcing auth/rate-limits and routing to `springboot-service.default.svc.cluster.local:8080`.

Phase 1 — Local Infrastructure (Terraform + Kind)
- We use Terraform to provision a local Kind (Kubernetes-in-Docker) cluster so that the environment is reproducible.

Commands (high level)
- Install prerequisites: `docker`, `kubectl`, `helm`, `terraform`, `kind` (optional), `argocd` CLI (optional).

Terraform
- Location: `terraform/main.tf`
- Run:
```
terraform init
terraform apply -auto-approve
```

This creates a single-node Kind cluster with port 80 mapped to the host for WSO2 access.

Phase 2 — Optional Ansible (node hardening / demo)
- Location: `ansible/playbook.yml` — demonstrates installing common utilities on target nodes. For local Kind this is optional.

Phase 3 — Containerization
- Two Dockerfiles are provided:
  - `docker/backend/Dockerfile` — multi-stage Maven build for Spring Boot.
  - `docker/frontend/Dockerfile` — multi-stage Next.js build and slim runtime.

Docker networking (local, before K8s):
```
docker network create app-net
docker run -d --name db --net app-net -e POSTGRES_PASSWORD=example postgres:15
docker run -d --name backend --net app-net -e DB_HOST=db yourid/springboot-api:latest
docker run -d --name frontend --net app-net -p 3000:3000 yourid/nextjs-frontend:latest
```

Phase 4 — CI/CD (GitHub Actions + Argo CD)
- CI (`.github/workflows/ci.yaml`) builds images, pushes to registry, and updates `k8s-manifests` by committing the new image tag using a deploy token.
- CD (Argo CD) runs in the cluster and watches `k8s-manifests` to apply changes automatically.

Phase 5 — WSO2 API Manager
- Install WSO2 AM via Helm and configure an API that proxies to the internal `springboot-service` DNS name in the cluster.

Repository layout (created files)
- `terraform/main.tf` — Kind cluster provisioning
- `ansible/playbook.yml` — optional playbook
- `docker/backend/Dockerfile` — backend image
- `docker/frontend/Dockerfile` — frontend image
- `.github/workflows/ci.yaml` — CI pipeline
- `argo/application.yaml` — Argo CD Application
- `k8s/*.yaml` — sample Kubernetes manifests
- `docs/wso2-integration.md` — WSO2 details

Next steps
- Configure repository secrets in GitHub: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `MANIFESTS_REPO_TOKEN` (PAT with repo push rights), `REGISTRY` (optional), `IMAGE_PREFIX`.
- Run `terraform apply` to create Kind cluster, then follow the WSO2 instructions in `docs/wso2-integration.md`.

If you want, I can:
- run `terraform init && terraform apply` locally (I can provide the exact commands),
- scaffold the `k8s-manifests` repo updates (branch and example commit flow),
- create small sample Spring Boot and Next.js projects to test the pipeline.
