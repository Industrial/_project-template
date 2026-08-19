use loco_rs::Result;
use loco_rs::cli::main as cli_main;
use migration::Migrator;
use test_loco_webapp::app::App;

#[tokio::main]
async fn main() -> Result<()> {
    cli_main::<App, Migrator>().await
}
