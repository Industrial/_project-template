use crate::models::BlockModel;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct BlockDto {
    #[ts(type = "number")]
    pub id: i64,
    pub block_type: String,
    pub checked: bool,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "{ text?: string } | null")]
    pub content: Option<Value>,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<BlockModel> for BlockDto {
    fn from(m: BlockModel) -> Self {
        Self {
            id: m.id,
            block_type: m.block_type,
            checked: m.checked,
            position: m.position,
            page_id: m.page_id,
            content: m.content,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreateBlock {
    pub block_type: String,
    pub checked: bool,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "{ text?: string } | null")]
    pub content: Option<Value>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdateBlock {
    pub block_type: String,
    pub checked: bool,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "{ text?: string } | null")]
    pub content: Option<Value>,
}
