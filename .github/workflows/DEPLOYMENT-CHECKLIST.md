# Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All code changes have been reviewed
- [ ] PR has been approved by at least one reviewer
- [ ] All CI checks are passing
- [ ] No merge conflicts with main branch
- [ ] Code follows project style guidelines

### 2. Testing
- [ ] All unit tests pass locally
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing done (if applicable)
- [ ] Security scanning completed

### 3. Documentation
- [ ] Code is properly documented
- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] Changelog updated
- [ ] Migration guide written (if breaking changes)

### 4. Dependencies
- [ ] Dependencies are up to date
- [ ] No known security vulnerabilities
- [ ] License compatibility checked
- [ ] Dependency lock files committed

### 5. Configuration
- [ ] Environment variables documented
- [ ] Secrets are properly configured
- [ ] Configuration files updated
- [ ] Feature flags set correctly

## Backend Deployment Checklist

### Pre-Deployment

- [ ] Rust version matches workflow (1.75+)
- [ ] Cargo.lock is committed
- [ ] Database migrations tested
- [ ] API endpoints tested
- [ ] Health check endpoint works
- [ ] Logging configured correctly

### Environment Setup

- [ ] `AWS_REGION` secret set
- [ ] `AWS_ACCOUNT_ID` secret set
- [ ] `AWS_ROLE_ARN` secret set
- [ ] `EC2_HOST` secret set
- [ ] `EC2_PRIVATE_KEY` secret set
- [ ] `MONGODB_URI` secret set

### Infrastructure

- [ ] EC2 instance is running
- [ ] Security groups allow SSH
- [ ] Security groups allow HTTP/HTTPS
- [ ] SSH key is properly configured
- [ ] MongoDB is accessible from EC2
- [ ] Disk space is sufficient

### Deployment

- [ ] Workflow runs successfully
- [ ] Build completes without errors
- [ ] Binary is uploaded as artifact
- [ ] Deployment to EC2 succeeds
- [ ] Service starts successfully
- [ ] Health check passes

### Post-Deployment

- [ ] Service is running: `sudo systemctl status grand-archive-api`
- [ ] Logs look normal: `sudo journalctl -u grand-archive-api -n 100`
- [ ] API responds: `curl http://localhost:8080/health`
- [ ] Database connection works
- [ ] No errors in logs
- [ ] Performance is acceptable

## Frontend Deployment Checklist

### Pre-Deployment

- [ ] Node.js version correct
- [ ] package-lock.json committed
- [ ] Build succeeds locally
- [ ] Linter passes
- [ ] Type checking passes
- [ ] No console errors

### Environment Setup

- [ ] Vercel project created
- [ ] Repository linked to Vercel
- [ ] `NEXT_PUBLIC_API_URL` set in Vercel
- [ ] Other environment variables set
- [ ] Production domain configured (optional)

### Deployment

- [ ] Automatic deployment enabled
- [ ] Build succeeds in Vercel
- [ ] Preview deployment works (for PRs)
- [ ] Production deployment succeeds

### Post-Deployment

- [ ] Site is accessible
- [ ] All pages load correctly
- [ ] API calls work
- [ ] No console errors
- [ ] Images load correctly
- [ ] Forms submit correctly
- [ ] Authentication works (if applicable)

## Infrastructure Deployment Checklist

### Pre-Deployment

- [ ] Terraform version matches workflow (1.6.0+)
- [ ] Configuration validated: `terraform validate`
- [ ] Format checked: `terraform fmt -check`
- [ ] Security scan passed (tfsec, Checkov)
- [ ] State backend configured
- [ ] Resource naming follows convention

### Environment Setup

- [ ] `AWS_ROLE_ARN` secret set
- [ ] `TF_STATE_BUCKET` secret set
- [ ] S3 bucket for state exists
- [ ] S3 bucket versioning enabled
- [ ] S3 bucket encryption enabled
- [ ] IAM permissions configured

### Planning

- [ ] Terraform plan reviewed
- [ ] No unexpected resource changes
- [ ] Resource deletions are intentional
- [ ] Cost impact assessed
- [ ] Backup of state taken

### Deployment

- [ ] Plan posted to PR and reviewed
- [ ] PR approved
- [ ] Apply runs successfully
- [ ] Outputs are correct
- [ ] Resources created as expected

### Post-Deployment

- [ ] All resources are healthy
- [ ] EC2 instances are running
- [ ] Security groups configured correctly
- [ ] IAM roles and policies correct
- [ ] Tags applied correctly
- [ ] Monitoring/alerts configured

## Security Checklist

