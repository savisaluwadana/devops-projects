# 🔧 Jenkins CI/CD Pipeline

Build complete CI/CD pipelines with Jenkins.

## 🎯 Learning Objectives
- Install and configure Jenkins
- Create Jenkinsfiles
- Build multi-stage pipelines
- Integrate with Docker and Kubernetes

---

## Lab 1: Jenkins Setup

### Docker Installation
```bash
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts

# Get initial password
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Essential Plugins
- Pipeline
- Docker Pipeline
- Git
- Blue Ocean
- Kubernetes
- Slack Notification

---

## Lab 2: Declarative Pipeline

### Basic Jenkinsfile
```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        APP_NAME = 'myapp'
        DOCKER_REGISTRY = 'registry.example.com'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm install'
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm test'
            }
            post {
                always {
                    junit 'test-results/*.xml'
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/${APP_NAME}:${BUILD_NUMBER}")
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            slackSend channel: '#deployments',
                      message: "Build ${BUILD_NUMBER} succeeded"
        }
        failure {
            slackSend channel: '#deployments',
                      message: "Build ${BUILD_NUMBER} failed"
        }
    }
}
```

---

## Lab 3: Advanced Pipeline

### Parallel Stages
```groovy
pipeline {
    agent none
    
    stages {
        stage('Build') {
            agent { docker 'node:18' }
            steps {
                sh 'npm ci && npm run build'
                stash includes: 'dist/**', name: 'build'
            }
        }
        
        stage('Test') {
            parallel {
                stage('Unit Tests') {
                    agent { docker 'node:18' }
                    steps {
                        unstash 'build'
                        sh 'npm run test:unit'
                    }
                }
                stage('Integration Tests') {
                    agent { docker 'node:18' }
                    steps {
                        unstash 'build'
                        sh 'npm run test:integration'
                    }
                }
                stage('Security Scan') {
                    agent { docker 'aquasec/trivy' }
                    steps {
                        sh 'trivy fs .'
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            agent any
            steps {
                unstash 'build'
                sh './deploy.sh staging'
            }
        }
        
        stage('Approval') {
            steps {
                input message: 'Deploy to production?',
                      ok: 'Deploy'
            }
        }
        
        stage('Deploy to Production') {
            agent any
            steps {
                unstash 'build'
                sh './deploy.sh production'
            }
        }
    }
}
```

---

## Lab 4: Shared Libraries

### Library Structure
```
vars/
├── buildApp.groovy
├── deployApp.groovy
└── notifySlack.groovy
```

### Shared Function
```groovy
// vars/buildApp.groovy
def call(Map config = [:]) {
    pipeline {
        agent any
        stages {
            stage('Build') {
                steps {
                    sh "npm ci"
                    sh "npm run build"
                }
            }
            stage('Docker') {
                steps {
                    script {
                        docker.build("${config.registry}/${config.app}:${BUILD_NUMBER}")
                    }
                }
            }
        }
    }
}
```

### Usage
```groovy
@Library('my-shared-library') _

buildApp(
    registry: 'registry.example.com',
    app: 'myapp'
)
```

---

## ✅ Completion Checklist
- [ ] Installed Jenkins
- [ ] Created basic pipeline
- [ ] Built multi-stage pipeline
- [ ] Implemented parallel stages
- [ ] Created shared library
