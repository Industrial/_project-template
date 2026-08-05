use loco_rs::schema::*;
use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
  async fn up(&self, m: &SchemaManager) -> Result<(), DbErr> {
    create_table(
      m,
      "blocks",
      &[
        ("id", ColType::PkAuto),
        ("block_type", ColType::String),
        ("content", ColType::JsonNull),
        ("checked", ColType::Boolean),
        ("position", ColType::BigInteger),
      ],
      &[("page", "")],
    )
    .await
  }

  async fn down(&self, m: &SchemaManager) -> Result<(), DbErr> {
    drop_table(m, "blocks").await
  }
}
