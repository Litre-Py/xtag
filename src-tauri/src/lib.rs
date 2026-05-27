use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Card {
    pub id: String,
    pub card_type: String,
    pub title: String,
    pub fields: Vec<CardField>,
    pub color: Option<String>,
    pub is_active: bool,
    pub created_at: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CardField {
    pub key: String,
    pub label: String,
    pub value: String,
    pub icon: Option<String>,
    pub action_type: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResumeCard {
    pub id: String,
    pub title: String,
    pub markdown: String,
    pub skills: Vec<String>,
    pub created_at: u64,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
fn create_card(card_type: String, title: String) -> Result<String, String> {
    let id = format!("card_{}", chrono::Utc::now().timestamp_millis());
    Ok(id)
}

#[tauri::command]
fn save_cards(cards: String) -> Result<(), String> {
    let _data: Vec<serde_json::Value> = serde_json::from_str(&cards).map_err(|e| e.to_string())?;
    // 保存逻辑
    Ok(())
}

#[tauri::command]
fn load_cards() -> Result<String, String> {
    Ok("[]".to_string())
}

#[tauri::command]
fn save_resume(id: String, markdown: String, skills: Vec<String>) -> Result<(), String> {
    let _resume = ResumeCard { id, title: String::new(), markdown, skills, created_at: 0 };
    Ok(())
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(&path, content).map_err(|e| e.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, create_card, save_cards, load_cards,
            save_resume, read_file, write_file
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
