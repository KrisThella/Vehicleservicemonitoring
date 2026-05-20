import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = process.env.VERCEL
  ? path.resolve('/tmp', 'data')
  : path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, 'tsmpc.db');
export const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
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
    allocation_table_id INTEGER,
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

  CREATE TABLE IF NOT EXISTS model_color_assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    price_id INTEGER NOT NULL,
    color_id INTEGER NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    FOREIGN KEY(price_id) REFERENCES prices(id) ON DELETE CASCADE,
    FOREIGN KEY(color_id) REFERENCES colors(id) ON DELETE CASCADE,
    UNIQUE(price_id, color_id)
  );

  CREATE TABLE IF NOT EXISTS allocation_tables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    date_of_confirmation TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
    sort_order INTEGER NOT NULL DEFAULT 0
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
`);
