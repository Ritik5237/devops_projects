variable "aws_region" {
  description = "The AWS region where resources will be provisioned"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project used for tagging and resource naming"
  type        = string
  default     = "taskflow"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, production)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 instance size for the TaskFlow cluster nodes"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Name of the AWS KeyPair for SSH access"
  type        = string
  default     = "taskflow-devops-key"
}
