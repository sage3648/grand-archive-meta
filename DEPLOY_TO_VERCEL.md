# Deploying Grand Archive Meta Frontend to Vercel

**Complete step-by-step guide for deploying the Grand Archive Meta frontend to Vercel with custom domain configuration.**

**Estimated Time**: 30-45 minutes
**Difficulty**: Beginner-friendly

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Push to GitHub](#step-1-push-to-github)
3. [Step 2: Connect Vercel](#step-2-connect-vercel)
4. [Step 3: Environment Variables](#step-3-environment-variables)
5. [Step 4: Deploy](#step-4-deploy)
6. [Step 5: Custom Domain Setup](#step-5-custom-domain-setup)
7. [Step 6: Production Configuration](#step-6-production-configuration)
8. [Step 7: Continuous Deployment](#step-7-continuous-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Post-Deployment Checklist](#post-deployment-checklist)
11. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

Before you begin, ensure you have the following:

### Required Accounts

- [ ] **GitHub Account**: Sign up at [github.com](https://github.com)
- [ ] **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier is sufficient)
- [ ] **Backend Running**: Your backend API must be deployed and accessible
  - AWS EC2 instance (production)
  - Or local backend for testing (development)
- [ ] **Domain Names** (optional but recommended):
  - `grandarchivemeta.com` (primary)
  - `grandarchivemeta.net` (redirect to .com)

### Required Tools

Install these on your local machine:

```bash
# Git (check if installed)
git --version
# If not installed: brew install git

# Node.js (v20.x or higher)
node --version
npm --version
# If not installed: brew install node

# Vercel CLI (optional, for command-line deployment)
npm install -g vercel
vercel --version
```

### Backend Requirements

Your backend API must be deployed and accessible. You'll need:

- **API URL**: The full URL to your backend API
  - Example: `https://api.grandarchivemeta.com/api`
  - Or AWS API Gateway URL: `https://abc123.execute-api.us-east-1.amazonaws.com/prod/api`

**Note**: If your backend isn't deployed yet, see [DEPLOYMENT.md](./DEPLOYMENT.md) for complete backend deployment instructions.

---

## Step 1: Push to GitHub

### 1.1 Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **+** icon in the top-right corner
3. Select **New repository**
4. Configure repository:
   - **Repository name**: `grand-archive-meta`
   - **Description**: "Grand Archive TCG Meta Game Tracker and Statistics"
   - **Visibility**: Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### 1.2 Initialize Git (if not already done)

Navigate to your project directory:

```bash
cd /Users/sage/Programming/grand-archive-meta
```

Check if Git is already initialized:

```bash
git status
```

**If you see "not a git repository"**, initialize Git:

```bash
# Initialize Git repository
git init

# Add all files to staging
git add .

# Create first commit
git commit -m "Initial commit: Grand Archive Meta platform

- Next.js 15 frontend with TypeScript
- Kotlin backend with AWS Lambda
- MongoDB database integration
- Meta tracking and deck statistics

🤖 Generated with Claude Code"
```

**If Git is already initialized**, skip to step 1.3.

### 1.3 Add Remote and Push

Copy the repository URL from GitHub (looks like `https://github.com/yourusername/grand-archive-meta.git`).

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/yourusername/grand-archive-meta.git

# Verify remote was added
git remote -v

# Push to GitHub (use main or master based on your default branch)
git branch -M main
git push -u origin main
```

**Authentication**: If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your GitHub password)
  - Generate token at: Settings > Developer settings > Personal access tokens > Tokens (classic)
  - Select scopes: `repo` (full control of private repositories)

### 1.4 Verify Push

Go to your GitHub repository URL in a browser. You should see all your project files.

**Checkpoint**: Your code is now on GitHub and ready to be deployed!

---

## Step 2: Connect Vercel

### 2.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Sign Up**
3. Choose **Continue with GitHub** (recommended for easier integration)
4. Authorize Vercel to access your GitHub account

### 2.2 Import Repository

1. From the Vercel Dashboard, click **Add New...** → **Project**
2. You'll see "Import Git Repository" section
3. Find your `grand-archive-meta` repository
   - If you don't see it, click **Adjust GitHub App Permissions**
   - Grant Vercel access to the repository
4. Click **Import** next to your repository

### 2.3 Configure Project Settings

Vercel will detect Next.js automatically. Configure these settings:

```
┌─────────────────────────────────────────────┐
│ Configure Project                           │
├─────────────────────────────────────────────┤
│                                             │
│ Framework Preset:                           │
│ ┌──────────────────────────────────────┐   │
│ │ Next.js  [Detected ✓]               │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ Root Directory:                             │
│ ┌──────────────────────────────────────┐   │
│ │ frontend/                            │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ Build Command:                              │
│ ┌──────────────────────────────────────┐   │
│ │ npm run build                        │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ Output Directory:                           │
│ ┌──────────────────────────────────────┐   │
│ │ .next                                │   │
│ └──────────────────────────────────────┘   │
│                                             │
│ Install Command:                            │
│ ┌──────────────────────────────────────┐   │
│ │ npm install                          │   │
│ └──────────────────────────────────────┘   │
│                                             │
└─────────────────────────────────────────────┘
```

**Important**: Set **Root Directory** to `frontend/` because the Next.js app is in a subdirectory.

**DO NOT click Deploy yet!** We need to add environment variables first.

### 2.4 Configure Build Settings

Under "Build and Output Settings", verify:

- **Build Command**: `npm run build` (or leave default)
- **Output Directory**: `.next` (or leave default)
- **Install Command**: `npm install` (or leave default)

---

## Step 3: Environment Variables

Before deploying, you must configure environment variables. These tell your frontend where to find the backend API.

### 3.1 Locate Your API URL

You need your backend API URL. This depends on how you deployed the backend:

**Option A: AWS API Gateway** (most common for production)
```bash
# If you deployed with CloudFormation, get the URL:
aws cloudformation describe-stacks \
  --stack-name grand-archive-meta \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
  --output text
```

Example output: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/`

**Option B: Custom Domain**
```
https://api.grandarchivemeta.com/
```

**Option C: Local Development**
```
http://localhost:8080/
```

### 3.2 Add Environment Variables in Vercel

Still on the "Configure Project" page:

1. Click on **Environment Variables** section (expand if needed)
2. Add these variables:

#### Variable 1: NEXT_PUBLIC_API_URL

```
┌────────────────────────────────────────────────┐
│ Name:  NEXT_PUBLIC_API_URL                    │
│ Value: https://your-api-url.com/api           │
│                                                │
│ ☑ Production  ☑ Preview  ☑ Development       │
└────────────────────────────────────────────────┘
```

**Important**:
- Include `/api` at the end
- Do NOT include trailing slash
- Example: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod/api`

#### Variable 2: NEXT_PUBLIC_SITE_URL

```
┌────────────────────────────────────────────────┐
│ Name:  NEXT_PUBLIC_SITE_URL                   │
│ Value: https://grandarchivemeta.com            │
│                                                │
│ ☑ Production  ☑ Preview  ☐ Development       │
└────────────────────────────────────────────────┘
```

**Important**:
- Use your custom domain if you have one
- Or use `https://grand-archive-meta.vercel.app` initially
- No trailing slash

#### Variable 3: NEXT_PUBLIC_SITE_NAME (Optional)

```
┌────────────────────────────────────────────────┐
│ Name:  NEXT_PUBLIC_SITE_NAME                  │
│ Value: Grand Archive Meta                     │
│                                                │
│ ☑ Production  ☑ Preview  ☑ Development       │
└────────────────────────────────────────────────┘
```

### 3.3 Verify Environment Variables

Before proceeding, double-check:

- [ ] `NEXT_PUBLIC_API_URL` ends with `/api` (no trailing slash)
- [ ] `NEXT_PUBLIC_SITE_URL` is your domain (no trailing slash)
- [ ] All variables are enabled for Production
- [ ] API URL is accessible (test with `curl https://your-api-url/api/health`)

**Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser.**

---

## Step 4: Deploy

### 4.1 Trigger First Deployment

1. After adding environment variables, click **Deploy**
2. Vercel will:
   - Clone your repository
   - Install dependencies (`npm install`)
   - Build your Next.js app (`npm run build`)
   - Deploy to Vercel's edge network

### 4.2 Monitor Build Logs

You'll see a live build log:

```
Running "npm install"
▲ Installing dependencies...
✓ Dependencies installed

Building...
▲ Creating an optimized production build...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (10/10)
✓ Collecting build traces
✓ Finalizing page optimization

Route (app)                                Size
┌ ○ /                                     142 kB
├ ○ /about                                 89 kB
├ ○ /cards                                157 kB
├ ○ /champions                            134 kB
├ ○ /decklists                            145 kB
└ ○ /meta                                 167 kB

○ (Static)  prerendered as static content

✓ Build completed successfully
```

**Build time**: Typically 2-5 minutes

### 4.3 Deployment Success

Once complete, you'll see:

```
✓ Build completed successfully
✓ Deployment ready

Your project has been deployed!

https://grand-archive-meta-abc123.vercel.app
```

### 4.4 Test Deployed Site

1. Click on the deployment URL
2. Verify the homepage loads
3. Check browser console for errors (F12 → Console)
4. Test navigation:
   - Go to `/meta` page
   - Go to `/cards` page
   - Go to `/decklists` page
5. Verify API calls work:
   - Open Network tab (F12 → Network)
   - Refresh page
   - Look for API requests (should be `200 OK`)

**If you see errors**, proceed to [Troubleshooting](#troubleshooting).

---

## Step 5: Custom Domain Setup

Now let's connect your custom domain (`grandarchivemeta.com` and `grandarchivemeta.net`).

### 5.1 Add Primary Domain (grandarchivemeta.com)

1. In Vercel Dashboard, go to your project
2. Click **Settings** tab
3. Click **Domains** in the sidebar
4. In the "Add Domain" field, enter: `grandarchivemeta.com`
5. Click **Add**

Vercel will show you DNS configuration instructions.

### 5.2 Configure DNS in Route 53 (AWS)

If you purchased domains through AWS Route 53 or use it for DNS:

#### Create Hosted Zone (if not exists)

```bash
# Create hosted zone for primary domain
aws route53 create-hosted-zone \
  --name grandarchivemeta.com \
  --caller-reference $(date +%s)
```

Save the Hosted Zone ID from the output.

#### Get Vercel DNS Records

Vercel will show you the records to add. Typically:

```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

#### Add DNS Records

Create a file `dns-records-vercel.json`:

```json
{
  "Comment": "Add Vercel DNS records for frontend",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "grandarchivemeta.com",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "76.76.21.21",
          "HostedZoneId": "Z2FDTNDATAQYW2",
          "EvaluateTargetHealth": false
        }
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.grandarchivemeta.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {
            "Value": "cname.vercel-dns.com"
          }
        ]
      }
    }
  ]
}
```

**Important**: Vercel provides specific IP addresses. Use the ones shown in your Vercel dashboard.

Apply the DNS records:

```bash
# Replace YOUR_HOSTED_ZONE_ID with your actual zone ID
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_HOSTED_ZONE_ID \
  --change-batch file://dns-records-vercel.json
```

### 5.3 Configure DNS via Domain Registrar

If you're NOT using Route 53, configure DNS with your domain registrar:

**For Namecheap, GoDaddy, or other registrars**:

1. Log into your domain registrar
2. Go to DNS settings for `grandarchivemeta.com`
3. Add these records:

| Type  | Host | Value                  | TTL  |
|-------|------|------------------------|------|
| A     | @    | 76.76.21.21            | 3600 |
| CNAME | www  | cname.vercel-dns.com   | 3600 |

**Note**: Replace `76.76.21.21` with the IP shown in your Vercel dashboard.

### 5.4 Add Redirect Domain (grandarchivemeta.net)

1. In Vercel, click **Add Domain** again
2. Enter: `grandarchivemeta.net`
3. Click **Add**
4. Vercel will automatically redirect `.net` to `.com`

Configure DNS for `.net` the same way as `.com`:

```bash
# Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_NET_HOSTED_ZONE_ID \
  --change-batch file://dns-records-vercel-net.json
```

Or via registrar:

| Type  | Host | Value                  | TTL  |
|-------|------|------------------------|------|
| A     | @    | 76.76.21.21            | 3600 |
| CNAME | www  | cname.vercel-dns.com   | 3600 |

### 5.5 Wait for DNS Propagation

DNS changes can take time:

- **Minimum**: 5-10 minutes
- **Typical**: 1-2 hours
- **Maximum**: 24-48 hours

Check DNS propagation:

```bash
# Check DNS resolution
dig grandarchivemeta.com
dig www.grandarchivemeta.com

# Or use online tools:
# https://dnschecker.org
```

### 5.6 Wait for SSL Certificate

Once DNS is configured, Vercel automatically provisions SSL certificates (free via Let's Encrypt).

**This usually takes 5-10 minutes after DNS propagation.**

You'll see in Vercel Domains settings:
- ✓ Domain configured
- ✓ SSL certificate issued

### 5.7 Verify Domain Works

```bash
# Test HTTPS
curl -I https://grandarchivemeta.com

# Expected: HTTP/2 200
```

Open in browser: `https://grandarchivemeta.com`

**Checkpoint**: Your site is now live on your custom domain with HTTPS!

---

## Step 6: Production Configuration

Now that your site is deployed, let's optimize it for production.

### 6.1 Update Production API URL

If you were using a temporary API URL, update it now:

1. Go to Project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_URL`
3. Change to production backend URL
4. Click **Save**

**Important**: After changing environment variables, you must redeploy.

### 6.2 Trigger Redeploy

Option A: **Via Dashboard**
1. Go to Deployments tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

Option B: **Via Git Push**
```bash
# Make a small change (e.g., update README)
echo "" >> README.md
git add README.md
git commit -m "Trigger redeployment with updated env vars"
git push origin main
```

### 6.3 Configure Redirects (Optional)

If you want custom redirects, create `vercel.json` in the `frontend/` directory:

```json
{
  "redirects": [
    {
      "source": "/deck/:id",
      "destination": "/decklists/:id",
      "permanent": true
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=300, s-maxage=300"
        }
      ]
    }
  ]
}
```

Commit and push to apply.

### 6.4 Enable Vercel Analytics (Optional)

Get free analytics for your site:

1. Go to Project Settings → Analytics
2. Click **Enable**
3. Free tier includes:
   - Page views
   - Top pages
   - Top referrers
   - Devices & browsers
   - Real-time stats

### 6.5 Configure Caching Headers

Next.js automatically handles caching for most assets. For custom caching:

Create or update `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ga-index-public.s3.us-west-2.amazonaws.com",
      },
    ],
  },
  // Add custom headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### 6.6 Set Production Environment

