variable "aws_region" {
  description = "AWS region for resource deployment"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type for API server"
  type        = string
  default     = "t4g.small"
}

variable "key_name" {
  description = "SSH key pair name for EC2 instance access"
  type        = string
}

variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "grandarchivemeta.com"
}

variable "domain_name_secondary" {
  description = "Secondary domain name for the application"
  type        = string
  default     = "grandarchivemeta.net"
}

variable "vercel_cname_target" {
  description = "Vercel CNAME target for frontend deployment"
  type        = string
  default     = "cname.vercel-dns.com"
}

variable "api_port" {
  description = "Port number for the API server"
  type        = number
  default     = 8080
}

variable "ssh_allowed_cidr" {
  description = "CIDR blocks allowed to SSH to the EC2 instance"
  type        = list(string)
  default     = ["0.0.0.0/0"] # WARNING: Restrict this in production
}

variable "root_volume_size" {
  description = "Size of the root EBS volume in GB"
  type        = number
  default     = 20
}

variable "environment" {
  description = "Environment name (e.g., prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "project_name" {
  description = "Project name for resource tagging"
  type        = string
  default     = "grand-archive-meta"
}
