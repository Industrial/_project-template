use loco_rs::testing::prelude::*;
use serial_test::serial;
use test_loco_webapp::{app::App, models::users};

use super::prepare_data;

#[tokio::test]
#[serial]
async fn auth_edge_paths() {
    request::<App, _, _>(|request, ctx| async move {
        // forgot / reset / magic-link with unknown identity (always 200)
        assert_eq!(
            request
                .post("/api/auth/forgot")
                .json(&serde_json::json!({ "email": "nobody@example.com" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .post("/api/auth/reset")
                .json(&serde_json::json!({
                    "token": "missing",
                    "password": "new-password"
                }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .post("/api/auth/magic-link")
                .json(&serde_json::json!({ "email": "nobody@example.com" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .post("/api/auth/magic-link")
                .json(&serde_json::json!({ "email": "bad@notallowed.org" }))
                .await
                .status_code(),
            200
        );

        // register duplicate returns explicit conflict
        let email = "edge@example.com";
        let payload = serde_json::json!({
            "name": "edge",
            "email": email,
            "password": "12341234"
        });
        assert_eq!(
            request
                .post("/api/auth/register")
                .json(&payload)
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .post("/api/auth/register")
                .json(&payload)
                .await
                .status_code(),
            409
        );

        let user = users::Model::find_by_email(&ctx.db, email).await.unwrap();
        let token = user.email_verification_token.clone().unwrap();
        assert_eq!(
            request
                .get(&format!("/api/auth/verify/{token}"))
                .await
                .status_code(),
            200
        );
        // token cleared after verify
        assert_eq!(
            request
                .get(&format!("/api/auth/verify/{token}"))
                .await
                .status_code(),
            401
        );

        // resend: unknown + already-verified
        assert_eq!(
            request
                .post("/api/auth/resend-verification-mail")
                .json(&serde_json::json!({ "email": "ghost@example.com" }))
                .await
                .status_code(),
            200
        );
        assert_eq!(
            request
                .post("/api/auth/resend-verification-mail")
                .json(&serde_json::json!({ "email": email }))
                .await
                .status_code(),
            200
        );

        // magic-link success path for registered domain
        assert_eq!(
            request
                .post("/api/auth/magic-link")
                .json(&serde_json::json!({ "email": email }))
                .await
                .status_code(),
            200
        );

        let _ = prepare_data::init_user_login(&request, &ctx).await;
    })
    .await;
}