Update `NEXT_PUBLIC_SITE_URL` if you initially used the Vercel URL:

1. Go to Environment Variables
2. Edit `NEXT_PUBLIC_SITE_URL`
3. Change to `https://grandarchivemeta.com`
4. Save and redeploy

---

## Step 7: Continuous Deployment

Vercel automatically deploys your site when you push to GitHub. Here's how it works:

### 7.1 How Automatic Deployments Work

**Production Deployments** (main branch):
```bash
git add .
git commit -m "Update meta calculations"
git push origin main
```

Vercel will:
1. Detect push to `main` branch
2. Start new build automatically
3. Run tests (if configured)
4. Build Next.js app
5. Deploy to production
6. Update `grandarchivemeta.com`

**Time**: 2-5 minutes

### 7.2 Preview Deployments for PRs

Create a feature branch:

```bash
# Create new branch
git checkout -b feature/new-meta-view

# Make changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Add new meta statistics view"
git push origin feature/new-meta-view
```

Create Pull Request on GitHub:
1. Go to your repository
2. Click **Pull requests** → **New pull request**
3. Select `feature/new-meta-view` as compare branch
4. Click **Create pull request**

Vercel will:
- Automatically deploy a **Preview** version
- Comment on PR with preview URL
- Update preview on every push to the branch

