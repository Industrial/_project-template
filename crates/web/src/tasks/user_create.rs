use loco_rs::prelude::*;

use crate::{
    mailers::auth::AuthMailer,
    models::{_entities::users, users::RegisterParams},
};

pub struct UserCreate;
#[async_trait]
impl Task for UserCreate {
    fn task(&self) -> TaskInfo {
        TaskInfo {
            name: "user:create".to_string(),
            detail: "Create a new user with email, name, and password. Sends welcome email and sets up email verification.\nUsage:\ncargo run task user:create email:user@example.com name:\"John Doe\" password:\"securepassword\"".to_string(),
        }
    }
    async fn run(&self, app_context: &AppContext, vars: &task::Vars) -> Result<()> {
        let email = vars
            .cli_arg("email")
            .map_err(|_| Error::string("email is mandatory"))?;
        let name = vars
            .cli_arg("name")
            .map_err(|_| Error::string("name is mandatory"))?;
        let password = vars
            .cli_arg("password")
            .map_err(|_| Error::string("password is mandatory"))?;

        let register_params = RegisterParams {
            email: email.to_owned(),
            password: password.to_owned(),
            name: name.to_owned(),
        };

        let user = users::Model::create_with_password(&app_context.db, &register_params)
            .await
            .map_err(|err| Error::string(&format!("Failed to create user. err: {err}")))?;

        let user = user
            .into_active_model()
            .set_email_verification_sent(&app_context.db)
            .await?;

        AuthMailer::send_welcome(app_context, &user).await?;

        Ok(())
    }
}
