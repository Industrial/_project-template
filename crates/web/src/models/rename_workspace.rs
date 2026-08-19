use serde::{Deserialize, Serialize};

use super::{CreateWorkspace, DomainResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenameWorkspace {
    pub workspace_id: i64,
    pub name: String,
}

impl RenameWorkspace {
    pub fn validate(&self) -> DomainResult<()> {
        CreateWorkspace {
            name: self.name.clone(),
            owner_id: 0,
        }
        .validate()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rename_workspace_reuses_name_rules() {
        let rename = RenameWorkspace {
            workspace_id: 1,
            name: "Renamed".into(),
        };
        assert!(rename.validate().is_ok());
    }
}
