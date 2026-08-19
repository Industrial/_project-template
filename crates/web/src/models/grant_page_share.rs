use serde::{Deserialize, Serialize};

use super::PagePermission;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GrantPageShare {
    pub page_id: i64,
    pub user_id: i64,
    pub permission: PagePermission,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn grant_page_share_holds_permission() {
        let share = GrantPageShare {
            page_id: 1,
            user_id: 2,
            permission: PagePermission::Comment,
        };
        assert_eq!(share.permission, PagePermission::Comment);
    }
}
