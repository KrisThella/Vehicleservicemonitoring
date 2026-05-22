use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Inventory {
    pub id: Option<i64>,
    pub model: String,
    pub color: String,
    pub quantity: i64,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_inventory(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, model, color, quantity, remarks, sort_order FROM inventory ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let inventory = stmt
        .query_map([], |row| {
            Ok(Inventory {
                id: row.get(0)?,
                model: row.get(1)?,
                color: row.get(2)?,
                quantity: row.get(3)?,
                remarks: row.get(4).ok(),
                sort_order: row.get(5).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(inventory).unwrap())
}

#[tauri::command]
pub fn add_inventory(db_path: String, inventory: Inventory) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO inventory (model, color, quantity, remarks, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            inventory.model,
            inventory.color,
            inventory.quantity,
            inventory.remarks,
            inventory.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_inventory(db_path: String, inventory: Inventory) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = inventory.id {
        conn.execute(
            "UPDATE inventory SET model = ?1, color = ?2, quantity = ?3, remarks = ?4, sort_order = ?5 WHERE id = ?6",
            params![
                inventory.model,
                inventory.color,
                inventory.quantity,
                inventory.remarks,
                inventory.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Inventory ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_inventory(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM inventory WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_inventory(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE inventory SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
