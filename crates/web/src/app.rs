use async_trait::async_trait;
use loco_rs::Result;
use loco_rs::app::{AppContext, Hooks, Initializer};
use loco_rs::bgworker::{BackgroundWorker, Queue};
use loco_rs::boot::{BootResult, StartMode, create_app};
use loco_rs::config::Config;
use loco_rs::controller::AppRoutes;
use loco_rs::db::{seed, truncate_table};
use loco_rs::environment::Environment;
use loco_rs::task::Tasks;
use migration::Migrator;
use std::path::Path;

use crate::controllers::auth::routes as auth_routes;
use crate::controllers::blocks::routes as blocks_routes;
use crate::controllers::comments::routes as comments_routes;
use crate::controllers::page_shares::routes as page_shares_routes;
use crate::controllers::pages::routes as pages_routes;
use crate::controllers::workspace_members::routes as workspace_members_routes;
use crate::controllers::workspaces::routes as workspaces_routes;
use crate::models::users::{ActiveModel as UserActiveModel, Entity as UserEntity};
use crate::tasks::user_create::UserCreate;
use crate::workers::downloader::DownloadWorker;

pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_CRATE_NAME")
    }

    fn app_version() -> String {
        format!(
            "{} ({})",
            env!("CARGO_PKG_VERSION"),
            option_env!("BUILD_SHA")
                .or(option_env!("GITHUB_SHA"))
                .unwrap_or("dev")
        )
    }

    async fn boot(
        mode: StartMode,
        environment: &Environment,
        config: Config,
    ) -> Result<BootResult> {
        create_app::<Self, Migrator>(mode, environment, config).await
    }

    async fn initializers(_ctx: &AppContext) -> Result<Vec<Box<dyn Initializer>>> {
        Ok(vec![])
    }

    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes() // controller routes below
            .add_route(comments_routes())
            .add_route(page_shares_routes())
            .add_route(workspace_members_routes())
            .add_route(blocks_routes())
            .add_route(pages_routes())
            .add_route(workspaces_routes())
            .add_route(auth_routes())
    }
    async fn connect_workers(ctx: &AppContext, queue: &Queue) -> Result<()> {
        queue.register(DownloadWorker::build(ctx)).await?;
        Ok(())
    }

    #[allow(unused_variables)]
    fn register_tasks(tasks: &mut Tasks) {
        // tasks-inject (do not remove)
        tasks.register(UserCreate);
    }
    async fn truncate(ctx: &AppContext) -> Result<()> {
        truncate_table(&ctx.db, UserEntity).await?;
        Ok(())
    }
    async fn seed(ctx: &AppContext, base: &Path) -> Result<()> {
        seed::<UserActiveModel>(&ctx.db, &base.join("users.yaml").display().to_string()).await?;
        Ok(())
    }
}