**Preview URL**: `https://grand-archive-meta-git-feature-new-meta-view-username.vercel.app`

### 7.3 Production Deployments on Main Branch

When PR is merged:

```bash
# Merge on GitHub, then locally:
git checkout main
git pull origin main
```

Vercel automatically:
- Deploys to production
- Updates all domains
- Keeps previous deployment for rollback

### 7.4 Rollback if Needed

If a deployment breaks something:

**Option A: Via Dashboard**
1. Go to Deployments tab
2. Find previous working deployment
3. Click **⋯** (three dots)
4. Click **Promote to Production**

**Option B: Via Git**
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

**Option C: Via Vercel CLI**
```bash
# Install CLI if not already
npm install -g vercel

# Login
vercel login

# List deployments
vercel ls

# Promote specific deployment
vercel promote https://grand-archive-meta-abc123.vercel.app
```

### 7.5 Deployment Notifications

Get notified about deployments:

1. Go to Project Settings → Notifications
2. Enable notifications for:
   - ✓ Successful deployments
   - ✓ Failed deployments
3. Choose notification method:
   - Email
   - Slack (if integrated)
   - Discord (if integrated)

### 7.6 Branch Deployment Rules

Configure which branches deploy:

1. Go to Project Settings → Git
2. Configure **Production Branch**: `main`
3. Configure **Preview Branches**: All branches
4. Or restrict to specific patterns: `feature/*`, `staging`

