use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Setting {
    pub id: Option<i64>,
    pub key: String,
    pub value: String,
    pub remarks: Option<String>,
}

#[tauri::command]
pub fn list_settings(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, key, value, remarks FROM settings").map_err(|e| e.to_string())?;
    let settings = stmt
        .query_map([], |row| {
            Ok(Setting {
                id: row.get(0).ok(),
                key: row.get(1)?,
                value: row.get(2)?,
                remarks: row.get(3).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(settings).unwrap())
}

#[tauri::command]
pub fn update_setting(db_path: String, setting: Setting) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = setting.id {
        conn.execute(
            "UPDATE settings SET key = ?1, value = ?2, remarks = ?3 WHERE id = ?4",
            params![setting.key, setting.value, setting.remarks, id],
        ).map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "INSERT INTO settings (key, value, remarks) VALUES (?1, ?2, ?3)",
            params![setting.key, setting.value, setting.remarks],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
