# Grand Archive Meta Database

This directory contains all database-related documentation, scripts, and sample data for the Grand Archive Meta project.

## Contents

### 📄 Documentation
- **[schema.md](./schema.md)** - Comprehensive database schema documentation including:
  - Collection schemas and field descriptions
  - Relationships between collections
  - Index strategies
  - Data validation rules
  - Security best practices
  - Backup and scaling recommendations

### 🔧 Scripts
- **[indexes.js](./indexes.js)** - MongoDB index creation script
  - Creates all necessary indexes for optimal performance
  - Run on initial setup and after schema changes
  - Usage: `mongosh <connection-string> < indexes.js`

### 📦 Sample Data
The `seed-data/` directory contains sample JSON documents for testing:
- `sample_champion.json` - Example champion document
- `sample_event.json` - Example tournament event document
- `sample_decklist.json` - Example tournament decklist document
- `sample_standing.json` - Example tournament standing document
- `sample_card_stats.json` - Example card performance statistics document
- `sample_crawler_state.json` - Example crawler state document

### 🔄 Migrations
The `migrations/` directory is reserved for future database migration scripts.

## Quick Start

### 1. Setup MongoDB

**Option A: MongoDB Atlas (Recommended)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Create database user and whitelist IP
4. Get connection string

**Option B: Local MongoDB**
```bash
# Install MongoDB
brew install mongodb-community@6.0

# Start MongoDB service
brew services start mongodb-community@6.0
```

### 2. Set Environment Variables

```bash
export MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/grand-archive-meta"
export MONGODB_DB_NAME="grand-archive-meta"
```

### 3. Create Indexes

```bash
mongosh "$MONGODB_URI" < indexes.js
```

### 4. Load Sample Data (Optional)

```bash
# Import sample champion
mongoimport --uri="$MONGODB_URI" \
  --collection=champions \
  --file=seed-data/sample_champion.json

# Import sample event
mongoimport --uri="$MONGODB_URI" \
  --collection=events \
  --file=seed-data/sample_event.json

# Import sample decklist
mongoimport --uri="$MONGODB_URI" \
  --collection=decklists \
  --file=seed-data/sample_decklist.json

# Import sample standing
mongoimport --uri="$MONGODB_URI" \
  --collection=standings \
  --file=seed-data/sample_standing.json

# Import sample card stats
mongoimport --uri="$MONGODB_URI" \
  --collection=card_performance_stats \
  --file=seed-data/sample_card_stats.json

# Import sample crawler state
mongoimport --uri="$MONGODB_URI" \
  --collection=crawler_state \
  --file=seed-data/sample_crawler_state.json
```

## Collections Overview

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `champions` | Champion/deck archetype data | slug, uuid, name |
| `events` | Tournament events | eventId, format+startAt, status+ranked |
| `standings` | Player standings in events | eventId+playerId, championSlug |
| `decklists` | Tournament decklists | eventId+playerId, championSlug |
| `card_performance_stats` | Aggregated card statistics | cardId, winRate, totalInclusions |
| `crawler_state` | Web crawler state tracking | crawlerName, sourceType+status |
| `users` | User accounts (future) | userId, email, username |
| `saved_decklists` | User-saved decklists (future) | userId, championSlug+visibility |

## Database Management

### Backup

**MongoDB Atlas**: Automatic continuous backups with point-in-time recovery

**Local/Self-hosted**:
```bash
# Create backup
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y-%m-%d)

# Restore from backup
mongorestore --uri="$MONGODB_URI" ./backup/2024-02-11
```

### Verify Indexes

```javascript
// Connect to database
mongosh "$MONGODB_URI"

// Check indexes on a collection
db.champions.getIndexes()

// Check index usage stats
db.champions.aggregate([{ $indexStats: {} }])
```

### Monitor Performance

```javascript
// Find slow queries
db.currentOp({"secs_running": {$gte: 5}})

// Get collection statistics
db.events.stats()

// Explain query execution
db.events.find({ format: "Constructed" }).explain("executionStats")
```

## Security Checklist

- [ ] Strong database user passwords
- [ ] IP whitelist configured
- [ ] TLS/SSL enabled for connections
- [ ] Connection string stored in environment variables (not in code)
- [ ] Different credentials for dev/staging/production
- [ ] Regular password rotation (quarterly)
- [ ] Audit logging enabled (if using Enterprise/Atlas)
- [ ] Backup testing performed regularly

## Scaling Strategy

### When to Scale

- **Vertical Scaling**: When CPU/memory consistently >70%
- **Horizontal Scaling**: When dataset >500GB or write throughput limited
- **Read Replicas**: When read queries slow down main database

### Recommended Sharding Keys

- `events`: `{ eventId: "hashed" }`
- `decklists`: `{ eventId: 1, playerId: 1 }`
- `standings`: `{ eventId: 1, playerId: 1 }`
- `card_performance_stats`: `{ cardId: "hashed" }`

## Maintenance Tasks

### Daily
- Monitor slow query logs
- Check crawler state and error logs
- Verify backup completion

### Weekly
- Review index usage statistics
- Check disk space and growth trends
- Analyze query performance metrics

### Monthly
- Review and optimize slow queries
- Test backup restoration
- Review access logs for anomalies
- Update documentation as needed

### Quarterly
- Rotate database passwords
- Review and archive old data
- Performance audit
- Security audit

## Troubleshooting

### Slow Queries
1. Run `explain()` on the query
2. Check if indexes are being used
3. Verify index is optimal for query pattern
4. Consider compound indexes for common queries

### High Memory Usage
1. Check index sizes: `db.collection.stats().indexSizes`
2. Review large document sizes
3. Consider archiving old data
4. Increase server memory if needed

### Connection Issues
1. Verify connection string format
2. Check IP whitelist settings
3. Verify network connectivity
4. Check connection pool settings

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [Schema Design Best Practices](https://docs.mongodb.com/manual/core/data-modeling-introduction/)
- [Index Strategy Guide](https://docs.mongodb.com/manual/indexes/)

## Support

For questions or issues:
1. Check the [schema documentation](./schema.md)
2. Review MongoDB official documentation
3. Open an issue in the project repository

---

**Last Updated**: 2024-02-11