---

## Troubleshooting

### Issue 1: Build Failures

**Symptoms**: Deployment fails with build errors

**Common Causes**:

1. **Missing Dependencies**
   ```
   Error: Cannot find module 'recharts'
   ```

   **Solution**:
   ```bash
   cd frontend
   npm install recharts --save
   git add package.json
   git commit -m "Add missing dependency"
   git push origin main
   ```

2. **TypeScript Errors**
   ```
   Error: Type 'string' is not assignable to type 'number'
   ```

   **Solution**: Fix TypeScript errors locally first:
   ```bash
   cd frontend
   npm run build
   # Fix any errors shown
   ```

3. **Environment Variable Missing**
   ```
   Error: NEXT_PUBLIC_API_URL is not defined
   ```

   **Solution**: Add environment variable in Vercel (see Step 3)

**Debug Build Locally**:
```bash
cd frontend
npm run build
npm run start
```

### Issue 2: API Connection Issues

**Symptoms**: Site loads but no data appears, console shows API errors

**Check 1: Verify Environment Variable**

In Vercel Dashboard:
1. Settings → Environment Variables
2. Check `NEXT_PUBLIC_API_URL` value
3. Must end with `/api` (no trailing slash)
4. Example: `https://api.example.com/api`

**Check 2: CORS Configuration**

