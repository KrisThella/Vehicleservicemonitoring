import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../components/ui/tooltip";
import {
  Truck,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingUp,
  Search,
  RefreshCw,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  AddInTransitModal,
  InTransitEntry,
} from "../components/AddInTransitModal";
import { toast } from "sonner";
import { exportToExcel, todayStamp } from "../../lib/exportExcel";
import { useVehicles } from "../../lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

type TransitStatus =
  | "IN TRANSIT"
  | "ARRIVED – FOR INSPECTION"
  | "PENDING RELEASE"
  | "RELEASED"
  | "DELAYED";

interface InTransitUnit {
  id: string;
  model: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  remarks: string;
  pullOutLocation: string;
  csNo: string;
  yearModel: number;
  clientName: string;
  dealer: string;
  generalManager?: string;
  salesConsultant?: string;
  poNumber: string;
  poAmount: number;
  pullOutDate: string;
  pullOutDateRaw: Date;
  colorCode: string;
  declaredMonth: string;
  currentLocation: string;
  dpReservation: string;
  status: TransitStatus;
  targetReleaseDate: string;
  targetReleaseDateRaw: Date;
  remarks2: string;
}

interface AllocationRow {
  model: string;
  allocation: number;
  inTransit: number;
  totalReceived: number;
  open: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

// In-transit units are now loaded from the database via useVehicles().

const today = new Date();

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransitStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  "IN TRANSIT": {
    label: "IN TRANSIT",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  "ARRIVED – FOR INSPECTION": {
    label: "ARRIVED – FOR INSPECTION",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-700 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
  "PENDING RELEASE": {
    label: "PENDING RELEASE",
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-700 dark:text-orange-300",
    dot: "bg-orange-500",
  },
  RELEASED: {
    label: "RELEASED",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
    dot: "bg-green-500",
  },
  DELAYED: {
    label: "DELAYED",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-700 dark:text-red-300",
    dot: "bg-red-500",
  },
};

const isOverdue = (unit: InTransitUnit) =>
  unit.status !== "RELEASED" && unit.targetReleaseDateRaw < today;

const formatCurrency = (n: number) =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`${accent} p-3 rounded-xl flex-shrink-0`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransitStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span
        className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`}
      />
      {cfg.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function InTransitPage() {
  const navigate = useNavigate();
  const { vehicles, addVehicle, removeVehicle } = useVehicles();
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [filterModel, setFilterModel] = useState("all");
  const [filterDealer, setFilterDealer] = useState("all");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const toIsoDate = (d: Date) => d.toISOString().slice(0, 10);
  const formatShort = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

  const parseStatus = (value: string | undefined): TransitStatus => {
    const status = (value ?? '').toUpperCase();
    if (status === 'IN TRANSIT') return 'IN TRANSIT';
    if (status === 'ARRIVED – FOR INSPECTION') return 'ARRIVED – FOR INSPECTION';
    if (status === 'PENDING RELEASE') return 'PENDING RELEASE';
    if (status === 'RELEASED') return 'RELEASED';
    if (status === 'DELAYED') return 'DELAYED';
    return 'IN TRANSIT';
  };

  const allUnits = useMemo(() => {
    return vehicles
      .filter((vehicle: any) => String(vehicle.status ?? '').toUpperCase() !== 'ON TRACK')
      .map((vehicle: any): InTransitUnit => {
        const pullOutDateRaw =
          vehicle.pullOut instanceof Date
            ? vehicle.pullOut
            : vehicle.pullOut
            ? new Date(vehicle.pullOut)
            : new Date();
        const targetReleaseDateRaw =
          vehicle.targetRelease instanceof Date
            ? vehicle.targetRelease
            : vehicle.targetRelease
            ? new Date(vehicle.targetRelease)
            : pullOutDateRaw;

        return {
          id: vehicle.id,
          model: vehicle.model ?? '',
          color: vehicle.color ?? '',
          chassisNo: vehicle.chassisNo ?? '',
          engineNo: vehicle.engineNo ?? '',
          remarks: vehicle.remarks ?? '',
          pullOutLocation: vehicle.pullOutLocation ?? vehicle.pullOut ?? '',
          csNo: vehicle.csNo ?? '',
          yearModel:
            Number(vehicle.yearModel ?? vehicle.year) || new Date().getFullYear(),
          clientName: vehicle.clientName ?? '',
          dealer: vehicle.dealer ?? '',
          generalManager: vehicle.generalManager ?? '',
          salesConsultant: vehicle.salesConsultant ?? '',
          poNumber: vehicle.poNumber ?? '',
          poAmount: Number(vehicle.poAmount ?? 0),
          pullOutDate: formatShort(pullOutDateRaw),
          pullOutDateRaw,
          colorCode: vehicle.colorCode ?? '',
          declaredMonth: vehicle.declaredMonth ?? '',
          currentLocation: vehicle.location ?? vehicle.currentLocation ?? '',
          dpReservation: vehicle.dpReservation ?? '',
          status: parseStatus(vehicle.status),
          targetReleaseDate: formatShort(targetReleaseDateRaw),
          targetReleaseDateRaw,
          remarks2: vehicle.remarks2 ?? vehicle.remarks ?? '',
        };
      });
  }, [vehicles]);

  // Unique filter options
  const uniqueModels = Array.from(
    new Set(allUnits.map((u) => u.model)),
  ).sort();
  const uniqueDealers = Array.from(
    new Set(allUnits.map((u) => u.dealer)),
  ).sort();
  const uniqueLocations = Array.from(
    new Set(allUnits.map((u) => u.currentLocation)),
  ).sort();
  const uniqueStatuses = Array.from(
    new Set(allUnits.map((u) => u.status)),
  ).sort();

  // Filtered units
  const filtered = useMemo(() => {
    return allUnits.filter((u) => {
      if (filterModel !== "all" && u.model !== filterModel) return false;
      if (filterDealer !== "all" && u.dealer !== filterDealer) return false;
      if (filterLocation !== "all" && u.currentLocation !== filterLocation)
        return false;
      if (filterStatus !== "all" && u.status !== filterStatus) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !u.model.toLowerCase().includes(s) &&
          !u.chassisNo.toLowerCase().includes(s) &&
          !u.clientName.toLowerCase().includes(s) &&
          !u.csNo.toLowerCase().includes(s) &&
          !u.poNumber.toLowerCase().includes(s) &&
          !u.engineNo.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [allUnits, search, filterModel, filterDealer, filterLocation, filterStatus]);

  const resetFilters = () => {
    setSearch("");
    setFilterModel("all");
    setFilterDealer("all");
    setFilterLocation("all");
    setFilterStatus("all");
  };

  const handleExport = () => {
    const rows = filtered.map((u) => ({
      Model: u.model,
      Color: u.color,
      "Color Code": u.colorCode,
      "Chassis No.": u.chassisNo,
      "Engine No.": u.engineNo,
      "Year Model": u.yearModel,
      "Client Name": u.clientName,
      Dealer: u.dealer,
      "PO Number": u.poNumber,
      "PO Amount": u.poAmount,
      "CS No.": u.csNo,
      "Pull-Out Location": u.pullOutLocation,
      "Pull-Out Date": u.pullOutDate,
      "Declared Month": u.declaredMonth,
      "Current Location": u.currentLocation,
      Status: u.status,
      Remarks: u.remarks,
    }));
    exportToExcel(rows, `in-transit-${todayStamp()}`, "In Transit");
    toast.success(`Exported ${rows.length} unit(s) to Excel`);
  };

  // Summary counts
  const totalUnits = allUnits.length;
  const inTransitCount = allUnits.filter(
    (u) => u.status === "IN TRANSIT",
  ).length;
  const delayedCount = allUnits.filter((u) => isOverdue(u)).length;
  const releasedCount = allUnits.filter(
    (u) => u.status === "RELEASED",
  ).length;

  const allocationData = useMemo<AllocationRow[]>(() => {
    const map = new Map<string, AllocationRow>();
    for (const unit of allUnits) {
      const model = unit.model || "Unknown";
      const existing = map.get(model) ?? {
        model,
        allocation: 0,
        inTransit: 0,
        totalReceived: 0,
        open: 0,
      };
      existing.allocation += 1;
      if (unit.status === "RELEASED") {
        existing.totalReceived += 1;
      } else {
        existing.inTransit += 1;
      }
      map.set(model, existing);
    }
    for (const row of map.values()) {
      row.open = row.allocation - row.totalReceived;
    }
    return Array.from(map.values());
  }, [allUnits]);

  // Allocation totals
  const allotTotal = allocationData.reduce((s, r) => s + r.allocation, 0);
  const allotInTransit = allocationData.reduce((s, r) => s + r.inTransit, 0);
  const allotReceived = allocationData.reduce((s, r) => s + r.totalReceived, 0);
  const allotOpen = allocationData.reduce((s, r) => s + r.open, 0);

  // Active filter count badge
  const activeFilterCount = [
    filterModel !== "all",
    filterDealer !== "all",
    filterLocation !== "all",
    filterStatus !== "all",
    search !== "",
  ].filter(Boolean).length;

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6 dark:bg-slate-950">
        {/* ── Page Title ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                IN TRANSIT
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Vehicle transit monitoring & allocation tracking – 2026
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="size-4 mr-1.5" />
              Add Unit
            </Button>
          </div>
        </div>

        {/* ── Top Summary Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Units Monitored"
            value={totalUnits}
            sub="All transit records"
            accent="bg-blue-50 dark:bg-slate-800"
            icon={<Package className="size-6 text-blue-600" />}
          />
          <StatCard
            label="Currently In Transit"
            value={inTransitCount}
            sub="On the road now"
            accent="bg-indigo-50 dark:bg-slate-800"
            icon={<Truck className="size-6 text-indigo-600" />}
          />
          <StatCard
            label="Released Units"
            value={releasedCount}
            sub="Delivered to clients"
            accent="bg-green-50 dark:bg-slate-800"
            icon={<CheckCircle2 className="size-6 text-green-600" />}
          />
          <StatCard
            label="Delayed / Overdue"
            value={delayedCount}
            sub="Past target release date"
            accent="bg-red-50 dark:bg-slate-800"
            icon={<AlertTriangle className="size-6 text-red-500" />}
          />
        </div>

        {/* ── Allocation Summary Dashboard ─────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <h2 className="font-semibold text-blue-900 text-base flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-600" />
              Allocation Summary Dashboard
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall allocation quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: "Total Allocation",
                  value: allotTotal,
                  color: "text-gray-800 dark:text-gray-200",
                  bg: "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600",
                },
                {
                  label: "In Transit",
                  value: allotInTransit,
                  color: "text-blue-700 dark:text-blue-300",
                  bg: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50",
                },
                {
                  label: "Total Received",
                  value: allotReceived,
                  color: "text-green-700 dark:text-green-300",
                  bg: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50",
                },
                {
                  label: "Open / Remaining",
                  value: allotOpen,
                  color: "text-orange-700 dark:text-orange-300",
                  bg: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-4 text-center ${item.bg}`}
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {item.label}
                  </p>
                  <p className={`text-3xl font-bold mt-1 ${item.color}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Bar chart - Pure CSS */}
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-3">
                Allocation vs. Received vs. In Transit (by Model)
              </p>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mb-4 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#bfdbfe" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Allocation
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Received
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#6366f1" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    In Transit
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: "#f97316" }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">
                    Open / Remaining
                  </span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative bg-gray-50/50 dark:bg-slate-700/30 rounded-lg p-4">
                {/* Y-axis grid lines */}
                <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                  {[0, 5, 10, 15, 20].reverse().map((val) => (
                    <div key={val} className="flex items-center">
                      <span className="text-[10px] text-black-400 font-semibold dark:text-grey-500 font-semibold w-6 -ml-8">
                        {val}
                      </span>
                      <div className="flex-1 border-t border-dashed border-gray-200 dark:border-slate-600" />
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="relative flex items-end justify-around gap-2 h-[220px] px-2">
                  {allocationData.map((row) => {
                    const maxVal = 20; // Y-axis max
                    const barWidth = "w-full";
                    const spacing = "gap-0.5";

                    return (
                      <div
                        key={row.model}
                        className="flex-1 flex flex-col items-center gap-2 h-full"
                      >
                        {/* Bar group */}
                        <div
                          className={`flex items-end justify-center ${spacing} w-full flex-1`}
                        >
                          {/* Allocation bar */}
                          <div
                            className={`${barWidth} bg-blue-200 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{
                              height: `${(row.allocation / maxVal) * 100}%`,
                            }}
                            title={`Allocation: ${row.allocation}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.allocation}
                            </div>
                          </div>

                          {/* Total Received bar */}
                          <div
                            className={`${barWidth} bg-blue-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{
                              height: `${(row.totalReceived / maxVal) * 100}%`,
                            }}
                            title={`Total Received: ${row.totalReceived}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.totalReceived}
                            </div>
                          </div>

                          {/* In Transit bar */}
                          <div
                            className={`${barWidth} bg-indigo-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{
                              height: `${(row.inTransit / maxVal) * 100}%`,
                            }}
                            title={`In Transit: ${row.inTransit}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.inTransit}
                            </div>
                          </div>

                          {/* Open bar */}
                          <div
                            className={`${barWidth} bg-orange-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{ height: `${(row.open / maxVal) * 100}%` }}
                            title={`Open / Remaining: ${row.open}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.open}
                            </div>
                          </div>
                        </div>

                        {/* X-axis label */}
                        <div className="text-[10px] font-semibold text-black-500 dark:text-white-400 text-center font-semibold leading-tight max-w-full px-1">
                          {row.model}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Per-model allocation table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Model
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Allocation
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                      In Transit
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Total Received
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase">
                      Open Units
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">
                      Progress
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {allocationData.map((row) => {
                    const pct = Math.round(
                      (row.totalReceived / row.allocation) * 100,
                    );
                    return (
                      <tr
                        key={row.model}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                          {row.model}
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {row.allocation}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-xs">
                            {row.inTransit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                          {row.totalReceived}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs ${
                              row.open > 0
                                ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                                : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            }`}
                          >
                            {row.open}
                          </span>
                        </td>
                        <td className="px-4 py-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-900/50">
                    <td className="px-4 py-3 font-bold text-blue-800 dark:text-blue-300">
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-blue-800 dark:text-blue-300">
                      {allotTotal}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-700 dark:text-indigo-300">
                      {allotInTransit}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-blue-800 dark:text-blue-300">
                      {allotReceived}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-orange-700 dark:text-orange-300">
                      {allotOpen}
                    </td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* ── Filters (collapsible) ─────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setFiltersOpen((p) => !p)}
          >
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500 dark:text-gray-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
              {!filtersOpen && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  (click to expand)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {filtersOpen && activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetFilters();
                  }}
                  className="text-gray-500 dark:text-gray-400 h-7 px-2"
                >
                  <RefreshCw className="size-3 mr-1" />
                  Reset
                </Button>
              )}
              {filtersOpen ? (
                <ChevronUp className="size-4 text-gray-400 dark:text-gray-500" />
              ) : (
                <ChevronDown className="size-4 text-gray-400 dark:text-gray-500" />
              )}
            </div>
          </div>

          {filtersOpen && (
            <div className="px-6 pb-6 border-t border-gray-100 dark:border-slate-700 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                  <Input
                    className="pl-9"
                    placeholder="Model, chassis, engine, client, CS no…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* Model */}
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Models" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels
                      .slice()
                      .sort((a: string, b: string) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Dealer */}
                <Select value={filterDealer} onValueChange={setFilterDealer}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Dealers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dealers</SelectItem>
                    {uniqueDealers
                      .slice()
                      .sort((a: string, b: string) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Status */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses
                      .slice()
                      .sort((a: string, b: string) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {allUnits.length}
                </span>{" "}
                units
                {delayedCount > 0 && (
                  <span className="ml-3 text-red-500 font-medium">
                    ⚠ {delayedCount} unit{delayedCount > 1 ? "s" : ""} overdue
                    / delayed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── In Transit Data Table ─────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              In Transit Data Table
            </h2>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  {[
                    "Action",
                    "Model",
                    "Color",
                    "Chassis No.",
                    "Engine No.",
                    "Pull Out Location",
                    "CS No.",
                    "Year Model",
                    "Client Name",
                    "Dealer",
                    "PO Number",
                    "PO Amount",
                    "Pull Out Date",
                    "Declared Month",
                    "DP / Reservation",
                    "Status",
                    "Target Release",
                    "Remarks",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap bg-gray-50 dark:bg-slate-700"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={18}
                      className="px-4 py-12 text-center text-gray-400 dark:text-gray-500"
                    >
                      No units match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((unit, idx) => {
                    const overdue = isOverdue(unit);
                    return (
                      <tr
                        key={unit.id}
                        className={`transition-colors ${
                          overdue
                            ? "bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-slate-700/50"
                        }`}
                      >
                        {/* Action */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="Delete"
                                  className="h-7 w-7 text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={async () => {
                                    if (!confirm(`Delete ${unit.model}?`)) return;
                                    try {
                                      await removeVehicle(unit.id);
                                      toast.success("Deleted");
                                    } catch (error: any) {
                                      toast.error(`Delete failed: ${error?.message ?? error}`);
                                    }
                                  }}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={6}>
                                Delete
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  aria-label="Set as Available"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    navigate("/available", {
                                      state: {
                                        openAddModal: true,
                                        initialData: {
                                          id: crypto.randomUUID(),
                                          model: unit.model,
                                          color: unit.color,
                                          chassisNo: unit.chassisNo,
                                          engineNo: unit.engineNo,
                                          remarks: unit.remarks2 || unit.remarks || "",
                                          csNo: unit.csNo,
                                          yearModel: String(unit.yearModel ?? ""),
                                          taggingAccount: "",
                                          allocationTeam: "",
                                          dealer: unit.dealer,
                                          generalManager: unit.generalManager ?? "",
                                          salesConsultant: unit.salesConsultant ?? "",
                                          poNumber: unit.poNumber,
                                          poAmount: String(unit.poAmount ?? ""),
                                          pullOutDate: unit.pullOutDateRaw
                                            ? toIsoDate(unit.pullOutDateRaw)
                                            : "",
                                          dateTagged: "",
                                          monthDeclared: "",
                                          location: "",
                                          unitAge: 0,
                                          gracePeriod: "90",
                                          status: "ON TRACK",
                                        },
                                      },
                                    });
                                  }}
                                >
                                  <ArrowRight className="size-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top" sideOffset={6}>
                                Set as Available
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>

                        {/* Model */}
                        <td className="px-3 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {unit.model}
                        </td>

                        {/* Color */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.color}
                        </td>

                        {/* Chassis */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.chassisNo}
                        </td>

                        {/* Engine */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.engineNo}
                        </td>

                        {/* Pull Out Location */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.pullOutLocation}
                        </td>

                        {/* CS No */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.csNo}
                        </td>

                        {/* Year */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300">
                          {unit.yearModel}
                        </td>

                        {/* Client */}
                        <td className="px-3 py-3 text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {unit.clientName}
                        </td>

                        {/* Dealer */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {unit.dealer}
                          </span>
                        </td>

                        {/* PO Number */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.poNumber}
                        </td>

                        {/* PO Amount */}
                        <td className="px-3 py-3 text-gray-900 dark:text-gray-100 font-medium whitespace-nowrap">
                          {formatCurrency(unit.poAmount)}
                        </td>

                        {/* Pull Out Date */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.pullOutDate}
                        </td>

                        {/* Declared Month */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.declaredMonth}
                        </td>

                        {/* DP / Reservation */}
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {unit.dpReservation}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <StatusBadge status={unit.status} />
                        </td>

                        {/* Target Release */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              overdue
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {overdue && <AlertTriangle className="size-3" />}
                            {unit.targetReleaseDate}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td
                          className="px-3 py-3 text-gray-500 dark:text-gray-400 text-xs max-w-[180px] truncate"
                          title={unit.remarks2}
                        >
                          {unit.remarks2}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-blue-50 dark:bg-blue-900/20 border-t-2 border-blue-200 dark:border-blue-900/50">
                    <td
                      colSpan={11}
                      className="px-3 py-3 text-sm font-bold text-blue-800 dark:text-blue-300"
                    >
                      TOTAL ({filtered.length} units)
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 whitespace-nowrap">
                      {formatCurrency(
                        filtered.reduce((s, u) => s + u.poAmount, 0),
                      )}
                    </td>
                    <td colSpan={6} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </main>

      {/* Add In Transit Modal */}
      {showAddModal && (
        <AddInTransitModal
          onClose={() => setShowAddModal(false)}
          onSave={async (entry) => {
            await addVehicle({
              model: entry.model,
              color: entry.color,
              chassisNo: entry.chassisNo,
              engineNo: entry.engineNo,
              remarks: entry.remarks,
              pullOutLocation: entry.pullOutLocation,
              csNo: entry.csNo,
              yearModel: Number(entry.yearModel) || new Date().getFullYear(),
              clientName: entry.clientName,
              dealer: entry.dealer,
              generalManager: entry.generalManager,
              salesConsultant: entry.salesConsultant,
              poNumber: entry.poNumber,
              poAmount: entry.poAmount,
              pullOut: entry.pullOutDate ? new Date(entry.pullOutDate) : null,
              declaredMonth: entry.declaredMonth,
              dpReservation: entry.dpReservation,
              status: entry.status || "IN TRANSIT",
              targetRelease: entry.targetRelease,
              remarks2: entry.remarks,
              location: entry.pullOutLocation,
            });
          }}
        />
      )}
    </>
  );
}
