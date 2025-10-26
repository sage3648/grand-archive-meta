use serde::{Deserialize, Serialize};
use bson::oid::ObjectId;
use chrono::{DateTime, Utc};

/// Represents a champion/class in Grand Archive
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Champion {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    /// Unique slug identifier (e.g., "lorraine")
    pub slug: String,

    /// Display name (e.g., "Lorraine, Crux Knight")
    pub name: String,

    /// Champion element (e.g., "Arcane", "Fire", "Wind")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub element: Option<String>,

    /// Champion class (e.g., "Warrior", "Mage", "Guardian")
    #[serde(skip_serializing_if = "Option::is_none")]
    pub class: Option<String>,

    /// Card image URL
    #[serde(skip_serializing_if = "Option::is_none")]
    pub image_url: Option<String>,

    /// Card text/ability
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ability_text: Option<String>,

    /// Life total
    #[serde(skip_serializing_if = "Option::is_none")]
    pub life: Option<i32>,

    /// Intellect value
    #[serde(skip_serializing_if = "Option::is_none")]
    pub intellect: Option<i32>,

    /// Last updated timestamp
    #[serde(with = "bson::serde_helpers::chrono_datetime_as_bson_datetime")]
    pub updated_at: DateTime<Utc>,
}

#[allow(dead_code)]
impl Champion {
    /// Create a new Champion instance
    pub fn new(slug: String, name: String) -> Self {
        Self {
            id: None,
            slug,
            name,
            element: None,
            class: None,
            image_url: None,
            ability_text: None,
            life: None,
            intellect: None,
            updated_at: Utc::now(),
        }
    }
}

/// Response structure for champion list queries
#[derive(Debug, Serialize, Deserialize)]
pub struct ChampionListResponse {
    pub champions: Vec<Champion>,
    pub total: usize,
}

/// Response structure for single champion queries
#[derive(Debug, Serialize, Deserialize)]
pub struct ChampionResponse {
    pub champion: Champion,
}
