# GitHub Actions Workflows - Documentation Index

Complete documentation for the Grand Archive Meta CI/CD pipeline.

## 📁 File Structure

```
.github/workflows/
├── deploy-backend.yml           # Backend deployment workflow
├── terraform.yml                # Infrastructure management workflow
├── deploy-frontend.yml          # Frontend deployment notes (Vercel)
├── README.md                    # Main documentation
├── QUICKSTART.md               # 5-minute setup guide
├── SETUP-GUIDE.md              # Detailed setup instructions
├── TESTING.md                  # Testing guide
├── DEPLOYMENT-CHECKLIST.md     # Pre-deployment checklist
├── BADGES.md                   # Workflow status badges
├── .env.example                # Secrets template
└── verify-setup.sh             # Setup verification script
```

## 📚 Documentation Guide

### For First-Time Setup

**Start here**: [QUICKSTART.md](QUICKSTART.md)
- 5-minute quick setup
- Minimal steps to get running
- Perfect for getting started fast

**Then read**: [SETUP-GUIDE.md](SETUP-GUIDE.md)
- Comprehensive 30-minute setup
- Detailed configuration steps
- AWS OIDC setup
- All environment variables

**Reference**: [README.md](README.md)
- Complete workflow documentation
- Troubleshooting guide
- Best practices
- Detailed explanations

### For Daily Use

