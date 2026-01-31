# 🔄 CircleCI CI/CD Pipelines

Build complete CI/CD pipelines with CircleCI for automated testing, building, and deployment.

## 🎯 Learning Objectives

- Configure CircleCI for projects
- Create multi-stage pipelines
- Implement testing and code quality checks
- Build and push Docker images
- Deploy to Kubernetes
- Use orbs for common tasks

## 📋 Prerequisites

- GitHub account
- CircleCI account (free tier)
- Docker basics
- Basic Kubernetes understanding

## 🏗️ Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CIRCLECI PIPELINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │   Code   │───▶│   Test   │───▶│  Build   │───▶│  Deploy  │  │
│  │  Commit  │    │  Stage   │    │  Stage   │    │  Stage   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  Workflow:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │    lint ─────┐                                               ││
│  │              ├──▶ build ──▶ test ──▶ scan ──┐               ││
│  │    format ───┘                              │               ││
│  │                                              ▼               ││
│  │                              deploy-staging ──▶ deploy-prod ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Project Setup

Create a sample application:

```bash
mkdir -p circleci-demo && cd circleci-demo

# Create a simple Node.js app
cat << 'EOF' > package.json
{
  "name": "circleci-demo",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "lint": "eslint .",
    "build": "echo 'Building...' && mkdir -p dist && cp server.js dist/"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "jest": "^29.7.0",
    "eslint": "^8.55.0"
  }
}
EOF

# Create server
cat << 'EOF' > server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from CircleCI Demo!', version: '1.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Export for testing
module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}
EOF

# Create test
cat << 'EOF' > server.test.js
const request = require('supertest');
const app = require('./server');

describe('API Tests', () => {
  test('GET / returns message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  test('GET /health returns healthy', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
EOF

# Create Dockerfile
cat << 'EOF' > Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER nodejs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "server.js"]
EOF

# Create .circleci directory
mkdir -p .circleci
```

### Lab 2: Basic CircleCI Config

```yaml
# .circleci/config.yml
version: 2.1

# Reusable executors
executors:
  node-executor:
    docker:
      - image: cimg/node:18.19
    working_directory: ~/repo

# Reusable commands
commands:
  install-dependencies:
    description: "Install npm dependencies with caching"
    steps:
      - restore_cache:
          keys:
            - v1-deps-{{ checksum "package-lock.json" }}
            - v1-deps-
      - run:
          name: Install Dependencies
          command: npm ci
      - save_cache:
          key: v1-deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules

# Jobs
jobs:
  lint:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Run ESLint
          command: npm run lint

  test:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Run Tests
          command: npm test -- --coverage --reporters=default --reporters=jest-junit
          environment:
            JEST_JUNIT_OUTPUT_DIR: ./reports
      - store_test_results:
          path: ./reports
      - store_artifacts:
          path: ./coverage
          destination: coverage

  build:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Build Application
          command: npm run build
      - persist_to_workspace:
          root: .
          paths:
            - dist

# Workflows
workflows:
  version: 2
  build-test-deploy:
    jobs:
      - lint
      - test
      - build:
          requires:
            - lint
            - test
```

### Lab 3: Docker Build & Push

