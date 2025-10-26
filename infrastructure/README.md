# Grand Archive Meta - AWS Infrastructure

This directory contains Terraform configurations for deploying the Grand Archive Meta application infrastructure on AWS.

## Architecture Overview

The infrastructure consists of:

- **EC2 Instance**: ARM64-based t4g.small instance running Ubuntu 22.04 LTS for the API server
- **API Gateway**: REST API with edge-optimized distribution for API requests
- **Route53**: DNS management for both primary and secondary domains
- **Security Groups**: Network security controls for EC2 instance
- **CloudWatch**: Monitoring and alerting for infrastructure health
- **ACM**: SSL/TLS certificates for custom domains

## Prerequisites

### Required Tools

1. **Terraform** (>= 1.0)
   ```bash
   # Install via Homebrew (macOS)
   brew install terraform

   # Or download from https://www.terraform.io/downloads
   ```

2. **AWS CLI** (>= 2.0)
   ```bash
   # Install via Homebrew (macOS)
   brew install awscli

   # Configure with your credentials
   aws configure
   ```

### AWS Account Requirements

1. **AWS Account** with appropriate permissions
2. **IAM User** with permissions for:
   - EC2 (instances, security groups, EIPs)
   - API Gateway (REST APIs, deployments, custom domains)
   - Route53 (hosted zones, records, health checks)
   - ACM (certificates)
   - CloudWatch (alarms, logs)
   - VPC (default VPC access)

3. **SSH Key Pair** created in AWS EC2:
   ```bash
   # Create a new key pair
   aws ec2 create-key-pair \
     --key-name grand-archive-key \
     --query 'KeyMaterial' \
     --output text > ~/.ssh/grand-archive-key.pem

   # Set proper permissions
   chmod 400 ~/.ssh/grand-archive-key.pem
   ```

4. **Domain Names**:
   - grandarchivemeta.com
   - grandarchivemeta.net

   Note: You'll need to update your domain registrar's nameservers after deployment.

## File Structure

```
infrastructure/
├── main.tf                 # Provider configuration and data sources
├── variables.tf            # Input variables and their defaults
├── outputs.tf              # Output values after deployment
├── ec2.tf                  # EC2 instance, EIP, and CloudWatch alarms
├── api_gateway.tf          # API Gateway REST API with CORS support
├── route53.tf              # DNS zones, records, and health checks
├── security_groups.tf      # Security group rules for EC2
├── user_data.sh            # EC2 initialization script
└── README.md               # This file
```

## Setup Instructions

### 1. Initialize Terraform

```bash
cd infrastructure
terraform init
```

This will download the required AWS provider plugins.

### 2. Create a Variables File

Create a `terraform.tfvars` file with your specific configuration:

```hcl
# Required variables
key_name = "grand-archive-key"  # Your SSH key pair name

# Optional overrides (defaults are usually fine)
aws_region              = "us-east-1"
instance_type           = "t4g.small"
domain_name             = "grandarchivemeta.com"
domain_name_secondary   = "grandarchivemeta.net"
vercel_cname_target     = "cname.vercel-dns.com"
environment             = "prod"

# Security: Restrict SSH access to your IP
ssh_allowed_cidr = ["YOUR_IP_ADDRESS/32"]
```

**Important**: Replace `YOUR_IP_ADDRESS` with your actual IP address for better security.

### 3. Review the Deployment Plan

```bash
terraform plan
```

This shows what resources will be created. Review carefully before proceeding.

### 4. Deploy the Infrastructure

```bash
terraform apply
```

Type `yes` when prompted to confirm the deployment.

The deployment will take approximately 5-10 minutes.

### 5. Retrieve Outputs

After successful deployment:

```bash
terraform output
```

This will display:
- EC2 public IP address
- API Gateway URL
- Route53 nameservers
- SSH command

### 6. Update Domain Nameservers

Update your domain registrar with the nameservers from the Terraform outputs:

```bash
terraform output nameservers_primary
terraform output nameservers_secondary
```

Configure both domains to use the respective AWS Route53 nameservers.

**Note**: DNS propagation can take 24-48 hours.

## Post-Deployment Configuration

### 1. Connect to EC2 Instance

```bash
# Get the SSH command from outputs
terraform output ssh_command

# Or manually connect
ssh -i ~/.ssh/grand-archive-key.pem ubuntu@<EC2_PUBLIC_IP>
```

### 2. Deploy Application

The EC2 instance includes a deployment helper script:

```bash
# On the EC2 instance
sudo /usr/local/bin/deploy-api.sh <YOUR_REPO_URL>
```

Or manually deploy:

```bash
cd /opt/grand-archive-api
git clone <YOUR_REPO_URL> .
npm ci --production
sudo systemctl start grand-archive-api
sudo systemctl enable grand-archive-api
```

### 3. Verify API Gateway

Test the API Gateway endpoint:

```bash
# Via API Gateway direct URL
curl $(terraform output -raw api_gateway_url)/api/health

# Via custom domain (after DNS propagation)
curl https://api.grandarchivemeta.com/api/health
```

### 4. Configure Monitoring

Set up SNS topics for CloudWatch alarms:

1. Create an SNS topic for alerts
2. Subscribe your email/phone to the topic
3. Update the alarm configurations in `ec2.tf` and `route53.tf` to use the SNS topic ARN
4. Run `terraform apply` to update

