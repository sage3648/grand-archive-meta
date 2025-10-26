# Grand Archive Meta - Deployment Guide

Complete step-by-step guide for deploying the Grand Archive Meta platform to production.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [MongoDB Atlas Setup](#mongodb-atlas-setup)
- [AWS Infrastructure Deployment](#aws-infrastructure-deployment)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [DNS Configuration](#dns-configuration)
- [Verification](#verification)
- [Post-Deployment](#post-deployment)
- [Rollback Procedures](#rollback-procedures)
- [Troubleshooting](#troubleshooting)

## Overview

The deployment process follows this sequence:

1. Set up MongoDB Atlas database
2. Deploy AWS infrastructure (CloudFormation)
3. Build and deploy backend Lambda functions
4. Deploy frontend to Vercel
5. Configure DNS (Route 53 or domain registrar)
6. Verify end-to-end functionality

**Estimated Time**: 60-90 minutes

## Prerequisites

### Required Accounts

- [ ] AWS Account with appropriate permissions
- [ ] MongoDB Atlas account (free tier available)
- [ ] Vercel account (free tier available)
- [ ] Domain name (optional but recommended)
- [ ] GitHub account (for CI/CD)

### Required Tools

Install the following on your local machine:

```bash
# AWS CLI
brew install awscli
aws --version  # Should be >= 2.0

# Node.js and npm
brew install node
node --version  # Should be >= 20.x

# Java (for backend)
brew install openjdk@17
java --version  # Should be 17.x

# Gradle (or use wrapper)
brew install gradle
gradle --version  # Should be >= 8.x

# Vercel CLI (optional)
npm install -g vercel
```

### Required Permissions

**AWS IAM Permissions**:
- CloudFormation full access
- Lambda full access
- API Gateway full access
- S3 full access
- IAM role creation
- EventBridge full access
- CloudWatch Logs access

**MongoDB Atlas**:
- Organization Admin or Project Owner

**Vercel**:
- Project admin access

## Pre-Deployment Checklist

Before starting deployment:

- [ ] Clone repository locally
- [ ] Install all required tools
- [ ] Configure AWS CLI with credentials
- [ ] Create MongoDB Atlas account
- [ ] Create Vercel account
- [ ] Have domain name ready (if using custom domain)
- [ ] Review cost estimates (see README.md)

## MongoDB Atlas Setup

### 1. Create MongoDB Cluster

1. **Sign up or log in** to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

2. **Create a new project**:
   - Name: `grand-archive-meta`
   - Add team members if needed

3. **Create a cluster**:
   - Click "Build a Database"
   - Choose tier:
     - **Development**: M0 (Free Forever)
     - **Production**: M10 or higher
   - Cloud Provider: **AWS**
   - Region: **us-east-1** (same as Lambda)
   - Cluster Name: `grand-archive-cluster`

4. **Wait for cluster creation** (~3-5 minutes)

### 2. Configure Network Access

1. **Go to Network Access** (left sidebar)

2. **Add IP Address**:
   - Click "Add IP Address"
   - Add **0.0.0.0/0** (allow access from anywhere)
   - Note: For production, restrict to Lambda NAT Gateway IPs

### 3. Create Database User

1. **Go to Database Access** (left sidebar)

2. **Add New Database User**:
   - Authentication Method: Password
   - Username: `grand-archive-admin`
   - Password: Generate secure password (save it!)
   - Database User Privileges: **Atlas Admin**
   - Click "Add User"

### 4. Create Database

1. **Go to Collections**

2. **Create Database**:
   - Database name: `grand-archive`
   - Collection name: `decks`

3. **Create additional collections**:
   - `deck-cards`
   - `card-reference`
   - `meta-snapshots`
   - `events`
   - `scraper-audits`

### 5. Get Connection String

1. **Click "Connect"** on your cluster

2. **Choose "Connect your application"**

3. **Copy connection string**:
   ```
   mongodb+srv://grand-archive-admin:<password>@grand-archive-cluster.xxxxx.mongodb.net/grand-archive?retryWrites=true&w=majority
   ```

4. **Replace `<password>`** with your actual password

5. **Save connection string** for later use

## AWS Infrastructure Deployment

### 1. Create S3 Bucket for Deployments

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Create S3 bucket
aws s3 mb s3://grand-archive-meta-deployments-${AWS_REGION} --region ${AWS_REGION}

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket grand-archive-meta-deployments-${AWS_REGION} \
  --versioning-configuration Status=Enabled
```

### 2. Review CloudFormation Template

```bash
cd infrastructure
cat cloudformation.yml
# Review the template to understand what will be created
```

### 3. Deploy CloudFormation Stack

```bash
# Set variables
export MONGODB_URI="your-mongodb-connection-string-here"
export S3_BUCKET="grand-archive-meta-deployments-${AWS_REGION}"

# Deploy stack
aws cloudformation deploy \
  --template-file cloudformation.yml \
  --stack-name grand-archive-meta \
  --parameter-overrides \
    MongoDBConnectionString="${MONGODB_URI}" \
    S3BucketName="${S3_BUCKET}" \
    JarFileKey="grand-archive-meta-0.1-all.jar" \
  --capabilities CAPABILITY_IAM \
  --region ${AWS_REGION}
```

This will take 5-10 minutes. Monitor progress:

```bash
# Watch stack creation
aws cloudformation describe-stacks \
  --stack-name grand-archive-meta \
  --query 'Stacks[0].StackStatus' \
  --output text

# View events
aws cloudformation describe-stack-events \
  --stack-name grand-archive-meta \
  --max-items 10
```

### 4. Verify Stack Creation

```bash
# Get stack outputs
aws cloudformation describe-stacks \
  --stack-name grand-archive-meta \
  --query 'Stacks[0].Outputs' \
  --output table
```

Expected outputs:
- `ApiGatewayUrl`: API endpoint URL
- `ApiLambdaArn`: ARN of API Lambda function
- `DeckScraperLambdaArn`: ARN of deck scraper
- Additional Lambda ARNs

## Backend Deployment

### 1. Build Backend

```bash
cd backend

# Build the JAR
./gradlew clean shadowJar

# Verify build
ls -lh build/libs/grand-archive-meta-0.1-all.jar
```

### 2. Upload to S3

```bash
# Upload JAR to S3
aws s3 cp build/libs/grand-archive-meta-0.1-all.jar \
  s3://${S3_BUCKET}/grand-archive-meta-0.1-all.jar

# Verify upload
aws s3 ls s3://${S3_BUCKET}/
```

### 3. Update Lambda Functions

The JAR is now in S3, but Lambda functions need to be updated:

```bash
# Update API Lambda
aws lambda update-function-code \
  --function-name grand-archive-meta-api \
  --s3-bucket ${S3_BUCKET} \
  --s3-key grand-archive-meta-0.1-all.jar

# Publish new version (for SnapStart)
aws lambda publish-version \
  --function-name grand-archive-meta-api

# Update Deck Scraper Lambda
aws lambda update-function-code \
  --function-name grand-archive-meta-deck-scraper \
  --s3-bucket ${S3_BUCKET} \
  --s3-key grand-archive-meta-0.1-all.jar

# Update Card Scraper Lambda
aws lambda update-function-code \
  --function-name grand-archive-meta-card-scraper \
  --s3-bucket ${S3_BUCKET} \
  --s3-key grand-archive-meta-0.1-all.jar

# Update Meta Calculator Lambda
aws lambda update-function-code \
  --function-name grand-archive-meta-meta-calculator \
  --s3-bucket ${S3_BUCKET} \
  --s3-key grand-archive-meta-0.1-all.jar

# Update Manual Scraper Lambda
aws lambda update-function-code \
  --function-name grand-archive-meta-scraper-manual \
  --s3-bucket ${S3_BUCKET} \
  --s3-key grand-archive-meta-0.1-all.jar
```

### 4. Test API Lambda

```bash
# Get API Gateway URL
export API_URL=$(aws cloudformation describe-stacks \
  --stack-name grand-archive-meta \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text)

# Test health endpoint
curl ${API_URL}api/health

# Test meta endpoint
curl ${API_URL}api/meta/format/Constructed
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Frontend Deployment

### 1. Configure Environment Variables

```bash
cd frontend

# Create .env.production
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=${API_URL}api
NEXT_PUBLIC_SITE_URL=https://grandarchivemeta.com
EOF
```

### 2. Deploy to Vercel (Option A - Recommended)

**Via Vercel Dashboard**:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL`: Your API Gateway URL + `/api`
   - `NEXT_PUBLIC_SITE_URL`: Your domain
6. Click "Deploy"

**Via Vercel CLI**:

```bash
cd frontend

# Install dependencies
npm install

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Link to existing project? No
# - Project name: grand-archive-meta
# - Directory: ./
# - Override settings? No
```

### 3. Configure Environment Variables in Vercel

If using dashboard:
1. Go to Project Settings > Environment Variables
2. Add variables:
   ```
   NEXT_PUBLIC_API_URL = https://your-api-gateway-url/prod/api
   NEXT_PUBLIC_SITE_URL = https://grandarchivemeta.com
   ```

If using CLI:
```bash
# Add environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://your-api-gateway-url/prod/api

vercel env add NEXT_PUBLIC_SITE_URL production
# Paste: https://grandarchivemeta.com
```

### 4. Redeploy with Environment Variables

```bash
vercel --prod
```

## DNS Configuration

### Option A: Using Vercel DNS

1. **Add domain in Vercel**:
   - Go to Project Settings > Domains
   - Add `grandarchivemeta.com`
   - Follow Vercel's instructions to configure nameservers

2. **Configure DNS records**:
   - Vercel handles `@` and `www` automatically
   - Frontend will be served at both apex and www

### Option B: Using Route 53

1. **Create Hosted Zone**:
   ```bash
   aws route53 create-hosted-zone \
     --name grandarchivemeta.com \
     --caller-reference $(date +%s)
   ```

2. **Get nameservers**:
   ```bash
   aws route53 get-hosted-zone \
     --id YOUR_HOSTED_ZONE_ID \
     --query 'DelegationSet.NameServers'
   ```

3. **Update domain registrar**:
   - Add the 4 NS records to your domain registrar

4. **Create DNS records**:
   ```bash
   # Create record set for Vercel (apex)
   aws route53 change-resource-record-sets \
     --hosted-zone-id YOUR_HOSTED_ZONE_ID \
     --change-batch file://dns-records.json
   ```

   `dns-records.json`:
   ```json
   {
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "grandarchivemeta.com",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [
             {"Value": "cname.vercel-dns.com"}
           ]
         }
       },
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "www.grandarchivemeta.com",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [
             {"Value": "cname.vercel-dns.com"}
           ]
         }
       }
     ]
   }
   ```

### Option C: Using Existing DNS Provider

1. **Add CNAME records** in your DNS provider:
   ```
   @ CNAME cname.vercel-dns.com
   www CNAME cname.vercel-dns.com
   ```

2. **Wait for DNS propagation** (up to 48 hours)

## Verification

### 1. Test Frontend

```bash
# Test production URL
curl -I https://grandarchivemeta.com

# Expected: HTTP 200 OK
```

Open in browser: `https://grandarchivemeta.com`

### 2. Test Backend API

```bash
# Test via API Gateway
curl ${API_URL}api/meta/format/Constructed

# Should return JSON with meta data
```

### 3. Test End-to-End

1. Open `https://grandarchivemeta.com/meta`
2. Verify meta dashboard loads
3. Check browser console for errors
4. Test navigation to decks page
5. Search for a card

### 4. Verify Scheduled Jobs

```bash
# Check EventBridge rules
aws events list-rules \
  --name-prefix FabMetaDaily

# Manually trigger deck scraper (optional)
aws lambda invoke \
  --function-name grand-archive-meta-deck-scraper \
  --payload '{}' \
  response.json

cat response.json
```

### 5. Check CloudWatch Logs

```bash
# View API Lambda logs
aws logs tail /aws/lambda/grand-archive-meta-api --follow

# View Deck Scraper logs
aws logs tail /aws/lambda/grand-archive-meta-deck-scraper --follow
```

## Post-Deployment

### 1. Enable GitHub Actions (CI/CD)

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'corretto'

      - name: Build with Gradle
        run: |
          cd backend
          ./gradlew shadowJar

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Upload to S3
        run: |
          aws s3 cp backend/build/libs/grand-archive-meta-0.1-all.jar \
            s3://${{ secrets.S3_BUCKET }}/grand-archive-meta-0.1-all.jar

      - name: Update Lambda functions
        run: |
          for function in grand-archive-meta-api grand-archive-meta-deck-scraper grand-archive-meta-card-scraper; do
            aws lambda update-function-code \
              --function-name $function \
              --s3-bucket ${{ secrets.S3_BUCKET }} \
              --s3-key grand-archive-meta-0.1-all.jar
          done
```

**Add GitHub Secrets**:
1. Go to repository Settings > Secrets and variables > Actions
2. Add:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `S3_BUCKET`

### 2. Set Up Monitoring

**CloudWatch Alarms**:

```bash
# Create alarm for API errors
aws cloudwatch put-metric-alarm \
  --alarm-name grand-archive-api-errors \
  --alarm-description "Alert on API Lambda errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 10 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=grand-archive-meta-api \
  --evaluation-periods 1 \
  --datapoints-to-alarm 1
```

### 3. Schedule Backups

MongoDB Atlas automatically backs up M10+ clusters. For M0 (free tier):
- Export data periodically using `mongodump`
- Store exports in S3

### 4. Documentation

Update documentation with:
- Production URLs
- Deployment dates
- Known issues
- Contact information

## Rollback Procedures

### Rollback Backend

```bash
# List Lambda versions
aws lambda list-versions-by-function \
  --function-name grand-archive-meta-api

# Rollback to previous version
aws lambda update-function-configuration \
  --function-name grand-archive-meta-api \
  --publish-version $PREVIOUS_VERSION
```

### Rollback Frontend

```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find previous successful deployment
# 3. Click "..." > "Promote to Production"

# Or via CLI:
vercel rollback
```

### Rollback Infrastructure

```bash
# Delete and recreate stack with previous template
aws cloudformation delete-stack --stack-name grand-archive-meta

# Wait for deletion
aws cloudformation wait stack-delete-complete \
  --stack-name grand-archive-meta

# Redeploy with previous template version
aws cloudformation deploy \
  --template-file cloudformation.yml.backup \
  --stack-name grand-archive-meta \
  --capabilities CAPABILITY_IAM
```

## Troubleshooting

### Issue: Lambda Timeout

**Symptoms**: API returns 504 errors

**Solution**:
```bash
# Increase Lambda timeout
aws lambda update-function-configuration \
  --function-name grand-archive-meta-api \
  --timeout 60
```

### Issue: MongoDB Connection Failed

**Symptoms**: 500 errors, logs show connection errors

**Solution**:
1. Check MongoDB Atlas network access (0.0.0.0/0 allowed)
2. Verify connection string is correct
3. Test connection from Lambda:
   ```bash
   aws lambda invoke \
     --function-name grand-archive-meta-api \
     --payload '{"httpMethod":"GET","path":"/api/health"}' \
     response.json
   ```

### Issue: Frontend Not Updating

**Symptoms**: Changes not reflected on site

**Solution**:
```bash
# Clear Vercel cache
vercel --prod --force

# Or in dashboard: Settings > General > Clear Cache
```

### Issue: DNS Not Resolving

**Symptoms**: Domain doesn't load

**Solution**:
```bash
# Check DNS propagation
dig grandarchivemeta.com

# Verify Vercel configuration
vercel domains ls

# Check nameservers
whois grandarchivemeta.com
```

### Issue: High AWS Costs

**Solution**:
1. Review CloudWatch metrics for Lambda invocations
2. Consider removing provisioned concurrency
3. Reduce warmup frequency
4. Check for infinite loops in scrapers

---

**Deployment Complete!**

Your Grand Archive Meta platform is now live. Monitor CloudWatch logs and Vercel analytics for any issues.

**Next Steps**:
- Set up custom domain
- Configure Google Analytics
- Enable error monitoring (Sentry)
- Create status page
- Set up automated backups
