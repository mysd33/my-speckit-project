# Implementation Plan: Photo Album Organizer

**Branch**: `001-photo-album-organizer` | **Date**: 2026-05-31 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-photo-album-organizer/spec.md`

## Summary

Build a single-user desktop photo album organizer using Electron + Vite with vanilla HTML, CSS, and JavaScript. Photos remain on the local filesystem (no upload); album and photo metadata is stored in a local SQLite database via better-sqlite3. The app provides a main page with albums grouped by date, drag-and-drop reordering within date sections, a CSS Grid tile view for photos within each album, and a lightbox for full-screen viewing.

## Technical Context

**Language/Version**: HTML5 / CSS3 / JavaScript ES2022 (renderer); Node.js 20+ (Electron main process)

**Primary Dependencies**: Electron 30+, electron-vite 2+, better-sqlite3 9+, Vitest (unit), Playwright (E2E)

**Storage**: SQLite via better-sqlite3 in `userData/photo-albums.sqlite`; photo originals and thumbnails in `userData/photos/{album-id}/`

**Testing**: Vitest `environment: 'node'` for service-layer unit tests; Playwright for E2E; target ≥ 80 % coverage on `src/main/services/`

**Target Platform**: Desktop — Windows, macOS, Linux (via Electron 30+)

**Project Type**: Desktop application (Electron)

**Performance Goals**: Main page ≤ 2 s for 50 albums; tile grid ≤ 1 s for 100 photos; drag feedback ≤ 100 ms

**Constraints**: No network upload; all files under `userData`; ≤ 20 MB per photo; single-user; fully offline

**Scale/Scope**: Single user; ~50 albums typical; up to 500 photos per album

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Notes |
|-----------|-----------|-------|
| **I. Code Quality** | ✅ PASS | Each JS module has a single responsibility (handlers, services, renderer components are separate files). ESLint + Prettier configured. No duplication across service functions. |
| **II. Testing Standards** | ✅ PASS | Vitest unit tests for all service functions using in-memory SQLite; Playwright E2E for critical user flows. ≥ 80 % coverage target on `src/main/services/`. |
| **III. UX Consistency** | ✅ PASS | Single CSS file with custom property design tokens; consistent empty states and error messages across all views; semantic HTML; WCAG 2.1 AA colour contrast enforced via design tokens. |
| **IV. Performance** | ✅ PASS | `app://` custom protocol serves images without base64 overhead; thumbnails generated once at import via `nativeImage` and cached on disk; no N+1 DB queries (single JOIN per page load). |

**Gate result**: No violations. No Complexity Tracking required.

## Project Structure

### Documentation (this feature)

```text
specs/001-photo-album-organizer/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── ipc-api.md       ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
package.json
electron.vite.config.js
vitest.config.js
.eslintrc.cjs

src/
├── main/                        # Electron main process (Node.js)
│   ├── index.js                 # App entry: BrowserWindow, protocol registration, IPC bootstrap
│   ├── db.js                    # SQLite connection, WAL mode, schema migrations
│   ├── handlers/
│   │   ├── albums.js            # IPC handlers: albums CRUD + reorder
│   │   └── photos.js            # IPC handlers: photo import, list, delete
│   └── services/
│       ├── album-service.js     # Business logic: album CRUD, reorder, date grouping
│       └── photo-service.js     # Business logic: photo import, thumbnail generation, delete
├── preload/
│   └── index.js                 # contextBridge: exposes window.api to renderer
└── renderer/
    ├── index.html               # SPA shell — single entry point
    └── src/
        ├── main.js              # Entry: router init, global event listeners
        ├── router.js            # Hash-based SPA router (#home, #album/:id)
        ├── api.js               # Thin wrapper around window.api (preload bridge)
        ├── pages/
        │   ├── home.js          # Main page: grouped album cards + drag-and-drop
        │   └── album.js         # Album view: photo tile grid + lightbox trigger
        ├── components/
        │   ├── album-card.js    # Album card element (cover image, name, date)
        │   ├── photo-tile.js    # Photo tile element (thumbnail <img>)
        │   ├── lightbox.js      # Full-screen overlay for a single photo
        │   ├── modal.js         # Generic confirmation / form modal
        │   └── empty-state.js   # Reusable empty state banner
        └── assets/
            └── style.css        # Global CSS: custom properties design tokens + layouts

tests/
├── unit/
│   ├── album-service.test.js    # Unit tests: album CRUD, reorder, date grouping
│   └── photo-service.test.js    # Unit tests: photo import, thumbnail path, delete
└── e2e/
    ├── home.spec.js             # E2E: album list rendering, date sections, empty state
    ├── album-view.spec.js       # E2E: tile grid, lightbox open/close
    ├── drag-drop.spec.js        # E2E: drag-and-drop reorder persists across reload
    └── create-delete.spec.js    # E2E: create album, import photos, delete photo, delete album
```

**Structure Decision**: Single Electron project — no frontend/backend split. The Electron main process is the data layer (SQLite + filesystem); the renderer is the UI layer. IPC channels (documented in `contracts/ipc-api.md`) are the sole interface between them.
