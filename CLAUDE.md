# Training Tracker Desktop

## Overview
Electron + React + Vite desktop app for training compliance tracking.
Local SQLite database, single-user, no auth.

## Tech Stack
- Electron (main + renderer + preload)
- React 18 + TypeScript (renderer)
- Vite (bundler)
- better-sqlite3 (embedded DB)
- Tailwind CSS + shadcn/ui (styling)
- react-router-dom HashRouter

## Architecture
- `electron/` - Main process: DB, repositories, services, IPC handlers
- `src/` - Renderer: React pages, components, hooks
- IPC pattern: renderer calls `window.electronAPI.*` → preload → ipcMain → repository/service

## Development
```bash
npm run dev     # Vite + Electron concurrently
npm run build   # Build renderer + electron
npm run dist    # Package for distribution
```

## Commit Status Tag
Every page includes an inline tag displaying the latest git commit message.
- Injected at build time via `VITE_COMMIT_MSG` env variable in `vite.config.ts`
- Rendered by `src/components/layout/CommitTag.tsx` as a fixed badge in bottom-right
- Shows short commit hash and message (e.g., `a1b2c3d: Fix header layout`)
