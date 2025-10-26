use crate::clients::GatcgApiClient;
use crate::models::Card;
use mongodb::{Database, Collection};
use mongodb::bson::doc;
use log::{info, warn, debug};
use std::sync::Arc;
use std::collections::HashSet;

/// Service for synchronizing card data from the GATCG API
pub struct CardSyncService {
    gatcg_client: Arc<GatcgApiClient>,
    database: Database,
}

impl CardSyncService {
    /// Create a new card sync service
    pub fn new(gatcg_client: Arc<GatcgApiClient>, database: Database) -> Self {
        Self {
            gatcg_client,
            database,
        }
    }

    /// Sync all cards from known card slugs
    /// Card slugs are discovered from decklists
    pub async fn sync_cards_from_decklists(&self) -> Result<usize, Box<dyn std::error::Error>> {
        info!("Starting card sync from decklists");

        let decklists_collection = self.database.collection::<mongodb::bson::Document>("decklists");
        let cards_collection: Collection<Card> = self.database.collection("cards");

        // Extract unique card slugs from all decklists
        let mut card_slugs = HashSet::new();

        let mut cursor = decklists_collection.find(doc! {}, None).await?;

        use futures::stream::StreamExt;

        while let Some(result) = cursor.next().await {
            match result {
                Ok(doc) => {
                    // Extract slugs from main_deck
                    if let Ok(main_deck) = doc.get_array("main_deck") {
                        for card_doc in main_deck {
                            if let Some(card) = card_doc.as_document() {
                                if let Ok(slug) = card.get_str("slug") {
                                    card_slugs.insert(slug.to_string());
                                }
                            }
                        }
                    }

                    // Extract slugs from sideboard
                    if let Ok(sideboard) = doc.get_array("sideboard") {
                        for card_doc in sideboard {
                            if let Some(card) = card_doc.as_document() {
                                if let Ok(slug) = card.get_str("slug") {
                                    card_slugs.insert(slug.to_string());
                                }
                            }
                        }
                    }
                }
                Err(e) => {
                    warn!("Error reading decklist document: {}", e);
                }
            }
        }

        info!("Found {} unique card slugs from decklists", card_slugs.len());

        // Fetch card data for each slug
        let mut synced_count = 0;
        let slugs: Vec<String> = card_slugs.into_iter().collect();

        for slug in &slugs {
            match self.gatcg_client.fetch_card(slug).await {
                Ok(Some(card)) => {
                    debug!("Syncing card: {}", card.name);

                    let filter = doc! { "slug": &card.slug };
                    let update = doc! {
                        "$set": mongodb::bson::to_document(&card)?
                    };

                    use mongodb::options::UpdateOptions;
                    let options = UpdateOptions::builder().upsert(true).build();
                    cards_collection
                        .update_one(filter, update, options)
                        .await?;

                    synced_count += 1;
                }
                Ok(None) => {
                    debug!("Card '{}' not found in API", slug);
                }
                Err(e) => {
                    warn!("Error fetching card '{}': {}", slug, e);
                }
            }
        }

        info!("Card sync completed. Synced {} cards", synced_count);

        Ok(synced_count)
    }

    /// Sync champion cards specifically
    pub async fn sync_champions(&self, champion_slugs: &[String]) -> Result<usize, Box<dyn std::error::Error>> {
        info!("Starting champion card sync for {} champions", champion_slugs.len());

        let cards_collection: Collection<Card> = self.database.collection("cards");
        let champions_collection = self.database.collection::<mongodb::bson::Document>("champions");

        let mut synced_count = 0;

        for slug in champion_slugs {
            match self.gatcg_client.fetch_card(slug).await {
                Ok(Some(card)) => {
                    info!("Syncing champion card: {}", card.name);

                    // Save to cards collection
                    let card_filter = doc! { "slug": &card.slug };
                    let card_update = doc! {
                        "$set": mongodb::bson::to_document(&card)?
                    };

                    use mongodb::options::UpdateOptions;
                    let options = UpdateOptions::builder().upsert(true).build();
                    cards_collection
                        .update_one(card_filter, card_update, options)
                        .await?;

                    // Update champion collection with card details
                    let champion_filter = doc! { "slug": &card.slug };
                    let champion_update = doc! {
                        "$set": {
                            "name": &card.name,
                            "element": &card.element,
                            "class": card.classes.as_ref().and_then(|c| c.first()),
                            "image_url": &card.image_url,
                            "ability_text": &card.card_text,
                            "life": card.life_modifier,
                            "updated_at": mongodb::bson::DateTime::from_chrono(chrono::Utc::now())
                        }
                    };

                    let champion_options = UpdateOptions::builder().upsert(true).build();
                    champions_collection
                        .update_one(champion_filter, champion_update, champion_options)
                        .await?;

                    synced_count += 1;
                }
                Ok(None) => {
                    warn!("Champion card '{}' not found in API", slug);
                }
                Err(e) => {
                    warn!("Error fetching champion card '{}': {}", slug, e);
                }
            }
        }

        info!("Champion sync completed. Synced {} champions", synced_count);

        Ok(synced_count)
    }

    /// Get all unique champion slugs from standings
    pub async fn get_champion_slugs_from_standings(&self) -> Result<Vec<String>, mongodb::error::Error> {
        let standings_collection = self.database.collection::<mongodb::bson::Document>("standings");

        let pipeline = vec![
            doc! { "$group": { "_id": "$champion" } },
            doc! { "$project": { "champion": "$_id", "_id": 0 } },
        ];

        let mut cursor = standings_collection.aggregate(pipeline, None).await?;

        let mut champions = Vec::new();
        use futures::stream::StreamExt;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                if let Ok(champion) = doc.get_str("champion") {
                    champions.push(champion.to_string());
                }
            }
        }

        Ok(champions)
    }

    /// Full sync: champions from standings and cards from decklists
    pub async fn full_sync(&self) -> Result<(usize, usize), Box<dyn std::error::Error>> {
        info!("Starting full card sync");

        // Sync champions first
        let champion_slugs = self.get_champion_slugs_from_standings().await?;
        let champions_synced = self.sync_champions(&champion_slugs).await?;

        // Sync all cards from decklists
        let cards_synced = self.sync_cards_from_decklists().await?;

        info!("Full sync completed. Champions: {}, Cards: {}", champions_synced, cards_synced);

        Ok((champions_synced, cards_synced))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Integration tests would require a test database
}
