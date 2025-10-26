# Route53 hosted zone for primary domain
resource "aws_route53_zone" "primary" {
  name    = var.domain_name
  comment = "Managed by Terraform - Primary domain for Grand Archive Meta"

  tags = {
    Name        = "${var.project_name}-primary-zone"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# Route53 hosted zone for secondary domain
resource "aws_route53_zone" "secondary" {
  name    = var.domain_name_secondary
  comment = "Managed by Terraform - Secondary domain for Grand Archive Meta (redirect)"

  tags = {
    Name        = "${var.project_name}-secondary-zone"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# A record for API subdomain pointing to API Gateway
resource "aws_route53_record" "api" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "api.${var.domain_name}"
  type    = "A"

  alias {
    name                   = aws_api_gateway_domain_name.api.regional_domain_name
    zone_id                = aws_api_gateway_domain_name.api.regional_zone_id
    evaluate_target_health = true
  }
}

# CNAME record for root domain pointing to Vercel
resource "aws_route53_record" "root_cname" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "CNAME"
  ttl     = 300
  records = [var.vercel_cname_target]
}

# CNAME record for www subdomain pointing to Vercel
resource "aws_route53_record" "www_cname" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = "www.${var.domain_name}"
  type    = "CNAME"
  ttl     = 300
  records = [var.vercel_cname_target]
}

# CNAME record for secondary domain root pointing to Vercel (redirect)
resource "aws_route53_record" "secondary_root_cname" {
  zone_id = aws_route53_zone.secondary.zone_id
  name    = var.domain_name_secondary
  type    = "CNAME"
  ttl     = 300
  records = [var.vercel_cname_target]
}

# CNAME record for www on secondary domain pointing to Vercel (redirect)
resource "aws_route53_record" "secondary_www_cname" {
  zone_id = aws_route53_zone.secondary.zone_id
  name    = "www.${var.domain_name_secondary}"
  type    = "CNAME"
  ttl     = 300
  records = [var.vercel_cname_target]
}

# TXT record for domain verification (optional)
resource "aws_route53_record" "verification_txt" {
  zone_id = aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "TXT"
  ttl     = 300
  records = [
    "v=spf1 -all" # Prevents email spoofing
  ]
}

# Health check for API endpoint
resource "aws_route53_health_check" "api" {
  fqdn              = "api.${var.domain_name}"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/api/health"
  failure_threshold = 3
  request_interval  = 30

  tags = {
    Name        = "${var.project_name}-api-health-check"
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "terraform"
  }
}

# CloudWatch alarm for Route53 health check
resource "aws_cloudwatch_metric_alarm" "api_health_check" {
  alarm_name          = "${var.project_name}-api-health-check-alarm"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HealthCheckStatus"
  namespace           = "AWS/Route53"
  period              = 60
  statistic           = "Minimum"
  threshold           = 1
  alarm_description   = "This metric monitors API endpoint health"
  alarm_actions       = [] # Add SNS topic ARN here for notifications

  dimensions = {
    HealthCheckId = aws_route53_health_check.api.id
  }

  tags = {
    Name        = "${var.project_name}-api-health-alarm"
    Environment = var.environment
    Project     = var.project_name
  }
}
