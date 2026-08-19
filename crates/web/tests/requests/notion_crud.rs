use loco_rs::testing::prelude::*;
use serial_test::serial;
use test_loco_webapp::app::App;

use super::prepare_data;

#[tokio::test]
#[serial]
async fn notion_crud_happy_path_and_404s() {
    request::<App, _, _>(|request, ctx| async move {
        let user = prepare_data::init_user_login(&request, &ctx).await;
        let (auth_key, auth_value) = prepare_data::auth_header(&user.token);

        // empty list
        let list = request
            .get("/api/workspaces")
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(list.status_code(), 200);

        // 404 get
        let missing = request
            .get("/api/workspaces/999999")
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(missing.status_code(), 404);

        // validation fail
        let bad = request
            .post("/api/workspaces")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({ "name": "   " }))
            .await;
        assert_eq!(bad.status_code(), 400);

        // create workspace
        let created = request
            .post("/api/workspaces")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({ "name": "  Acme  " }))
            .await;
        assert_eq!(created.status_code(), 201);
        let ws: serde_json::Value = serde_json::from_str(&created.text()).unwrap();
        let ws_id = ws["id"].as_i64().unwrap();

        let got = request
            .get(&format!("/api/workspaces/{ws_id}"))
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(got.status_code(), 200);

        let updated = request
            .put(&format!("/api/workspaces/{ws_id}"))
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({ "name": "Acme Renamed" }))
            .await;
        assert_eq!(updated.status_code(), 200);

        let listed = request
            .get("/api/workspaces?page=0&per_page=0")
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(listed.status_code(), 200);

        let listed = request
            .get("/api/workspaces?page=1&per_page=10")
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(listed.status_code(), 200);

        // pages
        assert_eq!(
            request
                .get("/api/pages/999999")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            404
        );
        let page_created = request
            .post("/api/pages")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({
                "title": "Home",
                "icon": "📄",
                "position": 0,
                "workspace_id": ws_id
            }))
            .await;
        assert_eq!(page_created.status_code(), 201);
        let page: serde_json::Value = serde_json::from_str(&page_created.text()).unwrap();
        let page_id = page["id"].as_i64().unwrap();

        assert_eq!(
            request
                .get(&format!("/api/pages/{page_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .put(&format!("/api/pages/{page_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .json(&serde_json::json!({
                    "title": "Home 2",
                    "icon": null,
                    "position": 1,
                    "parent_page_id": null
                }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/pages")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/pages?page=0&per_page=0")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );

        // blocks
        assert_eq!(
            request
                .get("/api/blocks/999999")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            404
        );
        let block_created = request
            .post("/api/blocks")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({
                "block_type": "paragraph",
                "checked": false,
                "position": 0,
                "page_id": page_id,
                "content": { "text": "hello" }
            }))
            .await;
        assert_eq!(block_created.status_code(), 201);
        let block: serde_json::Value = serde_json::from_str(&block_created.text()).unwrap();
        let block_id = block["id"].as_i64().unwrap();
        assert_eq!(
            request
                .get(&format!("/api/blocks/{block_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .put(&format!("/api/blocks/{block_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .json(&serde_json::json!({
                    "block_type": "todo",
                    "checked": true,
                    "position": 2,
                    "content": { "text": "done" }
                }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/blocks")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/blocks?page=0&per_page=0")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );

        // comments
        assert_eq!(
            request
                .get("/api/comments/999999")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            404
        );
        let comment_created = request
            .post("/api/comments")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({
                "body": "hello",
                "page_id": page_id
            }))
            .await;
        assert_eq!(comment_created.status_code(), 201);
        let comment: serde_json::Value = serde_json::from_str(&comment_created.text()).unwrap();
        let comment_id = comment["id"].as_i64().unwrap();
        assert_eq!(
            request
                .put(&format!("/api/comments/{comment_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .json(&serde_json::json!({ "body": "updated" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get(&format!("/api/comments/{comment_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/comments")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/comments?page=0&per_page=0")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );

        // page shares
        assert_eq!(
            request
                .get("/api/page_shares/999999")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            404
        );
        let share_created = request
            .post("/api/page_shares")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({
                "permission": "view",
                "page_id": page_id,
                "user_id": user.user.id
            }))
            .await;
        assert_eq!(share_created.status_code(), 201);
        let share: serde_json::Value = serde_json::from_str(&share_created.text()).unwrap();
        let share_id = share["id"].as_i64().unwrap();
        assert_eq!(
            request
                .put(&format!("/api/page_shares/{share_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .json(&serde_json::json!({ "permission": "edit" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get(&format!("/api/page_shares/{share_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/page_shares")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/page_shares?page=0&per_page=0")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );

        // workspace members (owner already exists from workspace create)
        let members = request
            .get("/api/workspace_members")
            .add_header(auth_key.clone(), auth_value.clone())
            .await;
        assert_eq!(members.status_code(), 200);
        assert_eq!(
            request
                .get("/api/workspace_members?page=0&per_page=0")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        let members_body: serde_json::Value = serde_json::from_str(&members.text()).unwrap();
        let member_id = members_body["items"][0]["id"].as_i64().unwrap();
        assert_eq!(
            request
                .get(&format!("/api/workspace_members/{member_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .put(&format!("/api/workspace_members/{member_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .json(&serde_json::json!({ "role": "admin" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .get("/api/workspace_members/999999")
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            404
        );

        // second member via create
        request
            .post("/api/auth/register")
            .json(&serde_json::json!({
                "name": "other",
                "email": "other@loco.com",
                "password": "12341234"
            }))
            .await;
        let other =
            test_loco_webapp::models::users::Model::find_by_email(&ctx.db, "other@loco.com")
                .await
                .unwrap();
        let member2 = request
            .post("/api/workspace_members")
            .add_header(auth_key.clone(), auth_value.clone())
            .json(&serde_json::json!({
                "role": "viewer",
                "workspace_id": ws_id,
                "user_id": other.id
            }))
            .await;
        assert_eq!(member2.status_code(), 201);
        let member2_body: serde_json::Value = serde_json::from_str(&member2.text()).unwrap();
        let member2_id = member2_body["id"].as_i64().unwrap();

        // deletes (children first)
        assert_eq!(
            request
                .delete(&format!("/api/page_shares/{share_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/comments/{comment_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/blocks/{block_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/pages/{page_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/workspace_members/{member2_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/workspace_members/{member_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );
        assert_eq!(
            request
                .delete(&format!("/api/workspaces/{ws_id}"))
                .add_header(auth_key.clone(), auth_value.clone())
                .await
                .status_code(),
            204
        );

        // delete 404s
        for path in [
            "/api/workspaces/999999",
            "/api/pages/999999",
            "/api/blocks/999999",
            "/api/comments/999999",
            "/api/page_shares/999999",
            "/api/workspace_members/999999",
        ] {
            assert_eq!(
                request
                    .delete(path)
                    .add_header(auth_key.clone(), auth_value.clone())
                    .await
                    .status_code(),
                404
            );
        }

        // update 404s
        for (path, body) in [
            ("/api/workspaces/999999", serde_json::json!({ "name": "x" })),
            (
                "/api/pages/999999",
                serde_json::json!({ "title": "x", "icon": null, "position": 0, "parent_page_id": null }),
            ),
            (
                "/api/blocks/999999",
                serde_json::json!({
                    "block_type": "paragraph",
                    "checked": false,
                    "position": 0,
                    "content": null
                }),
            ),
            ("/api/comments/999999", serde_json::json!({ "body": "x" })),
            (
                "/api/page_shares/999999",
                serde_json::json!({ "permission": "view" }),
            ),
            (
                "/api/workspace_members/999999",
                serde_json::json!({ "role": "viewer" }),
            ),
        ] {
            assert_eq!(
                request
                    .put(path)
                    .add_header(auth_key.clone(), auth_value.clone())
                    .json(&body)
                    .await
                    .status_code(),
                404
            );
        }
    })
    .await;
}
