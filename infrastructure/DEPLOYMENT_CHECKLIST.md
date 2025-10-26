# Grand Archive Meta - Deployment Checklist

Use this checklist to ensure a smooth deployment of the infrastructure.

## Pre-Deployment Checklist

### AWS Account Setup
- [ ] AWS account created and verified
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS credentials configured (`aws configure`)
- [ ] IAM user has necessary permissions (EC2, API Gateway, Route53, ACM, CloudWatch)
- [ ] Verified credentials work (`aws sts get-caller-identity`)

### SSH Key Pair
- [ ] SSH key pair created in AWS EC2 console
- [ ] Private key downloaded to `~/.ssh/`
- [ ] Permissions set correctly (`chmod 400 ~/.ssh/your-key.pem`)
- [ ] Key name noted for `terraform.tfvars`

### Domain Registration
- [ ] Domain `grandarchivemeta.com` registered
- [ ] Domain `grandarchivemeta.net` registered
- [ ] Access to domain registrar's DNS settings
- [ ] Domains not currently in use (or ready to migrate)

### Development Environment
- [ ] Terraform installed (`terraform version`)
- [ ] Terraform version >= 1.0
- [ ] Git installed (for version control)
- [ ] Text editor/IDE available

## Deployment Checklist

### 1. Initial Setup
- [ ] Clone/navigate to project directory
- [ ] Navigate to `infrastructure/` directory
- [ ] Copy `terraform.tfvars.example` to `terraform.tfvars`
- [ ] Edit `terraform.tfvars` with your values:
  - [ ] Set `key_name` to your SSH key pair name
  - [ ] Update `ssh_allowed_cidr` with your IP address
  - [ ] Review and adjust other variables as needed
- [ ] Review all `.tf` files for any needed customizations

### 2. Terraform Initialization
- [ ] Run `terraform init`
- [ ] Verify providers downloaded successfully
- [ ] Check for any initialization errors

### 3. Validation
- [ ] Run `terraform validate`
- [ ] Fix any syntax errors
- [ ] Run `terraform fmt -recursive`
- [ ] Review formatting changes

### 4. Planning
- [ ] Run `terraform plan`
- [ ] Review the execution plan carefully
- [ ] Verify resource counts match expectations:
  - [ ] 1 EC2 instance
  - [ ] 1 Elastic IP
  - [ ] 1 Security Group with rules
  - [ ] 2 Route53 Hosted Zones
  - [ ] Multiple Route53 records
  - [ ] 1 API Gateway
  - [ ] 1 ACM Certificate
  - [ ] CloudWatch alarms and log groups
- [ ] Check for any unexpected changes
- [ ] Estimate costs based on resources

### 5. Deployment
- [ ] Run `terraform apply`
- [ ] Review the plan one more time
- [ ] Type `yes` to confirm
- [ ] Wait for deployment to complete (5-10 minutes)
- [ ] Check for any errors during deployment
- [ ] Verify all resources created successfully

### 6. Post-Deployment Verification
- [ ] Run `terraform output`
- [ ] Save outputs to a file: `terraform output > deployment-info.txt`
- [ ] Note the following values:
  - [ ] EC2 public IP: ________________
  - [ ] API Gateway URL: ________________
  - [ ] Primary nameservers: ________________
  - [ ] Secondary nameservers: ________________
  - [ ] SSH command: ________________

### 7. DNS Configuration
- [ ] Log into domain registrar for `grandarchivemeta.com`
- [ ] Update nameservers with values from `nameservers_primary` output
- [ ] Log into domain registrar for `grandarchivemeta.net`
- [ ] Update nameservers with values from `nameservers_secondary` output
- [ ] Wait for DNS propagation (can take 24-48 hours)
- [ ] Test DNS with `dig grandarchivemeta.com NS`
- [ ] Test DNS with `dig api.grandarchivemeta.com`

### 8. EC2 Instance Setup
- [ ] SSH into EC2 instance using output command
- [ ] Verify instance is running: `uptime`
- [ ] Check Docker is installed: `docker --version`
- [ ] Check Node.js is installed: `node --version`
- [ ] Review system logs: `sudo journalctl -n 50`
- [ ] Check user data execution: `cat /var/log/user-data-completion.log`
- [ ] Verify firewall: `sudo ufw status`

### 9. Application Deployment
- [ ] Clone your application repository to `/opt/grand-archive-api`
- [ ] Install dependencies: `npm ci --production`
- [ ] Configure environment variables (create `.env` file)
- [ ] Update systemd service file if needed
- [ ] Start the service: `sudo systemctl start grand-archive-api`
- [ ] Enable service on boot: `sudo systemctl enable grand-archive-api`
- [ ] Check service status: `sudo systemctl status grand-archive-api`
- [ ] View application logs: `sudo journalctl -u grand-archive-api -f`

