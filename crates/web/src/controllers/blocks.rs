#![allow(clippy::unused_async)]

use axum::http::StatusCode;
use loco_rs::prelude::auth::JWT;
use loco_rs::prelude::*;
use sea_orm::{ColumnTrait, QueryFilter, QueryOrder};

use crate::controllers::common::{ListParams, db_ok, fetch_page, find_optional, not_found};
use crate::dtos::blocks::{BlockDto, CreateBlock, UpdateBlock};
use crate::dtos::common::Page;
use crate::models::blocks::{ActiveModel, Column, Entity};

#[debug_handler]
async fn list(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Query(params): Query<ListParams>,
) -> Result<Json<Page<BlockDto>>> {
    let mut query = Entity::find().order_by_asc(Column::Position);
    if let Some(page_id) = params.page_id {
        query = query.filter(Column::PageId.eq(page_id));
    }
    let (items, total, page, per_page) = fetch_page(&ctx.db, query, params).await;
    Ok(Json(Page {
        items: items.into_iter().map(BlockDto::from).collect(),
        total,
        page,
        per_page,
    }))
}

#[debug_handler]
async fn get_one(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("block not found"));
    };
    Ok(Json(BlockDto::from(model)).into_response())
}

#[debug_handler]
async fn create(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateBlock>,
) -> Result<Response> {
    let item = ActiveModel {
        block_type: Set(params.block_type),
        checked: Set(params.checked),
        position: Set(params.position),
        page_id: Set(params.page_id),
        content: Set(params.content),
        ..Default::default()
    };
    let item = db_ok(item.insert(&ctx.db)).await;

    Ok((StatusCode::CREATED, Json(BlockDto::from(item))).into_response())
}

#[debug_handler]
async fn update(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(params): Json<UpdateBlock>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("block not found"));
    };

    let mut item = model.into_active_model();
    item.block_type = Set(params.block_type);
    item.checked = Set(params.checked);
    item.position = Set(params.position);
    item.content = Set(params.content);
    let item = db_ok(item.update(&ctx.db)).await;

    Ok(Json(BlockDto::from(item)).into_response())
}

#[debug_handler]
async fn remove(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("block not found"));
    };

    db_ok(model.into_active_model().delete(&ctx.db)).await;

    Ok(StatusCode::NO_CONTENT.into_response())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/blocks")
        .add("/", get(list))
        .add("/", post(create))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
