---
description: "Task list for Photo Album Organizer feature implementation"
---

# Tasks: Photo Album Organizer

**Input**: Design documents from `specs/001-photo-album-organizer/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/ipc-api.md ✅

**Tests**: Included (Vitest unit + Playwright E2E, target ≥ 80 % coverage on `src/main/services/`)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[ID]**: Sequential task number (T001, T002...)
- **[P]**: Parallelizable (different files, no inter-task dependencies)
- **[Story]**: User story tag (US1, US2, US3, US4, US5) for story-phase tasks only
- File paths follow plan.md structure: `src/main/`, `src/renderer/src/`, `tests/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Scaffold Electron project, install dependencies, configure tooling

- [x] T001 Create Electron + Vite vanilla project using `npm create @quick-start/electron@latest`
- [x] T002 [P] Install dependencies: better-sqlite3 9+, Vitest, Playwright, ESLint, Prettier
- [x] T003 [P] Configure `electron.vite.config.js` with Vite dev server HMR and main-process hot-reload
- [x] T004 [P] Set up ESLint + Prettier in `.eslintrc.cjs` and `prettier.config.js`
- [x] T005 [P] Create `.gitignore` (node_modules, dist, userData app data, .vscode)
- [x] T006 Configure `vitest.config.js` with `environment: 'node'` for main-process tests
- [x] T007 Create npm run scripts in `package.json`: `dev`, `build`, `preview`, `lint`, `test`, `test:coverage`, `test:e2e`
- [x] T008 Create initial `src/main/index.js` skeleton (app entry, BrowserWindow factory function, IPC setup scaffolding)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure — all stories depend on these

**⚠️ CRITICAL**: No user story implementation can begin until this phase is complete

### Database & Schema

- [x] T009 Create `src/main/db.js` with SQLite connection setup using better-sqlite3
  - Open/create `userData/photo-albums.sqlite` with WAL mode
  - Set `PRAGMA foreign_keys = ON`
  - Export connection singleton
- [x] T010 Implement migration runner in `src/main/db.js`
  - Track migrations by version number in a `_schema_version` table
  - Apply pending migrations at app startup
- [x] T011 Create initial migration (v1) in `src/main/db.js`: create `albums` table with fields: `id (UUID PK)`, `name (NOT NULL)`, `date (YYYY-MM-DD)`, `sort_order (default 0)`, `created_at`, `updated_at`
- [x] T012 Create migration (v2): create `photos` table with fields: `id (UUID PK)`, `album_id (FK→albums.id, ON DELETE CASCADE)`, `filename`, `file_path`, `thumb_path`, `mime_type`, `file_size`, `sort_order (default 0)`, `created_at`
- [x] T013 Create migration (v3): add indices on `albums(date)`, `photos(album_id)`, `photos(album_id, sort_order)` for query performance

### IPC & Preload

- [x] T014 Create `src/preload/index.js` with `contextBridge.exposeInMainWorld('api', ...)` exposing all 9 IPC channels defined in `contracts/ipc-api.md`
  - Channels: `albums.list`, `albums.create`, `albums.update`, `albums.delete`, `albums.reorder`
  - Channels: `photos.list`, `photos.openDialog`, `photos.import`, `photos.delete`
- [x] T015 Configure `src/main/index.js` to use preload script and enable `contextIsolation: true`, disable `nodeIntegration`

### IPC Handlers

- [x] T016 Create `src/main/handlers/albums.js` with 5 empty handler functions (stubs)
  - `handle('albums:list', ...)`
  - `handle('albums:create', ...)`
  - `handle('albums:update', ...)`
  - `handle('albums:delete', ...)`
  - `handle('albums:reorder', ...)`
- [x] T017 Create `src/main/handlers/photos.js` with 4 empty handler functions (stubs)
  - `handle('photos:list', ...)`
  - `handle('photos:openDialog', ...)`
  - `handle('photos:import', ...)`
  - `handle('photos:delete', ...)`
- [x] T018 Register all handlers in `src/main/index.js` after `app.whenReady()`

