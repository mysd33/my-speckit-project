# Data Model: Photo Album Organizer

**Phase**: 1 — Design
**Date**: 2026-05-31
**Plan**: [plan.md](plan.md)

---

## Entities

### Album

Represents a named, dated collection of photos.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT (UUID v4) | PRIMARY KEY | Stable identifier generated at creation |
| `name` | TEXT | NOT NULL | User-provided display name (non-empty) |
| `date` | TEXT | NOT NULL | ISO date string `YYYY-MM-DD`; user-assigned; used for display grouping |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | Manual order position within date section; lower = first |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp; set at creation, never updated |
| `updated_at` | TEXT | NOT NULL | ISO 8601 timestamp; updated on name/date/order changes |

**Validation rules**:
- `name` MUST be non-empty after trim.
- `date` MUST match `YYYY-MM-DD` format.
- `sort_order` MUST be ≥ 0.

**Derived / computed properties** (not persisted):
- `cover_photo_path` — `thumb_path` of the photo with the lowest `sort_order` in the album; falls back to null if album is empty.
- `photo_count` — count of rows in `photos` where `album_id = album.id`.

---

### Photo

Represents a single imported image belonging to exactly one album.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT (UUID v4) | PRIMARY KEY | Stable identifier generated at import |
| `album_id` | TEXT (UUID v4) | NOT NULL, FK → albums.id ON DELETE CASCADE | Owning album; cascade delete removes photo row when album is deleted |
| `filename` | TEXT | NOT NULL | Original file name as selected by the user (may include a de-dup suffix) |
| `file_path` | TEXT | NOT NULL | Relative path from `userData` to the stored original, e.g. `photos/album-id/uuid.jpg` |
| `thumb_path` | TEXT | NOT NULL | Relative path from `userData` to the generated thumbnail, e.g. `photos/album-id/uuid.thumb.jpg` |
| `mime_type` | TEXT | NOT NULL | One of `image/jpeg`, `image/png`, `image/gif`, `image/webp` |
| `file_size` | INTEGER | NOT NULL | File size in bytes of the original; MUST be ≤ 20 971 520 (20 MB) |
| `sort_order` | INTEGER | NOT NULL, DEFAULT 0 | Display order within the album; lower = first |
| `created_at` | TEXT | NOT NULL | ISO 8601 timestamp; set at import, never updated |

**Validation rules**:
- `mime_type` MUST be one of the four supported types.
- `file_size` MUST be > 0 and ≤ 20 971 520 bytes.
- `file_path` and `thumb_path` MUST be relative paths that do not start with `..` (path traversal guard).

---

## Relationships

```
Album ─── 1 ──── N ─── Photo
```

- One Album has zero or more Photos.
- One Photo belongs to exactly one Album.
- Deleting an Album cascades and deletes all its Photos (SQLite `ON DELETE CASCADE`).

**Flat hierarchy constraint**: Albums are never children of other Albums. The entity graph has exactly two levels: Album → Photo.

---

## SQLite Schema

```sql
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS albums (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL CHECK(length(trim(name)) > 0),
  date       TEXT    NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT    NOT NULL,
  updated_at TEXT    NOT NULL
);

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

CREATE INDEX IF NOT EXISTS idx_albums_date       ON albums(date);
CREATE INDEX IF NOT EXISTS idx_photos_album_id   ON photos(album_id);
CREATE INDEX IF NOT EXISTS idx_photos_sort_order ON photos(album_id, sort_order);
```

**WAL mode**: Enabled for better concurrent read performance (Electron's renderer process may read via IPC while the main process writes).

**Migrations**: Applied at app startup via a sequential migration runner in `src/main/db.js`; each migration is a plain SQL string keyed by a monotonically increasing integer version.

---

## State Transitions

### Album lifecycle

```
[not exists] ──create──→ [exists, empty] ──add photos──→ [exists, populated]
                                │                                │
                           delete album                    delete album
                                ↓                                ↓
                          [not exists]                   [not exists]
                         (no cascade)           (cascade deletes all photos)
```

### Photo lifecycle

```
[not exists] ──import──→ [exists in album] ──remove──→ [not exists]
                                                  (file + thumb deleted from userData)
```

---

## Design Notes

- **UUIDs** are generated in the main process using `crypto.randomUUID()` (Node.js built-in, no library).
- **Timestamps** are stored as ISO 8601 strings in UTC (e.g. `2026-05-31T10:00:00.000Z`); SQLite has no native DATETIME type.
- **sort_order** within a date section is scoped per section: when the user reorders albums via drag-and-drop, only the `sort_order` values for albums in that date section are updated in a single transaction.
- **File storage layout** under `userData`:
  ```
  userData/
  └── photos/
      └── {album-id}/
          ├── {photo-uuid}.jpg          ← original copy
          └── {photo-uuid}.thumb.jpg    ← 300 px wide JPEG thumbnail
  ```
- **Cover image**: Derived at query time — `SELECT thumb_path FROM photos WHERE album_id = ? ORDER BY sort_order ASC LIMIT 1`. Not persisted as a separate column to avoid staleness when photos are deleted.
