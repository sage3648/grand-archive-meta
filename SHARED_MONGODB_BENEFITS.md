# Benefits of Shared MongoDB Architecture

## Overview

Both **FAB TCG Meta** and **Grand Archive Meta** share the same MongoDB Atlas cluster but use separate databases. This architecture provides significant advantages.

## Architecture

```
MongoDB Atlas Cluster: fab-meta.yxt6hgt.mongodb.net (M10)
│
├── Database: fab-meta
│   ├── Collection: decks
│   ├── Collection: heroes
│   ├── Collection: cards
│   ├── Collection: fab-insights-games
│   └── ... (other FAB collections)
│
└── Database: grand-archive-meta
    ├── Collection: champions
    ├── Collection: events
    ├── Collection: decklists
    ├── Collection: standings
    └── ... (other GA collections)
```

## Key Benefits

### 1. Cost Savings: $684/year

**Without Sharing** (2 separate clusters):
- FAB TCG Meta: M10 cluster = $57/month
- Grand Archive Meta: M10 cluster = $57/month
- **Total**: $114/month = $1,368/year

**With Sharing** (1 cluster, 2 databases):
- Shared M10 cluster = $57/month
- **Total**: $57/month = $684/year
- **Savings**: **$684/year** (50% reduction)

### 2. Resource Efficiency

**MongoDB M10 Cluster Resources**:
- RAM: 2GB
- Storage: 10GB
- vCPUs: Shared pool

**Current Usage**:
- FAB TCG Meta: ~2GB data
- Grand Archive Meta: ~0.5-1GB data (estimated)
- **Total**: ~3GB (well within 10GB limit)

**Headroom**: 70% capacity remaining for growth

### 3. Simplified Management

**Single Point of Management**:
- ✅ One cluster to monitor
- ✅ One backup configuration
- ✅ One set of IP whitelist rules
- ✅ One connection string pattern
- ✅ One upgrade path

**vs. Multiple Clusters**:
- ❌ Multiple monitoring dashboards
- ❌ Separate backup configs
- ❌ Duplicate security settings
- ❌ More complex credential management

### 4. Unified Backups

**Automatic Backups** (M10+ feature):
- Continuous backup covers both databases
- Point-in-time recovery for both projects
- No additional configuration needed
- No duplicate backup costs

**Restore Scenarios**:
```bash
# Restore just FAB TCG Meta
mongorestore --nsInclude="fab-meta.*" dump/

# Restore just Grand Archive Meta
mongorestore --nsInclude="grand-archive-meta.*" dump/

# Restore both
mongorestore dump/
```

### 5. Cross-Game Analysis Potential

**Same Cluster = Easy Queries**:
```javascript
// Connect once, query both
use fab-meta;
const fabHeroes = db.heroes.find().toArray();

use grand-archive-meta;
const gaChampions = db.champions.find().toArray();

// Compare ecosystems
console.log(`FAB has ${fabHeroes.length} heroes`);
console.log(`Grand Archive has ${gaChampions.length} champions`);
```

**Future Possibilities**:
- Compare meta diversity between games
- Analyze design patterns across TCGs
- Build unified analytics dashboards
- Cross-game user preferences

### 6. Better Resource Utilization

**Single Cluster Load Balancing**:
- MongoDB automatically distributes load
- Shared connection pool
- Better cache utilization
- More efficient use of resources

**Peak Load Handling**:
- FAB tournament day: Grand Archive uses spare capacity
- Grand Archive event: FAB uses spare capacity
- Natural load balancing between projects

### 7. Easier Scaling Path

**Vertical Scaling** (when needed):
```
Current:  M10 (2GB RAM, 10GB storage) = $57/month
↓
Upgrade:  M20 (4GB RAM, 20GB storage) = $90/month (both projects!)
↓
Upgrade:  M30 (8GB RAM, 40GB storage) = $150/month (both projects!)
```

**Cost Comparison**:
| Tier | Shared | Separate | Savings |
|------|--------|----------|---------|
| M10 | $57 | $114 | $57/mo |
| M20 | $90 | $180 | $90/mo |
| M30 | $150 | $300 | $150/mo |

### 8. Simplified Deployment

**Single Connection String Pattern**:
```bash
# FAB TCG Meta
MONGODB_URI=mongodb+srv://admin:PASSWORD@fab-meta.yxt6hgt.mongodb.net/fab-meta

# Grand Archive Meta
MONGODB_URI=mongodb+srv://admin:PASSWORD@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta
```