**Before deploying**: [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
- Pre-deployment verification
- Security checks
- Post-deployment validation
- Rollback procedures

**For testing**: [TESTING.md](TESTING.md)
- Local testing strategies
- GitHub Actions testing
- Debugging workflows
- Common test scenarios

**For monitoring**: [README.md#monitoring-and-maintenance](README.md#monitoring-and-maintenance)
- Health checks
- Log viewing
- Performance monitoring
- Alert configuration

### For Customization

**Workflow files**:
- [deploy-backend.yml](deploy-backend.yml) - Backend deployment
- [terraform.yml](terraform.yml) - Infrastructure management
- [deploy-frontend.yml](deploy-frontend.yml) - Frontend notes

**Configuration**:
- [.env.example](.env.example) - All required secrets
- [verify-setup.sh](verify-setup.sh) - Verification script

**GitHub setup**:
- [BADGES.md](BADGES.md) - Status badges for README

## 🎯 Common Tasks

### Initial Setup
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Follow [SETUP-GUIDE.md](SETUP-GUIDE.md)
3. Run `./verify-setup.sh`
4. Test with [TESTING.md](TESTING.md)

### Deploying Backend
1. Review [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)
2. Push to `main` or trigger manually
3. Monitor workflow in Actions tab
4. Verify with health check

### Deploying Infrastructure
1. Create PR with changes
2. Review Terraform plan
3. Merge to `main`
4. Approve deployment
5. Verify outputs

### Troubleshooting
1. Check [README.md#troubleshooting](README.md#troubleshooting)
2. Run `./verify-setup.sh`
3. Enable debug logging
4. Check workflow logs

### Adding Features
1. Create feature branch
2. Test with [TESTING.md](TESTING.md)
3. Create PR
4. Review and merge

## 📖 Documentation by Role

### For Developers
- [QUICKSTART.md](QUICKSTART.md) - Get started
- [TESTING.md](TESTING.md) - Test changes
- [deploy-backend.yml](deploy-backend.yml) - Backend workflow
- [README.md#troubleshooting](README.md#troubleshooting) - Fix issues

### For DevOps Engineers
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Full setup
- [terraform.yml](terraform.yml) - Infrastructure workflow
- [README.md](README.md) - Complete reference
- [verify-setup.sh](verify-setup.sh) - Validation

### For Project Managers
- [QUICKSTART.md](QUICKSTART.md) - Overview
- [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) - Release process
- [README.md#deployment-process](README.md#deployment-process) - How it works

### For Security Team
- [SETUP-GUIDE.md#security](SETUP-GUIDE.md) - Security setup
- [README.md#security-considerations](README.md#security-considerations) - Security features
- [DEPLOYMENT-CHECKLIST.md#security-checklist](DEPLOYMENT-CHECKLIST.md#security-checklist) - Security checks

## 🚀 Workflows Overview

### Backend Deployment ([deploy-backend.yml](deploy-backend.yml))

**Trigger**: Push to `main` (backend/**)
**Duration**: ~5-10 minutes
**Steps**:
1. Build ARM64 binary
2. Deploy to EC2
3. Verify health

**Secrets required**:
- AWS_ROLE_ARN
- EC2_HOST
- EC2_PRIVATE_KEY
- MONGODB_URI

### Infrastructure ([terraform.yml](terraform.yml))

**Trigger**: Push/PR to infrastructure/**
**Duration**: ~3-15 minutes
**Steps**:
1. Validate configuration
2. Plan changes (PR)
3. Apply changes (main)
4. Security scan

**Secrets required**:
- AWS_ROLE_ARN
- TF_STATE_BUCKET

### Frontend ([deploy-frontend.yml](deploy-frontend.yml))

**Note**: Automatic via Vercel
**Trigger**: Push to `main`
**Duration**: ~2-5 minutes
**Setup**: Link repo to Vercel

**Environment variables** (in Vercel):
- NEXT_PUBLIC_API_URL

## 🔧 Maintenance

### Daily
- Monitor deployment status
- Check error logs
- Review alerts

### Weekly
- Review workflow runs
- Check for failed deployments
- Update dependencies

### Monthly
- Rotate secrets
- Review security scans
- Update documentation
- Performance review

## 📞 Support

### Getting Help

1. **Check documentation**
   - Start with [README.md](README.md)
   - Check [Troubleshooting](README.md#troubleshooting)
   - Review [TESTING.md](TESTING.md)

2. **Run diagnostics**
   ```bash
   ./verify-setup.sh
   ```

3. **Check workflow logs**
   ```bash
   gh run list
   gh run view <run-id> --log
   ```

4. **Common issues**
   - [SSH Connection Failed](README.md#ssh-connection-refused)
   - [Build Failures](README.md#build-failures)
   - [Deployment Failures](README.md#deployment-failures)
   - [Terraform Issues](README.md#terraform-issues)

### Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Terraform Docs](https://www.terraform.io/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Rust Cross-Compilation](https://rust-lang.github.io/rustup/cross-compilation.html)

## 🎓 Learning Path

### Beginner
1. Read [QUICKSTART.md](QUICKSTART.md)
2. Follow setup step-by-step
3. Make a test deployment
4. Learn from [README.md](README.md)

### Intermediate
1. Understand workflow files
2. Customize for your needs
3. Learn testing strategies
4. Implement monitoring

### Advanced
1. Optimize workflows
2. Add custom checks
3. Implement advanced monitoring
4. Contribute improvements

## 📝 Templates

### New Workflow Template
```yaml
name: My Workflow

on:
  push:
    branches: [main]

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: My Step
        run: echo "Hello World"
```

### Secrets Template
See [.env.example](.env.example)

### Checklist Template
See [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

## 🔄 Update History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-26 | 1.0 | Initial documentation |

## 🤝 Contributing

To improve these workflows:

1. Test changes in feature branch
2. Update documentation
3. Submit PR with:
   - Description of changes
   - Test results
   - Documentation updates

## 📜 License

See main repository LICENSE file.

---

**Version**: 1.0
**Last Updated**: 2025-10-26
**Maintained By**: Grand Archive Meta Team

**Quick Links**:
- [Quick Start](QUICKSTART.md) - Get running in 5 minutes
- [Full Setup](SETUP-GUIDE.md) - Complete 30-minute setup
- [Main Docs](README.md) - Comprehensive documentation
- [Testing](TESTING.md) - Test your workflows
- [Checklist](DEPLOYMENT-CHECKLIST.md) - Pre-deployment checks
