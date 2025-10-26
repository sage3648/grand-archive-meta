# Deployment Configuration - Grand Archive Meta Frontend

This directory contains a production-ready Next.js frontend configured for deployment to Vercel with custom domain support.

## Quick Start

### For First-Time Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Production**:
   ```bash
   cd /Users/sage/Programming/grand-archive-meta/frontend
   vercel --prod
   ```

4. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add variables from `.env.production.example`

5. **Add Custom Domains**:
   - Follow instructions in `VERCEL_DEPLOYMENT.md`

### For Subsequent Deployments

Automatic deployment happens when you push to your Git repository's main branch.

Manual deployment:
```bash
vercel --prod
```

## Configuration Files

### Core Configuration

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel project configuration, build settings, regions |
| `.vercelignore` | Files to exclude from Vercel deployment |
| `next.config.ts` | Next.js production configuration with optimizations |
| `package.json` | Dependencies and build scripts |

### Environment Variables

| File | Purpose |
|------|---------|
| `.env.local.example` | Local development environment template |
| `.env.production.example` | Production environment template |

### Documentation

| File | Purpose |
|------|---------|
| `VERCEL_DEPLOYMENT.md` | Complete deployment guide with troubleshooting |
| `DEPLOYMENT_CHECKLIST.md` | Verification checklist for deployments |
| `DEPLOYMENT_README.md` | This file - quick reference |

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js 15 App Router pages
│   ├── components/       # React components
│   └── lib/             # Utilities and helpers
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── .vercelignore        # Vercel ignore rules
├── next.config.ts       # Next.js configuration
├── package.json         # Dependencies
├── .env.local.example   # Local env template
├── .env.production.example  # Production env template
└── VERCEL_DEPLOYMENT.md     # Full deployment guide
```

## Environment Variables

### Required for Production

```bash
NEXT_PUBLIC_API_URL=https://api.grandarchivemeta.com/api
NEXT_PUBLIC_SITE_URL=https://grandarchivemeta.com
NEXT_PUBLIC_SITE_NAME=Grand Archive Meta
```

### Optional

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # Google Analytics
```

**Note**: All client-side variables MUST start with `NEXT_PUBLIC_` to be accessible in the browser.

## Build Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server locally
npm start

# Run linter
npm run lint
```

## Domain Configuration

### Primary Domain: grandarchivemeta.com
- Main production site
- Configured in Vercel + AWS Route 53
- SSL auto-provisioned by Vercel

### Secondary Domain: grandarchivemeta.net
- Redirects to .com with 301 status
- Also configured in Vercel + Route 53

## Deployment Workflow

### Automatic (Recommended)

1. Push code to Git repository
2. Vercel automatically detects changes
3. Builds and deploys to production (main branch) or preview (other branches)
4. Deployment URL available in commit status

### Manual

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployments
vercel ls

# View logs
vercel logs [deployment-url]
```

## Monitoring & Maintenance

### Check Deployment Status

1. **Vercel Dashboard**: https://vercel.com/dashboard
   - View deployment status
   - Check build logs
   - Monitor analytics

2. **CLI**:
   ```bash
   vercel ls                    # List deployments
   vercel inspect              # View project info
   vercel logs                 # View logs
   ```

### Performance Monitoring

- Vercel Analytics (enable in dashboard)
- Lighthouse CI integration
- Web Vitals tracking

### Error Tracking

- View logs in Vercel dashboard
- Consider integrating Sentry for advanced tracking

## Troubleshooting

### Build Fails

```bash
# Test locally first
npm run build

# Check for TypeScript errors
npm run lint

# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Loading

1. Ensure variables start with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding variables (without cache)
3. Check browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

### Domain Not Working

1. Verify DNS records in Route 53
2. Check domain status in Vercel (should have checkmark)
3. Wait for DNS propagation (up to 48 hours)
4. Clear browser cache

### SSL Certificate Issues

1. Wait 5-10 minutes for Vercel to provision
2. Verify DNS is pointing to Vercel
3. Try removing and re-adding domain

## Security Best Practices

- [ ] Never commit `.env` files to Git
- [ ] Store secrets in Vercel Environment Variables
- [ ] Use HTTPS for all domains (enforced by Vercel)
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Review security headers in `next.config.ts`
- [ ] Enable 2FA on Vercel account

## Performance Optimizations

### Enabled by Default

- **Image Optimization**: Next.js Image component with AVIF/WebP
- **Code Splitting**: Automatic via Next.js
- **Compression**: Gzip/Brotli enabled
- **CDN**: Vercel Edge Network
- **Caching**: Static assets cached automatically

### Additional Optimizations

- Use `next/image` for all images
- Implement lazy loading for heavy components
- Optimize bundle size with bundle analyzer
- Use `next/font` for font optimization

## Rollback Procedure

### Via Dashboard

1. Go to Deployments in Vercel
2. Find the last known good deployment
3. Click "..." → "Promote to Production"

### Via CLI

```bash
vercel rollback
```

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Full Deployment Guide**: See `VERCEL_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`

## Version Information

- **Next.js**: 15.2.2
- **React**: 19.0.0
- **Node.js**: 18.x or higher recommended
- **Framework**: Next.js (App Router)

## Team Resources

### For Developers

1. Clone the repository
2. Copy `.env.local.example` to `.env.local`
3. Update with local backend URL
4. Run `npm install`
5. Run `npm run dev`

### For DevOps

1. Access Vercel dashboard for deployment monitoring
2. Access AWS Route 53 for DNS management
3. Review `VERCEL_DEPLOYMENT.md` for complete setup
4. Use `DEPLOYMENT_CHECKLIST.md` for verification

### For Project Managers

- Deployment happens automatically on Git push
- Preview deployments available for all branches
- Production URL: https://grandarchivemeta.com
- Check Vercel dashboard for deployment status

## CI/CD Pipeline

### Current Setup

- **Git Integration**: Automatic deployments from Git
- **Branch Strategy**:
  - `main` → Production
  - Other branches → Preview deployments
- **Build Time**: ~2-5 minutes
- **Deployment**: Instant after build

### Future Enhancements

- [ ] Automated testing in CI pipeline
- [ ] Visual regression testing
- [ ] Automated accessibility testing
- [ ] Performance budgets

## Cost Considerations

### Vercel Pricing

- **Hobby (Free)**: Good for personal projects
- **Pro ($20/mo)**: Recommended for production
  - Higher bandwidth
  - Team collaboration
  - Advanced analytics

### Optimization Tips

- Optimize images to reduce bandwidth
- Use efficient data fetching
- Implement proper caching strategies
- Monitor usage in Vercel dashboard

## Contact & Support

- **Repository Issues**: [Add GitHub Issues URL]
- **Vercel Support**: support@vercel.com
- **Internal Team**: [Add team contact]

---

Last Updated: 2025-10-26
