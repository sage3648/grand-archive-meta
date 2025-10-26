// MongoDB Index Creation Script for Grand Archive Meta Database
//
// Purpose: Creates all necessary indexes for optimal query performance
// Usage: mongosh <connection-string> < indexes.js
//
// Note: Run this script on initial database setup and after schema changes

// Switch to the database
use grand-archive-meta

print("========================================");
print("Grand Archive Meta - Index Creation");
print("========================================\n");

// ============================================
// CHAMPIONS COLLECTION
// ============================================
print("Creating indexes for 'champions' collection...");

// Primary lookup index - unique slug for URL routing
db.champions.createIndex(
  { "slug": 1 },
  {
    unique: true,
    name: "idx_champions_slug_unique",
    background: true
  }
);
print("  ✓ Created unique index on slug");

// Search index - for name-based searches
db.champions.createIndex(
  { "name": 1 },
  {
    name: "idx_champions_name",
    background: true
  }
);
print("  ✓ Created index on name");

// External ID lookup - unique UUID for integration
db.champions.createIndex(
  { "uuid": 1 },
  {
    unique: true,
    name: "idx_champions_uuid_unique",
    background: true
  }
);
print("  ✓ Created unique index on uuid");

// Element filter index - for filtering by element
db.champions.createIndex(
  { "element": 1 },
  {
    name: "idx_champions_element",
    background: true
  }
);
print("  ✓ Created index on element");

print("Champions indexes created successfully.\n");

// ============================================
// EVENTS COLLECTION
// ============================================
print("Creating indexes for 'events' collection...");

// Primary lookup index - unique event ID
db.events.createIndex(
  { "eventId": 1 },
  {
    unique: true,
    name: "idx_events_eventId_unique",
    background: true
  }
);
print("  ✓ Created unique index on eventId");

// Format and date compound index - common query pattern for format filtering with chronological sorting
db.events.createIndex(
  { "format": 1, "startAt": -1 },
  {
    name: "idx_events_format_startAt",
    background: true
  }
);
print("  ✓ Created compound index on format and startAt");

// Category and status compound index - for filtering events by category and status
db.events.createIndex(
  { "category": 1, "status": 1 },
  {
    name: "idx_events_category_status",
    background: true
  }
);
print("  ✓ Created compound index on category and status");

// Active ranked events index - for finding ongoing/upcoming ranked tournaments
db.events.createIndex(
  { "status": 1, "ranked": 1 },
  {
    name: "idx_events_status_ranked",
    background: true
  }
);
print("  ✓ Created compound index on status and ranked");

// Chronological sort index - for displaying events in date order
db.events.createIndex(
  { "startAt": -1 },
  {
    name: "idx_events_startAt",
    background: true
  }
);
print("  ✓ Created index on startAt");

// Location-based query index - for filtering events by country with date sorting
db.events.createIndex(
  { "location.country": 1, "startAt": -1 },
  {
    name: "idx_events_location_country_startAt",
    background: true
  }
);
print("  ✓ Created compound index on location.country and startAt");

print("Events indexes created successfully.\n");

// ============================================
// STANDINGS COLLECTION
// ============================================
print("Creating indexes for 'standings' collection...");

// Event-player unique compound index - primary lookup for player's standing in an event
db.standings.createIndex(
  { "eventId": 1, "playerId": 1 },
  {
    unique: true,
    name: "idx_standings_eventId_playerId_unique",
    background: true
  }
);
print("  ✓ Created unique compound index on eventId and playerId");

// Event standings index - for retrieving all standings for an event sorted by placement
db.standings.createIndex(
  { "eventId": 1, "placement": 1 },
  {
    name: "idx_standings_eventId_placement",
    background: true
  }
);
print("  ✓ Created compound index on eventId and placement");

// Champion performance index - for analyzing champion performance across events
db.standings.createIndex(
  { "championSlug": 1, "placement": 1 },
  {
    name: "idx_standings_championSlug_placement",
    background: true
  }
);
print("  ✓ Created compound index on championSlug and placement");

