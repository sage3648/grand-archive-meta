# Vercel Deployment Guide - Grand Archive Meta

This guide provides step-by-step instructions for deploying the Grand Archive Meta frontend to Vercel with custom domain configuration.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Vercel Setup](#initial-vercel-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [Domain Configuration](#domain-configuration)
5. [AWS Route 53 Setup](#aws-route-53-setup)
6. [Deployment Verification](#deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account created at [vercel.com](https://vercel.com)
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Access to AWS Route 53 (for DNS management)
- [ ] Backend API deployed and accessible
- [ ] Domain names: `grandarchivemeta.com` and `grandarchivemeta.net`

---

## Initial Vercel Setup

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Login to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import from your Git repository (GitHub/GitLab/Bitbucket)
   - Select the repository containing this frontend

3. **Configure Project**
   - **Root Directory**: Set to `frontend` (or leave as root if this is the only project)
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy**
   - Click "Deploy"
   - Wait for initial deployment to complete
   - Note the auto-generated URL (e.g., `your-project.vercel.app`)

### Option 2: Deploy via CLI

```bash
# From the frontend directory
cd /Users/sage/Programming/grand-archive-meta/frontend

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow the prompts:
# - Set up and deploy: Y
# - Which scope: Select your account
# - Link to existing project: N (first time)
# - Project name: grand-archive-meta-frontend
# - Directory: ./
# - Override settings: N
```

---

## Environment Variables Configuration

### Required Environment Variables

Set these in the Vercel dashboard or via CLI:

1. **Via Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add each variable below

2. **Via CLI**:
   ```bash
   vercel env add NEXT_PUBLIC_API_URL production
   vercel env add NEXT_PUBLIC_SITE_URL production
   ```

### Production Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.grandarchivemeta.com/api` | Backend API endpoint |
| `NEXT_PUBLIC_SITE_URL` | `https://grandarchivemeta.com` | Primary site URL |
| `NEXT_PUBLIC_SITE_NAME` | `Grand Archive Meta` | Site name for metadata |

### Optional Variables

| Variable Name | Example Value | Description |
|--------------|---------------|-------------|
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX` | Google Analytics ID |
| `NEXT_PUBLIC_ENABLE_BETA_FEATURES` | `false` | Feature flags |

### Environment Variable Setup Steps

1. Navigate to: Project → Settings → Environment Variables
2. For each variable:
   - Click "Add New"
   - Enter variable name (e.g., `NEXT_PUBLIC_API_URL`)
   - Enter value
   - Select environments: Production, Preview, Development
   - Click "Save"

3. **Important**: After adding all variables, redeploy:
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"
   - Select "Use existing Build Cache: No"

---

## Domain Configuration

### Primary Domain: grandarchivemeta.com

1. **Add Domain in Vercel**
   - Go to Project → Settings → Domains
   - Click "Add"
   - Enter: `grandarchivemeta.com`
   - Click "Add"

2. **Configure DNS Records**
   - Vercel will provide DNS records to add
   - Typical records:
     ```
     A     @     76.76.21.21
     CNAME www   cname.vercel-dns.com
     ```

3. **Add www Subdomain**
   - Click "Add" again
   - Enter: `www.grandarchivemeta.com`
   - Vercel will automatically redirect www to apex domain

### Secondary Domain: grandarchivemeta.net

1. **Add Domain in Vercel**
   - Go to Project → Settings → Domains
   - Click "Add"
   - Enter: `grandarchivemeta.net`
   - Click "Add"

2. **Configure as Redirect**
   - After adding, click the domain settings
   - Set as redirect to `grandarchivemeta.com`
   - Enable "Redirect Status Code: 301" (permanent)

3. **Add www Subdomain**
   - Add: `www.grandarchivemeta.net`
   - Also redirect to `grandarchivemeta.com`

---

## AWS Route 53 Setup

### For grandarchivemeta.com

1. **Login to AWS Console**
   - Navigate to Route 53 → Hosted Zones
   - Select `grandarchivemeta.com`

2. **Create/Update A Record**
   ```
   Record name: (leave blank for apex/@)
   Record type: A
   Value: 76.76.21.21
   TTL: 300
   Routing policy: Simple
   ```

3. **Create/Update CNAME Record for www**
   ```
   Record name: www
   Record type: CNAME
   Value: cname.vercel-dns.com
   TTL: 300
   ```

4. **Optional: Add AAAA Record for IPv6**
   ```
   Record name: (leave blank)
   Record type: AAAA
   Value: 2606:4700:90:0:76:76:21:21
   TTL: 300
   ```

### For grandarchivemeta.net

Follow the same steps as above for the `.net` domain.

### Verify DNS Configuration

```bash
# Check A record
dig grandarchivemeta.com A

# Check CNAME record
dig www.grandarchivemeta.com CNAME

# Check propagation (may take up to 48 hours)
nslookup grandarchivemeta.com
```

---

## Deployment Verification

### Automated Verification Checklist

Run these checks after deployment:

#### 1. Deployment Status
- [ ] Check Vercel dashboard shows "Ready" status
- [ ] No build errors in deployment logs
- [ ] Build time is reasonable (< 5 minutes)

#### 2. Domain Access
- [ ] `https://grandarchivemeta.com` loads successfully
- [ ] `https://www.grandarchivemeta.com` redirects to apex
- [ ] `https://grandarchivemeta.net` redirects to `.com`
- [ ] `https://www.grandarchivemeta.net` redirects to `.com`

#### 3. SSL/HTTPS
- [ ] All domains have valid SSL certificates
- [ ] No mixed content warnings
- [ ] HTTP redirects to HTTPS automatically

#### 4. Environment Variables
```bash
# Visit your site and open browser console
console.log(process.env.NEXT_PUBLIC_API_URL)
console.log(process.env.NEXT_PUBLIC_SITE_URL)
```
- [ ] Variables are correctly loaded
- [ ] API URL points to production backend
- [ ] No `undefined` or `localhost` values

#### 5. Functionality Tests
- [ ] Homepage loads with data
- [ ] Navigation works across all pages
- [ ] API calls succeed (check Network tab)
- [ ] Images load from S3 bucket
- [ ] Charts and visualizations render
- [ ] No console errors

#### 6. Performance
- [ ] Lighthouse score > 90 for Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No layout shifts

#### 7. SEO & Meta
- [ ] Proper title tags on all pages
- [ ] Meta descriptions present
- [ ] Open Graph tags configured
- [ ] Favicon displays correctly

### Manual Testing Commands

```bash
# Test main domain
curl -I https://grandarchivemeta.com

# Test www redirect
curl -I https://www.grandarchivemeta.com

# Test .net redirect
curl -I https://grandarchivemeta.net

# Test API connectivity from production
curl https://grandarchivemeta.com/api/health

# Check SSL certificate
openssl s_client -connect grandarchivemeta.com:443 -servername grandarchivemeta.com
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Build Fails

**Symptoms**: Deployment fails during build step

**Solutions**:
1. Check build logs in Vercel dashboard
2. Verify `package.json` scripts are correct
3. Ensure all dependencies are in `dependencies` (not just `devDependencies`)
4. Try building locally: `npm run build`
5. Check Node.js version compatibility

#### Issue: Environment Variables Not Working

**Symptoms**: `undefined` values or `localhost` appearing in production

**Solutions**:
1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding variables (don't use cache)
3. Verify variables are set for "Production" environment
4. Check browser console for actual values

#### Issue: Domain Not Connecting

**Symptoms**: Domain shows "This site can't be reached"

**Solutions**:
1. Verify DNS records in Route 53 match Vercel's requirements
2. Wait for DNS propagation (up to 48 hours)
3. Check domain status in Vercel (should show checkmark)
4. Use `dig` or `nslookup` to verify DNS resolution
5. Clear browser cache and try incognito mode

#### Issue: SSL Certificate Error

**Symptoms**: Browser shows "Your connection is not private"

**Solutions**:
1. Wait for Vercel to provision SSL (can take 5-10 minutes)
2. Verify domain is correctly added in Vercel
3. Check that DNS is pointing to Vercel
4. Try re-adding the domain in Vercel settings

#### Issue: API Calls Failing

**Symptoms**: Network errors, CORS issues, or 404s

**Solutions**:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check backend is deployed and accessible
3. Verify CORS settings on backend allow your domain
4. Check Network tab in browser DevTools for exact error
5. Ensure API endpoints match between frontend and backend

#### Issue: Images Not Loading

**Symptoms**: Broken image icons or 403 errors

**Solutions**:
1. Verify S3 bucket permissions allow public read
2. Check `next.config.ts` has correct `remotePatterns`
3. Verify image URLs are correct
4. Check S3 CORS configuration if needed

#### Issue: Redirects Not Working

**Symptoms**: `.net` domain doesn't redirect to `.com`

**Solutions**:
1. Verify redirect is configured in Vercel domain settings
2. Check DNS is pointing to Vercel for `.net` domain
3. Clear browser cache
4. Wait for DNS propagation
5. Use `curl -L` to follow redirects and debug

### Getting Help

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Next.js Deployment**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **AWS Route 53 Docs**: [docs.aws.amazon.com/route53](https://docs.aws.amazon.com/route53/)

### Useful Commands

```bash
# Check Vercel CLI version
vercel --version

# List all deployments
vercel ls

# View deployment logs
vercel logs <deployment-url>

# Pull environment variables locally
vercel env pull

# Check project info
vercel inspect

# Remove a deployment
vercel rm <deployment-url>
```

---

## Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to your Git repository:

- **Production**: Pushes to `main` or `master` branch
- **Preview**: Pushes to any other branch (e.g., `develop`, `feature/*`)

### Deployment Settings

Configure in Vercel dashboard → Settings → Git:

- [ ] Enable "Automatic Deployments from Git"
- [ ] Set production branch to `main`
- [ ] Enable "Preview Deployments" for all branches
- [ ] Enable "Comment on PR" for deployment links

### Manual Deployments

```bash
# Deploy to preview (staging)
vercel

# Deploy to production
vercel --prod

# Deploy specific branch
git checkout feature-branch
vercel
```

---

## Post-Deployment

### Monitoring

1. **Vercel Analytics**
   - Enable in Project → Settings → Analytics
   - Monitor Web Vitals and performance metrics

2. **Error Tracking**
   - Consider integrating Sentry or similar
   - Monitor Vercel logs for errors

3. **Uptime Monitoring**
   - Use UptimeRobot or similar service
   - Monitor both `.com` and `.net` domains

### Updates and Maintenance

1. **Updating Environment Variables**
   - Change in Vercel dashboard
   - Redeploy for changes to take effect

2. **Rolling Back**
   ```bash
   # Via dashboard: Deployments → Previous deployment → Promote to Production

   # Via CLI
   vercel rollback
   ```

3. **Custom Domains**
   - Regularly check SSL certificate expiry (Vercel auto-renews)
   - Monitor DNS health

---

## Security Checklist

- [ ] All environment variables are set in Vercel (not in code)
- [ ] No `.env` files committed to Git
- [ ] HTTPS enforced on all domains
- [ ] API backend has proper authentication
- [ ] CORS configured correctly
- [ ] Security headers configured (via `next.config.ts`)
- [ ] Dependencies updated regularly: `npm audit`

---

## Performance Optimization

### Vercel-Specific Optimizations

1. **Edge Functions**
   - Already optimized by Next.js 15
   - Deployed to `iad1` region (configurable in `vercel.json`)

2. **Image Optimization**
   - Automatic via Next.js Image component
   - Configured for S3 in `next.config.ts`

3. **Caching**
   - Vercel CDN automatically caches static assets
   - Configure cache headers if needed

4. **Bundle Analysis**
   ```bash
   npm install -D @next/bundle-analyzer
   ANALYZE=true npm run build
   ```

---

## Conclusion

Your Grand Archive Meta frontend is now deployed to Vercel with:

- Production-ready configuration
- Custom domain setup (.com and .net)
- Environment variables configured
- SSL certificates auto-provisioned
- Automatic deployments from Git

For any issues, refer to the troubleshooting section or contact Vercel support.

**Next Steps**:
1. Monitor initial traffic and performance
2. Set up analytics if desired
3. Configure custom error pages if needed
4. Plan for scaling and optimization

Happy deploying!
