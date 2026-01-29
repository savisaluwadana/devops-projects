# 🎮 Kubernetes Operator Development

Build custom controllers to extend Kubernetes.

## 🎯 Learning Objectives

- Understand the operator pattern
- Set up Kubebuilder
- Create Custom Resource Definitions (CRDs)
- Implement reconciliation logic
- Deploy and test operators

## 📋 Prerequisites

- Go programming basics
- Kubernetes experience
- kubectl configured
- Docker installed

## 🏗️ Operator Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    KUBERNETES OPERATOR                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐         ┌─────────────┐                        │
│  │   Custom    │ watch   │  Controller │                        │
│  │  Resource   │────────▶│  (Operator) │                        │
│  │  (CR)       │         │             │                        │
│  └─────────────┘         └──────┬──────┘                        │
│                                  │                               │
│                          reconcile                               │
│                                  │                               │
│                                  ▼                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              Managed Resources                               ││
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    ││
│  │  │Deployment│  │ Service  │  │ConfigMap │  │  Secret  │    ││
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Install Kubebuilder
```bash
# Download kubebuilder
curl -L -o kubebuilder https://go.kubebuilder.io/dl/latest/$(go env GOOS)/$(go env GOARCH)
chmod +x kubebuilder && sudo mv kubebuilder /usr/local/bin/

# Verify installation
kubebuilder version
```

### Lab 2: Initialize Project
```bash
# Create project directory
mkdir app-operator && cd app-operator

# Initialize project
kubebuilder init --domain example.com --repo github.com/example/app-operator

# Create API (CRD + Controller)
kubebuilder create api --group apps --version v1 --kind Application

# Project structure
# ├── api/
# │   └── v1/
# │       ├── application_types.go   # CRD definition
# │       └── groupversion_info.go
# ├── controllers/
# │   └── application_controller.go  # Controller logic
# ├── config/
# │   ├── crd/                        # CRD manifests
# │   ├── manager/                    # Operator deployment
# │   ├── rbac/                       # RBAC configs
# │   └── samples/                    # Sample CRs
# ├── main.go
# ├── Makefile
# └── Dockerfile
```

### Lab 3: Define CRD
```go
// api/v1/application_types.go
package v1

import (
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
)

// ApplicationSpec defines the desired state
type ApplicationSpec struct {
	// Image is the container image to deploy
	// +kubebuilder:validation:Required
	Image string `json:"image"`

	// Replicas is the number of pods
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=10
	// +kubebuilder:default=1
	Replicas int32 `json:"replicas,omitempty"`

	// Port is the container port
	// +kubebuilder:validation:Minimum=1
	// +kubebuilder:validation:Maximum=65535
	// +kubebuilder:default=8080
	Port int32 `json:"port,omitempty"`

	// Environment variables
	Env []EnvVar `json:"env,omitempty"`

	// Resources for the container
	Resources ResourceRequirements `json:"resources,omitempty"`
}

type EnvVar struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

type ResourceRequirements struct {
	// +kubebuilder:default="100m"
	CPU string `json:"cpu,omitempty"`
	// +kubebuilder:default="128Mi"
	Memory string `json:"memory,omitempty"`
}

// ApplicationStatus defines the observed state
type ApplicationStatus struct {
	// Conditions represent the latest observations
	Conditions []metav1.Condition `json:"conditions,omitempty"`

	// AvailableReplicas is the number of ready pods
	AvailableReplicas int32 `json:"availableReplicas,omitempty"`

	// Phase represents the current phase
	// +kubebuilder:validation:Enum=Pending;Running;Failed
	Phase string `json:"phase,omitempty"`
}

// +kubebuilder:object:root=true
// +kubebuilder:subresource:status
// +kubebuilder:printcolumn:name="Image",type=string,JSONPath=`.spec.image`
// +kubebuilder:printcolumn:name="Replicas",type=integer,JSONPath=`.spec.replicas`
// +kubebuilder:printcolumn:name="Phase",type=string,JSONPath=`.status.phase`
// +kubebuilder:printcolumn:name="Age",type="date",JSONPath=`.metadata.creationTimestamp`

// Application is the Schema for the applications API
type Application struct {
	metav1.TypeMeta   `json:",inline"`
	metav1.ObjectMeta `json:"metadata,omitempty"`

	Spec   ApplicationSpec   `json:"spec,omitempty"`
	Status ApplicationStatus `json:"status,omitempty"`
}

// +kubebuilder:object:root=true

// ApplicationList contains a list of Application
type ApplicationList struct {
	metav1.TypeMeta `json:",inline"`
	metav1.ListMeta `json:"metadata,omitempty"`
	Items           []Application `json:"items"`
}

func init() {
	SchemeBuilder.Register(&Application{}, &ApplicationList{})
}
```

