// Migration Template
//
// Naming Convention: YYYY-MM-DD-description.js
// Example: 2024-03-15-add-archetype-field-to-standings.js
//
// Purpose: [Describe what this migration does]
// Author: [Your name]
// Date: [Date created]
//
// Usage: mongosh <connection-string> < migrations/YYYY-MM-DD-description.js

use grand-archive-meta

print("\n========================================");
print("Migration: [Migration Name]");
print("Date: [Date]");
print("========================================\n");

// ===========================================
// MIGRATION CONFIGURATION
// ===========================================

const MIGRATION_CONFIG = {
  name: "[migration-name]",
  version: "1.0.0",
  description: "[What this migration does]",
  reversible: true, // Can this migration be rolled back?
  estimatedDuration: "< 1 minute" // Estimated time for large datasets
};

// ===========================================
// PRE-MIGRATION CHECKS
// ===========================================

print("Running pre-migration checks...\n");

// Check if migration has already been run (optional)
// Requires a 'migrations' collection to track applied migrations
const migrationExists = db.migrations && db.migrations.findOne({
  name: MIGRATION_CONFIG.name
});

if (migrationExists) {
  print(`⚠ Migration '${MIGRATION_CONFIG.name}' has already been applied.`);
  print("Exiting...\n");
  quit(1);
}

// Verify prerequisites
// Example: Check if required collections exist
const requiredCollections = []; // e.g., ['champions', 'events']
let prerequisitesMet = true;

requiredCollections.forEach(collName => {
  const exists = db.getCollectionNames().includes(collName);
  if (!exists) {
    print(`✗ Required collection '${collName}' does not exist`);
    prerequisitesMet = false;
  } else {
    print(`✓ Collection '${collName}' exists`);
  }
});

if (!prerequisitesMet) {
  print("\n✗ Prerequisites not met. Exiting...\n");
  quit(1);
}

print("✓ All pre-migration checks passed\n");

// ===========================================
// BACKUP RECOMMENDATION
// ===========================================

print("⚠ IMPORTANT: Backup your database before proceeding!");
print("Recommended: mongodump --uri='<connection-string>' --out=./backup/$(date +%Y-%m-%d)\n");

// Uncomment to require manual confirmation
// print("Press Ctrl+C to cancel, or wait 10 seconds to continue...");
// sleep(10000);

// ===========================================
// MIGRATION LOGIC
// ===========================================

print("Starting migration...\n");

try {
  // Example 1: Add a new field to all documents in a collection
  // print("Adding new field 'archetype' to standings collection...");
  // const result1 = db.standings.updateMany(
  //   { archetype: { $exists: false } },
  //   { $set: { archetype: null } }
  // );
  // print(`✓ Updated ${result1.modifiedCount} documents\n`);

  // Example 2: Create a new index
  // print("Creating index on new field...");
  // db.standings.createIndex(
  //   { archetype: 1 },
  //   { name: "idx_standings_archetype", background: true }
  // );
  // print("✓ Index created\n");

  // Example 3: Rename a field
  // print("Renaming field 'oldName' to 'newName'...");
  // const result3 = db.events.updateMany(
  //   {},
  //   { $rename: { "oldName": "newName" } }
  // );
  // print(`✓ Updated ${result3.modifiedCount} documents\n`);

  // Example 4: Data transformation
  // print("Transforming data...");
  // db.events.find({ status: "active" }).forEach(doc => {
  //   db.events.updateOne(
  //     { _id: doc._id },
  //     { $set: { status: "ongoing" } }
  //   );
  // });
  // print("✓ Data transformation complete\n");

  // Example 5: Remove a field
  // print("Removing deprecated field...");
  // const result5 = db.decklists.updateMany(
  //   {},
  //   { $unset: { deprecatedField: "" } }
  // );
  // print(`✓ Removed field from ${result5.modifiedCount} documents\n`);

  // YOUR MIGRATION CODE HERE
  // -------------------------
  print("TODO: Add your migration logic here");

  // -------------------------

} catch (error) {
  print(`\n✗ Migration failed with error: ${error}\n`);
  print("Please review the error and fix before retrying.\n");
  quit(1);
}

// ===========================================
// POST-MIGRATION VALIDATION
// ===========================================

print("Running post-migration validation...\n");

// Add validation checks here
// Example: Verify field was added
// const sampleDoc = db.standings.findOne({});
// if (sampleDoc && sampleDoc.hasOwnProperty('archetype')) {
//   print("✓ Field 'archetype' exists on documents");
// } else {
//   print("✗ Field 'archetype' not found on sample document");
// }

print("✓ Post-migration validation passed\n");

// ===========================================
// RECORD MIGRATION
// ===========================================

// Create migrations collection if it doesn't exist
if (!db.getCollectionNames().includes('migrations')) {
  db.createCollection('migrations');
}

// Record that this migration was applied
db.migrations.insertOne({
  name: MIGRATION_CONFIG.name,
  version: MIGRATION_CONFIG.version,
  description: MIGRATION_CONFIG.description,
  reversible: MIGRATION_CONFIG.reversible,
  appliedAt: new Date(),
  estimatedDuration: MIGRATION_CONFIG.estimatedDuration
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
print("========================================\n");

// ===========================================
// ROLLBACK INSTRUCTIONS (IF REVERSIBLE)
// ===========================================

if (MIGRATION_CONFIG.reversible) {
  print("Rollback Instructions:");
  print("To rollback this migration, run:\n");
  print("// TODO: Add rollback commands");
  print("// Example:");
  print("// db.standings.updateMany({}, { $unset: { archetype: '' } })");
  print("// db.standings.dropIndex('idx_standings_archetype')");
  print("// db.migrations.deleteOne({ name: '" + MIGRATION_CONFIG.name + "' })");
  print("\n");
}
