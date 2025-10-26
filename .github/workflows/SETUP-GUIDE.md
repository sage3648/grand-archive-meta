# Quick Setup Guide

This guide will help you set up CI/CD for the Grand Archive Meta project in under 30 minutes.

## Prerequisites

- [ ] GitHub repository created
- [ ] AWS account with admin access
- [ ] Vercel account
- [ ] MongoDB Atlas cluster (or similar)

## Step 1: AWS OIDC Configuration (10 minutes)

### 1.1 Create OIDC Provider

```bash
# In AWS Console
1. Go to IAM → Identity providers → Add provider
2. Provider type: OpenID Connect
3. Provider URL: https://token.actions.githubusercontent.com
4. Audience: sts.amazonaws.com
5. Click "Add provider"
```

### 1.2 Create IAM Role

```bash
# In AWS Console
1. Go to IAM → Roles → Create role
2. Select "Web identity"
3. Identity provider: token.actions.githubusercontent.com
4. Audience: sts.amazonaws.com
5. Click "Next"
```

### 1.3 Trust Policy

Replace the trust policy with:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/grand-archive-meta:*"
        }
      }
    }
  ]
}
```

### 1.4 Attach Policies

Create and attach a policy with these permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:CreateTags",
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:StopInstances",
        "ec2:StartInstances"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::YOUR-TERRAFORM-STATE-BUCKET",
        "arn:aws:s3:::YOUR-TERRAFORM-STATE-BUCKET/*"
      ]
    }
  ]
}
```

### 1.5 Note the Role ARN

Copy the Role ARN, you'll need it later:
```
arn:aws:iam::123456789012:role/github-actions-grand-archive
```

## Step 2: EC2 Setup (5 minutes)

### 2.1 Generate SSH Key

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github-actions-grand-archive

# This creates two files:
# - github-actions-grand-archive (private key)
# - github-actions-grand-archive.pub (public key)
```

### 2.2 Add Public Key to EC2

```bash
# Copy public key
cat ~/.ssh/github-actions-grand-archive.pub

# SSH to your EC2 instance
ssh ubuntu@your-ec2-ip

# Add public key to authorized_keys
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 2.3 Verify SSH Access

```bash
# From your local machine
ssh -i ~/.ssh/github-actions-grand-archive ubuntu@your-ec2-ip

# If successful, you're ready to proceed
```

## Step 3: Terraform State Bucket (2 minutes)

### 3.1 Create S3 Bucket

```bash
# Using AWS CLI
aws s3 mb s3://grand-archive-terraform-state-YOUR-UNIQUE-ID

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket grand-archive-terraform-state-YOUR-UNIQUE-ID \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket grand-archive-terraform-state-YOUR-UNIQUE-ID \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'
```

## Step 4: GitHub Secrets (5 minutes)

### 4.1 Using GitHub CLI (Recommended)

```bash
# Install GitHub CLI if needed
# macOS: brew install gh
# Linux: see https://github.com/cli/cli#installation

# Authenticate
gh auth login

# Set secrets
gh secret set AWS_REGION -b "us-east-1"
gh secret set AWS_ACCOUNT_ID -b "YOUR_ACCOUNT_ID"
gh secret set AWS_ROLE_ARN -b "arn:aws:iam::YOUR_ACCOUNT_ID:role/github-actions-grand-archive"
gh secret set TF_STATE_BUCKET -b "grand-archive-terraform-state-YOUR-UNIQUE-ID"
gh secret set EC2_HOST -b "ec2-X-X-X-X.compute-1.amazonaws.com"
gh secret set MONGODB_URI -b "mongodb+srv://user:pass@cluster.mongodb.net/dbname"

# Set EC2 private key from file
gh secret set EC2_PRIVATE_KEY < ~/.ssh/github-actions-grand-archive
```

### 4.2 Using GitHub Web UI

```bash
1. Go to your repository on GitHub
2. Click Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret:

   Name: AWS_REGION
   Value: us-east-1

   Name: AWS_ACCOUNT_ID
   Value: 123456789012

   Name: AWS_ROLE_ARN
   Value: arn:aws:iam::123456789012:role/github-actions-grand-archive

   Name: TF_STATE_BUCKET
   Value: grand-archive-terraform-state-YOUR-UNIQUE-ID

   Name: EC2_HOST
   Value: ec2-X-X-X-X.compute-1.amazonaws.com

   Name: EC2_PRIVATE_KEY
   Value: (paste contents of ~/.ssh/github-actions-grand-archive)

   Name: MONGODB_URI
   Value: mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

## Step 5: GitHub Environment (3 minutes)

### 5.1 Create Production Environment

```bash
1. Go to Settings → Environments → New environment
2. Name: "production"
3. Add protection rules:
   ✅ Required reviewers: Add yourself or your team
   ✅ Wait timer: 0 minutes (optional: add delay)
   ✅ Deployment branches: Selected branches → Add "main"
