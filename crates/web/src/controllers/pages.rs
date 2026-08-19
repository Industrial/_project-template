#![allow(clippy::unused_async)]

use axum::http::StatusCode;
use loco_rs::prelude::auth::{JWT, JWTWithUser};
use loco_rs::prelude::*;
use sea_orm::{ColumnTrait, QueryFilter, QueryOrder};

use crate::controllers::common::{ListParams, db_ok, fetch_page, find_optional, not_found};
use crate::dtos::common::Page;
use crate::dtos::pages::{CreatePage, PageDto, UpdatePage};
use crate::models::UserModel;
use crate::models::pages::{ActiveModel, Column, Entity};

#[debug_handler]
async fn list(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Query(params): Query<ListParams>,
) -> Result<Json<Page<PageDto>>> {
    let mut query = Entity::find().order_by_asc(Column::Position);
    if let Some(workspace_id) = params.workspace_id {
        query = query.filter(Column::WorkspaceId.eq(workspace_id));
    }
    let (items, total, page, per_page) = fetch_page(&ctx.db, query, params).await;
    Ok(Json(Page {
        items: items.into_iter().map(PageDto::from).collect(),
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
        return Ok(not_found("page not found"));
    };
    Ok(Json(PageDto::from(model)).into_response())
}

#[debug_handler]
async fn create(
    auth: JWTWithUser<UserModel>,
    State(ctx): State<AppContext>,
    Json(params): Json<CreatePage>,
) -> Result<Response> {
    let item = ActiveModel {
        title: Set(params.title),
        icon: Set(params.icon),
        position: Set(params.position),
        workspace_id: Set(params.workspace_id),
        parent_page_id: Set(params.parent_page_id),
        user_id: Set(auth.user.id),
        ..Default::default()
    };
    let item = db_ok(item.insert(&ctx.db)).await;

    Ok((StatusCode::CREATED, Json(PageDto::from(item))).into_response())
}

#[debug_handler]
async fn update(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(params): Json<UpdatePage>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("page not found"));
    };

    let mut item = model.into_active_model();
    item.title = Set(params.title);
    item.icon = Set(params.icon);
    item.position = Set(params.position);
    item.parent_page_id = Set(params.parent_page_id);
    let item = db_ok(item.update(&ctx.db)).await;

    Ok(Json(PageDto::from(item)).into_response())
}

#[debug_handler]
async fn remove(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("page not found"));
    };

    db_ok(model.into_active_model().delete(&ctx.db)).await;

    Ok(StatusCode::NO_CONTENT.into_response())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/pages")
        .add("/", get(list))
        .add("/", post(create))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