### 10. API Gateway Testing
- [ ] Test direct EC2 endpoint: `curl http://<EC2_IP>:8080/api/health`
- [ ] Test API Gateway endpoint: `curl <API_GATEWAY_URL>/api/health`
- [ ] After DNS propagates, test custom domain: `curl https://api.grandarchivemeta.com/api/health`
- [ ] Test CORS headers: `curl -H "Origin: https://grandarchivemeta.com" https://api.grandarchivemeta.com/api/health -v`
- [ ] Test different HTTP methods (GET, POST, etc.)

### 11. SSL/TLS Verification
- [ ] Check ACM certificate status in AWS Console
- [ ] Verify certificate is issued (not pending)
- [ ] Test HTTPS connection: `curl -v https://api.grandarchivemeta.com`
- [ ] Check certificate details: `openssl s_client -connect api.grandarchivemeta.com:443 -servername api.grandarchivemeta.com`

### 12. Monitoring Setup
- [ ] Access CloudWatch console
- [ ] Verify EC2 metrics are reporting
- [ ] Check API Gateway logs in CloudWatch
- [ ] Test CloudWatch alarms (optional: trigger test alarm)
- [ ] Set up SNS topic for alarm notifications (if desired)
- [ ] Subscribe to SNS topic for email/SMS alerts
- [ ] Update alarm actions in Terraform files with SNS ARN
- [ ] Apply changes: `terraform apply`

### 13. Security Hardening
- [ ] Review security group rules
- [ ] Restrict SSH access to specific IP ranges
- [ ] Enable AWS CloudTrail for audit logging
- [ ] Set up AWS Config for compliance monitoring
- [ ] Review IAM policies and permissions
- [ ] Enable MFA on AWS root account
- [ ] Enable AWS GuardDuty for threat detection
- [ ] Set up AWS Backup for EC2 snapshots

### 14. Documentation
- [ ] Document any custom configurations
- [ ] Save all outputs and important information
- [ ] Create runbook for common operations
- [ ] Document emergency procedures
- [ ] Share access information with team (securely)
- [ ] Update project README with deployment information

## Post-Deployment Checklist

### Week 1
- [ ] Monitor CloudWatch metrics daily
- [ ] Review CloudWatch logs for errors
- [ ] Check API response times
- [ ] Monitor AWS billing
- [ ] Test failover scenarios
- [ ] Perform load testing (if applicable)

### Ongoing Maintenance
- [ ] Weekly security patches: `sudo apt update && sudo apt upgrade`
- [ ] Monthly AWS bill review
- [ ] Quarterly security audit
- [ ] Regular backup verification
- [ ] Update documentation as infrastructure changes
- [ ] Review and rotate SSH keys
- [ ] Update SSL certificates before expiration

## Rollback Plan

In case of deployment failure:

1. [ ] Review error messages from `terraform apply`
2. [ ] Check AWS Console for failed resources
3. [ ] Review CloudWatch logs
4. [ ] If safe, run `terraform destroy` to clean up
5. [ ] Fix issues in Terraform files
6. [ ] Re-run deployment from step 4

## Emergency Contacts

- AWS Support: ________________
- Domain Registrar Support: ________________
- Team Lead: ________________
- On-Call Engineer: ________________

## Cost Monitoring

Expected monthly costs: $18-37 (see README.md for breakdown)

- [ ] Set up AWS Budget alerts
- [ ] Monitor actual vs estimated costs
- [ ] Review Cost Explorer weekly
- [ ] Set spending limits if needed

## Compliance and Governance

- [ ] Review AWS Well-Architected Framework
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Document data retention policies
- [ ] Set up incident response procedures
- [ ] Create disaster recovery plan
- [ ] Schedule regular security reviews

## Success Criteria

Deployment is considered successful when:

- [ ] All Terraform resources created without errors
- [ ] EC2 instance is running and accessible via SSH
- [ ] Application is running and responding to requests
- [ ] API Gateway is routing traffic correctly
- [ ] DNS is resolving to correct endpoints
- [ ] SSL/TLS certificates are valid and active
- [ ] CloudWatch metrics and logs are reporting
- [ ] No critical alarms are triggered
- [ ] All tests pass
- [ ] Documentation is complete and accurate

## Notes and Observations

Use this section to record any issues, workarounds, or important observations during deployment:

```
Date: _______________
Issue:
Resolution:
Impact:

---

Date: _______________
Issue:
Resolution:
Impact:

---
```

## Sign-off

Deployment completed by: ________________
Date: ________________
Time: ________________
Terraform Version: ________________
AWS Region: ________________

Reviewed by: ________________
Date: ________________

Approved for production: ________________
Date: ________________
