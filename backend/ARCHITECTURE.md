# Grand Archive Meta Backend - Architecture

## Overview

This document describes the architecture and design decisions for the Grand Archive TCG Meta Analysis backend service.

## Technology Stack

- **Language**: Rust 2021 edition
- **Web Framework**: Actix-web 4.9
- **Database**: MongoDB 2.6 driver
- **Async Runtime**: Tokio 1.40 with full features
- **HTTP Client**: Reqwest 0.12 with JSON support
- **Scheduler**: tokio-cron-scheduler 0.10
- **Serialization**: Serde 1.0 with derive macros

## Architecture Pattern

The service follows a layered architecture:

```
┌─────────────────────────────────────┐
│     HTTP Layer (Actix-web)          │
│  Controllers + Middleware + CORS     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│      Service Layer                  │
│  Business Logic & Orchestration     │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Data Access Layer                 │
│   MongoDB Collections & Queries     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   External API Clients              │
│   (Rate Limited & Retryable)        │
└─────────────────────────────────────┘
```

## Directory Structure

```
src/
├── main.rs                  # Application bootstrap
├── config.rs               # Environment configuration
├── scheduler.rs            # Cron job management
│
├── models/                 # Domain models (data structures)
│   ├── mod.rs
│   ├── champion.rs        # Champion/Class model
│   ├── event.rs           # Tournament event model
│   ├── standing.rs        # Player standing model
│   ├── decklist.rs        # Decklist with cards
│   └── card.rs            # Card reference model
│
├── clients/                # External API integration
│   ├── mod.rs
│   ├── gatcg_api.rs       # api.gatcg.com/cards
│   ├── omnidex_api.rs     # api.gatcg.com/omnidex
│   └── omni_web_api.rs    # omni.gatcg.com/api
│
├── services/               # Business logic layer
│   ├── mod.rs
│   ├── event_crawler.rs   # Event discovery & crawling
│   ├── card_sync.rs       # Card data synchronization
│   └── meta_analysis.rs   # Meta statistics calculation
│
├── controllers/            # HTTP request handlers
│   ├── mod.rs
│   ├── health.rs          # Health check endpoint
│   ├── champions.rs       # Champion CRUD endpoints
│   ├── events.rs          # Event query endpoints
│   ├── decklists.rs       # Decklist query endpoints
│   └── meta.rs            # Meta analysis endpoints
│
└── middleware/             # HTTP middleware
    ├── mod.rs
    ├── cors.rs            # CORS configuration
    └── cache.rs           # Cache-Control headers
```

## Core Components

### 1. API Clients

All external API clients implement:
- **Rate Limiting**: 500ms delay between requests (configurable)
- **Retry Logic**: Exponential backoff with max 3 retries
- **Timeout Handling**: 10-second request timeout
- **Error Recovery**: Graceful handling of 404s and 5xx errors

#### GatcgApiClient
- Fetches card data by slug
- Used for champion and card synchronization
- Endpoint: `https://api.gatcg.com/cards/{slug}`

#### OmnidexApiClient
- Fetches event data, standings, and statistics
- Sequential event discovery (no list endpoint)
- Endpoints:
  - `GET /omnidex/events/{id}`
  - `GET /omnidex/events/{id}/standings`
  - `GET /omnidex/events/{id}/statistics`

#### OmniWebApiClient
- Fetches individual player decklists
- Endpoint: `GET /api/events/{event_id}/decklist?player={player_id}`

### 2. Services

#### EventCrawler
Discovers and crawls tournament events sequentially:

```rust
pub async fn crawl_historical_events(&self, start_id: i32) -> Result<i32>
pub async fn crawl_incremental(&self) -> Result<i32>
```

**Algorithm**:
1. Start from last known event ID (or configured start)
2. Request event ID N
3. If found: fetch details, standings, decklists
4. If 404: increment counter
5. Stop after N consecutive 404s (default: 10)
6. Save crawler state for resumption

**Interesting Event Criteria**:
- Status = "complete"
- Ranked = true
- Has decklists OR >60 players

#### CardSyncService
Synchronizes card data from discovered cards in decklists:

```rust
pub async fn sync_cards_from_decklists(&self) -> Result<usize>
pub async fn sync_champions(&self, slugs: &[String]) -> Result<usize>
pub async fn full_sync(&self) -> Result<(usize, usize)>
```

