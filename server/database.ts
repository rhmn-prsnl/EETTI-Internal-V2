import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');
const schemaPath = path.join(process.cwd(), 'server', 'schema.sql');

const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database initialized successfully.');
}

export default db;
