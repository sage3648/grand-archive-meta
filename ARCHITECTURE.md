# Grand Archive Meta - System Architecture

This document provides a detailed overview of the Grand Archive Meta platform architecture, including system design, data flow, API specifications, and security considerations.

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Component Details](#component-details)
- [Data Flow](#data-flow)
- [Database Schema](#database-schema)
- [API Specifications](#api-specifications)
- [Security Architecture](#security-architecture)
- [Scalability](#scalability)
- [Performance](#performance)
- [Monitoring and Observability](#monitoring-and-observability)
- [Disaster Recovery](#disaster-recovery)

## Overview

Grand Archive Meta is a serverless web application built on AWS infrastructure, designed to aggregate and analyze competitive Grand Archive TCG data. The platform follows a modern three-tier architecture:

- **Presentation Tier**: Next.js frontend hosted on Vercel
- **Application Tier**: Kotlin/Micronaut backend running on AWS Lambda
- **Data Tier**: MongoDB Atlas managed database

### Design Principles

1. **Serverless First**: Minimize operational overhead
2. **Event-Driven**: Automated data collection via scheduled jobs
3. **API-First**: RESTful JSON API for frontend consumption
4. **Cost-Optimized**: Pay-per-use pricing model
5. **Scalable**: Auto-scaling at all tiers
6. **Observable**: Comprehensive logging and monitoring

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          End Users                                   │
│                    (Desktop, Mobile, Tablet)                         │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Vercel Edge Network                             │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              Next.js 15 Frontend (SSR)                        │  │
│  │  - Server Components for SEO                                  │  │
│  │  - Client Components for interactivity                        │  │
│  │  - Edge caching for static assets                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ HTTPS/REST API
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    AWS API Gateway (REST)                            │
│  - Regional endpoint                                                 │
│  - CORS configuration                                                │
│  - Request throttling (10,000 req/s)                                 │
│  - CloudWatch logging                                                │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ AWS_PROXY Integration
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AWS Lambda Functions                            │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │   API Lambda    │  │  Deck Scraper   │  │  Card Scraper   │    │
│  │   (On-demand)   │  │  (Scheduled)    │  │  (Scheduled)    │    │
│  │                 │  │                 │  │                 │    │
│  │  - 2048 MB      │  │  - 1024 MB      │  │  - 2048 MB      │    │
│  │  - 30s timeout  │  │  - 15m timeout  │  │  - 15m timeout  │    │
│  │  - SnapStart    │  │  - SnapStart    │  │  - SnapStart    │    │
│  │  - Provisioned  │  │                 │  │                 │    │
│  │    Concurrency  │  │                 │  │                 │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │Meta Calculator  │  │ Manual Scraper  │                          │
│  │  (Scheduled)    │  │  (On-demand)    │                          │
│  └─────────────────┘  └─────────────────┘                          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ MongoDB Driver (TCP)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      MongoDB Atlas Cluster                           │
│                                                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Primary Collections                         │  │
│  │  - decks: Tournament decklists                                │  │
│  │  - deck-cards: Card-level deck data                           │  │
│  │  - card-reference: Centralized card database                  │  │
│  │  - meta-snapshots: Historical meta data                       │  │
│  │  - events: Tournament events                                  │  │
│  │  - scraper-audits: Scraping logs                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  - Multi-region replication                                          │
│  - Automated backups                                                 │
│  - Point-in-time recovery                                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   AWS EventBridge (Scheduler)                        │
│                                                                       │
│  Daily Jobs:                                                         │
│  - 00:00 UTC: Deck Scraper → Tournament data collection             │
│  - 03:00 UTC: Card Scraper → Card database updates                  │
│  - 04:00 UTC: Meta Calculator → Meta statistics                     │
│                                                                       │
│  Warmup:                                                             │
│  - Every 5 min: API Lambda warmup (keep instance ready)             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              External Data Sources (Web Scraping)                    │
│                                                                       │
│  - Official Grand Archive tournament sites                           │
│  - Grand Archive Index API (card data)                               │
│  - TCGPlayer API (pricing data)                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Network Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Public Internet                              │
└──────┬──────────────────────────────────────────────────────┬───────┘
       │                                                       │
       │ HTTPS (443)                                          │ HTTPS (443)
       ▼                                                       ▼
┌──────────────────┐                              ┌──────────────────┐
│  Vercel CDN      │                              │  API Gateway     │
│  (Global Edge)   │                              │  (us-east-1)     │
└──────────────────┘                              └──────────────────┘
                                                           │
                                                           │ Private
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  Lambda VPC      │
                                                  │  (Optional)      │
                                                  └──────────────────┘
                                                           │
                                                           │ Internet
                                                           ▼
                                                  ┌──────────────────┐
                                                  │  MongoDB Atlas   │
                                                  │  (Multi-region)  │
                                                  └──────────────────┘
```

## Component Details

### Frontend (Next.js)

**Technology**:
- Framework: Next.js 15 (App Router)
- React: 19.0
- Language: TypeScript 5
- Styling: Tailwind CSS 4 + Radix UI

**Key Features**:
- **Server-Side Rendering (SSR)**: Improves SEO and initial page load
- **Static Generation**: Pre-renders pages at build time where possible
- **Client-Side Hydration**: Interactive UI after initial load
- **Edge Caching**: Leverages Vercel's CDN for fast global access
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component

**Responsibilities**:
- User interface rendering
- Client-side state management
- API request orchestration
- SEO optimization (meta tags, sitemaps)
- Analytics tracking

### Backend (Kotlin/Micronaut)

**Technology**:
- Language: Kotlin 1.9.20
- Framework: Micronaut 4.2.0
- Runtime: Java 17 (AWS Lambda Corretto)
- Build: Gradle 8.x

**Key Features**:
- **Dependency Injection**: Micronaut compile-time DI
- **AOT Compilation**: Ahead-of-time processing for faster startup
- **SnapStart**: Lambda optimization for Java cold starts
- **Coroutines**: Kotlin coroutines for async operations
- **HTTP Client**: Built-in HTTP client for web scraping

**Responsibilities**:
- RESTful API endpoints
- Business logic processing
- Data aggregation and analytics
- Web scraping (tournament data, cards)
- Database operations
- Scheduled job execution

### Database (MongoDB Atlas)

**Configuration**:
- Cluster Tier: M0 (Free) for dev, M10+ for production
- Region: Multi-region (Primary: us-east-1)
- Storage: Auto-scaling
- Backups: Continuous (M10+)

**Key Features**:
- **Document Database**: Flexible schema for diverse data
- **Indexes**: Optimized queries with compound indexes
- **Aggregation Pipeline**: Complex data transformations
- **Change Streams**: Real-time data monitoring (future)
- **Atlas Search**: Full-text search capabilities (future)

**Responsibilities**:
- Data persistence
- Query processing
- Data aggregation
- Historical data storage
- Backup and recovery

## Data Flow

### User Request Flow

```
1. User navigates to https://grandarchivemeta.com/meta
                ↓
2. Vercel Edge Network serves Next.js page
                ↓
3. Next.js server component fetches data from API
   GET https://api-gateway-url/api/meta/format/Constructed
                ↓
4. API Gateway routes to API Lambda (prod alias)
                ↓
5. Lambda connects to MongoDB
                ↓
6. MongoDB executes aggregation pipeline
                ↓
7. Lambda formats response as JSON
                ↓
8. API Gateway returns response to frontend
                ↓
9. Next.js renders page with data
                ↓
10. HTML sent to user's browser
                ↓
11. Client-side React hydration for interactivity
```

### Data Collection Flow

```
1. EventBridge triggers Deck Scraper at 00:00 UTC
                ↓
2. Deck Scraper Lambda invoked
                ↓
3. Scraper fetches tournament pages (Jsoup)
                ↓
4. Parse HTML, extract decklists
                ↓
5. Validate and normalize data
                ↓
6. Check for duplicates in MongoDB
                ↓
7. Insert new decks and deck-cards
                ↓
8. Update card-reference usage statistics
                ↓
9. Log audit record in scraper-audits
                ↓
10. Lambda execution completes
                ↓
11. CloudWatch logs stored for monitoring
```

### Meta Calculation Flow

```
1. EventBridge triggers Meta Calculator at 04:00 UTC
                ↓
2. Meta Calculator Lambda invoked
                ↓
3. Query decks by format and date range
                ↓
4. Aggregate hero counts and percentages
                ↓
5. Calculate win rates from event placements
                ↓
6. Compute deck archetype distributions
                ↓
7. Generate trend data (compare to previous period)
                ↓
8. Store meta-snapshot document
                ↓
9. Update cached meta statistics
                ↓
10. Lambda execution completes
```

## Database Schema

### Collections Overview

| Collection | Documents | Purpose |
|------------|-----------|---------|
| `decks` | ~10,000 | Tournament decklists |
| `deck-cards` | ~600,000 | Individual card entries |
| `card-reference` | ~1,000 | Centralized card database |
| `meta-snapshots` | ~365 | Daily meta statistics |
| `events` | ~500 | Tournament events |
| `scraper-audits` | ~1,000 | Scraping operation logs |

### Schema Definitions

#### `decks` Collection

```javascript
{
  _id: ObjectId,
  name: String,                    // Deck name
  hero: String,                    // Hero card name
  format: String,                  // "Constructed", "Limited", etc.
  event: String,                   // Event name
  eventDate: ISODate,              // Tournament date
  placement: Number,               // Final standing (1 = 1st place)
  pilot: String,                   // Player name
  cardCount: Number,               // Total cards in deck
  deckUrl: String,                 // Source URL
  createdAt: ISODate,              // Record creation timestamp
  updatedAt: ISODate,              // Last update timestamp

  // Computed fields
  archetype: String,               // Deck archetype classification
  winRate: Number,                 // Calculated win %
}

// Indexes
db.decks.createIndex({ format: 1, eventDate: -1 })
db.decks.createIndex({ hero: 1, format: 1 })
db.decks.createIndex({ event: 1 })
db.decks.createIndex({ createdAt: -1 })
```

#### `deck-cards` Collection

```javascript
{
  _id: ObjectId,
  deckId: ObjectId,                // Reference to decks._id
  deckName: String,                // Denormalized for queries
  cardId: String,                  // Card unique ID (e.g., "GA-001")
  cardName: String,                // Card name
  quantity: Number,                // Number of copies
  cardType: String,                // "Action", "Ally", "Weapon", etc.
  element: String,                 // "Fire", "Water", etc.
  rarity: String,                  // "Common", "Rare", etc.
  cost: Number,                    // Resource cost
}

// Indexes
db["deck-cards"].createIndex({ deckId: 1 })
db["deck-cards"].createIndex({ deckName: 1 })
db["deck-cards"].createIndex({ cardId: 1 })
db["deck-cards"].createIndex({ cardName: 1 })
```

#### `card-reference` Collection

```javascript
{
  _id: ObjectId,
  uniqueId: String,                // Unique card ID (GA-001)
  name: String,                    // Card name
  element: String,                 // Element type
  cardType: String,                // Card type
  subtype: String,                 // Subtype (optional)
  rarity: String,                  // Rarity
  cost: Number,                    // Resource cost
  power: Number,                   // Power (if applicable)
  life: Number,                    // Life (if applicable)
  text: String,                    // Card text
  flavorText: String,              // Flavor text
  imageUrl: String,                // Card image URL
  setCode: String,                 // Set code
  collectorNumber: String,         // Collector number

  // Pricing data
  price: {
    market: Number,                // Market price
    low: Number,                   // Lowest listing
    high: Number,                  // Highest listing
    median: Number,                // Median price
    lastUpdated: ISODate           // Price update timestamp
  },

  // Usage statistics
  usage: {
    totalDecks: Number,            // Number of decks including this card
    percentage: Number,            // % of decks in format
    avgQuantity: Number,           // Average copies per deck
    topDecks: [ObjectId]           // References to top performing decks
  },

  // Metadata
  createdAt: ISODate,
  updatedAt: ISODate
}

// Indexes
db["card-reference"].createIndex({ uniqueId: 1 }, { unique: true })
db["card-reference"].createIndex({ name: 1 })
db["card-reference"].createIndex({ element: 1, cardType: 1 })
db["card-reference"].createIndex({ "usage.percentage": -1 })
```

#### `meta-snapshots` Collection

```javascript
{
  _id: ObjectId,
  format: String,                  // Format name
  date: ISODate,                   // Snapshot date
  periodStart: ISODate,            // Analysis period start
  periodEnd: ISODate,              // Analysis period end

  // Meta percentages
  metaPercentages: [
    {
      hero: String,                // Hero name
      deckCount: Number,           // Number of decks
      percentage: Number,          // % of meta
      winRate: Number,             // Overall win rate
      avgPlacement: Number,        // Average placement
      change: Number               // % change from previous snapshot
    }
  ],

  // Top decks
  topDecks: [
    {
      deckId: ObjectId,            // Reference to deck
      deckName: String,
      hero: String,
      event: String,
      placement: Number
    }
  ],

  // Statistics
  totalDecks: Number,              // Total decks in period
  uniqueHeroes: Number,            // Number of unique heroes
  eventCount: Number,              // Number of events

  // Metadata
  createdAt: ISODate
}

// Indexes
db["meta-snapshots"].createIndex({ format: 1, date: -1 })
db["meta-snapshots"].createIndex({ createdAt: -1 })
```

## API Specifications

### REST API Design

**Base URL**: `https://{api-gateway-id}.execute-api.us-east-1.amazonaws.com/prod`

**Content Type**: `application/json`

**Authentication**: None (public API)

**Rate Limiting**: 10,000 requests/second (API Gateway throttle)

### Endpoint Specifications

#### Meta Analysis Endpoints

**GET /api/meta/format/{format}**

Get meta percentages for a specific format.

Request:
```http
GET /api/meta/format/Constructed HTTP/1.1
Host: api-gateway-url
```

Response:
```json
{
  "format": "Constructed",
  "metaPercentages": [
    {
      "hero": "Lorraine",
      "deckCount": 150,
      "percentage": 25.5,
      "winRate": 52.3,
      "avgPlacement": 4.2,
      "change": +2.1
    }
  ],
  "totalDecks": 588,
  "lastUpdated": "2024-01-15T04:00:00Z"
}
```

#### Decklist Endpoints

**GET /api/decklists**

List recent decklists with filtering.

Query Parameters:
- `format` (optional): Filter by format
- `hero` (optional): Filter by hero
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)

Request:
```http
GET /api/decklists?format=Constructed&hero=Lorraine&limit=10 HTTP/1.1
```

Response:
```json
{
  "decks": [
    {
      "id": "deck123",
      "name": "Lorraine Aggro",
      "hero": "Lorraine",
      "format": "Constructed",
      "event": "Grand Championship 2024",
      "eventDate": "2024-01-15",
      "placement": 1,
      "pilot": "Player Name",
      "cardCount": 60
    }
  ],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

### Error Responses

Standard error format:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": "Format 'InvalidFormat' does not exist"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "path": "/api/meta/format/InvalidFormat"
}
```

Error Codes:
- `400` - Bad Request (invalid parameters)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable (database connection failed)

## Security Architecture

### Authentication & Authorization

**Current**: Public API (no authentication)

**Future**:
- JWT-based authentication for user accounts
- API keys for programmatic access
- Rate limiting per API key

### Data Security

**In Transit**:
- HTTPS only (TLS 1.2+)
- API Gateway enforces HTTPS
- MongoDB Atlas uses TLS 1.2+

**At Rest**:
- MongoDB Atlas encryption at rest
- S3 encryption for deployment artifacts
- CloudWatch Logs encrypted

### Network Security

**AWS Lambda**:
- No inbound connections (event-driven)
- Outbound to MongoDB Atlas (allowlisted IPs)
- IAM role-based permissions

**MongoDB Atlas**:
- IP allowlist (Lambda NAT Gateway IPs)
- VPC Peering option for private connectivity
- Network encryption enforced

### IAM Security

**Lambda Execution Role**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    }
  ]
}
```

**Principle of Least Privilege**: Each Lambda has minimal permissions.

## Scalability

### Horizontal Scaling

**Frontend (Vercel)**:
- Auto-scales with traffic
- Global CDN distribution
- No manual intervention needed

**Backend (Lambda)**:
- Concurrent executions: up to 1,000 (default limit)
- Auto-scales per invocation
- Can request limit increase to 10,000+

**Database (MongoDB Atlas)**:
- Auto-scaling storage
- Manual cluster tier upgrade for compute
- Horizontal scaling via sharding (M30+)

### Vertical Scaling

**Lambda Memory**:
- Current: 2048 MB (API), 1024 MB (scrapers)
- Can increase to 10,240 MB if needed
- More memory = more CPU

**MongoDB**:
- M0 (Free): 512 MB, Shared CPU
- M10: 2 GB RAM, 2 vCPU
- M20: 4 GB RAM, 2 vCPU
- M30+: Dedicated clusters with auto-scaling

### Performance Optimization

**Caching Strategy**:
- API responses cached at edge (Vercel)
- MongoDB query result caching (in-memory)
- Precomputed meta statistics

**Database Optimization**:
- Compound indexes on frequent queries
- Aggregation pipelines for complex analytics
- Read preference: `secondary` for analytics

**Cold Start Mitigation**:
- Lambda SnapStart (reduces cold start to ~1s)
- Provisioned concurrency (1 instance always warm)
- Warmup events every 5 minutes

## Monitoring and Observability

### Logging

**CloudWatch Logs**:
- All Lambda execution logs
- API Gateway access logs
- Retention: 30 days

**Log Levels**:
- ERROR: Unhandled exceptions, critical issues
- WARN: Recoverable errors, deprecations
- INFO: Important events, audit trail
- DEBUG: Detailed execution flow (dev only)

### Metrics

**Lambda Metrics**:
- Invocation count
- Duration
- Error rate
- Throttles
- Concurrent executions

**API Gateway Metrics**:
- Request count
- 4XX/5XX errors
- Latency (integration, total)

**MongoDB Metrics**:
- Query performance
- Connection pool usage
- Slow query logs

### Alerting

**CloudWatch Alarms**:
- Lambda error rate > 5%
- API Gateway 5XX rate > 1%
- Lambda duration > 25s (near timeout)
- MongoDB connection failures

**SNS Notifications**:
- Email alerts for critical issues
- Slack integration (optional)

### Tracing

**AWS X-Ray** (optional):
- End-to-end request tracing
- Performance bottleneck identification
- Service map visualization

## Disaster Recovery

### Backup Strategy

**MongoDB Atlas**:
- Continuous backups (M10+)
- Point-in-time recovery (up to 2 days)
- Snapshot retention: 14 days

**Application Code**:
- Git repository (primary backup)
- S3 versioning for Lambda deployment packages

### Recovery Procedures

**Database Corruption**:
1. Restore from MongoDB Atlas snapshot
2. Verify data integrity
3. Resume normal operations

**Lambda Function Failure**:
1. Rollback to previous Lambda version
2. Deploy fixed version
3. Investigate root cause

**Complete Region Failure**:
1. Deploy new MongoDB cluster in different region
2. Restore from backup
3. Update Lambda environment variables
4. Redeploy infrastructure

### RTO & RPO Targets

- **Recovery Time Objective (RTO)**: 4 hours
- **Recovery Point Objective (RPO)**: 24 hours (M0), 1 hour (M10+)

---

This architecture is designed for reliability, scalability, and cost-effectiveness while maintaining simplicity for a meta tracking application.
