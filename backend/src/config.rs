use std::env;

/// Application configuration loaded from environment variables
#[derive(Debug, Clone)]
pub struct Config {
    pub mongodb_uri: String,
    pub mongodb_database: String,
    pub host: String,
    pub port: u16,
    pub request_delay_ms: u64,
    pub max_retries: u32,
    pub request_timeout_secs: u64,
    pub crawler_max_404s: i32,
    #[allow(dead_code)]
    pub crawler_start_id: i32,
    #[allow(dead_code)]
    pub cache_ttl_secs: u64,
}

impl Config {
    /// Load configuration from environment variables
    pub fn from_env() -> Result<Self, ConfigError> {
        dotenv::dotenv().ok();

        Ok(Config {
            mongodb_uri: env::var("MONGODB_URI")
                .map_err(|_| ConfigError::MissingEnvVar("MONGODB_URI"))?,
            mongodb_database: env::var("MONGODB_DATABASE")
                .unwrap_or_else(|_| "grand-archive-meta".to_string()),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .map_err(|_| ConfigError::InvalidPort)?,
            request_delay_ms: env::var("REQUEST_DELAY_MS")
                .unwrap_or_else(|_| "500".to_string())
                .parse()
                .unwrap_or(500),
            max_retries: env::var("MAX_RETRIES")
                .unwrap_or_else(|_| "3".to_string())
                .parse()
                .unwrap_or(3),
            request_timeout_secs: env::var("REQUEST_TIMEOUT_SECS")
                .unwrap_or_else(|_| "10".to_string())
                .parse()
                .unwrap_or(10),
            crawler_max_404s: env::var("CRAWLER_MAX_404S")
                .unwrap_or_else(|_| "10".to_string())
                .parse()
                .unwrap_or(10),
            crawler_start_id: env::var("CRAWLER_START_ID")
                .unwrap_or_else(|_| "1".to_string())
                .parse()
                .unwrap_or(1),
            cache_ttl_secs: env::var("CACHE_TTL_SECS")
                .unwrap_or_else(|_| "3600".to_string())
                .parse()
                .unwrap_or(3600),
        })
    }
}

#[derive(Debug, thiserror::Error)]
pub enum ConfigError {
    #[error("Missing required environment variable: {0}")]
    MissingEnvVar(&'static str),

    #[error("Invalid port number")]
    InvalidPort,
}