### Services (Business Logic)

- [x] T019 Create `src/main/services/album-service.js` with stubbed functions
  - `listAlbums()` — query all albums, sorted by date DESC then sort_order ASC
  - `createAlbum(name, date)` — validate, insert, return created album
  - `updateAlbum(id, name, date)` — validate, update, return updated album
  - `deleteAlbum(id)` — delete row (cascade deletes photos)
  - `reorderAlbums(updates)` — apply sort_order updates in transaction
  - `getAlbumsByDateSection()` — return albums grouped by date for client-side rendering
- [x] T020 Create `src/main/services/photo-service.js` with stubbed functions
  - `listPhotos(albumId)` — query photos for album, sorted by sort_order ASC
  - `importPhotos(albumId, filePaths)` — validate each file, copy to userData, generate thumbnail, insert rows, return imported + rejected lists
  - `deletePhoto(photoId)` — delete row and remove files from userData
  - `validateFile(filePath)` — check mime type ∈ {jpeg, png, gif, webp}, file size ≤ 20 MB; return error if invalid
  - `generateThumbnail(srcPath, destPath)` — use Electron nativeImage to create 300px-wide JPEG

### Custom Protocol

- [x] T021 In `src/main/index.js`, register custom `app://` protocol via `protocol.registerSchemesAsPrivileged()`
  - Set privileges: `standard: true, secure: true, supportFetchAPI: true`
- [x] T022 In `src/main/index.js`, implement `protocol.handle('app', ...)` handler
  - Validate path doesn't escape userData via `path.relative` check
  - Return `net.fetch(pathToFileURL(...))` for valid paths
  - Return 403 Forbidden for traversal attempts

### Renderer Entry Point

- [x] T023 Create `src/renderer/index.html` SPA shell
  - Single `<div id="app"></div>` mount point
  - Link to `src/renderer/src/main.js`
  - Include basic meta tags (charset, viewport)
- [x] T024 Create `src/renderer/src/api.js` thin wrapper around `window.api` calls
  - Each wrapper method returns `{ data, error }` structure
  - Catches exceptions and returns `{ error: '...' }`
- [x] T025 Create `src/renderer/src/router.js` hash-based SPA router
  - Routes: `#home` (default), `#album/:id`
  - Exports `navigate(hash)` and `initializeRouter()` functions
  - Renders correct page component to `#app` on route change
- [x] T026 Create `src/renderer/src/main.js` entry point
  - Initialize router and mount initial page
  - Listen for hash changes via router
- [x] T027 Create `src/renderer/src/assets/style.css` with global styles
  - CSS custom properties (design tokens): `--color-primary`, `--color-bg`, `--color-text`, `--spacing-unit`, `--font-family`
  - Base styles: `*, body, html` resets
  - Utility classes: `.container`, `.button`, `.error-message`, `.loading-spinner`
  - Grid layout for photo tiles: `display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px;`
- [x] T028 Create `src/renderer/src/pages/home.js` page component (stub)
  - Renders album grid with sample data
  - Handles navigation and drag-drop setup
- [x] T029 Create `src/renderer/src/pages/album.js` page component (stub)
  - Renders album header with back button
  - Placeholder for photo grid implementation

**Checkpoint**: Foundation complete. All 5 user stories can now be implemented in parallel.

---

## Phase 3: User Story 1 - Browse Albums on Main Page (Priority: P1) 🎯 MVP

**Goal**: Display all albums grouped by date on the main page with album cover images, names, and counts.

**Why P1**: Entry point to all functionality; without this, no other story can be demonstrated or tested in isolation.

**Independent Test**: Seed DB with 3 albums (2 from May 2026, 1 from June 2026) and 2 photos in the May album; load app, verify albums appear under correct date headers, cover image is shown, photo count is correct, June section appears below May.

### Implementation

