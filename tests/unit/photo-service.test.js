import Database from 'better-sqlite3';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

let db;

vi.mock('../../src/main/db.js', () => ({
  getDb: () => db
}));

vi.mock('electron', () => ({
  app: {
    getPath: () => 'C:/tmp'
  },
  nativeImage: {
    createFromPath: () => ({
      isEmpty: () => false,
      getSize: () => ({ width: 1000, height: 500 }),
      resize: () => ({
        toJPEG: () => Buffer.from('jpeg')
      })
    })
  }
}));

function createSchema(connection) {
  connection.exec(`
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

describe('photo-service listPhotos', () => {
  beforeEach(() => {
    db = new Database(':memory:');
    createSchema(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns photos sorted by sort_order', async () => {
    const now = new Date().toISOString();

    db.prepare(
      'INSERT INTO photos (id, album_id, filename, file_path, thumb_path, mime_type, file_size, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('p-1', 'a-1', 'one.jpg', 'photos/a-1/one.jpg', 'photos/a-1/one.thumb.jpg', 'image/jpeg', 100, 2, now);

    db.prepare(
      'INSERT INTO photos (id, album_id, filename, file_path, thumb_path, mime_type, file_size, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run('p-2', 'a-1', 'two.jpg', 'photos/a-1/two.jpg', 'photos/a-1/two.thumb.jpg', 'image/jpeg', 100, 1, now);

    const { listPhotos } = await import('../../src/main/services/photo-service.js');
    const photos = await listPhotos('a-1');

    expect(photos.map((photo) => photo.id)).toEqual(['p-2', 'p-1']);
  });

  it('returns an empty list for album without photos', async () => {
    const { listPhotos } = await import('../../src/main/services/photo-service.js');
    const photos = await listPhotos('missing-album');
    expect(photos).toEqual([]);
  });
});
