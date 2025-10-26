use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

/// Event format type
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum EventFormat {
    Standard,
    Limited,
    Sealed,
    Draft,
    #[serde(other)]
    Unknown,
}

impl EventFormat {
    pub fn from_str(s: &str) -> Self {
        match s.to_uppercase().as_str() {
            "STANDARD" => EventFormat::Standard,
            "LIMITED" => EventFormat::Limited,
            "SEALED" => EventFormat::Sealed,
            "DRAFT" => EventFormat::Draft,
            _ => EventFormat::Unknown,
        }
    }
}

/// Represents a tournament event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Event {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Event ID from the Omnidex API
    pub event_id: i32,

    /// Event name
    pub name: String,

    /// Event format
    pub format: EventFormat,

    /// Event status (e.g., "complete", "active", "upcoming")
    pub status: String,

    /// Whether the event is ranked
    pub ranked: bool,

    /// Number of players
    pub player_count: i32,

    /// Event start date
    #[serde(
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub start_date: Option<DateTime<Utc>>,

    /// Event end date
    #[serde(
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub end_date: Option<DateTime<Utc>>,

    /// Event location/venue
    #[serde(skip_serializing_if = "Option::is_none")]
    pub location: Option<String>,

    /// Event organizer
    #[serde(skip_serializing_if = "Option::is_none")]
    pub organizer: Option<String>,

    /// Number of rounds
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rounds: Option<i32>,

    /// Whether decklists are available
    pub has_decklists: bool,

    /// Event tier/level
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tier: Option<String>,

    /// Last updated timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub updated_at: DateTime<Utc>,

    /// Last crawled timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub crawled_at: DateTime<Utc>,
}

#[allow(dead_code)]
impl Event {
    /// Create a new Event instance
    pub fn new(event_id: i32, name: String, format: EventFormat, status: String) -> Self {
        Self {
            id: None,
            event_id,
            name,
            format,
            status,
            ranked: false,
            player_count: 0,
            start_date: None,
            end_date: None,
            location: None,
            organizer: None,
            rounds: None,
            has_decklists: false,
            tier: None,
            updated_at: Utc::now(),
            crawled_at: Utc::now(),
        }
    }

    /// Check if event is "interesting" for meta analysis
    /// Criteria: completed, ranked, and either has decklists or >60 players
    pub fn is_interesting(&self) -> bool {
        self.status.to_lowercase() == "complete"
            && self.ranked
            && (self.has_decklists || self.player_count > 60)
    }
}

/// Response structure for event list queries
#[derive(Debug, Serialize, Deserialize)]
pub struct EventListResponse {
    pub events: Vec<Event>,
    pub total: usize,
}

/// Response structure for single event queries
#[derive(Debug, Serialize, Deserialize)]
pub struct EventResponse {
    pub event: Event,
}

/// Crawler state tracking
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CrawlerState {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Last event ID successfully crawled
    pub last_event_id: i32,

    /// Total events discovered
    pub total_events: i32,

    /// Last crawl timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub last_crawl: DateTime<Utc>,

    /// Crawl type (e.g., "incremental", "full")
    pub crawl_type: String,
}