#### MetaAnalysisService
Calculates meta statistics from event data:

```rust
pub async fn calculate_meta_breakdown(&self, format: Option<EventFormat>, days: Option<i32>) -> Result<Vec<MetaBreakdown>>
pub async fn calculate_champion_performance(&self, days: Option<i32>) -> Result<Vec<ChampionPerformance>>
pub async fn calculate_card_performance(&self, format: Option<EventFormat>, days: Option<i32>, limit: Option<i64>) -> Result<Vec<CardPerformance>>
```

### 3. Scheduled Jobs

Uses tokio-cron-scheduler for automated tasks:

| Job | Schedule | Duration | Purpose |
|-----|----------|----------|---------|
| Event Crawler | 02:00 UTC | ~10-30min | Discover new events |
| Card Sync | 03:00 UTC | ~5-15min | Update card database |
| Meta Analysis | 06:00 UTC | ~2-5min | Calculate statistics |

### 4. Database Schema

#### Collections

**champions**
```javascript
{
  _id: ObjectId,
  slug: String,              // Unique identifier
  name: String,
  element: String,
  class: String,
  image_url: String,
  updated_at: DateTime
}
```

**events**
```javascript
{
  _id: ObjectId,
  event_id: Int32,           // Unique identifier
  name: String,
  format: Enum,              // STANDARD, LIMITED, SEALED, DRAFT
  status: String,
  ranked: Boolean,
  player_count: Int32,
  has_decklists: Boolean,
  start_date: DateTime,
  updated_at: DateTime,
  crawled_at: DateTime
}
```

**standings**
```javascript
{
  _id: ObjectId,
  event_id: Int32,
  player_id: String,
  player_name: String,
  rank: Int32,
  champion: String,
  wins: Int32,
  losses: Int32,
  draws: Int32,
  match_win_rate: Float,
  has_decklist: Boolean,
  updated_at: DateTime
}
```

**decklists**
```javascript
{
  _id: ObjectId,
  event_id: Int32,
  player_id: String,
  champion: String,
  rank: Int32,
  main_deck: [
    { slug: String, name: String, quantity: Int32, card_type: String }
  ],
  sideboard: [ ... ],
  card_frequencies: Map<String, Int32>,
  updated_at: DateTime
}
```

**cards**
```javascript
{
  _id: ObjectId,
  slug: String,
  name: String,
  card_type: String,
  element: String,
  classes: [String],
  cost: Int32,
  power: Int32,
  card_text: String,
  image_url: String,
  updated_at: DateTime
}
```

**crawler_state**
```javascript
{
  _id: ObjectId,
  last_event_id: Int32,
  total_events: Int32,
  last_crawl: DateTime,
  crawl_type: String         // "incremental" or "historical"
}
```

#### Indexes

```javascript
// Performance indexes
db.events.createIndex({ event_id: 1 }, { unique: true })
db.events.createIndex({ status: 1, start_date: -1 })
db.events.createIndex({ format: 1, start_date: -1 })

db.standings.createIndex({ event_id: 1, player_id: 1 }, { unique: true })
db.standings.createIndex({ event_id: 1, rank: 1 })
db.standings.createIndex({ champion: 1 })

db.decklists.createIndex({ event_id: 1, player_id: 1 }, { unique: true })
db.decklists.createIndex({ champion: 1 })
db.decklists.createIndex({ player_id: 1 })

db.champions.createIndex({ slug: 1 }, { unique: true })
db.cards.createIndex({ slug: 1 }, { unique: true })
db.crawler_state.createIndex({ last_crawl: -1 })
```

## Error Handling

### Error Type Hierarchy

```rust
ConfigError           // Configuration loading errors
  ├─ MissingEnvVar
  └─ InvalidPort

ModelError           // Data model errors
  ├─ Database
  ├─ Serialization
  ├─ NotFound
  └─ InvalidData

ApiClientError       // External API errors
  ├─ RequestFailed
  ├─ DeserializationError
  ├─ RateLimitExceeded
  ├─ NotFound
  ├─ ServerError
  ├─ Timeout
  └─ MaxRetriesExceeded
```

All errors implement `std::error::Error` and use `thiserror` for ergonomic error definition.

## Design Decisions

