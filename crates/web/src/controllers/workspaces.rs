#![allow(clippy::unused_async)]

use axum::http::StatusCode;
use loco_rs::prelude::auth::{JWT, JWTWithUser};
use loco_rs::prelude::*;
use sea_orm::{QueryOrder, TransactionTrait};

use crate::controllers::common::{ListParams, db_ok, fetch_page, find_optional, not_found};
use crate::dtos::common::{ApiError, Page};
use crate::dtos::workspaces::{CreateWorkspace, UpdateWorkspace, WorkspaceDto};
use crate::models::workspace_members::ActiveModel as WorkspaceMemberActiveModel;
use crate::models::workspaces::{ActiveModel, Column, Entity};
use crate::models::{CreateWorkspace as CreateWorkspaceCmd, MemberRole, UserModel};

#[debug_handler]
async fn list(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Query(params): Query<ListParams>,
) -> Result<Json<Page<WorkspaceDto>>> {
    let (items, total, page, per_page) =
        fetch_page(&ctx.db, Entity::find().order_by_asc(Column::Id), params).await;
    Ok(Json(Page {
        items: items.into_iter().map(WorkspaceDto::from).collect(),
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
        return Ok(not_found("workspace not found"));
    };
    Ok(Json(WorkspaceDto::from(model)).into_response())
}

#[debug_handler]
async fn create(
    auth: JWTWithUser<UserModel>,
    State(ctx): State<AppContext>,
    Json(params): Json<CreateWorkspace>,
) -> Result<Response> {
    let cmd = CreateWorkspaceCmd {
        name: params.name.clone(),
        owner_id: auth.user.id,
    };
    if let Err(err) = cmd.validate() {
        let error = ApiError {
            code: "validation".to_string(),
            message: err.to_string(),
            details: None,
        };
        return Ok((StatusCode::BAD_REQUEST, Json(error)).into_response());
    }

    let txn = db_ok(ctx.db.begin()).await;
    let item = db_ok(
        ActiveModel {
            name: Set(cmd.normalized_name()),
            user_id: Set(auth.user.id),
            ..Default::default()
        }
        .insert(&txn),
    )
    .await;

    db_ok(
        WorkspaceMemberActiveModel {
            role: Set(MemberRole::Owner.as_str().to_string()),
            workspace_id: Set(item.id),
            user_id: Set(auth.user.id),
            ..Default::default()
        }
        .insert(&txn),
    )
    .await;

    db_ok(txn.commit()).await;

    Ok((StatusCode::CREATED, Json(WorkspaceDto::from(item))).into_response())
}

#[debug_handler]
async fn update(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
    Json(params): Json<UpdateWorkspace>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("workspace not found"));
    };

    let mut item = model.into_active_model();
    item.name = Set(params.name);
    let item = db_ok(item.update(&ctx.db)).await;

    Ok(Json(WorkspaceDto::from(item)).into_response())
}

#[debug_handler]
async fn remove(
    _auth: JWT,
    State(ctx): State<AppContext>,
    Path(id): Path<i64>,
) -> Result<Response> {
    let Some(model) = find_optional(Entity::find_by_id(id).one(&ctx.db)).await else {
        return Ok(not_found("workspace not found"));
    };

    db_ok(model.into_active_model().delete(&ctx.db)).await;

    Ok(StatusCode::NO_CONTENT.into_response())
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("/api/workspaces")
        .add("/", get(list))
        .add("/", post(create))
        .add("/{id}", get(get_one))
        .add("/{id}", put(update))
        .add("/{id}", delete(remove))
}
