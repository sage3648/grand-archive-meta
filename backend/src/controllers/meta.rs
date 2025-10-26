use actix_web::{web, HttpResponse, Responder};
use mongodb::Database;
use crate::services::MetaAnalysisService;
use crate::models::{EventFormat, CardPerformanceResponse};
use serde::Deserialize;
use log::error;

#[derive(Deserialize)]
struct MetaQuery {
    format: Option<String>,
    days: Option<i32>,
}

#[derive(Deserialize)]
struct CardPerformanceQuery {
    format: Option<String>,
    days: Option<i32>,
    limit: Option<i64>,
}

/// Get meta breakdown statistics
async fn get_meta_breakdown(
    db: web::Data<Database>,
    query: web::Query<MetaQuery>,
) -> impl Responder {
    let service = MetaAnalysisService::new(db.get_ref().clone());

    let format = query.format.as_ref().map(|s| EventFormat::from_str(s));

    match service.calculate_meta_breakdown(format, query.days).await {
        Ok(breakdown) => HttpResponse::Ok().json(serde_json::json!({
            "breakdown": breakdown,
            "total": breakdown.len(),
        })),
        Err(e) => {
            error!("Failed to calculate meta breakdown: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to calculate meta breakdown"
            }))
        }
    }
}

/// Get champion performance statistics
async fn get_champion_performance(
    db: web::Data<Database>,
    query: web::Query<MetaQuery>,
) -> impl Responder {
    let service = MetaAnalysisService::new(db.get_ref().clone());

    match service.calculate_champion_performance(query.days).await {
        Ok(performance) => HttpResponse::Ok().json(serde_json::json!({
            "champions": performance,
            "total": performance.len(),
        })),
        Err(e) => {
            error!("Failed to calculate champion performance: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to calculate champion performance"
            }))
        }
    }
}

/// Get card performance statistics
async fn get_card_performance(
    db: web::Data<Database>,
    query: web::Query<CardPerformanceQuery>,
) -> impl Responder {
    let service = MetaAnalysisService::new(db.get_ref().clone());

    let format = query.format.as_ref().map(|s| EventFormat::from_str(s));

    match service.calculate_card_performance(format, query.days, query.limit).await {
        Ok(cards) => {
            let total = cards.len();
            HttpResponse::Ok().json(CardPerformanceResponse { cards, total })
        }
        Err(e) => {
            error!("Failed to calculate card performance: {}", e);
            HttpResponse::InternalServerError().json(serde_json::json!({
                "error": "Failed to calculate card performance"
            }))
        }
    }
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/meta")
            .route("/breakdown", web::get().to(get_meta_breakdown))
            .route("/champion-performance", web::get().to(get_champion_performance)),
    )
    .service(
        web::scope("/cards")
            .route("/performance", web::get().to(get_card_performance)),
    );
}
