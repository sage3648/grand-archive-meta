use super::ApiClientError;
use crate::models::{Event, EventFormat, Standing};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;
use log::{debug, warn};

const API_BASE_URL: &str = "https://api.gatcg.com/omnidex";

/// Response structure for event endpoint
#[derive(Debug, Deserialize, Serialize)]
struct EventApiResponse {
    #[serde(default)]
    data: Option<EventData>,
}

#[derive(Debug, Deserialize, Serialize)]
struct EventData {
    id: i32,
    name: String,
    format: String,
    status: String,
    #[serde(default)]
    ranked: bool,
    #[serde(default)]
    player_count: i32,
    start_date: Option<String>,
    end_date: Option<String>,
    location: Option<String>,
    organizer: Option<String>,
    rounds: Option<i32>,
    tier: Option<String>,
}

/// Response structure for standings endpoint
#[derive(Debug, Deserialize, Serialize)]
struct StandingsApiResponse {
    #[serde(default)]
    data: Option<Vec<StandingData>>,
}

#[derive(Debug, Deserialize, Serialize)]
struct StandingData {
    player_id: String,
    player_name: String,
    rank: i32,
    champion: String,
    wins: i32,
    losses: i32,
    draws: i32,
    has_decklist: Option<bool>,
}

/// Response structure for statistics endpoint
#[derive(Debug, Deserialize, Serialize)]
struct StatisticsApiResponse {
    #[serde(default)]
    data: Option<StatisticsData>,
}

#[derive(Debug, Deserialize, Serialize)]
struct StatisticsData {
    total_players: i32,
    has_decklists: bool,
}

/// Client for interacting with api.gatcg.com/omnidex
pub struct OmnidexApiClient {
    client: Client,
    delay: Duration,
    max_retries: u32,
}

impl OmnidexApiClient {
    /// Create a new Omnidex API client with rate limiting
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

    /// Fetch event by ID with retry logic
    pub async fn fetch_event(&self, event_id: i32) -> Result<Option<Event>, ApiClientError> {
        let url = format!("{}/events/{}", API_BASE_URL, event_id);
        let mut attempt = 0;

        loop {
            attempt += 1;
            debug!("Fetching event {} (attempt {}/{})", event_id, attempt, self.max_retries + 1);

            match self.client.get(&url).send().await {
                Ok(response) => {
                    let status = response.status();

                    if status.is_success() {
                        match response.json::<EventApiResponse>().await {
                            Ok(api_response) => {
                                sleep(self.delay).await;

                                if let Some(data) = api_response.data {
                                    return Ok(Some(self.convert_to_event(data)));
                                } else {
                                    return Ok(None);
                                }
                            }
                            Err(e) => {
                                warn!("Failed to deserialize event {}: {}", event_id, e);
                                return Err(ApiClientError::DeserializationError(e.to_string()));
                            }
                        }
                    } else if status.as_u16() == 404 {
                        sleep(self.delay).await;
                        return Err(ApiClientError::NotFound);
                    } else if status.is_server_error() && attempt <= self.max_retries {
                        warn!("Server error for event {}, retrying...", event_id);
                        sleep(self.delay * 2).await;
                        continue;
                    } else {
                        return Err(ApiClientError::RequestFailed(format!("Status: {}", status)));
                    }
                }
                Err(e) if e.is_timeout() && attempt <= self.max_retries => {
                    warn!("Timeout fetching event {}, retrying...", event_id);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) if attempt <= self.max_retries => {
                    warn!("Error fetching event {}: {}, retrying...", event_id, e);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) => {
                    return Err(ApiClientError::from(e));
                }
            }
        }
    }

