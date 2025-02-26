use crate::kintone::{
    add_record, delete_records, get_records, update_records, GetRecordsConfig, KintoneResponse,
};
use base64::{engine::general_purpose::STANDARD as base64, Engine};
use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct TokenResponse {
    access_token: String,
    token_type: String,
    expires_in: i32,
    refresh_token: Option<String>,
    scope: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct AuthConfig {
    client_id: String,
    client_secret: String,
    subdomain: String,
    domain: String,
}

#[tauri::command]
pub async fn kintone_exchange_token(
    code: String,
    redirect_uri: String,
    config: AuthConfig,
) -> Result<TokenResponse, String> {
    let client = Client::new();

    let auth_str = format!("{}:{}", config.client_id, config.client_secret);
    let auth_header = format!("Basic {}", base64.encode(auth_str.as_bytes()));

    let form_data = [
        ("grant_type", "authorization_code"),
        ("code", &code),
        ("redirect_uri", &redirect_uri),
    ];

    let response = client
        .post(format!(
            "https://{}.{}/oauth2/token",
            config.subdomain, config.domain
        ))
        .header("Authorization", auth_header)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&form_data)
        .send()
        .await
        .map_err(|e| format!("Token exchange request failed: {}", e))?;

    if !response.status().is_success() {
        let text = response.text().await.map_err(|e| e.to_string())?;
        return Err(format!("Token exchange failed: {}", text));
    }

    response
        .json::<TokenResponse>()
        .await
        .map_err(|e| format!("Failed to parse token response: {}", e))
}

#[tauri::command]
pub async fn kintone_refresh_token(
    refresh_token: String,
    config: AuthConfig,
) -> Result<TokenResponse, String> {
    let client = Client::new();

    let auth_str = format!("{}:{}", config.client_id, config.client_secret);
    let auth_header = format!("Basic {}", base64.encode(auth_str.as_bytes()));

    let response = client
        .post(format!(
            "https://{}.{}/oauth2/token",
            config.subdomain, config.domain
        ))
        .header("Authorization", auth_header)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .form(&[
            ("grant_type", "refresh_token"),
            ("refresh_token", &refresh_token),
        ])
        .send()
        .await
        .map_err(|e| format!("Token refresh request failed: {}", e))?;

    if !response.status().is_success() {
        let text = response.text().await.map_err(|e| e.to_string())?;
        return Err(format!("Token refresh failed: {}", text));
    }

    response
        .json::<TokenResponse>()
        .await
        .map_err(|e| format!("Failed to parse refresh response: {}", e))
}

#[tauri::command]
pub async fn kintone_get_records(
    app_id: String,
    query: String,
    config: GetRecordsConfig,
) -> Result<KintoneResponse, String> {
    get_records(app_id, query, config).await
}

#[tauri::command]
pub async fn kintone_update_records(
    app_id: String,
    records: Vec<serde_json::Value>,
    config: GetRecordsConfig,
) -> Result<(), String> {
    update_records(app_id, records, config).await
}

#[tauri::command]
pub async fn kintone_delete_records(
    app_id: String,
    ids: Vec<String>,
    config: GetRecordsConfig,
) -> Result<(), String> {
    delete_records(app_id, ids, config).await
}

#[tauri::command]
pub async fn kintone_add_record(
    app_id: String,
    record: serde_json::Value,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    add_record(app_id, record, config).await
}
