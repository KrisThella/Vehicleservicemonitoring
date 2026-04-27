import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, TrendingUp, Package, Menu, X, FileBarChart, ArrowDownToLine, Truck, CalendarClock } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";

export function RootLayout() {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/", label: "DASHBOARD", icon: LayoutDashboard },
    { path: "/sales", label: "SALES", icon: TrendingUp },
    { path: "/available", label: "AVAILABLE", icon: Package },
    { path: "/in-transit", label: "IN TRANSIT", icon: Truck },
    { path: "/pull-out-monitoring", label: "PULL OUT MONITORING", icon: ArrowDownToLine },
    { path: "/next-cut-off", label: "NEXT CUT-OFF", icon: CalendarClock },
    { path: "/combined-sales", label: "COMBINED SALES", icon: FileBarChart },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {/* Left Sidebar */}
      <aside className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ${
        isSidebarOpen ? "w-64" : "w-20"
      }`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          {isSidebarOpen && <h1 className="font-bold text-lg text-blue-600 dark:text-blue-400">TSMPC</h1>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className="size-5 flex-shrink-0" />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        {isSidebarOpen && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Shaw Motor Plaza Corp
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}