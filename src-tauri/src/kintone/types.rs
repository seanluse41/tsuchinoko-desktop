use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct GetRecordsConfig {
    pub subdomain: String,
    pub domain: String,
    pub access_token: String,
    pub space: String
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KintoneRecord {
    #[serde(rename = "$id")]
    pub id: Value,
    #[serde(default)] // Add default for all fields
    pub taskID: Value,
    #[serde(default)]
    pub notificationDateTime: Value,
    #[serde(default)]
    pub taskCreationDateTime: Value,
    #[serde(default)]
    pub taskPriority: Value,
    #[serde(default)]
    pub taskDeadline: Value,
    #[serde(default)]
    pub taskHolder: Value,
    #[serde(default)]
    pub taskStatus: Value,
    #[serde(default)]
    pub notificationTitle: Value,
    #[serde(default)]
    pub notificationSubtitle: Value,
    #[serde(default)]
    pub notificationContent: Value,
    #[serde(default)]
    pub taskMemo: Value,
    #[serde(default)]
    pub taskFolder: Value,
    #[serde(default)]
    pub taskCompletionMemo: Value,
    // Add other fields with default
    #[serde(default)]
    pub module_type: Value,
    // Allow additional unknown fields
    #[serde(flatten)]
    pub extra: std::collections::HashMap<String, Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KintoneResponse {
    pub records: Vec<KintoneRecord>,
}
