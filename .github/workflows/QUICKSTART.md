# Quick Start Guide

Get your CI/CD pipeline running in 5 minutes!

## Prerequisites

- ✅ GitHub repository
- ✅ AWS account
- ✅ EC2 instance running (Ubuntu, ARM64 recommended)
- ✅ MongoDB database
- ✅ Vercel account (for frontend)

## 5-Minute Setup

### Step 1: Generate SSH Key (1 minute)

```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github-actions-grand-archive
```

Copy public key to EC2:
```bash
cat ~/.ssh/github-actions-grand-archive.pub
# SSH to EC2 and add to ~/.ssh/authorized_keys
```

### Step 2: Set GitHub Secrets (2 minutes)

```bash
# Install GitHub CLI if needed: brew install gh
gh auth login

# Set all secrets at once
gh secret set AWS_REGION -b "us-east-1"
gh secret set AWS_ACCOUNT_ID -b "YOUR_ACCOUNT_ID"
gh secret set AWS_ROLE_ARN -b "arn:aws:iam::ACCOUNT_ID:role/github-actions"
gh secret set TF_STATE_BUCKET -b "your-terraform-state-bucket"
gh secret set EC2_HOST -b "ec2-x-x-x-x.compute-1.amazonaws.com"
gh secret set MONGODB_URI -b "mongodb+srv://user:pass@cluster.mongodb.net/db"
gh secret set EC2_PRIVATE_KEY < ~/.ssh/github-actions-grand-archive
```

### Step 3: Setup Vercel (1 minute)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Set root directory: `frontend`
4. Add environment variable: `NEXT_PUBLIC_API_URL=http://your-ec2-ip:8080`
5. Deploy!

### Step 4: Test Deployment (1 minute)

```bash
# Trigger backend deployment
echo "// test" >> backend/src/main.rs
git add .
git commit -m "test: trigger deployment"
git push origin main

# Watch it deploy
gh run watch
```

### Step 5: Verify (30 seconds)

```bash
# Check backend health
curl http://your-ec2-ip:8080/health

# Check frontend
open https://your-app.vercel.app
```

## That's It!

Your CI/CD pipeline is now active! 🎉

Every time you push to `main`:
- Backend builds and deploys automatically
- Frontend deploys via Vercel
- Infrastructure updates via Terraform (if changed)

## Next Steps

1. Read [README.md](README.md) for detailed documentation
2. Review [SETUP-GUIDE.md](SETUP-GUIDE.md) for comprehensive setup
3. Check [TESTING.md](TESTING.md) for testing workflows
4. Use [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md) before deploying

## Troubleshooting

**Workflow not running?**
```bash
# Check workflow files
ls -la .github/workflows/

# View workflow logs
gh run list
gh run view <run-id> --log
```

**SSH failing?**
```bash
# Test SSH connection
ssh -i ~/.ssh/github-actions-grand-archive ubuntu@your-ec2-host

# Check security group allows SSH
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

**Build failing?**
```bash
# Test build locally
cd backend
cross build --release --target aarch64-unknown-linux-gnu
```

**Need help?** Check [README.md](README.md#troubleshooting) or run:
```bash
./verify-setup.sh
```

## Common Commands

```bash
# Trigger workflow manually
gh workflow run deploy-backend.yml

# View recent runs
gh run list --limit 5

# Watch current run
gh run watch

# View logs
gh run view --log

# List secrets
gh secret list

# Check service on EC2
ssh ubuntu@$EC2_HOST "sudo systemctl status grand-archive-api"

# View logs on EC2
ssh ubuntu@$EC2_HOST "sudo journalctl -u grand-archive-api -n 50"
```

---

**Time to setup**: ~5 minutes
**Difficulty**: Easy
**Support**: Check README.md for detailed troubleshooting
