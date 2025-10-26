# Grand Archive Meta - API Documentation

Complete API reference for the Grand Archive Meta platform.

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Rate Limiting](#rate-limiting)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Meta Analysis Endpoints](#meta-analysis-endpoints)
- [Decklist Endpoints](#decklist-endpoints)
- [Card Reference Endpoints](#card-reference-endpoints)
- [Event Endpoints](#event-endpoints)
- [Development Endpoints](#development-endpoints)
- [Webhooks](#webhooks)
- [SDKs and Libraries](#sdks-and-libraries)

## Overview

The Grand Archive Meta API is a RESTful JSON API that provides access to tournament data, meta analysis, card information, and deck lists.

**API Version**: 1.0
**Content Type**: `application/json`
**Character Encoding**: UTF-8

## Base URL

### Production
```
https://{api-gateway-id}.execute-api.us-east-1.amazonaws.com/prod
```

### Development
```
http://localhost:8080
```

## Authentication

**Current**: No authentication required (public API)

**Future**: Bearer token authentication
```http
Authorization: Bearer your-api-token-here
```

## Rate Limiting

**Current Limits**:
- 10,000 requests per second (API Gateway throttle)
- No per-user limits (public API)

**Future**: API key-based limits
- Free tier: 1,000 requests/day
- Pro tier: 100,000 requests/day

**Headers**:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "apiVersion": "1.0"
  }
}
```

### Pagination

Paginated endpoints include:

```json
{
  "data": [...],
  "pagination": {
    "total": 500,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": "Format 'InvalidFormat' does not exist",
    "field": "format"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "path": "/api/meta/format/InvalidFormat",
    "requestId": "abc123"
  }
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid parameters or malformed request |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Error Codes

| Code | Description |
|------|-------------|
| `INVALID_PARAMETER` | Invalid query parameter |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `VALIDATION_ERROR` | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Internal server error |
| `SERVICE_UNAVAILABLE` | Database connection failed |

## Meta Analysis Endpoints

### Get Meta by Format

Get meta percentages and statistics for a specific format.

**Endpoint**: `GET /api/meta/format/{format}`

**Parameters**:
- `format` (path, required): Format name (e.g., "Constructed", "Limited")

**Example Request**:
```http
GET /api/meta/format/Constructed HTTP/1.1
Host: api.grandarchivemeta.com
Accept: application/json
```

**Example Response**:
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
      "change": 2.1,
      "trend": "up"
    },
    {
      "hero": "Silvie",
      "deckCount": 120,
      "percentage": 20.4,
      "winRate": 49.8,
      "avgPlacement": 5.1,
      "change": -1.5,
      "trend": "down"
    }
  ],
  "totalDecks": 588,
  "uniqueHeroes": 12,
  "lastUpdated": "2024-01-15T04:00:00Z",
  "periodStart": "2024-01-01T00:00:00Z",
  "periodEnd": "2024-01-14T23:59:59Z"
}
```

### Get Meta Snapshot

Get the latest meta snapshot across all formats.

**Endpoint**: `GET /api/meta/snapshot`

**Query Parameters**:
- `date` (optional): Specific date (ISO 8601 format)

**Example Request**:
```http
GET /api/meta/snapshot HTTP/1.1
```

**Example Response**:
```json
{
  "date": "2024-01-15T00:00:00Z",
  "formats": [
    {
      "format": "Constructed",
      "totalDecks": 588,
      "topHeroes": [
        {
          "hero": "Lorraine",
          "percentage": 25.5
        }
      ]
    }
  ]
}
```

### Get Meta Trends

Get historical meta trends over a time period.

**Endpoint**: `GET /api/meta/trends`

**Query Parameters**:
- `format` (required): Format name
- `days` (optional): Number of days to include (default: 30)
- `hero` (optional): Filter by specific hero

**Example Request**:
```http
GET /api/meta/trends?format=Constructed&days=30 HTTP/1.1
```

**Example Response**:
```json
{
  "format": "Constructed",
  "periodStart": "2023-12-15T00:00:00Z",
  "periodEnd": "2024-01-15T00:00:00Z",
  "trends": [
    {
      "date": "2024-01-01T00:00:00Z",
      "heroPercentages": {
        "Lorraine": 23.2,
        "Silvie": 21.8
      }
    },
    {
      "date": "2024-01-08T00:00:00Z",
      "heroPercentages": {
        "Lorraine": 25.5,
        "Silvie": 20.4
      }
    }
  ]
}
```

## Decklist Endpoints

### List Decklists

Get a paginated list of tournament decklists.

**Endpoint**: `GET /api/decklists`

**Query Parameters**:
- `format` (optional): Filter by format
- `hero` (optional): Filter by hero
- `event` (optional): Filter by event name
- `dateFrom` (optional): Start date (ISO 8601)
- `dateTo` (optional): End date (ISO 8601)
- `limit` (optional): Results per page (default: 20, max: 100)
- `offset` (optional): Pagination offset (default: 0)
- `sort` (optional): Sort field (default: "eventDate")
- `order` (optional): Sort order ("asc" or "desc", default: "desc")

**Example Request**:
```http
GET /api/decklists?format=Constructed&hero=Lorraine&limit=10 HTTP/1.1
```

**Example Response**:
```json
{
  "decks": [
    {
      "id": "deck_abc123",
      "name": "Lorraine Aggro",
      "hero": "Lorraine",
      "format": "Constructed",
      "event": "Grand Championship 2024",
      "eventDate": "2024-01-15T00:00:00Z",
      "placement": 1,
      "pilot": "John Smith",
      "cardCount": 60,
      "deckUrl": "https://example.com/deck/123",
      "createdAt": "2024-01-15T05:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

### Get Decklist by ID

Get detailed information about a specific decklist.

**Endpoint**: `GET /api/decklists/{id}`

**Parameters**:
- `id` (path, required): Decklist ID

**Example Request**:
```http
GET /api/decklists/deck_abc123 HTTP/1.1
```

**Example Response**:
```json
{
  "deck": {
    "id": "deck_abc123",
    "name": "Lorraine Aggro",
    "hero": "Lorraine",
    "format": "Constructed",
    "event": "Grand Championship 2024",
    "eventDate": "2024-01-15T00:00:00Z",
    "placement": 1,
    "pilot": "John Smith",
    "cardCount": 60,
    "deckUrl": "https://example.com/deck/123",
    "createdAt": "2024-01-15T05:00:00Z"
  }
}
```

### Get Decklist Cards

Get the full card list for a specific decklist.

**Endpoint**: `GET /api/deckcards/{deckName}`

**Parameters**:
- `deckName` (path, required): Deck name (URL-encoded)

**Example Request**:
```http
GET /api/deckcards/Lorraine%20Aggro HTTP/1.1
```

**Example Response**:
```json
{
  "deckName": "Lorraine Aggro",
  "cards": [
    {
      "cardId": "GA-001",
      "cardName": "Lorraine",
      "quantity": 1,
      "cardType": "Hero",
      "element": "Fire",
      "rarity": "Unique",
      "cost": 0
    },
    {
      "cardId": "GA-015",
      "cardName": "Flame Strike",
      "quantity": 4,
      "cardType": "Action",
      "element": "Fire",
      "rarity": "Common",
      "cost": 2
    }
  ],
  "totalCards": 60
}
```

### Get Decklists by Hero and Format

Get decklists for a specific hero in a specific format.

**Endpoint**: `GET /api/decklists/hero/{hero}/format/{format}`

**Parameters**:
- `hero` (path, required): Hero name
- `format` (path, required): Format name

**Query Parameters**:
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example Request**:
```http
GET /api/decklists/hero/Lorraine/format/Constructed HTTP/1.1
```

**Example Response**:
```json
{
  "hero": "Lorraine",
  "format": "Constructed",
  "decks": [
    {
      "id": "deck_abc123",
      "name": "Lorraine Aggro",
      "event": "Grand Championship 2024",
      "eventDate": "2024-01-15T00:00:00Z",
      "placement": 1,
      "pilot": "John Smith"
    }
  ],
  "total": 150
}
```

## Card Reference Endpoints

### Search Cards

Search for cards by name or other criteria.

**Endpoint**: `GET /api/card-reference/search`

**Query Parameters**:
- `q` (required): Search query
- `element` (optional): Filter by element
- `cardType` (optional): Filter by card type
- `rarity` (optional): Filter by rarity
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Example Request**:
```http
GET /api/card-reference/search?q=flame&element=Fire HTTP/1.1
```

**Example Response**:
```json
{
  "cards": [
    {
      "uniqueId": "GA-015",
      "name": "Flame Strike",
      "element": "Fire",
      "cardType": "Action",
      "rarity": "Common",
      "cost": 2,
      "power": 4,
      "text": "Deal 4 damage to target champion.",
      "imageUrl": "https://example.com/cards/GA-015.jpg",
      "price": {
        "market": 0.50,
        "low": 0.25,
        "high": 0.75,
        "lastUpdated": "2024-01-15T00:00:00Z"
      },
      "usage": {
        "totalDecks": 120,
        "percentage": 20.4
      }
    }
  ],
  "total": 15
}
```

### Get Card by ID

Get detailed information about a specific card.

**Endpoint**: `GET /api/card-reference/id/{uniqueId}`

**Parameters**:
- `uniqueId` (path, required): Card unique ID (e.g., "GA-015")

**Example Request**:
```http
GET /api/card-reference/id/GA-015 HTTP/1.1
```

**Example Response**:
```json
{
  "card": {
    "uniqueId": "GA-015",
    "name": "Flame Strike",
    "element": "Fire",
    "cardType": "Action",
    "subtype": "Attack",
    "rarity": "Common",
    "cost": 2,
    "power": 4,
    "life": null,
    "text": "Deal 4 damage to target champion.",
    "flavorText": "Strike fast, strike hard.",
    "imageUrl": "https://example.com/cards/GA-015.jpg",
    "setCode": "DOA",
    "collectorNumber": "015",
    "price": {
      "market": 0.50,
      "low": 0.25,
      "high": 0.75,
      "median": 0.45,
      "lastUpdated": "2024-01-15T00:00:00Z"
    },
    "usage": {
      "totalDecks": 120,
      "percentage": 20.4,
      "avgQuantity": 3.2,
      "topDecks": ["deck_abc123", "deck_def456"]
    }
  }
}
```

### Get Card Usage Trends

Get usage trends for cards over time.

**Endpoint**: `GET /api/card-reference/usage-trends`

**Query Parameters**:
- `format` (optional): Filter by format
- `days` (optional): Number of days (default: 30)
- `limit` (optional): Number of cards (default: 20)

**Example Request**:
```http
GET /api/card-reference/usage-trends?format=Constructed&days=30 HTTP/1.1
```

**Example Response**:
```json
{
  "format": "Constructed",
  "periodStart": "2023-12-15T00:00:00Z",
  "periodEnd": "2024-01-15T00:00:00Z",
  "trends": [
    {
      "cardId": "GA-015",
      "cardName": "Flame Strike",
      "currentUsage": 20.4,
      "previousUsage": 18.2,
      "change": 2.2,
      "trend": "up"
    }
  ]
}
```

### Get Card Statistics

Get overall statistics about the card database.

**Endpoint**: `GET /api/card-reference/statistics`

**Example Request**:
```http
GET /api/card-reference/statistics HTTP/1.1
```

**Example Response**:
```json
{
  "totalCards": 1234,
  "byElement": {
    "Fire": 200,
    "Water": 180,
    "Wind": 190,
    "Norm": 150
  },
  "byRarity": {
    "Common": 600,
    "Uncommon": 400,
    "Rare": 200,
    "Unique": 34
  },
  "byType": {
    "Hero": 34,
    "Action": 500,
    "Ally": 300,
    "Weapon": 200,
    "Item": 200
  },
  "lastUpdated": "2024-01-15T03:00:00Z"
}
```

## Event Endpoints

### List Events

Get a list of tournament events.

**Endpoint**: `GET /api/events`

**Query Parameters**:
- `format` (optional): Filter by format
- `dateFrom` (optional): Start date
- `dateTo` (optional): End date
- `limit` (optional): Results per page (default: 20)
- `offset` (optional): Pagination offset

**Example Request**:
```http
GET /api/events?limit=10 HTTP/1.1
```

**Example Response**:
```json
{
  "events": [
    {
      "id": "event_abc123",
      "name": "Grand Championship 2024",
      "format": "Constructed",
      "date": "2024-01-15T00:00:00Z",
      "location": "Los Angeles, CA",
      "participants": 256,
      "topDecksCount": 8
    }
  ],
  "total": 50
}
```

### Get Event by ID

Get detailed information about a specific event.

**Endpoint**: `GET /api/events/{id}`

**Parameters**:
- `id` (path, required): Event ID

**Example Request**:
```http
GET /api/events/event_abc123 HTTP/1.1
```

**Example Response**:
```json
{
  "event": {
    "id": "event_abc123",
    "name": "Grand Championship 2024",
    "format": "Constructed",
    "date": "2024-01-15T00:00:00Z",
    "location": "Los Angeles, CA",
    "participants": 256,
    "rounds": 9,
    "topDecks": [
      {
        "placement": 1,
        "deckId": "deck_abc123",
        "pilot": "John Smith",
        "hero": "Lorraine"
      }
    ]
  }
}
```

## Development Endpoints

**Note**: These endpoints are only available in local development or when explicitly enabled.

### Health Check

Check API health status.

**Endpoint**: `GET /dev/status`

**Example Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "uptime": 86400
}
```

### Trigger Deck Scraping

Manually trigger deck scraping.

**Endpoint**: `POST /dev/scrape/decks`

**Query Parameters**:
- `maxPages` (optional): Max pages to scrape (default: 5)

**Example Response**:
```json
{
  "status": "started",
  "jobId": "scrape_abc123",
  "estimatedDuration": "5-10 minutes"
}
```

### Trigger Card Scraping

Manually trigger card database update.

**Endpoint**: `POST /dev/scrape/cards`

**Example Response**:
```json
{
  "status": "started",
  "jobId": "card_scrape_abc123"
}
```

### Calculate Meta

Manually trigger meta calculation.

**Endpoint**: `POST /dev/calculate-meta`

**Example Response**:
```json
{
  "status": "completed",
  "formatsProcessed": ["Constructed", "Limited"],
  "duration": "2.5s"
}
```

## Webhooks

**Coming Soon**: Webhook support for real-time notifications.

Planned events:
- New deck added
- Meta snapshot updated
- Card price changed

## SDKs and Libraries

### JavaScript/TypeScript

```typescript
import { GrandArchiveMetaClient } from '@grandarchivemeta/client'

const client = new GrandArchiveMetaClient({
  apiUrl: 'https://api.grandarchivemeta.com',
  apiKey: 'your-api-key' // Future
})

// Get meta data
const meta = await client.meta.getByFormat('Constructed')

// Search cards
const cards = await client.cards.search({ q: 'flame', element: 'Fire' })

// Get decklists
const decks = await client.decks.list({ hero: 'Lorraine', limit: 10 })
```

### Python

```python
from grandarchivemeta import Client

client = Client(
    api_url='https://api.grandarchivemeta.com',
    api_key='your-api-key'  # Future
)

# Get meta data
meta = client.meta.get_by_format('Constructed')

# Search cards
cards = client.cards.search(q='flame', element='Fire')

# Get decklists
decks = client.decks.list(hero='Lorraine', limit=10)
```

## Best Practices

1. **Cache responses** where appropriate (meta data, card info)
2. **Use pagination** for large result sets
3. **Handle rate limits** gracefully
4. **Validate input** before making requests
5. **Include error handling** for all API calls
6. **Use HTTPS** in production
7. **Monitor API usage** to stay within limits

## Support

For API support:
- Documentation: This file
- GitHub Issues: Report bugs or request features
- Discord: Join community for help
- Email: api@grandarchivemeta.com

---

API Version: 1.0
Last Updated: 2024-01-15
