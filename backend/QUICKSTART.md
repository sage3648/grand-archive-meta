# Quick Start Guide

## Installation

### 1. Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
```

### 2. Setup MongoDB

**Option A: MongoDB Atlas (Cloud)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Whitelist your IP address

**Option B: Local MongoDB**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 3. Configure Environment
```bash
cd /Users/sage/Programming/grand-archive-meta/backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/
# OR for Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DATABASE=grand-archive-meta
HOST=0.0.0.0
PORT=8080
RUST_LOG=info
```

### 4. Build and Run
```bash
# Development mode with debug logging
RUST_LOG=debug cargo run

# Production mode (optimized)
cargo run --release
```

Server will start at `http://localhost:8080`

## First Steps

### 1. Check Health
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "version": "0.1.0"
}
```

### 2. Initial Data Load

The service starts with empty collections. To populate data:

**Option A: Wait for scheduled jobs**
- Event crawler runs daily at 02:00 UTC
- Card sync runs daily at 03:00 UTC
- Or manually trigger (see below)

**Option B: Manual trigger via database operations**

Create a simple script to trigger the crawler:

```bash
# In a separate terminal, create a Rust script or use MongoDB shell
mongosh "mongodb://localhost:27017/grand-archive-meta"

# Insert a test event (the crawler will find more)
db.events.insertOne({
  event_id: 1,
  name: "Test Event",
  format: "STANDARD",
  status: "complete",
  ranked: true,
  player_count: 64,
  has_decklists: true,
  start_date: new Date(),
  updated_at: new Date(),
  crawled_at: new Date()
})
```

### 3. Test API Endpoints

```bash
# List all champions
curl http://localhost:8080/api/champions

# List events (may be empty initially)
curl http://localhost:8080/api/events

# Query events by format and date
curl "http://localhost:8080/api/events?format=STANDARD&days=30"

# Get meta breakdown
curl "http://localhost:8080/api/meta/breakdown?format=STANDARD&days=90"

# Get champion performance
curl http://localhost:8080/api/meta/champion-performance

# Get card performance
curl "http://localhost:8080/api/cards/performance?limit=50"
```

## Manual Crawling

To manually trigger data collection (useful for initial setup):

### Method 1: Using Rust Code

Create `manual_crawl.rs`:

```rust
use grand_archive_meta::*;

#[tokio::main]
async fn main() {
    // Setup clients and database
    let config = config::Config::from_env().unwrap();

    // Create MongoDB client
    let client_options = mongodb::options::ClientOptions::parse(&config.mongodb_uri)
        .await
        .unwrap();
    let client = mongodb::Client::with_options(client_options).unwrap();
    let database = client.database(&config.mongodb_database);

    // Create API clients
    let omnidex = std::sync::Arc::new(clients::OmnidexApiClient::new(
        config.request_delay_ms,
        config.request_timeout_secs,
        config.max_retries,
    ));

    let omni_web = std::sync::Arc::new(clients::OmniWebApiClient::new(
        config.request_delay_ms,
        config.request_timeout_secs,
        config.max_retries,
    ));

    // Run crawler
    let crawler = services::EventCrawler::new(
        omnidex,
        omni_web,
        database,
        config.crawler_max_404s,
    );

    match crawler.crawl_historical_events(1).await {
        Ok(last_id) => println!("Crawled up to event ID: {}", last_id),
        Err(e) => eprintln!("Crawler error: {}", e),
    }
}
```

Run:
```bash
cargo run --bin manual_crawl
```

### Method 2: Using MongoDB to Seed Data

For testing without actual API calls:

```javascript
// Connect to MongoDB
use grand-archive-meta

// Insert sample champion
db.champions.insertOne({
  slug: "lorraine",
  name: "Lorraine, Crux Knight",
  element: "Arcane",
  class: "Warrior",
  updated_at: new Date()
})

// Insert sample event
db.events.insertOne({
  event_id: 101,
  name: "Sample Grand Archive Tournament",
  format: "STANDARD",
  status: "complete",
  ranked: true,
  player_count: 128,
  has_decklists: true,
  start_date: new Date("2025-10-01"),
  updated_at: new Date(),
  crawled_at: new Date()
})

// Insert sample standing
db.standings.insertOne({
  event_id: 101,
  player_id: "player001",
  player_name: "John Doe",
  rank: 1,
  champion: "lorraine",
  wins: 7,
  losses: 0,
  draws: 1,
  match_win_rate: 0.933,
  has_decklist: true,
  updated_at: new Date()
})

