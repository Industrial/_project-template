use super::{DomainError, DomainResult, MemberRole, PagePermission};

#[derive(Debug, Clone, Copy)]
pub struct AccessContext {
    pub member_role: Option<MemberRole>,
    pub page_permission: Option<PagePermission>,
}

impl AccessContext {
    pub fn can_view(self) -> bool {
        self.member_role.is_some() || self.page_permission.is_some()
    }

    pub fn can_edit(self) -> bool {
        self.member_role.is_some_and(MemberRole::can_edit)
            || self.page_permission.is_some_and(PagePermission::can_edit)
    }

    pub fn can_comment(self) -> bool {
        self.member_role.is_some_and(MemberRole::can_comment)
            || self
                .page_permission
                .is_some_and(PagePermission::can_comment)
    }

    pub fn require_view(self) -> DomainResult<()> {
        if self.can_view() {
            Ok(())
        } else {
            Err(DomainError::Forbidden)
        }
    }

    pub fn require_edit(self) -> DomainResult<()> {
        if self.can_edit() {
            Ok(())
        } else {
            Err(DomainError::Forbidden)
        }
    }

    pub fn require_comment(self) -> DomainResult<()> {
        if self.can_comment() {
            Ok(())
        } else {
            Err(DomainError::Forbidden)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn access_context_roles_and_shares() {
        let denied = AccessContext {
            member_role: None,
            page_permission: None,
        };
        assert!(!denied.can_view());
        assert!(denied.require_view().is_err());
        assert!(denied.require_comment().is_err());

        let viewer = AccessContext {
            member_role: Some(MemberRole::Viewer),
            page_permission: None,
        };
        assert!(viewer.can_view());
        assert!(viewer.require_view().is_ok());
        assert!(!viewer.can_edit());
        assert!(viewer.require_edit().is_err());

        let shared_edit = AccessContext {
            member_role: None,
            page_permission: Some(PagePermission::Edit),
        };
        assert!(shared_edit.can_edit());
        assert!(shared_edit.require_edit().is_ok());
        assert!(shared_edit.require_comment().is_ok());

        let commenter = AccessContext {
            member_role: Some(MemberRole::Commenter),
            page_permission: None,
        };
        assert!(commenter.can_comment());
        assert!(!commenter.can_edit());
    }
}
