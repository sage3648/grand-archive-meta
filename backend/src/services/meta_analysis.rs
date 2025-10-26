use crate::models::{EventFormat, CardPerformance};
use mongodb::Database;
use mongodb::bson::{doc, Document};
use log::info;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{Utc, Duration as ChronoDuration};

/// Meta breakdown statistics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MetaBreakdown {
    pub champion: String,
    pub deck_count: i32,
    pub meta_percentage: f64,
    pub avg_placement: f64,
    pub win_rate: Option<f64>,
    pub top_8_count: i32,
    pub top_8_percentage: f64,
}

/// Champion performance metrics
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChampionPerformance {
    pub champion: String,
    pub total_appearances: i32,
    pub total_events: i32,
    pub avg_placement: f64,
    pub win_rate: f64,
    pub top_8_rate: f64,
    pub top_16_rate: f64,
    pub conversion_rate: f64, // Top 8 / Total appearances
}

/// Service for meta analysis and statistics
pub struct MetaAnalysisService {
    database: Database,
}

impl MetaAnalysisService {
    /// Create a new meta analysis service
    pub fn new(database: Database) -> Self {
        Self { database }
    }

    /// Calculate meta breakdown for a specific format and time period
    pub async fn calculate_meta_breakdown(
        &self,
        format: Option<EventFormat>,
        days: Option<i32>,
    ) -> Result<Vec<MetaBreakdown>, Box<dyn std::error::Error>> {
        info!("Calculating meta breakdown for format: {:?}, days: {:?}", format, days);

        let decklists_collection = self.database.collection::<Document>("decklists");
        let events_collection = self.database.collection::<Document>("events");

        // Build date filter if days specified
        let mut event_filter = doc! { "status": "complete", "ranked": true };
        if let Some(fmt) = format {
            event_filter.insert("format", mongodb::bson::to_bson(&fmt)?);
        }
        if let Some(d) = days {
            let cutoff_date = Utc::now() - ChronoDuration::days(d as i64);
            event_filter.insert("start_date", doc! { "$gte": mongodb::bson::DateTime::from_chrono(cutoff_date) });
        }

        // Get event IDs matching criteria
        let mut event_ids = Vec::new();
        let mut cursor = events_collection.find(event_filter, None).await?;

        use futures::stream::StreamExt;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                if let Ok(event_id) = doc.get_i32("event_id") {
                    event_ids.push(event_id);
                }
            }
        }

        if event_ids.is_empty() {
            info!("No events found matching criteria");
            return Ok(Vec::new());
        }

        info!("Analyzing {} events", event_ids.len());

        // Aggregate decklist data
        let pipeline = vec![
            doc! { "$match": { "event_id": { "$in": event_ids } } },
            doc! {
                "$group": {
                    "_id": "$champion",
                    "deck_count": { "$sum": 1 },
                    "avg_placement": { "$avg": "$rank" },
                    "top_8_count": {
                        "$sum": {
                            "$cond": [{ "$lte": ["$rank", 8] }, 1, 0]
                        }
                    }
                }
            },
            doc! { "$sort": { "deck_count": -1 } },
        ];

        let mut cursor = decklists_collection.aggregate(pipeline, None).await?;
        let mut results = Vec::new();
        let mut total_decks = 0;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                let champion = doc.get_str("_id").unwrap_or("Unknown").to_string();
                let deck_count = doc.get_i32("deck_count").unwrap_or(0);
                let avg_placement = doc.get_f64("avg_placement").unwrap_or(0.0);
                let top_8_count = doc.get_i32("top_8_count").unwrap_or(0);

                total_decks += deck_count;

                results.push((champion, deck_count, avg_placement, top_8_count));
            }
        }

        // Calculate percentages
        let breakdown: Vec<MetaBreakdown> = results
            .into_iter()
            .map(|(champion, deck_count, avg_placement, top_8_count)| {
                let meta_percentage = if total_decks > 0 {
                    (deck_count as f64 / total_decks as f64) * 100.0
                } else {
                    0.0
                };

                let top_8_percentage = if deck_count > 0 {
                    (top_8_count as f64 / deck_count as f64) * 100.0
                } else {
                    0.0
                };

                MetaBreakdown {
                    champion,
                    deck_count,
                    meta_percentage,
                    avg_placement,
                    win_rate: None, // Would require match data
                    top_8_count,
                    top_8_percentage,
                }
            })
            .collect();

        info!("Meta breakdown calculated: {} champions, {} total decks", breakdown.len(), total_decks);

        Ok(breakdown)
    }

    /// Calculate champion performance metrics
    pub async fn calculate_champion_performance(
        &self,
        days: Option<i32>,
    ) -> Result<Vec<ChampionPerformance>, Box<dyn std::error::Error>> {
        info!("Calculating champion performance for days: {:?}", days);

        let standings_collection = self.database.collection::<Document>("standings");
        let events_collection = self.database.collection::<Document>("events");

        // Build date filter
        let mut event_filter = doc! { "status": "complete", "ranked": true };
        if let Some(d) = days {
            let cutoff_date = Utc::now() - ChronoDuration::days(d as i64);
            event_filter.insert("start_date", doc! { "$gte": mongodb::bson::DateTime::from_chrono(cutoff_date) });
        }

        // Get event IDs
        let mut event_ids = Vec::new();
        let mut cursor = events_collection.find(event_filter, None).await?;

        use futures::stream::StreamExt;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                if let Ok(event_id) = doc.get_i32("event_id") {
                    event_ids.push(event_id);
                }
            }
        }

        if event_ids.is_empty() {
            return Ok(Vec::new());
        }

        // Aggregate standings data
        let pipeline = vec![
            doc! { "$match": { "event_id": { "$in": &event_ids } } },
            doc! {
                "$group": {
                    "_id": "$champion",
                    "total_appearances": { "$sum": 1 },
                    "avg_placement": { "$avg": "$rank" },
                    "avg_win_rate": { "$avg": "$match_win_rate" },
                    "top_8_count": {
                        "$sum": {
                            "$cond": [{ "$lte": ["$rank", 8] }, 1, 0]
                        }
                    },
                    "top_16_count": {
                        "$sum": {
                            "$cond": [{ "$lte": ["$rank", 16] }, 1, 0]
                        }
                    }
                }
            },
            doc! { "$sort": { "total_appearances": -1 } },
        ];

        let mut cursor = standings_collection.aggregate(pipeline, None).await?;
        let mut performances = Vec::new();

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                let champion = doc.get_str("_id").unwrap_or("Unknown").to_string();
                let total_appearances = doc.get_i32("total_appearances").unwrap_or(0);
                let avg_placement = doc.get_f64("avg_placement").unwrap_or(0.0);
                let avg_win_rate = doc.get_f64("avg_win_rate").unwrap_or(0.0);
                let top_8_count = doc.get_i32("top_8_count").unwrap_or(0);
                let top_16_count = doc.get_i32("top_16_count").unwrap_or(0);

                let top_8_rate = if total_appearances > 0 {
                    (top_8_count as f64 / total_appearances as f64) * 100.0
                } else {
                    0.0
                };

                let top_16_rate = if total_appearances > 0 {
                    (top_16_count as f64 / total_appearances as f64) * 100.0
                } else {
                    0.0
                };

                performances.push(ChampionPerformance {
                    champion,
                    total_appearances,
                    total_events: event_ids.len() as i32,
                    avg_placement,
                    win_rate: avg_win_rate,
                    top_8_rate,
                    top_16_rate,
                    conversion_rate: top_8_rate,
                });
            }
        }

        info!("Champion performance calculated: {} champions", performances.len());

        Ok(performances)
    }

    /// Calculate card performance metrics
    pub async fn calculate_card_performance(
        &self,
        format: Option<EventFormat>,
        days: Option<i32>,
        limit: Option<i64>,
    ) -> Result<Vec<CardPerformance>, Box<dyn std::error::Error>> {
        info!("Calculating card performance");

        let decklists_collection = self.database.collection::<Document>("decklists");
        let events_collection = self.database.collection::<Document>("events");
        let cards_collection = self.database.collection::<Document>("cards");

        // Build event filter
        let mut event_filter = doc! { "status": "complete", "ranked": true };
        if let Some(fmt) = format {
            event_filter.insert("format", mongodb::bson::to_bson(&fmt)?);
        }
        if let Some(d) = days {
            let cutoff_date = Utc::now() - ChronoDuration::days(d as i64);
            event_filter.insert("start_date", doc! { "$gte": mongodb::bson::DateTime::from_chrono(cutoff_date) });
        }

        // Get event IDs
        let mut event_ids = Vec::new();
        let mut cursor = events_collection.find(event_filter, None).await?;

        use futures::stream::StreamExt;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                if let Ok(event_id) = doc.get_i32("event_id") {
                    event_ids.push(event_id);
                }
            }
        }

        if event_ids.is_empty() {
            return Ok(Vec::new());
        }

        // Aggregate card frequencies from decklists
        let mut card_stats: HashMap<String, (i32, i32, f64)> = HashMap::new(); // slug -> (deck_count, total_quantity, total_placement)
        let mut total_decks = 0;

        let mut cursor = decklists_collection
            .find(doc! { "event_id": { "$in": &event_ids } }, None)
            .await?;

        while let Some(result) = cursor.next().await {
            if let Ok(doc) = result {
                total_decks += 1;
                let rank = doc.get_i32("rank").unwrap_or(999) as f64;

                // Process card frequencies
                if let Ok(frequencies) = doc.get_document("card_frequencies") {
                    for (slug, quantity) in frequencies {
                        if let Some(qty) = quantity.as_i32() {
                            let entry = card_stats.entry(slug.to_string()).or_insert((0, 0, 0.0));
                            entry.0 += 1; // deck count
                            entry.1 += qty; // total quantity
                            entry.2 += rank; // cumulative placement
                        }
                    }
                }
            }
        }

        // Build card performance results
        let mut performances: Vec<CardPerformance> = Vec::new();

        for (slug, (deck_count, total_quantity, total_placement)) in card_stats {
            let meta_percentage = if total_decks > 0 {
                (deck_count as f64 / total_decks as f64) * 100.0
            } else {
                0.0
            };

            let avg_quantity = total_quantity as f64 / deck_count as f64;
            let avg_placement = if deck_count > 0 {
                Some(total_placement / deck_count as f64)
            } else {
                None
            };

            // Get card name from cards collection
            let card_doc = cards_collection
                .find_one(doc! { "slug": &slug }, None)
                .await?;

            let name = card_doc
                .and_then(|doc| doc.get_str("name").ok().map(|s| s.to_string()))
                .unwrap_or_else(|| slug.clone());

            performances.push(CardPerformance {
                slug,
                name,
                deck_count,
                meta_percentage,
                avg_quantity,
                win_rate: None,
                avg_placement,
            });
        }

        // Sort by deck count
        performances.sort_by(|a, b| b.deck_count.cmp(&a.deck_count));

        // Apply limit if specified
        if let Some(lim) = limit {
            performances.truncate(lim as usize);
        }

        info!("Card performance calculated: {} cards", performances.len());

        Ok(performances)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    // Integration tests would require a test database
}
