# 2026 TSMPC Inventory Monitoring Dashboard

A Vehicle Service Monitoring Dashboard built with React, TypeScript, and Vite.

## Overview

This is a web-based application for monitoring vehicle inventory, service status, and delivery tracking for The Shaw Motor Plaza Corp (TSMPC). It features filtering, status tracking (Sold, In Transit, On Hold), overdue alerts, and data visualization.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Backend:** Express 5 + better-sqlite3 (file-backed SQLite at `data/tsmpc.db`)
- **Package Manager:** pnpm (with `onlyBuiltDependencies` allow-list for native modules)
- **Styling:** Tailwind CSS v4 + PostCSS (dark mode via `.dark` class on `<html>`)
- **UI Components:** Radix UI primitives, Shadcn/UI-style components
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Notifications:** Sonner

## Project Structure

```
server/
  db.ts                 # SQLite connection + schema (vehicles, prices, profile, settings)
  seed.ts               # First-run seed data (7 vehicles, 19 prices, 1 profile)
  index.ts              # Express REST API on 127.0.0.1:3001
src/
  main.tsx              # Entry — bootstraps theme from localStorage
  lib/
    api.ts              # Fetch hooks: useVehicles, usePrices, useProfile
  app/
    App.tsx, routes.tsx # Routing & layout
    pages/              # DashboardPage, AvailablePage, SalesPage, CombinedSalesPage,
                        # InTransitPage, PullOutMonitoringPage, SettingsPage,
                        # PriceListPage, UserProfilePage
    components/         # Header, VehicleTable, Filters, modals, etc.
  styles/               # Global styles (Tailwind, fonts, theme)
data/
  tsmpc.db              # Local SQLite database (created on first run; gitignored)
```

## Backend & Data Layer

- Vite proxies `/api/*` → `http://127.0.0.1:3001`. The `dev` script runs both
  the Vite dev server and `tsx watch server/index.ts` via `concurrently`.
- All data (vehicles, prices, profile, settings) is persisted in SQLite. On
  first boot, `seed.ts` populates initial demo records if tables are empty.
- The frontend talks to the backend exclusively through the typed hooks in
  `src/lib/api.ts` (no more hardcoded `mockVehicles`).
- Profile photo is stored as a base64 data URL in the `profile.image_data_url`
  column.
- Dark mode toggle in Settings sets `localStorage.theme` and the `.dark` class
  on `<html>`; bootstrap happens before React mounts in `src/main.tsx`.

## Development

```bash
pnpm install
pnpm run dev      # Start dev server on port 5000
pnpm run build    # Production build to dist/
```

## Deployment

- **Type:** Static site
- **Build command:** `pnpm run build`
- **Output directory:** `dist/`
- **Dev port:** 5000

## Notes

- Vite configured to allow all hosts for Replit proxy compatibility
- `pnpm` requires `enable-pre-post-scripts=true` (`.npmrc`) and an
  `onlyBuiltDependencies` allow-list in `package.json` for the native
  `better-sqlite3` build to succeed.
- The local SQLite file lives at `data/tsmpc.db` and is created automatically.
  Delete it to re-seed from scratch.
