use serde::{Deserialize, Serialize};

use super::{DomainError, DomainResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreatePage {
    pub workspace_id: i64,
    pub parent_page_id: Option<i64>,
    pub title: String,
    pub created_by: i64,
}

impl CreatePage {
    pub fn validate(&self) -> DomainResult<()> {
        let title = self.title.trim();
        if title.is_empty() {
            return Err(DomainError::Validation("page title is required".into()));
        }
        if title.len() > 300 {
            return Err(DomainError::Validation("page title is too long".into()));
        }
        Ok(())
    }

    pub fn normalized_title(&self) -> String {
        self.title.trim().to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_page_validates_and_normalizes() {
        let ok = CreatePage {
            workspace_id: 1,
            parent_page_id: None,
            title: "  Hello  ".into(),
            created_by: 2,
        };
        assert!(ok.validate().is_ok());
        assert_eq!(ok.normalized_title(), "Hello");

        assert!(
            CreatePage {
                workspace_id: 1,
                parent_page_id: None,
                title: " ".into(),
                created_by: 2,
            }
            .validate()
            .is_err()
        );

        assert!(
            CreatePage {
                workspace_id: 1,
                parent_page_id: None,
                title: "x".repeat(301),
                created_by: 2,
            }
            .validate()
            .is_err()
        );
    }
}
