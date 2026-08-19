use crate::models::PageShareModel;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct PageShareDto {
    #[ts(type = "number")]
    pub id: i64,
    pub permission: String,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<PageShareModel> for PageShareDto {
    fn from(m: PageShareModel) -> Self {
        Self {
            id: m.id,
            permission: m.permission,
            page_id: m.page_id,
            user_id: m.user_id,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreatePageShare {
    pub permission: String,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdatePageShare {
    pub permission: String,
}
