use crate::models::PageModel;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct PageDto {
    #[ts(type = "number")]
    pub id: i64,
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number")]
    pub workspace_id: i64,
    #[ts(type = "number | null")]
    pub parent_page_id: Option<i64>,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<PageModel> for PageDto {
    fn from(m: PageModel) -> Self {
        Self {
            id: m.id,
            title: m.title,
            icon: m.icon,
            position: m.position,
            workspace_id: m.workspace_id,
            parent_page_id: m.parent_page_id,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreatePage {
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number")]
    pub workspace_id: i64,
    #[ts(type = "number | null")]
    pub parent_page_id: Option<i64>,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdatePage {
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number | null")]
    pub parent_page_id: Option<i64>,
}
