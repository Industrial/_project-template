// auth mailer
#![allow(non_upper_case_globals)]

use crate::models::UserModel;
use loco_rs::prelude::mailer::Args;
use loco_rs::prelude::*;
use serde_json::json;

static welcome: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/src/mailers/auth/welcome");
static forgot: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/src/mailers/auth/forgot");
static magic_link: Dir<'_> = include_dir!("$CARGO_MANIFEST_DIR/src/mailers/auth/magic_link");

#[allow(clippy::module_name_repetitions)]
pub struct AuthMailer {}
impl Mailer for AuthMailer {}
impl AuthMailer {
    /// Sending welcome email the the given user
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn send_welcome(ctx: &AppContext, user: &UserModel) -> Result<()> {
        Self::mail_template(
            ctx,
            &welcome,
            Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "verifyToken": user.email_verification_token,
                  "host": ctx.config.server.full_url()
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }

    /// Sending forgot password email
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn forgot_password(ctx: &AppContext, user: &UserModel) -> Result<()> {
        Self::mail_template(
            ctx,
            &forgot,
            Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "resetToken": user.reset_token,
                  "host": ctx.config.server.full_url(),
                  "frontendHost": std::env::var("FRONTEND_URL")
                      .unwrap_or_else(|_| "http://localhost:3000".to_string()),
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }

    /// Sends a magic link authentication email to the user.
    ///
    /// # Errors
    ///
    /// When email sending is failed
    pub async fn send_magic_link(ctx: &AppContext, user: &UserModel) -> Result<()> {
        Self::mail_template(
            ctx,
            &magic_link,
            Args {
                to: user.email.clone(),
                locals: json!({
                  "name": user.name,
                  "token": user.magic_link_token.clone().unwrap_or_default(),
                  "host": ctx.config.server.full_url()
                }),
                ..Default::default()
            },
        )
        .await?;

        Ok(())
    }
}
