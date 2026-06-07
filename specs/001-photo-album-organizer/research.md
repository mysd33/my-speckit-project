# Research: Photo Album Organizer

**Phase**: 0 — Unknowns resolution
**Date**: 2026-05-31
**Plan**: [plan.md](plan.md)

All NEEDS CLARIFICATION items from Technical Context are resolved below.

---

## 1. electron-vite with Vanilla JS

**Decision**: Use `npm create @quick-start/electron@latest` with the `vanilla` template.

**Rationale**: electron-vite ships a first-class vanilla scaffold — no framework overhead, built-in HMR for the renderer, hot-reload for the main process. Manual Webpack config and electron-forge are heavier alternatives.

**Alternatives considered**:
- electron-forge — more opinionated, heavier dependency tree
- Manual Webpack config — verbose, lacks Electron-specific optimisations

**Project layout produced by scaffold**:
```
src/
  main/index.js          # Electron main process entry
  preload/index.js       # Context bridge
  renderer/              # Vanilla HTML/CSS/JS
    index.html
    src/main.js
electron.vite.config.js
package.json
```

---

## 2. better-sqlite3 in Electron

**Decision**: Use `better-sqlite3` externalized from Vite bundling via `rollupOptions.external`.

**Rationale**: Synchronous API is simpler than callback-based alternatives; prebuilt binaries for all LTS Electron versions mean no compile step in CI. 10× faster than `node-sqlite3` for read-heavy workloads.

**Rebuild step**: Run `npm install` then `npx electron-rebuild` (or `@electron/rebuild`) on first setup and after Electron version bumps.

**Alternatives considered**:
- sql.js — WASM, in-memory only, no native filesystem persistence
- node-sqlite3 — async-only, heavier, less maintained

**Key config**:
```js
// electron.vite.config.js — main process build
main: {
  build: {
    rollupOptions: { external: ['better-sqlite3'] }
  }
}
```

---

## 3. Custom Protocol for Serving Local Images

**Decision**: `protocol.handle('app', ...)` (Electron 28+) backed by `net.fetch(pathToFileURL(...))`.

**Rationale**: Modern replacement for the deprecated `registerFileProtocol`. Returns Fetch API `Response` objects. Path traversal guard (`path.relative` check) prevents serving files outside `userData`.

**Alternatives considered**:
- Deprecated `registerFileProtocol` — still works but flagged as legacy in Electron 28+
- localhost HTTP server — requires port allocation, more attack surface

**Key pattern**:
```js
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { standard: true, secure: true, supportFetchAPI: true } }
]);

app.whenReady().then(() => {
  protocol.handle('app', async (req) => {
    const { pathname } = new URL(req.url);
    const filePath = path.resolve(app.getPath('userData'), '.' + pathname);
    const rel = path.relative(app.getPath('userData'), filePath);
    if (rel.startsWith('..')) return new Response('Forbidden', { status: 403 });
    return net.fetch(pathToFileURL(filePath).toString());
  });
});
```

Renderer usage: `<img src="app://photos/album-id/photo-uuid.jpg">`

---

## 4. Thumbnail Generation — nativeImage

**Decision**: Use Electron's built-in `nativeImage.createFromPath(src).resize({width: 300, quality: 'better'}).toJPEG(85)` and write via `fs.writeFileSync`.

**Rationale**: No external dependency; Electron bundles Skia/CoreImage for cross-platform encoding. Output quality is sufficient for 300 px thumbnails.

**Alternatives considered**:
- `sharp` — excellent quality but is a heavy native module requiring separate rebuild
- `jimp` — pure JS, much slower for batch imports, memory-hungry

**Key pattern**:
```js
import { nativeImage } from 'electron';
import fs from 'node:fs';

function generateThumbnail(srcPath, destPath, width = 300) {
  const img = nativeImage.createFromPath(srcPath);
  if (img.isEmpty()) throw new Error(`Cannot decode: ${srcPath}`);
  const { width: w, height: h } = img.getSize();
  const thumb = img.resize({ width, height: Math.round(width * h / w), quality: 'better' });
  fs.writeFileSync(destPath, thumb.toJPEG(85));
}
```

---

## 5. HTML5 Drag and Drop API — Album Reordering

**Decision**: Native `dragstart / dragover / drop / dragend` events with `insertBefore` for in-section reordering. Escape key and invalid drop zones cancel and restore.

**Rationale**: Zero external dependencies; fits the vanilla-JS constraint. Sortable.js (3 KB) was considered but is unnecessary for a flat list of ~20 items per date section.

**Alternatives considered**:
- Sortable.js — minimal library but violates the "minimal libraries" constraint
- Pointer Events API — more complex, cross-browser compat advantage is negligible for desktop-only

**Key pattern**:
```js
let dragged = null;
container.addEventListener('dragstart', e => {
  dragged = e.currentTarget; dragged.classList.add('dragging');
});
container.addEventListener('dragover', e => {
  e.preventDefault();
  const target = e.target.closest('[draggable]');
  if (target && target !== dragged && target.dataset.section === dragged.dataset.section)
    target.parentNode.insertBefore(dragged, target);
});
container.addEventListener('dragend', () => dragged.classList.remove('dragging'));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && dragged) { /* restore original position */ }
});
```

---

## 6. CSS Grid for Responsive Photo Tiles

**Decision**: `grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))` + `aspect-ratio: 1 / 1` + `object-fit: cover` on `<img>`.

**Rationale**: Zero JavaScript; aspect ratio enforced in CSS; responsive at all viewport widths without media queries. `auto-fill` creates as many columns as fit; `minmax` prevents tiles becoming too narrow.

**Key CSS**:
```css
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  padding: 16px;
}
.photo-tile {
  aspect-ratio: 1 / 1;
  width: 100%;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
}
```

**Alternatives considered**: Flexbox (harder square aspect ratio), fixed-column grid (not adaptive).

---

## 7. Testing — Vitest with Node Environment

**Decision**: Vitest `environment: 'node'` for main-process unit tests; in-memory SQLite (`:memory:`) for service tests; Playwright for E2E.

**Rationale**: Main process code is pure Node.js; `jsdom` / `happy-dom` are irrelevant and add overhead. `better-sqlite3` works in Vitest node environment without extra config. Playwright is the E2E framework recommended by the electron-vite documentation.

**Vitest config**:
```js
// vitest.config.js
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { environment: 'node', globals: true }
});
```

**Alternatives considered**: Jest — similar capability but Vitest is Vite-native and faster.

---

## Resolved NEEDS CLARIFICATION Summary

| Unknown | Resolution |
|---------|------------|
| Build tooling for vanilla JS Electron | electron-vite vanilla template |
| SQLite integration approach | better-sqlite3, externalized, `@electron/rebuild` |
| Image serving to renderer | `protocol.handle('app', ...)` with path-traversal guard |
| Thumbnail generation (no sharp) | Electron `nativeImage` + `toJPEG()` |
| Drag-and-drop library | Native HTML5 D&D API, no library |
| CSS tile grid approach | CSS Grid `auto-fill` + `aspect-ratio` |
| Test runner for Node.js services | Vitest `environment: 'node'` + in-memory SQLite |
