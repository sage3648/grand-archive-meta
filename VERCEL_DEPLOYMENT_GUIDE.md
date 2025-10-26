# Grand Archive Meta - Vercel Deployment Guide

This guide will walk you through deploying the Grand Archive Meta frontend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub account
- Vercel CLI installed: `npm install -g vercel`

## Current Status

✅ **Backend**: Running locally on port 8081
✅ **Frontend**: Built successfully and tested locally on port 3001
✅ **Git**: Repository initialized with all files committed
✅ **MongoDB**: Connected to shared MongoDB Atlas cluster

## Deployment Steps

### Step 1: Push to GitHub

First, create a new GitHub repository and push your code:

```bash
# Navigate to project root
cd /Users/sage/Programming/grand-archive-meta

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/grand-archive-meta.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

You have two options: CLI or Web Dashboard

#### Option A: Using Vercel CLI (Recommended)

1. Login to Vercel:
```bash
vercel login
```

2. Navigate to the frontend directory:
```bash
cd frontend
```

3. Deploy to Vercel:
```bash
vercel
```

4. Answer the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **grand-archive-meta** (or your preferred name)
   - Directory? **./frontend** (or just press Enter if already in frontend dir)
   - Override settings? **N**

5. Deploy to production:
```bash
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables

In the Vercel dashboard or via CLI, add these environment variables:

**Production Variables:**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8081/api
NEXT_PUBLIC_SITE_URL=https://grandarchivemeta.com
NEXT_PUBLIC_SITE_NAME=Grand Archive Meta
```

**Note**: You'll need to update `NEXT_PUBLIC_API_URL` to point to your production backend once it's deployed on AWS.

#### Via CLI:
```bash
cd frontend
vercel env add NEXT_PUBLIC_API_URL
# Enter: http://localhost:8081/api
# Select: Production

vercel env add NEXT_PUBLIC_SITE_URL
# Enter: https://grandarchivemeta.com
# Select: Production

vercel env add NEXT_PUBLIC_SITE_NAME
# Enter: Grand Archive Meta
# Select: Production
```

#### Via Dashboard:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add each variable for Production environment

### Step 4: Configure Custom Domains

1. In Vercel dashboard, go to your project
2. Navigate to "Settings" → "Domains"
3. Add your domains:
   - `grandarchivemeta.com`
   - `www.grandarchivemeta.com`
   - `grandarchivemeta.net`
   - `www.grandarchivemeta.net`

4. Update DNS records at your domain registrar:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → `76.76.21.21` (Vercel's IP)
   - Or follow the specific DNS instructions provided by Vercel

### Step 5: Verify Deployment

After deployment completes:

1. Visit your Vercel deployment URL (e.g., `grand-archive-meta.vercel.app`)
2. Check all pages:
   - Dashboard (/)
   - Champions (/champions)
   - Decklists (/decklists)
   - Meta Analysis (/meta)
   - Cards (/cards)
   - About (/about)

3. Open browser console to check for API errors
   - **Expected**: API calls will fail until backend is deployed
   - Frontend should still render with loading states

## Current Limitations

### Backend Not Yet Deployed

The backend is currently only running locally. To make the site fully functional:

1. Deploy backend to AWS EC2 (instructions in DEPLOYMENT.md)
2. Set up API Gateway and Route 53 for `api.grandarchivemeta.com`
3. Update Vercel environment variable `NEXT_PUBLIC_API_URL` to production backend URL

### Data Population

Once the backend is deployed:
- Run initial event crawl: `curl -X POST http://api.grandarchivemeta.com/admin/crawl`
- Run card sync: `curl -X POST http://api.grandarchivemeta.com/admin/sync-cards`
- Scheduled jobs will run automatically at 02:00, 03:00, and 06:00 UTC daily

## File Structure

The frontend deployment includes:

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # React components
├── lib/                    # Utilities and API client
├── types/                  # TypeScript type definitions
├── public/                 # Static assets
├── .env.local             # Local environment variables (not committed)
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies
```

## Troubleshooting

### Build Fails

If the Vercel build fails:

1. Check build logs in Vercel dashboard
2. Verify all dependencies are in package.json
3. Ensure TypeScript errors are resolved locally first
4. Try building locally: `cd frontend && npm run build`

### Environment Variables Not Working

1. Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding variables
3. Check Variables are set for Production environment

### API Calls Failing

Expected until backend is deployed:
1. Backend must be accessible from `NEXT_PUBLIC_API_URL`
2. CORS must be configured to allow Vercel domain
3. Check browser console for specific error messages

### Domain Not Working

1. Verify DNS records are correctly configured
2. Wait for DNS propagation (can take up to 48 hours)
3. Check domain status in Vercel dashboard
4. Ensure domain is not already in use by another Vercel project

## Next Steps

After successful Vercel deployment:

1. ✅ Frontend deployed and accessible
2. ⏳ Deploy backend to AWS EC2
3. ⏳ Configure API Gateway and Route 53
4. ⏳ Update frontend environment variables with production API URL
5. ⏳ Run initial data population
6. ⏳ Test end-to-end functionality
7. ⏳ Set up monitoring and alerts

## Quick Commands Reference

```bash
# Login to Vercel
vercel login

# Deploy to preview
cd frontend && vercel

# Deploy to production
cd frontend && vercel --prod

# Check deployment status
vercel inspect <deployment-url>

# View deployment logs
vercel logs <deployment-url>

# List all deployments
vercel ls

# Remove deployment
vercel remove <deployment-name>

# Add environment variable
vercel env add <key>

# List environment variables
vercel env ls
```

## Support

For issues with:
- **Vercel Deployment**: Check Vercel documentation at https://vercel.com/docs
- **Next.js Build**: See Next.js docs at https://nextjs.org/docs
- **Backend Integration**: Refer to backend/README.md and DEPLOYMENT.md

## Project Links

- **Frontend Code**: `/Users/sage/Programming/grand-archive-meta/frontend`
- **Backend Code**: `/Users/sage/Programming/grand-archive-meta/backend`
- **Full Documentation**: `/Users/sage/Programming/grand-archive-meta/README.md`
- **Deployment Guide**: `/Users/sage/Programming/grand-archive-meta/DEPLOYMENT.md`

---

Built with passion for the Grand Archive community.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
