# Cost Analysis - Grand Archive Meta

## 💰 Updated Costs (Sharing MongoDB with FAB TCG)

### Monthly Operating Costs: **~$23/month**

| Service | Configuration | Monthly Cost | Notes |
|---------|--------------|--------------|-------|
| **EC2** | t4g.small ARM64 | **$13.14** | Backend API + Crawler |
| **MongoDB Atlas** | M10 (shared) | **$0** | Shared with FAB TCG Meta |
| **API Gateway** | 1M requests | **$3.50** | EDGE distribution |
| **Route 53** | 2 hosted zones | **$2.00** | .com + .net domains |
| **Data Transfer** | 50GB/month | **$4.50** | EC2 → Internet |
| **Vercel** | Hobby tier | **$0** | Frontend hosting |
| | | |
| **TOTAL** | | **~$23/month** | **74% cost reduction!** |

### Cost Comparison

| Scenario | Monthly Cost | Savings |
|----------|--------------|---------|
| **Original Estimate** | $80-100 | - |
| **With Shared MongoDB** | $23 | **$57-77** (70-77% reduction) |

## Cost Breakdown by Component

### 1. Compute (EC2)
- **Instance**: t4g.small (2 vCPU, 2GB RAM, ARM64)
- **Pricing**: $0.0168/hour = $12.26/month (730 hours)
- **Storage**: 20GB EBS gp3 = $1.60/month
- **Total**: **$13.86/month**

Alternatives:
- t4g.micro (1 vCPU, 1GB): $6/month (may be too small)
- t4g.medium (2 vCPU, 4GB): $26/month (if need more power)
- Reserved Instance (1-year): Save 30% → $9.70/month

### 2. Database (MongoDB Atlas)
- **Instance**: M10 (2GB RAM, 10GB storage)
- **Shared with**: FAB TCG Meta
- **Cost to Grand Archive**: **$0**
- **Actual cost**: $57/month (paid once, serves both projects)

**Database Sizing**:
- FAB TCG Meta: ~2GB data
- Grand Archive Meta: Estimated ~500MB-1GB
- M10 capacity: 10GB storage, plenty of headroom

**If you need to upgrade later**:
- M20 (4GB RAM): $90/month for both projects
- M30 (8GB RAM): $150/month for both projects

### 3. API Gateway
- **Type**: REST API (EDGE)
- **Requests**: Estimated 1M/month
- **Pricing**: $3.50 per million requests
- **CloudFront**: Included with EDGE
- **Total**: **$3.50/month**

**Scaling**:
- 0-1M requests: $3.50
- 1-10M requests: $35.00
- 10-100M requests: $350.00

### 4. DNS (Route 53)
- **Hosted Zones**: 2 ($0.50 each)
- **Domains**: grandarchivemeta.com + grandarchivemeta.net
- **Queries**: Minimal cost (first 1M free)
- **Total**: **$1.00/month**

### 5. Data Transfer
- **EC2 → Internet**: $0.09/GB for first 10TB
- **Estimated**: 50GB/month
- **Total**: **$4.50/month**

**If traffic increases**:
- 100GB: $9/month
- 500GB: $45/month
- Consider CloudFront caching to reduce transfer

### 6. Frontend (Vercel)
- **Tier**: Hobby (Free)
- **Bandwidth**: 100GB/month included
- **Deployments**: Unlimited
- **Total**: **$0**

Upgrade to Pro if needed:
- **Pro**: $20/month
- **Features**: Team collaboration, advanced analytics
- **Bandwidth**: 1TB/month

## Additional Potential Costs

### Optional Services

| Service | Use Case | Cost |
|---------|----------|------|
| **CloudWatch Logs** | Backend logging | ~$1/month |
| **CloudWatch Alarms** | Monitoring | ~$0.20/month |
| **ACM Certificate** | SSL/TLS | **Free** |
| **S3 Bucket** | Terraform state | ~$0.10/month |
| **Elastic IP** | Static IP for EC2 | **Free** (while attached) |

## Cost Optimization Tips

### 1. EC2 Reserved Instances
Save 30-40% by committing to 1-3 years:
- **1-year**: $9.70/month (save $4/month)
- **3-year**: $6.50/month (save $7/month)

### 2. MongoDB Shared Cluster Advantages
By sharing with FAB TCG Meta:
- **Save**: $57/month
- **Same performance**: M10 handles both easily
- **Better utilization**: Resources not wasted

### 3. Data Transfer Optimization
- Enable gzip compression: Save 70% bandwidth
- Implement pagination: Reduce payload sizes
- Use CloudFront CDN: Reduce EC2 transfer costs

### 4. API Gateway Caching
Enable caching to reduce backend calls:
- Cache TTL: 5 minutes
- Estimated savings: 50% of requests
- Cost reduction: ~$1.75/month

## Scaling Costs

### Traffic Growth Scenarios

| Monthly Users | Requests | EC2 | MongoDB | API GW | Total |
|---------------|----------|-----|---------|--------|-------|
| **1,000** | 100K | $14 | $0 | $0.35 | **~$20** |
| **10,000** | 1M | $14 | $0 | $3.50 | **~$23** |
| **100,000** | 10M | $26* | $0 | $35 | **~$68** |
| **1,000,000** | 100M | $52** | $45*** | $350 | **~$454** |

*Upgrade to t4g.medium
**Upgrade to t4g.large or add load balancer
***Upgrade to M20 dedicated cluster

## ROI Analysis

### Cost per User (at 10,000 monthly users)
- **Total cost**: $23/month
- **Cost per user**: $0.0023/month
- **Annual cost per user**: $0.028/year

### Comparison to Competitors
- **Heroku Hobby**: $7/dyno + $9/Postgres = $16/month (shared MongoDB saves here too!)
- **DigitalOcean App Platform**: $12/month + $15/database = $27/month
- **AWS Amplify**: $15-30/month (higher than our setup)

## Budget Recommendations

### Development/Staging
- Use the production setup (it's cheap enough)
- Or run everything locally (free)
- **Cost**: $0-23/month

### Production
- Start with current setup: **$23/month**
- Add monitoring: **$25/month**
- Add CDN if needed: **$30/month**
- **Budget**: $25-30/month for first 6 months

### Growth Plan
- 0-10K users: $23/month
- 10K-50K users: $30-40/month (might need t4g.medium)
- 50K-100K users: $60-80/month (upgrade EC2 + API Gateway)
- 100K+ users: $100-500/month (dedicated infrastructure)

## Cost Reduction from Shared MongoDB

**Original Estimate**: $80-100/month
- EC2: $13
- MongoDB: $57 ← **This cost is eliminated!**
- API Gateway: $3.50
- Route 53: $2
- Data Transfer: $4.50
- Total: $80

**With Shared MongoDB**: $23/month
- EC2: $13
- MongoDB: $0 ← **Shared with FAB TCG**
- API Gateway: $3.50
- Route 53: $2
- Data Transfer: $4.50
- Total: $23

**Savings**: **$57/month** or **$684/year**

## Summary

✅ **Monthly Cost**: $23 (70% cheaper than original estimate)
✅ **Shared MongoDB**: No additional database cost
✅ **Scalable**: Can grow to 100K users for <$100/month
✅ **Predictable**: No surprise charges with proper monitoring
✅ **Optimized**: Already using cost-effective ARM instances

The shared MongoDB architecture provides significant cost savings while maintaining full functionality and performance!

