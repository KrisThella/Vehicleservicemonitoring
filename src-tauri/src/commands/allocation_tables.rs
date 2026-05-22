use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct AllocationTable {
    pub id: Option<i64>,
    pub model: String,
    pub allocation: i64,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_allocation_tables(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, model, allocation, remarks, sort_order FROM allocation_tables ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let allocation_tables = stmt
        .query_map([], |row| {
            Ok(AllocationTable {
                id: row.get(0)?,
                model: row.get(1)?,
                allocation: row.get(2)?,
                remarks: row.get(3).ok(),
                sort_order: row.get(4).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(allocation_tables).unwrap())
}

#[tauri::command]
pub fn add_allocation_table(db_path: String, allocation_table: AllocationTable) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO allocation_tables (model, allocation, remarks, sort_order) VALUES (?1, ?2, ?3, ?4)",
        params![
            allocation_table.model,
            allocation_table.allocation,
            allocation_table.remarks,
            allocation_table.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_allocation_table(db_path: String, allocation_table: AllocationTable) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = allocation_table.id {
        conn.execute(
            "UPDATE allocation_tables SET model = ?1, allocation = ?2, remarks = ?3, sort_order = ?4 WHERE id = ?5",
            params![
                allocation_table.model,
                allocation_table.allocation,
                allocation_table.remarks,
                allocation_table.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("AllocationTable ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_allocation_table(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM allocation_tables WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_allocation_tables(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE allocation_tables SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
