<<<<<<< HEAD
mod db;

use db::{ensure_default_profile, initialize_db, open_connection};
use rusqlite::{params, OptionalExtension};
use serde::{Deserialize, Serialize};
use serde_json::{json, Map, Value};
use std::path::PathBuf;
use tauri::{State};

#[derive(Clone)]
struct AppState {
  db_path: PathBuf,
}

#[derive(Debug, Serialize, Deserialize)]
struct PriceRecord {
  id: i64,
  category: String,
  model: String,
  srp: String,
  dnp: String,
  ws_subsidy: String,
  dnp_less_ws_subsidy: String,
  ewt: String,
  po_amount: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProfileRecord {
  id: i64,
  name: String,
  role: String,
  email: String,
  image_data_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
struct GeneralManagerRecord {
  id: i64,
  name: String,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct SalesConsultantRecord {
  id: i64,
  manager_id: i64,
  name: String,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct PullOutRecord {
  id: i64,
  description: String,
  sph_allocation: i64,
  date_of_confirmation: String,
  confirmed_units: i64,
  pulled_out: i64,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct PaymentRecord {
  id: i64,
  description: String,
  number_of_units: i64,
  total_amount: f64,
  date_of_payment: String,
  remarks: String,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct NextCutOffRecord {
  id: i64,
  description: String,
  number_of_units: i64,
  unit_price: f64,
  total_amount: f64,
  date_of_payment: String,
  remarks: String,
  status: String,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct ColorRecord {
  id: i64,
  name: String,
  hex: String,
  sort_order: i64,
}

#[derive(Debug, Serialize, Deserialize)]
struct InventoryRecord {
  id: i64,
  year: i64,
  month_index: i64,
  beginning: Option<i64>,
  wholesale: Option<i64>,
  retail_sales: Option<i64>,
  actual_wholesales: Option<i64>,
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let db_path = initialize_db(&app.handle())?;
      ensure_default_profile(&db_path)?;
      app.manage(AppState { db_path });
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_vehicles,
      create_vehicle,
      update_vehicle,
      delete_vehicle,
      get_prices,
      create_price,
      update_price,
      delete_price,
      get_profile,
      save_profile,
      get_general_managers,
      create_general_manager,
      update_general_manager,
      delete_general_manager,
      get_sales_consultants,
      create_sales_consultant,
      update_sales_consultant,
      delete_sales_consultant,
      get_pull_outs,
      create_pull_out,
      update_pull_out,
      delete_pull_out,
      get_payments,
      create_payment,
      update_payment,
      delete_payment,
      get_next_cut_off_payments,
      create_next_cut_off_payment,
      update_next_cut_off_payment,
      delete_next_cut_off_payment,
      get_inventory,
      upsert_inventory,
      get_colors,
      create_color,
      update_color,
      delete_color,
      get_setting,
      set_setting
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn with_connection<T>(state: &State<'_, AppState>, action: impl FnOnce(&rusqlite::Connection) -> Result<T, String>) -> Result<T, String> {
  let connection = open_connection(&state.db_path)?;
  action(&connection)
}

fn string_value(input: &Value, key: &str, default: &str) -> String {
  input
    .get(key)
    .and_then(Value::as_str)
    .map(|value| value.to_string())
    .unwrap_or_else(|| default.to_string())
}

fn required_string(input: &Value, key: &str) -> Result<String, String> {
  input
    .get(key)
    .and_then(Value::as_str)
    .map(|value| value.trim().to_string())
    .filter(|value| !value.is_empty())
    .ok_or_else(|| format!("{} is required", key))
}

fn object_value(value: Value) -> Result<Map<String, Value>, String> {
  value
    .as_object()
    .cloned()
    .ok_or_else(|| "payload must be an object".to_string())
}

fn parse_json(text: String) -> Result<Value, String> {
  serde_json::from_str(&text).map_err(|error| error.to_string())
}

#[tauri::command]
fn get_vehicles(state: State<'_, AppState>) -> Result<Vec<Value>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT data FROM vehicles ORDER BY id")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        let data: String = row.get(0)?;
        parse_json(data).map_err(|error| rusqlite::Error::FromSqlConversionFailure(0, rusqlite::types::Type::Text, Box::new(std::io::Error::new(std::io::ErrorKind::Other, error))))
      })
      .map_err(|error| error.to_string())?;
    let mut vehicles = Vec::new();
    for row in rows {
      vehicles.push(row.map_err(|error| error.to_string())?);
    }
    Ok(vehicles)
  })
}

#[tauri::command]
fn create_vehicle(state: State<'_, AppState>, vehicle: Value) -> Result<Value, String> {
  with_connection(&state, |connection| {
    let mut object = object_value(vehicle)?;
    let id = object
      .get("id")
      .and_then(Value::as_str)
      .filter(|value| !value.trim().is_empty())
      .map(|value| value.to_string())
      .unwrap_or_else(generate_vehicle_id);
    object.insert("id".to_string(), Value::String(id.clone()));
    let serialized = Value::Object(object);
    connection
      .execute(
        "INSERT INTO vehicles (id, data) VALUES (?, ?)",
        params![id, serialized.to_string()],
      )
      .map_err(|error| error.to_string())?;
    Ok(serialized)
  })
}

#[tauri::command]
fn update_vehicle(state: State<'_, AppState>, id: String, vehicle: Value) -> Result<Value, String> {
  with_connection(&state, |connection| {
    let mut object = object_value(vehicle)?;
    object.insert("id".to_string(), Value::String(id.clone()));
    let serialized = Value::Object(object);
    let updated = connection
      .execute(
        "UPDATE vehicles SET data = ?, updated_at = strftime('%s','now') WHERE id = ?",
        params![serialized.to_string(), id],
      )
      .map_err(|error| error.to_string())?;
    if updated == 0 {
      return Err("Not found".to_string());
    }
    Ok(serialized)
  })
}

#[tauri::command]
fn delete_vehicle(state: State<'_, AppState>, id: String) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM vehicles WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_prices(state: State<'_, AppState>) -> Result<Vec<PriceRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount FROM prices ORDER BY category, model")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(PriceRecord {
          id: row.get(0)?,
          category: row.get(1)?,
          model: row.get(2)?,
          srp: row.get(3)?,
          dnp: row.get(4)?,
          ws_subsidy: row.get(5)?,
          dnp_less_ws_subsidy: row.get(6)?,
          ewt: row.get(7)?,
          po_amount: row.get(8)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[tauri::command]
fn create_price(state: State<'_, AppState>, price: Value) -> Result<PriceRecord, String> {
  with_connection(&state, |connection| {
    let category = required_string(&price, "category")?;
    let model = required_string(&price, "model")?;
    connection
      .execute(
        "INSERT INTO prices (category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount) VALUES (?,?,?,?,?,?,?,?)",
        params![
          category,
          model,
          string_value(&price, "srp", ""),
          string_value(&price, "dnp", ""),
          string_value(&price, "ws_subsidy", ""),
          string_value(&price, "dnp_less_ws_subsidy", ""),
          string_value(&price, "ewt", ""),
          string_value(&price, "po_amount", "")
        ],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    fetch_price(connection, id)
  })
}

#[tauri::command]
fn update_price(state: State<'_, AppState>, id: i64, price: Value) -> Result<PriceRecord, String> {
  with_connection(&state, |connection| {
    let category = required_string(&price, "category")?;
    let model = required_string(&price, "model")?;
    let changed = connection
      .execute(
        "UPDATE prices SET category=?, model=?, srp=?, dnp=?, ws_subsidy=?, dnp_less_ws_subsidy=?, ewt=?, po_amount=?, updated_at=strftime('%s','now') WHERE id = ?",
        params![
          category,
          model,
          string_value(&price, "srp", ""),
          string_value(&price, "dnp", ""),
          string_value(&price, "ws_subsidy", ""),
          string_value(&price, "dnp_less_ws_subsidy", ""),
          string_value(&price, "ewt", ""),
          string_value(&price, "po_amount", ""),
          id
        ],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    fetch_price(connection, id)
  })
}

#[tauri::command]
fn delete_price(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM prices WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_profile(state: State<'_, AppState>) -> Result<ProfileRecord, String> {
  with_connection(&state, |connection| {
    fetch_profile(connection)
  })
}

#[tauri::command]
fn save_profile(state: State<'_, AppState>, profile: Value) -> Result<ProfileRecord, String> {
  with_connection(&state, |connection| {
    let existing_image: Option<String> = connection
      .query_row("SELECT image_data_url FROM profile WHERE id = 1", [], |row| row.get(0))
      .optional()
      .map_err(|error| error.to_string())?
      .flatten();
    let name = required_string(&profile, "name")?;
    let role = required_string(&profile, "role")?;
    let email = required_string(&profile, "email")?;
    let image_data_url = match profile.get("image_data_url") {
      Some(Value::Null) => None,
      Some(Value::String(value)) => Some(value.clone()),
      Some(_) => existing_image,
      None => existing_image,
    };
    connection
      .execute(
        "UPDATE profile SET name = ?, role = ?, email = ?, image_data_url = ? WHERE id = 1",
        params![name, role, email, image_data_url],
      )
      .map_err(|error| error.to_string())?;
    fetch_profile(connection)
  })
}

#[tauri::command]
fn get_general_managers(state: State<'_, AppState>) -> Result<Vec<GeneralManagerRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, name, sort_order FROM general_managers ORDER BY sort_order, name")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(GeneralManagerRecord {
          id: row.get(0)?,
          name: row.get(1)?,
          sort_order: row.get(2)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct CreateGeneralManagerInput {
  name: String,
  consultants: Vec<String>,
}

#[tauri::command]
fn create_general_manager(state: State<'_, AppState>, input: Value) -> Result<Value, String> {
  with_connection(&state, |connection| {
    let parsed: CreateGeneralManagerInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let consultants: Vec<String> = parsed
      .consultants
      .into_iter()
      .map(|consultant| consultant.trim().to_string())
      .filter(|consultant| !consultant.is_empty())
      .collect();
    if consultants.is_empty() {
      return Err("at least one consultant is required".to_string());
    }
    let sort_order = next_sort_order(connection, "general_managers")? + 1;
    let tx = connection.transaction().map_err(|error| error.to_string())?;
    tx.execute(
      "INSERT INTO general_managers (name, sort_order) VALUES (?, ?)",
      params![parsed.name.trim(), sort_order],
    )
    .map_err(|error| error.to_string())?;
    let manager_id = tx.last_insert_rowid();
    for (index, consultant) in consultants.iter().enumerate() {
      tx.execute(
        "INSERT INTO sales_consultants (manager_id, name, sort_order) VALUES (?, ?, ?)",
        params![manager_id, consultant, index as i64],
      )
      .map_err(|error| error.to_string())?;
    }
    tx.commit().map_err(|error| error.to_string())?;
    let manager = get_general_manager_by_id(connection, manager_id)?.ok_or_else(|| "Not found".to_string())?;
    let consultants = get_sales_consultants_for_manager(connection, manager_id)?;
    Ok(json!({ "manager": manager, "consultants": consultants }))
  })
}

#[tauri::command]
fn update_general_manager(state: State<'_, AppState>, id: i64, input: Value) -> Result<GeneralManagerRecord, String> {
  with_connection(&state, |connection| {
    let name = required_string(&input, "name")?;
    let changed = connection
      .execute(
        "UPDATE general_managers SET name = ?, updated_at = strftime('%s','now') WHERE id = ?",
        params![name, id],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    get_general_manager_by_id(connection, id)?.ok_or_else(|| "Not found".to_string())
  })
}

#[tauri::command]
fn delete_general_manager(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM general_managers WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_sales_consultants(state: State<'_, AppState>, manager_id: Option<i64>) -> Result<Vec<SalesConsultantRecord>, String> {
  with_connection(&state, |connection| {
    if let Some(manager_id) = manager_id {
      return get_sales_consultants_for_manager(connection, manager_id);
    }
    let mut statement = connection
      .prepare("SELECT id, manager_id, name, sort_order FROM sales_consultants ORDER BY sort_order, name")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(SalesConsultantRecord {
          id: row.get(0)?,
          manager_id: row.get(1)?,
          name: row.get(2)?,
          sort_order: row.get(3)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct CreateSalesConsultantInput {
  manager_id: i64,
  name: String,
}

#[tauri::command]
fn create_sales_consultant(state: State<'_, AppState>, input: Value) -> Result<SalesConsultantRecord, String> {
  with_connection(&state, |connection| {
    let parsed: CreateSalesConsultantInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let sort_order = next_sort_order_for_manager(connection, parsed.manager_id)? + 1;
    connection
      .execute(
        "INSERT INTO sales_consultants (manager_id, name, sort_order) VALUES (?, ?, ?)",
        params![parsed.manager_id, parsed.name.trim(), sort_order],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    get_sales_consultant_by_id(connection, id)?.ok_or_else(|| "Not found".to_string())
  })
}

#[tauri::command]
fn update_sales_consultant(state: State<'_, AppState>, id: i64, input: Value) -> Result<SalesConsultantRecord, String> {
  with_connection(&state, |connection| {
    let current = get_sales_consultant_by_id(connection, id)?.ok_or_else(|| "Not found".to_string())?;
    let name = required_string(&input, "name")?;
    let next_manager_id = input.get("manager_id").and_then(Value::as_i64).unwrap_or(current.manager_id);
    if next_manager_id != current.manager_id {
      let remaining: i64 = connection
        .query_row(
          "SELECT COUNT(*) FROM sales_consultants WHERE manager_id = ? AND id != ?",
          params![current.manager_id, current.id],
          |row| row.get(0),
        )
        .map_err(|error| error.to_string())?;
      if remaining == 0 {
        return Err("manager must have at least one consultant".to_string());
      }
    }
    connection
      .execute(
        "UPDATE sales_consultants SET name = ?, manager_id = ?, updated_at = strftime('%s','now') WHERE id = ?",
        params![name, next_manager_id, id],
      )
      .map_err(|error| error.to_string())?;
    get_sales_consultant_by_id(connection, id)?.ok_or_else(|| "Not found".to_string())
  })
}

#[tauri::command]
fn delete_sales_consultant(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let current = get_sales_consultant_by_id(connection, id)?.ok_or_else(|| "Not found".to_string())?;
    let remaining: i64 = connection
      .query_row(
        "SELECT COUNT(*) FROM sales_consultants WHERE manager_id = ? AND id != ?",
        params![current.manager_id, current.id],
        |row| row.get(0),
      )
      .map_err(|error| error.to_string())?;
    if remaining == 0 {
      return Err("manager must have at least one consultant".to_string());
    }
    let deleted = connection
      .execute("DELETE FROM sales_consultants WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_pull_outs(state: State<'_, AppState>) -> Result<Vec<PullOutRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, sort_order FROM pull_outs ORDER BY sort_order, id")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(PullOutRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          sph_allocation: row.get(2)?,
          date_of_confirmation: row.get(3)?,
          confirmed_units: row.get(4)?,
          pulled_out: row.get(5)?,
          sort_order: row.get(6)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct PullOutInput {
  description: String,
  sph_allocation: i64,
  date_of_confirmation: String,
  confirmed_units: i64,
  pulled_out: i64,
}

#[tauri::command]
fn create_pull_out(state: State<'_, AppState>, input: Value) -> Result<PullOutRecord, String> {
  with_connection(&state, |connection| {
    let parsed: PullOutInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let sort_order = next_sort_order(connection, "pull_outs")? + 1;
    connection
      .execute(
        "INSERT INTO pull_outs (description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, sort_order) VALUES (?,?,?,?,?,?)",
        params![parsed.description, parsed.sph_allocation, parsed.date_of_confirmation, parsed.confirmed_units, parsed.pulled_out, sort_order],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    fetch_pull_out(connection, id)
  })
}

#[tauri::command]
fn update_pull_out(state: State<'_, AppState>, id: i64, input: Value) -> Result<PullOutRecord, String> {
  with_connection(&state, |connection| {
    let parsed: PullOutInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let changed = connection
      .execute(
        "UPDATE pull_outs SET description=?, sph_allocation=?, date_of_confirmation=?, confirmed_units=?, pulled_out=? WHERE id = ?",
        params![parsed.description, parsed.sph_allocation, parsed.date_of_confirmation, parsed.confirmed_units, parsed.pulled_out, id],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    fetch_pull_out(connection, id)
  })
}

#[tauri::command]
fn delete_pull_out(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM pull_outs WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_payments(state: State<'_, AppState>) -> Result<Vec<PaymentRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, description, number_of_units, total_amount, date_of_payment, remarks, sort_order FROM payments ORDER BY sort_order, id")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(PaymentRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          number_of_units: row.get(2)?,
          total_amount: row.get(3)?,
          date_of_payment: row.get(4)?,
          remarks: row.get(5)?,
          sort_order: row.get(6)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct PaymentInput {
  description: String,
  number_of_units: i64,
  total_amount: f64,
  date_of_payment: String,
  remarks: String,
}

#[tauri::command]
fn create_payment(state: State<'_, AppState>, input: Value) -> Result<PaymentRecord, String> {
  with_connection(&state, |connection| {
    let parsed: PaymentInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let sort_order = next_sort_order(connection, "payments")? + 1;
    connection
      .execute(
        "INSERT INTO payments (description, number_of_units, total_amount, date_of_payment, remarks, sort_order) VALUES (?,?,?,?,?,?)",
        params![parsed.description, parsed.number_of_units, parsed.total_amount, parsed.date_of_payment, parsed.remarks, sort_order],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    fetch_payment(connection, id)
  })
}

#[tauri::command]
fn update_payment(state: State<'_, AppState>, id: i64, input: Value) -> Result<PaymentRecord, String> {
  with_connection(&state, |connection| {
    let parsed: PaymentInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let changed = connection
      .execute(
        "UPDATE payments SET description=?, number_of_units=?, total_amount=?, date_of_payment=?, remarks=? WHERE id = ?",
        params![parsed.description, parsed.number_of_units, parsed.total_amount, parsed.date_of_payment, parsed.remarks, id],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    fetch_payment(connection, id)
  })
}

#[tauri::command]
fn delete_payment(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM payments WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_next_cut_off_payments(state: State<'_, AppState>) -> Result<Vec<NextCutOffRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, sort_order FROM next_cut_off_payments ORDER BY sort_order, id")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(NextCutOffRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          number_of_units: row.get(2)?,
          unit_price: row.get(3)?,
          total_amount: row.get(4)?,
          date_of_payment: row.get(5)?,
          remarks: row.get(6)?,
          status: row.get(7)?,
          sort_order: row.get(8)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct NextCutOffInput {
  description: String,
  number_of_units: i64,
  unit_price: f64,
  total_amount: f64,
  date_of_payment: String,
  remarks: String,
  status: String,
}

#[tauri::command]
fn create_next_cut_off_payment(state: State<'_, AppState>, input: Value) -> Result<NextCutOffRecord, String> {
  with_connection(&state, |connection| {
    let parsed: NextCutOffInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let sort_order = next_sort_order(connection, "next_cut_off_payments")? + 1;
    connection
      .execute(
        "INSERT INTO next_cut_off_payments (description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, sort_order) VALUES (?,?,?,?,?,?,?,?)",
        params![parsed.description, parsed.number_of_units, parsed.unit_price, parsed.total_amount, parsed.date_of_payment, parsed.remarks, parsed.status, sort_order],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    fetch_next_cut_off(connection, id)
  })
}

#[tauri::command]
fn update_next_cut_off_payment(state: State<'_, AppState>, id: i64, input: Value) -> Result<NextCutOffRecord, String> {
  with_connection(&state, |connection| {
    let parsed: NextCutOffInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    let changed = connection
      .execute(
        "UPDATE next_cut_off_payments SET description=?, number_of_units=?, unit_price=?, total_amount=?, date_of_payment=?, remarks=?, status=? WHERE id = ?",
        params![parsed.description, parsed.number_of_units, parsed.unit_price, parsed.total_amount, parsed.date_of_payment, parsed.remarks, parsed.status, id],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    fetch_next_cut_off(connection, id)
  })
}

#[tauri::command]
fn delete_next_cut_off_payment(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM next_cut_off_payments WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_inventory(state: State<'_, AppState>, year: i64) -> Result<Vec<InventoryRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, year, month_index, beginning, wholesale, retail_sales, actual_wholesales FROM inventory_rows WHERE year = ? ORDER BY month_index")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map(params![year], |row| {
        Ok(InventoryRecord {
          id: row.get(0)?,
          year: row.get(1)?,
          month_index: row.get(2)?,
          beginning: row.get(3)?,
          wholesale: row.get(4)?,
          retail_sales: row.get(5)?,
          actual_wholesales: row.get(6)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct InventoryInput {
  year: i64,
  month_index: i64,
  beginning: Option<i64>,
  wholesale: Option<i64>,
  retail_sales: Option<i64>,
  actual_wholesales: Option<i64>,
}

#[tauri::command]
fn upsert_inventory(state: State<'_, AppState>, input: Value) -> Result<InventoryRecord, String> {
  with_connection(&state, |connection| {
    let parsed: InventoryInput = serde_json::from_value(input).map_err(|error| error.to_string())?;
    connection
      .execute(
        "INSERT INTO inventory_rows (year, month_index, beginning, wholesale, retail_sales, actual_wholesales) VALUES (?,?,?,?,?,?) ON CONFLICT(year, month_index) DO UPDATE SET beginning = excluded.beginning, wholesale = excluded.wholesale, retail_sales = excluded.retail_sales, actual_wholesales = excluded.actual_wholesales",
        params![parsed.year, parsed.month_index, parsed.beginning, parsed.wholesale, parsed.retail_sales, parsed.actual_wholesales],
      )
      .map_err(|error| error.to_string())?;
    connection
      .query_row(
        "SELECT id, year, month_index, beginning, wholesale, retail_sales, actual_wholesales FROM inventory_rows WHERE year = ? AND month_index = ?",
        params![parsed.year, parsed.month_index],
        |row| {
          Ok(InventoryRecord {
            id: row.get(0)?,
            year: row.get(1)?,
            month_index: row.get(2)?,
            beginning: row.get(3)?,
            wholesale: row.get(4)?,
            retail_sales: row.get(5)?,
            actual_wholesales: row.get(6)?,
          })
        },
      )
      .map_err(|error| error.to_string())
  })
}

#[tauri::command]
fn get_colors(state: State<'_, AppState>) -> Result<Vec<ColorRecord>, String> {
  with_connection(&state, |connection| {
    let mut statement = connection
      .prepare("SELECT id, name, hex, sort_order FROM colors ORDER BY sort_order, id")
      .map_err(|error| error.to_string())?;
    let rows = statement
      .query_map([], |row| {
        Ok(ColorRecord {
          id: row.get(0)?,
          name: row.get(1)?,
          hex: row.get(2)?,
          sort_order: row.get(3)?,
        })
      })
      .map_err(|error| error.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
  })
}

#[derive(Debug, Deserialize)]
struct ColorInput {
  name: String,
  hex: String,
}

#[tauri::command]
fn create_color(state: State<'_, AppState>, color: Value) -> Result<ColorRecord, String> {
  with_connection(&state, |connection| {
    let parsed: ColorInput = serde_json::from_value(color).map_err(|error| error.to_string())?;
    let sort_order = next_sort_order(connection, "colors")? + 1;
    connection
      .execute(
        "INSERT INTO colors (name, hex, sort_order) VALUES (?, ?, ?)",
        params![parsed.name.trim(), parsed.hex.trim(), sort_order],
      )
      .map_err(|error| error.to_string())?;
    let id = connection.last_insert_rowid();
    fetch_color(connection, id)
  })
}

#[tauri::command]
fn update_color(state: State<'_, AppState>, id: i64, color: Value) -> Result<ColorRecord, String> {
  with_connection(&state, |connection| {
    let parsed: ColorInput = serde_json::from_value(color).map_err(|error| error.to_string())?;
    let changed = connection
      .execute(
        "UPDATE colors SET name = ?, hex = ?, updated_at = strftime('%s','now') WHERE id = ?",
        params![parsed.name.trim(), parsed.hex.trim(), id],
      )
      .map_err(|error| error.to_string())?;
    if changed == 0 {
      return Err("Not found".to_string());
    }
    fetch_color(connection, id)
  })
}

#[tauri::command]
fn delete_color(state: State<'_, AppState>, id: i64) -> Result<(), String> {
  with_connection(&state, |connection| {
    let deleted = connection
      .execute("DELETE FROM colors WHERE id = ?", params![id])
      .map_err(|error| error.to_string())?;
    if deleted == 0 {
      return Err("Not found".to_string());
    }
    Ok(())
  })
}

#[tauri::command]
fn get_setting(state: State<'_, AppState>, key: String) -> Result<Value, String> {
  with_connection(&state, |connection| {
    let value: Option<String> = connection
      .query_row("SELECT value FROM settings WHERE key = ?", params![key], |row| row.get(0))
      .optional()
      .map_err(|error| error.to_string())?
      .flatten();
    Ok(json!({ "value": value }))
  })
}

#[tauri::command]
fn set_setting(state: State<'_, AppState>, key: String, value: String) -> Result<Value, String> {
  with_connection(&state, |connection| {
    connection
      .execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        params![key, value],
      )
      .map_err(|error| error.to_string())?;
    Ok(json!({ "ok": true }))
  })
}

fn generate_vehicle_id() -> String {
  let timestamp = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .map(|duration| duration.as_millis())
    .unwrap_or_default();
  format!("v-{}-{:x}", timestamp, timestamp ^ 0x5a5a5a5a)
}

fn get_general_manager_by_id(connection: &rusqlite::Connection, id: i64) -> Result<Option<GeneralManagerRecord>, String> {
  connection
    .query_row(
      "SELECT id, name, sort_order FROM general_managers WHERE id = ?",
      params![id],
      |row| {
        Ok(GeneralManagerRecord {
          id: row.get(0)?,
          name: row.get(1)?,
          sort_order: row.get(2)?,
        })
      },
    )
    .optional()
    .map_err(|error| error.to_string())
}

fn get_sales_consultant_by_id(connection: &rusqlite::Connection, id: i64) -> Result<Option<SalesConsultantRecord>, String> {
  connection
    .query_row(
      "SELECT id, manager_id, name, sort_order FROM sales_consultants WHERE id = ?",
      params![id],
      |row| {
        Ok(SalesConsultantRecord {
          id: row.get(0)?,
          manager_id: row.get(1)?,
          name: row.get(2)?,
          sort_order: row.get(3)?,
        })
      },
    )
    .optional()
    .map_err(|error| error.to_string())
}

fn get_sales_consultants_for_manager(connection: &rusqlite::Connection, manager_id: i64) -> Result<Vec<SalesConsultantRecord>, String> {
  let mut statement = connection
    .prepare("SELECT id, manager_id, name, sort_order FROM sales_consultants WHERE manager_id = ? ORDER BY sort_order, name")
    .map_err(|error| error.to_string())?;
  let rows = statement
    .query_map(params![manager_id], |row| {
      Ok(SalesConsultantRecord {
        id: row.get(0)?,
        manager_id: row.get(1)?,
        name: row.get(2)?,
        sort_order: row.get(3)?,
      })
    })
    .map_err(|error| error.to_string())?;
  rows.collect::<Result<Vec<_>, _>>().map_err(|error| error.to_string())
}

fn next_sort_order_for_manager(connection: &rusqlite::Connection, manager_id: i64) -> Result<i64, String> {
  connection
    .query_row(
      "SELECT COALESCE(MAX(sort_order), -1) FROM sales_consultants WHERE manager_id = ?",
      params![manager_id],
      |row| row.get(0),
    )
    .map_err(|error| error.to_string())
}

fn next_sort_order(connection: &rusqlite::Connection, table: &str) -> Result<i64, String> {
  let sql = format!("SELECT COALESCE(MAX(sort_order), -1) FROM {}", table);
  connection
    .query_row(&sql, [], |row| row.get(0))
    .map_err(|error| error.to_string())
}

fn fetch_price(connection: &rusqlite::Connection, id: i64) -> Result<PriceRecord, String> {
  connection
    .query_row(
      "SELECT id, category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount FROM prices WHERE id = ?",
      params![id],
      |row| {
        Ok(PriceRecord {
          id: row.get(0)?,
          category: row.get(1)?,
          model: row.get(2)?,
          srp: row.get(3)?,
          dnp: row.get(4)?,
          ws_subsidy: row.get(5)?,
          dnp_less_ws_subsidy: row.get(6)?,
          ewt: row.get(7)?,
          po_amount: row.get(8)?,
        })
      },
    )
    .map_err(|error| error.to_string())
}

fn fetch_profile(connection: &rusqlite::Connection) -> Result<ProfileRecord, String> {
  connection
    .query_row(
      "SELECT id, name, role, email, image_data_url FROM profile WHERE id = 1",
      [],
      |row| {
        Ok(ProfileRecord {
          id: row.get(0)?,
          name: row.get(1)?,
          role: row.get(2)?,
          email: row.get(3)?,
          image_data_url: row.get(4)?,
        })
      },
    )
    .map_err(|error| error.to_string())
}

fn fetch_color(connection: &rusqlite::Connection, id: i64) -> Result<ColorRecord, String> {
  connection
    .query_row(
      "SELECT id, name, hex, sort_order FROM colors WHERE id = ?",
      params![id],
      |row| {
        Ok(ColorRecord {
          id: row.get(0)?,
          name: row.get(1)?,
          hex: row.get(2)?,
          sort_order: row.get(3)?,
        })
      },
    )
    .map_err(|error| error.to_string())
}

fn fetch_pull_out(connection: &rusqlite::Connection, id: i64) -> Result<PullOutRecord, String> {
  connection
    .query_row(
      "SELECT id, description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, sort_order FROM pull_outs WHERE id = ?",
      params![id],
      |row| {
        Ok(PullOutRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          sph_allocation: row.get(2)?,
          date_of_confirmation: row.get(3)?,
          confirmed_units: row.get(4)?,
          pulled_out: row.get(5)?,
          sort_order: row.get(6)?,
        })
      },
    )
    .map_err(|error| error.to_string())
}

fn fetch_payment(connection: &rusqlite::Connection, id: i64) -> Result<PaymentRecord, String> {
  connection
    .query_row(
      "SELECT id, description, number_of_units, total_amount, date_of_payment, remarks, sort_order FROM payments WHERE id = ?",
      params![id],
      |row| {
        Ok(PaymentRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          number_of_units: row.get(2)?,
          total_amount: row.get(3)?,
          date_of_payment: row.get(4)?,
          remarks: row.get(5)?,
          sort_order: row.get(6)?,
        })
      },
    )
    .map_err(|error| error.to_string())
}

fn fetch_next_cut_off(connection: &rusqlite::Connection, id: i64) -> Result<NextCutOffRecord, String> {
  connection
    .query_row(
      "SELECT id, description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, sort_order FROM next_cut_off_payments WHERE id = ?",
      params![id],
      |row| {
        Ok(NextCutOffRecord {
          id: row.get(0)?,
          description: row.get(1)?,
          number_of_units: row.get(2)?,
          unit_price: row.get(3)?,
          total_amount: row.get(4)?,
          date_of_payment: row.get(5)?,
          remarks: row.get(6)?,
          status: row.get(7)?,
          sort_order: row.get(8)?,
        })
      },
    )
    .map_err(|error| error.to_string())
=======
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  app_lib::run();
>>>>>>> e7ea5df30d1e5a4e1ea3a94e66d01ba76b0201ce
}
