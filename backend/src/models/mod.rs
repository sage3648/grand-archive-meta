pub mod champion;
pub mod event;
pub mod standing;
pub mod decklist;
pub mod card;

pub use champion::{Champion, ChampionListResponse, ChampionResponse};
pub use event::{Event, EventFormat, EventListResponse, EventResponse, CrawlerState};
pub use standing::{Standing, StandingListResponse};
pub use decklist::{Decklist, DecklistCard, DecklistListResponse, DecklistResponse};
pub use card::{Card, CardPerformance, CardPerformanceResponse};

use thiserror::Error;

#[allow(dead_code)]
#[derive(Error, Debug)]
pub enum ModelError {
    #[error("Database error: {0}")]
    Database(String),

    #[error("Serialization error: {0}")]
    Serialization(String),

    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Invalid data: {0}")]
    InvalidData(String),
}

impl From<mongodb::error::Error> for ModelError {
    fn from(err: mongodb::error::Error) -> Self {
        ModelError::Database(err.to_string())
    }
}

impl From<bson::ser::Error> for ModelError {
    fn from(err: bson::ser::Error) -> Self {
        ModelError::Serialization(err.to_string())
    }
}

impl From<bson::de::Error> for ModelError {
    fn from(err: bson::de::Error) -> Self {
        ModelError::Serialization(err.to_string())
    }
}
