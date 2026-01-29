# 🏗️ Complete Terraform Guide

A comprehensive guide covering Terraform for Infrastructure as Code from basics to advanced patterns.

---

## Table of Contents

1. [Terraform Fundamentals](#1-terraform-fundamentals)
2. [Configuration Language (HCL)](#2-configuration-language-hcl)
3. [Resources & Data Sources](#3-resources--data-sources)
4. [State Management](#4-state-management)
5. [Variables & Outputs](#5-variables--outputs)
6. [Modules](#6-modules)
7. [Provisioners & Lifecycle](#7-provisioners--lifecycle)
8. [Workspaces & Environments](#8-workspaces--environments)
9. [Best Practices](#9-best-practices)
10. [CI/CD Integration](#10-cicd-integration)

---

## 1. Terraform Fundamentals

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TERRAFORM WORKFLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐                                            │
│  │  Configuration  │  .tf files                                 │
│  │     Files       │  (HCL syntax)                              │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │  terraform init │─────▶│   Providers     │                   │
│  │                 │      │  (plugins)      │                   │
│  └────────┬────────┘      └─────────────────┘                   │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐      ┌─────────────────┐                   │
│  │  terraform plan │─────▶│  State File     │                   │
│  │                 │◀─────│  (tfstate)      │                   │
│  └────────┬────────┘      └─────────────────┘                   │
│           │                        ▲                             │
│           ▼                        │                             │
│  ┌─────────────────┐               │                             │
│  │ terraform apply │───────────────┘                             │
│  │                 │                                             │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    CLOUD PROVIDERS                           ││
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        ││
│  │  │   AWS   │  │  Azure  │  │   GCP   │  │   K8s   │        ││
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Installation

```bash
# macOS
brew tap hashicorp/tap
brew install hashicorp/tap/terraform

# Linux
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform

# Verify
terraform version

# Enable autocompletion
terraform -install-autocomplete
```

### Core Workflow

```bash
# Initialize working directory
terraform init

# Validate configuration
terraform validate

# Format code
terraform fmt
terraform fmt -recursive

# Preview changes
terraform plan
terraform plan -out=tfplan

# Apply changes
terraform apply
terraform apply tfplan
terraform apply -auto-approve

# Show current state
terraform show
terraform show -json

# Destroy infrastructure
terraform destroy
terraform destroy -auto-approve
```

---

## 2. Configuration Language (HCL)

### Basic Syntax

```hcl
# main.tf

# Terraform settings
terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.23"
    }
  }
  
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Provider configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      ManagedBy   = "Terraform"
      Project     = var.project_name
    }
  }
}

provider "aws" {
  alias  = "west"
  region = "us-west-2"
}

# Local values
locals {
  common_tags = {
    Environment = var.environment
    Team        = "Platform"
    CostCenter  = "12345"
  }
  
  name_prefix = "${var.project_name}-${var.environment}"
  
  # Conditional expression
  instance_type = var.environment == "production" ? "t3.large" : "t3.micro"
  
  # Complex transformations
  subnet_ids = [for s in aws_subnet.private : s.id]
}
```

### Expressions & Functions

```hcl
# String interpolation
resource "aws_instance" "example" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = {
    Name = "${var.project_name}-${var.environment}-instance"
  }
}

# Conditional expressions
count = var.create_instance ? 1 : 0

# For expressions
variable "users" {
  default = ["alice", "bob", "charlie"]
}

resource "aws_iam_user" "users" {
  for_each = toset(var.users)
  name     = each.value
}

# Map transformation
locals {
  upper_users = [for u in var.users : upper(u)]
  user_map    = { for u in var.users : u => "${u}@example.com" }
}

# Common functions
locals {
  # String functions
  lower_name   = lower(var.name)
  upper_name   = upper(var.name)
  trimmed      = trimspace("  hello  ")
  joined       = join("-", ["a", "b", "c"])
  split_result = split(",", "a,b,c")
  replaced     = replace("hello-world", "-", "_")
  formatted    = format("Hello, %s!", var.name)
  
  # Numeric functions
  min_val = min(5, 12, 9)
  max_val = max(5, 12, 9)
  abs_val = abs(-5)
  ceil_val = ceil(4.2)
  floor_val = floor(4.8)
  
  # Collection functions
  length_val = length(var.users)
  concat_val = concat(["a"], ["b", "c"])
  distinct_val = distinct(["a", "a", "b"])
  flatten_val = flatten([["a"], ["b", "c"]])
  keys_val = keys({a = 1, b = 2})
  values_val = values({a = 1, b = 2})
  lookup_val = lookup({a = 1, b = 2}, "a", 0)
  merge_val = merge({a = 1}, {b = 2})
  element_val = element(["a", "b", "c"], 1)
  index_val = index(["a", "b", "c"], "b")
  contains_val = contains(["a", "b"], "a")
  
  # Type conversion
  to_string = tostring(123)
  to_number = tonumber("123")
  to_list   = tolist(toset(["a", "b"]))
  to_set    = toset(["a", "b", "a"])
  to_map    = tomap({a = 1})
  
  # Filesystem functions
  file_content = file("${path.module}/config.json")
  template_content = templatefile("${path.module}/template.tpl", {
    name = var.name
    items = var.items
  })
  
  # Date/time
  timestamp = timestamp()
  formatted_time = formatdate("YYYY-MM-DD", timestamp())
  
  # Encoding/Hash
  base64 = base64encode("hello")
  sha256 = sha256("hello")
  json   = jsonencode({key = "value"})
  yaml   = yamlencode({key = "value"})
  
  # IP functions
  cidr_subnet = cidrsubnet("10.0.0.0/16", 8, 1)
  cidr_host   = cidrhost("10.0.0.0/24", 5)
}
```

---

## 3. Resources & Data Sources

### Resource Blocks

```hcl
# Basic resource
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = {
    Name = "web-server"
  }
}

# Resource with count
resource "aws_instance" "web" {
  count = var.instance_count
  
  ami           = var.ami_id
  instance_type = var.instance_type
  
  tags = {
    Name = "web-server-${count.index}"
  }
}

# Resource with for_each (map)
resource "aws_instance" "web" {
  for_each = var.instances
  
  ami           = each.value.ami
  instance_type = each.value.type
  
  tags = {
    Name = each.key
  }
}

# Resource with for_each (set)
resource "aws_iam_user" "users" {
  for_each = toset(var.user_names)
  name     = each.value
}

# Resource dependencies
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  # Explicit dependency
  depends_on = [aws_internet_gateway.main]
}

# Resource reference
resource "aws_eip" "web" {
  instance = aws_instance.web.id  # Implicit dependency
}
```

### Data Sources

```hcl
# Query existing resources
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical
  
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# Use data source
resource "aws_instance" "web" {
  ami               = data.aws_ami.ubuntu.id
  instance_type     = "t3.micro"
  availability_zone = data.aws_availability_zones.available.names[0]
}

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}
```

### Complete AWS Example

```hcl
# vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-vpc"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-igw"
  })
}

resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-${count.index + 1}"
    Type = "public"
  })
}

resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-private-${count.index + 1}"
    Type = "private"
  })
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count = length(aws_subnet.public)
  
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_security_group" "web" {
  name        = "${local.name_prefix}-web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = merge(local.common_tags, {
    Name = "${local.name_prefix}-web-sg"
  })
}
```

---

## 4. State Management

### Local State

```bash
# State is stored locally in terraform.tfstate
terraform show
terraform state list
terraform state show aws_instance.web
```

### Remote State (S3 + DynamoDB)

```hcl
# backend.tf
terraform {
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "env/production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-state-lock"
  }
}

# Create state infrastructure (run this first without backend)
resource "aws_s3_bucket" "terraform_state" {
  bucket = "my-terraform-state"
}

resource "aws_s3_bucket_versioning" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "terraform_state" {
  bucket = aws_s3_bucket.terraform_state.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_dynamodb_table" "terraform_locks" {
  name         = "terraform-state-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"
  
  attribute {
    name = "LockID"
    type = "S"
  }
}
```

### State Commands

```bash
# List resources in state
terraform state list

# Show resource details
terraform state show aws_instance.web

# Move resource (rename)
terraform state mv aws_instance.web aws_instance.application

# Remove from state (don't destroy)
terraform state rm aws_instance.web

# Import existing resource
terraform import aws_instance.web i-1234567890abcdef0

# Pull remote state
terraform state pull > state.json

# Push state (dangerous)
terraform state push state.json

# Replace provider
terraform state replace-provider hashicorp/aws registry.example.com/aws

# Force unlock (emergency)
terraform force-unlock LOCK_ID
```

### Remote State Data Source

```hcl
# Read state from another project
data "terraform_remote_state" "network" {
  backend = "s3"
  
  config = {
    bucket = "my-terraform-state"
    key    = "network/terraform.tfstate"
    region = "us-east-1"
  }
}

# Use outputs from remote state
resource "aws_instance" "web" {
  subnet_id = data.terraform_remote_state.network.outputs.subnet_id
}
```

---

## 5. Variables & Outputs

### Variable Types

```hcl
# variables.tf

# String
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "development"
}

# Number
variable "instance_count" {
  description = "Number of instances"
  type        = number
  default     = 1
}

# Boolean
variable "enable_monitoring" {
  description = "Enable detailed monitoring"
  type        = bool
  default     = false
}

# List
variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b"]
}

# Map
variable "instance_types" {
  description = "Map of instance types by environment"
  type        = map(string)
  default = {
    development = "t3.micro"
    staging     = "t3.small"
    production  = "t3.large"
  }
}

# Object
variable "database_config" {
  description = "Database configuration"
  type = object({
    engine         = string
    engine_version = string
    instance_class = string
    storage_size   = number
    multi_az       = bool
  })
  default = {
    engine         = "postgres"
    engine_version = "15.3"
    instance_class = "db.t3.micro"
    storage_size   = 20
    multi_az       = false
  }
}

# Tuple
variable "network_config" {
  type    = tuple([string, number, bool])
  default = ["10.0.0.0/16", 3, true]
}

# Set
variable "allowed_ips" {
  type    = set(string)
  default = ["10.0.0.1", "10.0.0.2"]
}

# Any type
variable "tags" {
  type    = any
  default = {}
}

# Sensitive variable
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# Validation
variable "environment" {
  type = string
  
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "Environment must be development, staging, or production."
  }
}

variable "instance_count" {
  type = number
  
  validation {
    condition     = var.instance_count >= 1 && var.instance_count <= 10
    error_message = "Instance count must be between 1 and 10."
  }
}

# Nullable
variable "optional_value" {
  type     = string
  nullable = true
  default  = null
}
```

### Setting Variables

```bash
# Command line
terraform apply -var="environment=production"
terraform apply -var='users=["alice","bob"]'

# Variable file
terraform apply -var-file="production.tfvars"
terraform apply -var-file="secrets.tfvars"

# Auto-loaded files
# terraform.tfvars
# terraform.tfvars.json
# *.auto.tfvars
# *.auto.tfvars.json

# Environment variables
export TF_VAR_environment="production"
export TF_VAR_db_password="secret123"
```

```hcl
# terraform.tfvars
environment    = "production"
instance_count = 3
enable_monitoring = true

availability_zones = [
  "us-east-1a",
  "us-east-1b",
  "us-east-1c"
]

instance_types = {
  web     = "t3.small"
  api     = "t3.medium"
  worker  = "t3.large"
}

database_config = {
  engine         = "postgres"
  engine_version = "15.3"
  instance_class = "db.r6g.large"
  storage_size   = 100
  multi_az       = true
}
```

### Outputs

```hcl
# outputs.tf

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "List of public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "instance_public_ips" {
  description = "Map of instance names to public IPs"
  value       = { for k, v in aws_instance.web : k => v.public_ip }
}

output "database_endpoint" {
  description = "Database endpoint"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "load_balancer_dns" {
  description = "DNS name of load balancer"
  value       = aws_lb.main.dns_name
  
  depends_on = [aws_lb_listener.https]
}
```

```bash
# Query outputs
terraform output
terraform output vpc_id
terraform output -json
terraform output -raw vpc_id
```

---

## 6. Modules

### Module Structure

```
modules/
└── vpc/
    ├── main.tf
    ├── variables.tf
    ├── outputs.tf
    ├── versions.tf
    └── README.md
```

### Creating a Module

```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones"
  type        = list(string)
}

variable "tags" {
  description = "Tags to apply to resources"
  type        = map(string)
  default     = {}
}

# modules/vpc/main.tf
resource "aws_vpc" "this" {
  cidr_block           = var.cidr_block
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = merge(var.tags, {
    Name = "${var.name}-vpc"
  })
}

resource "aws_subnet" "public" {
  count = length(var.availability_zones)
  
  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.cidr_block, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true
  
  tags = merge(var.tags, {
    Name = "${var.name}-public-${count.index + 1}"
  })
}

resource "aws_subnet" "private" {
  count = length(var.availability_zones)
  
  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.cidr_block, 8, count.index + 100)
  availability_zone = var.availability_zones[count.index]
  
  tags = merge(var.tags, {
    Name = "${var.name}-private-${count.index + 1}"
  })
}

# modules/vpc/outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}
```

### Using Modules

```hcl
# main.tf

# Local module
module "vpc" {
  source = "./modules/vpc"
  
  name               = "myapp"
  cidr_block         = "10.0.0.0/16"
  availability_zones = ["us-east-1a", "us-east-1b"]
  
  tags = {
    Environment = "production"
    Project     = "myapp"
  }
}

# Public registry module
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"
  
  name = "my-vpc"
  cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  
  enable_nat_gateway = true
  single_nat_gateway = true
}

# GitHub module
module "example" {
  source = "github.com/org/terraform-module?ref=v1.0.0"
}

# Git module
module "example" {
  source = "git::https://github.com/org/repo.git//modules/example?ref=v1.0.0"
}

# Using module outputs
resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_ids[0]
}
```

---

## 7. Provisioners & Lifecycle

### Lifecycle Rules

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  lifecycle {
    # Create before destroy
    create_before_destroy = true
    
    # Prevent destruction
    prevent_destroy = true
    
    # Ignore changes
    ignore_changes = [
      tags,
      user_data,
    ]
    
    # Replace when changed
    replace_triggered_by = [
      null_resource.trigger.id
    ]
    
    # Custom conditions
    precondition {
      condition     = data.aws_ami.ubuntu.architecture == "x86_64"
      error_message = "AMI must be x86_64 architecture."
    }
    
    postcondition {
      condition     = self.public_ip != ""
      error_message = "Instance must have public IP."
    }
  }
}
```

### Provisioners (Use Sparingly)

```hcl
resource "aws_instance" "web" {
  ami           = var.ami_id
  instance_type = var.instance_type
  
  # File provisioner
  provisioner "file" {
    source      = "scripts/setup.sh"
    destination = "/tmp/setup.sh"
    
    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = self.public_ip
    }
  }
  
  # Remote-exec provisioner
  provisioner "remote-exec" {
    inline = [
      "chmod +x /tmp/setup.sh",
      "/tmp/setup.sh"
    ]
    
    connection {
      type        = "ssh"
      user        = "ubuntu"
      private_key = file(var.private_key_path)
      host        = self.public_ip
    }
  }
  
  # Local-exec provisioner
  provisioner "local-exec" {
    command = "echo ${self.public_ip} >> inventory.txt"
  }
  
  # Destroy-time provisioner
  provisioner "local-exec" {
    when    = destroy
    command = "echo 'Destroying instance' >> destroy-log.txt"
  }
}
```

### Null Resource & Triggers

```hcl
resource "null_resource" "cluster" {
  triggers = {
    cluster_instance_ids = join(",", aws_instance.web[*].id)
    config_hash          = filemd5("${path.module}/config.json")
  }
  
  provisioner "local-exec" {
    command = "./configure-cluster.sh ${join(" ", aws_instance.web[*].public_ip)}"
  }
}

# Terraform data for running scripts
resource "terraform_data" "setup" {
  triggers_replace = {
    instance_id = aws_instance.web.id
  }
  
  provisioner "remote-exec" {
    inline = ["echo 'Setup complete'"]
    
    connection {
      host = aws_instance.web.public_ip
      user = "ubuntu"
    }
  }
}
```

---

## 8. Workspaces & Environments

### Workspaces

```bash
# List workspaces
terraform workspace list

# Create workspace
terraform workspace new staging
terraform workspace new production

# Select workspace
terraform workspace select production

# Show current
terraform workspace show

# Delete workspace
terraform workspace delete staging
```

```hcl
# Use workspace in configuration
locals {
  environment = terraform.workspace
  
  instance_type = {
    default    = "t3.micro"
    staging    = "t3.small"
    production = "t3.large"
  }
}

resource "aws_instance" "web" {
  instance_type = lookup(local.instance_type, terraform.workspace, "t3.micro")
  
  tags = {
    Environment = terraform.workspace
  }
}

# Workspace-specific backend key
terraform {
  backend "s3" {
    bucket = "my-terraform-state"
    key    = "env/${terraform.workspace}/terraform.tfstate"
    region = "us-east-1"
  }
}
```

### Environment-based Structure

```
infrastructure/
├── modules/
│   └── vpc/
├── environments/
│   ├── production/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   └── development/
│       ├── main.tf
│       ├── variables.tf
│       ├── terraform.tfvars
│       └── backend.tf
└── global/
    └── iam/
```

---

## 9. Best Practices

### Code Organization

```hcl
# Standard file organization
# main.tf       - Main resources
# variables.tf  - Variable definitions
# outputs.tf    - Output definitions
# versions.tf   - Provider and Terraform versions
# locals.tf     - Local values
# data.tf       - Data sources
# backend.tf    - Backend configuration
```

### Naming Conventions

```hcl
# Resources: snake_case
resource "aws_vpc" "main" {}
resource "aws_security_group" "web_servers" {}

# Variables: snake_case
variable "instance_type" {}
variable "enable_monitoring" {}

# Outputs: snake_case
output "vpc_id" {}
output "public_subnet_ids" {}

# Locals: snake_case
locals {
  common_tags = {}
  name_prefix = ""
}
```

### Security Best Practices

```hcl
# Never commit secrets
# Use environment variables or secret management

# Use sensitive flag
variable "db_password" {
  type      = string
  sensitive = true
}

# Encrypt state
terraform {
  backend "s3" {
    encrypt = true
  }
}

# Use IAM roles instead of keys
provider "aws" {
  # Don't use access_key and secret_key
  # Use IAM roles or environment variables
}

# Validate inputs
variable "environment" {
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Invalid environment."
  }
}
```

---

## 10. CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/terraform.yml
name: Terraform

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  terraform:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: 1.6.0
      
      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: arn:aws:iam::123456789:role/terraform-role
          aws-region: us-east-1
      
      - name: Terraform Init
        run: terraform init
      
      - name: Terraform Format
        run: terraform fmt -check
      
      - name: Terraform Validate
        run: terraform validate
      
      - name: Terraform Plan
        run: terraform plan -out=tfplan
        if: github.event_name == 'pull_request'
      
      - name: Terraform Apply
        run: terraform apply -auto-approve tfplan
        if: github.ref == 'refs/heads/main'
```

### Quick Reference

```bash
# === WORKFLOW ===
terraform init
terraform validate
terraform fmt -recursive
terraform plan -out=tfplan
terraform apply tfplan
terraform destroy

# === STATE ===
terraform state list
terraform state show resource
terraform import resource id
terraform state rm resource

# === WORKSPACES ===
terraform workspace list
terraform workspace new env
terraform workspace select env

# === DEBUG ===
TF_LOG=DEBUG terraform plan
terraform console
terraform graph | dot -Tpng > graph.png
```

---

*This guide covers Terraform comprehensively. Continue to the Ansible guide for Configuration Management.*
