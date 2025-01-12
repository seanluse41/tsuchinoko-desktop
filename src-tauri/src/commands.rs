use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: i32,
    refresh_token: Option<String>,
}

#[tauri::command]
pub async fn kintone_exchange_token(code: String, redirect_uri: String) -> Result<TokenResponse, String> {
    let client = Client::new();
    
    let params = [
        ("grant_type", "authorization_code"),
        ("code", &code),
        ("client_id", "l.1.4b3hnz7sl7hn1zax2xhilc8p0qtp6rq1"),
        ("client_secret", "46kxqy2gqkt3gle0zk6eit8dl3llfmlgtrhpybbx4d128yw0og61i6q5yzqp1sb3"),
        ("redirect_uri", &redirect_uri),
    ];

    let response = client
        .post("https://sean.kintone.com/oauth2/token")
        .form(&params)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let token_response = response
        .json::<TokenResponse>()
        .await
        .map_err(|e| e.to_string())?;

    Ok(token_response)
}