# ⚡ Complete CircleCI Guide

A comprehensive guide for CI/CD with CircleCI.

---

## Table of Contents
1. [Fundamentals](#1-fundamentals)
2. [Configuration](#2-configuration)
3. [Jobs & Workflows](#3-jobs--workflows)
4. [Orbs](#4-orbs)
5. [Advanced Patterns](#5-advanced-patterns)

---

## 1. Fundamentals

### CI/CD Philosophy

**Continuous Integration (CI)** and **Continuous Delivery/Deployment (CD)** are practices that automate the software delivery process, reducing manual work and catching issues early.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       The CI/CD Pipeline Flow                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   Developer     Version      Build &      Deploy        Production      │
│    Commits      Control       Test        Staging        Deploy         │
│                                                                          │
│  ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────────┐   │
│  │  Code  │──▶│  Git   │──▶│  CI    │──▶│  CD    │──▶│ Production │   │
│  │ Change │   │  Push  │   │ Build  │   │ Deploy │   │   Live!    │   │
│  └────────┘   └────────┘   └────────┘   └────────┘   └────────────┘   │
│                                │              │                         │
│                          ┌─────┴─────┐  ┌────┴────┐                    │
│                          │Run Tests  │  │Approval?│                    │
│                          │Lint Code  │  │(Manual) │                    │
│                          │Sec Scan   │  └─────────┘                    │
│                          └───────────┘                                  │
│                                                                          │
│  ◀──────── Continuous Integration ────────▶│◀── Continuous Delivery ──▶│
│                                                                          │
│  Continuous Deployment = No manual approval, auto-deploy to production  │
└─────────────────────────────────────────────────────────────────────────┘
```

#### CI vs CD vs CD

| Term | Definition | Automation Level |
|------|------------|-----------------|
| **Continuous Integration** | Frequently merge code, run automated tests | Fully automated |
| **Continuous Delivery** | Always have deployable build, manual release | Semi-automated |
| **Continuous Deployment** | Every passing build auto-deploys to prod | Fully automated |

### How CircleCI Executes Pipelines

When you push code, CircleCI:
1. Detects the push via webhook
2. Reads `.circleci/config.yml` from your repo
3. Creates an execution environment (executor)
4. Runs jobs according to your workflow definition

```
┌────────────────────────────────────────────────────────────────────┐
│                    CircleCI Execution Model                         │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   Git Push          CircleCI            Executor Pool              │
│  ┌────────┐        ┌────────┐         ┌────────────────┐          │
│  │ Webhook│───────▶│ Queue  │────────▶│   Spin up      │          │
│  └────────┘        └────────┘         │   Environment  │          │
│                         │              └───────┬────────┘          │
│                         ▼                      ▼                   │
│                   ┌──────────┐         ┌────────────────┐         │
│                   │  Parse   │         │  Checkout      │         │
│                   │  Config  │         │  Code          │         │
│                   └──────────┘         └───────┬────────┘         │
│                                                ▼                   │
│                                         ┌────────────────┐        │
│                                         │  Run Steps     │        │
│                                         │  (commands)    │        │
│                                         └───────┬────────┘        │
│                                                 ▼                  │
│                                         ┌────────────────┐        │
│                                         │  Report        │        │
│                                         │  Results       │        │
│                                         └────────────────┘        │
└────────────────────────────────────────────────────────────────────┘
```

### Executor Types Deep Dive

CircleCI offers different execution environments:

| Executor | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Docker** | Most builds | Fast startup, cached layers, lightweight | Limited to Linux, no Docker-in-Docker |
| **Machine** | Docker builds, system tests | Full VM, real Docker, any OS | Slower startup, more expensive |
| **macOS** | iOS/macOS apps | Native Xcode, simulators | Limited availability, expensive |
| **Windows** | .NET, Windows apps | Native Windows environment | Limited, expensive |

```
┌────────────────────────────────────────────────────────────────────┐
│                    Choosing Your Executor                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Need to build Docker images? ──────▶ Use 'machine' executor       │
│                    │                                                │
│                    │ No                                             │
│                    ▼                                                │
│  Building iOS/macOS app? ───────────▶ Use 'macos' executor         │
│                    │                                                │
│                    │ No                                             │
│                    ▼                                                │
│  Building Windows app? ─────────────▶ Use 'windows' executor       │
│                    │                                                │
│                    │ No                                             │
│                    ▼                                                │
│  Standard build/test ───────────────▶ Use 'docker' executor        │
│                                       (fastest, cheapest)           │
└────────────────────────────────────────────────────────────────────┘
```

### Comparison with Other CI Tools

| Feature | CircleCI | GitHub Actions | GitLab CI | Jenkins |
|---------|----------|----------------|-----------|---------|
| Hosting | SaaS / Self-hosted | SaaS / Self-hosted | SaaS / Self-hosted | Self-hosted |
| Config File | `.circleci/config.yml` | `.github/workflows/*.yml` | `.gitlab-ci.yml` | `Jenkinsfile` |
| Pricing Model | Credits-based | Minutes-based | Minutes-based | Free (infra cost) |
| Docker Support | Excellent | Excellent | Excellent | Good |
| Parallelism | Native | Native | Native | Plugin |
| Orbs/Reuse | Orbs | Actions | Components | Shared Libraries |

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Pipeline** | Full CI/CD run triggered by code change |
| **Workflow** | Collection of jobs with dependencies and scheduling |
| **Job** | Collection of steps running in a single executor |
| **Step** | Individual command or script |
| **Executor** | Environment where jobs run (Docker, machine, macOS) |
| **Orb** | Reusable packages of config (like npm packages for CI) |

---

## 2. Configuration

### Basic Structure
```yaml
# .circleci/config.yml
version: 2.1

orbs:
  node: circleci/node@5.1
  docker: circleci/docker@2.4

executors:
  node-executor:
    docker:
      - image: cimg/node:18.17
    working_directory: ~/app

commands:
  install-deps:
    description: "Install dependencies"
    steps:
      - restore_cache:
          keys:
            - deps-v1-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: deps-v1-{{ checksum "package-lock.json" }}
          paths:
            - node_modules

jobs:
  build:
    executor: node-executor
    steps:
      - checkout
      - install-deps
      - run: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist

workflows:
  build-deploy:
    jobs:
      - build
```

---

## 3. Jobs & Workflows

### Job Examples
```yaml
jobs:
  test:
    docker:
      - image: cimg/node:18.17
      - image: cimg/postgres:15.0
        environment:
          POSTGRES_USER: test
          POSTGRES_DB: test
    steps:
      - checkout
      - install-deps
      - run:
          name: Wait for DB
          command: dockerize -wait tcp://localhost:5432 -timeout 60s
      - run:
          name: Run tests
          command: npm test
      - store_test_results:
          path: test-results
      - store_artifacts:
          path: coverage

  deploy:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Deploy
          command: |
            if [ "${CIRCLE_BRANCH}" == "main" ]; then
              ./deploy.sh production
            else
              ./deploy.sh staging
            fi
```

### Workflow Examples
```yaml
workflows:
  version: 2
  
  build-test-deploy:
    jobs:
      - build
      - test:
          requires:
            - build
      - deploy-staging:
          requires:
            - test
          filters:
            branches:
              only: develop
      - approve-prod:
          type: approval
          requires:
            - test
          filters:
            branches:
              only: main
      - deploy-prod:
          requires:
            - approve-prod
          filters:
            branches:
              only: main

  # Scheduled workflow
  nightly:
    triggers:
      - schedule:
          cron: "0 2 * * *"
          filters:
            branches:
              only: main
    jobs:
      - e2e-tests
```

---

## 4. Orbs

### Using Orbs
```yaml
version: 2.1

orbs:
  node: circleci/node@5.1
  docker: circleci/docker@2.4
  aws-cli: circleci/aws-cli@4.1
  kubernetes: circleci/kubernetes@1.3

jobs:
  build-and-push:
    executor: docker/docker
    steps:
      - checkout
      - setup_remote_docker:
          version: 20.10.18
      - docker/check
      - docker/build:
          image: myapp
          tag: ${CIRCLE_SHA1}
      - docker/push:
          image: myapp
          tag: ${CIRCLE_SHA1}

  deploy-k8s:
    executor: kubernetes/default
    steps:
      - kubernetes/install-kubectl
      - kubernetes/create-or-update-resource:
          resource-file-path: k8s/
          show-kubectl-command: true
```

---

## 5. Advanced Patterns

### Matrix Builds
```yaml
jobs:
  test:
    parameters:
      node-version:
        type: string
    docker:
      - image: cimg/node:<< parameters.node-version >>
    steps:
      - checkout
      - run: npm test

workflows:
  test-matrix:
    jobs:
      - test:
          matrix:
            parameters:
              node-version: ["16.20", "18.17", "20.5"]
```

### Conditional Steps
```yaml
steps:
  - when:
      condition:
        equal: [ main, << pipeline.git.branch >> ]
      steps:
        - run: ./deploy-prod.sh
  - unless:
      condition:
        equal: [ main, << pipeline.git.branch >> ]
      steps:
        - run: ./deploy-staging.sh
```

### Dynamic Configuration
```yaml
# .circleci/config.yml
version: 2.1
setup: true

orbs:
  continuation: circleci/continuation@0.3

jobs:
  generate-config:
    docker:
      - image: cimg/base:stable
    steps:
      - checkout
      - run:
          name: Generate config
          command: |
            ./generate-pipeline.sh > generated_config.yml
      - continuation/continue:
          configuration_path: generated_config.yml

workflows:
  setup:
    jobs:
      - generate-config
```

### Environment & Secrets
```yaml
jobs:
  deploy:
    docker:
      - image: cimg/base:stable
    environment:
      ENV: production
    steps:
      - run:
          name: Deploy
          command: |
            echo "Deploying to $ENV"
            echo "Using key: $AWS_ACCESS_KEY_ID"  # From project settings
```

### Caching Strategies
```yaml
steps:
  # Restore cache
  - restore_cache:
      keys:
        - v1-deps-{{ checksum "package-lock.json" }}
        - v1-deps-
  
  - run: npm ci
  
  # Save cache
  - save_cache:
      key: v1-deps-{{ checksum "package-lock.json" }}
      paths:
        - node_modules
        - ~/.npm
```

### Quick Reference
```yaml
# Environment variables
# CIRCLE_BRANCH - current branch
# CIRCLE_SHA1 - current commit SHA
# CIRCLE_TAG - current tag (if tagged)
# CIRCLE_BUILD_NUM - build number
# CIRCLE_PROJECT_REPONAME - repo name
# CIRCLE_WORKFLOW_ID - workflow ID

# Common commands
- checkout                    # Clone repo
- setup_remote_docker         # Enable Docker
- persist_to_workspace        # Share files between jobs
- attach_workspace            # Receive shared files
- store_artifacts             # Upload artifacts
- store_test_results          # Upload test results
```

---
*Continue to Argo Workflows guide.*
