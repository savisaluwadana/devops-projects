# 🌐 Terraform AWS VPC Infrastructure

Build production-ready AWS VPC infrastructure with Terraform.

## 🎯 Learning Objectives

- Design multi-AZ VPC architecture
- Create public and private subnets
- Configure NAT Gateways and routing
- Implement security groups and NACLs
- Use Terraform modules

## 📋 Prerequisites

- AWS account
- Terraform installed
- AWS CLI configured

## 🏗️ VPC Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AWS VPC (10.0.0.0/16)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   AVAILABILITY ZONE A                     │   │
│  │  ┌────────────────┐    ┌────────────────┐                │   │
│  │  │ Public Subnet  │    │ Private Subnet │                │   │
│  │  │  10.0.1.0/24   │    │  10.0.10.0/24  │                │   │
│  │  │ ┌──────────┐   │    │ ┌──────────┐   │                │   │
│  │  │ │   ALB    │   │    │ │   App    │   │                │   │
│  │  │ │   NAT    │   │    │ │   RDS    │   │                │   │
│  │  │ └──────────┘   │    │ └──────────┘   │                │   │
│  │  └────────────────┘    └────────────────┘                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   AVAILABILITY ZONE B                     │   │
│  │  ┌────────────────┐    ┌────────────────┐                │   │
│  │  │ Public Subnet  │    │ Private Subnet │                │   │
│  │  │  10.0.2.0/24   │    │  10.0.20.0/24  │                │   │
│  │  │ ┌──────────┐   │    │ ┌──────────┐   │                │   │
│  │  │ │   ALB    │   │    │ │   App    │   │                │   │
│  │  │ │   NAT    │   │    │ │   RDS    │   │                │   │
│  │  │ └──────────┘   │    │ └──────────┘   │                │   │
│  │  └────────────────┘    └────────────────┘                │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Internet Gateway ◄────► Public Route Tables                    │
│  NAT Gateways     ◄────► Private Route Tables                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## 🔬 Hands-On Labs

### Lab 1: Project Structure

```bash
mkdir -p terraform-aws-vpc/{modules/vpc,environments/{dev,prod}}
cd terraform-aws-vpc
```

```
terraform-aws-vpc/
├── modules/
│   └── vpc/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── prod/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── README.md
```

### Lab 2: VPC Module

```hcl
# modules/vpc/versions.tf
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# modules/vpc/variables.tf
variable "name" {
  description = "Name prefix for resources"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones"
  type        = list(string)
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Enable NAT Gateway"
  type        = bool
  default     = true
}

variable "single_nat_gateway" {
  description = "Use single NAT (cheaper, less HA)"
  type        = bool
  default     = false
}

variable "tags" {
  description = "Tags for resources"
  type        = map(string)
  default     = {}
}
```

```hcl
# modules/vpc/main.tf

#--------------------------------
# VPC
#--------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = merge(var.tags, {
    Name = "${var.name}-vpc"
  })
}

#--------------------------------
# Internet Gateway
#--------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.name}-igw"
  })
}

#--------------------------------
# Public Subnets
#--------------------------------
resource "aws_subnet" "public" {
  count = length(var.public_subnets)

  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnets[count.index]
  availability_zone       = var.azs[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, {
    Name = "${var.name}-public-${var.azs[count.index]}"
    Type = "public"
    "kubernetes.io/role/elb" = "1"  # For K8s ALB Ingress
  })
}

#--------------------------------
# Private Subnets
#--------------------------------
resource "aws_subnet" "private" {
  count = length(var.private_subnets)

  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnets[count.index]
  availability_zone = var.azs[count.index]

  tags = merge(var.tags, {
    Name = "${var.name}-private-${var.azs[count.index]}"
    Type = "private"
    "kubernetes.io/role/internal-elb" = "1"
  })
}

#--------------------------------
# Elastic IPs for NAT
#--------------------------------
resource "aws_eip" "nat" {
  count  = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 0
  domain = "vpc"

  tags = merge(var.tags, {
    Name = "${var.name}-nat-eip-${count.index + 1}"
  })

  depends_on = [aws_internet_gateway.main]
}

#--------------------------------
# NAT Gateways
#--------------------------------
resource "aws_nat_gateway" "main" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 0

  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.tags, {
    Name = "${var.name}-nat-${count.index + 1}"
  })

  depends_on = [aws_internet_gateway.main]
}

#--------------------------------
# Route Tables - Public
#--------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.tags, {
    Name = "${var.name}-public-rt"
  })
}

resource "aws_route_table_association" "public" {
  count = length(var.public_subnets)

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

#--------------------------------
# Route Tables - Private
#--------------------------------
resource "aws_route_table" "private" {
  count  = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 1
  vpc_id = aws_vpc.main.id

  tags = merge(var.tags, {
    Name = "${var.name}-private-rt-${count.index + 1}"
  })
}

resource "aws_route" "private_nat" {
  count = var.enable_nat_gateway ? (var.single_nat_gateway ? 1 : length(var.azs)) : 0

  route_table_id         = aws_route_table.private[count.index].id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.main[var.single_nat_gateway ? 0 : count.index].id
}

resource "aws_route_table_association" "private" {
  count = length(var.private_subnets)

  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[var.single_nat_gateway ? 0 : count.index].id
}

#--------------------------------
# VPC Flow Logs
#--------------------------------
resource "aws_flow_log" "main" {
  vpc_id          = aws_vpc.main.id
  traffic_type    = "ALL"
  iam_role_arn    = aws_iam_role.flow_log.arn
  log_destination = aws_cloudwatch_log_group.flow_log.arn

  tags = merge(var.tags, {
    Name = "${var.name}-flow-log"
  })
}

resource "aws_cloudwatch_log_group" "flow_log" {
  name              = "/aws/vpc/${var.name}-flow-logs"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_iam_role" "flow_log" {
  name = "${var.name}-vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "vpc-flow-logs.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_role_policy" "flow_log" {
  name = "${var.name}-vpc-flow-log-policy"
  role = aws_iam_role.flow_log.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ]
      Effect   = "Allow"
      Resource = "*"
    }]
  })
}
```

