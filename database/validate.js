// Database Validation Script
// Purpose: Validates database schema, indexes, and data integrity
// Usage: mongosh <connection-string> < validate.js

use grand-archive-meta

print("\n========================================");
print("Database Validation Report");
print("========================================\n");

// Track validation results
let validationResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: []
};

// Helper function to check if collection exists
function collectionExists(collectionName) {
  const collections = db.getCollectionNames();
  return collections.includes(collectionName);
}

// Helper function to check if index exists
function indexExists(collectionName, indexName) {
  if (!collectionExists(collectionName)) return false;
  const indexes = db.getCollection(collectionName).getIndexes();
  return indexes.some(idx => idx.name === indexName);
}

// Helper function to report test result
function reportTest(testName, passed, message = "") {
  if (passed) {
    print(`✓ ${testName}`);
    validationResults.passed++;
  } else {
    print(`✗ ${testName}`);
    if (message) print(`  Error: ${message}`);
    validationResults.failed++;
    validationResults.errors.push({ test: testName, message });
  }
}

// Helper function to report warning
function reportWarning(message) {
  print(`⚠ Warning: ${message}`);
  validationResults.warnings++;
}

print("=== COLLECTION VALIDATION ===\n");

// Validate required collections
const requiredCollections = [
  'champions',
  'events',
  'standings',
  'decklists',
  'card_performance_stats',
  'crawler_state'
];

requiredCollections.forEach(collName => {
  reportTest(
    `Collection '${collName}' exists`,
    collectionExists(collName),
    `Collection '${collName}' not found`
  );
});

print("\n=== INDEX VALIDATION ===\n");

// Validate champions indexes
const championIndexes = [
  'idx_champions_slug_unique',
  'idx_champions_name',
  'idx_champions_uuid_unique',
  'idx_champions_element'
];

championIndexes.forEach(idxName => {
  reportTest(
    `champions.${idxName}`,
    indexExists('champions', idxName),
    `Index '${idxName}' not found on champions collection`
  );
});

// Validate events indexes
const eventIndexes = [
  'idx_events_eventId_unique',
  'idx_events_format_startAt',
  'idx_events_category_status',
  'idx_events_status_ranked',
  'idx_events_startAt',
  'idx_events_location_country_startAt'
];

eventIndexes.forEach(idxName => {
  reportTest(
    `events.${idxName}`,
    indexExists('events', idxName),
    `Index '${idxName}' not found on events collection`
  );
});

// Validate standings indexes
const standingIndexes = [
  'idx_standings_eventId_playerId_unique',
  'idx_standings_eventId_placement',
  'idx_standings_championSlug_placement',
  'idx_standings_playerId_createdAt',
  'idx_standings_eventId_madeCut',
  'idx_standings_decklistId'
];

standingIndexes.forEach(idxName => {
  reportTest(
    `standings.${idxName}`,
    indexExists('standings', idxName),
    `Index '${idxName}' not found on standings collection`
  );
});

// Validate decklists indexes
const decklistIndexes = [
  'idx_decklists_eventId_playerId',
  'idx_decklists_championSlug_eventId',
  'idx_decklists_deckHash',
  'idx_decklists_mainDeck_cardId',
  'idx_decklists_eventId_placement',
  'idx_decklists_archetype_createdAt',
  'idx_decklists_createdAt',
  'idx_decklists_championSlug_verified_createdAt'
];

decklistIndexes.forEach(idxName => {
  reportTest(
    `decklists.${idxName}`,
    indexExists('decklists', idxName),
    `Index '${idxName}' not found on decklists collection`
  );
});

// Validate card_performance_stats indexes
const cardStatsIndexes = [
  'idx_card_stats_cardId_unique',
  'idx_card_stats_cardName',
  'idx_card_stats_totalInclusions',
  'idx_card_stats_winRate',
  'idx_card_stats_byChampion_slug',
  'idx_card_stats_element_cardType',
  'idx_card_stats_lastCalculated',
  'idx_card_stats_topCutWinRate'
];

cardStatsIndexes.forEach(idxName => {
  reportTest(
    `card_performance_stats.${idxName}`,
    indexExists('card_performance_stats', idxName),
    `Index '${idxName}' not found on card_performance_stats collection`
  );
});

// Validate crawler_state indexes
const crawlerIndexes = [
  'idx_crawler_state_crawlerName_unique',
  'idx_crawler_state_sourceType_status',
  'idx_crawler_state_lastRunAt',
  'idx_crawler_state_status_enabled'
];

crawlerIndexes.forEach(idxName => {
  reportTest(
    `crawler_state.${idxName}`,
    indexExists('crawler_state', idxName),
    `Index '${idxName}' not found on crawler_state collection`
  );
});

print("\n=== DATA INTEGRITY VALIDATION ===\n");

