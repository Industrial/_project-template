use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PagePermission {
    Full,
    Edit,
    Comment,
    View,
}

impl PagePermission {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Full => "full",
            Self::Edit => "edit",
            Self::Comment => "comment",
            Self::View => "view",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "full" => Some(Self::Full),
            "edit" => Some(Self::Edit),
            "comment" => Some(Self::Comment),
            "view" => Some(Self::View),
            _ => None,
        }
    }

    pub fn can_edit(self) -> bool {
        matches!(self, Self::Full | Self::Edit)
    }

    pub fn can_comment(self) -> bool {
        matches!(self, Self::Full | Self::Edit | Self::Comment)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_permission_roundtrip_and_caps() {
        for perm in [
            PagePermission::Full,
            PagePermission::Edit,
            PagePermission::Comment,
            PagePermission::View,
        ] {
            assert_eq!(PagePermission::parse(perm.as_str()), Some(perm));
        }
        assert_eq!(PagePermission::parse("nope"), None);
        assert!(PagePermission::Full.can_edit());
        assert!(PagePermission::Comment.can_comment());
        assert!(!PagePermission::View.can_edit());
    }
}
