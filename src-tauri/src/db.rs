use rusqlite::Connection;
use std::{fs, path::{Path, PathBuf}};
use tauri::AppHandle;

pub fn initialize_db(app: &AppHandle) -> Result<PathBuf, String> {
  let app_data_dir = app
    .path_resolver()
    .app_data_dir()
    .ok_or_else(|| "Unable to resolve app data directory".to_string())?;
  fs::create_dir_all(&app_data_dir).map_err(|error| error.to_string())?;
  let db_path = app_data_dir.join("vehicleservicemonitoring.db");

  if !db_path.exists() {
    if let Some(legacy_db) = legacy_database_path() {
      if legacy_db.exists() {
        fs::copy(&legacy_db, &db_path).map_err(|error| error.to_string())?;
      }
    }
  }

  let connection = open_connection(&db_path)?;
  ensure_schema(&connection)?;
  Ok(db_path)
}

pub fn ensure_default_profile(db_path: &Path) -> Result<(), String> {
  let connection = open_connection(db_path)?;
  let count: i64 = connection
    .query_row("SELECT COUNT(*) FROM profile", [], |row| row.get(0))
    .map_err(|error| error.to_string())?;
  if count == 0 {
    connection
      .execute(
        "INSERT INTO profile (id, name, role, email, image_data_url) VALUES (1, ?, ?, ?, NULL)",
        ["Donna Ricci", "Admin User", "donna.ricci@tsmpc.com"],
      )
      .map_err(|error| error.to_string())?;
  }
  Ok(())
}

pub fn open_connection(db_path: &Path) -> Result<Connection, String> {
  let connection = Connection::open(db_path).map_err(|error| error.to_string())?;
  connection
    .pragma_update(None, "journal_mode", "WAL")
    .map_err(|error| error.to_string())?;
  connection
    .pragma_update(None, "foreign_keys", "ON")
    .map_err(|error| error.to_string())?;
  Ok(connection)
}

pub fn ensure_schema(connection: &Connection) -> Result<(), String> {
  connection
    .execute_batch(
      r#"
      CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS prices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        model TEXT NOT NULL UNIQUE,
        srp TEXT NOT NULL DEFAULT '',
        dnp TEXT NOT NULL DEFAULT '',
        ws_subsidy TEXT NOT NULL DEFAULT '',
        dnp_less_ws_subsidy TEXT NOT NULL DEFAULT '',
        ewt TEXT NOT NULL DEFAULT '',
        po_amount TEXT NOT NULL DEFAULT '',
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT NOT NULL,
        image_data_url TEXT
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pull_outs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        sph_allocation INTEGER NOT NULL DEFAULT 0,
        date_of_confirmation TEXT NOT NULL DEFAULT '',
        confirmed_units INTEGER NOT NULL DEFAULT 0,
        pulled_out INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        number_of_units INTEGER NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        date_of_payment TEXT NOT NULL DEFAULT '',
        remarks TEXT NOT NULL DEFAULT '',
        sort_order INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS inventory_rows (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        year INTEGER NOT NULL,
        month_index INTEGER NOT NULL,
        beginning INTEGER,
        wholesale INTEGER,
        retail_sales INTEGER,
        actual_wholesales INTEGER,
        UNIQUE(year, month_index)
      );

      CREATE TABLE IF NOT EXISTS colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        hex TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS general_managers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS sales_consultants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        manager_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
      );

      CREATE TABLE IF NOT EXISTS next_cut_off_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        description TEXT NOT NULL,
        number_of_units INTEGER NOT NULL DEFAULT 1,
        unit_price REAL NOT NULL DEFAULT 0,
        total_amount REAL NOT NULL DEFAULT 0,
        date_of_payment TEXT NOT NULL DEFAULT '',
        remarks TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PENDING',
        sort_order INTEGER NOT NULL DEFAULT 0
      );
      "#,
    )
    .map_err(|error| error.to_string())
}

fn legacy_database_path() -> Option<PathBuf> {
  std::env::current_dir().ok().map(|cwd| cwd.join("data/tsmpc.db"))
}