Backend must allow requests from your frontend domain.

Test API directly:
```bash
curl https://your-api-url/api/health
```

Expected:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-26T10:30:00Z"
}
```

**Check 3: Backend Accessibility**

If using AWS Lambda with API Gateway:
```bash
# Test API Gateway
aws apigateway test-invoke-method \
  --rest-api-id YOUR_API_ID \
  --resource-id YOUR_RESOURCE_ID \
  --http-method GET \
  --path-with-query-string "/api/health"
```

**Solution**: Update backend CORS configuration to allow your domain.

### Issue 3: Domain Not Resolving

**Symptoms**: Domain doesn't load or shows "Domain not found"

**Check DNS Configuration**:

```bash
# Check if DNS is pointing to Vercel
dig grandarchivemeta.com

# Should show Vercel's IP addresses
# Example: 76.76.21.21
```

**Solutions**:

1. **DNS Not Propagated Yet**
   - Wait 1-2 hours
   - Check with `dig` or [dnschecker.org](https://dnschecker.org)

2. **Wrong DNS Records**
   - Verify in Route 53 or registrar
   - Should be A record to Vercel's IP
   - Or CNAME to `cname.vercel-dns.com`

3. **Domain Not Added in Vercel**
   - Go to Settings → Domains
   - Ensure domain is listed
   - Should show ✓ SSL certificate

### Issue 4: SSL Certificate Issues

**Symptoms**: Browser shows "Not Secure" or SSL error

**Check Certificate Status**:

In Vercel:
1. Settings → Domains
2. Check domain status:
   - ✓ Domain configured
   - ✓ SSL certificate issued

**Solutions**:

1. **Certificate Pending**
   - Wait 5-10 minutes after DNS propagation
   - Vercel auto-renews Let's Encrypt certificates

2. **DNS Not Propagated**
   - SSL can't be issued until DNS resolves
   - Verify with: `dig grandarchivemeta.com`

3. **CAA Records Blocking**
   - Check for CAA records in DNS
   - If present, must allow Let's Encrypt:
     ```
     grandarchivemeta.com. CAA 0 issue "letsencrypt.org"
     ```

### Issue 5: Slow Page Loads

**Symptoms**: Pages take long to load

**Check 1: API Response Times**

```bash
# Test API speed
time curl https://your-api-url/api/meta/format/Constructed
```

If slow (>2 seconds), optimize backend:
- Add database indexes
- Enable Lambda SnapStart
- Use caching

**Check 2: Large Bundle Size**

```bash
cd frontend
npm run build