### Lab 4: Implement Controller
```go
// controllers/application_controller.go
package controllers

import (
	"context"
	"time"

	appsv1 "k8s.io/api/apps/v1"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/errors"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/types"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
	"sigs.k8s.io/controller-runtime/pkg/log"

	appsv1alpha1 "github.com/example/app-operator/api/v1"
)

type ApplicationReconciler struct {
	client.Client
	Scheme *runtime.Scheme
}

// +kubebuilder:rbac:groups=apps.example.com,resources=applications,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=apps.example.com,resources=applications/status,verbs=get;update;patch
// +kubebuilder:rbac:groups=apps,resources=deployments,verbs=get;list;watch;create;update;patch;delete
// +kubebuilder:rbac:groups=core,resources=services,verbs=get;list;watch;create;update;patch;delete

func (r *ApplicationReconciler) Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error) {
	log := log.FromContext(ctx)

	// Fetch the Application instance
	app := &appsv1alpha1.Application{}
	if err := r.Get(ctx, req.NamespacedName, app); err != nil {
		if errors.IsNotFound(err) {
			log.Info("Application resource not found. Ignoring since object must be deleted")
			return ctrl.Result{}, nil
		}
		log.Error(err, "Failed to get Application")
		return ctrl.Result{}, err
	}

	// Reconcile Deployment
	deployment := r.constructDeployment(app)
	if err := ctrl.SetControllerReference(app, deployment, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	foundDeployment := &appsv1.Deployment{}
	err := r.Get(ctx, types.NamespacedName{Name: app.Name, Namespace: app.Namespace}, foundDeployment)
	if err != nil && errors.IsNotFound(err) {
		log.Info("Creating Deployment", "Deployment.Name", deployment.Name)
		if err := r.Create(ctx, deployment); err != nil {
			return ctrl.Result{}, err
		}
	} else if err == nil {
		// Update if needed
		if needsUpdate(foundDeployment, app) {
			foundDeployment.Spec = deployment.Spec
			if err := r.Update(ctx, foundDeployment); err != nil {
				return ctrl.Result{}, err
			}
		}
	}

	// Reconcile Service
	service := r.constructService(app)
	if err := ctrl.SetControllerReference(app, service, r.Scheme); err != nil {
		return ctrl.Result{}, err
	}

	foundService := &corev1.Service{}
	err = r.Get(ctx, types.NamespacedName{Name: app.Name, Namespace: app.Namespace}, foundService)
	if err != nil && errors.IsNotFound(err) {
		log.Info("Creating Service", "Service.Name", service.Name)
		if err := r.Create(ctx, service); err != nil {
			return ctrl.Result{}, err
		}
	}

	// Update status
	app.Status.Phase = "Running"
	app.Status.AvailableReplicas = foundDeployment.Status.AvailableReplicas
	if err := r.Status().Update(ctx, app); err != nil {
		return ctrl.Result{}, err
	}

	return ctrl.Result{RequeueAfter: 30 * time.Second}, nil
}

func (r *ApplicationReconciler) constructDeployment(app *appsv1alpha1.Application) *appsv1.Deployment {
	labels := map[string]string{
		"app":        app.Name,
		"managed-by": "app-operator",
	}

	replicas := app.Spec.Replicas
	if replicas == 0 {
		replicas = 1
	}

	return &appsv1.Deployment{
		ObjectMeta: metav1.ObjectMeta{
			Name:      app.Name,
			Namespace: app.Namespace,
			Labels:    labels,
		},
		Spec: appsv1.DeploymentSpec{
			Replicas: &replicas,
			Selector: &metav1.LabelSelector{
				MatchLabels: labels,
			},
			Template: corev1.PodTemplateSpec{
				ObjectMeta: metav1.ObjectMeta{
					Labels: labels,
				},
				Spec: corev1.PodSpec{
					Containers: []corev1.Container{
						{
							Name:  "app",
							Image: app.Spec.Image,
							Ports: []corev1.ContainerPort{
								{
									ContainerPort: app.Spec.Port,
								},
							},
						},
					},
				},
			},
		},
	}
}

func (r *ApplicationReconciler) constructService(app *appsv1alpha1.Application) *corev1.Service {
	return &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      app.Name,
			Namespace: app.Namespace,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": app.Name,
			},
			Ports: []corev1.ServicePort{
				{
					Port:       80,
					TargetPort: intstr.FromInt(int(app.Spec.Port)),
				},
			},
		},
	}
}

func (r *ApplicationReconciler) SetupWithManager(mgr ctrl.Manager) error {
	return ctrl.NewControllerManagedBy(mgr).
		For(&appsv1alpha1.Application{}).
		Owns(&appsv1.Deployment{}).
		Owns(&corev1.Service{}).
		Complete(r)
}
```

### Lab 5: Build and Deploy
```bash
# Generate CRD manifests
make manifests

# Install CRDs
make install

# Run locally (for development)
make run

# Build and push image
make docker-build docker-push IMG=myregistry/app-operator:v1

# Deploy to cluster
make deploy IMG=myregistry/app-operator:v1
```

## 📝 Sample Custom Resource

```yaml
# config/samples/apps_v1_application.yaml
apiVersion: apps.example.com/v1
kind: Application
metadata:
  name: my-web-app
spec:
  image: nginx:1.25
  replicas: 3
  port: 80
  env:
    - name: ENVIRONMENT
      value: production
  resources:
    cpu: "200m"
    memory: "256Mi"
```

```bash
# Apply sample
kubectl apply -f config/samples/apps_v1_application.yaml

# Check status
kubectl get applications
kubectl describe application my-web-app

# Check managed resources
kubectl get deployments,services
```

## 🔧 Makefile Commands

```bash
# Generate code
make generate

# Generate manifests (CRD, RBAC)
make manifests

# Run tests
make test

# Build binary
make build

# Run locally
make run

# Deploy
make deploy IMG=<image>

# Undeploy
make undeploy
```

## ✅ Completion Checklist

- [ ] Set up Kubebuilder
- [ ] Create API with CRD
- [ ] Implement reconciliation logic
- [ ] Add status updates
- [ ] Implement owner references
- [ ] Write tests
- [ ] Build and deploy operator
- [ ] Test with sample CR

## 📚 Resources

- [Kubebuilder Book](https://book.kubebuilder.io/)
- [Operator SDK](https://sdk.operatorframework.io/)
- [Controller Runtime](https://github.com/kubernetes-sigs/controller-runtime)

---

**Next Project:** [Chaos Engineering](../chaos-engineering/)
