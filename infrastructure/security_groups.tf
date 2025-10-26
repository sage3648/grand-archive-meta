# Security group for the API server EC2 instance
resource "aws_security_group" "api_server" {
  name        = "${var.project_name}-api-server-sg"
  description = "Security group for Grand Archive API server"
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name        = "${var.project_name}-api-server-sg"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Ingress rule: Allow API traffic on port 8080
resource "aws_vpc_security_group_ingress_rule" "api_port" {
  security_group_id = aws_security_group.api_server.id
  description       = "Allow API traffic on port ${var.api_port}"

  from_port   = var.api_port
  to_port     = var.api_port
  ip_protocol = "tcp"
  cidr_ipv4   = "0.0.0.0/0"

  tags = {
    Name = "allow-api-${var.api_port}"
  }
}

# Ingress rule: Allow SSH traffic on port 22
resource "aws_vpc_security_group_ingress_rule" "ssh" {
  security_group_id = aws_security_group.api_server.id
  description       = "Allow SSH access"

  from_port   = 22
  to_port     = 22
  ip_protocol = "tcp"
  cidr_ipv4   = var.ssh_allowed_cidr[0]

  tags = {
    Name = "allow-ssh"
  }
}

# Ingress rule: Allow HTTPS (443) - useful if running a reverse proxy
resource "aws_vpc_security_group_ingress_rule" "https" {
  security_group_id = aws_security_group.api_server.id
  description       = "Allow HTTPS traffic"

  from_port   = 443
  to_port     = 443
  ip_protocol = "tcp"
  cidr_ipv4   = "0.0.0.0/0"

  tags = {
    Name = "allow-https"
  }
}

# Ingress rule: Allow HTTP (80) - useful for Let's Encrypt challenges
resource "aws_vpc_security_group_ingress_rule" "http" {
  security_group_id = aws_security_group.api_server.id
  description       = "Allow HTTP traffic"

  from_port   = 80
  to_port     = 80
  ip_protocol = "tcp"
  cidr_ipv4   = "0.0.0.0/0"

  tags = {
    Name = "allow-http"
  }
}

# Egress rule: Allow all outbound traffic
resource "aws_vpc_security_group_egress_rule" "all_outbound" {
  security_group_id = aws_security_group.api_server.id
  description       = "Allow all outbound traffic"

  ip_protocol = "-1"
  cidr_ipv4   = "0.0.0.0/0"

  tags = {
    Name = "allow-all-outbound"
  }
}
