#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // Initialize logging plugin in dev
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Ensure a writable app-local DB exists and is seeded with defaults on first run.
      // The DB will be created at: <user_local_data_dir>/Vehicle Service Monitoring/tsmpc.db
      std::thread::spawn({
      let _app_handle = app.handle();
        move || {
          if let Err(e) = ensure_app_db() {
            log::error!("failed to ensure app DB: {}", e);
          } else {
            log::info!("app DB ready");
          }
        }
      });

      // Attempt to spawn a bundled backend server executable if present.
      // This is non-fatal — if not found, the app will continue and the
      // frontend will attempt to reach an external backend (127.0.0.1:3001).
      std::thread::spawn({
        let _app_handle = app.handle();
        move || {
          // Resolve a plausible path for a bundled server binary next to the app executable.
          if let Ok(mut exe_path) = std::env::current_exe() {
            // exe_path -> .../Resources/<app>/ or the exe location
            if exe_path.pop() {
              // Try `server/server(.exe)` relative to exe location
              #[cfg(target_os = "windows")]
              let candidate = exe_path.join("server").join("server.exe");
              #[cfg(not(target_os = "windows"))]
              let candidate = exe_path.join("server").join("server");

              if candidate.exists() {
                match std::process::Command::new(&candidate)
                  .stdout(std::process::Stdio::null())
                  .stderr(std::process::Stdio::null())
                  .spawn()
                {
                  Ok(child) => {
                    log::info!("spawned bundled server: {:?}", candidate);
                    // We intentionally do not wait; child will continue until exit.
                    // Optionally we could store the Child handle somewhere to kill on exit.
                    let _ = child;
                  }
                  Err(e) => {
                    log::error!("failed to spawn bundled server {:?}: {}", candidate, e);
                  }
                }
              } else {
                log::info!("bundled server binary not found at {:?}", candidate);
              }
            }
          }
        }
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

fn ensure_app_db() -> Result<(), Box<dyn std::error::Error>> {
  use std::fs;
  use std::path::PathBuf;
  use rusqlite::Connection;

  // Determine base data dir (fallback to current dir)
  let base = dirs::data_local_dir().unwrap_or(std::env::current_dir()?);
  let app_dir = base.join("Vehicle Service Monitoring");
  if !app_dir.exists() {
    fs::create_dir_all(&app_dir)?;
  }
  let db_path: PathBuf = app_dir.join("tsmpc.db");

  if db_path.exists() {
    return Ok(());
  }

  // Create and seed DB
  let conn = Connection::open(&db_path)?;

  // Create minimal tables required for defaults
  conn.execute_batch(r#"
    PRAGMA foreign_keys = ON;
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
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
      FOREIGN KEY(manager_id) REFERENCES general_managers(id) ON DELETE CASCADE,
      UNIQUE(manager_id, name)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  "#)?;

  // Insert default prices
  let mut stmt = conn.prepare(
    "INSERT INTO prices (category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  )?;
  let defaults = vec![
    ("APV", "APV 1.6 GA MT", "763,000.00", "717,220.00", "35,000.00", "682,220.00", "3,045.63", "679,174.38"),
    ("APV", "APV 1.6 GLX MT", "975,000.00", "916,500.00", "80,000.00", "836,500.00", "3,734.68", "832,765.32"),
    ("CELERIO", "CELERIO 1.0 GL AGS", "754,000.00", "708,760.00", "53,000.00", "655,760.00", "2,927.50", "652,832.50"),
    ("DZIRE", "DZIRE GL CVT - HYBRID", "920,000.00", "864,800.00", "50,000.00", "814,800.00", "3,637.50", "811,162.50"),
    ("SWIFT", "SWIFT 1.2 GL CVT", "845,000.00", "794,300.00", "30,000.00", "764,300.00", "3,412.05", "760,887.95"),
  ];
  for d in defaults {
    let _ = stmt.execute(d)?;
  }

  // Insert default colors
  let mut stmtc = conn.prepare("INSERT INTO colors (name, hex, sort_order) VALUES (?, ?, ?)")?;
  let colors = vec![
    ("PEARL PURE WHITE", "#FFFFFF", 0),
    ("MIDNIGHT BLACK", "#0B0B0B", 1),
    ("SUPERIOR WHITE", "#F4F5F6", 2),
    ("PHOENIX RED PEARL", "#C0392B", 3),
    ("RADIANT RED PEARL", "#D32F2F", 4),
    ("SILKY SILVER METALLIC", "#B7B9BB", 5),
  ];
  for c in colors {
    let _ = stmtc.execute((&c.0, &c.1, c.2))?;
  }

  // Insert default teams and consultants
  let mut stmtm = conn.prepare("INSERT INTO general_managers (name, sort_order) VALUES (?, ?)")?;
  let mut stmtsc = conn.prepare("INSERT INTO sales_consultants (manager_id, name, sort_order) VALUES (?, ?, ?)")?;

  let teams: Vec<(&str, Vec<&str>)> = vec![
    ("MR. AARON QUIROGA", vec!["ALONTE, NERRISA","ARAGONES, SARAH JANE M.","CERVANTES, ELLA MARIE","DAGOL, ANN-MARIE","FONACIER, APRIL R.","SARMIENTO, KAREN L."]),
    ("MR. NESTOR MATEO SENARIO JR.", vec!["ALBANO, RHIAN IRISH","BARTOLAZA, ROCHELLE V.","DANO, RYAN","LOYOLA, KARL JOHN","MALLARI, MARILYN","MONTANA, JERISH"]),
    ("MR. ROGELIO MENDOZA JR.", vec!["CARAMAY, CARNATION","CASTILLO, JAARON ALBERT D.","MANZANO, ROCKY R.","MARANAN, SALVE MAY CHRISTY J.","MONDEJAR, JESSA MAE","PERA, REGINA O.","STA. MARIA, THELMA C.","VIZCARRA, JELLY ANN L."])
  ];
  for (i, (mgr, consultants)) in teams.into_iter().enumerate() {
    let _res = stmtm.execute((&mgr, i as i64))?;
    let manager_id = conn.last_insert_rowid();
    for (j, sc) in consultants.into_iter().enumerate() {
      let _ = stmtsc.execute((manager_id, sc, j as i64))?;
    }
  }

  // Record that defaults were seeded
  conn.execute("INSERT OR REPLACE INTO settings (key, value) VALUES ('defaults_seed_version', '1')", ())?;

  Ok(())
}
