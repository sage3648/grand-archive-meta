use actix_web::{web, HttpResponse, Responder};
use mongodb::{Database, Collection};
use mongodb::bson::doc;
use crate::models::{Champion, ChampionListResponse, ChampionResponse};
use log::error;

/// Get all champions
async fn get_champions(db: web::Data<Database>) -> impl Responder {
    let collection: Collection<Champion> = db.collection("champions");

    match collection.find(doc! {}, None).await {
        Ok(mut cursor) => {
            use futures::stream::StreamExt;
            let mut champions = Vec::new();

            while let Some(result) = cursor.next().await {
                match result {
                    Ok(champion) => champions.push(champion),
                    Err(e) => {
                        error!("Error reading champion: {}", e);
                    }
                }
            }

            let total = champions.len();
            HttpResponse::Ok().json(ChampionListResponse { champions, total })
        }
        Err(e) => {
            error!("Failed to fetch champions: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch champions"
            }))
        }
    }
}

/// Get a single champion by slug
async fn get_champion_by_slug(
    db: web::Data<Database>,
    path: web::Path<String>,
) -> impl Responder {
    let slug = path.into_inner();
    let collection: Collection<Champion> = db.collection("champions");

    match collection.find_one(doc! { "slug": &slug }, None).await {
        Ok(Some(champion)) => HttpResponse::Ok().json(ChampionResponse { champion }),
        Ok(None) => HttpResponse::NotFound().json(serde_json::json!({
            "error": "Champion not found"
        })),
        Err(e) => {
            error!("Failed to fetch champion '{}': {}", slug, e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to fetch champion"
            }))
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/champions")
            .route("", web::get().to(get_champions))
            .route("/{slug}", web::get().to(get_champion_by_slug)),
    );
}
