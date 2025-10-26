# MongoDB Quick Reference Guide

Quick commands and queries for the Grand Archive Meta database.

## Connection

```bash
# Using connection string
mongosh "mongodb+srv://username:password@cluster.mongodb.net/grand-archive-meta"

# Using environment variable
mongosh "$MONGODB_URI"
```

## Common Queries

### Champions

```javascript
// Get all champions
db.champions.find()

// Find champion by slug
db.champions.findOne({ slug: "silvie" })

// Search champions by name
db.champions.find({ name: /silvie/i })

// Get all Wind element champions
db.champions.find({ element: "Wind" })
```

### Events

```javascript
// Get all completed events
db.events.find({ status: "completed" }).sort({ startAt: -1 })

// Find events by format
db.events.find({ format: "Constructed" })

// Get upcoming ranked events
db.events.find({
  status: "upcoming",
  ranked: true
}).sort({ startAt: 1 })

// Find events by country
db.events.find({ "location.country": "USA" })

// Get recent events (last 30 days)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
db.events.find({
  startAt: { $gte: thirtyDaysAgo }
}).sort({ startAt: -1 })
```

### Standings

```javascript
// Get all standings for an event
db.standings.find({ eventId: "ga-regional-2024-001" }).sort({ placement: 1 })

// Get top 8 for an event
db.standings.find({
  eventId: "ga-regional-2024-001",
  madeCut: true
}).sort({ placement: 1 }).limit(8)

// Get all standings for a player
db.standings.find({ playerId: "player-12345" }).sort({ createdAt: -1 })

// Get all Silvie standings
db.standings.find({ championSlug: "silvie" })

// Get champion win rate (aggregation)
db.standings.aggregate([
  { $match: { championSlug: "silvie" } },
  {
    $group: {
      _id: null,
      avgWins: { $avg: "$wins" },
      totalPlayers: { $sum: 1 }
    }
  }
])

// Champion placement distribution
db.standings.aggregate([
  { $match: { championSlug: "silvie" } },
  {
    $bucket: {
      groupBy: "$placement",
      boundaries: [1, 5, 9, 17, 33, 1000],
      default: "Other",
      output: { count: { $sum: 1 } }
    }
  }
])
```

### Decklists

```javascript
// Get all decklists for an event
db.decklists.find({ eventId: "ga-regional-2024-001" })

// Get winning decklist
db.decklists.findOne({
  eventId: "ga-regional-2024-001",
  placement: 1
})

// Find all decklists for a champion
db.decklists.find({ championSlug: "silvie" })

// Find decklists containing a specific card
db.decklists.find({
  "mainDeck.cardId": "ga-card-001"
})

// Find top-performing decklists (top 8)
db.decklists.find({
  placement: { $lte: 8 },
  verified: true
}).sort({ placement: 1 })

// Get decklists by archetype
db.decklists.find({ archetype: "Tempo Silvie" })

// Find similar decklists by hash
db.decklists.find({
  deckHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
})
```

### Card Performance Stats

```javascript
// Get stats for a card
db.card_performance_stats.findOne({ cardId: "ga-card-001" })

// Most played cards
db.card_performance_stats.find()
  .sort({ "overallStats.totalInclusions": -1 })
  .limit(10)

// Highest win rate cards (min 50 inclusions)
db.card_performance_stats.find({
  "overallStats.totalInclusions": { $gte: 50 }
})
  .sort({ "overallStats.winRate": -1 })
  .limit(10)

// Best performing cards in top cut
db.card_performance_stats.find({
  "overallStats.topCutInclusions": { $gte: 10 }
})
  .sort({ "overallStats.topCutWinRate": -1 })
  .limit(10)

// Get card stats for specific champion
db.card_performance_stats.find({
  "byChampion.championSlug": "silvie"
})

// Rising cards (trending up)
db.card_performance_stats.find({
  "recentTrends.last30Days.trend": "rising"
})
```

### Crawler State

