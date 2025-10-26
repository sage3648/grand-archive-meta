# Grand Archive Meta - Infrastructure Architecture

## Overview

This document describes the AWS infrastructure architecture for the Grand Archive Meta application.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud (us-east-1)                    │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Route 53 DNS                           │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ grandarchivemeta.com → Vercel (Frontend)             │  │ │
│  │  │ www.grandarchivemeta.com → Vercel                    │  │ │
│  │  │ api.grandarchivemeta.com → API Gateway               │  │ │
│  │  │ grandarchivemeta.net → Vercel (Redirect)             │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                  │
│                                ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              ACM Certificate Manager (SSL)                  │ │
│  │              api.grandarchivemeta.com cert                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                  │
│                                ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Gateway (EDGE)                       │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ REST API: /api/{proxy+}                              │  │ │
│  │  │ Methods: ANY, OPTIONS                                │  │ │
│  │  │ Integration: HTTP_PROXY                              │  │ │
│  │  │ CORS: Enabled (with Set-Cookie support)             │  │ │
│  │  │ Stage: prod                                          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                │                                  │
│                                ▼                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Default VPC                            │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │              Security Group                          │  │ │
│  │  │  Ingress: 22 (SSH), 80 (HTTP), 443 (HTTPS), 8080   │  │ │
│  │  │  Egress: All traffic                                │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  │                       │                                      │ │
│  │                       ▼                                      │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │            EC2 Instance (t4g.small)                  │  │ │
│  │  │  ┌────────────────────────────────────────────────┐  │  │ │
│  │  │  │ Ubuntu 22.04 LTS ARM64                         │  │  │ │
│  │  │  │ - Node.js 20.x LTS                            │  │  │ │
│  │  │  │ - Docker & Docker Compose                     │  │  │ │
│  │  │  │ - PM2 Process Manager                         │  │  │ │
│  │  │  │ - CloudWatch Agent                            │  │  │ │
│  │  │  │                                               │  │  │ │
│  │  │  │ Application: /opt/grand-archive-api           │  │  │ │
│  │  │  │ Service: grand-archive-api.service           │  │  │ │
│  │  │  │ Port: 8080                                    │  │  │ │
│  │  │  └────────────────────────────────────────────────┘  │  │ │
│  │  │                                                      │  │ │
│  │  │  Elastic IP: (Static Public IP)                     │  │ │
│  │  │  EBS Volume: 20GB gp3 (encrypted)                   │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     CloudWatch                              │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Metrics: CPU, Memory, Network, Status Checks        │  │ │
│  │  │ Logs: API Gateway, Application, System              │  │ │
│  │  │ Alarms: CPU High, Instance Health, API Health       │  │ │
│  │  │ Retention: 30 days                                  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

External Services:
┌─────────────────┐         ┌──────────────────┐
│     Vercel      │         │   Domain         │
│   (Frontend)    │         │   Registrar      │
│                 │         │   (NS records)   │
└─────────────────┘         └──────────────────┘
```

## Traffic Flow

### Frontend Traffic
1. User visits `https://grandarchivemeta.com`
2. Route 53 resolves to Vercel's CNAME target
3. Vercel serves the frontend application

### API Traffic
1. Frontend makes request to `https://api.grandarchivemeta.com/api/*`
2. Route 53 resolves to API Gateway regional endpoint
3. API Gateway applies CORS and routing rules
4. Request proxied to EC2 instance on port 8080
5. EC2 instance processes request and returns response
6. Response flows back through API Gateway to client

### SSL/TLS Flow
1. API Gateway uses ACM certificate for `api.grandarchivemeta.com`
2. Certificate automatically validated via Route 53 DNS records
3. Automatic certificate renewal by AWS

## Components

### 1. Route 53 (DNS)

**Primary Domain (grandarchivemeta.com)**
- Root domain → Vercel (frontend)
- www subdomain → Vercel (frontend)
- api subdomain → API Gateway

**Secondary Domain (grandarchivemeta.net)**
- Root domain → Vercel (redirect to .com)
- www subdomain → Vercel (redirect to .com)

**Features**:
- Health checks for API endpoint
- CloudWatch alarms for DNS health
- Automatic failover (if configured)

