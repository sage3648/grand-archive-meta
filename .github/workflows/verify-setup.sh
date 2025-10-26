#!/bin/bash
# verify-setup.sh - Verify GitHub Actions CI/CD setup
# Usage: ./verify-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Print functions
print_header() {
    echo -e "\n${BLUE}===================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}===================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
}

print_error() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((CHECKS_WARNING++))
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check GitHub CLI
check_gh_cli() {
    print_header "Checking GitHub CLI"

    if command_exists gh; then
        print_success "GitHub CLI is installed"
        gh --version

        if gh auth status >/dev/null 2>&1; then
            print_success "GitHub CLI is authenticated"
        else
            print_error "GitHub CLI is not authenticated"
            print_info "Run: gh auth login"
        fi
    else
        print_error "GitHub CLI is not installed"
        print_info "Install from: https://github.com/cli/cli#installation"
    fi
}

# Check AWS CLI
check_aws_cli() {
    print_header "Checking AWS CLI"

    if command_exists aws; then
        print_success "AWS CLI is installed"
        aws --version

        if aws sts get-caller-identity >/dev/null 2>&1; then
            print_success "AWS CLI is configured"
            aws sts get-caller-identity
        else
            print_warning "AWS CLI is not configured or credentials are invalid"
            print_info "Run: aws configure"
        fi
    else
        print_error "AWS CLI is not installed"
        print_info "Install from: https://aws.amazon.com/cli/"
    fi
}

# Check Terraform
check_terraform() {
    print_header "Checking Terraform"

    if command_exists terraform; then
        print_success "Terraform is installed"
        terraform version
    else
        print_error "Terraform is not installed"
        print_info "Install from: https://www.terraform.io/downloads"
    fi
}

# Check GitHub secrets
check_github_secrets() {
    print_header "Checking GitHub Secrets"

    if ! command_exists gh; then
        print_error "Cannot check secrets: GitHub CLI not installed"
        return
    fi

    if ! gh auth status >/dev/null 2>&1; then
        print_error "Cannot check secrets: GitHub CLI not authenticated"
        return
    fi

    required_secrets=(
        "AWS_REGION"
        "AWS_ACCOUNT_ID"
        "AWS_ROLE_ARN"
        "TF_STATE_BUCKET"
        "EC2_HOST"
        "EC2_PRIVATE_KEY"
        "MONGODB_URI"
    )

    for secret in "${required_secrets[@]}"; do
        if gh secret list | grep -q "^$secret"; then
            print_success "Secret '$secret' is set"
        else
            print_error "Secret '$secret' is NOT set"
            print_info "Set it with: gh secret set $secret -b 'value'"
        fi
    done
}

# Check workflow files
check_workflow_files() {
    print_header "Checking Workflow Files"

    workflows=(
        ".github/workflows/deploy-backend.yml"
        ".github/workflows/terraform.yml"
        ".github/workflows/deploy-frontend.yml"
    )

    for workflow in "${workflows[@]}"; do
        if [ -f "$workflow" ]; then
            print_success "Workflow file exists: $workflow"

            # Check for syntax errors using GitHub CLI
            if command_exists gh && gh auth status >/dev/null 2>&1; then
                # Note: This requires the workflow to be committed
                print_info "Syntax validation requires committed workflows"
            fi
        else
            print_error "Workflow file missing: $workflow"
        fi
    done
}

# Check SSH key
check_ssh_key() {
    print_header "Checking SSH Configuration"

    if [ -f "$HOME/.ssh/github-actions-grand-archive" ]; then
        print_success "SSH private key exists"

        # Check key permissions
        perms=$(stat -f "%OLp" "$HOME/.ssh/github-actions-grand-archive" 2>/dev/null || stat -c "%a" "$HOME/.ssh/github-actions-grand-archive" 2>/dev/null)
        if [ "$perms" = "600" ]; then
            print_success "SSH key has correct permissions (600)"
        else
            print_warning "SSH key permissions are $perms, should be 600"
            print_info "Fix with: chmod 600 ~/.ssh/github-actions-grand-archive"
        fi

        # Check if public key exists
        if [ -f "$HOME/.ssh/github-actions-grand-archive.pub" ]; then
            print_success "SSH public key exists"
        else
            print_warning "SSH public key not found"
        fi
    else
        print_warning "SSH key not found at ~/.ssh/github-actions-grand-archive"
        print_info "Generate with: ssh-keygen -t ed25519 -C 'github-actions' -f ~/.ssh/github-actions-grand-archive"
    fi
}

# Check EC2 connectivity
check_ec2_connectivity() {
    print_header "Checking EC2 Connectivity"

    if ! command_exists gh || ! gh auth status >/dev/null 2>&1; then
        print_warning "Cannot check EC2: GitHub CLI not available"
        return
    fi

    # Get EC2 host from secrets (if possible)
    print_info "EC2 connectivity check requires EC2_HOST to be set"
    print_info "Manual test: ssh -i ~/.ssh/github-actions-grand-archive ubuntu@EC2_HOST"
}