### Secrets Management
- [ ] No secrets in code
- [ ] No secrets in commit history
- [ ] Secrets rotated regularly
- [ ] Least privilege principle applied
- [ ] GitHub secrets properly scoped

### Network Security
- [ ] HTTPS enabled
- [ ] Security groups follow least privilege
- [ ] No unnecessary ports open
- [ ] IP allowlisting configured (if needed)
- [ ] VPC properly configured

### Application Security
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Authentication/authorization working

### Compliance
- [ ] GDPR compliance checked (if applicable)
- [ ] Data retention policies applied
- [ ] Logging/auditing enabled
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enabled

## Monitoring Checklist

### Logs
- [ ] Application logs configured
- [ ] System logs accessible
- [ ] Log rotation configured
- [ ] Log aggregation setup (optional)
- [ ] Error tracking setup (optional)

### Metrics
- [ ] Health check endpoint monitored
- [ ] CPU/Memory usage tracked
- [ ] API response times monitored
- [ ] Error rates tracked
- [ ] Database performance monitored

### Alerts
- [ ] Critical alerts configured
- [ ] Alert recipients defined
- [ ] Alert thresholds set
- [ ] On-call rotation defined
- [ ] Incident response plan documented

## Rollback Plan

### Preparation
- [ ] Previous version documented
- [ ] Rollback procedure documented
- [ ] Database backup taken
- [ ] State backup taken

### Rollback Triggers
- [ ] Health check fails
- [ ] Error rate exceeds threshold
- [ ] Performance degradation
- [ ] Critical bug discovered
- [ ] Security vulnerability

### Rollback Procedure
1. [ ] Stop deployment immediately
2. [ ] Assess impact and severity
3. [ ] Notify team
4. [ ] Execute rollback:
   - Backend: Redeploy previous version
   - Frontend: Revert in Vercel
   - Infrastructure: `terraform apply` with previous state
5. [ ] Verify rollback successful
6. [ ] Document incident
7. [ ] Post-mortem meeting

## Post-Deployment Tasks

### Immediate (0-1 hours)
- [ ] Monitor error logs
- [ ] Check health endpoints
- [ ] Verify critical functionality
- [ ] Monitor performance metrics
- [ ] Check user feedback

### Short-term (1-24 hours)
- [ ] Review deployment logs
- [ ] Check for memory leaks
- [ ] Monitor database performance
- [ ] Review security alerts
- [ ] Update documentation

### Long-term (1-7 days)
- [ ] Analyze performance trends
- [ ] Review user feedback
- [ ] Check for unexpected behavior
- [ ] Plan next iteration
- [ ] Conduct post-mortem (if issues)

## Emergency Contacts

```
Team Lead: [Name] - [Contact]
DevOps: [Name] - [Contact]
Security: [Name] - [Contact]
On-Call: [Rotation Schedule]
```

## Useful Commands

### Backend
```bash
# Check service status
ssh ubuntu@$EC2_HOST "sudo systemctl status grand-archive-api"

# View logs
ssh ubuntu@$EC2_HOST "sudo journalctl -u grand-archive-api -n 100 --no-pager"

# Restart service
ssh ubuntu@$EC2_HOST "sudo systemctl restart grand-archive-api"

# Check health
curl http://$EC2_HOST:8080/health
```

### Frontend
```bash
# Check Vercel deployments
vercel ls

# View deployment logs
vercel logs [deployment-url]

# Rollback
vercel rollback
```

### Infrastructure
```bash
# Check Terraform state
terraform show

# View outputs
terraform output

# Refresh state
terraform refresh
```

## Sign-Off

Before deploying to production, ensure sign-off from:

- [ ] Developer who made changes
- [ ] Code reviewer
- [ ] Tech lead
- [ ] DevOps engineer
- [ ] Product owner (for major releases)

**Deployment Date**: _______________
**Deployed By**: _______________
**Version/Tag**: _______________
**Notes**: _______________

---

## Automated Checklist Runner

You can automate parts of this checklist:

```bash
#!/bin/bash
# pre-deployment-check.sh

echo "Running pre-deployment checks..."

# Run tests
npm test || exit 1

# Run linter
npm run lint || exit 1

# Check for secrets
git diff --cached | grep -i "password\|secret\|api_key" && echo "WARNING: Possible secrets in commit!" || true

# Verify secrets are set
gh secret list | grep -q "MONGODB_URI" || { echo "ERROR: MONGODB_URI not set"; exit 1; }

# Check workflow syntax
actionlint .github/workflows/*.yml || exit 1

echo "All checks passed!"
```

---

**Version**: 1.0
**Last Updated**: 2025-10-26
**Maintained By**: Grand Archive Meta Team
