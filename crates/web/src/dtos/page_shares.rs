use sea_orm::prelude::DateTimeWithTimeZone;
use ts_rs::TS;

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct PageShareDto {
    #[ts(type = "number")]
    pub id: i64,
    pub permission: String,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<crate::models::_entities::page_shares::Model> for PageShareDto {
    fn from(m: crate::models::_entities::page_shares::Model) -> Self {
        Self {
            id: m.id,
            permission: m.permission,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreatePageShare {
    pub permission: String,
    #[ts(type = "number")]
    pub page_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdatePageShare {
    pub permission: String,
}
