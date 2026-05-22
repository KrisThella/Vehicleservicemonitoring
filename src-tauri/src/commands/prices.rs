use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Price {
    pub id: Option<i64>,
    pub model: String,
    pub price: f64,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_prices(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, model, price, remarks, sort_order FROM prices ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let prices = stmt
        .query_map([], |row| {
            Ok(Price {
                id: row.get(0)?,
                model: row.get(1)?,
                price: row.get(2)?,
                remarks: row.get(3).ok(),
                sort_order: row.get(4).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(prices).unwrap())
}

#[tauri::command]
pub fn add_price(db_path: String, price: Price) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO prices (model, price, remarks, sort_order) VALUES (?1, ?2, ?3, ?4)",
        params![
            price.model,
            price.price,
            price.remarks,
            price.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_price(db_path: String, price: Price) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = price.id {
        conn.execute(
            "UPDATE prices SET model = ?1, price = ?2, remarks = ?3, sort_order = ?4 WHERE id = ?5",
            params![
                price.model,
                price.price,
                price.remarks,
                price.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Price ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_price(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM prices WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_prices(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE prices SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
