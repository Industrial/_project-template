use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BlockType {
    Paragraph,
    Heading1,
    Heading2,
    Heading3,
    Todo,
    Bullet,
    Numbered,
    Quote,
    Divider,
    Code,
}

impl BlockType {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Paragraph => "paragraph",
            Self::Heading1 => "heading_1",
            Self::Heading2 => "heading_2",
            Self::Heading3 => "heading_3",
            Self::Todo => "todo",
            Self::Bullet => "bullet",
            Self::Numbered => "numbered",
            Self::Quote => "quote",
            Self::Divider => "divider",
            Self::Code => "code",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "paragraph" => Some(Self::Paragraph),
            "heading_1" => Some(Self::Heading1),
            "heading_2" => Some(Self::Heading2),
            "heading_3" => Some(Self::Heading3),
            "todo" => Some(Self::Todo),
            "bullet" => Some(Self::Bullet),
            "numbered" => Some(Self::Numbered),
            "quote" => Some(Self::Quote),
            "divider" => Some(Self::Divider),
            "code" => Some(Self::Code),
            _ => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn block_type_roundtrip() {
        for ty in [
            BlockType::Paragraph,
            BlockType::Heading1,
            BlockType::Heading2,
            BlockType::Heading3,
            BlockType::Todo,
            BlockType::Bullet,
            BlockType::Numbered,
            BlockType::Quote,
            BlockType::Divider,
            BlockType::Code,
        ] {
            assert_eq!(BlockType::parse(ty.as_str()), Some(ty));
        }
        assert_eq!(BlockType::parse("nope"), None);
    }
}
