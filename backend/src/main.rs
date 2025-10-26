mod config;
mod models;
mod clients;
mod services;
mod controllers;
mod middleware;
mod scheduler;

use actix_web::{web, App, HttpServer, middleware::Logger};
use config::Config;
use log::{info, error};
use mongodb::{Client, options::ClientOptions};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Initialize logger
    env_logger::init();

    // Load configuration
    let config = match Config::from_env() {
        Ok(cfg) => {
            info!("Configuration loaded successfully");
            cfg
        }
        Err(e) => {
            error!("Failed to load configuration: {}", e);
            std::process::exit(1);
        }
    };

    // Connect to MongoDB
    let mongodb_uri = config.mongodb_uri.clone();
    let database_name = config.mongodb_database.clone();

    let client_options = match ClientOptions::parse(&mongodb_uri).await {
        Ok(opts) => opts,
        Err(e) => {
            error!("Failed to parse MongoDB URI: {}", e);
            std::process::exit(1);
        }
    };

    let client = match Client::with_options(client_options) {
        Ok(c) => {
            info!("MongoDB client created successfully");
            c
        }
        Err(e) => {
            error!("Failed to create MongoDB client: {}", e);
            std::process::exit(1);
        }
    };

    // Test database connection
    match client
        .database(&database_name)
        .run_command(mongodb::bson::doc! { "ping": 1 }, None)
        .await
    {
        Ok(_) => info!("Successfully connected to MongoDB"),
        Err(e) => {
            error!("Failed to connect to MongoDB: {}", e);
            std::process::exit(1);
        }
    }

    let database = client.database(&database_name);

    // Create indexes for better query performance
    if let Err(e) = create_indexes(&database).await {
        error!("Failed to create indexes: {}", e);
        // Don't exit, indexes are optional for startup
    }

    // Setup and start the job scheduler
    let scheduler_db = database.clone();
    let scheduler_config = config.clone();

    tokio::spawn(async move {
        match scheduler::setup_scheduler(scheduler_config, scheduler_db).await {
            Ok(scheduler) => {
                info!("Job scheduler configured");
                if let Err(e) = scheduler::start_scheduler(scheduler).await {
                    error!("Failed to start scheduler: {}", e);
                }
            }
            Err(e) => {
                error!("Failed to setup scheduler: {}", e);
            }
        }
    });

    // Server configuration
    let host = config.host.clone();
    let port = config.port;
    let bind_address = format!("{}:{}", host, port);

    info!("Starting HTTP server on {}", bind_address);

    // Start HTTP server
    HttpServer::new(move || {
        App::new()
            .app_data(web::Data::new(database.clone()))
            .wrap(Logger::default())
            .wrap(middleware::configure_cors())
            .service(
                web::scope("/api")
                    .configure(controllers::configure_health)
                    .configure(controllers::configure_champions)
                    .configure(controllers::configure_events)
                    .configure(controllers::configure_decklists)
                    .configure(controllers::configure_meta)
            )
    })
    .bind(&bind_address)?
    .run()
    .await
}

/// Create database indexes for optimized queries
async fn create_indexes(database: &mongodb::Database) -> Result<(), mongodb::error::Error> {
    use mongodb::options::IndexOptions;
    use mongodb::IndexModel;
    use mongodb::bson::doc;

    info!("Creating database indexes");

    // Events collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("events");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "event_id": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! { "status": 1, "start_date": -1 })
                .build(),
            IndexModel::builder()
                .keys(doc! { "format": 1, "start_date": -1 })
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    // Standings collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("standings");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "event_id": 1, "player_id": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! { "event_id": 1, "rank": 1 })
                .build(),
            IndexModel::builder()
                .keys(doc! { "champion": 1 })
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    // Decklists collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("decklists");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "event_id": 1, "player_id": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! { "champion": 1 })
                .build(),
            IndexModel::builder()
                .keys(doc! { "player_id": 1 })
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    // Champions collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("champions");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "slug": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    // Cards collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("cards");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "slug": 1 })
                .options(IndexOptions::builder().unique(true).build())
                .build(),
            IndexModel::builder()
                .keys(doc! { "name": 1 })
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    // Crawler state collection indexes
    {
        let collection = database.collection::<mongodb::bson::Document>("crawler_state");

        let index_models = vec![
            IndexModel::builder()
                .keys(doc! { "last_crawl": -1 })
                .build(),
        ];

        collection.create_indexes(index_models, None).await?;
    }

    info!("Database indexes created successfully");

    Ok(())
}
