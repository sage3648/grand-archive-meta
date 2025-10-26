# Grand Archive TCG Meta Analysis Backend

A production-ready Rust backend service for analyzing Grand Archive TCG tournament meta data.

## Quick Start

```bash
# Copy environment file
cp .env.example .env

# Build and run
cargo run --release
```

Server starts on `http://localhost:8080`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/champions` - List champions
- `GET /api/events` - List events
- `GET /api/decklists` - List decklists
- `GET /api/meta/breakdown` - Meta statistics
- `GET /api/cards/performance` - Card statistics

See [docs/API.md](docs/API.md) for full documentation.

## Features

- RESTful API with actix-web
- Automated data crawling from Grand Archive APIs
- Meta analysis and statistics
- Scheduled jobs (tokio-cron-scheduler)
- MongoDB integration
- Production-ready error handling and logging
