use actix_web::{web, HttpResponse, Responder};
use mongodb::{Database, Collection};
use mongodb::bson::{doc, Document};
use crate::models::{Decklist, DecklistListResponse, DecklistResponse};
use serde::Deserialize;
use log::error;
use chrono::{Utc, Duration};

#[derive(Deserialize)]
struct DecklistQuery {
    champion: Option<String>,
    format: Option<String>,
    days: Option<i32>,
    limit: Option<i64>,
}

#[derive(Deserialize)]
struct PlayerDecklistQuery {
    event: Option<i32>,
}

/// Get decklists with optional filters
async fn get_decklists(
    db: web::Data<Database>,
    query: web::Query<DecklistQuery>,
) -> impl Responder {
    let decklists_collection: Collection<Decklist> = db.collection("decklists");
    let events_collection: Collection<Document> = db.collection("events");

    let mut filter = doc! {};

    // Filter by champion
    if let Some(champion) = &query.champion {
        filter.insert("champion", champion);
    }

    // If filtering by format or days, we need to join with events
    if query.format.is_some() || query.days.is_some() {
        let mut event_filter = doc! {};

        if let Some(format_str) = &query.format {
            event_filter.insert("format", format_str.to_uppercase());
        }

        if let Some(days) = query.days {
            let cutoff_date = Utc::now() - Duration::days(days as i64);
            event_filter.insert("start_date", doc! { "$gte": mongodb::bson::DateTime::from_chrono(cutoff_date) });
        }

        // Get matching event IDs
        match events_collection.find(event_filter, None).await {
            Ok(mut cursor) => {
                use futures::stream::StreamExt;
                let mut event_ids = Vec::new();

                while let Some(result) = cursor.next().await {
                    if let Ok(doc) = result {
                        if let Ok(event_id) = doc.get_i32("event_id") {
                            event_ids.push(event_id);
                        }
                    }
                }

                if !event_ids.is_empty() {
                    filter.insert("event_id", doc! { "$in": event_ids });
                } else {
                    // No events match, return empty result
                    return HttpResponse::Ok().json(DecklistListResponse {
                        decklists: Vec::new(),
                        total: 0,
                    });
                }
            }
            Err(e) => {
                error!("Failed to fetch events for decklist filter: {}", e);
                return HttpResponse::InternalServerError().json(serde_json::json!({
                    "error": "Failed to fetch decklists"
                }));
            }
        }
    }

    let mut find_options = mongodb::options::FindOptions::builder()
        .sort(doc! { "rank": 1 })
        .build();

    if let Some(limit) = query.limit {
        find_options.limit = Some(limit);
    }

    match decklists_collection.find(filter, find_options).await {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            let mut decklists = Vec::new();

            while let Some(result) = cursor.next().await {
                match result {
                    Ok(decklist) => decklists.push(decklist),
                    Err(e) => {
                        error!("Error reading decklist: {}", e);
                    }
                }
            }

            let total = decklists.len();
            HttpResponse::Ok().json(DecklistListResponse { decklists, total })
        }
        Err(e) => {
            error!("Failed to fetch decklists: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch decklists"
            }))
        }
    }
}

/// Get a player's decklist, optionally filtered by event
async fn get_player_decklist(
    db: web::Data<Database>,
    path: web::Path<String>,
    query: web::Query<PlayerDecklistQuery>,
) -> impl Responder {
    let player_id = path.into_inner();
    let collection: Collection<Decklist> = db.collection("decklists");

    let mut filter = doc! { "player_id": &player_id };

    if let Some(event_id) = query.event {
        filter.insert("event_id", event_id);
    }

    use mongodb::options::FindOptions;
    let find_options = FindOptions::builder()
        .sort(doc! { "event_id": -1 })
        .build();

    match collection
        .find(filter, find_options)
        .await
    {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            let mut decklists = Vec::new();

            while let Some(result) = cursor.next().await {
                match result {
                    Ok(decklist) => decklists.push(decklist),
                    Err(e) => {
                        error!("Error reading decklist: {}", e);
                    }
                }
            }

            if decklists.is_empty() {
                HttpResponse::NotFound().json(serde_json::json!({
                    "error": "No decklists found for player"
                }))
            } else if query.event.is_some() && decklists.len() == 1 {
                // Return single decklist if event filter was specified
                HttpResponse::Ok().json(DecklistResponse {
                    decklist: decklists.into_iter().next().unwrap(),
                })
            } else {
                // Return list of decklists
                let total = decklists.len();
                HttpResponse::Ok().json(DecklistListResponse { decklists, total })
            }
        }
        Err(e) => {
            error!("Failed to fetch decklists for player '{}': {}", player_id, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch decklists"
            }))
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/decklists")
            .route("", web::get().to(get_decklists))
            .route("/{player_id}", web::get().to(get_player_decklist)),
    );
}
