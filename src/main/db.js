import Database from 'better-sqlite3';
import { join } from 'node:path';
import { app } from 'electron';
import { existsSync, mkdirSync } from 'node:fs';

let db = null;

// Get database path
function getDbPath() {
  const userDataPath = app.getPath('userData');
  if (!existsSync(userDataPath)) {
    mkdirSync(userDataPath, { recursive: true });
  }
  return join(userDataPath, 'photo-albums.sqlite');
}

// Initialize database connection
export function initializeDatabase() {
  const dbPath = getDbPath();
  db = new Database(dbPath);

  // Enable WAL mode for better concurrent access
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Run migrations
  runMigrations();

  return db;
}

// Get database connection
export function getDb() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

// Migration runner
function runMigrations() {
  // Create schema version table if it doesn't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS _schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  // Get current schema version
  let currentVersion = 0;
  try {
    const result = db.prepare('SELECT MAX(version) as version FROM _schema_version').get();
    currentVersion = result?.version || 0;
  } catch {
    currentVersion = 0;
  }

  // Define migrations
  const migrations = [
    {
      version: 1,
      description: 'Create albums table',
      sql: `
        CREATE TABLE IF NOT EXISTS albums (
          id         TEXT    PRIMARY KEY,
          name       TEXT    NOT NULL CHECK(length(trim(name)) > 0),
          date       TEXT    NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT    NOT NULL,
          updated_at TEXT    NOT NULL
        );
      `
    },
    {
      version: 2,
      description: 'Create photos table',
      sql: `
        CREATE TABLE IF NOT EXISTS photos (
          id         TEXT    PRIMARY KEY,
          album_id   TEXT    NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
          filename   TEXT    NOT NULL,
          file_path  TEXT    NOT NULL,
          thumb_path TEXT    NOT NULL,
          mime_type  TEXT    NOT NULL,
          file_size  INTEGER NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT    NOT NULL
        );
      `
    },
    {
      version: 3,
      description: 'Add indices',
      sql: `
        CREATE INDEX IF NOT EXISTS idx_albums_date       ON albums(date);
        CREATE INDEX IF NOT EXISTS idx_photos_album_id   ON photos(album_id);
        CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(album_id, sort_order);
      `
    }
  ];

  // Apply pending migrations
  migrations.forEach((migration) => {
    if (migration.version > currentVersion) {
      try {
        db.exec(migration.sql);
        db.prepare(
          'INSERT INTO _schema_version (version, applied_at) VALUES (?, ?)'
        ).run(migration.version, new Date().toISOString());
        console.log(`✓ Applied migration v${migration.version}: ${migration.description}`);
      } catch (error) {
        console.error(`✗ Failed to apply migration v${migration.version}:`, error);
        throw error;
      }
    }
  });
}

export default { initializeDatabase, getDb };
