use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Profile {
    pub id: Option<i64>,
    pub name: String,
    pub role: String,
    pub remarks: Option<String>,
}

#[tauri::command]
pub fn get_profile(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, role, remarks FROM profile LIMIT 1").map_err(|e| e.to_string())?;
    let profile = stmt
        .query_map([], |row| {
            Ok(Profile {
                id: row.get(0).ok(),
                name: row.get(1)?,
                role: row.get(2)?,
                remarks: row.get(3).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .next();
    Ok(serde_json::to_value(profile).unwrap())
}

#[tauri::command]
pub fn update_profile(db_path: String, profile: Profile) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = profile.id {
        conn.execute(
            "UPDATE profile SET name = ?1, role = ?2, remarks = ?3 WHERE id = ?4",
            params![profile.name, profile.role, profile.remarks, id],
        ).map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "INSERT INTO profile (name, role, remarks) VALUES (?1, ?2, ?3)",
            params![profile.name, profile.role, profile.remarks],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
