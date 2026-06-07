# Quickstart: Photo Album Organizer

**Date**: 2026-05-31
**Plan**: [plan.md](plan.md)

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ |
| npm | 10+ |
| Git | any recent version |
| OS | Windows 10+, macOS 12+, or Ubuntu 22+ |

---

## First-Time Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd my-project

# 2. Install dependencies
npm install

# 3. Rebuild native modules for the installed Electron version
npx @electron/rebuild

# 4. Start in development mode (Vite dev server + Electron)
npm run dev
```

> **What happens on first launch**: Electron creates the SQLite database at
> `<userData>/photo-albums.sqlite` and the `<userData>/photos/` directory automatically.
> No manual setup is needed.

---

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron + Vite HMR dev server |
| `npm run build` | Build renderer and package main process for production |
| `npm run preview` | Preview the production build (launches packaged Electron app) |
| `npm run lint` | Run ESLint across `src/` and `tests/` |
| `npm run test` | Run all Vitest unit tests |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run test:coverage` | Run Vitest with coverage report (target ≥ 80 %) |
| `npm run test:e2e` | Run Playwright E2E tests against a built app |

---

## Project Layout (quick reference)

```
src/
├── main/            Electron main process — SQLite, IPC handlers, file ops
├── preload/         Context bridge — exposes window.api to renderer
└── renderer/        Vanilla HTML/CSS/JS UI — pages, components, router
tests/
├── unit/            Vitest tests for main-process services
└── e2e/             Playwright tests for full user flows
specs/               Feature documentation (this folder)
```

---

## Where Data Is Stored

All app data lives in Electron's `userData` directory (never inside the project folder):

| OS | Path |
|----|------|
| Windows | `%APPDATA%\photo-album-organizer\` |
| macOS | `~/Library/Application Support/photo-album-organizer/` |
| Linux | `~/.config/photo-album-organizer/` |

Contents:
```
userData/
├── photo-albums.sqlite        ← album + photo metadata
└── photos/
    └── {album-id}/
        ├── {photo-uuid}.jpg   ← original copy of imported photo
        └── {photo-uuid}.thumb.jpg  ← 300 px-wide JPEG thumbnail
```

> **Backing up your library**: Copy the entire `userData` directory. Restoring is the reverse.

---

## Running Tests

```bash
# Unit tests (fast, no Electron required)
npm run test

# Coverage report — opens HTML report in browser
npm run test:coverage

# E2E tests (requires a production build first)
npm run build
npm run test:e2e
```

Unit tests use an in-memory SQLite database (`:memory:`); no `userData` files are touched.

---

## Native Module Rebuild

If you upgrade the Electron version in `package.json`, run:

```bash
npx @electron/rebuild
```

This recompiles `better-sqlite3` against the new Electron ABI. You will see an error like
`"The module was compiled against a different Node.js version"` if this step is skipped.

---

## Common Issues

| Symptom | Fix |
|---------|-----|
| `The module was compiled against a different Node.js version` | Run `npx @electron/rebuild` |
| Blank renderer window in dev mode | Wait for Vite dev server to be ready (watch the terminal for `Local: http://...`) |
| `app://` images not loading | Ensure `protocol.registerSchemesAsPrivileged` is called **before** `app.whenReady()` |
| SQLite `SQLITE_CANTOPEN` error | Check that `userData` directory is writable; verify no other process has the DB locked |
