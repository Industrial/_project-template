use sea_orm::prelude::DateTimeWithTimeZone;
use ts_rs::TS;

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct PageDto {
    #[ts(type = "number")]
    pub id: i64,
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<crate::models::_entities::pages::Model> for PageDto {
    fn from(m: crate::models::_entities::pages::Model) -> Self {
        Self {
            id: m.id,
            title: m.title,
            icon: m.icon,
            position: m.position,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreatePage {
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
    #[ts(type = "number")]
    pub workspace_id: i64,
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdatePage {
    pub title: String,
    pub icon: Option<String>,
    #[ts(type = "number")]
    pub position: i64,
}
