use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemberRole {
    Owner,
    Admin,
    Editor,
    Commenter,
    Viewer,
}

impl MemberRole {
    pub fn as_str(self) -> &'static str {
        match self {
            Self::Owner => "owner",
            Self::Admin => "admin",
            Self::Editor => "editor",
            Self::Commenter => "commenter",
            Self::Viewer => "viewer",
        }
    }

    pub fn parse(value: &str) -> Option<Self> {
        match value {
            "owner" => Some(Self::Owner),
            "admin" => Some(Self::Admin),
            "editor" => Some(Self::Editor),
            "commenter" => Some(Self::Commenter),
            "viewer" => Some(Self::Viewer),
            _ => None,
        }
    }

    pub fn can_manage_members(self) -> bool {
        matches!(self, Self::Owner | Self::Admin)
    }

    pub fn can_edit(self) -> bool {
        matches!(self, Self::Owner | Self::Admin | Self::Editor)
    }

    pub fn can_comment(self) -> bool {
        matches!(
            self,
            Self::Owner | Self::Admin | Self::Editor | Self::Commenter
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn member_role_roundtrip_and_caps() {
        for role in [
            MemberRole::Owner,
            MemberRole::Admin,
            MemberRole::Editor,
            MemberRole::Commenter,
            MemberRole::Viewer,
        ] {
            assert_eq!(MemberRole::parse(role.as_str()), Some(role));
        }
        assert_eq!(MemberRole::parse("nope"), None);
        assert!(MemberRole::Owner.can_manage_members());
        assert!(MemberRole::Admin.can_edit());
        assert!(MemberRole::Commenter.can_comment());
        assert!(!MemberRole::Viewer.can_edit());
    }
}
