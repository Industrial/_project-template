#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;
mod m20220101_000001_users;

mod m20260805_074244_workspaces;
mod m20260805_074259_workspace_members;
mod m20260805_074315_pages;
mod m20260805_074330_blocks;
mod m20260805_074346_page_shares;
mod m20260805_074401_comments;
mod m20260805_080000_notion_nesting;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
      Box::new(m20220101_000001_users::Migration),
      Box::new(m20260805_074244_workspaces::Migration),
      Box::new(m20260805_074259_workspace_members::Migration),
      Box::new(m20260805_074315_pages::Migration),
      Box::new(m20260805_074330_blocks::Migration),
      Box::new(m20260805_074346_page_shares::Migration),
      Box::new(m20260805_074401_comments::Migration),
      Box::new(m20260805_080000_notion_nesting::Migration),
      // inject-above (do not remove this comment)
    ]
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use sea_orm::Database;

  #[test]
  fn migrator_registers_all_migrations() {
    let migrations = Migrator::migrations();
    assert_eq!(migrations.len(), 8);
    let names: Vec<_> = migrations.iter().map(|m| m.name().to_string()).collect();
    assert!(names.iter().any(|n| n.contains("users")));
    assert!(names.iter().any(|n| n.contains("workspaces")));
    assert!(names.iter().any(|n| n.contains("notion_nesting")));
  }

  #[tokio::test]
  async fn migrator_up_and_down_on_sqlite() {
    let db = Database::connect("sqlite::memory:?mode=rwc")
      .await
      .expect("sqlite memory");
    Migrator::up(&db, None).await.expect("migrate up");
    Migrator::down(&db, None).await.expect("migrate down");
  }
}