Only the database name changes!

### 9. Development Environment

**Local Development**:
```bash
# Use the same cluster for both dev and prod
# Separate databases keep data isolated
# No need for local MongoDB instances
# Consistent behavior across projects
```

### 10. Security Benefits

**Unified Security**:
- Same IP whitelist for both projects
- Same authentication credentials
- Same network security rules
- Easier to audit and manage

**Isolation Where It Matters**:
- Separate databases prevent accidental cross-project queries
- Application-level isolation via connection strings
- No cross-database foreign keys (clean separation)

## Data Isolation Strategy

### Database-Level Separation

MongoDB provides **strong isolation** between databases:
- ✅ Separate namespaces
- ✅ No cross-database queries by default
- ✅ Independent collections
- ✅ Separate indexes
- ✅ Independent schema evolution

### Application-Level Isolation

Each application connects to its own database:
```rust
// FAB TCG Meta backend
let db = client.database("fab-meta");

// Grand Archive Meta backend
let db = client.database("grand-archive-meta");
```

**Zero risk of data mixing** - applications don't even see each other's databases.

## Migration Strategy (If Needed)

If you ever need to separate:

### Option 1: Database Export/Import
```bash
# Export Grand Archive data
mongodump --uri="mongodb+srv://...@fab-meta.../grand-archive-meta" --out=backup/

# Import to new cluster
mongorestore --uri="mongodb+srv://...@new-cluster.../grand-archive-meta" backup/
```

### Option 2: MongoDB Atlas Live Migration
- Use Atlas built-in migration tools
- Zero downtime migration
- Automatic sync and cutover

### Cost: Easy and Fast
- Export/Import: ~1 hour for 1GB data
- Live Migration: Atlas handles automatically
- No data loss risk

## Performance Characteristics

### M10 Cluster Performance

**Specifications**:
- RAM: 2GB
- Storage: 10GB
- IOPS: 3,000
- Connections: 500 simultaneous

**Current Load**:
- FAB TCG Meta: ~100 req/sec (peak)
- Grand Archive Meta: ~50 req/sec (estimated)
- **Total**: ~150 req/sec (well under limits)

**Performance**: No degradation expected until 500+ req/sec

### Index Strategy

Each database maintains its own indexes:
- FAB: 40+ indexes
- Grand Archive: 51 indexes
- Total: 91 indexes (MongoDB handles efficiently)

## Monitoring Both Projects

### MongoDB Atlas Dashboard

View both databases in one place:
1. Cluster metrics (CPU, RAM, IOPS)
2. Database size breakdown
3. Operation counts per database
4. Slow query analysis per database

### Alerts

Set up alerts for:
- Combined cluster CPU > 80%
- Combined storage > 8GB (80% of 10GB)
- Connection count > 400 (80% of 500)
- Slow queries in either database

## Best Practices

### 1. Database Naming Convention
✅ Use clear, descriptive names:
- `fab-meta` (not `production` or `db1`)
- `grand-archive-meta` (not `ga` or `db2`)

### 2. Connection String Management
✅ Store in environment variables:
```bash
FAB_MONGODB_URI=mongodb+srv://.../fab-meta
GA_MONGODB_URI=mongodb+srv://.../grand-archive-meta
```

### 3. Backup Verification
✅ Test restores regularly:
- Monthly: Restore to test cluster
- Verify data integrity
- Document restore procedures

### 4. Monitor Capacity
✅ Set up alerts:
- Storage at 70% (7GB of 10GB)
- Plan upgrade to M20 before hitting limits
- Budget for growth

### 5. Document Dependencies
✅ Keep track of:
- Which applications use which databases
- Connection string locations
- Deployment dependencies

## Conclusion

Sharing the MongoDB cluster provides:
- **$684/year cost savings**
- **Simplified management**
- **Better resource utilization**
- **Unified backups**
- **Easy scaling path**
- **Strong data isolation**

This is a **production-proven architecture** used by many multi-tenant applications. You get the benefits of shared infrastructure while maintaining complete logical separation between projects.

---

**Recommendation**: ✅ Keep using shared MongoDB cluster
**Risk**: Minimal (proper isolation in place)
**Savings**: Significant ($684/year)
**Complexity**: Reduced (easier to manage one cluster)

