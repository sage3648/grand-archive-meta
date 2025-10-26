// Migration: Add format field to standings collection
//
// Purpose: Add format field to standings to enable filtering standings by format
//          without needing to join with events collection
// Author: Grand Archive Meta Team
// Date: 2024-02-15
//
// Usage: mongosh <connection-string> < migrations/2024-02-15-add-format-to-standings.js

use grand-archive-meta

print("\n========================================");
print("Migration: Add Format Field to Standings");
print("Date: 2024-02-15");
print("========================================\n");

// ===========================================
// MIGRATION CONFIGURATION
// ===========================================

const MIGRATION_CONFIG = {
  name: "add-format-to-standings",
  version: "1.0.0",
  description: "Add format field to standings collection for denormalized queries",
  reversible: true,
  estimatedDuration: "< 5 minutes for 100k documents"
};

// ===========================================
// PRE-MIGRATION CHECKS
// ===========================================

print("Running pre-migration checks...\n");

// Check if migration has already been run
const migrationExists = db.migrations && db.migrations.findOne({
  name: MIGRATION_CONFIG.name
});

if (migrationExists) {
  print(`⚠ Migration '${MIGRATION_CONFIG.name}' has already been applied.`);
  print("Exiting...\n");
  quit(1);
}

// Verify prerequisites
const standingsExists = db.getCollectionNames().includes('standings');
const eventsExists = db.getCollectionNames().includes('events');

if (!standingsExists) {
  print("✗ Required collection 'standings' does not exist");
  quit(1);
}
if (!eventsExists) {
  print("✗ Required collection 'events' does not exist");
  quit(1);
}

print("✓ Collection 'standings' exists");
print("✓ Collection 'events' exists");
print("✓ All pre-migration checks passed\n");

// ===========================================
// MIGRATION LOGIC
// ===========================================

print("Starting migration...\n");

try {
  // Get total count for progress tracking
  const totalCount = db.standings.countDocuments({});
  print(`Processing ${totalCount} standings documents...\n`);

  // Use aggregation to add format field from events
  print("Step 1: Adding format field to standings...");

  // Get all unique eventIds from standings
  const eventIds = db.standings.distinct('eventId');
  print(`Found ${eventIds.length} unique events\n`);

  // Process in batches to avoid memory issues
  const batchSize = 100;
  let processed = 0;
  let updated = 0;

  for (let i = 0; i < eventIds.length; i += batchSize) {
    const batch = eventIds.slice(i, i + batchSize);

    // Get event formats for this batch
    const events = db.events.find(
      { eventId: { $in: batch } },
      { eventId: 1, format: 1 }
    ).toArray();

    // Create a map of eventId -> format
    const formatMap = {};
    events.forEach(event => {
      formatMap[event.eventId] = event.format;
    });

    // Update standings for each event in batch
    batch.forEach(eventId => {
      if (formatMap[eventId]) {
        const result = db.standings.updateMany(
          { eventId: eventId, format: { $exists: false } },
          { $set: { format: formatMap[eventId] } }
        );
        updated += result.modifiedCount;
      }
    });

    processed += batch.length;
    print(`Progress: ${processed}/${eventIds.length} events processed, ${updated} standings updated`);
  }

  print(`\n✓ Added format field to ${updated} standings documents\n`);

  // Create index on format field
  print("Step 2: Creating index on format field...");
  db.standings.createIndex(
    { format: 1 },
    { name: "idx_standings_format", background: true }
  );
  print("✓ Index created\n");

  // Create compound index for common query pattern
  print("Step 3: Creating compound index on championSlug and format...");
  db.standings.createIndex(
    { championSlug: 1, format: 1 },
    { name: "idx_standings_championSlug_format", background: true }
  );
  print("✓ Compound index created\n");

} catch (error) {
  print(`\n✗ Migration failed with error: ${error}\n`);
  print("Please review the error and fix before retrying.\n");
  quit(1);
}

// ===========================================
// POST-MIGRATION VALIDATION
// ===========================================

print("Running post-migration validation...\n");

// Count documents with and without format field
const withFormat = db.standings.countDocuments({ format: { $exists: true } });
const withoutFormat = db.standings.countDocuments({ format: { $exists: false } });
const total = db.standings.countDocuments({});

print(`Documents with format: ${withFormat}`);
print(`Documents without format: ${withoutFormat}`);
print(`Total documents: ${total}`);

if (withoutFormat > 0) {
  print(`\n⚠ Warning: ${withoutFormat} standings still missing format field`);
  print("This may be due to orphaned standings (no matching event)\n");
} else {
  print("\n✓ All standings have format field\n");
}

// Verify indexes were created
const indexes = db.standings.getIndexes();
const hasFormatIndex = indexes.some(idx => idx.name === "idx_standings_format");
const hasCompoundIndex = indexes.some(idx => idx.name === "idx_standings_championSlug_format");

if (hasFormatIndex) {
  print("✓ Index 'idx_standings_format' exists");
} else {
  print("✗ Index 'idx_standings_format' not found");
}

if (hasCompoundIndex) {
  print("✓ Index 'idx_standings_championSlug_format' exists");
} else {
  print("✗ Index 'idx_standings_championSlug_format' not found");
}

print("\n✓ Post-migration validation complete\n");

// ===========================================
// RECORD MIGRATION
// ===========================================

if (!db.getCollectionNames().includes('migrations')) {
  db.createCollection('migrations');
}

db.migrations.insertOne({
  name: MIGRATION_CONFIG.name,
  version: MIGRATION_CONFIG.version,
  description: MIGRATION_CONFIG.description,
  reversible: MIGRATION_CONFIG.reversible,
  appliedAt: new Date(),
  estimatedDuration: MIGRATION_CONFIG.estimatedDuration,
  statistics: {
    totalStandings: total,
    standingsUpdated: withFormat,
    standingsSkipped: withoutFormat,
    indexesCreated: 2
  }
});

print("✓ Migration recorded in 'migrations' collection\n");

// ===========================================
// SUMMARY
// ===========================================

print("========================================");
print("Migration Complete!");
print("========================================");
print(`Name: ${MIGRATION_CONFIG.name}`);
print(`Version: ${MIGRATION_CONFIG.version}`);
print(`Description: ${MIGRATION_CONFIG.description}`);
print(`Applied at: ${new Date().toISOString()}`);
print(`Documents updated: ${withFormat}`);
print(`Indexes created: 2`);
print("========================================\n");

// ===========================================
// ROLLBACK INSTRUCTIONS
// ===========================================

print("Rollback Instructions:");
print("To rollback this migration, run:\n");
print("use grand-archive-meta");
print("db.standings.updateMany({}, { $unset: { format: '' } })");
print("db.standings.dropIndex('idx_standings_format')");
print("db.standings.dropIndex('idx_standings_championSlug_format')");
print("db.migrations.deleteOne({ name: '" + MIGRATION_CONFIG.name + "' })");
print("\n");
