import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.resolve(process.cwd(), 'data');
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
`);
