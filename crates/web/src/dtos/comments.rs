use crate::models::CommentModel;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CommentDto {
    #[ts(type = "number")]
    pub id: i64,
    pub body: String,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<CommentModel> for CommentDto {
    fn from(m: CommentModel) -> Self {
        Self {
            id: m.id,
            body: m.body,
            page_id: m.page_id,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreateComment {
    pub body: String,
    #[ts(type = "number")]
    pub page_id: i64,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdateComment {
    pub body: String,
}
