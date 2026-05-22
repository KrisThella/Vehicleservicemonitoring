use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct PullOut {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub date: String,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_pull_outs(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, vehicle_id, date, remarks, sort_order FROM pull_outs ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let pull_outs = stmt
        .query_map([], |row| {
            Ok(PullOut {
                id: row.get(0)?,
                vehicle_id: row.get(1)?,
                date: row.get(2)?,
                remarks: row.get(3).ok(),
                sort_order: row.get(4).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(pull_outs).unwrap())
}

#[tauri::command]
pub fn add_pull_out(db_path: String, pull_out: PullOut) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO pull_outs (vehicle_id, date, remarks, sort_order) VALUES (?1, ?2, ?3, ?4)",
        params![
            pull_out.vehicle_id,
            pull_out.date,
            pull_out.remarks,
            pull_out.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_pull_out(db_path: String, pull_out: PullOut) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = pull_out.id {
        conn.execute(
            "UPDATE pull_outs SET vehicle_id = ?1, date = ?2, remarks = ?3, sort_order = ?4 WHERE id = ?5",
            params![
                pull_out.vehicle_id,
                pull_out.date,
                pull_out.remarks,
                pull_out.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("PullOut ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_pull_out(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM pull_outs WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_pull_outs(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE pull_outs SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
