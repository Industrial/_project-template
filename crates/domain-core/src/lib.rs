use serde::{Deserialize, Serialize};
use thiserror::Error;

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

#[derive(Debug, Error)]
pub enum DomainError {
  #[error("{0}")]
  Validation(String),
  #[error("forbidden")]
  Forbidden,
  #[error("not found")]
  NotFound,
}

pub type DomainResult<T> = Result<T, DomainError>;

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
