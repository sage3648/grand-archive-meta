# Testing GitHub Actions Workflows

This guide shows how to test your CI/CD workflows before deploying to production.

## Table of Contents

- [Local Testing](#local-testing)
- [Testing in GitHub](#testing-in-github)
- [Workflow Debugging](#workflow-debugging)
- [Common Test Scenarios](#common-test-scenarios)

## Local Testing

### 1. Test Setup Verification

Run the verification script to check your local setup:

```bash
cd /Users/sage/Programming/grand-archive-meta/.github/workflows
./verify-setup.sh
```

This script checks:
- Git repository configuration
- Directory structure
- Workflow files
- Required CLI tools
- GitHub secrets
- SSH configuration
- AWS credentials

### 2. Test Rust Build Locally

Test the backend build before pushing:

```bash
# Install cross if not already installed
cargo install cross --git https://github.com/cross-rs/cross

# Test ARM64 build
cd backend
export AWS_LC_SYS_NO_ASM=1
cross build --release --target aarch64-unknown-linux-gnu

# Check binary
ls -lh target/aarch64-unknown-linux-gnu/release/
file target/aarch64-unknown-linux-gnu/release/grand-archive-api
```

### 3. Test Terraform Locally

Validate Terraform configuration:

```bash
cd infrastructure

# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Format check
terraform fmt -check -recursive

# Plan (requires AWS credentials)
terraform plan
```

### 4. Test Frontend Locally

Test the frontend build:

```bash
cd frontend

# Install dependencies
npm install

# Run linter
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Test locally
npm run dev
```

## Testing in GitHub

### 1. Test with Act (Local GitHub Actions)

[Act](https://github.com/nektos/act) runs GitHub Actions locally:

```bash
# Install act
# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act push -W .github/workflows/deploy-backend.yml

# Run specific job
act -j build -W .github/workflows/deploy-backend.yml

# Use specific runner
act -P ubuntu-latest=catthehacker/ubuntu:act-latest
```

**Note**: Act has limitations and may not perfectly replicate GitHub's environment.

### 2. Test with Draft PRs

Create a draft PR to test workflows without deploying:

```bash
# Create test branch
git checkout -b test/workflow-changes

# Make changes
# ... edit files ...

# Commit and push
git add .
git commit -m "test: workflow changes"
git push origin test/workflow-changes

# Create draft PR
gh pr create --draft --title "Test: Workflow Changes" --body "Testing workflow modifications"
```

Draft PRs trigger workflows but are clearly marked as non-production.

### 3. Use Workflow Dispatch

Test workflows manually using workflow_dispatch:

```bash
# Via GitHub CLI
gh workflow run deploy-backend.yml

# Via GitHub Web UI
# Go to Actions → Select workflow → Run workflow
```

### 4. Test with Feature Branches

Create a feature branch for testing:

```bash
# Create feature branch
git checkout -b feature/test-deployment

# Modify path filters temporarily (optional)
# Edit .github/workflows/deploy-backend.yml
# Change:
#   paths:
#     - 'backend/**'
# To:
#   paths:
#     - 'backend/**'
#     - 'test/**'

# Create test file to trigger workflow
mkdir -p test
echo "test" > test/trigger.txt

# Commit and push
git add .
git commit -m "test: trigger workflow"
git push origin feature/test-deployment
```

## Workflow Debugging

### 1. Enable Debug Logging

Add secrets to repository for verbose logging:

```bash
# Using GitHub CLI
gh secret set ACTIONS_RUNNER_DEBUG -b "true"
gh secret set ACTIONS_STEP_DEBUG -b "true"
```

Or via GitHub UI:
1. Settings → Secrets and variables → Actions
2. Add `ACTIONS_RUNNER_DEBUG` = `true`
3. Add `ACTIONS_STEP_DEBUG` = `true`

Re-run the workflow to see detailed logs.

### 2. Add Debug Steps

Add debugging steps to your workflow:

```yaml
- name: Debug Information
  run: |
    echo "Event name: ${{ github.event_name }}"
    echo "Repository: ${{ github.repository }}"
    echo "Branch: ${{ github.ref }}"
    echo "Commit: ${{ github.sha }}"
    echo "Actor: ${{ github.actor }}"
    echo "Working directory: $(pwd)"
    echo "Files:"
    ls -la

- name: Debug Environment
  run: |
    echo "=== Environment Variables ==="
    env | sort
    echo "=== System Info ==="
    uname -a
    echo "=== Disk Space ==="
    df -h
```

### 3. SSH into Runner (tmate)

Use tmate to SSH into the runner for debugging:

```yaml
- name: Setup tmate session
  uses: mxschmitt/action-tmate@v3
  if: failure()
  timeout-minutes: 15
```

This creates an SSH session if the workflow fails.

### 4. Upload Artifacts for Inspection

Upload files for later inspection:

```yaml
- name: Upload logs
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: debug-logs
    path: |
      **/*.log
      **/target/
    retention-days: 7
```

## Common Test Scenarios

### Test 1: Backend Deployment

#### Scenario: Test full backend deployment

```bash
# 1. Create test branch
git checkout -b test/backend-deploy

# 2. Make a small change to trigger workflow
echo "// Test deployment" >> backend/src/main.rs

# 3. Commit and push
git add backend/src/main.rs
git commit -m "test: trigger backend deployment"
git push origin test/backend-deploy

# 4. Watch workflow
gh run watch

# 5. Check deployment
ssh ubuntu@$EC2_HOST "sudo systemctl status grand-archive-api"

# 6. Cleanup (revert if needed)
git revert HEAD
git push origin test/backend-deploy
```

#### Expected Results:
- ✅ Build job completes successfully
- ✅ Binary is uploaded as artifact
- ✅ Deploy job completes successfully
- ✅ Service is running on EC2
- ✅ Health check passes

### Test 2: Terraform Plan

#### Scenario: Test infrastructure changes

```bash
# 1. Create test branch
git checkout -b test/terraform-changes

# 2. Make infrastructure change
cd infrastructure
# Edit a .tf file (e.g., add a tag)

# 3. Commit and push
git add .
git commit -m "test: add resource tag"
git push origin test/terraform-changes

# 4. Create PR
gh pr create --title "Test: Terraform Changes" --body "Testing terraform workflow"

# 5. Check PR comment for plan
gh pr view --web
```

#### Expected Results:
- ✅ Terraform validate passes
- ✅ Terraform plan completes
- ✅ Plan is posted as PR comment
- ✅ No unexpected changes

### Test 3: Failed Build Recovery

#### Scenario: Test workflow behavior on build failure

```bash
# 1. Create test branch
git checkout -b test/build-failure

# 2. Introduce syntax error
echo "this will not compile" >> backend/src/main.rs

# 3. Commit and push
git add .
git commit -m "test: intentional build failure"
git push origin test/build-failure

# 4. Watch workflow fail
gh run watch

# 5. Check error messages
gh run view --log
```

#### Expected Results:
- ✅ Build fails with clear error message
- ✅ Deployment does not run
- ✅ Service remains unchanged on EC2

### Test 4: SSH Connection

#### Scenario: Test SSH connectivity to EC2

```bash
# 1. Test SSH key
ssh -i ~/.ssh/github-actions-grand-archive -o StrictHostKeyChecking=no ubuntu@$EC2_HOST "echo 'SSH successful'"

# 2. Test SSH with workflow (add temporary step)
# Add to deploy-backend.yml:
# - name: Test SSH
#   run: |
#     ssh -i ~/.ssh/ec2_key ubuntu@${{ secrets.EC2_HOST }} "whoami && pwd"

# 3. Trigger workflow and check logs
```

#### Expected Results:
- ✅ SSH connection succeeds
- ✅ Commands execute on EC2
- ✅ Output is visible in logs

### Test 5: Secret Validation

#### Scenario: Verify all secrets are configured

```bash
# 1. Run verification script
./verify-setup.sh

# 2. Check for missing secrets
gh secret list

# 3. Test secret access (add temporary step)
# Add to workflow:
# - name: Test Secrets
#   run: |
#     echo "AWS Region: ${{ secrets.AWS_REGION }}"
#     echo "EC2 Host: ${{ secrets.EC2_HOST }}"
#     # DO NOT echo actual secret values!
```

#### Expected Results:
- ✅ All required secrets are set
- ✅ Secrets are accessible in workflow
- ✅ No secrets are exposed in logs

### Test 6: Health Check

#### Scenario: Test backend health endpoint

```bash
# After deployment, test health check
curl -v http://$EC2_HOST:8080/health

# Or via SSH
ssh ubuntu@$EC2_HOST "curl -v http://localhost:8080/health"

# Check response
# Expected: HTTP 200 OK with JSON body
```

#### Expected Results:
- ✅ Health endpoint responds
- ✅ Returns 200 status
- ✅ Returns valid JSON

### Test 7: Rollback Scenario

#### Scenario: Test rollback on failed deployment

```bash
# 1. Deploy current version
git checkout main
git push origin main

# 2. Note current version
ssh ubuntu@$EC2_HOST "md5sum /usr/local/bin/grand-archive-api"

# 3. Deploy broken version
git checkout -b test/broken-deploy
# Make breaking change
git add .
git commit -m "test: broken deployment"
git push origin test/broken-deploy

# 4. Workflow should fail at health check
gh run watch

# 5. Verify service is stopped (not running broken version)
ssh ubuntu@$EC2_HOST "sudo systemctl status grand-archive-api"

# 6. Redeploy working version
git checkout main
git push origin main
```

#### Expected Results:
- ✅ Broken deployment fails at health check
- ✅ Service is stopped (not running broken code)
- ✅ Redeployment succeeds
- ✅ Service is restored

## Automated Testing

### Create Test Suite

Create a test script that runs multiple checks:

```bash
#!/bin/bash
# test-workflows.sh

set -e

echo "Running workflow tests..."

# Test 1: Validate workflow syntax
echo "Test 1: Validating workflow syntax..."
for workflow in .github/workflows/*.yml; do
    echo "Validating $workflow..."
    # Note: Requires actionlint
    actionlint "$workflow"
done

# Test 2: Check secrets
echo "Test 2: Checking GitHub secrets..."
./verify-setup.sh

# Test 3: Test Terraform
echo "Test 3: Testing Terraform..."
cd infrastructure
terraform init -backend=false
terraform validate
terraform fmt -check -recursive
cd ..

# Test 4: Test backend build (if Rust installed)
if command -v cargo &> /dev/null; then
    echo "Test 4: Testing backend build..."
    cd backend
    cargo check
    cd ..
fi

echo "All tests passed!"
```

### Continuous Validation

Run tests on every commit:

```yaml
# .github/workflows/validate.yml
name: Validate

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Validate workflows
        uses: docker://rhysd/actionlint:latest
        with:
          args: -color

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Format
        run: terraform fmt -check -recursive infrastructure/

      - name: Terraform Validate
        run: |
          cd infrastructure
          terraform init -backend=false
          terraform validate
```

## Troubleshooting Tests

### Issue: Workflow doesn't trigger

**Check:**
```bash
# Verify path filters
git diff --name-only HEAD~1 HEAD

# Check workflow syntax
actionlint .github/workflows/deploy-backend.yml

# Check branch name
git branch --show-current
```

### Issue: Secrets not accessible

**Check:**
```bash
# List secrets
gh secret list

# Verify secret names match workflow
grep -r "secrets\." .github/workflows/
```

### Issue: Build fails locally but passes in CI

**Check:**
- Rust version differences
- Environment variables
- Dependency versions
- OS-specific code

### Issue: SSH connection fails

**Check:**
```bash
# Test SSH key
ssh-keygen -l -f ~/.ssh/github-actions-grand-archive

# Test connection
ssh -vvv -i ~/.ssh/github-actions-grand-archive ubuntu@$EC2_HOST

# Check security group
aws ec2 describe-security-groups --group-ids sg-xxxxx
```

## Best Practices

1. **Always test locally first** before pushing
2. **Use draft PRs** for workflow changes
3. **Enable debug logging** when troubleshooting
4. **Test with small changes** to isolate issues
5. **Monitor deployment** in real-time
6. **Keep test branches** until verified
7. **Document test results** in PR comments
8. **Clean up test branches** after validation

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Act - Local GitHub Actions](https://github.com/nektos/act)
- [actionlint - Workflow Linter](https://github.com/rhysd/actionlint)
- [GitHub Actions Toolkit](https://github.com/actions/toolkit)

---

**Last Updated**: 2025-10-26
