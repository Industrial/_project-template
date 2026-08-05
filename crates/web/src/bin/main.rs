use loco_rs::cli;
use migration::Migrator;
use test_loco_webapp::app::App;

#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    cli::main::<App, Migrator>().await
}