// Player history index - for retrieving player's tournament history
db.standings.createIndex(
  { "playerId": 1, "createdAt": -1 },
  {
    name: "idx_standings_playerId_createdAt",
    background: true
  }
);
print("  ✓ Created compound index on playerId and createdAt");

// Top cut query index - for filtering players who made the top cut
db.standings.createIndex(
  { "eventId": 1, "madeCut": 1 },
  {
    name: "idx_standings_eventId_madeCut",
    background: true
  }
);
print("  ✓ Created compound index on eventId and madeCut");

// Decklist reference index - for linking standings to decklists
db.standings.createIndex(
  { "decklistId": 1 },
  {
    name: "idx_standings_decklistId",
    background: true
  }
);
print("  ✓ Created index on decklistId");

print("Standings indexes created successfully.\n");

// ============================================
// DECKLISTS COLLECTION
// ============================================
print("Creating indexes for 'decklists' collection...");

// Event-player decklist index - for retrieving a player's decklist from an event
db.decklists.createIndex(
  { "eventId": 1, "playerId": 1 },
  {
    name: "idx_decklists_eventId_playerId",
    background: true
  }
);
print("  ✓ Created compound index on eventId and playerId");

// Champion decklist queries - for finding all decklists for a champion in specific events
db.decklists.createIndex(
  { "championSlug": 1, "eventId": 1 },
  {
    name: "idx_decklists_championSlug_eventId",
    background: true
  }
);
print("  ✓ Created compound index on championSlug and eventId");

// Duplicate detection index - for identifying duplicate deck compositions
db.decklists.createIndex(
  { "deckHash": 1 },
  {
    name: "idx_decklists_deckHash",
    background: true
  }
);
print("  ✓ Created index on deckHash");

// Card inclusion multi-key index - for finding all decklists containing a specific card
db.decklists.createIndex(
  { "mainDeck.cardId": 1 },
  {
    name: "idx_decklists_mainDeck_cardId",
    background: true
  }
);
print("  ✓ Created multi-key index on mainDeck.cardId");

// Top-performing decklists index - for retrieving best-performing decklists
db.decklists.createIndex(
  { "eventId": 1, "placement": 1 },
  {
    name: "idx_decklists_eventId_placement",
    background: true
  }
);
print("  ✓ Created compound index on eventId and placement");

// Archetype evolution index - for tracking how archetypes change over time
db.decklists.createIndex(
  { "archetype": 1, "createdAt": -1 },
  {
    name: "idx_decklists_archetype_createdAt",
    background: true
  }
);
print("  ✓ Created compound index on archetype and createdAt");

// Recent decklists index - for displaying recently added decklists
db.decklists.createIndex(
  { "createdAt": -1 },
  {
    name: "idx_decklists_createdAt",
    background: true
  }
);
print("  ✓ Created index on createdAt");

// Verified decklists by champion - for finding official tournament decklists
db.decklists.createIndex(
  { "championSlug": 1, "verified": 1, "createdAt": -1 },
  {
    name: "idx_decklists_championSlug_verified_createdAt",
    background: true
  }
);
print("  ✓ Created compound index on championSlug, verified, and createdAt");

print("Decklists indexes created successfully.\n");

// ============================================
// CARD_PERFORMANCE_STATS COLLECTION
// ============================================
print("Creating indexes for 'card_performance_stats' collection...");

// Primary lookup index - unique card ID
db.card_performance_stats.createIndex(
  { "cardId": 1 },
  {
    unique: true,
    name: "idx_card_stats_cardId_unique",
    background: true
  }
);
print("  ✓ Created unique index on cardId");

// Search index - for card name searches
db.card_performance_stats.createIndex(
  { "cardName": 1 },
  {
    name: "idx_card_stats_cardName",
    background: true
  }
);
print("  ✓ Created index on cardName");

// Popularity ranking index - for finding most-played cards
db.card_performance_stats.createIndex(
  { "overallStats.totalInclusions": -1 },
  {
    name: "idx_card_stats_totalInclusions",
    background: true
  }
);
print("  ✓ Created index on overallStats.totalInclusions");

