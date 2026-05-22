use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Serialize, Deserialize)]
pub struct Team {
    pub id: Option<i64>,
    pub name: String,
    pub remarks: Option<String>,
    pub sort_order: Option<i64>,
}

#[tauri::command]
pub fn list_teams(db_path: String) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT id, name, remarks, sort_order FROM teams ORDER BY sort_order ASC, id ASC").map_err(|e| e.to_string())?;
    let teams = stmt
        .query_map([], |row| {
            Ok(Team {
                id: row.get(0)?,
                name: row.get(1)?,
                remarks: row.get(2).ok(),
                sort_order: row.get(3).ok(),
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(Result::ok)
        .collect::<Vec<_>>();
    Ok(serde_json::to_value(teams).unwrap())
}

#[tauri::command]
pub fn add_team(db_path: String, team: Team) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO teams (name, remarks, sort_order) VALUES (?1, ?2, ?3)",
        params![
            team.name,
            team.remarks,
            team.sort_order
        ],
    ).map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn update_team(db_path: String, team: Team) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    if let Some(id) = team.id {
        conn.execute(
            "UPDATE teams SET name = ?1, remarks = ?2, sort_order = ?3 WHERE id = ?4",
            params![
                team.name,
                team.remarks,
                team.sort_order,
                id
            ],
        ).map_err(|e| e.to_string())?;
        Ok(serde_json::json!({"success": true}))
    } else {
        Err("Team ID is required for update".to_string())
    }
}

#[tauri::command]
pub fn delete_team(db_path: String, id: i64) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM teams WHERE id = ?1", params![id])
        .map_err(|e| e.to_string())?;
    Ok(serde_json::json!({"success": true}))
}

#[tauri::command]
pub fn reorder_teams(db_path: String, ids: Vec<i64>) -> Result<Value, String> {
    let conn = Connection::open(db_path).map_err(|e| e.to_string())?;
    for (idx, id) in ids.iter().enumerate() {
        conn.execute(
            "UPDATE teams SET sort_order = ?1 WHERE id = ?2",
            params![idx as i64, id],
        ).map_err(|e| e.to_string())?;
    }
    Ok(serde_json::json!({"success": true}))
}
