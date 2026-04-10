import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { SalesPage } from "./pages/SalesPage";
import { AvailablePage } from "./pages/AvailablePage";
import { SettingsPage } from "./pages/SettingsPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { PriceListPage } from "./pages/PriceListPage";
import { CombinedSalesPage } from "./pages/CombinedSalesPage";
import { PullOutMonitoringPage } from "./pages/PullOutMonitoringPage";
import { InTransitPage } from "./pages/InTransitPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "sales", Component: SalesPage },
      { path: "available", Component: AvailablePage },
      { path: "in-transit", Component: InTransitPage },
      { path: "pull-out-monitoring", Component: PullOutMonitoringPage },
      { path: "combined-sales", Component: CombinedSalesPage },
      { path: "settings", Component: SettingsPage },
      { path: "settings/profile", Component: UserProfilePage },
      { path: "settings/price-list", Component: PriceListPage },
    ],
  },
]);