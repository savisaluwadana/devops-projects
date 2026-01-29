# 🚀 CI/CD with GitLab

Build complete CI/CD pipelines with GitLab CI.

## 🎯 Learning Objectives
- Configure .gitlab-ci.yml
- Build multi-stage pipelines
- Use GitLab Registry
- Deploy to Kubernetes

---

## Lab 1: Basic Pipeline

### Simple Pipeline
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  IMAGE_TAG: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

build:
  stage: build
  image: node:18
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - dist/
    expire_in: 1 hour

test:
  stage: test
  image: node:18
  script:
    - npm ci
    - npm run test
  coverage: '/Coverage: (\d+\.\d+)%/'

deploy:
  stage: deploy
  script:
    - ./deploy.sh
  only:
    - main
```

---

## Lab 2: Docker Build

```yaml
build-docker:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_TLS_CERTDIR: "/certs"
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $IMAGE_TAG .
    - docker push $IMAGE_TAG

deploy-k8s:
  stage: deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl set image deployment/myapp app=$IMAGE_TAG
  environment:
    name: production
    url: https://myapp.example.com
  only:
    - main
```

---

## Lab 3: Multi-Environment

```yaml
stages:
  - build
  - test
  - deploy-staging
  - deploy-production

.deploy-template: &deploy
  image: bitnami/kubectl:latest
  script:
    - kubectl apply -f k8s/$ENVIRONMENT/

deploy-staging:
  <<: *deploy
  stage: deploy-staging
  variables:
    ENVIRONMENT: staging
  environment:
    name: staging
  only:
    - develop

deploy-production:
  <<: *deploy
  stage: deploy-production
  variables:
    ENVIRONMENT: production
  environment:
    name: production
  when: manual
  only:
    - main
```

---

## Lab 4: Advanced Features

### Cache & Artifacts
```yaml
default:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .npm/

test:
  artifacts:
    reports:
      junit: test-results.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura.xml
```

### Parallel Jobs
```yaml
test:
  parallel: 3
  script:
    - npm run test -- --shard=$CI_NODE_INDEX/$CI_NODE_TOTAL

test-matrix:
  parallel:
    matrix:
      - NODE_VERSION: ["16", "18", "20"]
  image: node:$NODE_VERSION
  script:
    - npm test
```

---

## ✅ Completion Checklist
- [ ] Created basic pipeline
- [ ] Built Docker images
- [ ] Deployed to multiple environments
- [ ] Implemented caching
- [ ] Used parallel jobs
