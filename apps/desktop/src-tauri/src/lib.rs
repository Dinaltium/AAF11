use tauri::{Manager, WebviewUrl, WebviewWindowBuilder};

const KEYRING_SERVICE: &str = "aaf11-nexus";
const KEYRING_USER: &str = "member-token";

/// Open the embedded Payload admin in its own native webview window.
#[tauri::command]
fn open_admin_window(app: tauri::AppHandle, url: String) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("admin") {
        let _ = window.set_focus();
        return Ok(());
    }
    let parsed = url.parse().map_err(|e| format!("invalid url: {e}"))?;
    WebviewWindowBuilder::new(&app, "admin", WebviewUrl::External(parsed))
        .title("AAF11 Nexus — Content")
        .inner_size(1200.0, 820.0)
        .build()
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Store the member token in the OS keychain (Windows Credential Manager /
/// macOS Keychain / Secret Service).
#[tauri::command]
fn save_token(token: String) -> Result<(), String> {
    let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER).map_err(|e| e.to_string())?;
    entry.set_password(&token).map_err(|e| e.to_string())
}

/// Read the member token from the OS keychain.
#[tauri::command]
fn get_token() -> Result<Option<String>, String> {
    let entry = keyring::Entry::new(KEYRING_SERVICE, KEYRING_USER).map_err(|e| e.to_string())?;
    match entry.get_password() {
        Ok(password) => Ok(Some(password)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            open_admin_window,
            save_token,
            get_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running AAF11 Nexus");
}
