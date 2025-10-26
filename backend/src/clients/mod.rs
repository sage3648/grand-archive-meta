pub mod gatcg_api;
pub mod omnidex_api;
pub mod omni_web_api;

pub use gatcg_api::GatcgApiClient;
pub use omnidex_api::OmnidexApiClient;
pub use omni_web_api::OmniWebApiClient;

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ApiClientError {
    #[error("HTTP request failed: {0}")]
    RequestFailed(String),

    #[error("Deserialization error: {0}")]
    DeserializationError(String),

    #[allow(dead_code)]
    #[error("Rate limit exceeded")]
    RateLimitExceeded,

    #[error("Not found (404)")]
    NotFound,

    #[error("Server error (5xx)")]
    ServerError,

    #[error("Timeout")]
    Timeout,

    #[allow(dead_code)]
    #[error("Max retries exceeded")]
    MaxRetriesExceeded,
}

impl From<reqwest::Error> for ApiClientError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            ApiClientError::Timeout
        } else if err.is_status() {
            if let Some(status) = err.status() {
                if status.as_u16() == 404 {
                    return ApiClientError::NotFound;
                } else if status.is_server_error() {
                    return ApiClientError::ServerError;
                }
            }
            ApiClientError::RequestFailed(err.to_string())
        } else {
            ApiClientError::RequestFailed(err.to_string())
        }
    }
}
