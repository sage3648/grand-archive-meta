use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

/// Represents a Grand Archive card
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Card {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Unique slug identifier
    pub slug: String,

    /// Card name
    pub name: String,

    /// Card type (e.g., "Action", "Attack", "Ally", "Item")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub card_type: Option<String>,

    /// Card element
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element: Option<String>,

    /// Card classes (array of applicable classes)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub classes: Option<Vec<String>>,

    /// Memory cost
    #[serde(skip_serializing_if = "Option::is_none")]
    pub cost: Option<i32>,

    /// Reserve cost
    #[serde(skip_serializing_if = "Option::is_none")]
    pub reserve_cost: Option<i32>,

    /// Power value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub power: Option<i32>,

    /// Life modifier
    #[serde(skip_serializing_if = "Option::is_none")]
    pub life_modifier: Option<i32>,

    /// Card text
    #[serde(skip_serializing_if = "Option::is_none")]
    pub card_text: Option<String>,

    /// Flavor text
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flavor_text: Option<String>,

    /// Card image URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,

    /// Set name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub set_name: Option<String>,

    /// Card number in set
    #[serde(skip_serializing_if = "Option::is_none")]
    pub card_number: Option<String>,

    /// Rarity
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rarity: Option<String>,

    /// Artist name
    #[serde(skip_serializing_if = "Option::is_none")]
    pub artist: Option<String>,

    /// Card subtypes
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subtypes: Option<Vec<String>>,

    /// Whether card is banned in Standard
    #[serde(default)]
    pub banned_standard: bool,

    /// Whether card is banned in Limited
    #[serde(default)]
    pub banned_limited: bool,

    /// Last updated timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub updated_at: DateTime<Utc>,
}

#[allow(dead_code)]
impl Card {
    /// Create a new Card instance
    pub fn new(slug: String, name: String) -> Self {
        Self {
            id: None,
            slug,
            name,
            card_type: None,
            element: None,
            classes: None,
            cost: None,
            reserve_cost: None,
            power: None,
            life_modifier: None,
            card_text: None,
            flavor_text: None,
            image_url: None,
            set_name: None,
            card_number: None,
            rarity: None,
            artist: None,
            subtypes: None,
            banned_standard: false,
            banned_limited: false,
            updated_at: Utc::now(),
        }
    }
}

/// Card performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardPerformance {
    /// Card slug
    pub slug: String,

    /// Card name
    pub name: String,

    /// Number of decklists including this card
    pub deck_count: i32,

    /// Percentage of total decklists (meta share)
    pub meta_percentage: f64,

    /// Average quantity per deck that includes it
    pub avg_quantity: f64,

    /// Win rate of decks including this card
    #[serde(skip_serializing_if = "Option::is_none")]
    pub win_rate: Option<f64>,

    /// Average placement of decks including this card
    #[serde(skip_serializing_if = "Option::is_none")]
    pub avg_placement: Option<f64>,
}

/// Response structure for card performance queries
#[derive(Debug, Serialize, Deserialize)]
pub struct CardPerformanceResponse {
    pub cards: Vec<CardPerformance>,
    pub total: usize,
}
