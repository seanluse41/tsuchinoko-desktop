use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct GetRecordsConfig {
    pub subdomain: String,
    pub domain: String,
    pub access_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KintoneRecord {
    #[serde(rename = "$id")]
    pub id: Value,
    pub task_id: Value,
    pub notification_date_time: Value,
    pub task_creation_date_time: Value,
    pub task_priority: Value,
    pub task_deadline: Value,
    pub task_holder: Value,
    pub task_status: Value,
    pub notification_title: Value,
    pub notification_subtitle: Value,
    pub notification_content: Value,
    pub task_memo: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KintoneResponse {
    pub records: Vec<KintoneRecord>
}