use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

/// Card entry in a decklist
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DecklistCard {
    /// Card slug
    pub slug: String,

    /// Card name
    pub name: String,

    /// Quantity in deck
    pub quantity: i32,

    /// Card type (e.g., "Action", "Attack", "Ally")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub card_type: Option<String>,

    /// Card element
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element: Option<String>,

    /// Card cost
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost: Option<i32>,
}

/// Represents a player's decklist for an event
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Decklist {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Reference to the event
    pub event_id: i32,

    /// Player ID from Omnidex
    pub player_id: String,

    /// Player name
    pub player_name: String,

    /// Champion slug
    pub champion: String,

    /// Player's final rank in the event
    pub rank: i32,

    /// Main deck cards (60 cards)
    pub main_deck: Vec<DecklistCard>,

    /// Sideboard/Materialdeck cards (up to 15 cards)
    pub sideboard: Vec<DecklistCard>,

    /// Total cards in main deck
    pub main_deck_count: i32,

    /// Total cards in sideboard
    pub sideboard_count: i32,

    /// Card frequency map for analysis (slug -> quantity)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub card_frequencies: Option<HashMap<String, i32>>,

    /// Last updated timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub updated_at: DateTime<Utc>,
}

#[allow(dead_code)]
impl Decklist {
    /// Create a new Decklist instance
    pub fn new(
        event_id: i32,
        player_id: String,
        player_name: String,
        champion: String,
        rank: i32,
    ) -> Self {
        Self {
            id: None,
            event_id,
            player_id,
            player_name,
            champion,
            rank,
            main_deck: Vec::new(),
            sideboard: Vec::new(),
            main_deck_count: 0,
            sideboard_count: 0,
            card_frequencies: None,
            updated_at: Utc::now(),
        }
    }

    /// Calculate card frequencies for meta analysis
    pub fn calculate_frequencies(&mut self) {
        let mut frequencies = HashMap::new();

        for card in &self.main_deck {
            *frequencies.entry(card.slug.clone()).or_insert(0) += card.quantity;
        }

        for card in &self.sideboard {
            *frequencies.entry(card.slug.clone()).or_insert(0) += card.quantity;
        }

        self.card_frequencies = Some(frequencies);
    }

    /// Validate deck size constraints
    pub fn is_valid(&self) -> bool {
        self.main_deck_count >= 60 && self.sideboard_count <= 15
    }
}

/// Response structure for decklist queries
#[derive(Debug, Serialize, Deserialize)]
pub struct DecklistListResponse {
    pub decklists: Vec<Decklist>,
    pub total: usize,
}

/// Response structure for single decklist queries
#[derive(Debug, Serialize, Deserialize)]
pub struct DecklistResponse {
    pub decklist: Decklist,
}
