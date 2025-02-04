mod commands;
mod kintone;
use tauri::Manager;
// Only import DeepLinkExt on Linux and Windows
#[cfg(any(target_os = "linux", windows))]
use tauri_plugin_deep_link::DeepLinkExt;
use std::fs;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default();
    
    #[cfg(desktop)]
    {
        builder = builder
            .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
                let _ = app.get_webview_window("main")
                    .expect("no main window")
                    .set_focus();
                println!("new instance started with arguments: {argv:?}");
            }));
    }

    builder
        .setup(|app| {
            // Get the app local data directory and ensure it exists
            let app_local_dir = app
                .path()
                .app_local_data_dir()
                .expect("could not resolve app local data path");
            
            // Create the directory if it doesn't exist
            fs::create_dir_all(&app_local_dir)
                .expect("failed to create app local data directory");
            
            let salt_path = app_local_dir.join("salt.txt");
            app.handle().plugin(tauri_plugin_stronghold::Builder::with_argon2(&salt_path).build())?;
            
            // Only register deep-link on Linux and Windows
            #[cfg(any(target_os = "linux", windows))]
            {
                app.deep_link().register("tsuuchinoko")?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::kintone_exchange_token,
            commands::kintone_refresh_token,
            commands::kintone_get_records,
            commands::kintone_delete_records,
            commands::kintone_update_records,
            commands::kintone_add_record
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}