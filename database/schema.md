# Grand Archive Meta Database Schema Documentation

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Collections](#collections)
   - [champions](#champions-collection)
   - [events](#events-collection)
   - [standings](#standings-collection)
   - [decklists](#decklists-collection)
   - [card_performance_stats](#card_performance_stats-collection)
   - [crawler_state](#crawler_state-collection)
   - [users](#users-collection-future)
   - [saved_decklists](#saved_decklists-collection-future)
4. [Relationships](#relationships)
5. [Indexes](#indexes)
6. [Data Validation](#data-validation)
7. [Security Best Practices](#security-best-practices)
8. [Backup and Scaling](#backup-and-scaling)

---

## Overview

The Grand Archive Meta database is a MongoDB database designed to store competitive metagame data for the Grand Archive TCG. It tracks champions, tournament events, player standings, decklists, and card performance statistics.

**Database Name**: `grand-archive-meta`

**Technology Stack**:
- MongoDB 6.0+
- MongoDB Atlas (recommended for production)
- Mongoose ODM (optional)

---

## Database Setup

### MongoDB Atlas Setup

1. **Create Account**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a new project named "Grand Archive Meta"

2. **Create Cluster**
   - Choose cluster tier (M0 Free for development, M10+ for production)
   - Select region closest to your application servers
   - Choose MongoDB 6.0 or higher

3. **Database Access**
   - Create database user with read/write permissions
   - Use strong password (store in environment variables)
   - Enable IP whitelist (0.0.0.0/0 for development only)

4. **Network Access**
   - Add IP addresses of application servers
   - For development: Add your current IP
   - For production: Use VPC peering or private endpoints

### Connection String Format

```
mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority
```

**Environment Variables**:
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/grand-archive-meta
MONGODB_DB_NAME=grand-archive-meta
```

### Initial Setup

1. Run the index creation script:
   ```bash
   mongosh <connection-string> < indexes.js
   ```

2. (Optional) Load seed data:
   ```bash
   mongoimport --uri="<connection-string>" --collection=champions --file=seed-data/sample_champion.json
   ```

---

## Collections

### champions Collection

**Purpose**: Stores information about Grand Archive champions (deck archetypes/leaders).

**Schema**:
```javascript
{
  _id: ObjectId,
  uuid: String,           // Unique identifier from source
  slug: String,           // URL-friendly identifier (e.g., "silvie")
  name: String,           // Display name (e.g., "Silvie")
  element: String,        // Champion element (e.g., "Wind", "Fire", "Water")
  cardType: String,       // Card type classification
  imageUrl: String,       // URL to champion card image
  createdAt: Date,        // Document creation timestamp
  updatedAt: Date         // Document last update timestamp
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `uuid` | String | Yes | External unique identifier (from card database) |
| `slug` | String | Yes | URL-safe identifier for routing |
| `name` | String | Yes | Human-readable champion name |
| `element` | String | No | Champion's primary element |
| `cardType` | String | No | Type of card (e.g., "Champion", "Leader") |
| `imageUrl` | String | No | URL to champion artwork |
| `createdAt` | Date | Yes | Timestamp of document creation |
| `updatedAt` | Date | Yes | Timestamp of last modification |

**Indexes**:
- `{ slug: 1 }` - Unique index for URL lookups
- `{ name: 1 }` - Index for search functionality
- `{ uuid: 1 }` - Unique index for external ID lookups
- `{ element: 1 }` - Index for filtering by element

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e1"),
  "uuid": "ga-silvie-001",
  "slug": "silvie",
  "name": "Silvie",
  "element": "Wind",
  "cardType": "Champion",
  "imageUrl": "https://example.com/cards/silvie.jpg",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-01-15T10:30:00Z")
}
```

**Usage Notes**:
- Use `slug` for API endpoints and URLs
- Use `uuid` for integration with external card databases
- `element` should be validated against known elements
- Update `updatedAt` whenever document is modified

---

### events Collection

**Purpose**: Stores competitive tournament events and their metadata.

**Schema**:
```javascript
{
  _id: ObjectId,
  eventId: String,          // Unique event identifier from source
  name: String,             // Event name
  format: String,           // Format (e.g., "Constructed", "Limited", "Sealed")
  category: String,         // Tournament category (e.g., "Regional", "Nationals", "Grand Championship")
  status: String,           // Event status (e.g., "upcoming", "ongoing", "completed")
  startAt: Date,            // Event start date/time
  endAt: Date,              // Event end date/time (optional)
  location: {
    city: String,
    region: String,
    country: String,
    venue: String
  },
  organizer: String,        // Tournament organizer name
  playerCount: Number,      // Number of registered players
  rounds: Number,           // Number of Swiss rounds
  topCut: Number,           // Top cut size (e.g., 8, 16, 32)
  ranked: Boolean,          // Whether event is ranked/official
  sourceUrl: String,        // Original source URL
  metadata: Object,         // Additional flexible data
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `eventId` | String | Yes | External unique event identifier |
| `name` | String | Yes | Full event name |
| `format` | String | Yes | Tournament format type |
| `category` | String | Yes | Tournament tier/category |
| `status` | String | Yes | Current event status |
| `startAt` | Date | Yes | Event start timestamp |
| `endAt` | Date | No | Event end timestamp |
| `location` | Object | No | Event location details |
| `organizer` | String | No | Organizing entity |
| `playerCount` | Number | No | Total registered players |
| `rounds` | Number | No | Number of Swiss rounds |
| `topCut` | Number | No | Size of top cut |
| `ranked` | Boolean | Yes | Official/ranked status |
| `sourceUrl` | String | No | Source URL for verification |
| `metadata` | Object | No | Additional event data |
| `createdAt` | Date | Yes | Timestamp of document creation |
| `updatedAt` | Date | Yes | Timestamp of last modification |

**Indexes**:
- `{ eventId: 1 }` - Unique index for event lookups
- `{ format: 1, startAt: -1 }` - Compound index for format filtering with date sorting
- `{ category: 1, status: 1 }` - Compound index for category and status queries
- `{ status: 1, ranked: 1 }` - Compound index for active ranked events
- `{ startAt: -1 }` - Index for chronological sorting
- `{ "location.country": 1, startAt: -1 }` - Index for location-based queries

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e2"),
  "eventId": "ga-regional-2024-001",
  "name": "Grand Archive Regional Championship - Winter 2024",
  "format": "Constructed",
  "category": "Regional",
  "status": "completed",
  "startAt": ISODate("2024-02-10T09:00:00Z"),
  "endAt": ISODate("2024-02-10T18:00:00Z"),
  "location": {
    "city": "Seattle",
    "region": "Washington",
    "country": "USA",
    "venue": "Convention Center Hall A"
  },
  "organizer": "Grand Archive Events LLC",
  "playerCount": 128,
  "rounds": 7,
  "topCut": 8,
  "ranked": true,
  "sourceUrl": "https://example.com/events/regional-2024-001",
  "metadata": {
    "prizePool": 5000,
    "streamUrl": "https://twitch.tv/example"
  },
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-02-10T19:00:00Z")
}
```

**Usage Notes**:
- `status` values: `"upcoming"`, `"ongoing"`, `"completed"`, `"cancelled"`
- `format` values: `"Constructed"`, `"Limited"`, `"Sealed"`, `"Draft"`
- `category` values: `"Local"`, `"Regional"`, `"Nationals"`, `"Grand Championship"`, `"Premiere"`
- Update `status` as event progresses
- `ranked` events affect player ratings and statistics

---

### standings Collection

**Purpose**: Stores player standings and match results for each event.

**Schema**:
```javascript
{
  _id: ObjectId,
  eventId: String,          // Reference to events.eventId
  playerId: String,         // Unique player identifier
  playerName: String,       // Player display name
  championSlug: String,     // Reference to champions.slug
  championName: String,     // Champion name (denormalized for performance)
  decklistId: String,       // Reference to decklists._id (if available)
  placement: Number,        // Final placement (1st, 2nd, etc.)
  wins: Number,             // Total wins
  losses: Number,           // Total losses
  draws: Number,            // Total draws
  matchPoints: Number,      // Total match points
  gameWinPercentage: Number,  // Game win percentage
  opponentWinPercentage: Number,  // Opponent match win percentage
  madeCut: Boolean,         // Whether player made top cut
  dropped: Boolean,         // Whether player dropped
  roundByRoundResults: [    // Match results per round
    {
      round: Number,
      opponent: String,
      result: String,       // "W", "L", or "D"
      gameWins: Number,
      gameLosses: Number
    }
  ],
  metadata: Object,         // Additional data
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `eventId` | String | Yes | Foreign key to events collection |
| `playerId` | String | Yes | Unique player identifier |
| `playerName` | String | Yes | Player's display name |
| `championSlug` | String | Yes | Foreign key to champions collection |
| `championName` | String | No | Denormalized champion name |
| `decklistId` | String | No | Foreign key to decklists collection |
| `placement` | Number | No | Final tournament placement |
| `wins` | Number | Yes | Total match wins |
| `losses` | Number | Yes | Total match losses |
| `draws` | Number | Yes | Total match draws |
| `matchPoints` | Number | No | Calculated match points |
| `gameWinPercentage` | Number | No | Game win rate (0-1) |
| `opponentWinPercentage` | Number | No | Opponents' average win rate |
| `madeCut` | Boolean | Yes | Top cut qualification status |
| `dropped` | Boolean | Yes | Whether player dropped |
| `roundByRoundResults` | Array | No | Detailed round results |
| `metadata` | Object | No | Additional data |
| `createdAt` | Date | Yes | Timestamp of document creation |
| `updatedAt` | Date | Yes | Timestamp of last modification |

**Indexes**:
- `{ eventId: 1, playerId: 1 }` - Compound unique index for event-player lookup
- `{ eventId: 1, placement: 1 }` - Compound index for event standings
- `{ championSlug: 1, placement: 1 }` - Compound index for champion performance
- `{ playerId: 1, createdAt: -1 }` - Index for player history
- `{ eventId: 1, madeCut: 1 }` - Index for top cut queries
- `{ decklistId: 1 }` - Index for decklist references

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e3"),
  "eventId": "ga-regional-2024-001",
  "playerId": "player-12345",
  "playerName": "John Doe",
  "championSlug": "silvie",
  "championName": "Silvie",
  "decklistId": "65a1b2c3d4e5f6a7b8c9d0e4",
  "placement": 1,
  "wins": 7,
  "losses": 0,
  "draws": 0,
  "matchPoints": 21,
  "gameWinPercentage": 0.875,
  "opponentWinPercentage": 0.621,
  "madeCut": true,
  "dropped": false,
  "roundByRoundResults": [
    {
      "round": 1,
      "opponent": "Jane Smith",
      "result": "W",
      "gameWins": 2,
      "gameLosses": 0
    },
    {
      "round": 2,
      "opponent": "Bob Johnson",
      "result": "W",
      "gameWins": 2,
      "gameLosses": 1
    }
  ],
  "metadata": {
    "country": "USA",
    "teamName": "Team Awesome"
  },
  "createdAt": ISODate("2024-02-10T09:00:00Z"),
  "updatedAt": ISODate("2024-02-10T19:00:00Z")
}
```

**Usage Notes**:
- `eventId` + `playerId` combination must be unique
- `matchPoints` calculation: Win = 3 points, Draw = 1 point, Loss = 0 points
- `gameWinPercentage` minimum value is 0.33 for tiebreaker calculations
- Update round by round as tournament progresses
- `championSlug` is the primary reference; `championName` is denormalized for query performance

---

### decklists Collection

**Purpose**: Stores complete deck compositions submitted by players for events.

**Schema**:
```javascript
{
  _id: ObjectId,
  eventId: String,          // Reference to events.eventId
  playerId: String,         // Reference to player
  playerName: String,       // Player name
  championSlug: String,     // Reference to champions.slug
  championName: String,     // Champion name (denormalized)
  placement: Number,        // Tournament placement
  mainDeck: [               // Main deck cards
    {
      cardId: String,       // Unique card identifier
      cardName: String,     // Card name
      quantity: Number,     // Number of copies
      cardType: String,     // Card type (e.g., "Ally", "Action", "Item")
      element: String,      // Card element
      cost: Number,         // Memory cost
      rarity: String        // Card rarity
    }
  ],
  sideboard: [              // Sideboard cards (same structure as mainDeck)
    {
      cardId: String,
      cardName: String,
      quantity: Number,
      cardType: String,
      element: String,
      cost: Number,
      rarity: String
    }
  ],
  materialDeck: [           // Material deck (same structure)
    {
      cardId: String,
      cardName: String,
      quantity: Number,
      element: String
    }
  ],
  deckStats: {
    totalCards: Number,
    avgMemoryCost: Number,
    elementDistribution: Object,  // { "Wind": 20, "Fire": 10, ... }
    typeDistribution: Object,     // { "Ally": 15, "Action": 20, ... }
    rarityDistribution: Object    // { "Common": 30, "Rare": 10, ... }
  },
  deckHash: String,         // Hash of deck composition for duplicate detection
  archetype: String,        // Deck archetype/variant name
  notes: String,            // Optional deck notes
  verified: Boolean,        // Whether decklist is verified/official
  sourceUrl: String,        // Source URL if available
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `eventId` | String | Yes | Foreign key to events collection |
| `playerId` | String | Yes | Player identifier |
| `playerName` | String | Yes | Player's display name |
| `championSlug` | String | Yes | Foreign key to champions collection |
| `championName` | String | No | Denormalized champion name |
| `placement` | Number | No | Tournament placement |
| `mainDeck` | Array | Yes | Main deck card list |
| `sideboard` | Array | No | Sideboard card list |
| `materialDeck` | Array | No | Material deck card list |
| `deckStats` | Object | No | Calculated deck statistics |
| `deckHash` | String | No | Hash for duplicate detection |
| `archetype` | String | No | Deck variant classification |
| `notes` | String | No | Player or analyst notes |
| `verified` | Boolean | Yes | Official verification status |
| `sourceUrl` | String | No | Original source URL |
| `createdAt` | Date | Yes | Timestamp of document creation |
| `updatedAt` | Date | Yes | Timestamp of last modification |

**Indexes**:
- `{ eventId: 1, playerId: 1 }` - Compound index for event-player decklist lookup
- `{ championSlug: 1, eventId: 1 }` - Compound index for champion decklist queries
- `{ deckHash: 1 }` - Index for duplicate detection
- `{ "mainDeck.cardId": 1 }` - Multi-key index for card inclusion queries
- `{ eventId: 1, placement: 1 }` - Index for top-performing decklists
- `{ archetype: 1, createdAt: -1 }` - Index for archetype evolution tracking
- `{ createdAt: -1 }` - Index for recent decklists

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e4"),
  "eventId": "ga-regional-2024-001",
  "playerId": "player-12345",
  "playerName": "John Doe",
  "championSlug": "silvie",
  "championName": "Silvie",
  "placement": 1,
  "mainDeck": [
    {
      "cardId": "ga-card-001",
      "cardName": "Swift Strike",
      "quantity": 4,
      "cardType": "Action",
      "element": "Wind",
      "cost": 2,
      "rarity": "Rare"
    },
    {
      "cardId": "ga-card-002",
      "cardName": "Wind Spirit",
      "quantity": 3,
      "cardType": "Ally",
      "element": "Wind",
      "cost": 3,
      "rarity": "Common"
    }
  ],
  "sideboard": [
    {
      "cardId": "ga-card-010",
      "cardName": "Gale Force",
      "quantity": 2,
      "cardType": "Action",
      "element": "Wind",
      "cost": 4,
      "rarity": "Uncommon"
    }
  ],
  "materialDeck": [
    {
      "cardId": "ga-mat-wind",
      "cardName": "Wind Material",
      "quantity": 30,
      "element": "Wind"
    }
  ],
  "deckStats": {
    "totalCards": 60,
    "avgMemoryCost": 2.8,
    "elementDistribution": {
      "Wind": 50,
      "Norm": 10
    },
    "typeDistribution": {
      "Ally": 20,
      "Action": 25,
      "Item": 15
    },
    "rarityDistribution": {
      "Common": 30,
      "Uncommon": 20,
      "Rare": 10
    }
  },
  "deckHash": "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6",
  "archetype": "Tempo Silvie",
  "notes": "Focused on early aggression with card draw engine",
  "verified": true,
  "sourceUrl": "https://example.com/decklists/regional-2024-001-winner",
  "createdAt": ISODate("2024-02-10T19:00:00Z"),
  "updatedAt": ISODate("2024-02-10T19:00:00Z")
}
```

**Usage Notes**:
- `deckHash` should be calculated from sorted card list for consistent duplicate detection
- `deckStats` should be recalculated when deck is updated
- Use `mainDeck.cardId` multi-key index to find all decks containing specific cards
- `verified` should only be true for official tournament submissions
- Consider archiving old decklists for performance

---

### card_performance_stats Collection

**Purpose**: Aggregated statistics for individual cards across all events and decklists.

**Schema**:
```javascript
{
  _id: ObjectId,
  cardId: String,           // Unique card identifier
  cardName: String,         // Card name
  cardType: String,         // Card type
  element: String,          // Card element
  cost: Number,             // Memory cost
  rarity: String,           // Card rarity
  overallStats: {
    totalInclusions: Number,      // Total times included in decklists
    totalCopies: Number,          // Total copies across all decks
    avgCopiesPerDeck: Number,     // Average copies when included
    uniqueDecks: Number,          // Number of unique decks
    winRate: Number,              // Overall win rate of decks including this card
    topCutInclusions: Number,     // Times included in top cut decks
    topCutWinRate: Number         // Win rate in top cut decks
  },
  byChampion: [             // Performance breakdown by champion
    {
      championSlug: String,
      championName: String,
      inclusions: Number,
      avgCopies: Number,
      winRate: Number,
      topCutInclusions: Number
    }
  ],
  byFormat: [               // Performance breakdown by format
    {
      format: String,
      inclusions: Number,
      avgCopies: Number,
      winRate: Number
    }
  ],
  recentTrends: {
    last30Days: {
      inclusions: Number,
      winRate: Number,
      trend: String          // "rising", "stable", "falling"
    },
    last90Days: {
      inclusions: Number,
      winRate: Number,
      trend: String
    }
  },
  synergyCards: [           // Cards frequently played together
    {
      cardId: String,
      cardName: String,
      coInclusionRate: Number,  // Percentage of decks with both cards
      winRateTogether: Number
    }
  ],
  lastCalculated: Date,     // Last time stats were calculated
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `cardId` | String | Yes | Unique card identifier |
| `cardName` | String | Yes | Card display name |
| `cardType` | String | No | Card type classification |
| `element` | String | No | Card element |
| `cost` | Number | No | Memory cost |
| `rarity` | String | No | Card rarity tier |
| `overallStats` | Object | Yes | Aggregated performance metrics |
| `byChampion` | Array | No | Champion-specific performance |
| `byFormat` | Array | No | Format-specific performance |
| `recentTrends` | Object | No | Time-based trend analysis |
| `synergyCards` | Array | No | Frequently co-played cards |
| `lastCalculated` | Date | Yes | Calculation timestamp |
| `createdAt` | Date | Yes | Document creation timestamp |
| `updatedAt` | Date | Yes | Last modification timestamp |

**Indexes**:
- `{ cardId: 1 }` - Unique index for card lookups
- `{ cardName: 1 }` - Index for search functionality
- `{ "overallStats.totalInclusions": -1 }` - Index for popularity queries
- `{ "overallStats.winRate": -1 }` - Index for win rate queries
- `{ "byChampion.championSlug": 1 }` - Multi-key index for champion-specific queries
- `{ element: 1, cardType: 1 }` - Compound index for filtering
- `{ lastCalculated: 1 }` - Index for finding stale stats

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e5"),
  "cardId": "ga-card-001",
  "cardName": "Swift Strike",
  "cardType": "Action",
  "element": "Wind",
  "cost": 2,
  "rarity": "Rare",
  "overallStats": {
    "totalInclusions": 156,
    "totalCopies": 624,
    "avgCopiesPerDeck": 4.0,
    "uniqueDecks": 156,
    "winRate": 0.582,
    "topCutInclusions": 42,
    "topCutWinRate": 0.641
  },
  "byChampion": [
    {
      "championSlug": "silvie",
      "championName": "Silvie",
      "inclusions": 145,
      "avgCopies": 4.0,
      "winRate": 0.589,
      "topCutInclusions": 40
    },
    {
      "championSlug": "tristan",
      "championName": "Tristan",
      "inclusions": 11,
      "avgCopies": 3.5,
      "winRate": 0.510,
      "topCutInclusions": 2
    }
  ],
  "byFormat": [
    {
      "format": "Constructed",
      "inclusions": 156,
      "avgCopies": 4.0,
      "winRate": 0.582
    }
  ],
  "recentTrends": {
    "last30Days": {
      "inclusions": 45,
      "winRate": 0.593,
      "trend": "rising"
    },
    "last90Days": {
      "inclusions": 156,
      "winRate": 0.582,
      "trend": "stable"
    }
  },
  "synergyCards": [
    {
      "cardId": "ga-card-002",
      "cardName": "Wind Spirit",
      "coInclusionRate": 0.92,
      "winRateTogether": 0.601
    }
  ],
  "lastCalculated": ISODate("2024-02-11T00:00:00Z"),
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-02-11T00:00:00Z")
}
```

**Usage Notes**:
- Recalculate stats periodically (e.g., daily or after major events)
- Use `lastCalculated` to determine when recalculation is needed
- `trend` calculation based on rate of change in inclusions over time
- `synergyCards` limited to top 10-20 most common pairings
- Consider separate collection for historical snapshots

---

### crawler_state Collection

**Purpose**: Tracks the state of web crawlers to enable resumable crawling and prevent duplicate work.

**Schema**:
```javascript
{
  _id: ObjectId,
  crawlerName: String,      // Identifier for the crawler
  sourceType: String,       // Type of source (e.g., "melee", "limitless", "organizer")
  lastRunAt: Date,          // Last successful run timestamp
  lastCompletedAt: Date,    // Last completed run timestamp
  status: String,           // Current status (e.g., "idle", "running", "error", "paused")
  progress: {
    currentPage: Number,
    totalPages: Number,
    itemsProcessed: Number,
    itemsFailed: Number,
    lastProcessedId: String  // Last successfully processed item ID
  },
  cursor: Object,           // Resumption cursor/state
  errorLog: [               // Recent errors
    {
      timestamp: Date,
      error: String,
      context: Object
    }
  ],
  config: {                 // Crawler configuration
    enabled: Boolean,
    intervalMinutes: Number,
    maxRetries: Number,
    batchSize: Number
  },
  metadata: Object,         // Additional crawler-specific data
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `crawlerName` | String | Yes | Unique crawler identifier |
| `sourceType` | String | Yes | Data source classification |
| `lastRunAt` | Date | No | Last execution start time |
| `lastCompletedAt` | Date | No | Last successful completion time |
| `status` | String | Yes | Current crawler status |
| `progress` | Object | No | Crawling progress metrics |
| `cursor` | Object | No | Resumption state |
| `errorLog` | Array | No | Recent error history |
| `config` | Object | Yes | Crawler configuration |
| `metadata` | Object | No | Additional crawler data |
| `createdAt` | Date | Yes | Document creation timestamp |
| `updatedAt` | Date | Yes | Last modification timestamp |

**Indexes**:
- `{ crawlerName: 1 }` - Unique index for crawler identification
- `{ sourceType: 1, status: 1 }` - Compound index for source type queries
- `{ lastRunAt: 1 }` - Index for scheduling
- `{ status: 1, "config.enabled": 1 }` - Index for finding active crawlers

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e6"),
  "crawlerName": "melee-events-crawler",
  "sourceType": "melee",
  "lastRunAt": ISODate("2024-02-11T06:00:00Z"),
  "lastCompletedAt": ISODate("2024-02-11T06:45:23Z"),
  "status": "idle",
  "progress": {
    "currentPage": 15,
    "totalPages": 15,
    "itemsProcessed": 450,
    "itemsFailed": 3,
    "lastProcessedId": "melee-event-12345"
  },
  "cursor": {
    "lastEventDate": "2024-02-10T00:00:00Z",
    "lastEventId": "melee-event-12345"
  },
  "errorLog": [
    {
      "timestamp": ISODate("2024-02-11T06:30:15Z"),
      "error": "Timeout fetching page 12",
      "context": {
        "page": 12,
        "url": "https://example.com/events?page=12"
      }
    }
  ],
  "config": {
    "enabled": true,
    "intervalMinutes": 360,
    "maxRetries": 3,
    "batchSize": 50
  },
  "metadata": {
    "userAgent": "Grand Archive Meta Crawler/1.0",
    "rateLimit": "60 requests/minute"
  },
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-02-11T06:45:23Z")
}
```

**Usage Notes**:
- `status` values: `"idle"`, `"running"`, `"error"`, `"paused"`, `"disabled"`
- Update `lastRunAt` when crawler starts
- Update `lastCompletedAt` only on successful completion
- Keep `errorLog` limited to last 50-100 errors
- Use `cursor` for resumable crawling after failures
- Lock mechanism recommended for distributed crawler deployments

---

### users Collection (Future)

**Purpose**: User accounts for authentication and personalization features.

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: String,           // Unique user identifier
  email: String,            // User email (unique)
  username: String,         // Display username
  passwordHash: String,     // Hashed password (bcrypt)
  role: String,             // User role (e.g., "user", "contributor", "admin")
  profile: {
    displayName: String,
    avatarUrl: String,
    bio: String,
    playerId: String,       // Link to tournament player ID
    favoriteChampions: [String]  // Array of champion slugs
  },
  preferences: {
    emailNotifications: Boolean,
    favoriteFormat: String,
    theme: String           // UI theme preference
  },
  apiKeys: [                // API key management
    {
      keyId: String,
      keyHash: String,
      name: String,
      lastUsed: Date,
      createdAt: Date,
      expiresAt: Date
    }
  ],
  emailVerified: Boolean,
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  loginCount: Number,
  accountStatus: String,    // "active", "suspended", "deleted"
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `userId` | String | Yes | Unique user identifier (UUID) |
| `email` | String | Yes | User email address |
| `username` | String | Yes | Public display username |
| `passwordHash` | String | Yes | Bcrypt hashed password |
| `role` | String | Yes | Authorization role |
| `profile` | Object | No | User profile information |
| `preferences` | Object | No | User preferences |
| `apiKeys` | Array | No | API key management |
| `emailVerified` | Boolean | Yes | Email verification status |
| `emailVerificationToken` | String | No | Verification token |
| `passwordResetToken` | String | No | Password reset token |
| `passwordResetExpires` | Date | No | Reset token expiration |
| `lastLoginAt` | Date | No | Last login timestamp |
| `loginCount` | Number | Yes | Total login count |
| `accountStatus` | String | Yes | Account status |
| `createdAt` | Date | Yes | Account creation timestamp |
| `updatedAt` | Date | Yes | Last modification timestamp |

**Indexes**:
- `{ userId: 1 }` - Unique index for user ID lookups
- `{ email: 1 }` - Unique index for email lookups
- `{ username: 1 }` - Unique index for username lookups
- `{ emailVerificationToken: 1 }` - Index for verification
- `{ passwordResetToken: 1 }` - Index for password reset
- `{ accountStatus: 1 }` - Index for filtering active users
- `{ createdAt: -1 }` - Index for user registration analytics

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e7"),
  "userId": "usr_a1b2c3d4e5f6",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "passwordHash": "$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGH",
  "role": "user",
  "profile": {
    "displayName": "John Doe",
    "avatarUrl": "https://example.com/avatars/johndoe.jpg",
    "bio": "Competitive Grand Archive player",
    "playerId": "player-12345",
    "favoriteChampions": ["silvie", "tristan"]
  },
  "preferences": {
    "emailNotifications": true,
    "favoriteFormat": "Constructed",
    "theme": "dark"
  },
  "apiKeys": [],
  "emailVerified": true,
  "emailVerificationToken": null,
  "passwordResetToken": null,
  "passwordResetExpires": null,
  "lastLoginAt": ISODate("2024-02-11T10:30:00Z"),
  "loginCount": 42,
  "accountStatus": "active",
  "createdAt": ISODate("2024-01-15T10:30:00Z"),
  "updatedAt": ISODate("2024-02-11T10:30:00Z")
}
```

**Usage Notes**:
- Use bcrypt with cost factor 10-12 for password hashing
- Never store plain text passwords
- `emailVerificationToken` and `passwordResetToken` should be random, secure tokens
- Expire password reset tokens after 1-24 hours
- Implement rate limiting on authentication endpoints
- Consider OAuth integration for third-party authentication
- GDPR compliance: Implement user data export and deletion

---

### saved_decklists Collection (Future)

**Purpose**: User-saved and custom decklists for personal collection management.

**Schema**:
```javascript
{
  _id: ObjectId,
  userId: String,           // Reference to users.userId
  decklistId: String,       // Optional reference to decklists._id (if based on tournament deck)
  name: String,             // Custom deck name
  description: String,      // Deck description
  championSlug: String,     // Reference to champions.slug
  championName: String,     // Champion name (denormalized)
  mainDeck: Array,          // Same structure as decklists.mainDeck
  sideboard: Array,         // Same structure as decklists.sideboard
  materialDeck: Array,      // Same structure as decklists.materialDeck
  deckStats: Object,        // Same structure as decklists.deckStats
  deckHash: String,         // Hash for duplicate detection
  archetype: String,        // Deck archetype/variant
  format: String,           // Format (Constructed, Limited, etc.)
  tags: [String],           // User-defined tags
  visibility: String,       // "private", "unlisted", "public"
  likes: Number,            // Number of likes (if public)
  views: Number,            // View count (if public)
  forkCount: Number,        // Times forked by other users
  forkedFrom: String,       // Reference to original deck if forked
  version: Number,          // Version number for tracking changes
  versionHistory: [         // History of deck versions
    {
      version: Number,
      timestamp: Date,
      changes: String
    }
  ],
  metadata: {
    isBudget: Boolean,
    isCompetitive: Boolean,
    difficultyRating: Number  // 1-5 scale
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Field Descriptions**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `_id` | ObjectId | Yes | MongoDB unique identifier |
| `userId` | String | Yes | Foreign key to users collection |
| `decklistId` | String | No | Reference to tournament decklist |
| `name` | String | Yes | User-defined deck name |
| `description` | String | No | Deck description and strategy |
| `championSlug` | String | Yes | Foreign key to champions collection |
| `championName` | String | No | Denormalized champion name |
| `mainDeck` | Array | Yes | Main deck card list |
| `sideboard` | Array | No | Sideboard card list |
| `materialDeck` | Array | No | Material deck card list |
| `deckStats` | Object | No | Calculated deck statistics |
| `deckHash` | String | No | Hash for duplicate detection |
| `archetype` | String | No | Deck variant classification |
| `format` | String | Yes | Game format |
| `tags` | Array | No | User-defined tags |
| `visibility` | String | Yes | Privacy setting |
| `likes` | Number | Yes | Like count |
| `views` | Number | Yes | View count |
| `forkCount` | Number | Yes | Fork count |
| `forkedFrom` | String | No | Original deck reference |
| `version` | Number | Yes | Current version number |
| `versionHistory` | Array | No | Version change log |
| `metadata` | Object | No | Additional deck metadata |
| `createdAt` | Date | Yes | Document creation timestamp |
| `updatedAt` | Date | Yes | Last modification timestamp |

**Indexes**:
- `{ userId: 1, createdAt: -1 }` - Compound index for user's decklists
- `{ championSlug: 1, visibility: 1 }` - Compound index for public champion decklists
- `{ visibility: 1, likes: -1 }` - Compound index for popular public decks
- `{ tags: 1 }` - Multi-key index for tag-based search
- `{ deckHash: 1 }` - Index for duplicate detection
- `{ forkedFrom: 1 }` - Index for tracking deck lineage
- `{ "mainDeck.cardId": 1, visibility: 1 }` - Multi-key index for card search in public decks

**Example Document**:
```json
{
  "_id": ObjectId("65a1b2c3d4e5f6a7b8c9d0e8"),
  "userId": "usr_a1b2c3d4e5f6",
  "decklistId": null,
  "name": "Budget Silvie Aggro",
  "description": "An aggressive Silvie deck built on a budget, focusing on efficient low-cost allies and tempo plays.",
  "championSlug": "silvie",
  "championName": "Silvie",
  "mainDeck": [
    {
      "cardId": "ga-card-001",
      "cardName": "Swift Strike",
      "quantity": 4,
      "cardType": "Action",
      "element": "Wind",
      "cost": 2,
      "rarity": "Rare"
    }
  ],
  "sideboard": [],
  "materialDeck": [
    {
      "cardId": "ga-mat-wind",
      "cardName": "Wind Material",
      "quantity": 30,
      "element": "Wind"
    }
  ],
  "deckStats": {
    "totalCards": 60,
    "avgMemoryCost": 2.3,
    "elementDistribution": {
      "Wind": 55,
      "Norm": 5
    },
    "typeDistribution": {
      "Ally": 25,
      "Action": 30,
      "Item": 5
    }
  },
  "deckHash": "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7",
  "archetype": "Aggro",
  "format": "Constructed",
  "tags": ["budget", "aggro", "beginner-friendly"],
  "visibility": "public",
  "likes": 23,
  "views": 156,
  "forkCount": 5,
  "forkedFrom": null,
  "version": 2,
  "versionHistory": [
    {
      "version": 1,
      "timestamp": ISODate("2024-02-01T10:00:00Z"),
      "changes": "Initial version"
    },
    {
      "version": 2,
      "timestamp": ISODate("2024-02-10T15:30:00Z"),
      "changes": "Replaced 3x expensive cards with budget alternatives"
    }
  ],
  "metadata": {
    "isBudget": true,
    "isCompetitive": false,
    "difficultyRating": 2
  },
  "createdAt": ISODate("2024-02-01T10:00:00Z"),
  "updatedAt": ISODate("2024-02-10T15:30:00Z")
}
```

**Usage Notes**:
- `visibility` values: `"private"` (owner only), `"unlisted"` (shareable via link), `"public"` (listed on site)
- Increment `version` on each edit
- `versionHistory` limited to last 10-20 versions
- Implement rate limiting on deck creation/updates
- Consider implementing deck comments/ratings for public decks
- `forkedFrom` creates lineage tracking for deck evolution

---

## Relationships

### Entity Relationship Diagram

```
champions (1) ----< (N) standings
champions (1) ----< (N) decklists
events (1) ----< (N) standings
events (1) ----< (N) decklists
decklists (1) ----< (1) standings (optional)
users (1) ----< (N) saved_decklists (future)
saved_decklists (N) >---- (1) champions (future)
```

### Relationship Details

1. **champions → standings**: One champion can appear in many standings entries
   - Foreign Key: `standings.championSlug` → `champions.slug`
   - Type: One-to-Many

2. **champions → decklists**: One champion can have many decklists
   - Foreign Key: `decklists.championSlug` → `champions.slug`
   - Type: One-to-Many

3. **events → standings**: One event has many standings entries
   - Foreign Key: `standings.eventId` → `events.eventId`
   - Type: One-to-Many

4. **events → decklists**: One event can have many decklists
   - Foreign Key: `decklists.eventId` → `events.eventId`
   - Type: One-to-Many

5. **decklists ← standings**: One decklist may be linked to one standings entry
   - Foreign Key: `standings.decklistId` → `decklists._id`
   - Type: One-to-One (optional)

6. **users → saved_decklists**: One user can have many saved decklists (future)
   - Foreign Key: `saved_decklists.userId` → `users.userId`
   - Type: One-to-Many

7. **champions → saved_decklists**: One champion can have many saved decklists (future)
   - Foreign Key: `saved_decklists.championSlug` → `champions.slug`
   - Type: One-to-Many

### Denormalization Strategy

To optimize read performance, the following fields are intentionally denormalized:

- `championName` in `standings` and `decklists` (sourced from `champions.name`)
- `placement` in `decklists` (sourced from `standings.placement`)
- `playerName` in `decklists` (sourced from `standings.playerName`)

**Trade-offs**:
- Faster reads (no joins needed)
- Increased storage (duplicate data)
- Must update denormalized fields when source changes

---

## Indexes

### Index Strategy

1. **Unique Indexes**: Prevent duplicate entries
2. **Compound Indexes**: Support common query patterns
3. **Single Field Indexes**: Support sorting and filtering
4. **Multi-key Indexes**: Support array field queries
5. **TTL Indexes**: Automatic document expiration (if needed)

### Complete Index List

#### champions Collection
```javascript
{ slug: 1 }                    // Unique, for URL routing
{ name: 1 }                    // For search
{ uuid: 1 }                    // Unique, for external references
{ element: 1 }                 // For filtering
```

#### events Collection
```javascript
{ eventId: 1 }                           // Unique, primary lookup
{ format: 1, startAt: -1 }               // Format filtering with date sort
{ category: 1, status: 1 }               // Category and status queries
{ status: 1, ranked: 1 }                 // Active ranked events
{ startAt: -1 }                          // Chronological sorting
{ "location.country": 1, startAt: -1 }   // Location-based queries
```

#### standings Collection
```javascript
{ eventId: 1, playerId: 1 }              // Unique compound, event-player lookup
{ eventId: 1, placement: 1 }             // Event standings
{ championSlug: 1, placement: 1 }        // Champion performance
{ playerId: 1, createdAt: -1 }           // Player history
{ eventId: 1, madeCut: 1 }               // Top cut queries
{ decklistId: 1 }                        // Decklist references
```

#### decklists Collection
```javascript
{ eventId: 1, playerId: 1 }              // Event-player decklist lookup
{ championSlug: 1, eventId: 1 }          // Champion decklist queries
{ deckHash: 1 }                          // Duplicate detection
{ "mainDeck.cardId": 1 }                 // Multi-key, card inclusion
{ eventId: 1, placement: 1 }             // Top decklists
{ archetype: 1, createdAt: -1 }          // Archetype evolution
{ createdAt: -1 }                        // Recent decklists
```

#### card_performance_stats Collection
```javascript
{ cardId: 1 }                            // Unique, primary lookup
{ cardName: 1 }                          // Search
{ "overallStats.totalInclusions": -1 }   // Popularity
{ "overallStats.winRate": -1 }           // Win rate queries
{ "byChampion.championSlug": 1 }         // Multi-key, champion-specific
{ element: 1, cardType: 1 }              // Filtering
{ lastCalculated: 1 }                    // Finding stale stats
```

#### crawler_state Collection
```javascript
{ crawlerName: 1 }                       // Unique, crawler identification
{ sourceType: 1, status: 1 }             // Source type queries
{ lastRunAt: 1 }                         // Scheduling
{ status: 1, "config.enabled": 1 }       // Active crawlers
```

#### users Collection (Future)
```javascript
{ userId: 1 }                            // Unique, user ID lookups
{ email: 1 }                             // Unique, email lookups
{ username: 1 }                          // Unique, username lookups
{ emailVerificationToken: 1 }            // Verification
{ passwordResetToken: 1 }                // Password reset
{ accountStatus: 1 }                     // Active users
{ createdAt: -1 }                        // Registration analytics
```

#### saved_decklists Collection (Future)
```javascript
{ userId: 1, createdAt: -1 }             // User's decklists
{ championSlug: 1, visibility: 1 }       // Public champion decklists
{ visibility: 1, likes: -1 }             // Popular public decks
{ tags: 1 }                              // Multi-key, tag search
{ deckHash: 1 }                          // Duplicate detection
{ forkedFrom: 1 }                        // Deck lineage
{ "mainDeck.cardId": 1, visibility: 1 }  // Card search in public decks
```

### Index Size Considerations

Monitor index sizes regularly:
```javascript
db.collection.stats().indexSizes
```

Drop unused indexes to save space:
```javascript
db.collection.dropIndex("index_name")
```

---

## Data Validation

### Schema Validation Rules

MongoDB schema validation can be enforced using JSON Schema validators:

#### champions Validation
```javascript
db.createCollection("champions", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["uuid", "slug", "name", "createdAt", "updatedAt"],
      properties: {
        uuid: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "must be a lowercase alphanumeric string with hyphens"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          description: "must be a non-empty string"
        },
        element: {
          enum: ["Wind", "Fire", "Water", "Arcane", "Crux", "Luxem", "Norm", "Tera"],
          description: "must be a valid element"
        },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
```

#### events Validation
```javascript
db.createCollection("events", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["eventId", "name", "format", "category", "status", "startAt", "ranked", "createdAt", "updatedAt"],
      properties: {
        eventId: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        name: {
          bsonType: "string",
          minLength: 1,
          description: "must be a non-empty string"
        },
        format: {
          enum: ["Constructed", "Limited", "Sealed", "Draft"],
          description: "must be a valid format"
        },
        category: {
          enum: ["Local", "Regional", "Nationals", "Grand Championship", "Premiere", "Online"],
          description: "must be a valid category"
        },
        status: {
          enum: ["upcoming", "ongoing", "completed", "cancelled"],
          description: "must be a valid status"
        },
        startAt: { bsonType: "date" },
        endAt: { bsonType: ["date", "null"] },
        playerCount: {
          bsonType: ["int", "null"],
          minimum: 0
        },
        ranked: { bsonType: "bool" },
        createdAt: { bsonType: "date" },
        updatedAt: { bsonType: "date" }
      }
    }
  }
})
```

### Application-Level Validation

Implement additional validation in your application layer:

1. **Field Length Limits**
   - `name` fields: 1-200 characters
   - `description` fields: 0-2000 characters
   - `notes` fields: 0-5000 characters

2. **Email Validation**
   - Use regex or library for RFC 5322 compliance

3. **URL Validation**
   - Validate `imageUrl`, `sourceUrl` fields

4. **Business Logic Validation**
   - Deck size limits (typically 60 cards for main deck)
   - Material deck limits (typically 30 cards)
   - Valid card IDs exist in card database
   - Event dates logical (endAt > startAt)

---

## Security Best Practices

### Authentication & Authorization

1. **Database User Roles**
   ```javascript
   // Read-only user for analytics
   db.createUser({
     user: "analytics_ro",
     pwd: "strong_password",
     roles: [{ role: "read", db: "grand-archive-meta" }]
   })

   // Application user with read/write
   db.createUser({
     user: "app_rw",
     pwd: "strong_password",
     roles: [{ role: "readWrite", db: "grand-archive-meta" }]
   })

   // Admin user
   db.createUser({
     user: "admin",
     pwd: "strong_password",
     roles: [{ role: "dbOwner", db: "grand-archive-meta" }]
   })
   ```

2. **Connection Security**
   - Always use TLS/SSL in production
   - Use MongoDB Atlas for managed security
   - Enable IP whitelisting
   - Use VPC peering for AWS/Azure/GCP deployments

3. **Credential Management**
   - Store credentials in environment variables or secret managers
   - Never commit credentials to version control
   - Rotate passwords regularly (quarterly)
   - Use different credentials for dev/staging/production

### Data Security

1. **Encryption**
   - Enable encryption at rest (MongoDB Atlas does this by default)
   - Use TLS for data in transit
   - Encrypt sensitive fields (e.g., email, passwordHash) at application level if needed

2. **Field-Level Access Control**
   - Implement API-level filtering for sensitive fields
   - Don't expose `passwordHash`, tokens in API responses
   - Use field projection in queries to limit returned data

3. **Rate Limiting**
   - Implement rate limiting on authentication endpoints
   - Limit query complexity and result sizes
   - Use MongoDB connection pooling

4. **Input Sanitization**
   - Validate and sanitize all user inputs
   - Prevent NoSQL injection attacks
   - Use parameterized queries/prepared statements

### Monitoring & Auditing

1. **Audit Logging**
   - Enable MongoDB audit logs (Enterprise/Atlas)
   - Log authentication attempts
   - Track schema changes
   - Monitor failed query attempts

2. **Performance Monitoring**
   - Set up alerts for slow queries (>100ms)
   - Monitor index usage
   - Track connection pool exhaustion
   - Alert on abnormal query patterns

3. **Security Scanning**
   - Regular security audits
   - Dependency vulnerability scanning
   - Penetration testing (annual)

---

## Backup and Scaling

### Backup Strategy

1. **Automated Backups**
   - MongoDB Atlas: Continuous backups with point-in-time recovery
   - Self-hosted: Use `mongodump` with cron jobs
   - Frequency: Daily full backups + continuous oplog
   - Retention: 7 daily, 4 weekly, 12 monthly

2. **Backup Script Example**
   ```bash
   #!/bin/bash
   DATE=$(date +%Y-%m-%d)
   mongodump --uri="$MONGODB_URI" --out="/backups/$DATE"
   # Compress backup
   tar -czf "/backups/$DATE.tar.gz" "/backups/$DATE"
   rm -rf "/backups/$DATE"
   # Upload to S3 or cloud storage
   aws s3 cp "/backups/$DATE.tar.gz" "s3://my-backups/mongodb/"
   # Clean old backups (older than 30 days)
   find /backups -name "*.tar.gz" -mtime +30 -delete
   ```

3. **Disaster Recovery**
   - Document recovery procedures
   - Test restore process quarterly
   - Store backups in different geographic region
   - Maintain off-site backup copies

### Scaling Considerations

1. **Vertical Scaling (Scale Up)**
   - Start with appropriate instance size
   - Monitor CPU, memory, disk I/O
   - Upgrade instance size as needed
   - MongoDB Atlas makes this easy with zero downtime

2. **Horizontal Scaling (Scale Out)**

   **Sharding Strategy**:
   - Shard when single-server limitations reached
   - Choose shard key carefully (immutable, high cardinality)

   Recommended shard keys:
   - `events`: `{ eventId: "hashed" }`
   - `decklists`: `{ eventId: 1, playerId: 1 }`
   - `standings`: `{ eventId: 1, playerId: 1 }`
   - `card_performance_stats`: `{ cardId: "hashed" }`

3. **Read Scaling**
   - Use replica sets (3+ members)
   - Direct read-heavy queries to secondaries
   - Use read preference: `secondaryPreferred` for analytics
   - Implement application-level caching (Redis)

4. **Write Scaling**
   - Batch insert operations where possible
   - Use bulk write operations
   - Consider write concern `w:1` for non-critical writes
   - Implement queue-based writes for high volume

5. **Data Archival**
   - Archive old events/decklists to separate collection
   - Use TTL indexes for automatic cleanup if needed
   - Example TTL index (auto-delete after 365 days):
   ```javascript
   db.crawler_state.createIndex(
     { "createdAt": 1 },
     { expireAfterSeconds: 31536000 }
   )
   ```

### Performance Optimization

1. **Query Optimization**
   - Use `explain()` to analyze query performance
   - Ensure queries use indexes (avoid COLLSCAN)
   - Use projection to limit returned fields
   - Avoid `$where` and JavaScript expressions

2. **Index Optimization**
   - Create compound indexes for common query patterns
   - Order compound index fields by: equality, sort, range
   - Monitor index usage with `db.collection.aggregate([{ $indexStats: {} }])`
   - Drop unused indexes

3. **Connection Pooling**
   - Set appropriate connection pool size
   - Recommended: 10-100 connections per app instance
   - Monitor connection pool metrics

4. **Caching Strategy**
   - Cache frequently accessed data (champions, recent events)
   - Use Redis or application-level cache
   - Set appropriate TTL (5-60 minutes for most data)
   - Invalidate cache on updates

### Monitoring Metrics

Key metrics to monitor:

1. **Database Metrics**
   - Query execution time (p50, p95, p99)
   - Index hit ratio
   - Connection pool utilization
   - Replica set lag
   - Disk I/O and CPU usage

2. **Application Metrics**
   - API response times
   - Error rates
   - Request volume
   - Cache hit rates

3. **Business Metrics**
   - New events per day
   - Total decklists
   - Active users (future)
   - Data freshness (crawler last run)

---

## Migration Guide

### Initial Setup

1. Create database and collections:
   ```bash
   mongosh "$MONGODB_URI" < indexes.js
   ```

2. Load seed data (optional):
   ```bash
   mongoimport --uri="$MONGODB_URI" --collection=champions --file=seed-data/sample_champion.json
   mongoimport --uri="$MONGODB_URI" --collection=events --file=seed-data/sample_event.json
   mongoimport --uri="$MONGODB_URI" --collection=decklists --file=seed-data/sample_decklist.json
   ```

### Schema Versioning

- Keep migration scripts in `database/migrations/`
- Name format: `YYYY-MM-DD-description.js`
- Document breaking changes
- Test migrations on staging before production

### Future Migration Example

```javascript
// database/migrations/2024-03-15-add-archetype-to-standings.js
db.standings.updateMany(
  { archetype: { $exists: false } },
  { $set: { archetype: null } }
)
```

---

## Appendix

### Useful Commands

```javascript
// Show all collections
show collections

// Get collection stats
db.champions.stats()

// Count documents
db.events.countDocuments({ status: "completed" })

// Analyze query performance
db.standings.find({ eventId: "event-123" }).explain("executionStats")

// Check index usage
db.decklists.aggregate([{ $indexStats: {} }])

// Find slow queries (MongoDB 4.2+)
db.adminCommand({ currentOp: true, "secs_running": { $gte: 5 } })
```

### Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Best Practices](https://docs.mongodb.com/manual/administration/production-notes/)
- [MongoDB University](https://university.mongodb.com/) - Free courses
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024-02-11 | Initial schema documentation |

---

**Last Updated**: 2024-02-11
**Maintainer**: Grand Archive Meta Team