```javascript
// Get all crawler states
db.crawler_state.find()

// Get specific crawler
db.crawler_state.findOne({ crawlerName: "melee-events-crawler" })

// Get active crawlers
db.crawler_state.find({
  status: "running",
  "config.enabled": true
})

// Get crawlers with errors
db.crawler_state.find({
  status: "error"
})

// Get crawlers due for run (example: 6 hours)
const sixHoursAgo = new Date();
sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
db.crawler_state.find({
  "config.enabled": true,
  lastRunAt: { $lt: sixHoursAgo }
})
```

## Aggregation Queries

### Champion Meta Share

```javascript
// Meta share by champion (last 30 days)
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

db.standings.aggregate([
  {
    $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "eventId",
      as: "event"
    }
  },
  { $unwind: "$event" },
  {
    $match: {
      "event.startAt": { $gte: thirtyDaysAgo },
      "event.status": "completed"
    }
  },
  {
    $group: {
      _id: "$championSlug",
      count: { $sum: 1 },
      avgPlacement: { $avg: "$placement" },
      topCuts: { $sum: { $cond: ["$madeCut", 1, 0] } }
    }
  },
  { $sort: { count: -1 } }
])
```

### Event Statistics

```javascript
// Average event size by category
db.events.aggregate([
  {
    $group: {
      _id: "$category",
      avgPlayers: { $avg: "$playerCount" },
      totalEvents: { $sum: 1 },
      avgRounds: { $avg: "$rounds" }
    }
  },
  { $sort: { avgPlayers: -1 } }
])
```

### Card Co-occurrence Analysis

```javascript
// Find cards that appear together frequently
db.decklists.aggregate([
  { $unwind: "$mainDeck" },
  {
    $group: {
      _id: "$_id",
      cards: { $push: "$mainDeck.cardId" }
    }
  },
  {
    $unwind: "$cards"
  },
  {
    $lookup: {
      from: "decklists",
      let: { deckId: "$_id", cardId: "$cards" },
      pipeline: [
        { $match: { $expr: { $eq: ["$_id", "$$deckId"] } } },
        { $unwind: "$mainDeck" },
        { $match: { $expr: { $ne: ["$mainDeck.cardId", "$$cardId"] } } },
        { $group: { _id: "$mainDeck.cardId", count: { $sum: 1 } } }
      ],
      as: "cooccurrences"
    }
  }
])
```

## Index Management

```javascript
// List all indexes for a collection
db.champions.getIndexes()

// Create index
db.champions.createIndex({ element: 1 })

// Create compound index
db.events.createIndex({ format: 1, startAt: -1 })

// Create unique index
db.champions.createIndex({ slug: 1 }, { unique: true })

// Create sparse index (only indexes documents with the field)
db.users.createIndex(
  { emailVerificationToken: 1 },
  { sparse: true }
)

// Drop index
db.champions.dropIndex("idx_champions_element")

// Get index usage statistics
db.champions.aggregate([{ $indexStats: {} }])
```

## Performance Analysis

```javascript
// Explain query execution
db.events.find({ format: "Constructed" }).explain("executionStats")

// Find slow queries (requires profiling enabled)
db.system.profile.find({ millis: { $gt: 100 } }).sort({ ts: -1 })

// Get collection statistics
db.champions.stats()

// Database statistics
db.stats()

// Check current operations
db.currentOp()

// Kill a long-running operation
db.killOp(<operation_id>)
```

## Data Maintenance

```javascript
// Count documents
db.events.countDocuments()
db.events.countDocuments({ status: "completed" })

// Update single document
db.champions.updateOne(
  { slug: "silvie" },
  { $set: { element: "Wind" } }
)

// Update multiple documents
db.events.updateMany(
  { status: "active" },
  { $set: { status: "ongoing" } }
)

// Delete documents
db.standings.deleteMany({ eventId: "old-event-id" })

// Rename field
db.events.updateMany(
  {},
  { $rename: { "oldFieldName": "newFieldName" } }
)

// Remove field
db.decklists.updateMany(
  {},
  { $unset: { deprecatedField: "" } }
)

// Add field to documents that don't have it
db.standings.updateMany(
  { archetype: { $exists: false } },
  { $set: { archetype: null } }
)
```

