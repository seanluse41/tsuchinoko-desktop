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

#[derive(Serialize, Deserialize, Debug)]
pub struct KintoneUser {
    pub code: String,
    pub name: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GetAppsResponse {
    pub apps: Vec<KintoneApp>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct KintoneApp {
    pub appId: String,
    pub code: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub spaceId: Option<String>,
    pub threadId: Option<String>,
    pub createdAt: String,
    pub creator: KintoneUser,
    pub modifiedAt: String,
    pub modifier: KintoneUser,
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

#[tauri::command]
pub async fn kintone_get_apps(
    spaceIds: Vec<String>,
    config: GetRecordsConfig,
) -> Result<GetAppsResponse, String> {
    let client = reqwest::Client::new();

    // Start building the URL
    let mut url = format!(
        "https://{}.{}/k/v1/apps.json",
        config.subdomain, config.domain
    );

    // Add query parameters for space IDs
    if !spaceIds.is_empty() {
        url.push('?');
        
        for (i, id) in spaceIds.iter().enumerate() {
            if i > 0 {
                url.push_str("&");
            }
            url.push_str(&format!("spaceIds[{}]={}", i, id));
        }
    }

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to fetch apps: {}", e))?;

    if !response.status().is_success() {
        if response.status() == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        
        let text = response.text().await.map_err(|e| e.to_string())?;
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<GetAppsResponse>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_create_preview_app(
    app_name: String,
    space_id: Option<String>,
    thread_id: Option<String>,  // Add optional thread_id parameter
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app.json",
        config.subdomain, config.domain
    );

    // Build the request body
    let mut body = serde_json::json!({
        "name": app_name
    });

    // Add space_id if provided
    if let Some(id) = space_id {
        match id.parse::<i32>() {
            Ok(space_id_int) => {
                let body_obj = body.as_object_mut().unwrap();
                body_obj.insert("space".to_string(), serde_json::json!(space_id_int));
                
                // When space is specified, thread is required
                // If thread_id is provided, use it; otherwise use default thread (1)
                let thread_id_int = match thread_id {
                    Some(tid) => tid.parse::<i32>().unwrap_or(1),
                    None => 1  // Default to thread 1 if not specified
                };
                
                body_obj.insert("thread".to_string(), serde_json::json!(thread_id_int));
            },
            Err(_) => {
                return Err(format!("Invalid space ID format: {}", id));
            }
        }
    }

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to create preview app: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_add_form_fields(
    app_id: String,
    fields: serde_json::Value,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app/form/fields.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "app": app_id,
        "properties": fields,
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to add form fields: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_deploy_app(
    apps: Vec<serde_json::Value>,
    config: GetRecordsConfig,
) -> Result<(), String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app/deploy.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "apps": apps
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to deploy app: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    // The deploy API has no response content when successful
    Ok(())
}

#[tauri::command]
pub async fn kintone_update_form_fields(
    app_id: String,
    properties: serde_json::Value,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app/form/fields.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "app": app_id,
        "properties": properties,
    });

    let response = client
        .put(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to update form fields: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_get_form_fields(
    app_id: String,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app/form/fields.json?app={}",
        config.subdomain, config.domain, app_id
    );

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to get form fields: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_update_app_settings(
    settings: serde_json::Value,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/preview/app/settings.json",
        config.subdomain, config.domain
    );

    let response = client
        .put(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&settings)
        .send()
        .await
        .map_err(|e| format!("Failed to update app settings: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_get_app_settings(
    app_id: String,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let url = format!(
        "https://{}.{}/k/v1/app/settings.json?app={}",
        config.subdomain, config.domain, app_id
    );

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to get app settings: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_get_deploy_status(
    app_ids: Vec<String>,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    // Build the URL with query parameters
    let mut url = format!(
        "https://{}.{}/k/v1/preview/app/deploy.json?",
        config.subdomain, config.domain
    );

    // Add app IDs to query parameters
    for (i, app_id) in app_ids.iter().enumerate() {
        url.push_str(&format!("apps[{}]={}&", i, app_id));
    }

    // Remove the trailing '&' if it exists
    if url.ends_with('&') {
        url.pop();
    }

    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .send()
        .await
        .map_err(|e| format!("Failed to get deployment status: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

#[tauri::command]
pub async fn kintone_create_space(
    space_name: String,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = Client::new();

    let url = format!(
        "https://{}.{}/k/v1/space.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "name": space_name
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to create space: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == reqwest::StatusCode::UNAUTHORIZED {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}