- [ ] T030 [US1] Implement `albumService.listAlbums()` in `src/main/services/album-service.js`
  - Query: `SELECT * FROM albums ORDER BY date DESC, sort_order ASC`
  - Include derived field: `cover_thumb_path` (first photo's thumb_path, or null)
  - Include `photo_count` (count of photos in album)
  - Unit test in `tests/unit/album-service.test.js`: covers empty albums, multiple dates, sorting
- [ ] T031 [US1] Implement `albums:list` IPC handler in `src/main/handlers/albums.js`
  - Call `albumService.listAlbums()`
  - Return `{ data: [...] }` or `{ error: string }`
  - Unit test: mock service, verify request/response shape
- [ ] T032 [US1] Create `src/renderer/src/pages/home.js` page component
  - Fetch albums via `api.albums.list()`
  - Group albums by date on client side (use `date` field)
  - Sort groups by date DESC (newest first)
  - Render date-section headers and album cards within each section
  - Show empty-state component if no albums
- [ ] T033 [US1] Create `src/renderer/src/components/album-card.js` component
  - Input: album object with `id, name, date, cover_thumb_path, photo_count`
  - Render: `<div class="album-card">` with cover image (or placeholder if null), album name, photo count, date
  - Image source: `app://${cover_thumb_path}` (using custom protocol)
  - Click: navigate to `#album/:id`
- [ ] T034 [US1] Create `src/renderer/src/components/empty-state.js` component
  - Input: message text and optional CTA button
  - Render: centered, styled banner saying "No albums yet" with "Create your first album" button
- [ ] T035 [P] [US1] Create `src/renderer/src/assets/style.css` section for home page layout
  - `.date-section { margin: 24px 0; }`
  - `.date-section-header { font-size: 18px; font-weight: 600; color: var(--color-text-secondary); margin-bottom: 12px; }`
  - `.album-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }`
  - `.album-card { cursor: pointer; border-radius: 8px; overflow: hidden; transition: transform 0.2s; }`
  - `.album-card:hover { transform: scale(1.05); }`
  - `.album-card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; }`
  - `.album-card .album-info { padding: 8px; }`

### E2E Test

- [ ] T036 [US1] Create `tests/e2e/home.spec.js` Playwright test
  - Seed DB with 3 albums before test (use Electron context)
  - Load app, verify albums appear in correct order
  - Verify date section headers are present
  - Verify cover images loaded (check for `<img>` with src starting with `app://`)
  - Verify empty state appears when albums are cleared

---

## Phase 4: User Story 2 - View Photos Inside an Album (Priority: P2)

**Goal**: Display all photos in an album as a responsive grid of tiles and allow opening a full-screen lightbox for each photo.

**Why P2**: Core use case; users primarily open albums to browse and view photos.

**Independent Test**: Create album with 5 photos; navigate to album; verify all 5 tiles appear in grid; click one tile; verify lightbox opens with full-size photo; close lightbox; verify grid is still visible.

### Implementation

- [ ] T037 [P] [US2] Implement `photoService.listPhotos(albumId)` in `src/main/services/photo-service.js`
  - Query: `SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC`
  - Unit test: verify sort order, empty album case
- [ ] T038 [P] [US2] Implement `photos:list` IPC handler in `src/main/handlers/photos.js`
  - Call `photoService.listPhotos(albumId)`
  - Return `{ data: [...] }` or `{ error: string }`
- [ ] T039 [US2] Create `src/renderer/src/pages/album.js` page component
  - Parse URL for `album_id` from hash
  - Fetch album details (name, date) via `api.albums.list()` then filter
  - Fetch photos via `api.photos.list(albumId)`
  - Render: album header (back button, name, date), photo tile grid, empty-state if no photos
  - On tile click: show lightbox with that photo
- [ ] T038 [US2] Create `src/renderer/src/components/photo-tile.js` component
  - Input: photo object with `id, thumb_path`
  - Render: `<img src="app://${thumb_path}" class="photo-tile">`
  - Click event: emit custom event or callback to parent (album.js) to show lightbox
- [ ] T039 [US2] Create `src/renderer/src/components/lightbox.js` component
  - Input: photo object with `id, file_path, filename`
  - Render: full-screen overlay with larger image via `<img src="app://${file_path}">` 
  - Close button (top-right) or Escape key to close
  - Navigation: Next/Previous buttons to cycle through album photos
- [ ] T040 [P] [US2] Add CSS for album page and photo grid in `style.css`
  - `.album-header { padding: 16px; border-bottom: 1px solid var(--color-border); }`
  - `.back-button { display: inline-block; margin-bottom: 12px; cursor: pointer; }`
  - `.photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; padding: 16px; }`
  - `.photo-tile { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; border-radius: 4px; cursor: pointer; }`
  - `.lightbox { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); display: flex; align-items: center; justify-content: center; z-index: 1000; }`
  - `.lightbox img { max-width: 90%; max-height: 90%; }`

### Unit Tests

- [ ] T041 [P] [US2] Create `tests/unit/photo-service.test.js` Vitest tests
  - Test `listPhotos(albumId)` with seeded photos, verify sort order
  - Test with empty album
  - Mock DB via in-memory SQLite

### E2E Test

- [ ] T042 [US2] Create `tests/e2e/album-view.spec.js` Playwright test
  - Seed album with 5 photos
  - Navigate to album view
  - Verify all 5 tiles render
  - Click one tile, verify lightbox appears
  - Click Next, verify image changes
  - Close lightbox, verify grid still visible

---

## Phase 5: User Story 3 - Drag-and-Drop Album Reordering (Priority: P3)

**Goal**: Allow users to reorder albums within a date section by dragging and dropping; persist the new order.

**Why P3**: Addresses the user's need to organize albums; not required for MVP but improves UX.

**Independent Test**: Create 3 albums on same date; drag album 1 to position 3; verify visual order changes; reload page; verify order is persisted in DB.

### Implementation

- [ ] T043 [US3] Implement `albumService.reorderAlbums(updates)` in `src/main/services/album-service.js`
  - Input: `[{ id: string, sort_order: number }, ...]`
  - Execute: `BEGIN TRANSACTION; UPDATE albums SET sort_order = ? WHERE id = ?; ... COMMIT;`
  - Unit test: verify all updates applied, or all rolled back on error
- [ ] T044 [US3] Implement `albums:reorder` IPC handler in `src/main/handlers/albums.js`
  - Call `albumService.reorderAlbums(updates)`
  - Return `{ data: { updated: number } }` or `{ error: string }`
- [ ] T045 [US3] Add drag-and-drop event handlers to `src/renderer/src/pages/home.js`
  - Use native HTML5 Drag & Drop API
  - On `dragstart`: set `dragged = element`, apply visual feedback (opacity 0.5)
  - On `dragover`: allow drop (preventDefault), insert element at drop target if in same date section
  - On `drop`: call `api.albums.reorder(updatedOrder)`
  - On `dragend`: restore opacity, clear dragged reference
  - Escape key: cancel drag, restore to original position
  - Constraint: prevent drag across date sections (check `data-date` attribute)
- [ ] T046 [US3] Update `src/renderer/src/components/album-card.js` to support drag
  - Add `draggable="true"` attribute
  - Add `data-id` and `data-section-date` attributes for drag logic
  - Add CSS class `.dragging` for visual feedback
- [ ] T047 [P] [US3] Add CSS for drag feedback in `style.css`
  - `.album-card.dragging { opacity: 0.5; }`
  - `.album-grid.drag-over { background-color: var(--color-drag-target); }`

### E2E Test

- [ ] T048 [US3] Create `tests/e2e/drag-drop.spec.js` Playwright test
  - Seed 3 albums on same date
  - Drag album 1 to position 3 (use Playwright drag API)
  - Verify visual reorder
  - Reload page, verify order persists in DB

---

## Phase 6: User Story 4 - Create Albums and Add Photos (Priority: P4)

**Goal**: Allow users to create new albums and import photos from their device.

**Why P4**: Required to populate the app; higher-priority stories can use seeded test data.

**Independent Test**: Click "New Album", enter name "Vacation", select date "2026-06-01", confirm; verify album appears on home page in correct date section. Then import 2 photos; verify tiles appear in album.

### Implementation

- [ ] T049 [P] [US4] Implement `albumService.createAlbum(name, date)` in `src/main/services/album-service.js`
  - Validate: name non-empty after trim, date matches YYYY-MM-DD
  - Generate UUID via `crypto.randomUUID()`
  - Insert: `INSERT INTO albums (id, name, date, sort_order, created_at, updated_at) VALUES (...)`
  - Ensure `userData/photos/{album-id}/` directory is created
  - Return created album object
  - Unit test: test validation, test duplicate handling
- [ ] T050 [P] [US4] Implement `albums:create` IPC handler in `src/main/handlers/albums.js`
  - Validate input, call service, return response
  - Test: mock service, verify validation
- [ ] T051 [P] [US4] Implement `photoService.validateFile(filePath)` in `src/main/services/photo-service.js`
  - Check file exists and is readable
  - Get MIME type (use file extension or Node fs.promises.stat)
  - Validate MIME ∈ {image/jpeg, image/png, image/gif, image/webp}
  - Get file size, validate ≤ 20 MB
  - Return `{ valid: true }` or `{ valid: false, reason: string }`
  - Unit test: test each validation rule
- [ ] T052 [P] [US4] Implement `photoService.generateThumbnail(srcPath, destPath, maxWidth = 300)` in `src/main/services/photo-service.js`
  - Use Electron `nativeImage.createFromPath(srcPath)`
  - Resize to 300px wide, maintain aspect ratio, quality: 'better'
  - Save to `destPath` via `fs.writeFileSync(destPath, nativeImage.toJPEG(85))`
  - Error handling if image can't be loaded
  - Unit test: test with real image file (fixture)
- [ ] T053 [P] [US4] Implement `photoService.importPhotos(albumId, filePaths)` in `src/main/services/photo-service.js`
  - For each file: validate, copy to `userData/photos/{albumId}/{uuid}.ext`, generate thumbnail, insert DB row
  - Handle file name collisions: append `-1`, `-2` suffix if needed
  - Collect imported and rejected lists
  - Return `{ imported: [...], rejected: [...] }`
  - Unit test: test successful import, test validation failures, test file ops
- [ ] T054 [P] [US4] Implement `photos:openDialog` IPC handler in `src/main/handlers/photos.js`
  - Use `dialog.showOpenDialog()` with filters for image formats
  - Multi-select enabled
  - Return `{ data: { file_paths: [...] } }`
  - Test: mock dialog, verify return shape
- [ ] T055 [US4] Implement `photos:import` IPC handler in `src/main/handlers/photos.js`
  - Call `photoService.importPhotos(albumId, filePaths)`
  - Return `{ data: { imported: [...], rejected: [...] } }` or `{ error: string }`
  - Test: mock service, verify response shape
- [ ] T056 [US4] Create `src/renderer/src/components/modal.js` generic modal component
  - Input: `title, message, fields: [{ name, label, type, required }], onConfirm, onCancel`
  - Render: centered dialog with title, form fields, confirm/cancel buttons
  - Form validation: check required fields before submit
  - CSS: `.modal-overlay`, `.modal-dialog`, `.modal-field`, `.modal-button`
- [ ] T057 [US4] Create "New Album" button in `src/renderer/src/pages/home.js`
  - Click opens modal with fields: name (text), date (date input, default today)
  - On confirm: call `api.albums.create(name, date)`
  - On error: show error message in modal
  - Refresh albums list after creation
- [ ] T058 [US4] Create "Add Photos" button in `src/renderer/src/pages/album.js`
  - Click: call `api.photos.openDialog()` to select files
  - On select: call `api.photos.import(albumId, filePaths)`
  - Show import result: count of imported files, list any errors
  - Refresh photos list after import
- [ ] T059 [P] [US4] Add CSS for modal and form components in `style.css`
  - `.modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 900; }`
  - `.modal-dialog { background: white; padding: 24px; border-radius: 8px; min-width: 400px; }`
  - `.modal-field { margin: 12px 0; }`
  - `.modal-field label { display: block; margin-bottom: 4px; font-weight: 500; }`
  - `.modal-field input { width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: 4px; }`
  - `.modal-button { padding: 8px 16px; margin: 0 4px; border-radius: 4px; cursor: pointer; }`

### Unit Tests

- [ ] T060 [P] [US4] Add tests to `tests/unit/album-service.test.js`
  - Test `createAlbum()` with valid/invalid inputs
- [ ] T061 [P] [US4] Expand `tests/unit/photo-service.test.js`
  - Test `validateFile()` for each validation rule
  - Test `generateThumbnail()` with fixture image
  - Test `importPhotos()` with mocked file system

### E2E Test

- [ ] T062 [US4] Create `tests/e2e/create-delete.spec.js` Playwright test (part 1: create)
  - Click "New Album"
  - Fill form with name="Test Album", date="2026-05-31"
  - Confirm
  - Verify album appears on home page
  - Click into album
  - Click "Add Photos"
  - Select 2 image files
  - Verify tiles appear

---

## Phase 7: User Story 5 - Delete Albums and Remove Photos (Priority: P5)

**Goal**: Allow users to delete albums (with all photos) and remove individual photos.

**Why P5**: Lifecycle management; not required for MVP but necessary for production.

**Independent Test**: Delete 1 photo from album; verify tile count decreases. Delete entire album; verify album is gone from home page and DB.

### Implementation

- [ ] T063 [P] [US5] Implement `albumService.deleteAlbum(id)` in `src/main/services/album-service.js`
  - Query photos in album to get file paths (before delete, since cascade will remove them)
  - Delete: `DELETE FROM albums WHERE id = ?` (cascade deletes photos)
  - Remove files: iterate photos, delete originals and thumbnails from userData
  - Remove directory: `fs.rmSync(userData/photos/{id}, { recursive: true })`
  - Error handling: log and continue if file deletion fails
  - Unit test: verify DB row deleted, verify files cleaned up
- [ ] T064 [P] [US5] Implement `albums:delete` IPC handler in `src/main/handlers/albums.js`
  - Call `albumService.deleteAlbum(id)`
  - Return `{ data: { deleted: true } }` or `{ error: string }`
- [ ] T065 [P] [US5] Implement `photoService.deletePhoto(id)` in `src/main/services/photo-service.js`
  - Query photo to get `file_path` and `thumb_path`
  - Delete: `DELETE FROM photos WHERE id = ?`
  - Remove files: delete original and thumbnail from userData
  - Error handling: log and continue if file deletion fails
  - Unit test: verify DB row deleted, verify files cleaned up
- [ ] T066 [P] [US5] Implement `photos:delete` IPC handler in `src/main/handlers/photos.js`
  - Call `photoService.deletePhoto(id)`
  - Return `{ data: { deleted: true } }` or `{ error: string }`
- [ ] T067 [US5] Add "Delete Album" button to `src/renderer/src/pages/home.js` album-card
  - Right-click context menu or icon button on album-card
  - Click: show confirmation modal: "Delete album 'Name' and all N photos?"
  - Confirm: call `api.albums.delete(albumId)`
  - On success: refresh albums list and navigate to home if currently viewing that album
- [ ] T068 [US5] Add "Remove Photo" button to `src/renderer/src/pages/album.js` on each tile
  - Hover/right-click: show remove option or icon button
  - Click: show confirmation modal: "Remove this photo?"
  - Confirm: call `api.photos.delete(photoId)`
  - On success: remove tile from grid and update photo count
- [ ] T069 [P] [US5] Add CSS for confirmation dialog and delete buttons in `style.css`
  - `.confirm-modal-message { color: var(--color-text-secondary); margin-bottom: 16px; }`
  - `.delete-button { background-color: var(--color-danger); color: white; }`
  - `.delete-button:hover { background-color: var(--color-danger-dark); }`

### Unit Tests

- [ ] T070 [P] [US5] Add tests to `tests/unit/album-service.test.js`
  - Test `deleteAlbum()` with seeded album + photos
  - Verify cascade delete, verify files cleaned up
- [ ] T071 [P] [US5] Add tests to `tests/unit/photo-service.test.js`
  - Test `deletePhoto()` with seeded photo
  - Verify DB row deleted, verify files cleaned up

### E2E Test

- [ ] T072 [US5] Complete `tests/e2e/create-delete.spec.js` (part 2: delete)
  - From album view, remove 1 photo
  - Verify tile count decreases
  - Navigate to home
  - Delete entire album
  - Verify album is gone from home page

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Performance optimization, error handling, accessibility, documentation

- [ ] T073 [P] Configure Vite production build: minify, code splitting, asset optimization in `electron.vite.config.js`
- [ ] T074 [P] Add error boundaries and try/catch in renderer components; show user-friendly error messages for all IPC failures
- [ ] T075 [P] Implement loading spinners in `src/renderer/src/components/` for async operations (fetching albums, importing photos, etc.)
- [ ] T076 [P] Test rendering performance with 500+ photos per album; implement lazy-loading if needed
- [ ] T077 [P] Verify WCAG 2.1 AA compliance: colour contrast (use WebAIM checker), keyboard navigation (Tab, Enter, Escape), semantic HTML
- [ ] T078 [P] Create `CONTRIBUTING.md` with development workflow, code style guidelines, test requirements
- [ ] T079 Add Lighthouse CI check to test workflow (if using GitHub Actions) for Lighthouse score ≥ 85 on mobile
- [ ] T080 Package app for distribution: configure electron-builder in `package.json`, create installer for Windows/macOS/Linux
- [ ] T081 Create `CHANGELOG.md` with initial v1.0.0 release notes
- [ ] T082 Document troubleshooting in `specs/001-photo-album-organizer/quickstart.md`: common errors and fixes

---

## Dependencies Graph

### Critical Path (Blocking Order)

```
T001–T008 (Setup)
         ↓
T009–T027 (Foundational)
         ↓
T028–T034 (User Story 1: US1)
    ↓ ↓ ↓ ↓
    T035–T042 (US2), T043–T048 (US3), T049–T062 (US4), T063–T072 (US5)
         ↓
T073–T082 (Polish)
```

### Parallelizable Groups

- **Phase 1 Setup**: T002–T007 can run in parallel
- **Phase 2 Foundational**: T019–T027 can run mostly in parallel (T023–T027 depend on T024–T026)
- **Phase 3 US1**: T028–T032 can run after T027
- **Phase 4 US2**: T035–T047 can run in parallel once US1 is complete
- **Phase 5 US3**: T043–T047 can run in parallel once US1 is complete
- **Phase 6 US4**: T049–T062 can run in parallel (no dependencies on other stories)
- **Phase 7 US5**: T063–T072 can run in parallel (no dependencies on other stories)
- **Phase 8 Polish**: T073–T082 can run in parallel once core stories are complete

### Independent Test Criteria (Per User Story)

**US1**: Album list page loads; albums grouped by date; cover images visible; empty state displays when no albums.

**US2**: Album view loads; all tiles render; lightbox opens and closes; no layout jank with 100+ photos.

**US3**: Drag-and-drop reorder works within date section; order persists across reload; cross-section drag is blocked.

**US4**: Album creation dialog works; album appears in correct date section; photo import succeeds; tiles appear.

**US5**: Album delete removes album and all files; photo delete removes tile and file; confirmation modals work.

---

## MVP Scope (First Increment)

✅ **Complete all tasks through Phase 3 (US1) to have a working MVP.**

This gives users:
- Ability to view pre-seeded albums on the main page
- Albums grouped by date with cover images and counts
- Empty state message
- Foundation for all future stories

**Next increment**: Phase 4 (US2) — add photo viewing and lightbox.

