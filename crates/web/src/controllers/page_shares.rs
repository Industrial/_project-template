#![allow(clippy::unused_async)]
use super::common::{self, ListParams};
use axum::http::StatusCode;
use loco_rs::prelude::*;
use sea_orm::QueryOrder;

use crate::{
    dtos::{
        common::Page,
        page_shares::{CreatePageShare, PageShareDto, UpdatePageShare},
    },
    models::_entities::page_shares::{ActiveModel, Column, Entity},
};

#[debug_handler]
async fn list(
    _auth: auth::JWT,
    State(ctx): State<AppContext>,
    Query(params): Query<ListParams>,
) -> Result<Json<Page<PageShareDto>>> {
    let (items, total, page, per_page) =
        common::fetch_page(&ctx.db, Entity::find().order_by_asc(Column::Id), params).await;
    Ok(Json(Page {
        items: items.into_iter().map(PageShareDto::from).collect(),
        total,
        page,
        per_page,
    }))
}

#[debug_handler]
async fn get_one(
    _auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = common::find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(common::not_found("page_share not found"));
    };
    Ok(Json(PageShareDto::from(model)).into_response())
}

#[debug_handler]
async fn create(
    _auth: auth::JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreatePageShare>,
) -> Result<Response> {
    let item = ActiveModel {
        permission: Set(params.permission),
        page_id: Set(params.page_id),
        user_id: Set(params.user_id),
        ..Default::default()
    };
    let item = common::db_ok(item.insert(&ctx.db)).await;

    Ok((StatusCode::CREATED, Json(PageShareDto::from(item))).into_response())
}

#[debug_handler]
async fn update(
    _auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(params): Json<UpdatePageShare>,
) -> Result<Response> {
    let Some(model) = common::find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(common::not_found("page_share not found"));
    };

    let mut item = model.into_active_model();
    item.permission = Set(params.permission);
    let item = common::db_ok(item.update(&ctx.db)).await;

    Ok(Json(PageShareDto::from(item)).into_response())
}

#[debug_handler]
async fn remove(
    _auth: auth::JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = common::find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(common::not_found("page_share not found"));
    };

    common::db_ok(model.into_active_model().delete(&ctx.db)).await;

    Ok(StatusCode::NO_CONTENT.into_response())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/page_shares")
        .add("/", get(list))
        .add("/", post(create))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
