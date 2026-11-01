terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 1. Custom Virtual Private Cloud (VPC)
resource "aws_vpc" "taskflow_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project_name}-vpc"
  }
}

# 2. Internet Gateway for External Routing
resource "aws_internet_gateway" "taskflow_igw" {
  vpc_id = aws_vpc.taskflow_vpc.id

  tags = {
    Name = "${var.project_name}-igw"
  }
}

# 3. Public Subnet for Application & CI/CD Nodes
resource "aws_subnet" "taskflow_public_subnet" {
  vpc_id                  = aws_vpc.taskflow_vpc.id
  cidr_block              = var.public_subnet_cidr
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet"
  }
}

# 4. Route Table Routing to Internet Gateway
resource "aws_route_table" "taskflow_public_rt" {
  vpc_id = aws_vpc.taskflow_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.taskflow_igw.id
  }

  tags = {
    Name = "${var.project_name}-public-rt"
  }
}

# 5. Route Table Association
resource "aws_route_table_association" "taskflow_public_assoc" {
  subnet_id      = aws_subnet.taskflow_public_subnet.id
  route_table_id = aws_route_table.taskflow_public_rt.id
}