// Win rate ranking index - for finding highest win rate cards
db.card_performance_stats.createIndex(
  { "overallStats.winRate": -1 },
  {
    name: "idx_card_stats_winRate",
    background: true
  }
);
print("  ✓ Created index on overallStats.winRate");

// Champion-specific performance multi-key index - for champion-specific card stats
db.card_performance_stats.createIndex(
  { "byChampion.championSlug": 1 },
  {
    name: "idx_card_stats_byChampion_slug",
    background: true
  }
);
print("  ✓ Created multi-key index on byChampion.championSlug");

// Element and type filter index - for filtering cards by element and type
db.card_performance_stats.createIndex(
  { "element": 1, "cardType": 1 },
  {
    name: "idx_card_stats_element_cardType",
    background: true
  }
);
print("  ✓ Created compound index on element and cardType");

// Stale stats finder index - for identifying stats that need recalculation
db.card_performance_stats.createIndex(
  { "lastCalculated": 1 },
  {
    name: "idx_card_stats_lastCalculated",
    background: true
  }
);
print("  ✓ Created index on lastCalculated");

// Top cut performance index - for cards performing well in top cuts
db.card_performance_stats.createIndex(
  { "overallStats.topCutWinRate": -1 },
  {
    name: "idx_card_stats_topCutWinRate",
    background: true
  }
);
print("  ✓ Created index on overallStats.topCutWinRate");

print("Card performance stats indexes created successfully.\n");

// ============================================
// CRAWLER_STATE COLLECTION
// ============================================
print("Creating indexes for 'crawler_state' collection...");

// Primary lookup index - unique crawler name
db.crawler_state.createIndex(
  { "crawlerName": 1 },
  {
    unique: true,
    name: "idx_crawler_state_crawlerName_unique",
    background: true
  }
);
print("  ✓ Created unique index on crawlerName");

// Source type and status index - for filtering crawlers by source and status
db.crawler_state.createIndex(
  { "sourceType": 1, "status": 1 },
  {
    name: "idx_crawler_state_sourceType_status",
    background: true
  }
);
print("  ✓ Created compound index on sourceType and status");

// Scheduling index - for finding crawlers that need to run
db.crawler_state.createIndex(
  { "lastRunAt": 1 },
  {
    name: "idx_crawler_state_lastRunAt",
    background: true
  }
);
print("  ✓ Created index on lastRunAt");

// Active crawlers index - for finding enabled crawlers
db.crawler_state.createIndex(
  { "status": 1, "config.enabled": 1 },
  {
    name: "idx_crawler_state_status_enabled",
    background: true
  }
);
print("  ✓ Created compound index on status and config.enabled");

print("Crawler state indexes created successfully.\n");

// ============================================
// USERS COLLECTION (FUTURE)
// ============================================
print("Creating indexes for 'users' collection (future)...");

// Primary lookup index - unique user ID
db.users.createIndex(
  { "userId": 1 },
  {
    unique: true,
    name: "idx_users_userId_unique",
    background: true
  }
);
print("  ✓ Created unique index on userId");

// Email lookup index - unique email for authentication
db.users.createIndex(
  { "email": 1 },
  {
    unique: true,
    name: "idx_users_email_unique",
    background: true
  }
);
print("  ✓ Created unique index on email");

// Username lookup index - unique username
db.users.createIndex(
  { "username": 1 },
  {
    unique: true,
    name: "idx_users_username_unique",
    background: true
  }
);
print("  ✓ Created unique index on username");

// Email verification index - for verification process
db.users.createIndex(
  { "emailVerificationToken": 1 },
  {
    name: "idx_users_emailVerificationToken",
    sparse: true,
    background: true
  }
);
print("  ✓ Created sparse index on emailVerificationToken");

// Password reset index - for password reset process
db.users.createIndex(
  { "passwordResetToken": 1 },
  {
    name: "idx_users_passwordResetToken",
    sparse: true,
    background: true
  }
);
print("  ✓ Created sparse index on passwordResetToken");

// Active users index - for filtering by account status
db.users.createIndex(
  { "accountStatus": 1 },
  {
    name: "idx_users_accountStatus",
    background: true
  }
);
print("  ✓ Created index on accountStatus");