## Configuration Notes

### EC2 Instance

- **Instance Type**: t4g.small (ARM64, 2 vCPU, 2 GB RAM)
- **Cost**: ~$13/month with on-demand pricing
- **OS**: Ubuntu 22.04 LTS ARM64
- **Storage**: 20 GB gp3 EBS volume (encrypted)
- **Monitoring**: Detailed CloudWatch monitoring enabled

Pre-installed software:
- Docker & Docker Compose
- Node.js 20.x LTS
- PM2 process manager
- CloudWatch agent
- UFW firewall
- Automatic security updates

### API Gateway

- **Type**: REST API (edge-optimized)
- **CORS**: Enabled with Set-Cookie passthrough
- **Timeout**: 29 seconds (AWS maximum)
- **Logging**: CloudWatch logs (30-day retention)
- **Tracing**: X-Ray enabled
- **Custom Domain**: api.grandarchivemeta.com with ACM certificate

### Security

**Security Groups**:
- Port 22 (SSH): Configurable via `ssh_allowed_cidr`
- Port 80 (HTTP): Open (for Let's Encrypt)
- Port 443 (HTTPS): Open
- Port 8080 (API): Open
- Outbound: All traffic allowed

**Best Practices**:
- Restrict SSH access to specific IP addresses
- Enable MFA on AWS account
- Rotate SSH keys regularly
- Review CloudWatch logs regularly
- Keep the EC2 instance updated

### DNS Configuration

**Primary Domain (grandarchivemeta.com)**:
- Root: → Vercel (frontend)
- www: → Vercel (frontend)
- api: → API Gateway

**Secondary Domain (grandarchivemeta.net)**:
- Root: → Vercel (redirect to .com)
- www: → Vercel (redirect to .com)

**Health Checks**:
- API endpoint monitored every 30 seconds
- Failures trigger CloudWatch alarms

## Cost Estimates

Monthly cost estimates (us-east-1):

| Service | Description | Estimated Cost |
|---------|-------------|----------------|
| EC2 (t4g.small) | 730 hours/month | $13.14 |
| EBS (gp3 20GB) | Storage | $1.60 |
| Elastic IP | 1 IP address | $0.00 (attached) |
| API Gateway | First 333M requests free, then $3.50/M | $0-10 |
| Route53 Hosted Zones | 2 zones × $0.50 | $1.00 |
| Route53 Queries | First 1B queries free | $0.00 |
| CloudWatch Logs | 5GB ingestion, 30-day retention | $2.50 |
| ACM Certificates | Public certificates | $0.00 |
| Data Transfer | Out to internet (first 100GB free) | $0-9 |

**Total Estimated Monthly Cost**: $18-37/month

Notes:
- Costs vary based on traffic and usage
- Consider AWS Free Tier if eligible
- Use AWS Cost Explorer for actual costs
- Consider Reserved Instances for 40-60% savings on EC2

## Maintenance

### Updating Infrastructure

1. Modify Terraform files as needed
2. Review changes: `terraform plan`
3. Apply changes: `terraform apply`

### Updating Application

```bash
# SSH into EC2 instance
ssh -i ~/.ssh/grand-archive-key.pem ubuntu@<EC2_IP>

# Pull latest changes
cd /opt/grand-archive-api
git pull

# Install dependencies
npm ci --production

# Restart service
sudo systemctl restart grand-archive-api
```

### Monitoring

Check CloudWatch dashboards:
```bash
# View recent logs
aws logs tail /aws/apigateway/grand-archive-meta --follow

# Check EC2 instance metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<INSTANCE_ID> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

### Backups

Consider implementing:
1. EBS snapshots for data persistence
2. Database backups (if using RDS in the future)
3. Application code stored in Git

### Scaling Considerations

For increased traffic:
1. Upgrade instance type (t4g.medium, t4g.large)
2. Add Application Load Balancer
3. Implement Auto Scaling groups
4. Consider containerization with ECS/EKS
5. Add ElastiCache for caching
6. Use RDS for database (if needed)

## Destroying Infrastructure

**Warning**: This will permanently delete all resources.

```bash
terraform destroy
```

Type `yes` to confirm.

Note: Some resources like Route53 hosted zones may have a small delay before deletion completes.

## Troubleshooting

### Issue: SSH Connection Refused

**Solution**:
- Verify security group allows your IP
- Check instance is running: `aws ec2 describe-instances`
- Verify key permissions: `chmod 400 ~/.ssh/grand-archive-key.pem`

### Issue: API Gateway 502 Bad Gateway

**Solution**:
- Check EC2 instance is running
- Verify application is listening on port 8080
- Check security group allows port 8080
- Review application logs: `sudo journalctl -u grand-archive-api -f`

### Issue: DNS Not Resolving

**Solution**:
- Verify nameservers are updated at registrar
- Wait for DNS propagation (up to 48 hours)
- Test with: `dig api.grandarchivemeta.com`
- Check Route53 records are created correctly

### Issue: Certificate Validation Pending

**Solution**:
- DNS validation can take 30-60 minutes
- Verify DNS records exist: `dig _acm-validation.api.grandarchivemeta.com`
- Check ACM console for validation status

## Support and Documentation

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [AWS Route53 Documentation](https://docs.aws.amazon.com/route53/)

## License

This infrastructure code is part of the Grand Archive Meta project.
