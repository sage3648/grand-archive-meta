use super::ApiClientError;
use crate::models::{Decklist, DecklistCard};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;
use log::{debug, warn};

const API_BASE_URL: &str = "https://omni.gatcg.com/api";

/// Response structure for decklist endpoint
#[derive(Debug, Deserialize, Serialize)]
struct DecklistApiResponse {
    #[serde(default)]
    data: Option<DecklistData>,
}

#[derive(Debug, Deserialize, Serialize)]
struct DecklistData {
    player_id: String,
    player_name: String,
    champion: String,
    rank: i32,
    main_deck: Vec<DeckCardData>,
    sideboard: Option<Vec<DeckCardData>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct DeckCardData {
    slug: String,
    name: String,
    quantity: i32,
    #[serde(rename = "type")]
    card_type: Option<String>,
    element: Option<String>,
    cost: Option<i32>,
}

/// Client for interacting with omni.gatcg.com/api
pub struct OmniWebApiClient {
    client: Client,
    delay: Duration,
    max_retries: u32,
}

impl OmniWebApiClient {
    /// Create a new Omni Web API client with rate limiting
    pub fn new(delay_ms: u64, timeout_secs: u64, max_retries: u32) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(timeout_secs))
            .build()
            .expect("Failed to build HTTP client");

        Self {
            client,
            delay: Duration::from_millis(delay_ms),
            max_retries,
        }
    }

    /// Fetch a player's decklist for a specific event
    pub async fn fetch_decklist(
        &self,
        event_id: i32,
        player_id: &str,
    ) -> Result<Option<Decklist>, ApiClientError> {
        let url = format!(
            "{}/events/{}/decklist?player={}",
            API_BASE_URL, event_id, player_id
        );
        let mut attempt = 0;

        loop {
            attempt += 1;
            debug!(
                "Fetching decklist for player {} at event {} (attempt {}/{})",
                player_id, event_id, attempt, self.max_retries + 1
            );

            match self.client.get(&url).send().await {
                Ok(response) => {
                    let status = response.status();

                    if status.is_success() {
                        match response.json::<DecklistApiResponse>().await {
                            Ok(api_response) => {
                                sleep(self.delay).await;

                                if let Some(data) = api_response.data {
                                    return Ok(Some(self.convert_to_decklist(event_id, data)));
                                } else {
                                    return Ok(None);
                                }
                            }
                            Err(e) => {
                                warn!(
                                    "Failed to deserialize decklist for player {} at event {}: {}",
                                    player_id, event_id, e
                                );
                                return Err(ApiClientError::DeserializationError(e.to_string()));
                            }
                        }
                    } else if status.as_u16() == 404 {
                        sleep(self.delay).await;
                        return Err(ApiClientError::NotFound);
                    } else if status.is_server_error() && attempt <= self.max_retries {
                        warn!(
                            "Server error fetching decklist for player {} at event {}, retrying...",
                            player_id, event_id
                        );
                        sleep(self.delay * 2).await;
                        continue;
                    } else {
                        return Err(ApiClientError::RequestFailed(format!("Status: {}", status)));
                    }
                }
                Err(e) if e.is_timeout() && attempt <= self.max_retries => {
                    warn!(
                        "Timeout fetching decklist for player {} at event {}, retrying...",
                        player_id, event_id
                    );
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) if attempt <= self.max_retries => {
                    warn!(
                        "Error fetching decklist for player {} at event {}: {}, retrying...",
                        player_id, event_id, e
                    );
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) => {
                    return Err(ApiClientError::from(e));
                }
            }
        }
    }

    /// Fetch decklists for multiple players at an event
    pub async fn fetch_decklists(
        &self,
        event_id: i32,
        player_ids: &[String],
    ) -> Result<Vec<Decklist>, ApiClientError> {
        let mut decklists = Vec::new();

        for player_id in player_ids {
            match self.fetch_decklist(event_id, player_id).await {
                Ok(Some(decklist)) => decklists.push(decklist),
                Ok(None) => debug!("No decklist found for player {} at event {}", player_id, event_id),
                Err(ApiClientError::NotFound) => {
                    debug!("Decklist not found (404) for player {} at event {}", player_id, event_id)
                }
                Err(e) => {
                    warn!("Error fetching decklist for player {} at event {}: {}", player_id, event_id, e)
                }
            }
        }

        Ok(decklists)
    }

    /// Convert API decklist data to our Decklist model
    fn convert_to_decklist(&self, event_id: i32, data: DecklistData) -> Decklist {
        let main_deck: Vec<DecklistCard> = data
            .main_deck
            .into_iter()
            .map(|card| DecklistCard {
                slug: card.slug,
                name: card.name,
                quantity: card.quantity,
                card_type: card.card_type,
                element: card.element,
                cost: card.cost,
            })
            .collect();

        let sideboard: Vec<DecklistCard> = data
            .sideboard
            .unwrap_or_default()
            .into_iter()
            .map(|card| DecklistCard {
                slug: card.slug,
                name: card.name,
                quantity: card.quantity,
                card_type: card.card_type,
                element: card.element,
                cost: card.cost,
            })
            .collect();

        let main_deck_count = main_deck.iter().map(|c| c.quantity).sum();
        let sideboard_count = sideboard.iter().map(|c| c.quantity).sum();

        let mut decklist = Decklist {
            id: None,
            event_id,
            player_id: data.player_id,
            player_name: data.player_name,
            champion: data.champion,
            rank: data.rank,
            main_deck,
            sideboard,
            main_deck_count,
            sideboard_count,
            card_frequencies: None,
            updated_at: chrono::Utc::now(),
        };

        decklist.calculate_frequencies();
        decklist
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires network access
    async fn test_fetch_decklist() {
        let client = OmniWebApiClient::new(500, 10, 3);
        // Replace with actual event_id and player_id
        let result = client.fetch_decklist(1, "player123").await;
        // Note: This will likely return NotFound unless you have real data
        assert!(result.is_ok() || matches!(result, Err(ApiClientError::NotFound)));
    }
}