### 2. API Gateway

**Type**: REST API (Edge-optimized)

**Endpoints**:
- `/api/{proxy+}` - Proxy to EC2 instance

**Methods**:
- `ANY` - Forwards all HTTP methods
- `OPTIONS` - CORS preflight

**Features**:
- HTTP_PROXY integration to EC2:8080
- CORS enabled with credentials support
- Set-Cookie header passthrough
- Custom domain with SSL/TLS
- CloudWatch logging and X-Ray tracing
- 29-second timeout (AWS maximum)

**CORS Configuration**:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization, Cookie, Set-Cookie
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH
Access-Control-Allow-Credentials: true
```

### 3. EC2 Instance

**Specifications**:
- Instance Type: t4g.small (ARM64)
- vCPU: 2
- RAM: 2 GB
- Network: Up to 5 Gbps
- EBS: 20 GB gp3 (encrypted)
- OS: Ubuntu 22.04 LTS ARM64

**Pre-installed Software**:
- Docker & Docker Compose
- Node.js 20.x LTS
- PM2 process manager
- CloudWatch agent
- UFW firewall
- Git
- Build tools

**Monitoring**:
- Detailed CloudWatch monitoring enabled
- IMDSv2 required (enhanced security)
- Instance metadata tags enabled

### 4. Security Group

**Ingress Rules**:
- Port 22 (SSH): Configurable CIDR
- Port 80 (HTTP): 0.0.0.0/0 (for Let's Encrypt)
- Port 443 (HTTPS): 0.0.0.0/0
- Port 8080 (API): 0.0.0.0/0

**Egress Rules**:
- All traffic: 0.0.0.0/0

### 5. Elastic IP

- Static public IP address
- Attached to EC2 instance
- Persists across instance stops/starts
- Free while attached to running instance

### 6. ACM Certificate

- Domain: api.grandarchivemeta.com
- Validation: DNS (automated via Route 53)
- Renewal: Automatic
- Type: RSA 2048-bit

### 7. CloudWatch

**Metrics**:
- EC2: CPU, Network, Disk, Status Checks
- API Gateway: Request count, Latency, Errors, 4XX/5XX
- Custom: Application metrics (if configured)

**Logs**:
- API Gateway access logs (30-day retention)
- Application logs (systemd journal)
- System logs (syslog)

**Alarms**:
- EC2 CPU utilization > 80%
- EC2 status check failed
- API health check failed
- Route 53 health check failed

## Network Architecture

### VPC Configuration
- Uses default VPC
- Default subnet in selected AZ
- Internet Gateway attached
- Public IP enabled on EC2

### Security Layers
1. **AWS Level**: IAM policies, Security Groups
2. **Network Level**: Security Group rules, VPC ACLs
3. **Instance Level**: UFW firewall, SSH key authentication
4. **Application Level**: Application authentication/authorization

## High Availability Considerations

**Current Setup** (Single instance):
- Single AZ deployment
- Elastic IP for consistent addressing
- CloudWatch alarms for monitoring
- Manual recovery procedures

**Future Improvements**:
- Multi-AZ deployment with Auto Scaling
- Application Load Balancer
- RDS for database (if needed)
- ElastiCache for caching
- S3 for static assets
- CloudFront for global CDN

## Disaster Recovery

**Backup Strategy**:
- AMI snapshots (manual or automated)
- EBS volume snapshots
- Configuration stored in Git (Infrastructure as Code)
- Application code in Git repository

**Recovery Time Objective (RTO)**: ~15 minutes
- Restore from AMI or redeploy via Terraform

**Recovery Point Objective (RPO)**: Depends on backup frequency
- Recommended: Daily automated snapshots

## Security Considerations

### Network Security
- Security groups with minimal required ports
- SSH access restricted to specific IP ranges
- IMDSv2 required on EC2
- Encrypted EBS volumes

### Application Security
- SSL/TLS for all HTTPS traffic
- Automatic certificate management
- CORS properly configured
- API Gateway throttling (can be enabled)
- Rate limiting (application level)

### Access Control
- SSH key-based authentication only
- IAM roles for AWS service access
- CloudTrail for audit logging
- GuardDuty for threat detection (recommended)

### Data Protection
- Encrypted EBS volumes
- Encrypted data in transit (HTTPS)
- Secure environment variable management
- Regular security patching

## Monitoring and Alerting

### Metrics to Monitor
- EC2 CPU utilization
- EC2 memory usage (requires CloudWatch agent)
- API response times
- API error rates
- Disk usage
- Network throughput

### Alert Channels
- CloudWatch Alarms
- SNS notifications (email, SMS)
- Integration with incident management tools

### Dashboards
- CloudWatch dashboard for key metrics
- EC2 instance metrics
- API Gateway metrics
- Custom application metrics

## Cost Optimization

### Current Costs
- EC2 t4g.small: ~$13/month
- Elastic IP: Free (when attached)
- API Gateway: Pay per request
- Route 53: $1/zone/month
- Data transfer: First 100GB free
- CloudWatch: Logs and metrics

**Estimated Total**: $18-37/month

### Optimization Strategies
- Use Reserved Instances (40-60% savings)
- Right-size instance based on usage
- Use CloudWatch Logs Insights sparingly
- Set log retention policies
- Monitor and optimize data transfer
- Consider Savings Plans

## Scalability

### Vertical Scaling (Current)
- Increase instance type (t4g.medium, t4g.large)
- Increase EBS volume size
- Minimal downtime (stop, resize, start)

### Horizontal Scaling (Future)
- Add Application Load Balancer
- Implement Auto Scaling Group
- Use RDS for shared database
- Add ElastiCache for caching
- Use S3 for shared storage

### Performance Optimization
- Enable API Gateway caching
- Implement CDN for static assets
- Use database connection pooling
- Optimize application code
- Add Redis for session storage

## Compliance and Governance

### Infrastructure as Code
- All infrastructure defined in Terraform
- Version controlled in Git
- Peer review for changes
- Automated testing (can be added)

### Change Management
- Terraform plan before apply
- Staged deployments (dev → staging → prod)
- Rollback procedures documented
- Change logs maintained

### Audit and Compliance
- CloudTrail for API auditing
- Config for configuration tracking
- Regular security assessments
- Access reviews

## Maintenance Windows

### Recommended Schedule
- **Security Patches**: Weekly (Sunday 2-4 AM)
- **Application Updates**: As needed (off-peak hours)
- **Infrastructure Updates**: Monthly (planned maintenance)
- **Backup Verification**: Weekly

### Maintenance Procedures
1. Announce maintenance window
2. Create EBS snapshot
3. Apply updates
4. Test functionality
5. Monitor for issues
6. Document changes

## Troubleshooting

### Common Issues

**Issue**: API Gateway 502 errors
- **Cause**: EC2 instance not responding
- **Resolution**: Check EC2 status, application logs, restart service

**Issue**: DNS not resolving
- **Cause**: Nameservers not updated or DNS propagation delay
- **Resolution**: Verify NS records, wait for propagation

**Issue**: SSL certificate pending validation
- **Cause**: DNS records not created or not propagated
- **Resolution**: Check Route 53 validation records, wait for DNS propagation

**Issue**: SSH connection refused
- **Cause**: Security group rules or instance stopped
- **Resolution**: Check security group, verify instance running

## Future Enhancements

### Short Term
- [ ] Set up automated EBS snapshots
- [ ] Configure SNS alerts for alarms
- [ ] Add API Gateway caching
- [ ] Implement application logging to CloudWatch

### Medium Term
- [ ] Add Application Load Balancer
- [ ] Implement Auto Scaling
- [ ] Set up staging environment
- [ ] Add RDS database (if needed)

### Long Term
- [ ] Multi-region deployment
- [ ] Blue/green deployments
- [ ] Container orchestration (ECS/EKS)
- [ ] Serverless migration (Lambda/Fargate)

## References

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS EC2 Best Practices](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-best-practices.html)
- [API Gateway Best Practices](https://docs.aws.amazon.com/apigateway/latest/developerguide/best-practices.html)
- [Route 53 Best Practices](https://docs.aws.amazon.com/Route53/latest/Developerguide/best-practices.html)
