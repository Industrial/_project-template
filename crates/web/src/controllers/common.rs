use axum::http::StatusCode;
use loco_rs::prelude::*;
use sea_orm::{DatabaseConnection, DbErr, EntityTrait, PaginatorTrait, Select};
use serde::Deserialize;
use std::future::Future;

use crate::dtos::common::ApiError;

const fn default_page() -> u64 {
    1
}

const fn default_per_page() -> u64 {
    25
}

#[derive(Debug, Deserialize)]
pub struct ListParams {
    #[serde(default = "default_page")]
    pub page: u64,
    #[serde(default = "default_per_page")]
    pub per_page: u64,
}

impl ListParams {
    #[must_use]
    pub fn clamped(&self) -> (u64, u64) {
        (self.page.max(1), self.per_page.max(1))
    }
}

/// Build a 404 response shaped as the [`ApiError`] envelope.
pub fn not_found(message: &str) -> Response {
    let error = ApiError {
        code: "not_found".to_string(),
        message: message.to_string(),
        details: None,
    };
    (StatusCode::NOT_FOUND, Json(error)).into_response()
}

/// Collapse SeaORM `DbErr` into a panic so cold error regions live in one helper.
pub async fn db_ok<T>(fut: impl Future<Output = std::result::Result<T, DbErr>>) -> T {
    match fut.await {
        Ok(v) => v,
        Err(e) => panic!("database error: {e}"),
    }
}

pub async fn find_optional<T>(
    fut: impl Future<Output = std::result::Result<Option<T>, DbErr>>,
) -> Option<T> {
    db_ok(fut).await
}

/// Shared list pagination.
pub async fn fetch_page<E>(
    db: &DatabaseConnection,
    query: Select<E>,
    params: ListParams,
) -> (Vec<E::Model>, u64, u64, u64)
where
    E: EntityTrait,
    E::Model: Send + Sync,
{
    let (page, per_page) = params.clamped();
    let paginator = PaginatorTrait::paginate(query, db, per_page);
    let total = db_ok(paginator.num_items_and_pages()).await.number_of_items;
    let items = db_ok(paginator.fetch_page(page - 1)).await;
    (items, total, page, per_page)
}
