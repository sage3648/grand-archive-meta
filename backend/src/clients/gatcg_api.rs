use super::ApiClientError;
use crate::models::Card;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;
use log::{debug, warn};

const API_BASE_URL: &str = "https://api.gatcg.com";

/// Response structure from the GATCG cards API
#[derive(Debug, Deserialize, Serialize)]
struct CardApiResponse {
    #[serde(default)]
    data: Option<CardData>,
}

#[derive(Debug, Deserialize, Serialize)]
struct CardData {
    slug: String,
    name: String,
    #[serde(rename = "type")]
    card_type: Option<String>,
    element: Option<String>,
    classes: Option<Vec<String>>,
    cost: Option<i32>,
    reserve_cost: Option<i32>,
    power: Option<i32>,
    life_modifier: Option<i32>,
    effect_text: Option<String>,
    flavor_text: Option<String>,
    image_url: Option<String>,
    set: Option<String>,
    collector_number: Option<String>,
    rarity: Option<String>,
    artist: Option<String>,
    subtypes: Option<Vec<String>>,
}

/// Client for interacting with api.gatcg.com/cards
pub struct GatcgApiClient {
    client: Client,
    delay: Duration,
    max_retries: u32,
}

impl GatcgApiClient {
    /// Create a new GATCG API client with rate limiting
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

    /// Fetch a card by its slug with retry logic
    pub async fn fetch_card(&self, slug: &str) -> Result<Option<Card>, ApiClientError> {
        let url = format!("{}/cards/{}", API_BASE_URL, slug);
        let mut attempt = 0;

        loop {
            attempt += 1;
            debug!("Fetching card '{}' (attempt {}/{})", slug, attempt, self.max_retries + 1);

            match self.client.get(&url).send().await {
                Ok(response) => {
                    let status = response.status();

                    if status.is_success() {
                        match response.json::<CardApiResponse>().await {
                            Ok(api_response) => {
                                sleep(self.delay).await;

                                if let Some(data) = api_response.data {
                                    return Ok(Some(self.convert_to_card(data)));
                                } else {
                                    debug!("No data found for card '{}'", slug);
                                    return Ok(None);
                                }
                            }
                            Err(e) => {
                                warn!("Failed to deserialize card '{}': {}", slug, e);
                                return Err(ApiClientError::DeserializationError(e.to_string()));
                            }
                        }
                    } else if status.as_u16() == 404 {
                        sleep(self.delay).await;
                        return Err(ApiClientError::NotFound);
                    } else if status.is_server_error() && attempt <= self.max_retries {
                        warn!("Server error for card '{}', retrying...", slug);
                        sleep(self.delay * 2).await;
                        continue;
                    } else {
                        return Err(ApiClientError::RequestFailed(format!("Status: {}", status)));
                    }
                }
                Err(e) if e.is_timeout() && attempt <= self.max_retries => {
                    warn!("Timeout fetching card '{}', retrying...", slug);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) if attempt <= self.max_retries => {
                    warn!("Error fetching card '{}': {}, retrying...", slug, e);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) => {
                    return Err(ApiClientError::from(e));
                }
            }
        }
    }

    /// Fetch multiple cards by slugs
    #[allow(dead_code)]
    pub async fn fetch_cards(&self, slugs: &[String]) -> Result<Vec<Card>, ApiClientError> {
        let mut cards = Vec::new();

        for slug in slugs {
            match self.fetch_card(slug).await {
                Ok(Some(card)) => cards.push(card),
                Ok(None) => debug!("Card '{}' not found", slug),
                Err(ApiClientError::NotFound) => debug!("Card '{}' not found (404)", slug),
                Err(e) => warn!("Error fetching card '{}': {}", slug, e),
            }
        }

        Ok(cards)
    }

    /// Convert API response data to our Card model
    fn convert_to_card(&self, data: CardData) -> Card {
        Card {
            id: None,
            slug: data.slug,
            name: data.name,
            card_type: data.card_type,
            element: data.element,
            classes: data.classes,
            cost: data.cost,
            reserve_cost: data.reserve_cost,
            power: data.power,
            life_modifier: data.life_modifier,
            card_text: data.effect_text,
            flavor_text: data.flavor_text,
            image_url: data.image_url,
            set_name: data.set,
            card_number: data.collector_number,
            rarity: data.rarity,
            artist: data.artist,
            subtypes: data.subtypes,
            banned_standard: false,
            banned_limited: false,
            updated_at: chrono::Utc::now(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires network access
    async fn test_fetch_card() {
        let client = GatcgApiClient::new(500, 10, 3);
        let result = client.fetch_card("lorraine-crux-knight").await;
        assert!(result.is_ok());
    }
}
