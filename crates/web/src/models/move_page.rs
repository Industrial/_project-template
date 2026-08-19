use serde::{Deserialize, Serialize};

use super::{DomainError, DomainResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MovePage {
    pub page_id: i64,
    pub new_parent_page_id: Option<i64>,
}

impl MovePage {
    pub fn validate_no_self_parent(&self) -> DomainResult<()> {
        if self.new_parent_page_id == Some(self.page_id) {
            return Err(DomainError::Validation(
                "page cannot be its own parent".into(),
            ));
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn move_page_rejects_self_parent() {
        let bad = MovePage {
            page_id: 9,
            new_parent_page_id: Some(9),
        };
        assert!(bad.validate_no_self_parent().is_err());
        let ok = MovePage {
            page_id: 9,
            new_parent_page_id: Some(1),
        };
        assert!(ok.validate_no_self_parent().is_ok());
    }
}
