use actix_cors::Cors;
use actix_web::http::header;

/// Configure CORS middleware for the application
pub fn configure_cors() -> Cors {
    Cors::default()
        .allowed_origin_fn(|origin, _req_head| {
            // In production, restrict to specific origins
            // For development, allow all origins
            origin.as_bytes().starts_with(b"http://localhost")
                || origin.as_bytes().starts_with(b"https://")
        })
        .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
        .allowed_headers(vec![
            header::AUTHORIZATION,
            header::ACCEPT,
            header::CONTENT_TYPE,
        ])
        .max_age(3600)
}