// Check for orphaned standings (references to non-existent events)
if (collectionExists('standings') && collectionExists('events')) {
  const orphanedStandings = db.standings.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "eventId",
        as: "event"
      }
    },
    {
      $match: {
        event: { $size: 0 }
      }
    },
    {
      $count: "orphaned"
    }
  ]).toArray();

  const orphanedCount = orphanedStandings.length > 0 ? orphanedStandings[0].orphaned : 0;
  reportTest(
    "No orphaned standings (standings without matching events)",
    orphanedCount === 0,
    `Found ${orphanedCount} orphaned standings`
  );
}

// Check for orphaned decklists (references to non-existent events)
if (collectionExists('decklists') && collectionExists('events')) {
  const orphanedDecklists = db.decklists.aggregate([
    {
      $lookup: {
        from: "events",
        localField: "eventId",
        foreignField: "eventId",
        as: "event"
      }
    },
    {
      $match: {
        event: { $size: 0 }
      }
    },
    {
      $count: "orphaned"
    }
  ]).toArray();

  const orphanedCount = orphanedDecklists.length > 0 ? orphanedDecklists[0].orphaned : 0;
  reportTest(
    "No orphaned decklists (decklists without matching events)",
    orphanedCount === 0,
    `Found ${orphanedCount} orphaned decklists`
  );
}

// Check for invalid champion references in standings
if (collectionExists('standings') && collectionExists('champions')) {
  const invalidChampionRefs = db.standings.aggregate([
    {
      $lookup: {
        from: "champions",
        localField: "championSlug",
        foreignField: "slug",
        as: "champion"
      }
    },
    {
      $match: {
        champion: { $size: 0 }
      }
    },
    {
      $count: "invalid"
    }
  ]).toArray();

  const invalidCount = invalidChampionRefs.length > 0 ? invalidChampionRefs[0].invalid : 0;
  reportTest(
    "No invalid champion references in standings",
    invalidCount === 0,
    `Found ${invalidCount} standings with invalid champion references`
  );
}

// Check for invalid champion references in decklists
if (collectionExists('decklists') && collectionExists('champions')) {
  const invalidChampionRefs = db.decklists.aggregate([
    {
      $lookup: {
        from: "champions",
        localField: "championSlug",
        foreignField: "slug",
        as: "champion"
      }
    },
    {
      $match: {
        champion: { $size: 0 }
      }
    },
    {
      $count: "invalid"
    }
  ]).toArray();

  const invalidCount = invalidChampionRefs.length > 0 ? invalidChampionRefs[0].invalid : 0;
  reportTest(
    "No invalid champion references in decklists",
    invalidCount === 0,
    `Found ${invalidCount} decklists with invalid champion references`
  );
}

print("\n=== DATABASE STATISTICS ===\n");

// Display collection counts
requiredCollections.forEach(collName => {
  if (collectionExists(collName)) {
    const count = db.getCollection(collName).countDocuments();
    print(`${collName}: ${count} documents`);
  }
});

print("\n=== INDEX USAGE STATISTICS ===\n");

// Check for unused indexes (requires recent query activity)
requiredCollections.forEach(collName => {
  if (collectionExists(collName)) {
    print(`\n${collName}:`);
    const indexStats = db.getCollection(collName).aggregate([
      { $indexStats: {} }
    ]).toArray();

    indexStats.forEach(stat => {
      const accessCount = stat.accesses ? stat.accesses.ops : 0;
      if (accessCount === 0 && stat.name !== '_id_') {
        reportWarning(`Index '${stat.name}' on ${collName} has never been used`);
      }
      print(`  ${stat.name}: ${accessCount} operations`);
    });
  }
});

print("\n=== STORAGE STATISTICS ===\n");

const dbStats = db.stats();
print(`Database: ${dbStats.db}`);
print(`Collections: ${dbStats.collections}`);
print(`Data Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
print(`Storage Size: ${(dbStats.storageSize / 1024 / 1024).toFixed(2)} MB`);
print(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);
print(`Average Object Size: ${dbStats.avgObjSize} bytes`);

// Check for collections with large average document sizes
requiredCollections.forEach(collName => {
  if (collectionExists(collName)) {
    const stats = db.getCollection(collName).stats();
    const avgSize = stats.avgObjSize;
    if (avgSize > 100000) { // 100KB
      reportWarning(`${collName} has large average document size: ${(avgSize / 1024).toFixed(2)} KB`);
    }
  }
});

print("\n========================================");
print("Validation Summary");
print("========================================");
print(`Tests Passed: ${validationResults.passed}`);
print(`Tests Failed: ${validationResults.failed}`);
print(`Warnings: ${validationResults.warnings}`);

if (validationResults.failed > 0) {
  print("\nFailed Tests:");
  validationResults.errors.forEach((err, idx) => {
    print(`${idx + 1}. ${err.test}`);
    if (err.message) print(`   ${err.message}`);
  });
}

print("\n========================================");

if (validationResults.failed === 0) {
  print("✓ All validation tests passed!");
} else {
  print("✗ Some validation tests failed. Please review errors above.");
}

print("========================================\n");
