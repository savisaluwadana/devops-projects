# 🔄 Terraform Modules

Build reusable infrastructure modules with Terraform.

## 🎯 Learning Objectives
- Create modular infrastructure
- Design reusable modules
- Manage module versions
- Implement module composition

---

## Lab 1: Module Structure

### Directory Layout
```
terraform/
├── modules/
│   ├── vpc/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── eks/
│   └── rds/
├── environments/
│   ├── dev/
│   ├── staging/
│   └── production/
└── global/
```

### VPC Module
```hcl
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
  count = length(var.public_subnets)

  vpc_id                  = aws_vpc.this.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.name}-public-${count.index + 1}"
  })
}

resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.this.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.name}-private-${count.index + 1}"
  })
}
```

### Variables
```hcl
# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix"
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet CIDRs"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnet CIDRs"
  type        = list(string)
}

variable "tags" {
  description = "Resource tags"
  type        = map(string)
  default     = {}
}
```

### Outputs
```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}
```

---

## Lab 2: Using Modules

### Environment Config
```hcl
# environments/production/main.tf
module "vpc" {
  source = "../../modules/vpc"

  name       = "prod"
  cidr_block = "10.0.0.0/16"
  azs        = ["us-east-1a", "us-east-1b", "us-east-1c"]
  
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  
  tags = {
    Environment = "production"
    Terraform   = "true"
  }
}

module "eks" {
  source = "../../modules/eks"

  cluster_name    = "prod-cluster"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  node_count      = 3
  instance_type   = "t3.large"
}
```

---

## Lab 3: Public Modules

### Using Registry Modules
```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.1.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}
```

---

## Lab 4: Module Composition

### Root Module
```hcl
# Complete infrastructure
module "networking" {
  source = "./modules/vpc"
  # ...
}

module "database" {
  source = "./modules/rds"
  
  vpc_id     = module.networking.vpc_id
  subnet_ids = module.networking.private_subnet_ids
}

module "kubernetes" {
  source = "./modules/eks"
  
  vpc_id     = module.networking.vpc_id
  subnet_ids = module.networking.private_subnet_ids
  
  depends_on = [module.networking]
}

module "applications" {
  source = "./modules/helm-releases"
  
  cluster_endpoint = module.kubernetes.cluster_endpoint
  
  depends_on = [module.kubernetes]
}
```

---

## ✅ Completion Checklist
- [ ] Created VPC module
- [ ] Implemented variables and outputs
- [ ] Used modules in environments
- [ ] Integrated public modules
- [ ] Composed multiple modules
