
  # Vehicle Service Monitoring Dashboard

  This is a code bundle for Vehicle Service Monitoring Dashboard. The original project is available at https://www.figma.com/design/voy6GuKVET4X8oeP0OdGV6/Vehicle-Service-Monitoring-Dashboard.

  ## Running the code

  Run `pnpm install` to install the dependencies.

  Run `pnpm dev` to start the Tauri app in development mode.

  The desktop app stores its SQLite database in the local app data directory. The first launch copies the existing workspace database from `data/tsmpc.db` when available, then continues using the Tauri-managed local DB.

  If you want the web-only fallback, use `pnpm web:dev`.
  