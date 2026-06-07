import { randomUUID } from 'node:crypto';
import { getDb } from '../db.js';

// Validate album name
function validateName(name) {
  if (!name || typeof name !== 'string') {
    throw new Error('Name is required');
  }
  if (!name.trim()) {
    throw new Error('Name cannot be empty');
  }
  return name.trim();
}

// Validate date format (YYYY-MM-DD)
function validateDate(date) {
  if (!date || typeof date !== 'string') {
    throw new Error('Date is required');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('Invalid date format. Use YYYY-MM-DD');
  }
  return date;
}

// List all albums
export async function listAlbums() {
  const db = getDb();
  const albums = db
    .prepare(`
      SELECT 
        a.id,
        a.name,
        a.date,
        a.sort_order,
        a.created_at,
        a.updated_at,
        (SELECT thumb_path FROM photos WHERE album_id = a.id ORDER BY sort_order ASC LIMIT 1) as cover_thumb_path,
        (SELECT COUNT(*) FROM photos WHERE album_id = a.id) as photo_count
      FROM albums a
      ORDER BY a.date DESC, a.sort_order ASC
    `)
    .all();
  return albums;
}

// Create album
export async function createAlbum(name, date) {
  const db = getDb();
  const id = randomUUID();
  const now = new Date().toISOString();

  const validatedName = validateName(name);
  const validatedDate = validateDate(date);

  db.prepare(`
    INSERT INTO albums (id, name, date, sort_order, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, validatedName, validatedDate, 0, now, now);

  return db
    .prepare(`
      SELECT 
        id,
        name,
        date,
        sort_order,
        created_at,
        updated_at,
        NULL as cover_thumb_path,
        0 as photo_count
      FROM albums WHERE id = ?
    `)
    .get(id);
}

// Update album
export async function updateAlbum(id, name, date) {
  const db = getDb();
  const now = new Date().toISOString();
  const updates = {};
  const params = [];

  if (name !== undefined) {
    const validatedName = validateName(name);
    updates.name = '?';
    params.push(validatedName);
  }

  if (date !== undefined) {
    const validatedDate = validateDate(date);
    updates.date = '?';
    params.push(validatedDate);
  }

  if (Object.keys(updates).length === 0) {
    throw new Error('No fields to update');
  }

  params.push(now);
  params.push(id);

  const setClause = Object.entries(updates)
    .map(([key, placeholder]) => `${key} = ${placeholder}`)
    .join(', ');

  db.prepare(`UPDATE albums SET ${setClause}, updated_at = ? WHERE id = ?`).run(...params);

  return db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
}

// Delete album
export async function deleteAlbum(id) {
  const db = getDb();

  // Get all photo paths before cascade delete
  const photos = db.prepare('SELECT file_path, thumb_path FROM photos WHERE album_id = ?').all(id);

  // Delete album (cascade deletes photos)
  db.prepare('DELETE FROM albums WHERE id = ?').run(id);

  // Clean up files (implementation in photo-service or here)
  return photos;
}

// Reorder albums
export async function reorderAlbums(updates) {
  const db = getDb();
  const transaction = db.transaction(() => {
    let count = 0;
    for (const update of updates) {
      db.prepare('UPDATE albums SET sort_order = ? WHERE id = ?').run(update.sort_order, update.id);
      count++;
    }
    return count;
  });

  return transaction();
}

export default {
  listAlbums,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  reorderAlbums
};
