# Terraform Commands Quick Reference

## Initial Setup

```bash
# Initialize Terraform (download providers)
terraform init

# Validate configuration syntax
terraform validate

# Format code according to Terraform standards
terraform fmt -recursive
```

## Planning and Deployment

```bash
# Create and review execution plan
terraform plan

# Save plan to file for review
terraform plan -out=tfplan

# Apply changes (interactive)
terraform apply

# Apply saved plan
terraform apply tfplan

# Apply without confirmation (use with caution!)
terraform apply -auto-approve
```

## Viewing State and Outputs

```bash
# Show all outputs
terraform output

# Show specific output value
terraform output ec2_public_ip
terraform output api_gateway_url

# Show raw output (no quotes)
terraform output -raw ec2_public_ip

# List all resources in state
terraform state list

# Show details of specific resource
terraform state show aws_instance.api_server

# Show current state
terraform show
```

## Targeting Specific Resources

```bash
# Plan changes for specific resource
terraform plan -target=aws_instance.api_server

# Apply changes to specific resource only
terraform apply -target=aws_instance.api_server

# Destroy specific resource
terraform destroy -target=aws_instance.api_server
```

## Importing Existing Resources

```bash
# Import existing EC2 instance
terraform import aws_instance.api_server i-1234567890abcdef0

# Import existing Route53 zone
terraform import aws_route53_zone.primary Z1234567890ABC
```

## State Management

```bash
# Refresh state from real infrastructure
terraform refresh

# Pull current state and display
terraform state pull

# Remove resource from state (doesn't destroy it)
terraform state rm aws_instance.api_server

# Move/rename resource in state
terraform state mv aws_instance.old_name aws_instance.new_name

# Replace a resource (destroy and recreate)
terraform apply -replace=aws_instance.api_server
```

## Destroying Resources

```bash
# Plan destruction (see what will be deleted)
terraform plan -destroy

# Destroy all infrastructure
terraform destroy

# Destroy specific resource
terraform destroy -target=aws_instance.api_server

# Destroy without confirmation (DANGER!)
terraform destroy -auto-approve
```

## Workspace Management

```bash
# List workspaces
terraform workspace list

# Create new workspace
terraform workspace new staging

# Switch workspace
terraform workspace select prod

# Show current workspace
terraform workspace show
```

## Debugging

```bash
# Enable debug logging
export TF_LOG=DEBUG
terraform apply

# Log to file
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log
terraform apply

# Disable logging
unset TF_LOG
unset TF_LOG_PATH

# Validate configuration
terraform validate

# Check for syntax errors
terraform fmt -check
```

## Graph and Visualization

```bash
# Generate dependency graph (requires graphviz)
terraform graph | dot -Tpng > graph.png

# Generate plan graph
terraform graph -type=plan | dot -Tpng > plan-graph.png
```

## Useful One-Liners

```bash
# Get SSH command from output
terraform output -raw ssh_command

# SSH into EC2 instance
ssh -i ~/.ssh/$(terraform output -raw key_name).pem ubuntu@$(terraform output -raw ec2_public_ip)

# Test API endpoint
curl $(terraform output -raw api_gateway_url)/api/health

# Watch logs
aws logs tail /aws/apigateway/grand-archive-meta --follow

# Get instance ID
terraform output -raw ec2_instance_id

# Describe EC2 instance
aws ec2 describe-instances --instance-ids $(terraform output -raw ec2_instance_id)

# Get public IP directly from AWS
aws ec2 describe-instances \
  --instance-ids $(terraform output -raw ec2_instance_id) \
  --query 'Reservations[0].Instances[0].PublicIpAddress' \
  --output text
```

## Upgrading Providers

```bash
# Update provider versions
terraform init -upgrade

# Show provider versions
terraform version

# Lock provider versions
terraform providers lock
```

## Configuration Validation

```bash
# Validate all configurations
terraform validate

# Check formatting
terraform fmt -check -recursive

# Preview formatting changes
terraform fmt -diff

# Apply formatting
terraform fmt -recursive
```

## Remote State (for teams)

```bash
# Initialize with backend configuration
terraform init -backend-config="bucket=my-terraform-state"

# Reconfigure backend
terraform init -reconfigure

# Migrate state to new backend
terraform init -migrate-state
```

## Common Workflows

### Initial Deployment
```bash
cd infrastructure
terraform init
terraform plan
terraform apply
terraform output > deployment-info.txt
```

### Update Infrastructure
```bash
# Make changes to .tf files
terraform fmt
terraform validate
terraform plan
terraform apply
```

### Rollback Changes
```bash
# If you have a previous state backup
terraform state push terraform.tfstate.backup

# Or destroy and recreate specific resources
terraform destroy -target=resource.name
terraform apply
```

### Inspect Specific Resource
```bash
terraform state show aws_instance.api_server
terraform show -json | jq '.values.root_module.resources[] | select(.address=="aws_instance.api_server")'
```

### Export All Outputs as JSON
```bash
terraform output -json > outputs.json
```

## Tips and Best Practices

1. Always run `terraform plan` before `apply`
2. Use `-target` carefully - it can cause state drift
3. Keep state files secure and backed up
4. Use workspaces for managing multiple environments
5. Review the execution plan thoroughly
6. Use version control for all `.tf` files
7. Never commit `.tfvars` files with secrets
8. Use `terraform fmt` before committing
9. Enable state locking for team collaboration
10. Document all manual changes to infrastructure

## Environment Variables

```bash
# AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"

# Terraform variables
export TF_VAR_key_name="grand-archive-key"
export TF_VAR_instance_type="t4g.small"

# Terraform logging
export TF_LOG=DEBUG
export TF_LOG_PATH=./terraform.log
```

## Troubleshooting Commands

```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify Terraform version
terraform version

# List all providers
terraform providers

# Check state consistency
terraform plan -detailed-exitcode

# Force unlock state (if locked)
terraform force-unlock <LOCK_ID>

# Taint resource (mark for recreation)
terraform taint aws_instance.api_server

# Untaint resource
terraform untaint aws_instance.api_server
```
