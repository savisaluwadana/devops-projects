terraform {
  required_providers {
    kind = {
      source  = "tehcyx/kind"
      version = "0.0.13"
    }
  }
}

provider "kind" {}

# Create a Cluster
resource "kind_cluster" "devops_capstone" {
  name       = "devops-capstone-cluster"
  node_image = "kindest/node:v1.27.3"

  kind_config {
    kind       = "Cluster"
    apiVersion = "kind.x-k8s.io/v1alpha4"
    nodes {
      role = "control-plane"
      extra_port_mappings {
        container_port = 80
        host_port      = 80
      }
    }
  }
}

output "cluster_name" {
  value = kind_cluster.devops_capstone.name
}
