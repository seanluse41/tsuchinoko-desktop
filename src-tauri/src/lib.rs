mod commands; // Add this at the top to include the new module

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            commands::kintone_exchange_token // Reference the command from the module
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}