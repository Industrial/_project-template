use loco_rs::prelude::*;
use serial_test::serial;
use test_loco_webapp::{
    app::App,
    workers::downloader::{DownloadWorker, DownloadWorkerArgs},
};

#[tokio::test]
#[serial]
async fn download_worker_perform_ok() {
    let boot = boot_test::<App>().await.unwrap();
    let worker = DownloadWorker::build(&boot.app_context);
    assert!(
        worker
            .perform(DownloadWorkerArgs {
                user_guid: "guid".into(),
            })
            .await
            .is_ok()
    );
}
