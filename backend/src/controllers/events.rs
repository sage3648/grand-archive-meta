use actix_web::{web, HttpResponse, Responder};
use mongodb::{Database, Collection};
use mongodb::bson::doc;
use crate::models::{Event, EventFormat, EventListResponse, EventResponse, Standing, StandingListResponse};
use serde::Deserialize;
use log::error;
use chrono::{Utc, Duration};

#[derive(Deserialize)]
struct EventQuery {
    format: Option<String>,
    days: Option<i32>,
    #[serde(rename = "minPlayers")]
    min_players: Option<i32>,
}

/// Get events with optional filters
async fn get_events(
    db: web::Data<Database>,
    query: web::Query<EventQuery>,
) -> impl Responder {
    let collection: Collection<Event> = db.collection("events");

    let mut filter = doc! { "status": "complete" };

    // Filter by format
    if let Some(format_str) = &query.format {
        let format = EventFormat::from_str(format_str);
        if let Ok(format_bson) = mongodb::bson::to_bson(&format) {
            filter.insert("format", format_bson);
        }
    }

    // Filter by days
    if let Some(days) = query.days {
        let cutoff_date = Utc::now() - Duration::days(days as i64);
        filter.insert("start_date", doc! { "$gte": mongodb::bson::DateTime::from_chrono(cutoff_date) });
    }

    // Filter by minimum players
    if let Some(min_players) = query.min_players {
        filter.insert("player_count", doc! { "$gte": min_players });
    }

    use mongodb::options::FindOptions;
    let find_options = FindOptions::builder()
        .sort(doc! { "start_date": -1 })
        .build();

    match collection
        .find(filter, find_options)
        .await
    {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            let mut events = Vec::new();

            while let Some(result) = cursor.next().await {
                match result {
                    Ok(event) => events.push(event),
                    Err(e) => {
                        error!("Error reading event: {}", e);
                    }
                }
            }

            let total = events.len();
            HttpResponse::Ok().json(EventListResponse { events, total })
        }
        Err(e) => {
            error!("Failed to fetch events: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch events"
            }))
        }
    }
}

/// Get a single event by ID
async fn get_event_by_id(
    db: web::Data<Database>,
    path: web::Path<i32>,
) -> impl Responder {
    let event_id = path.into_inner();
    let collection: Collection<Event> = db.collection("events");

    match collection.find_one(doc! { "event_id": event_id }, None).await {
        Ok(Some(event)) => HttpResponse::Ok().json(EventResponse { event }),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Event not found"
        })),
        Err(e) => {
            error!("Failed to fetch event {}: {}", event_id, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch event"
            }))
        }
    }
}

/// Get standings for an event
async fn get_event_standings(
    db: web::Data<Database>,
    path: web::Path<i32>,
) -> impl Responder {
    let event_id = path.into_inner();
    let collection: Collection<Standing> = db.collection("standings");

    use mongodb::options::FindOptions;
    let find_options = FindOptions::builder()
        .sort(doc! { "rank": 1 })
        .build();

    match collection
        .find(doc! { "event_id": event_id }, find_options)
        .await
    {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            let mut standings = Vec::new();

            while let Some(result) = cursor.next().await {
                match result {
                    Ok(standing) => standings.push(standing),
                    Err(e) => {
                        error!("Error reading standing: {}", e);
                    }
                }
            }

            let total = standings.len();
            HttpResponse::Ok().json(StandingListResponse { standings, total })
        }
        Err(e) => {
            error!("Failed to fetch standings for event {}: {}", event_id, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch standings"
            }))
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/events")
            .route("", web::get().to(get_events))
            .route("/{event_id}", web::get().to(get_event_by_id))
            .route("/{event_id}/standings", web::get().to(get_event_standings)),
    );
}
