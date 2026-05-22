use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Color {
    pub id: Option<i64>,
    pub name: String,
    pub hex: Option<String>,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_colors(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, hex, remarks, sort_order FROM colors ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let colors = stmt
        .query_map([], |row| {
            Ok(Color {
                id: row.get(0)?,
                name: row.get(1)?,
                hex: row.get(2).ok(),
                remarks: row.get(3).ok(),
                sort_order: row.get(4).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(colors).unwrap())
}

#[tauri::command]
pub fn add_color(db_path: String, color: Color) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO colors (name, hex, remarks, sort_order) VALUES (?1, ?2, ?3, ?4)",
        params![
            color.name,
            color.hex,
            color.remarks,
            color.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_color(db_path: String, color: Color) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = color.id {
        conn.execute(
            "UPDATE colors SET name = ?1, hex = ?2, remarks = ?3, sort_order = ?4 WHERE id = ?5",
            params![
                color.name,
                color.hex,
                color.remarks,
                color.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Color ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_color(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM colors WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_colors(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE colors SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
