# Vercel Deployment Documentation Index

Complete guide to deploying Grand Archive Meta frontend to Vercel.

## Start Here

**New to deployment?** → [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) (10 minutes)

**Need full details?** → [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) (Complete guide)

**Just want checklist?** → [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

## Documentation Files

### Quick Reference

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) | Fastest path to deployment | 5 min |
| [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) | Overview of what's configured | 10 min |
| [.vercel-commands.md](./.vercel-commands.md) | Command reference | 5 min |

### Complete Guides

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) | Complete deployment guide | 30 min |
| [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) | Project deployment overview | 15 min |
| [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) | Verification checklist | 20 min |

### Technical References

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [.vercel-secrets.md](./.vercel-secrets.md) | Secrets vs env vars guide | 10 min |
| [vercel.json](./vercel.json) | Vercel configuration | 2 min |
| [.vercelignore](./.vercelignore) | Deployment exclusions | 2 min |

### Templates

| File | Purpose |
|------|---------|
| [.env.production.example](./.env.production.example) | Production environment template |
| [.env.local.example](./.env.local.example) | Local development template |

## Common Tasks

### First-Time Deployment

1. Read: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
2. Follow: 3-step deployment process
3. Verify: Using [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. Reference: [.vercel-commands.md](./.vercel-commands.md) for commands

### Updating Environment Variables

1. Go to Vercel Dashboard → Settings → Environment Variables
2. Update values
3. Redeploy without cache
4. See: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → Environment Variables

### Adding Custom Domain

1. See: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → Domain Configuration
2. Follow: AWS Route 53 setup instructions
3. Verify: Domain checklist in [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

### Troubleshooting

1. Check: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → Troubleshooting section
2. Reference: [.vercel-commands.md](./.vercel-commands.md) → Troubleshooting Commands
3. Review: Build logs in Vercel dashboard

### Rolling Back

1. Quick: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) → Rollback section
2. Detailed: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → Troubleshooting

## Configuration Files

### Production Configuration

- **vercel.json**: Vercel project settings
  - Build commands
  - Framework configuration
  - Region settings
  - Environment variable mapping

- **next.config.ts**: Next.js configuration
  - Image optimization
  - Security headers
  - Production optimizations
  - Output configuration

- **.vercelignore**: Deployment exclusions
  - Development files
  - Test files
  - Documentation

### Environment Variables

- **.env.local.example**: Local development template
  - API URL: `http://localhost:8080/api`
  - Site URL: `http://localhost:3000`

- **.env.production.example**: Production template
  - API URL: `https://api.grandarchivemeta.com/api`
  - Site URL: `https://grandarchivemeta.com`

## Workflows

### Standard Deployment Workflow

```
1. Write code
2. Test locally (npm run build)
3. Commit to Git
4. Push to branch
   ├─ main branch → Production deployment
   └─ other branch → Preview deployment
5. Vercel auto-deploys
6. Verify deployment
```

### Manual Deployment Workflow

```
1. Write code
2. Test locally
3. vercel --prod (or vercel for preview)
4. Wait for deployment
5. Verify deployment
```

### Emergency Rollback Workflow

```
1. Identify issue
2. Go to Vercel Dashboard → Deployments
3. Find last known good deployment
4. Promote to Production
   OR
   Run: vercel rollback
5. Verify rollback successful
6. Investigate and fix issue
7. Redeploy when fixed
```

## Documentation by Role

### For Developers

**Getting Started**:
1. [QUICKSTART.md](./QUICKSTART.md) - Local development
2. [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md) - Deploy preview

**Daily Use**:
- [.vercel-commands.md](./.vercel-commands.md) - Common commands
- [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) - Quick reference

### For DevOps Engineers

**Initial Setup**:
1. [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Complete guide
2. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Verification

**Ongoing**:
- [.vercel-commands.md](./.vercel-commands.md) - Management commands
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Troubleshooting

### For Project Managers

**Status Checking**:
1. [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md) - Current state
2. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Verification

**Understanding**:
- [DEPLOYMENT_README.md](./DEPLOYMENT_README.md) - Overview

## Quick Command Reference

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs

# Rollback
vercel rollback

# Environment variables
vercel env ls
vercel env add <name> <value>
vercel env pull
```

See [.vercel-commands.md](./.vercel-commands.md) for complete reference.

## Environment Setup

### Required Environment Variables

| Variable | Development | Production |
|----------|-------------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8080/api` | `https://api.grandarchivemeta.com/api` |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://grandarchivemeta.com` |
| `NEXT_PUBLIC_SITE_NAME` | `Grand Archive Meta` | `Grand Archive Meta` |

### Optional Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_ENABLE_BETA_FEATURES` | Feature flags | `false` |

## Domain Configuration

### Primary Domain
- **grandarchivemeta.com**
- Main production site
- SSL auto-provisioned by Vercel

### Secondary Domain
- **grandarchivemeta.net**
- 301 redirect to .com
- SSL auto-provisioned by Vercel

### DNS Configuration
See: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) → AWS Route 53 Setup

## Support & Resources

### Internal Documentation
- All guides in this directory
- Configuration files documented inline

### External Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Support](https://vercel.com/support)

### Getting Help

1. **Check documentation**: Start with [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. **Review logs**: `vercel logs` or Vercel dashboard
3. **Consult checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. **Contact support**: support@vercel.com

## File Tree

```
frontend/
├── Configuration Files
│   ├── vercel.json                    # Vercel project config
│   ├── .vercelignore                  # Deployment exclusions
│   ├── next.config.ts                 # Next.js config
│   └── package.json                   # Dependencies & scripts
│
├── Environment Templates
│   ├── .env.local.example            # Local development
│   └── .env.production.example       # Production
│
├── Documentation (Start Here!)
│   ├── DEPLOYMENT_INDEX.md           # This file
│   ├── VERCEL_QUICKSTART.md          # 10-min quick start
│   ├── VERCEL_DEPLOYMENT.md          # Complete guide
│   ├── DEPLOYMENT_CHECKLIST.md       # Verification checklist
│   ├── DEPLOYMENT_README.md          # Overview
│   ├── DEPLOYMENT_SUMMARY.md         # What's configured
│   ├── .vercel-commands.md           # Command reference
│   └── .vercel-secrets.md            # Secrets guide
│
└── Application Code
    ├── src/app/                       # Next.js pages
    ├── src/components/                # React components
    └── public/                        # Static assets
```

## Deployment Status

### Configuration Complete ✅

- [x] Vercel configuration created
- [x] Environment templates created
- [x] Next.js production optimizations applied
- [x] Documentation complete
- [x] Checklists created
- [x] Command reference created

### Pending Actions ⏳

- [ ] Initial deployment to Vercel
- [ ] Environment variables configuration
- [ ] Custom domain setup
- [ ] DNS configuration
- [ ] SSL certificate provisioning (automatic)
- [ ] Deployment verification

## Version Information

- **Next.js**: 15.2.2
- **React**: 19.0.0
- **Node.js**: 18.x+ recommended
- **Vercel CLI**: Latest (install: `npm i -g vercel`)

## Security Notes

- ✅ Environment variables not in Git
- ✅ Secrets excluded via .gitignore
- ✅ Security headers configured
- ✅ HTTPS enforced by Vercel
- ✅ No hardcoded credentials

## Performance Optimizations

- ✅ Image optimization (AVIF/WebP)
- ✅ Code splitting (automatic)
- ✅ Compression enabled
- ✅ CDN caching (Vercel Edge)
- ✅ Standalone output mode

## Next Steps

1. **Read**: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
2. **Deploy**: Follow 3-step process
3. **Verify**: Use [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. **Monitor**: Set up analytics and logging

## Updates & Maintenance

This documentation is current as of **2025-10-26**.

To update:
1. Edit relevant .md files
2. Update this index if adding/removing files
3. Test all commands
4. Update version information

---

## Quick Links

- **Start Deployment**: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
- **Full Guide**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
- **Commands**: [.vercel-commands.md](./.vercel-commands.md)
- **Troubleshooting**: [VERCEL_DEPLOYMENT.md#troubleshooting](./VERCEL_DEPLOYMENT.md#troubleshooting)

**Ready to deploy?** → Start with [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
