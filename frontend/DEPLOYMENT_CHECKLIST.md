# Vercel Deployment Verification Checklist

Use this checklist to verify your deployment is complete and working correctly.

## Pre-Deployment

- [ ] All code changes committed and pushed to Git
- [ ] Local build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] All environment variables documented
- [ ] Backend API is deployed and accessible
- [ ] Database migrations completed (if applicable)

## Vercel Configuration

- [ ] `vercel.json` created with correct configuration
- [ ] `.vercelignore` excludes unnecessary files
- [ ] `.env.production.example` created as template
- [ ] `next.config.ts` configured for production
- [ ] `package.json` has all required scripts

## Initial Deployment

- [ ] Vercel project created/imported
- [ ] Framework preset set to Next.js
- [ ] Root directory configured correctly
- [ ] Initial deployment succeeds
- [ ] Build logs show no errors
- [ ] Auto-generated URL accessible

## Environment Variables

- [ ] `NEXT_PUBLIC_API_URL` set to production API
- [ ] `NEXT_PUBLIC_SITE_URL` set to production domain
- [ ] `NEXT_PUBLIC_SITE_NAME` configured
- [ ] Optional variables configured (Analytics, etc.)
- [ ] Variables visible in Vercel dashboard
- [ ] Redeployed after adding variables

## Domain Configuration - grandarchivemeta.com

- [ ] Domain added in Vercel dashboard
- [ ] DNS A record created: `@ → 76.76.21.21`
- [ ] DNS CNAME created: `www → cname.vercel-dns.com`
- [ ] Route 53 records updated
- [ ] DNS propagation verified: `dig grandarchivemeta.com`
- [ ] Domain shows checkmark in Vercel
- [ ] SSL certificate provisioned
- [ ] HTTPS works: `https://grandarchivemeta.com`
- [ ] www redirect works: `www.grandarchivemeta.com` → apex

## Domain Configuration - grandarchivemeta.net

- [ ] Domain added in Vercel dashboard
- [ ] Configured as 301 redirect to `.com`
- [ ] DNS A record created
- [ ] DNS CNAME created for www
- [ ] Route 53 records updated
- [ ] DNS propagation verified
- [ ] SSL certificate provisioned
- [ ] Redirect works: `.net` → `.com`
- [ ] www redirect works: `www.grandarchivemeta.net` → `.com`

## SSL/Security

- [ ] All domains have valid SSL certificates
- [ ] Certificates show correct issuer (Let's Encrypt via Vercel)
- [ ] No certificate warnings in browser
- [ ] HTTP automatically redirects to HTTPS
- [ ] Security headers configured
- [ ] No mixed content warnings

## Functionality Testing

### Homepage
- [ ] Loads without errors
- [ ] Data populates correctly
- [ ] Hero section displays
- [ ] Navigation menu works
- [ ] Footer displays

### Card Database
- [ ] Card list loads
- [ ] Filters work
- [ ] Search functionality works
- [ ] Card details page loads
- [ ] Images load from S3

### Meta Analysis
- [ ] Charts render correctly
- [ ] Data loads from API
- [ ] Filters apply correctly
- [ ] Export functionality works (if applicable)

### Deck Builder (if implemented)
- [ ] Can create new deck
- [ ] Can add/remove cards
- [ ] Can save deck
- [ ] Can load saved decks

### API Integration
- [ ] All API calls succeed
- [ ] No CORS errors
- [ ] Proper error handling
- [ ] Loading states work
- [ ] No 404s in Network tab

## Performance

- [ ] Lighthouse Performance score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 200ms
- [ ] Images are optimized
- [ ] Fonts load efficiently
- [ ] No unnecessary JavaScript

## SEO & Metadata

- [ ] Page titles are descriptive
- [ ] Meta descriptions present
- [ ] Open Graph tags configured
- [ ] Twitter Card tags configured
- [ ] Favicon displays correctly
- [ ] Sitemap generated (if applicable)
- [ ] robots.txt configured (if applicable)

## Browser Testing

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Responsive Design

- [ ] Mobile (320px - 480px)
- [ ] Tablet (481px - 768px)
- [ ] Laptop (769px - 1024px)
- [ ] Desktop (1025px+)
- [ ] 4K displays (2560px+)

## Console & Network

- [ ] No JavaScript errors in console
- [ ] No failed network requests
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] Proper status codes (200, 301, etc.)
- [ ] Assets load from CDN

## Monitoring & Analytics

- [ ] Vercel Analytics enabled (optional)
- [ ] Google Analytics configured (optional)
- [ ] Error tracking configured (optional)
- [ ] Uptime monitoring configured (optional)
- [ ] Can view logs in Vercel dashboard

## Git Integration

- [ ] Automatic deployments enabled
- [ ] Production branch configured (main/master)
- [ ] Preview deployments working
- [ ] Commit messages trigger deployments
- [ ] PR comments show deployment links

## Documentation

- [ ] `VERCEL_DEPLOYMENT.md` complete
- [ ] Environment variables documented
- [ ] Domain setup instructions clear
- [ ] Troubleshooting guide available
- [ ] Team members know how to deploy

## Post-Deployment

- [ ] Team notified of deployment
- [ ] DNS changes communicated
- [ ] Monitoring in place
- [ ] Backup strategy confirmed
- [ ] Rollback plan documented

## Ongoing Maintenance

- [ ] Weekly dependency updates scheduled
- [ ] Security audit: `npm audit`
- [ ] Performance monitoring enabled
- [ ] Regular backups configured
- [ ] SSL certificates monitoring (auto-renewed by Vercel)

---

## Quick Verification Commands

```bash
# Test main domain
curl -I https://grandarchivemeta.com

# Test www redirect
curl -IL https://www.grandarchivemeta.com

# Test .net redirect
curl -IL https://grandarchivemeta.net

# Check DNS
dig grandarchivemeta.com A
dig www.grandarchivemeta.com CNAME

# Check SSL
echo | openssl s_client -connect grandarchivemeta.com:443 -servername grandarchivemeta.com 2>/dev/null | openssl x509 -noout -dates

# Test API endpoint
curl https://grandarchivemeta.com/api/health
```

---

## Sign-Off

**Deployment Date**: _______________

**Deployed By**: _______________

**Verified By**: _______________

**Production URL**: https://grandarchivemeta.com

**Notes**:
```
[Add any deployment notes, issues encountered, or special considerations]
```

---

## Emergency Contacts

- **Vercel Support**: https://vercel.com/support
- **AWS Route 53 Support**: https://aws.amazon.com/support
- **Project Repository**: [Add your Git repo URL]
- **Backend API**: [Add backend URL/contact]

## Rollback Procedure

If critical issues are found post-deployment:

1. Go to Vercel Dashboard → Deployments
2. Find the last known good deployment
3. Click "..." → "Promote to Production"
4. Verify rollback succeeded
5. Investigate issue before redeploying

**OR via CLI**:
```bash
vercel rollback
```

---

**Status**: ☐ Not Started | ☐ In Progress | ☐ Complete | ☐ Issues Found

**Overall Health**: ☐ Green | ☐ Yellow | ☐ Red
