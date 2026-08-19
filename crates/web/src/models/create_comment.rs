use serde::{Deserialize, Serialize};

use super::{DomainError, DomainResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateComment {
    pub page_id: i64,
    pub block_id: Option<i64>,
    pub author_id: i64,
    pub body: String,
}

impl CreateComment {
    pub fn validate(&self) -> DomainResult<()> {
        let body = self.body.trim();
        if body.is_empty() {
            return Err(DomainError::Validation("comment body is required".into()));
        }
        if body.len() > 8_000 {
            return Err(DomainError::Validation("comment body is too long".into()));
        }
        Ok(())
    }

    pub fn normalized_body(&self) -> String {
        self.body.trim().to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_comment_validates_and_normalizes() {
        let ok = CreateComment {
            page_id: 1,
            block_id: None,
            author_id: 2,
            body: "  hi  ".into(),
        };
        assert!(ok.validate().is_ok());
        assert_eq!(ok.normalized_body(), "hi");

        assert!(
            CreateComment {
                page_id: 1,
                block_id: None,
                author_id: 2,
                body: " ".into(),
            }
            .validate()
            .is_err()
        );

        assert!(
            CreateComment {
                page_id: 1,
                block_id: Some(3),
                author_id: 2,
                body: "x".repeat(8_001),
            }
            .validate()
            .is_err()
        );
    }
}