// Insert sample decklist
db.decklists.insertOne({
  event_id: 101,
  player_id: "player001",
  player_name: "John Doe",
  champion: "lorraine",
  rank: 1,
  main_deck: [
    { slug: "dream-control", name: "Dream Control", quantity: 3, card_type: "Action" },
    { slug: "arcane-blast", name: "Arcane Blast", quantity: 3, card_type: "Attack" }
  ],
  sideboard: [],
  main_deck_count: 60,
  sideboard_count: 0,
  card_frequencies: { "dream-control": 3, "arcane-blast": 3 },
  updated_at: new Date()
})
```

## Testing the API

### Using curl

```bash
# Health check
curl -i http://localhost:8080/api/health

# Get all champions
curl -i http://localhost:8080/api/champions

# Get specific champion
curl -i http://localhost:8080/api/champions/lorraine

# Get recent events
curl -i "http://localhost:8080/api/events?days=30"

# Get event standings
curl -i http://localhost:8080/api/events/101/standings

# Get decklists for a champion
curl -i "http://localhost:8080/api/decklists?champion=lorraine&limit=10"

# Get meta breakdown
curl -i "http://localhost:8080/api/meta/breakdown?format=STANDARD&days=90"

# Get champion performance
curl -i "http://localhost:8080/api/meta/champion-performance?days=30"

# Get top 20 cards by usage
curl -i "http://localhost:8080/api/cards/performance?limit=20"
```

### Using HTTPie (prettier output)

```bash
# Install httpie
brew install httpie  # macOS
# or
apt-get install httpie  # Ubuntu

# Test endpoints
http GET localhost:8080/api/health
http GET localhost:8080/api/champions
http GET "localhost:8080/api/events?format=STANDARD"
```

### Using Postman

1. Import base URL: `http://localhost:8080`
2. Create requests for each endpoint
3. Add query parameters as needed
4. Save as collection for easy testing

## Development Workflow

### 1. Make Changes
```bash
# Edit source files in src/
vim src/controllers/meta.rs
```

### 2. Run Tests
```bash
cargo test
```

### 3. Check Code Quality
```bash
# Format code
cargo fmt

# Run linter
cargo clippy -- -D warnings
```

### 4. Run with Auto-reload
```bash
# Install cargo-watch
cargo install cargo-watch

# Run with auto-reload
cargo watch -x run
```

### 5. View Logs
```bash
# Set log level
export RUST_LOG=debug

# Run and see detailed logs
cargo run
```

## Troubleshooting

### "Cannot connect to MongoDB"
```bash
# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Check connection string in .env
cat .env | grep MONGODB_URI
```

### "Port 8080 already in use"
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
export PORT=3000
cargo run
```

### "Rate limited by API"
```bash
# Increase delay in .env
REQUEST_DELAY_MS=1000  # 1 second between requests
```

### "Build fails"
```bash
# Clean and rebuild
cargo clean
cargo build

# Update dependencies
cargo update
```

## Next Steps

1. **Explore the API** - Try different query parameters
2. **Check Database** - Use MongoDB Compass to view collections
3. **Read Documentation** - See API.md for full endpoint docs
4. **Customize** - Modify services for your needs
5. **Deploy** - Follow Docker or systemd deployment guides

## Common Tasks

### Resetting the Database
```bash
mongosh "mongodb://localhost:27017/grand-archive-meta"
> db.dropDatabase()
```

### Viewing Logs
```bash
# Info level (default)
RUST_LOG=info cargo run

# Debug level (verbose)
RUST_LOG=debug cargo run

# Trace level (very verbose)
RUST_LOG=trace cargo run

# Module-specific logging
RUST_LOG=grand_archive_meta::services::event_crawler=debug cargo run
```

### Checking Performance
```bash
# Build with optimizations
cargo build --release

# Run benchmarks (if implemented)
cargo bench

# Profile with flamegraph
cargo install flamegraph
cargo flamegraph
```

## Getting Help

1. Check logs for error messages
2. Review ARCHITECTURE.md for design details
3. Read API.md for endpoint documentation
4. Check GitHub issues for similar problems
5. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Rust version)

## Resources

- [Rust Book](https://doc.rust-lang.org/book/)
- [Actix-web Guide](https://actix.rs/docs/)
- [MongoDB Rust Driver](https://www.mongodb.com/docs/drivers/rust/)
- [Grand Archive Official Site](https://www.gatcg.com/)
