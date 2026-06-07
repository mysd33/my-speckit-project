import Database from 'better-sqlite3';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

let db;

vi.mock('../../src/main/db.js', () => ({
  getDb: () => db
}));

function createSchema(connection) {
  connection.exec(`
    CREATE TABLE albums (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE photos (
      id TEXT PRIMARY KEY,
      album_id TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      thumb_path TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

describe('album-service listAlbums', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    createSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns an empty list when there are no albums', async () => {
    const { listAlbums } = await import('../../src/main/services/album-service.js');

    const albums = await listAlbums();

    expect(albums).toEqual([]);
  });

  it('sorts by date DESC then sort_order ASC and includes derived fields', async () => {
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO albums (id, name, date, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('a-1', 'May Second', '2026-05-20', 2, now, now);
    db.prepare(
      'INSERT INTO albums (id, name, date, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('a-2', 'June First', '2026-06-01', 1, now, now);
    db.prepare(
      'INSERT INTO albums (id, name, date, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
    ).run('a-3', 'May First', '2026-05-20', 1, now, now);

    db.prepare(
      'INSERT INTO photos (id, album_id, filename, file_path, thumb_path, mime_type, file_size, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('p-1', 'a-3', 'first.jpg', 'photos/a-3/first.jpg', 'photos/a-3/first.thumb.jpg', 'image/jpeg', 1000, 1, now);
    db.prepare(
      'INSERT INTO photos (id, album_id, filename, file_path, thumb_path, mime_type, file_size, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('p-2', 'a-3', 'second.jpg', 'photos/a-3/second.jpg', 'photos/a-3/second.thumb.jpg', 'image/jpeg', 1000, 2, now);

    const { listAlbums } = await import('../../src/main/services/album-service.js');
    const albums = await listAlbums();

    expect(albums.map((album) => album.id)).toEqual(['a-2', 'a-3', 'a-1']);
    expect(albums[1].cover_thumb_path).toBe('photos/a-3/first.thumb.jpg');
    expect(albums[1].photo_count).toBe(2);
    expect(albums[0].cover_thumb_path).toBeNull();
    expect(albums[0].photo_count).toBe(0);
  });
});
