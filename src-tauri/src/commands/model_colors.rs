use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct ModelColor {
    pub id: Option<i64>,
    pub model: String,
    pub color: String,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_model_colors(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, model, color, remarks, sort_order FROM model_colors ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let model_colors = stmt
        .query_map([], |row| {
            Ok(ModelColor {
                id: row.get(0)?,
                model: row.get(1)?,
                color: row.get(2)?,
                remarks: row.get(3).ok(),
                sort_order: row.get(4).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(model_colors).unwrap())
}

#[tauri::command]
pub fn add_model_color(db_path: String, model_color: ModelColor) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO model_colors (model, color, remarks, sort_order) VALUES (?1, ?2, ?3, ?4)",
        params![
            model_color.model,
            model_color.color,
            model_color.remarks,
            model_color.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_model_color(db_path: String, model_color: ModelColor) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = model_color.id {
        conn.execute(
            "UPDATE model_colors SET model = ?1, color = ?2, remarks = ?3, sort_order = ?4 WHERE id = ?5",
            params![
                model_color.model,
                model_color.color,
                model_color.remarks,
                model_color.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("ModelColor ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_model_color(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM model_colors WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_model_colors(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE model_colors SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
