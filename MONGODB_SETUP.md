# MongoDB Configuration for Grand Archive Meta

## Overview

This project **shares the same MongoDB Atlas cluster** as your FAB TCG Meta site, but uses a **separate database**.

## Connection Details

- **Cluster**: `fab-meta.yxt6hgt.mongodb.net`
- **FAB Database**: `fab-meta` (existing)
- **Grand Archive Database**: `grand-archive-meta` (new)
- **Credentials**: Same as FAB TCG Meta

## Connection String

```
mongodb+srv://admin:NgHcboRsi1clgElv@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta?retryWrites=true&w=majority
```

## Database Isolation

Both projects use the same MongoDB cluster but different databases:

```
MongoDB Atlas Cluster: fab-meta.yxt6hgt.mongodb.net
├── fab-meta (database)
│   ├── decks
│   ├── heroes
│   ├── cards
│   └── ... (FAB collections)
│
└── grand-archive-meta (database)
    ├── champions
    ├── events
    ├── decklists
    ├── standings
    └── ... (Grand Archive collections)
```

## Collections in grand-archive-meta Database

1. **champions** - Champion/hero data
2. **events** - Tournament events
3. **standings** - Player standings
4. **decklists** - Tournament decklists
5. **card_performance_stats** - Card statistics
6. **crawler_state** - Crawler tracking
7. **users** - User accounts (future)
8. **saved_decklists** - User decklists (future)

## Setup Instructions

### 1. Create Indexes

The indexes will be created automatically when the backend starts, or you can create them manually:

```bash
cd database
export MONGODB_URI="mongodb+srv://admin:NgHcboRsi1clgElv@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta"
mongosh "$MONGODB_URI" < indexes.js
```

### 2. Verify Connection

```bash
mongosh "mongodb+srv://admin:NgHcboRsi1clgElv@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta"
```

### 3. Import Sample Data (Optional)

```bash
cd database/seed-data
mongoimport --uri="mongodb+srv://admin:NgHcboRsi1clgElv@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta" \
  --collection=champions \
  --file=sample_champion.json
```

## Backend Configuration

The backend `.env` file is already configured:

```bash
MONGODB_URI=mongodb+srv://admin:NgHcboRsi1clgElv@fab-meta.yxt6hgt.mongodb.net/grand-archive-meta
MONGODB_DATABASE=grand-archive-meta
```

## Cost Impact

**No additional cost** - using the same MongoDB Atlas cluster means:
- Same M10 instance ($57/month) handles both projects
- Separate databases provide logical isolation
- Shared resources (storage, compute)

## Monitoring Both Databases

In MongoDB Atlas:
1. Navigate to your cluster
2. Click "Collections"
3. You'll see both databases:
   - `fab-meta` (FAB TCG data)
   - `grand-archive-meta` (Grand Archive data)

## Backup Strategy

Since both projects share the same cluster:
- Backups include both databases automatically
- Atlas continuous backup covers everything
- Point-in-time recovery available (M10+)

## Migration Between Databases

If you ever need to query across both games:

```javascript
// Connect to cluster
use fab-meta;
const fabHeroes = db.heroes.find();

use grand-archive-meta;
const gaChampions = db.champions.find();

// Compare or analyze both
```

## Advantages of Shared Cluster

1. **Cost-effective**: No duplicate infrastructure
2. **Simplified management**: One cluster to monitor
3. **Shared resources**: Better resource utilization
4. **Easy cross-game analysis**: Data in same cluster
5. **Single backup strategy**: One backup covers both

## Security

Both databases use the same credentials but are logically separated:
- No cross-database access by default
- Application-level isolation
- Same network/IP whitelisting rules

## Future Considerations

If either project grows significantly, you can:
1. Keep using shared cluster (scales up to M60+)
2. Split into separate clusters if needed
3. MongoDB Atlas makes migration easy

---

**Status**: ✅ Ready to use - no setup required!
