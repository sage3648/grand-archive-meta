use actix_web::{
    dev::{forward_ready, Service, ServiceRequest, ServiceResponse, Transform},
    Error,
};
use futures::future::LocalBoxFuture;
use std::future::{ready, Ready};

/// Cache control middleware for adding cache headers to responses
#[allow(dead_code)]
pub struct CacheControl {
    max_age: u32,
}

#[allow(dead_code)]
impl CacheControl {
    pub fn new(max_age: u32) -> Self {
        Self { max_age }
    }
}

impl<S, B> Transform<S, ServiceRequest> for CacheControl
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = CacheControlMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ready(Ok(CacheControlMiddleware {
            service,
            max_age: self.max_age,
        }))
    }
}

#[allow(dead_code)]
pub struct CacheControlMiddleware<S> {
    service: S,
    max_age: u32,
}

impl<S, B> Service<ServiceRequest> for CacheControlMiddleware<S>
where
    S: Service<ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = LocalBoxFuture<'static, Result<Self::Response, Self::Error>>;

    forward_ready!(service);

    fn call(&self, req: ServiceRequest) -> Self::Future {
        let max_age = self.max_age;
        let fut = self.service.call(req);

        Box::pin(async move {
            let mut res = fut.await?;

            // Add cache control header to successful GET requests
            if res.request().method() == actix_web::http::Method::GET
                && res.status().is_success()
            {
                res.headers_mut().insert(
                    actix_web::http::header::CACHE_CONTROL,
                    actix_web::http::header::HeaderValue::from_str(&format!(
                        "public, max-age={}",
                        max_age
                    ))
                    .unwrap(),
                );
            }

            Ok(res)
        })
    }
}
