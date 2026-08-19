use serde::{Deserialize, Serialize};

use super::{DomainError, DomainResult, MemberRole};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkspace {
    pub name: String,
    pub owner_id: i64,
}

impl CreateWorkspace {
    pub fn validate(&self) -> DomainResult<()> {
        let name = self.name.trim();
        if name.is_empty() {
            return Err(DomainError::Validation("workspace name is required".into()));
        }
        if name.len() > 120 {
            return Err(DomainError::Validation("workspace name is too long".into()));
        }
        Ok(())
    }

    pub fn normalized_name(&self) -> String {
        self.name.trim().to_string()
    }

    pub fn owner_role() -> MemberRole {
        MemberRole::Owner
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_workspace_validates_and_normalizes() {
        let ok = CreateWorkspace {
            name: "  Notes  ".into(),
            owner_id: 1,
        };
        assert!(ok.validate().is_ok());
        assert_eq!(ok.normalized_name(), "Notes");
        assert_eq!(CreateWorkspace::owner_role(), MemberRole::Owner);

        let empty = CreateWorkspace {
            name: "   ".into(),
            owner_id: 1,
        };
        assert!(empty.validate().is_err());

        let long = CreateWorkspace {
            name: "x".repeat(121),
            owner_id: 1,
        };
        assert!(long.validate().is_err());
    }
}
