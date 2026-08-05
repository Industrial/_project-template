use sea_orm::prelude::DateTimeWithTimeZone;
use ts_rs::TS;

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct WorkspaceMemberDto {
    #[ts(type = "number")]
    pub id: i64,
    pub role: String,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<crate::models::_entities::workspace_members::Model> for WorkspaceMemberDto {
    fn from(m: crate::models::_entities::workspace_members::Model) -> Self {
        Self {
            id: m.id,
            role: m.role,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreateWorkspaceMember {
    pub role: String,
    #[ts(type = "number")]
    pub workspace_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
}

#[derive(serde::Serialize, serde::Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdateWorkspaceMember {
    pub role: String,
}
