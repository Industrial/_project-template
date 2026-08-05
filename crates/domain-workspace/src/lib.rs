use domain_core::{DomainError, DomainResult, MemberRole};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateWorkspace {
  pub name: String,
  pub owner_id: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RenameWorkspace {
  pub workspace_id: i64,
  pub name: String,
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

  #[test]
  fn rename_workspace_reuses_name_rules() {
    let rename = RenameWorkspace {
      workspace_id: 1,
      name: "Renamed".into(),
    };
    assert!(rename.validate().is_ok());
  }
}
