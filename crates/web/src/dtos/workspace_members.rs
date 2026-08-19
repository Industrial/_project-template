use crate::models::WorkspaceMemberModel;
use sea_orm::prelude::DateTimeWithTimeZone;
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct WorkspaceMemberDto {
    #[ts(type = "number")]
    pub id: i64,
    pub role: String,
    #[ts(type = "number")]
    pub workspace_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
    #[ts(type = "string")]
    pub created_at: DateTimeWithTimeZone,
    #[ts(type = "string")]
    pub updated_at: DateTimeWithTimeZone,
}

impl From<WorkspaceMemberModel> for WorkspaceMemberDto {
    fn from(m: WorkspaceMemberModel) -> Self {
        Self {
            id: m.id,
            role: m.role,
            workspace_id: m.workspace_id,
            user_id: m.user_id,
            created_at: m.created_at,
            updated_at: m.updated_at,
        }
    }
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct CreateWorkspaceMember {
    pub role: String,
    #[ts(type = "number")]
    pub workspace_id: i64,
    #[ts(type = "number")]
    pub user_id: i64,
}

#[derive(Serialize, Deserialize, TS)]
#[ts(export, export_to = "../frontend/src/bindings/")]
pub struct UpdateWorkspaceMember {
    pub role: String,
}
