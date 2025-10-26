// MongoDB Initialization Script for Grand Archive Meta
// This script runs when the MongoDB container first starts

// Switch to the grand-archive database
db = db.getSiblingDB('grand-archive');

// Create collections
db.createCollection('decks');
db.createCollection('deck-cards');
db.createCollection('card-reference');
db.createCollection('meta-snapshots');
db.createCollection('events');
db.createCollection('scraper-audits');

// Create indexes for optimal query performance

// Decks collection indexes
db.decks.createIndex({ "format": 1, "eventDate": -1 });
db.decks.createIndex({ "hero": 1, "format": 1 });
db.decks.createIndex({ "event": 1 });
db.decks.createIndex({ "createdAt": -1 });
db.decks.createIndex({ "name": 1 });

// Deck-cards collection indexes
db["deck-cards"].createIndex({ "deckId": 1 });
db["deck-cards"].createIndex({ "deckName": 1 });
db["deck-cards"].createIndex({ "cardId": 1 });
db["deck-cards"].createIndex({ "cardName": 1 });

// Card-reference collection indexes
db["card-reference"].createIndex({ "uniqueId": 1 }, { unique: true });
db["card-reference"].createIndex({ "name": 1 });
db["card-reference"].createIndex({ "element": 1, "cardType": 1 });
db["card-reference"].createIndex({ "usage.percentage": -1 });
db["card-reference"].createIndex({ "price.market": 1 });

// Meta-snapshots collection indexes
db["meta-snapshots"].createIndex({ "format": 1, "date": -1 });
db["meta-snapshots"].createIndex({ "createdAt": -1 });

// Events collection indexes
db.events.createIndex({ "date": -1 });
db.events.createIndex({ "format": 1, "date": -1 });
db.events.createIndex({ "name": 1 });

// Scraper-audits collection indexes
db["scraper-audits"].createIndex({ "createdAt": -1 });
db["scraper-audits"].createIndex({ "scraperType": 1, "createdAt": -1 });

print('✓ Grand Archive Meta database initialized successfully');
print('✓ Created collections: decks, deck-cards, card-reference, meta-snapshots, events, scraper-audits');
print('✓ Created indexes for optimal query performance');