# Look for large bundles:
# Route (app)                    Size
# ○ /meta                        2.5 MB  ← Too large!
```

**Solutions**:
- Use dynamic imports for large components
- Optimize images
- Remove unused dependencies

**Check 3: Vercel Analytics**

1. Go to Project → Analytics
2. Check "Web Vitals":
   - **LCP** (Largest Contentful Paint): <2.5s
   - **FID** (First Input Delay): <100ms
   - **CLS** (Cumulative Layout Shift): <0.1

### Issue 6: Environment Variables Not Updating

**Symptoms**: Changed environment variables but site still uses old values

**Solution**: Redeploy after changing environment variables

```bash
# Option 1: Via dashboard
# Deployments → ⋯ → Redeploy

# Option 2: Via push
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

**Note**: Vercel builds environment variables into the bundle at build time. They're not read at runtime.

### Issue 7: 404 on Page Refresh

**Symptoms**: Navigating works, but refreshing page shows 404

**This shouldn't happen with Next.js**, but if it does:

Check `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ]
}
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `Error: ENOENT: no such file or directory` | Missing file in build | Check paths in imports |
| `Module not found: Can't resolve 'X'` | Missing dependency | `npm install X` |
| `Expected server HTML to contain...` | Hydration error | Check SSR vs client-side code |
| `API resolved without sending response` | Backend timeout | Increase Lambda timeout |
| `CORS policy: No 'Access-Control-Allow-Origin'` | CORS not configured | Update backend CORS |

---

## Post-Deployment Checklist

After deployment, verify everything works:

### Functional Tests