    /// Fetch standings for an event
    pub async fn fetch_standings(&self, event_id: i32) -> Result<Vec<Standing>, ApiClientError> {
        let url = format!("{}/events/{}/standings", API_BASE_URL, event_id);
        let mut attempt = 0;

        loop {
            attempt += 1;
            debug!("Fetching standings for event {} (attempt {}/{})", event_id, attempt, self.max_retries + 1);

            match self.client.get(&url).send().await {
                Ok(response) => {
                    let status = response.status();

                    if status.is_success() {
                        match response.json::<StandingsApiResponse>().await {
                            Ok(api_response) => {
                                sleep(self.delay).await;

                                if let Some(data) = api_response.data {
                                    return Ok(data.into_iter()
                                        .map(|s| self.convert_to_standing(event_id, s))
                                        .collect());
                                } else {
                                    return Ok(Vec::new());
                                }
                            }
                            Err(e) => {
                                warn!("Failed to deserialize standings for event {}: {}", event_id, e);
                                return Err(ApiClientError::DeserializationError(e.to_string()));
                            }
                        }
                    } else if status.as_u16() == 404 {
                        sleep(self.delay).await;
                        return Ok(Vec::new());
                    } else if status.is_server_error() && attempt <= self.max_retries {
                        warn!("Server error fetching standings for event {}, retrying...", event_id);
                        sleep(self.delay * 2).await;
                        continue;
                    } else {
                        return Err(ApiClientError::RequestFailed(format!("Status: {}", status)));
                    }
                }
                Err(e) if e.is_timeout() && attempt <= self.max_retries => {
                    warn!("Timeout fetching standings for event {}, retrying...", event_id);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) if attempt <= self.max_retries => {
                    warn!("Error fetching standings for event {}: {}, retrying...", event_id, e);
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(e) => {
                    return Err(ApiClientError::from(e));
                }
            }
        }
    }

    /// Fetch event statistics (player count, decklist availability)
    pub async fn fetch_event_statistics(&self, event_id: i32) -> Result<Option<(i32, bool)>, ApiClientError> {
        let url = format!("{}/events/{}/statistics", API_BASE_URL, event_id);
        let mut attempt = 0;

        loop {
            attempt += 1;

            match self.client.get(&url).send().await {
                Ok(response) => {
                    let status = response.status();

                    if status.is_success() {
                        match response.json::<StatisticsApiResponse>().await {
                            Ok(api_response) => {
                                sleep(self.delay).await;

                                if let Some(data) = api_response.data {
                                    return Ok(Some((data.total_players, data.has_decklists)));
                                } else {
                                    return Ok(None);
                                }
                            }
                            Err(_) => {
                                sleep(self.delay).await;
                                return Ok(None);
                            }
                        }
                    } else if status.as_u16() == 404 {
                        sleep(self.delay).await;
                        return Ok(None);
                    } else if status.is_server_error() && attempt <= self.max_retries {
                        sleep(self.delay * 2).await;
                        continue;
                    } else {
                        return Ok(None);
                    }
                }
                Err(_) if attempt <= self.max_retries => {
                    sleep(self.delay * 2).await;
                    continue;
                }
                Err(_) => {
                    return Ok(None);
                }
            }
        }
    }

    /// Convert API event data to our Event model
    fn convert_to_event(&self, data: EventData) -> Event {
        let format = EventFormat::from_str(&data.format);

        let start_date = data.start_date
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
            .map(|dt| dt.with_timezone(&chrono::Utc));

        let end_date = data.end_date
            .and_then(|s| chrono::DateTime::parse_from_rfc3339(&s).ok())
            .map(|dt| dt.with_timezone(&chrono::Utc));

        Event {
            id: None,
            event_id: data.id,
            name: data.name,
            format,
            status: data.status,
            ranked: data.ranked,
            player_count: data.player_count,
            start_date,
            end_date,
            location: data.location,
            organizer: data.organizer,
            rounds: data.rounds,
            has_decklists: false,
            tier: data.tier,
            updated_at: chrono::Utc::now(),
            crawled_at: chrono::Utc::now(),
        }
    }

    /// Convert API standing data to our Standing model
    fn convert_to_standing(&self, event_id: i32, data: StandingData) -> Standing {
        let mut standing = Standing::new(
            event_id,
            data.player_id,
            data.player_name,
            data.rank,
            data.champion,
        );

        standing.wins = data.wins;
        standing.losses = data.losses;
        standing.draws = data.draws;
        standing.has_decklist = data.has_decklist.unwrap_or(false);
        standing.calculate_win_rate();

        standing
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore] // Requires network access
    async fn test_fetch_event() {
        let client = OmnidexApiClient::new(500, 10, 3);
        let result = client.fetch_event(1).await;
        assert!(result.is_ok());
    }
}