### Why Sequential Event Discovery?

The Omnidex API doesn't provide a list endpoint, only individual event lookups. We discovered events by:
1. Trying sequential IDs (1, 2, 3, ...)
2. Stopping after N consecutive 404s
3. Resuming from last known ID for incremental crawls

**Alternative Considered**: Random sampling
**Rejected Because**: Could miss events; no guarantee of completeness

### Why Rate Limiting?

To be a good API citizen and avoid:
- IP bans
- Service degradation
- Request throttling

**Implementation**: Simple delay-based rate limiting with configurable intervals

### Why MongoDB?

**Advantages**:
- Flexible schema for evolving data models
- Excellent aggregation pipeline for meta analysis
- Native ObjectId support
- Good Rust driver support

**Alternatives Considered**: PostgreSQL
**Trade-offs**: More schema flexibility vs. less type safety

### Why Actix-web?

**Advantages**:
- Mature ecosystem
- Excellent performance
- Type-safe routing
- Native async/await support

**Alternatives Considered**: Axum, Rocket
**Trade-offs**: More boilerplate vs. more flexibility

## Performance Considerations

### Database Query Optimization

1. **Compound Indexes**: Used for multi-field queries
2. **Projection**: Limit returned fields where possible
3. **Aggregation Pipelines**: Pre-compute complex statistics
4. **Connection Pooling**: MongoDB driver handles automatically

### API Client Optimization

1. **Connection Reuse**: HTTP client reuses connections
2. **Parallel Requests**: Independent requests can run concurrently
3. **Backpressure**: Rate limiting prevents overwhelming APIs

### Memory Management

1. **Streaming**: Large result sets use cursors
2. **Batch Processing**: Process decklists in chunks
3. **Arc for Shared State**: Minimize cloning of clients

## Security Considerations

1. **CORS**: Restricted to localhost and HTTPS origins
2. **Environment Variables**: Sensitive config in `.env`
3. **No Authentication**: Currently public read-only API
4. **Rate Limiting**: Prevents abuse (future consideration)
5. **Input Validation**: Query parameters validated
6. **SQL Injection**: N/A (MongoDB uses BSON documents)

## Monitoring and Observability

### Logging Levels

- **ERROR**: Critical failures requiring attention
- **WARN**: Recoverable errors (retries, missing data)
- **INFO**: Key operations (crawl start/end, sync counts)
- **DEBUG**: Detailed operation flow
- **TRACE**: Very detailed (request/response bodies)

### Metrics to Monitor

1. **API Latency**: Response times per endpoint
2. **Database Queries**: Query duration and counts
3. **Crawler Progress**: Events discovered per run
4. **Error Rates**: 4xx/5xx response counts
5. **Job Duration**: Scheduled job completion times

## Future Enhancements

1. **Caching Layer**: Redis for frequently accessed data
2. **Authentication**: API keys or OAuth
3. **Rate Limiting**: Per-client request limits
4. **Webhooks**: Real-time event notifications
5. **GraphQL**: Alternative query interface
6. **Metrics Endpoint**: Prometheus integration
7. **Health Checks**: Detailed component status
8. **Backup Strategy**: Automated MongoDB backups

## Testing Strategy

### Unit Tests
- Model validation logic
- Error handling paths
- Data transformations

### Integration Tests
- API endpoint responses
- Database operations
- Service orchestration

### End-to-End Tests
- Full crawl cycle
- Meta calculation pipeline
- API query workflows

**Note**: Network-dependent tests marked with `#[ignore]`

## Deployment

### Docker
- Multi-stage build for optimized image
- Non-root user for security
- Health check endpoint
- ~50MB final image size

### Systemd
- Service file for process management
- Automatic restart on failure
- Environment variable loading

### Kubernetes (Future)
- Horizontal pod autoscaling
- ConfigMaps for configuration
- Secrets for sensitive data

## Contributing

When contributing, ensure:
1. Code passes `cargo clippy -- -D warnings`
2. Code is formatted with `cargo fmt`
3. Tests pass with `cargo test`
4. New features include tests
5. Public APIs include doc comments

## References

- [Actix-web Documentation](https://actix.rs/)
- [MongoDB Rust Driver](https://www.mongodb.com/docs/drivers/rust/)
- [Tokio Documentation](https://tokio.rs/)
- [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
