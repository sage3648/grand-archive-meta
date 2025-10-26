# Vercel Deployment - Quick Start

**Time to Deploy: 10 minutes**

This is the fastest path to get your site live on Vercel.

## Prerequisites

- [ ] Vercel account (sign up at [vercel.com](https://vercel.com))
- [ ] Git repository connected
- [ ] 10 minutes of time

## 3-Step Deployment

### Step 1: Deploy to Vercel (2 minutes)

#### Option A: Via Dashboard (Easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure:
   - **Root Directory**: `frontend` (if monorepo) or leave blank
   - **Framework**: Next.js (auto-detected)
4. Click **Deploy**
5. Wait for build to complete

#### Option B: Via CLI

```bash
cd /Users/sage/Programming/grand-archive-meta/frontend
npm install -g vercel
vercel login
vercel --prod
```

### Step 2: Set Environment Variables (3 minutes)

1. Go to your project in Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these variables:

   ```
   NEXT_PUBLIC_API_URL = https://api.grandarchivemeta.com/api
   NEXT_PUBLIC_SITE_URL = https://grandarchivemeta.com
   NEXT_PUBLIC_SITE_NAME = Grand Archive Meta
   ```

4. Select **Production**, **Preview**, and **Development** for each
5. Click **Save**
6. Go to **Deployments** → Click latest → **Redeploy** (without cache)

### Step 3: Add Custom Domain (5 minutes)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Click **Add**
3. Enter: `grandarchivemeta.com`
4. Vercel will show DNS records needed
5. Add these to AWS Route 53:
   ```
   A     @     76.76.21.21
   CNAME www   cname.vercel-dns.com
   ```
6. Repeat for `grandarchivemeta.net` (optional)
7. Wait 5-10 minutes for DNS propagation

## Verification (2 minutes)

```bash
# Check deployment
curl -I https://grandarchivemeta.com

# Should return 200 OK
```

Visit your site:
- [ ] `https://grandarchivemeta.com` loads
- [ ] Data displays correctly
- [ ] No console errors
- [ ] Images load

## Done! 🎉

Your site is now live at **https://grandarchivemeta.com**

## Next Steps (Optional)

- [ ] Set up automatic deployments (already enabled if using Git)
- [ ] Configure the `.net` domain redirect
- [ ] Enable Vercel Analytics
- [ ] Add Google Analytics
- [ ] Set up error monitoring

## Need Help?

- **Full Guide**: See `VERCEL_DEPLOYMENT.md`
- **Checklist**: See `DEPLOYMENT_CHECKLIST.md`
- **Commands**: See `.vercel-commands.md`
- **Troubleshooting**: See `VERCEL_DEPLOYMENT.md` → Troubleshooting

## Common Issues

### Build Fails
```bash
# Test locally first
npm run build
```

### Environment Variables Not Working
1. Ensure they start with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding (without cache)
3. Check browser console: `console.log(process.env.NEXT_PUBLIC_API_URL)`

### Domain Not Connecting
1. Wait 10-60 minutes for DNS propagation
2. Check DNS: `dig grandarchivemeta.com`
3. Verify domain has checkmark in Vercel

## Automatic Deployments

From now on, deployments are automatic:

- Push to `main` → Production deployment
- Push to any branch → Preview deployment

No manual steps needed!

## Rollback

If something goes wrong:

1. Go to **Deployments**
2. Find previous working deployment
3. Click **...** → **Promote to Production**

Or via CLI:
```bash
vercel rollback
```

## Support

- **Vercel Support**: support@vercel.com
- **Documentation**: Full guide in `VERCEL_DEPLOYMENT.md`
- **Status**: https://vercel-status.com

---

**That's it!** You're deployed in 10 minutes.

For detailed configuration options, see `VERCEL_DEPLOYMENT.md`.
