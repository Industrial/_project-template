use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
    // Nested pages + optional block-scoped comments.
    add_column(m, "pages", "parent_page_id", ColType::IntegerNull).await?;
    add_column(m, "blocks", "parent_block_id", ColType::IntegerNull).await?;
    add_column(m, "comments", "block_id", ColType::IntegerNull).await?;
    Ok(())
  }

  async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
    remove_column(m, "comments", "block_id").await?;
    remove_column(m, "blocks", "parent_block_id").await?;
    remove_column(m, "pages", "parent_page_id").await?;
    Ok(())
  }
}
