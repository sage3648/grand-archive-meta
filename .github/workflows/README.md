# GitHub Actions CI/CD Workflows

This directory contains the CI/CD workflows for the Grand Archive Meta project.

## Table of Contents

- [Workflows Overview](#workflows-overview)
- [Setup Instructions](#setup-instructions)
- [Secrets Configuration](#secrets-configuration)
- [Deployment Process](#deployment-process)
- [Troubleshooting](#troubleshooting)

## Workflows Overview

### 1. Backend Deployment (`deploy-backend.yml`)

Automatically builds and deploys the Rust backend API to EC2.

**Triggers:**
- Push to `main` branch with changes in `backend/**`
- Manual workflow dispatch

**Process:**
1. **Build Job**:
   - Compiles Rust binary for ARM64 architecture using `cross`
   - Targets `aarch64-unknown-linux-gnu` for AWS Graviton instances
   - Caches dependencies for faster builds
   - Uploads binary as artifact

2. **Deploy Job**:
   - Downloads compiled binary
   - Configures AWS credentials via OIDC
   - Creates systemd service file with environment variables
   - Deploys to EC2 via SSH
   - Installs and starts systemd service

3. **Verify Job**:
   - Checks service status
   - Tests health endpoint
   - Verifies port 8080 is listening

**Duration:** ~5-10 minutes

### 2. Terraform Infrastructure (`terraform.yml`)

Manages infrastructure as code using Terraform.

**Triggers:**
- Push to `main` with changes in `infrastructure/**`
- Pull requests affecting infrastructure
- Manual workflow dispatch (plan/apply/destroy)

**Jobs:**

1. **Validate**:
   - Format checking
   - Configuration validation
   - Runs on all triggers

2. **Plan** (PRs and manual):
   - Shows infrastructure changes
   - Posts plan as PR comment
   - No actual changes made

3. **Apply** (main branch):
   - Applies infrastructure changes
   - Requires manual approval via GitHub environment
   - Outputs results

4. **Destroy** (manual only):
   - Destroys infrastructure
   - Requires special environment approval
   - Use with extreme caution

5. **Security Scan**:
   - Runs `tfsec` for security issues
   - Runs `Checkov` for compliance
   - Uploads results to GitHub Security

**Duration:** ~3-5 minutes (plan), ~10-15 minutes (apply)

### 3. Frontend Deployment (`deploy-frontend.yml`)

**Note:** This is a documentation-only file. The frontend is automatically deployed by Vercel when you push to GitHub.

**Vercel Features:**
- Automatic production deployments on push to `main`
- Preview deployments for all pull requests
- Automatic HTTPS and CDN
- Zero configuration needed after initial setup

## Setup Instructions

### 1. Initial Setup

#### A. Fork/Clone Repository

```bash
git clone https://github.com/your-username/grand-archive-meta.git
cd grand-archive-meta
```

#### B. Set Up AWS OIDC (Recommended)

OIDC allows GitHub Actions to authenticate with AWS without storing long-lived credentials.

1. Create OIDC provider in AWS IAM:
   ```bash
   # In AWS Console: IAM → Identity providers → Add provider
   Provider type: OpenID Connect
   Provider URL: https://token.actions.githubusercontent.com
   Audience: sts.amazonaws.com
   ```

2. Create IAM role for GitHub Actions:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Principal": {
           "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
         },
         "Action": "sts:AssumeRoleWithWebIdentity",
         "Condition": {
           "StringEquals": {
             "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
           },
           "StringLike": {
             "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_USERNAME/grand-archive-meta:*"
           }
         }
       }
     ]
   }
   ```

3. Attach policies to the role:
   - EC2 access (for deployment)
   - S3 access (for Terraform state)
   - Any other required permissions

#### C. Set Up Vercel

1. Go to [Vercel](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://api.yourapp.com
   ```

5. Vercel will automatically:
   - Deploy on every push to `main`
   - Create preview deployments for PRs
   - Assign a production URL

## Secrets Configuration

### Required GitHub Secrets

Navigate to: **Settings → Secrets and variables → Actions → New repository secret**

#### AWS Configuration

| Secret Name | Description | Example |
|------------|-------------|---------|
| `AWS_REGION` | AWS region for deployment | `us-east-1` |
| `AWS_ACCOUNT_ID` | Your AWS account ID | `123456789012` |
| `AWS_ROLE_ARN` | ARN of the IAM role for OIDC | `arn:aws:iam::123456789012:role/github-actions-role` |
| `TF_STATE_BUCKET` | S3 bucket for Terraform state | `my-terraform-state-bucket` |

#### EC2 Configuration

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `EC2_HOST` | Public IP or hostname of EC2 | From EC2 console |
| `EC2_PRIVATE_KEY` | SSH private key for EC2 access | Generate with `ssh-keygen -t ed25519` |

**Generate SSH Key:**
```bash
ssh-keygen -t ed25519 -C "github-actions" -f github-actions-key
# Add github-actions-key.pub to EC2 instance's ~/.ssh/authorized_keys
# Add github-actions-key (private key) to GitHub secret EC2_PRIVATE_KEY
```

#### Database Configuration

| Secret Name | Description | Example |
|------------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |

### Optional Secrets

| Secret Name | Description | Default |
|------------|-------------|---------|
| `RUST_LOG` | Logging level | `info` |
| `PORT` | API server port | `8080` |

### Setting Up Secrets

```bash
# Using GitHub CLI
gh secret set AWS_REGION -b "us-east-1"
gh secret set AWS_ACCOUNT_ID -b "123456789012"
gh secret set AWS_ROLE_ARN -b "arn:aws:iam::123456789012:role/github-actions"
gh secret set EC2_HOST -b "ec2-1-2-3-4.compute-1.amazonaws.com"
gh secret set EC2_PRIVATE_KEY < github-actions-key
gh secret set MONGODB_URI -b "mongodb+srv://..."
gh secret set TF_STATE_BUCKET -b "my-terraform-state"
```

### GitHub Environments

Set up deployment environments for additional protection:

1. Go to **Settings → Environments → New environment**
2. Create `production` environment
3. Add protection rules:
   - ✅ Required reviewers (add your team)
   - ✅ Wait timer (optional, e.g., 5 minutes)
   - ✅ Deployment branches: `main` only

## Deployment Process

### Backend Deployment

#### Automatic Deployment

1. Make changes to backend code
2. Commit and push to `main` branch:
   ```bash
   git add backend/
   git commit -m "Update backend API"
   git push origin main
   ```
3. GitHub Actions automatically:
   - Builds ARM64 binary
   - Deploys to EC2
   - Restarts service
   - Verifies health

#### Manual Deployment

1. Go to **Actions → Deploy Backend → Run workflow**
2. Select branch to deploy
3. Click **Run workflow**

#### Deployment Steps

```mermaid
graph LR
    A[Push to main] --> B[Build ARM64 Binary]
    B --> C[Upload Artifact]
    C --> D[Download Artifact]
    D --> E[Stop Service]
    E --> F[Deploy Binary]
    F --> G[Install Systemd Service]
    G --> H[Start Service]
    H --> I[Health Check]
    I --> J{Healthy?}
    J -->|Yes| K[Success]
    J -->|No| L[Rollback & Fail]
```

### Terraform Deployment

#### On Pull Request

1. Create PR with infrastructure changes
2. Workflow automatically runs `terraform plan`
3. Plan is posted as PR comment
4. Review changes before merging

#### On Merge to Main

1. Merge PR to `main`
2. Workflow runs `terraform apply`
3. Requires environment approval (if configured)
4. Infrastructure is updated
5. Outputs are saved as artifacts

#### Manual Operations

```bash
# Plan only
# Go to Actions → Terraform Infrastructure → Run workflow
# Select "plan"

# Apply changes
# Select "apply" (requires approval)

# Destroy infrastructure (DANGEROUS)
# Select "destroy" (requires special approval)
```

### Frontend Deployment (Vercel)

**Completely automatic** - no action required!

1. Push changes to `frontend/` directory
2. Vercel automatically:
   - Detects changes
   - Builds project
   - Deploys to production (main branch)
   - Creates preview (PR branches)

#### Preview Deployments

Every PR automatically gets a preview deployment:
- Unique URL for testing
- Posted as PR comment
- Updated on every push
- Deleted when PR is closed

## Troubleshooting

### Backend Deployment Issues

#### Build Failures

**Problem:** Cross-compilation fails
```
error: linking with `aarch64-linux-gnu-gcc` failed
```

**Solution:**
- Check Rust version compatibility
- Verify `cross` installation
- Ensure `AWS_LC_SYS_NO_ASM=1` is set

**Problem:** Out of memory during build
```
error: could not compile `tokio`
```

**Solution:**
- Use GitHub's larger runners
- Reduce parallel jobs: `CARGO_BUILD_JOBS=1`

#### Deployment Failures

**Problem:** SSH connection refused
```
ssh: connect to host ec2-x-x-x-x.amazonaws.com port 22: Connection refused
```

**Solution:**
1. Check EC2 security group allows SSH from GitHub Actions IPs
2. Verify EC2 instance is running
3. Check SSH key is correct

**Problem:** Service fails to start
```
ERROR: Service is not running!
```

**Solution:**
1. Check logs on EC2:
   ```bash
   sudo journalctl -u grand-archive-api -n 100
   ```
2. Verify MongoDB connection
3. Check environment variables
4. Ensure binary has execute permissions

**Problem:** Health check fails
```
ERROR: Health check failed with response: 000
```

**Solution:**
1. Check if service is listening on correct port
2. Verify firewall rules
3. Test locally:
   ```bash
   curl http://localhost:8080/health
   ```

### Terraform Issues

#### State Lock Errors

**Problem:** State is locked
```
Error: Error acquiring the state lock
```

**Solution:**
1. Check if another workflow is running
2. Wait for it to complete
3. If stuck, manually unlock:
   ```bash
   terraform force-unlock LOCK_ID
   ```

#### Plan Shows Unexpected Changes

**Problem:** Resources show changes when none expected

**Solution:**
1. Check for manual changes in AWS console
2. Review Terraform state
3. Import existing resources if needed:
   ```bash
   terraform import aws_instance.example i-1234567890abcdef0
   ```

#### Authentication Failures

**Problem:** Unable to assume role
```
Error: error configuring Terraform AWS Provider: IAM Role (arn:aws:iam::...) cannot be assumed
```

**Solution:**
1. Verify OIDC provider is configured
2. Check IAM role trust policy
3. Ensure role has required permissions
4. Verify AWS region is correct

### GitHub Actions Issues

#### Secrets Not Found

**Problem:** Secret is empty or not found
```
Error: Input required and not supplied: AWS_ROLE_ARN
```

**Solution:**
1. Verify secret exists in repository settings
2. Check secret name matches exactly (case-sensitive)
3. Ensure secret is available to the workflow

#### Workflow Not Triggering

**Problem:** Workflow doesn't run on push

**Solution:**
1. Check path filters match your changes
2. Verify branch name is correct
3. Check workflow file syntax (YAML)
4. Look for workflow errors in Actions tab

#### Insufficient Permissions

**Problem:** Permission denied errors
```
Error: Resource not accessible by integration
```

**Solution:**
1. Add required permissions to workflow:
   ```yaml
   permissions:
     contents: read
     pull-requests: write
   ```
2. Check repository settings → Actions → General → Workflow permissions

### Vercel Deployment Issues

#### Build Failures

**Problem:** Build fails in Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify environment variables
3. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```

#### Environment Variables

**Problem:** API calls fail in production

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is set in Vercel
2. Check API URL is accessible
3. Verify CORS settings on backend

### Getting Help

1. **Check workflow logs**: Click on failed job to see detailed logs
2. **GitHub Actions documentation**: https://docs.github.com/en/actions
3. **Terraform documentation**: https://www.terraform.io/docs
4. **Create an issue**: Include error message and relevant logs

## Monitoring and Maintenance

### Health Checks

The backend workflow includes automatic health checks:
- Service status verification
- Port listening check
- HTTP health endpoint test

### Logs

View deployment logs:
```bash
# Backend service logs
ssh ubuntu@$EC2_HOST
sudo journalctl -u grand-archive-api -f

# Follow last 100 lines
sudo journalctl -u grand-archive-api -n 100 --no-pager
```

### Rollback

If deployment fails, the service is automatically stopped. To manually rollback:

```bash
ssh ubuntu@$EC2_HOST

# Find previous binary (if backed up)
ls -lt /usr/local/bin/

# Restore previous version
sudo cp /usr/local/bin/grand-archive-api.backup /usr/local/bin/grand-archive-api
sudo systemctl restart grand-archive-api
```

### Best Practices

1. **Test locally first**: Always test builds and deployments locally
2. **Use PRs**: Don't push directly to main for infrastructure changes
3. **Review plans**: Always review Terraform plans before applying
4. **Monitor deployments**: Watch the Actions tab during deployments
5. **Keep secrets updated**: Rotate credentials regularly
6. **Use environments**: Protect production with required reviewers
7. **Version pinning**: Pin action versions for reproducibility
8. **Cache dependencies**: Use caching to speed up builds

## Security Considerations

### Secrets Management

- ✅ Use OIDC for AWS authentication (no long-lived credentials)
- ✅ Rotate SSH keys regularly
- ✅ Use GitHub environments for sensitive deployments
- ✅ Never commit secrets to repository
- ✅ Limit secret access to required workflows only

### Service Hardening

The systemd service includes security features:
- `NoNewPrivileges=true` - Prevents privilege escalation
- `PrivateTmp=true` - Isolated /tmp directory
- `ProtectSystem=strict` - Read-only filesystem
- `ProtectHome=true` - Hides /home directories

### Network Security

- Ensure EC2 security groups only allow necessary ports
- Use HTTPS for all external communications
- Implement rate limiting on API endpoints
- Enable CloudWatch logging for monitoring

## Performance Optimization

### Build Speed

- **Caching**: Workflows cache Cargo dependencies and build artifacts
- **Incremental builds**: Only rebuilds changed dependencies
- **Parallel jobs**: Uses multiple cores when possible

### Deployment Speed

- **Artifacts**: Compiled binary is uploaded/downloaded as artifact
- **SSH connection reuse**: Single SSH session for deployment
- **Service restart**: Only restarts if healthy

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Rust Cross-Compilation](https://rust-lang.github.io/rustup/cross-compilation.html)
- [AWS OIDC Setup](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-amazon-web-services)

## Workflow Diagram

```mermaid
graph TB
    A[Code Push] --> B{Which Directory?}
    B -->|backend/**| C[Backend Workflow]
    B -->|frontend/**| D[Vercel Auto-Deploy]
    B -->|infrastructure/**| E[Terraform Workflow]

    C --> C1[Build ARM64 Binary]
    C1 --> C2[Deploy to EC2]
    C2 --> C3[Health Check]
    C3 --> C4[Success/Fail]

    D --> D1[Vercel Build]
    D1 --> D2[Deploy to CDN]
    D2 --> D3[Success]

    E --> E1{Event Type?}
    E1 -->|PR| E2[Terraform Plan]
    E1 -->|Push to main| E3[Terraform Apply]
    E2 --> E4[Comment on PR]
    E3 --> E5[Update Infrastructure]
```

---

**Last Updated**: 2025-10-26
**Maintained By**: Grand Archive Meta Team
