use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct NextCutOff {
    pub id: Option<i64>,
    pub date: String,
    pub remarks: Option<String>,
}

#[tauri::command]
pub fn get_next_cut_off(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, date, remarks FROM next_cut_off LIMIT 1").map_err(|e| e.to_string())?;
    let next_cut_off = stmt
        .query_map([], |row| {
            Ok(NextCutOff {
                id: row.get(0).ok(),
                date: row.get(1)?,
                remarks: row.get(2).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .next();
    Ok(serde_json::to_value(next_cut_off).unwrap())
}

#[tauri::command]
pub fn update_next_cut_off(db_path: String, next_cut_off: NextCutOff) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = next_cut_off.id {
        conn.execute(
            "UPDATE next_cut_off SET date = ?1, remarks = ?2 WHERE id = ?3",
            params![next_cut_off.date, next_cut_off.remarks, id],
        ).map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "INSERT INTO next_cut_off (date, remarks) VALUES (?1, ?2)",
            params![next_cut_off.date, next_cut_off.remarks],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
