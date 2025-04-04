use super::types::*;
use reqwest::Client;

pub async fn get_records(
    app_id: String,
    query: String,
    config: GetRecordsConfig,
) -> Result<KintoneResponse, String> {
    let client = Client::new();

    let url = format!(
        "https://{}.{}/k/v1/records.json?app={}{}",
        config.subdomain,
        config.domain,
        app_id,
        if !query.is_empty() {
            format!("&query={}", query)
        } else {
            String::new()
        }
    );

    println!("Request URL: {}", url);
    println!("Config: {:?}", config);

    let auth_header = format!("Bearer {}", config.access_token);
    println!("Auth Header: {}", auth_header);

    let response = client
        .get(&url)
        .header("Authorization", &auth_header)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch records: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;
        println!("Error Response Status: {}", status);
        println!("Error Response Body: {}", text);

        if status == 401 {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<KintoneResponse>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}

pub async fn update_records(
    app_id: String,
    records: Vec<serde_json::Value>,
    config: GetRecordsConfig,
) -> Result<(), String> {
    let client = Client::new();

    let url = format!(
        "https://{}.{}/k/v1/records.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "app": app_id,
        "records": records
    });

    let response = client
        .put(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to update records: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == 401 {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    Ok(())
}

pub async fn delete_records(
    app_id: String,
    ids: Vec<String>,
    config: GetRecordsConfig,
) -> Result<(), String> {
    let client = Client::new();

    let url = format!(
        "https://{}.{}/k/v1/records.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "app": app_id,
        "ids": ids
    });

    let response = client
        .delete(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to delete records: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == 401 {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    Ok(())
}

pub async fn add_record(
    app_id: String,
    record: serde_json::Value,
    config: GetRecordsConfig,
) -> Result<serde_json::Value, String> {
    let client = Client::new();

    let url = format!(
        "https://{}.{}/k/v1/record.json",
        config.subdomain, config.domain
    );

    let body = serde_json::json!({
        "app": app_id,
        "record": record
    });

    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", config.access_token))
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to add record: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.map_err(|e| e.to_string())?;

        if status == 401 {
            return Err("token_expired".to_string());
        }
        return Err(format!("API request failed: {}", text));
    }

    response
        .json::<serde_json::Value>()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))
}
