output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_instance.api_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the EC2 instance"
  value       = aws_instance.api_server.public_dns
}

output "ec2_instance_id" {
  description = "Instance ID of the EC2 server"
  value       = aws_instance.api_server.id
}

output "api_gateway_url" {
  description = "URL of the API Gateway endpoint"
  value       = aws_api_gateway_deployment.prod.invoke_url
}

output "api_gateway_id" {
  description = "ID of the API Gateway REST API"
  value       = aws_api_gateway_rest_api.main.id
}

output "nameservers_primary" {
  description = "Name servers for primary domain (grandarchivemeta.com)"
  value       = aws_route53_zone.primary.name_servers
}

output "nameservers_secondary" {
  description = "Name servers for secondary domain (grandarchivemeta.net)"
  value       = aws_route53_zone.secondary.name_servers
}

output "primary_zone_id" {
  description = "Route53 Hosted Zone ID for primary domain"
  value       = aws_route53_zone.primary.zone_id
}

output "secondary_zone_id" {
  description = "Route53 Hosted Zone ID for secondary domain"
  value       = aws_route53_zone.secondary.zone_id
}

output "security_group_id" {
  description = "Security group ID for the API server"
  value       = aws_security_group.api_server.id
}

output "ssh_command" {
  description = "SSH command to connect to the EC2 instance"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${aws_instance.api_server.public_ip}"
}

output "api_endpoint" {
  description = "Custom domain API endpoint URL"
  value       = "https://api.${var.domain_name}"
}
