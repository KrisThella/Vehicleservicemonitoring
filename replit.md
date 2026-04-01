# 2026 TSMPC Inventory Monitoring Dashboard

A Vehicle Service Monitoring Dashboard built with React, TypeScript, and Vite.

## Overview

This is a web-based application for monitoring vehicle inventory, service status, and delivery tracking for The Shaw Motor Plaza Corp (TSMPC). It features filtering, status tracking (Sold, In Transit, On Hold), overdue alerts, and data visualization.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite 6
- **Package Manager:** pnpm
- **Styling:** Tailwind CSS v4 + PostCSS
- **UI Components:** Radix UI primitives, Shadcn/UI-style components
- **Icons:** Lucide React
- **Charts:** Recharts
- **Animations:** Motion (Framer Motion)
- **Notifications:** Sonner

## Project Structure

```
src/
  main.tsx              # App entry point
  app/
    App.tsx             # Main app component with mock data and filter logic
    components/
      ui/               # Reusable low-level UI components (Radix/Shadcn)
      figma/            # Figma helper components
      VehicleTable.tsx  # Main vehicle data table
      StatsCards.tsx    # Statistics cards
      Filters.tsx       # Filter controls
      Header.tsx        # App header
      OverdueAlerts.tsx # Overdue vehicle alerts panel
      HistoryPanel.tsx  # Service history panel
  styles/               # Global styles (Tailwind, fonts, theme)
```

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

- Uses mock data defined in `src/app/App.tsx`
- No backend — fully client-side application
- Vite configured to allow all hosts for Replit proxy compatibility
