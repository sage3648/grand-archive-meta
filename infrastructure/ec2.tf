# EC2 instance for the API server
resource "aws_instance" "api_server" {
  ami                    = data.aws_ami.ubuntu_arm64.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.api_server.id]

  # Enable public IP
  associate_public_ip_address = true

  # Root volume configuration
  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.project_name}-root-volume"
      Environment = var.environment
      Project     = var.project_name
    }
  }

  # User data script for initial setup
  user_data = templatefile("${path.module}/user_data.sh", {
    api_port = var.api_port
  })

  # Enable detailed monitoring (additional cost, but useful for production)
  monitoring = true

  # Metadata options for enhanced security
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required" # Require IMDSv2
    http_put_response_hop_limit = 1
    instance_metadata_tags      = "enabled"
  }

  tags = {
    Name        = "grand-archive-api-server"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
    Purpose     = "API Server"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# Elastic IP for stable public IP address
resource "aws_eip" "api_server" {
  instance = aws_instance.api_server.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-api-eip"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }

  depends_on = [aws_instance.api_server]
}

# CloudWatch alarm for CPU utilization
resource "aws_cloudwatch_metric_alarm" "cpu_utilization" {
  alarm_name          = "${var.project_name}-api-server-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "This metric monitors ec2 cpu utilization"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    InstanceId = aws_instance.api_server.id
  }

  tags = {
    Name        = "${var.project_name}-cpu-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}

# CloudWatch alarm for status checks
resource "aws_cloudwatch_metric_alarm" "instance_health" {
  alarm_name          = "${var.project_name}-api-server-health"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = 300
  statistic           = "Average"
  threshold           = 0
  alarm_description   = "This metric monitors EC2 instance health"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    InstanceId = aws_instance.api_server.id
  }

  tags = {
    Name        = "${var.project_name}-health-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}