4. Click "Save protection rules"
```

### 5.2 Create Destroy Environment (Optional)

```bash
1. Create another environment named "production-destroy"
2. Add protection rules:
   ✅ Required reviewers: Add multiple reviewers
   ✅ Wait timer: 5 minutes (gives time to cancel)
3. This prevents accidental infrastructure destruction
```

## Step 6: Vercel Setup (5 minutes)

### 6.1 Import Repository

```bash
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: .next
```

### 6.2 Add Environment Variables

```bash
# In Vercel dashboard → Settings → Environment Variables
Add:
  NEXT_PUBLIC_API_URL = https://api.yourapp.com
  (or http://your-ec2-ip:8080 for testing)
```

### 6.3 Enable Auto Deployments

```bash
# In Vercel dashboard → Settings → Git
Ensure these are enabled:
✅ Production Branch: main
✅ Preview Deployments: Enabled
✅ Automatic Deployments from GitHub: Enabled
```

## Step 7: Test Workflows (5 minutes)

### 7.1 Test Backend Deployment

```bash
# Option 1: Push a change
cd backend
# Make a small change
echo "// test" >> src/main.rs
git add .
git commit -m "test: trigger backend deployment"
git push origin main

# Option 2: Manual trigger
# Go to Actions → Deploy Backend → Run workflow
```

### 7.2 Test Terraform Workflow

```bash
# Create a test branch
git checkout -b test-terraform

# Make a small change to infrastructure
cd infrastructure
# Edit a .tf file
git add .
git commit -m "test: terraform workflow"
git push origin test-terraform

# Create PR and check if plan is posted
```

### 7.3 Test Frontend Deployment

```bash
# Push any change to frontend
cd frontend
# Make a change
echo "// test" >> src/app/page.tsx
git add .
git commit -m "test: frontend deployment"
git push origin main

# Check Vercel dashboard for deployment
```

## Step 8: Verify Everything Works

### 8.1 Backend Health Check

```bash
# Wait for deployment to complete, then:
curl http://your-ec2-ip:8080/health

# Should return: {"status": "ok"} or similar
```

### 8.2 Check Service Status

```bash
# SSH to EC2
ssh ubuntu@your-ec2-ip

# Check service
sudo systemctl status grand-archive-api

# View logs
sudo journalctl -u grand-archive-api -n 50
```

### 8.3 Frontend Check

```bash
# Visit your Vercel URL
https://your-app.vercel.app

# Check if it loads correctly
```

## Troubleshooting Checklist

If something doesn't work, check:

- [ ] All GitHub secrets are set correctly
- [ ] AWS OIDC role trust policy includes your repository
- [ ] EC2 security group allows SSH from anywhere (or GitHub Actions IPs)
- [ ] EC2 SSH key is correct and has proper permissions
- [ ] MongoDB URI is correct and accessible from EC2
- [ ] Terraform state bucket exists and is accessible
- [ ] Vercel project is linked to GitHub repository

## Quick Reference

### GitHub Secrets
```
AWS_REGION=us-east-1
AWS_ACCOUNT_ID=123456789012
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/github-actions-grand-archive
TF_STATE_BUCKET=grand-archive-terraform-state-abc123
EC2_HOST=ec2-1-2-3-4.compute-1.amazonaws.com
EC2_PRIVATE_KEY=<contents of private key file>
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
```

### Useful Commands

```bash
# View workflow runs
gh run list

# View workflow logs
gh run view <run-id> --log

# Re-run failed workflow
gh run rerun <run-id>

# List secrets
gh secret list

# SSH to EC2
ssh ubuntu@$EC2_HOST

# Check service logs
sudo journalctl -u grand-archive-api -f

# Restart service
sudo systemctl restart grand-archive-api
```

## Next Steps

1. Set up monitoring (CloudWatch, Datadog, etc.)
2. Configure alerts for deployment failures
3. Set up database backups
4. Enable CloudWatch logs for API
5. Add custom domain to Vercel
6. Set up SSL certificate for backend
7. Configure API rate limiting

## Support

If you encounter issues:
1. Check the detailed README.md in this directory
2. Review workflow logs in GitHub Actions
3. Check AWS CloudWatch logs
4. Verify all secrets are correct
5. Create an issue with error details

---

**Setup Time**: ~30 minutes
**Difficulty**: Intermediate
**Last Updated**: 2025-10-26
