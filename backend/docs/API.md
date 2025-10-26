# API Documentation

## Base URL
```
http://localhost:8080/api
```

## Authentication
Currently, the API does not require authentication. This may be added in future versions.

## Response Format
All responses are JSON formatted with appropriate HTTP status codes.

### Success Response
```json
{
  "data": { ... },
  "total": 42
}
```

### Error Response
```json
{
  "error": "Error message description"
}
```

## Endpoints

### Health Check

#### GET /health
Check service health and database connectivity.

**Response**
```json
{
  "status": "ok",
  "database": "connected",
  "version": "0.1.0"
}
```

---

### Champions

#### GET /champions
List all available champions.

**Response**
```json
{
  "champions": [
    {
      "slug": "lorraine",
      "name": "Lorraine, Crux Knight",
      "element": "Arcane",
      "class": "Warrior",
      "image_url": "https://...",
      "life": 25,
      "intellect": 3,
      "updated_at": "2025-10-26T00:00:00Z"
    }
  ],
  "total": 15
}
```

#### GET /champions/{slug}
Get a specific champion by slug.

**Parameters**
- `slug` (path): Champion slug identifier

**Response**
```json
{
  "champion": {
    "slug": "lorraine",
    "name": "Lorraine, Crux Knight",
    "element": "Arcane",
    "class": "Warrior",
    "image_url": "https://...",
    "life": 25,
    "intellect": 3,
    "updated_at": "2025-10-26T00:00:00Z"
  }
}
```

---

### Events

#### GET /events
List events with optional filters.

**Query Parameters**
- `format` (optional): Event format (STANDARD, LIMITED, SEALED, DRAFT)
- `days` (optional): Filter events from last N days
- `minPlayers` (optional): Minimum player count

**Example**
```
GET /events?format=STANDARD&days=30&minPlayers=50
```

**Response**
```json
{
  "events": [
    {
      "event_id": 123,
      "name": "Grand Archive Nationals 2025",
      "format": "STANDARD",
      "status": "complete",
      "ranked": true,
      "player_count": 128,
      "start_date": "2025-10-20T10:00:00Z",
      "end_date": "2025-10-20T18:00:00Z",
      "location": "Los Angeles, CA",
      "has_decklists": true,
      "tier": "National",
      "updated_at": "2025-10-21T00:00:00Z"
    }
  ],
  "total": 42
}
```

#### GET /events/{event_id}
Get a specific event by ID.

**Parameters**
- `event_id` (path): Event identifier

**Response**
```json
{
  "event": {
    "event_id": 123,
    "name": "Grand Archive Nationals 2025",
    "format": "STANDARD",
    "status": "complete",
    "ranked": true,
    "player_count": 128,
    "start_date": "2025-10-20T10:00:00Z",
    "location": "Los Angeles, CA",
    "has_decklists": true
  }
}
```

#### GET /events/{event_id}/standings
Get standings for a specific event.

**Parameters**
- `event_id` (path): Event identifier

**Response**
```json
{
  "standings": [
    {
      "event_id": 123,
      "player_id": "player123",
      "player_name": "John Doe",
      "rank": 1,
      "champion": "lorraine",
      "wins": 8,
      "losses": 0,
      "draws": 1,
      "match_win_rate": 0.944,
      "has_decklist": true
    }
  ],
  "total": 128
}
```

---

### Decklists

#### GET /decklists
List decklists with optional filters.

**Query Parameters**
- `champion` (optional): Filter by champion slug
- `format` (optional): Filter by event format
- `days` (optional): Filter from last N days
- `limit` (optional): Maximum results to return

**Example**
```
GET /decklists?champion=lorraine&days=30&limit=50
```

**Response**
```json
{
  "decklists": [
    {
      "event_id": 123,
      "player_id": "player123",
      "player_name": "John Doe",
      "champion": "lorraine",
      "rank": 1,
      "main_deck": [
        {
          "slug": "dream-control",
          "name": "Dream Control",
          "quantity": 3,
          "card_type": "Action",
          "element": "Arcane",
          "cost": 2
        }
      ],
      "sideboard": [],
      "main_deck_count": 60,
      "sideboard_count": 0,
      "updated_at": "2025-10-21T00:00:00Z"
    }
  ],
  "total": 42
}
```

#### GET /decklists/{player_id}
Get all decklists for a specific player.

**Parameters**
- `player_id` (path): Player identifier

**Query Parameters**
- `event` (optional): Filter by specific event ID

**Example**
```
GET /decklists/player123?event=123
```

**Response**
```json
{
  "decklist": {
    "event_id": 123,
    "player_id": "player123",
    "player_name": "John Doe",
    "champion": "lorraine",
    "rank": 1,
    "main_deck": [...],
    "sideboard": []
  }
}
```

---

### Meta Analysis

#### GET /meta/breakdown
Get champion meta breakdown statistics.

**Query Parameters**
- `format` (optional): Filter by format
- `days` (optional): Filter from last N days (default: all time)

**Example**
```
GET /meta/breakdown?format=STANDARD&days=30
```

**Response**
```json
{
  "breakdown": [
    {
      "champion": "lorraine",
      "deck_count": 45,
      "meta_percentage": 23.5,
      "avg_placement": 15.2,
      "top_8_count": 12,
      "top_8_percentage": 26.7
    }
  ],
  "total": 15
}
```

#### GET /meta/champion-performance
Get overall champion performance metrics.

**Query Parameters**
- `days` (optional): Filter from last N days

**Example**
```
GET /meta/champion-performance?days=90
```

**Response**
```json
{
  "champions": [
    {
      "champion": "lorraine",
      "total_appearances": 245,
      "total_events": 52,
      "avg_placement": 18.5,
      "win_rate": 0.58,
      "top_8_rate": 15.3,
      "top_16_rate": 28.6,
      "conversion_rate": 15.3
    }
  ],
  "total": 15
}
```

---

### Cards

#### GET /cards/performance
Get card performance statistics.

**Query Parameters**
- `format` (optional): Filter by format
- `days` (optional): Filter from last N days
- `limit` (optional): Maximum results to return (default: 100)

**Example**
```
GET /cards/performance?format=STANDARD&days=30&limit=50
```

**Response**
```json
{
  "cards": [
    {
      "slug": "dream-control",
      "name": "Dream Control",
      "deck_count": 128,
      "meta_percentage": 67.4,
      "avg_quantity": 2.8,
      "avg_placement": 16.2
    }
  ],
  "total": 50
}
```

---

## Rate Limiting

Currently, the API does not implement rate limiting. This may be added in future versions.

## CORS

The API supports CORS for localhost and HTTPS origins. Allowed methods: GET, POST, PUT, DELETE, OPTIONS.

## Caching

Successful GET responses include `Cache-Control` headers with a 1-hour TTL (configurable).

## Error Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Changelog

### Version 0.1.0
- Initial release
- Basic CRUD operations for champions, events, decklists
- Meta analysis endpoints
- Health check endpoint
