use crate::clients::{ApiClientError, OmnidexApiClient, OmniWebApiClient};
use crate::models::{Event, Standing, Decklist, CrawlerState};
use mongodb::{Database, Collection};
use mongodb::bson::doc;
use log::{info, warn, error, debug};
use chrono::Utc;
use std::sync::Arc;

/// Service for crawling events from the Omnidex API
/// Uses sequential discovery since no list endpoint exists
pub struct EventCrawler {
    omnidex_client: Arc<OmnidexApiClient>,
    omni_web_client: Arc<OmniWebApiClient>,
    database: Database,
    max_404s: i32,
}

impl EventCrawler {
    /// Create a new event crawler
    pub fn new(
        omnidex_client: Arc<OmnidexApiClient>,
        omni_web_client: Arc<OmniWebApiClient>,
        database: Database,
        max_404s: i32,
    ) -> Self {
        Self {
            omnidex_client,
            omni_web_client,
            database,
            max_404s,
        }
    }

    /// Crawl events starting from a specific ID until max_404s consecutive 404s
    /// This is used for historical backfill
    pub async fn crawl_historical_events(&self, start_id: i32) -> Result<i32, Box<dyn std::error::Error>> {
        info!("Starting historical event crawl from event ID {}", start_id);

        let events_collection: Collection<Event> = self.database.collection("events");
        let standings_collection: Collection<Standing> = self.database.collection("standings");
        let decklists_collection: Collection<Decklist> = self.database.collection("decklists");
        let crawler_collection: Collection<CrawlerState> = self.database.collection("crawler_state");

        let mut current_id = start_id;
        let mut consecutive_404s = 0;
        let mut events_found = 0;

        while consecutive_404s < self.max_404s {
            debug!("Checking event ID: {}", current_id);

            match self.omnidex_client.fetch_event(current_id).await {
                Ok(Some(mut event)) => {
                    consecutive_404s = 0;
                    events_found += 1;

                    info!("Found event {}: {}", event.event_id, event.name);

                    // Fetch additional statistics if available
                    if let Ok(Some((player_count, has_decklists))) =
                        self.omnidex_client.fetch_event_statistics(current_id).await
                    {
                        event.player_count = player_count;
                        event.has_decklists = has_decklists;
                    }

                    // Only crawl details for interesting events
                    if event.is_interesting() {
                        info!("Event {} is interesting, fetching details...", event.event_id);

                        // Fetch standings
                        match self.omnidex_client.fetch_standings(current_id).await {
                            Ok(standings) => {
                                info!("Found {} standings for event {}", standings.len(), event.event_id);

                                // Save standings
                                for standing in &standings {
                                    let filter = doc! {
                                        "event_id": standing.event_id,
                                        "player_id": &standing.player_id
                                    };
                                    let update = doc! {
                                        "$set": mongodb::bson::to_document(&standing)?
                                    };
                                    use mongodb::options::UpdateOptions;
                                    let options = UpdateOptions::builder().upsert(true).build();
                                    standings_collection
                                        .update_one(filter, update, options)
                                        .await?;
                                }

                                // Fetch decklists if available
                                if event.has_decklists {
                                    let player_ids: Vec<String> = standings
                                        .iter()
                                        .filter(|s| s.has_decklist)
                                        .map(|s| s.player_id.clone())
                                        .collect();

                                    info!("Fetching {} decklists for event {}", player_ids.len(), event.event_id);

                                    match self.omni_web_client.fetch_decklists(current_id, &player_ids).await {
                                        Ok(decklists) => {
                                            info!("Found {} decklists for event {}", decklists.len(), event.event_id);

                                            for decklist in decklists {
                                                let filter = doc! {
                                                    "event_id": decklist.event_id,
                                                    "player_id": &decklist.player_id
                                                };
                                                let update = doc! {
                                                    "$set": mongodb::bson::to_document(&decklist)?
                                                };
                                                use mongodb::options::UpdateOptions;
                                                let options = UpdateOptions::builder().upsert(true).build();
                                                decklists_collection
                                                    .update_one(filter, update, options)
                                                    .await?;
                                            }
                                        }
                                        Err(e) => {
                                            warn!("Error fetching decklists for event {}: {}", event.event_id, e);
                                        }
                                    }
                                }
                            }
                            Err(e) => {
                                warn!("Error fetching standings for event {}: {}", event.event_id, e);
                            }
                        }
                    } else {
                        debug!("Event {} is not interesting, skipping details", event.event_id);
                    }

                    // Save event
                    let filter = doc! { "event_id": event.event_id };
                    let update = doc! {
                        "$set": mongodb::bson::to_document(&event)?
                    };
                    use mongodb::options::UpdateOptions;
                    let options = UpdateOptions::builder().upsert(true).build();
                    events_collection
                        .update_one(filter, update, options)
                        .await?;
                }
                Ok(None) => {
                    debug!("Event {} returned empty data", current_id);
                    consecutive_404s += 1;
                }
                Err(ApiClientError::NotFound) => {
                    debug!("Event {} not found (404)", current_id);
                    consecutive_404s += 1;
                }
                Err(e) => {
                    error!("Error fetching event {}: {}", current_id, e);
                    consecutive_404s += 1;
                }
            }

            current_id += 1;

            // Save crawler state every 10 events
            if current_id % 10 == 0 {
                self.save_crawler_state(&crawler_collection, current_id - 1, events_found, "historical").await?;
            }
        }

        info!("Historical crawl completed. Found {} events, stopped at ID {}", events_found, current_id - 1);

        // Save final state
        self.save_crawler_state(&crawler_collection, current_id - 1, events_found, "historical").await?;

        Ok(current_id - 1)
    }

    /// Incremental crawl starting from the last known event ID
    pub async fn crawl_incremental(&self) -> Result<i32, Box<dyn std::error::Error>> {
        info!("Starting incremental event crawl");

        let crawler_collection: Collection<CrawlerState> = self.database.collection("crawler_state");

        // Get last crawler state
        use mongodb::options::FindOneOptions;
        let options = FindOneOptions::builder()
            .sort(doc! { "last_crawl": -1 })
            .build();
        let last_state = crawler_collection
            .find_one(doc! {}, options)
            .await?;

        let start_id = last_state
            .map(|state| state.last_event_id + 1)
            .unwrap_or(1);

        info!("Resuming from event ID {}", start_id);

        self.crawl_historical_events(start_id).await
    }

    /// Save crawler state to database
    async fn save_crawler_state(
        &self,
        collection: &Collection<CrawlerState>,
        last_event_id: i32,
        total_events: i32,
        crawl_type: &str,
    ) -> Result<(), mongodb::error::Error> {
        let state = CrawlerState {
            id: None,
            last_event_id,
            total_events,
            last_crawl: Utc::now(),
            crawl_type: crawl_type.to_string(),
        };

        collection.insert_one(state, None).await?;
        Ok(())
    }

    /// Get the last crawler state
    #[allow(dead_code)]
    pub async fn get_last_crawler_state(&self) -> Result<Option<CrawlerState>, mongodb::error::Error> {
        let collection: Collection<CrawlerState> = self.database.collection("crawler_state");

        use mongodb::options::FindOneOptions;
        let options = FindOneOptions::builder()
            .sort(doc! { "last_crawl": -1 })
            .build();
        collection
            .find_one(doc! {}, options)
            .await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Integration tests would require a test database
}
