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
    pub taskID: Value,
    pub notificationDateTime: Value,
    pub taskCreationDateTime: Value,
    pub taskPriority: Value,
    pub taskDeadline: Value,
    pub taskHolder: Value,
    pub taskStatus: Value,
    pub notificationTitle: Value,
    pub notificationSubtitle: Value,
    pub notificationContent: Value,
    pub taskMemo: Value,
    pub taskFolder: Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KintoneResponse {
    pub records: Vec<KintoneRecord>,
}
