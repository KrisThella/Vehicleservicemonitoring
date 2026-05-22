use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Vehicle {
    pub id: Option<i64>,
    pub model: String,
    pub color: String,
    pub plate_number: String,
    pub status: String,
    pub team: Option<String>,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_vehicles(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, model, color, plate_number, status, team, remarks, sort_order FROM vehicles ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let vehicles = stmt
        .query_map([], |row| {
            Ok(Vehicle {
                id: row.get(0)?,
                model: row.get(1)?,
                color: row.get(2)?,
                plate_number: row.get(3)?,
                status: row.get(4)?,
                team: row.get(5).ok(),
                remarks: row.get(6).ok(),
                sort_order: row.get(7).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(vehicles).unwrap())
}

#[tauri::command]
pub fn add_vehicle(db_path: String, vehicle: Vehicle) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO vehicles (model, color, plate_number, status, team, remarks, sort_order) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        params![
            vehicle.model,
            vehicle.color,
            vehicle.plate_number,
            vehicle.status,
            vehicle.team,
            vehicle.remarks,
            vehicle.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_vehicle(db_path: String, vehicle: Vehicle) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = vehicle.id {
        conn.execute(
            "UPDATE vehicles SET model = ?1, color = ?2, plate_number = ?3, status = ?4, team = ?5, remarks = ?6, sort_order = ?7 WHERE id = ?8",
            params![
                vehicle.model,
                vehicle.color,
                vehicle.plate_number,
                vehicle.status,
                vehicle.team,
                vehicle.remarks,
                vehicle.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Vehicle ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_vehicle(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM vehicles WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_vehicles(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE vehicles SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