```yaml
# .circleci/config.yml (extended)
version: 2.1

orbs:
  docker: circleci/docker@2.4.0

executors:
  node-executor:
    docker:
      - image: cimg/node:18.19
  docker-executor:
    docker:
      - image: cimg/base:current
    environment:
      DOCKER_BUILDKIT: 1

commands:
  install-dependencies:
    steps:
      - restore_cache:
          keys:
            - v1-deps-{{ checksum "package-lock.json" }}
            - v1-deps-
      - run: npm ci
      - save_cache:
          key: v1-deps-{{ checksum "package-lock.json" }}
          paths:
            - node_modules

jobs:
  lint:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run: npm run lint

  test:
    executor: node-executor
    steps:
      - checkout
      - install-dependencies
      - run:
          name: Run Tests with Coverage
          command: npm test -- --coverage
      - store_artifacts:
          path: coverage

  build-and-push:
    executor: docker-executor
    steps:
      - checkout
      - setup_remote_docker:
          version: 20.10.24
          docker_layer_caching: true
      - run:
          name: Build Docker Image
          command: |
            docker build -t $DOCKER_REGISTRY/$DOCKER_IMAGE:$CIRCLE_SHA1 \
                         -t $DOCKER_REGISTRY/$DOCKER_IMAGE:latest .
      - run:
          name: Push to Registry
          command: |
            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
            docker push $DOCKER_REGISTRY/$DOCKER_IMAGE:$CIRCLE_SHA1
            docker push $DOCKER_REGISTRY/$DOCKER_IMAGE:latest

  security-scan:
    executor: docker-executor
    steps:
      - checkout
      - setup_remote_docker
      - run:
          name: Scan for Vulnerabilities
          command: |
            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
              aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL \
              $DOCKER_REGISTRY/$DOCKER_IMAGE:$CIRCLE_SHA1

workflows:
  build-test-deploy:
    jobs:
      - lint
      - test
      - build-and-push:
          requires:
            - lint
            - test
          filters:
            branches:
              only:
                - main
                - develop
      - security-scan:
          requires:
            - build-and-push
```

### Lab 4: Kubernetes Deployment

```yaml
# .circleci/config.yml (with K8s deployment)
version: 2.1

orbs:
  docker: circleci/docker@2.4.0
  kubernetes: circleci/kubernetes@1.3.1

jobs:
  deploy-staging:
    executor: kubernetes/default
    steps:
      - checkout
      - kubernetes/install-kubectl
      - run:
          name: Configure Kubernetes
          command: |
            echo "$KUBE_CONFIG" | base64 -d > kubeconfig.yaml
            export KUBECONFIG=kubeconfig.yaml
      - run:
          name: Deploy to Staging
          command: |
            export KUBECONFIG=kubeconfig.yaml
            kubectl set image deployment/myapp \
              app=$DOCKER_REGISTRY/$DOCKER_IMAGE:$CIRCLE_SHA1 \
              -n staging
            kubectl rollout status deployment/myapp -n staging --timeout=300s

  deploy-production:
    executor: kubernetes/default
    steps:
      - checkout
      - kubernetes/install-kubectl
      - run:
          name: Configure Kubernetes
          command: |
            echo "$KUBE_CONFIG" | base64 -d > kubeconfig.yaml
      - run:
          name: Deploy to Production
          command: |
            export KUBECONFIG=kubeconfig.yaml
            kubectl set image deployment/myapp \
              app=$DOCKER_REGISTRY/$DOCKER_IMAGE:$CIRCLE_SHA1 \
              -n production
            kubectl rollout status deployment/myapp -n production --timeout=300s

workflows:
  build-test-deploy:
    jobs:
      - lint
      - test
      - build-and-push:
          requires:
            - lint
            - test
          filters:
            branches:
              only: [main, develop]
      - security-scan:
          requires:
            - build-and-push
      - deploy-staging:
          requires:
            - security-scan
          filters:
            branches:
              only: develop
      - hold-production:
          type: approval
          requires:
            - security-scan
          filters:
            branches:
              only: main
      - deploy-production:
          requires:
            - hold-production
          filters:
            branches:
              only: main
```

### Lab 5: Matrix Builds & Parallelism

```yaml
# Testing across multiple Node.js versions
version: 2.1

jobs:
  test:
    parameters:
      node-version:
        type: string
    docker:
      - image: cimg/node:<< parameters.node-version >>
    parallelism: 4  # Split tests across 4 containers
    steps:
      - checkout
      - run: npm ci
      - run:
          name: Run Tests (Split)
          command: |
            TESTFILES=$(circleci tests glob "**/*.test.js" | circleci tests split --split-by=timings)
            npm test -- $TESTFILES

workflows:
  matrix-test:
    jobs:
      - test:
          matrix:
            parameters:
              node-version: ["16.20", "18.19", "20.10"]
```

