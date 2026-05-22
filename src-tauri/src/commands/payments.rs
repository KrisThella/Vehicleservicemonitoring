use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Payment {
    pub id: Option<i64>,
    pub vehicle_id: i64,
    pub amount: f64,
    pub date: String,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_payments(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, vehicle_id, amount, date, remarks, sort_order FROM payments ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let payments = stmt
        .query_map([], |row| {
            Ok(Payment {
                id: row.get(0)?,
                vehicle_id: row.get(1)?,
                amount: row.get(2)?,
                date: row.get(3)?,
                remarks: row.get(4).ok(),
                sort_order: row.get(5).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(payments).unwrap())
}

#[tauri::command]
pub fn add_payment(db_path: String, payment: Payment) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO payments (vehicle_id, amount, date, remarks, sort_order) VALUES (?1, ?2, ?3, ?4, ?5)",
        params![
            payment.vehicle_id,
            payment.amount,
            payment.date,
            payment.remarks,
            payment.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_payment(db_path: String, payment: Payment) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = payment.id {
        conn.execute(
            "UPDATE payments SET vehicle_id = ?1, amount = ?2, date = ?3, remarks = ?4, sort_order = ?5 WHERE id = ?6",
            params![
                payment.vehicle_id,
                payment.amount,
                payment.date,
                payment.remarks,
                payment.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Payment ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_payment(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM payments WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_payments(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE payments SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