# Check S3 bucket
check_s3_bucket() {
    print_header "Checking S3 Bucket for Terraform State"

    if ! command_exists aws; then
        print_warning "Cannot check S3: AWS CLI not installed"
        return
    fi

    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        print_warning "Cannot check S3: AWS credentials not configured"
        return
    fi

    print_info "S3 bucket check requires TF_STATE_BUCKET to be set"
    print_info "Manual test: aws s3 ls s3://YOUR-BUCKET-NAME"
}

# Check MongoDB connection
check_mongodb() {
    print_header "Checking MongoDB Connection"

    if command_exists mongosh; then
        print_success "mongosh is installed"
        print_info "MongoDB connection requires MONGODB_URI secret"
        print_info "Manual test: mongosh 'MONGODB_URI' --eval \"db.adminCommand('ping')\""
    else
        print_warning "mongosh is not installed (optional for local testing)"
        print_info "Install from: https://www.mongodb.com/docs/mongodb-shell/install/"
    fi
}

# Check Rust toolchain
check_rust() {
    print_header "Checking Rust Toolchain"

    if command_exists rustc; then
        print_success "Rust is installed"
        rustc --version

        if command_exists cargo; then
            print_success "Cargo is installed"
            cargo --version
        fi
    else
        print_warning "Rust is not installed (not required if using GitHub Actions)"
        print_info "Install from: https://rustup.rs/"
    fi
}

# Check Node.js
check_nodejs() {
    print_header "Checking Node.js"

    if command_exists node; then
        print_success "Node.js is installed"
        node --version

        if command_exists npm; then
            print_success "npm is installed"
            npm --version
        fi
    else
        print_warning "Node.js is not installed (not required if using Vercel)"
        print_info "Install from: https://nodejs.org/"
    fi
}

# Check Git repository
check_git_repo() {
    print_header "Checking Git Repository"

    if git rev-parse --git-dir >/dev/null 2>&1; then
        print_success "Inside a Git repository"

        # Check remote
        if git remote get-url origin >/dev/null 2>&1; then
            remote=$(git remote get-url origin)
            print_success "Remote origin: $remote"

            # Check if it's a GitHub repo
            if [[ $remote == *"github.com"* ]]; then
                print_success "Repository is on GitHub"
            else
                print_warning "Repository is not on GitHub"
            fi
        else
            print_warning "No remote 'origin' configured"
        fi

        # Check current branch
        branch=$(git rev-parse --abbrev-ref HEAD)
        print_info "Current branch: $branch"

    else
        print_error "Not inside a Git repository"
    fi
}

# Check directory structure
check_directory_structure() {
    print_header "Checking Directory Structure"

    required_dirs=(
        "backend"
        "frontend"
        "infrastructure"
        ".github/workflows"
    )

    for dir in "${required_dirs[@]}"; do
        if [ -d "$dir" ]; then
            print_success "Directory exists: $dir"
        else
            print_warning "Directory missing: $dir"
        fi
    done
}

# Check environment files
check_env_files() {
    print_header "Checking Environment Files"

    if [ -f ".github/workflows/.env.example" ]; then
        print_success "Environment template exists"
    else
        print_warning "Environment template missing"
    fi

    # Check for accidental committed secrets
    if [ -f ".env" ]; then
        print_error "Found .env file in root - ensure it's in .gitignore!"
    fi

    if [ -f ".github/workflows/.env" ]; then
        print_error "Found .env file in workflows - ensure it's in .gitignore!"
    fi
}

# Print summary
print_summary() {
    print_header "Summary"

    total=$((CHECKS_PASSED + CHECKS_FAILED + CHECKS_WARNING))

    echo -e "${GREEN}Passed:${NC}   $CHECKS_PASSED"
    echo -e "${RED}Failed:${NC}   $CHECKS_FAILED"
    echo -e "${YELLOW}Warnings:${NC} $CHECKS_WARNING"
    echo -e "Total:    $total"

    echo ""

    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✓ Setup verification complete!${NC}"
        if [ $CHECKS_WARNING -gt 0 ]; then
            echo -e "${YELLOW}⚠ Please review warnings above${NC}"
        fi
    else
        echo -e "${RED}✗ Setup verification failed!${NC}"
        echo -e "${RED}Please fix the errors above before deploying${NC}"
        exit 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║   GitHub Actions CI/CD Setup Verification Script      ║"
    echo "║   Grand Archive Meta                                   ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    check_git_repo
    check_directory_structure
    check_workflow_files
    check_env_files
    check_gh_cli
    check_aws_cli
    check_terraform
    check_ssh_key
    check_github_secrets
    check_ec2_connectivity
    check_s3_bucket
    check_mongodb
    check_rust
    check_nodejs

    print_summary
}

# Run main function
main
