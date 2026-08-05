use loco_rs::testing::prelude::*;
use sea_orm::{ActiveModelTrait, IntoActiveModel, ModelTrait, Set};
use serial_test::serial;
use test_loco_webapp::{
    app::App,
    models::{
        _entities::{blocks, comments, page_shares, pages, workspace_members, workspaces},
        users::{self, RegisterParams},
    },
};

#[tokio::test]
#[serial]
async fn exercise_entity_relations_and_before_save() {
    let boot = boot_test::<App>().await.expect("boot");
    let db = &boot.app_context.db;

    let user = users::Model::create_with_password(
        db,
        &RegisterParams {
            email: "rel@example.com".into(),
            password: "12341234".into(),
            name: "rel".into(),
        },
    )
    .await
    .expect("user");

    let workspace = workspaces::ActiveModel {
        name: Set("ws".into()),
        user_id: Set(user.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("workspace");

    let page = pages::ActiveModel {
        title: Set("p".into()),
        position: Set(0),
        workspace_id: Set(workspace.id),
        user_id: Set(user.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("page");

    // ActiveModelBehavior before_save on update
    let mut active = page.clone().into_active_model();
    active.title = Set("p2".into());
    let page = active.update(db).await.expect("page update");

    let block = blocks::ActiveModel {
        block_type: Set("paragraph".into()),
        checked: Set(false),
        position: Set(0),
        page_id: Set(page.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("block");

    let comment = comments::ActiveModel {
        body: Set("c".into()),
        page_id: Set(page.id),
        user_id: Set(user.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("comment");

    let share = page_shares::ActiveModel {
        permission: Set("view".into()),
        page_id: Set(page.id),
        user_id: Set(user.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("share");

    let member = workspace_members::ActiveModel {
        role: Set("owner".into()),
        workspace_id: Set(workspace.id),
        user_id: Set(user.id),
        ..Default::default()
    }
    .insert(db)
    .await
    .expect("member");

    // find_related covers Related::to
    let _ = user.find_related(workspaces::Entity).all(db).await.unwrap();
    let _ = user.find_related(pages::Entity).all(db).await.unwrap();
    let _ = user.find_related(comments::Entity).all(db).await.unwrap();
    let _ = user
        .find_related(page_shares::Entity)
        .all(db)
        .await
        .unwrap();
    let _ = user
        .find_related(workspace_members::Entity)
        .all(db)
        .await
        .unwrap();

    let _ = workspace.find_related(pages::Entity).all(db).await.unwrap();
    let _ = workspace.find_related(users::Entity).one(db).await.unwrap();
    let _ = workspace
        .find_related(workspace_members::Entity)
        .all(db)
        .await
        .unwrap();

    let _ = page.find_related(blocks::Entity).all(db).await.unwrap();
    let _ = page.find_related(comments::Entity).all(db).await.unwrap();
    let _ = page
        .find_related(page_shares::Entity)
        .all(db)
        .await
        .unwrap();
    let _ = page.find_related(users::Entity).one(db).await.unwrap();
    let _ = page.find_related(workspaces::Entity).one(db).await.unwrap();

    let _ = block.find_related(pages::Entity).one(db).await.unwrap();
    let _ = comment.find_related(pages::Entity).one(db).await.unwrap();
    let _ = comment.find_related(users::Entity).one(db).await.unwrap();
    let _ = share.find_related(pages::Entity).one(db).await.unwrap();
    let _ = share.find_related(users::Entity).one(db).await.unwrap();
    let _ = member.find_related(users::Entity).one(db).await.unwrap();
    let _ = member
        .find_related(workspaces::Entity)
        .one(db)
        .await
        .unwrap();

    assert_eq!(page.title, "p2");
}
