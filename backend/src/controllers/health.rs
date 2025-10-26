use actix_web::{web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use mongodb::Database;

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    database: String,
    version: String,
}

/// Health check endpoint
async fn health_check(db: web::Data<Database>) -> impl Responder {
    // Try to ping the database
    let db_status = match db.run_command(mongodb::bson::doc! { "ping": 1 }, None).await {
        Ok(_) => "connected",
        Err(_) => "disconnected",
    };

    HttpResponse::Ok().json(HealthResponse {
        status: "ok".to_string(),
        database: db_status.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::resource("/health").route(web::get().to(health_check)));
}