## Backup & Restore

```bash
# Backup entire database
mongodump --uri="$MONGODB_URI" --out=./backup/$(date +%Y-%m-%d)

# Backup single collection
mongodump --uri="$MONGODB_URI" --collection=champions --out=./backup/

# Restore database
mongorestore --uri="$MONGODB_URI" ./backup/2024-02-11/

# Restore single collection
mongorestore --uri="$MONGODB_URI" --collection=champions ./backup/champions.bson

# Export to JSON
mongoexport --uri="$MONGODB_URI" --collection=champions --out=champions.json

# Import from JSON
mongoimport --uri="$MONGODB_URI" --collection=champions --file=champions.json
```

## Useful Aggregation Operators

```javascript
// $lookup - Join collections
db.standings.aggregate([
  {
    $lookup: {
      from: "events",
      localField: "eventId",
      foreignField: "eventId",
      as: "event"
    }
  }
])

// $group - Group and aggregate
db.standings.aggregate([
  {
    $group: {
      _id: "$championSlug",
      avgWins: { $avg: "$wins" },
      count: { $sum: 1 }
    }
  }
])

// $match - Filter documents
db.events.aggregate([
  { $match: { status: "completed" } }
])

// $sort - Sort results
db.events.aggregate([
  { $sort: { startAt: -1 } }
])

// $limit - Limit results
db.events.aggregate([
  { $limit: 10 }
])

// $project - Select/transform fields
db.champions.aggregate([
  {
    $project: {
      name: 1,
      slug: 1,
      _id: 0
    }
  }
])

// $unwind - Deconstruct array
db.decklists.aggregate([
  { $unwind: "$mainDeck" }
])
```

## Tips & Best Practices

1. **Always use indexes for queries** - Check with `.explain()`
2. **Use projection to limit returned fields** - Reduces network overhead
3. **Batch operations when possible** - Use `bulkWrite()` for multiple operations
4. **Monitor slow queries** - Enable profiling for production
5. **Use compound indexes wisely** - Order matters: equality, sort, range
6. **Avoid large arrays in documents** - Consider separate collection if >100 items
7. **Use aggregation for complex queries** - More efficient than client-side processing
8. **Test queries on development first** - Especially updates and deletes
9. **Back up before migrations** - Always have a rollback plan
10. **Use connection pooling** - Configure appropriate pool size for your app

## Common Patterns

### Pagination
```javascript
const pageSize = 20;
const page = 1;

db.events.find()
  .sort({ startAt: -1 })
  .skip((page - 1) * pageSize)
  .limit(pageSize)
```

### Search with Multiple Criteria
```javascript
db.events.find({
  $and: [
    { format: "Constructed" },
    { status: "completed" },
    { playerCount: { $gte: 100 } }
  ]
})
```

### Text Search (requires text index)
```javascript
// Create text index
db.champions.createIndex({ name: "text" })

// Search
db.champions.find({ $text: { $search: "silvie wind" } })
```

### Upsert (Update or Insert)
```javascript
db.champions.updateOne(
  { slug: "silvie" },
  { $set: { name: "Silvie", element: "Wind" } },
  { upsert: true }
)
```

## Troubleshooting

### Query is slow
1. Run `.explain("executionStats")` to see execution plan
2. Check if indexes are being used
3. Look for COLLSCAN (full collection scan)
4. Create appropriate indexes

### Out of memory
1. Reduce result set with `$match` early in pipeline
2. Use `$project` to limit fields
3. Process in batches
4. Consider increasing server memory

### Connection issues
1. Verify connection string
2. Check IP whitelist
3. Verify credentials
4. Check network connectivity

### Data inconsistency
1. Run validation script: `mongosh "$MONGODB_URI" < validate.js`
2. Check for orphaned documents
3. Verify foreign key references
4. Review recent migrations

---

For more detailed information, see [schema.md](./schema.md) and [README.md](./README.md).
