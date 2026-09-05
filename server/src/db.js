import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');

export const DEFAULT_DB_PATH = path.join(serverRoot, 'data', 'marketplace.db');

let _db = null;

/**
 * Opens (and lazily migrates) the SQLite database.
 * Safe to call multiple times — the same handle is reused.
 */
export function openDb() {
  if (_db) return _db;

  const dbPath = process.env.DB_PATH
    ? path.resolve(serverRoot, process.env.DB_PATH)
    : DEFAULT_DB_PATH;

  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON;');
  db.exec('PRAGMA journal_mode = WAL;');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema);

  _db = db;
  return db;
}

/** Closes the database (used by tests / CLI scripts). */
export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}