## 📝 Project: Complete Production Pipeline

Full pipeline with all stages:

```yaml
# .circleci/config.yml
version: 2.1

orbs:
  docker: circleci/docker@2.4.0
  slack: circleci/slack@4.12.5

executors:
  node:
    docker:
      - image: cimg/node:18.19
  docker-build:
    docker:
      - image: cimg/base:current
    environment:
      DOCKER_BUILDKIT: 1

commands:
  notify-slack:
    parameters:
      event:
        type: string
    steps:
      - slack/notify:
          event: << parameters.event >>
          template: basic_success_1

jobs:
  install:
    executor: node
    steps:
      - checkout
      - restore_cache:
          keys:
            - deps-v1-{{ checksum "package-lock.json" }}
      - run: npm ci
      - save_cache:
          key: deps-v1-{{ checksum "package-lock.json" }}
          paths: [node_modules]
      - persist_to_workspace:
          root: .
          paths: [node_modules]

  lint:
    executor: node
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run: npm run lint

  test:
    executor: node
    steps:
      - checkout
      - attach_workspace:
          at: .
      - run:
          name: Run Tests
          command: npm test -- --coverage --ci
      - store_test_results:
          path: reports
      - store_artifacts:
          path: coverage

  build-docker:
    executor: docker-build
    steps:
      - checkout
      - setup_remote_docker:
          docker_layer_caching: true
      - run:
          name: Build & Tag
          command: |
            docker build \
              --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
              --build-arg VCS_REF=$CIRCLE_SHA1 \
              -t $DOCKER_IMAGE:$CIRCLE_SHA1 \
              -t $DOCKER_IMAGE:${CIRCLE_BRANCH//\//-} .
      - run:
          name: Push to Registry
          command: |
            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
            docker push $DOCKER_IMAGE:$CIRCLE_SHA1
            docker push $DOCKER_IMAGE:${CIRCLE_BRANCH//\//-}

  deploy-staging:
    docker:
      - image: bitnami/kubectl:latest
    steps:
      - checkout
      - run:
          name: Deploy to Staging
          command: |
            echo "$KUBE_CONFIG_STAGING" | base64 -d > ~/.kube/config
            kubectl set image deployment/app app=$DOCKER_IMAGE:$CIRCLE_SHA1 -n staging
            kubectl rollout status deployment/app -n staging

  deploy-production:
    docker:
      - image: bitnami/kubectl:latest
    steps:
      - checkout
      - run:
          name: Deploy to Production
          command: |
            echo "$KUBE_CONFIG_PROD" | base64 -d > ~/.kube/config
            kubectl set image deployment/app app=$DOCKER_IMAGE:$CIRCLE_SHA1 -n production
            kubectl rollout status deployment/app -n production

workflows:
  ci-cd:
    jobs:
      - install
      - lint:
          requires: [install]
      - test:
          requires: [install]
      - build-docker:
          requires: [lint, test]
          filters:
            branches:
              only: [main, develop, /feature\/.*/]
      - deploy-staging:
          requires: [build-docker]
          filters:
            branches:
              only: develop
      - approve-prod:
          type: approval
          requires: [build-docker]
          filters:
            branches:
              only: main
      - deploy-production:
          requires: [approve-prod]
          filters:
            branches:
              only: main
```

## ✅ Completion Checklist

- [ ] Set up CircleCI project
- [ ] Configure basic CI pipeline
- [ ] Add caching for dependencies
- [ ] Implement parallel testing
- [ ] Build and push Docker images
- [ ] Add security scanning
- [ ] Deploy to Kubernetes staging
- [ ] Add production approval gate
- [ ] Configure Slack notifications

## 📚 Resources

- [CircleCI Documentation](https://circleci.com/docs/)
- [CircleCI Orbs Registry](https://circleci.com/developer/orbs)
- [Configuration Reference](https://circleci.com/docs/configuration-reference/)

---

**Next Project:** [Docker Multi-Stage Builds](../docker-multi-stage/)
