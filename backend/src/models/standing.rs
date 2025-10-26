use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

/// Represents a player's standing in an event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Standing {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Reference to the event
    pub event_id: i32,

    /// Player ID from Omnidex
    pub player_id: String,

    /// Player name
    pub player_name: String,

    /// Final placement/rank
    pub rank: i32,

    /// Champion slug used
    pub champion: String,

    /// Number of wins
    pub wins: i32,

    /// Number of losses
    pub losses: i32,

    /// Number of draws
    pub draws: i32,

    /// Match win percentage
    #[serde(skip_serializing_if = "Option::is_none")]
    pub match_win_rate: Option<f64>,

    /// Whether a decklist is available
    pub has_decklist: bool,

    /// Last updated timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub updated_at: DateTime<Utc>,
}

impl Standing {
    /// Create a new Standing instance
    pub fn new(
        event_id: i32,
        player_id: String,
        player_name: String,
        rank: i32,
        champion: String,
    ) -> Self {
        Self {
            id: None,
            event_id,
            player_id,
            player_name,
            rank,
            champion,
            wins: 0,
            losses: 0,
            draws: 0,
            match_win_rate: None,
            has_decklist: false,
            updated_at: Utc::now(),
        }
    }

    /// Calculate match win rate
    pub fn calculate_win_rate(&mut self) {
        let total_matches = self.wins + self.losses + self.draws;
        if total_matches > 0 {
            self.match_win_rate = Some((self.wins as f64) / (total_matches as f64));
        }
    }
}

/// Response structure for standings list queries
#[derive(Debug, Serialize, Deserialize)]
pub struct StandingListResponse {
    pub standings: Vec<Standing>,
    pub total: usize,
}
