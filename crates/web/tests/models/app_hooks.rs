use loco_rs::{app::Hooks, bgworker::Queue, prelude::Task, task::Tasks, testing::prelude::*};
use serial_test::serial;
use test_loco_webapp::{app::App, tasks::user_create::UserCreate};

#[test]
fn app_metadata_and_task_registration() {
    assert!(!App::app_name().is_empty());
    assert!(App::app_version().contains('.'));

    let mut tasks = Tasks::default();
    App::register_tasks(&mut tasks);

    let info = UserCreate.task();
    assert_eq!(info.name, "user:create");
    assert!(info.detail.contains("email"));
}

#[tokio::test]
#[serial]
async fn app_hooks_initializers_truncate_and_workers() {
    let boot = boot_test::<App>().await.expect("boot");
    let ctx = &boot.app_context;

    let initializers = App::initializers(ctx).await.expect("initializers");
    assert!(initializers.is_empty());

    App::truncate(ctx).await.expect("truncate");

    let queue = Queue::empty();
    App::connect_workers(ctx, &queue)
        .await
        .expect("connect_workers");
}