- [ ] **Homepage loads** at `https://grandarchivemeta.com`
- [ ] **SSL certificate valid** (padlock in browser)
- [ ] **Meta page** (`/meta`) displays statistics
- [ ] **Cards page** (`/cards`) loads card data
- [ ] **Decklists page** (`/decklists`) shows decks
- [ ] **Champions page** (`/champions`) displays champions
- [ ] **About page** (`/about`) renders correctly
- [ ] **API calls successful** (check Network tab, all 200 OK)
- [ ] **No console errors** (check browser console)
- [ ] **Images load** from S3 bucket
- [ ] **Mobile responsive** (test on phone or resize browser)

### Domain Tests

- [ ] **Primary domain works**: `https://grandarchivemeta.com`
- [ ] **WWW subdomain works**: `https://www.grandarchivemeta.com`
- [ ] **Secondary domain redirects**: `https://grandarchivemeta.net` → `.com`
- [ ] **HTTP redirects to HTTPS**: `http://grandarchivemeta.com` → `https://`

### Performance Tests

- [ ] **Page loads in <3 seconds**
- [ ] **Lighthouse score >90** (test at [web.dev/measure](https://web.dev/measure))
- [ ] **No 404 errors** for assets
- [ ] **API responses <2 seconds**

### SEO & Meta Tags

- [ ] **Title tags** correct (view source, check `<title>`)
- [ ] **Meta descriptions** present
- [ ] **Open Graph tags** for social sharing
- [ ] **Favicon** displays
- [ ] **Robots.txt** accessible at `/robots.txt`
- [ ] **Sitemap** accessible at `/sitemap.xml` (if implemented)

### Analytics & Monitoring

- [ ] **Vercel Analytics enabled** (if using)
- [ ] **Google Analytics working** (if configured)
- [ ] **Error tracking setup** (e.g., Sentry)
- [ ] **Uptime monitoring** configured (e.g., UptimeRobot)

### Git & CI/CD

- [ ] **Git remote configured** (`git remote -v`)
- [ ] **Automatic deployments working** (push and verify)
- [ ] **Preview deployments for PRs** enabled
- [ ] **Deployment notifications** configured

---

## Monitoring & Maintenance

### View Deployment Logs

**In Vercel Dashboard**:
1. Go to your project
2. Click **Deployments** tab
3. Click on any deployment
4. View **Build Logs** and **Runtime Logs**

**Filter logs**:
- ✓ Successful deployments
- ✗ Failed deployments
- 🔄 Running deployments

### Real-Time Logs

For Lambda (backend):
```bash
# View API logs
aws logs tail /aws/lambda/grand-archive-meta-api --follow

# View last 50 lines
aws logs tail /aws/lambda/grand-archive-meta-api --since 1h
```

### Performance Monitoring

**Vercel Analytics Dashboard**:
1. Go to Project → Analytics
2. View metrics:
   - **Real User Metrics (RUM)**: Actual user experience
   - **Page Views**: Traffic statistics
   - **Web Vitals**: Core Web Vitals scores
   - **Top Pages**: Most visited pages
   - **Devices**: Desktop vs mobile

**Set up Alerts**:
```bash
# Example: Alert on high error rate
# In Vercel: Settings → Notifications → Add Alert
# Condition: Error rate > 5%
# Notification: Email or Slack
```

### Error Tracking

**Option 1: Vercel Error Monitoring**
- Automatically tracks build and runtime errors
- View in Deployments → Logs

**Option 2: Sentry (Recommended for Production)**

```bash
cd frontend
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Configure environment variable:
```
SENTRY_DSN=your-sentry-dsn-here
```

### Update Procedures

**Regular Updates**:

```bash
# Update dependencies monthly
cd frontend
npm update
npm audit fix

# Test locally
npm run build
npm run start

# Commit and push
git add package.json package-lock.json
git commit -m "Update dependencies"
git push origin main
```

**Next.js Updates**:

```bash
# Check for Next.js updates
npx npm-check-updates -u next react react-dom

# Test thoroughly before updating major versions
npm install
npm run build
```

**Security Updates**:

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# For breaking changes, update manually
```

### Backup Strategy

**1. Code Backup**: Already on GitHub ✓

**2. Configuration Backup**:

Export Vercel configuration:
```bash
vercel env pull .env.vercel.backup
```

Save to secure location (NOT in Git).

**3. Deployment History**:

Vercel keeps all deployments. Access any previous version:
1. Deployments tab
2. Click deployment
3. Click "Visit" to view
4. Or promote to production

### Cost Monitoring

**Vercel Costs**:
- **Free Tier**:
  - 100 GB bandwidth/month
  - 6,000 build minutes/month
  - Unlimited deployments
- **Pro Tier** ($20/month):
  - 1 TB bandwidth
  - 24,000 build minutes
  - Advanced analytics

**Check Usage**:
1. Settings → Usage
2. Monitor bandwidth and build minutes
3. Set up alerts at 80% usage

**AWS Backend Costs** (if applicable):
- See [COST_ANALYSIS_UPDATED.md](./COST_ANALYSIS_UPDATED.md)

### Health Checks

**Automated Health Check**:

Create a GitHub Action (`.github/workflows/health-check.yml`):

```yaml
name: Health Check

on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  health-check:
    runs-on: ubuntu-latest
    steps:
      - name: Check Frontend
        run: |
          curl -f https://grandarchivemeta.com || exit 1
          echo "Frontend is healthy"

      - name: Check API
        run: |
          curl -f https://your-api-url/api/health || exit 1
          echo "API is healthy"

      - name: Notify on Failure
        if: failure()
        run: |
          echo "Health check failed!"
          # Add notification logic (email, Slack, etc.)
```

---

## Additional Resources

### Official Documentation

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel CLI**: [vercel.com/docs/cli](https://vercel.com/docs/cli)

### Project Documentation

- **API Documentation**: [API.md](./API.md)
- **Backend Deployment**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development Guide**: [DEVELOPMENT.md](./DEVELOPMENT.md)

### Useful Commands Cheatsheet

```bash
# Vercel CLI Commands
vercel login              # Login to Vercel
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel ls                 # List deployments
vercel logs               # View logs
vercel domains ls         # List domains
vercel env ls             # List environment variables
vercel rollback           # Rollback to previous deployment

# Git Commands
git status                # Check status
git add .                 # Stage all changes
git commit -m "message"   # Commit changes
git push origin main      # Push to GitHub
git pull origin main      # Pull latest changes
git checkout -b feature   # Create new branch
git merge feature         # Merge branch

# npm Commands
npm install               # Install dependencies
npm run dev               # Start dev server
npm run build             # Build for production
npm run start             # Start production server
npm update                # Update dependencies
npm audit                 # Check for vulnerabilities

# Testing Commands
curl -I https://grandarchivemeta.com  # Check HTTP status
dig grandarchivemeta.com               # Check DNS
curl https://api-url/api/health        # Test API
```

---

## Summary

Congratulations! You've successfully deployed the Grand Archive Meta frontend to Vercel.

**What You've Accomplished**:

✅ Pushed code to GitHub
✅ Connected Vercel to your repository
✅ Configured environment variables
✅ Deployed to Vercel's edge network
✅ Set up custom domains with HTTPS
✅ Configured automatic deployments
✅ Set up monitoring and analytics

**Your site is now**:
- Live at `https://grandarchivemeta.com`
- Automatically deployed on every push
- Protected with SSL/HTTPS
- Globally distributed via Vercel's CDN
- Monitored for performance and errors

**Next Steps**:
1. Monitor deployment logs for the first 24 hours
2. Set up Google Analytics (if desired)
3. Configure error tracking with Sentry
4. Share with the Grand Archive community!
5. Keep dependencies updated monthly

---

**Need Help?**

- Check [Troubleshooting](#troubleshooting) section above
- Review Vercel's [Support docs](https://vercel.com/support)
- Open an issue on GitHub
- Check project documentation in this repository

**Deployment completed successfully!** 🎉