// Registration analytics index - for tracking user signups over time
db.users.createIndex(
  { "createdAt": -1 },
  {
    name: "idx_users_createdAt",
    background: true
  }
);
print("  ✓ Created index on createdAt");

print("Users indexes created successfully.\n");

// ============================================
// SAVED_DECKLISTS COLLECTION (FUTURE)
// ============================================
print("Creating indexes for 'saved_decklists' collection (future)...");

// User's decklists index - for retrieving all decklists created by a user
db.saved_decklists.createIndex(
  { "userId": 1, "createdAt": -1 },
  {
    name: "idx_saved_decklists_userId_createdAt",
    background: true
  }
);
print("  ✓ Created compound index on userId and createdAt");

// Public champion decklists index - for finding public decklists for a champion
db.saved_decklists.createIndex(
  { "championSlug": 1, "visibility": 1 },
  {
    name: "idx_saved_decklists_championSlug_visibility",
    background: true
  }
);
print("  ✓ Created compound index on championSlug and visibility");

// Popular public decks index - for displaying trending decklists
db.saved_decklists.createIndex(
  { "visibility": 1, "likes": -1 },
  {
    name: "idx_saved_decklists_visibility_likes",
    background: true
  }
);
print("  ✓ Created compound index on visibility and likes");

// Tag-based search multi-key index - for finding decklists by tags
db.saved_decklists.createIndex(
  { "tags": 1 },
  {
    name: "idx_saved_decklists_tags",
    background: true
  }
);
print("  ✓ Created multi-key index on tags");

// Duplicate detection index - for identifying duplicate saved decks
db.saved_decklists.createIndex(
  { "deckHash": 1 },
  {
    name: "idx_saved_decklists_deckHash",
    background: true
  }
);
print("  ✓ Created index on deckHash");

// Deck lineage index - for tracking deck forks
db.saved_decklists.createIndex(
  { "forkedFrom": 1 },
  {
    name: "idx_saved_decklists_forkedFrom",
    sparse: true,
    background: true
  }
);
print("  ✓ Created sparse index on forkedFrom");

// Card search in public decks - for finding public decks containing specific cards
db.saved_decklists.createIndex(
  { "mainDeck.cardId": 1, "visibility": 1 },
  {
    name: "idx_saved_decklists_mainDeck_cardId_visibility",
    background: true
  }
);
print("  ✓ Created compound multi-key index on mainDeck.cardId and visibility");

// Recent public decklists - for displaying recently published decklists
db.saved_decklists.createIndex(
  { "visibility": 1, "createdAt": -1 },
  {
    name: "idx_saved_decklists_visibility_createdAt",
    background: true
  }
);
print("  ✓ Created compound index on visibility and createdAt");

print("Saved decklists indexes created successfully.\n");

// ============================================
// INDEX CREATION SUMMARY
// ============================================
print("\n========================================");
print("Index Creation Summary");
print("========================================");
print("✓ champions: 4 indexes");
print("✓ events: 6 indexes");
print("✓ standings: 6 indexes");
print("✓ decklists: 8 indexes");
print("✓ card_performance_stats: 8 indexes");
print("✓ crawler_state: 4 indexes");
print("✓ users: 7 indexes (future)");
print("✓ saved_decklists: 8 indexes (future)");
print("\nTotal: 51 indexes created");
print("========================================\n");

// ============================================
// VERIFICATION
// ============================================
print("Verifying indexes...\n");

print("Champions indexes:");
db.champions.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nEvents indexes:");
db.events.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nStandings indexes:");
db.standings.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nDecklists indexes:");
db.decklists.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nCard performance stats indexes:");
db.card_performance_stats.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nCrawler state indexes:");
db.crawler_state.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nUsers indexes:");
db.users.getIndexes().forEach(idx => print("  - " + idx.name));

print("\nSaved decklists indexes:");
db.saved_decklists.getIndexes().forEach(idx => print("  - " + idx.name));

print("\n========================================");
print("Index creation completed successfully!");
print("========================================");