```hcl
# modules/vpc/outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "vpc_cidr" {
  description = "VPC CIDR block"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "nat_gateway_ips" {
  description = "NAT Gateway public IPs"
  value       = aws_eip.nat[*].public_ip
}

output "internet_gateway_id" {
  description = "Internet Gateway ID"
  value       = aws_internet_gateway.main.id
}
```

### Lab 3: Environment Configuration

```hcl
# environments/dev/main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket         = "my-terraform-state"
    key            = "dev/vpc/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Environment = "dev"
      ManagedBy   = "terraform"
      Project     = "infrastructure"
    }
  }
}

module "vpc" {
  source = "../../modules/vpc"

  name     = "dev"
  vpc_cidr = "10.0.0.0/16"
  
  azs             = ["us-east-1a", "us-east-1b"]
  public_subnets  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnets = ["10.0.10.0/24", "10.0.20.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true  # Cost savings for dev

  tags = {
    Environment = "dev"
  }
}

# Security Group for bastion
resource "aws_security_group" "bastion" {
  name        = "dev-bastion-sg"
  description = "Security group for bastion host"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["YOUR_IP/32"]  # Replace with your IP
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "dev-bastion-sg"
  }
}

# Security Group for applications
resource "aws_security_group" "app" {
  name        = "dev-app-sg"
  description = "Security group for applications"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "dev-app-sg"
  }
}

resource "aws_security_group" "alb" {
  name        = "dev-alb-sg"
  description = "Security group for ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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

  tags = {
    Name = "dev-alb-sg"
  }
}
```

```hcl
# environments/dev/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
```

```hcl
# environments/dev/terraform.tfvars
aws_region = "us-east-1"
```

### Lab 4: Deploy and Validate

```bash
cd environments/dev

# Initialize
terraform init

# Plan
terraform plan -out=tfplan

# Apply
terraform apply tfplan

# Verify
aws ec2 describe-vpcs --filters "Name=tag:Name,Values=dev-vpc"
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxx"

# Test connectivity (from EC2 in private subnet)
# 1. Should be able to reach internet via NAT
# 2. Should not be reachable from internet directly
```

### Lab 5: Production Configuration

```hcl
# environments/prod/main.tf
module "vpc" {
  source = "../../modules/vpc"

  name     = "prod"
  vpc_cidr = "10.1.0.0/16"
  
  # 3 AZs for high availability
  azs             = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets  = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnets = ["10.1.10.0/24", "10.1.20.0/24", "10.1.30.0/24"]

  # NAT Gateway per AZ for HA
  enable_nat_gateway = true
  single_nat_gateway = false  # HA for prod

  tags = {
    Environment = "production"
    CostCenter  = "PROD-001"
  }
}
```

## ✅ Completion Checklist

- [ ] Create VPC module structure
- [ ] Configure public and private subnets
- [ ] Set up Internet Gateway
- [ ] Configure NAT Gateways
- [ ] Create route tables
- [ ] Enable VPC Flow Logs
- [ ] Create security groups
- [ ] Deploy dev environment
- [ ] Deploy prod environment (multi-AZ)

## 📚 Resources

- [Terraform AWS VPC Module](https://registry.terraform.io/modules/terraform-aws-modules/vpc/aws/latest)
- [AWS VPC Best Practices](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-best-practices.html)

---

**Next Project:** [ELK Logging](../../02-intermediate/elk-logging/)
