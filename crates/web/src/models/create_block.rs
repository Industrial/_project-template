use serde::{Deserialize, Serialize};
use serde_json::{Value, json};

use super::{BlockType, DomainError, DomainResult};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateBlock {
    pub page_id: i64,
    pub parent_block_id: Option<i64>,
    pub block_type: BlockType,
    pub text: String,
    pub checked: Option<bool>,
    pub position: i32,
}

impl CreateBlock {
    pub fn validate(&self) -> DomainResult<()> {
        if self.block_type == BlockType::Divider && !self.text.trim().is_empty() {
            return Err(DomainError::Validation(
                "divider blocks have no text".into(),
            ));
        }
        if self.text.len() > 20_000 {
            return Err(DomainError::Validation("block text is too long".into()));
        }
        if self.position < 0 {
            return Err(DomainError::Validation("position must be >= 0".into()));
        }
        Ok(())
    }

    pub fn content_json(&self) -> Value {
        json!({ "text": self.text })
    }

    pub fn checked_value(&self) -> bool {
        self.checked.unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn block(block_type: BlockType, text: &str) -> CreateBlock {
        CreateBlock {
            page_id: 1,
            parent_block_id: None,
            block_type,
            text: text.into(),
            checked: None,
            position: 0,
        }
    }

    #[test]
    fn validates_divider_text_and_position() {
        assert!(block(BlockType::Paragraph, "hi").validate().is_ok());
        assert!(block(BlockType::Divider, "nope").validate().is_err());
        assert!(block(BlockType::Divider, "").validate().is_ok());

        let mut long = block(BlockType::Paragraph, &"x".repeat(20_001));
        assert!(long.validate().is_err());

        long = block(BlockType::Paragraph, "ok");
        long.position = -1;
        assert!(long.validate().is_err());
    }

    #[test]
    fn content_json_and_checked_default() {
        let b = block(BlockType::Todo, "task");
        assert_eq!(b.content_json()["text"], "task");
        assert!(!b.checked_value());
    }
}
