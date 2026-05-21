import { useState, useMemo, useEffect } from "react";
import { Header } from "../components/Header";
import {
  useNextCutOffPayments,
  useVehicles,
  type NextCutOffRecord,
  type NextCutOffInput,
} from "../../lib/api";
import {
  Plus,
  Pencil,
  Trash2,
  CalendarIcon,
  X,
  Calculator,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Save,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  formatPhp,
} from "../data/suzukiModels";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaymentRow {
  id: number;
  description: string; // Month range label
  numberOfUnits: number;
  unitPrice: number; // auto-pulled from model
  totalAmount: number; // auto-calculated
  dateOfPayment: string; // ISO date
  remarks: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "OVERDUE";
}

// ── Mapping helpers (DB ↔ UI shape) ──────────────────────────────────────────

const toRow = (r: NextCutOffRecord): PaymentRow => ({
  id: r.id,
  description: r.description,
  numberOfUnits: r.number_of_units,
  unitPrice: r.unit_price,
  totalAmount: r.total_amount,
  dateOfPayment: r.date_of_payment,
  remarks: r.remarks,
  status: r.status,
});

const toInput = (r: Omit<PaymentRow, "id">): NextCutOffInput => ({
  description: r.description,
  number_of_units: r.numberOfUnits,
  unit_price: r.unitPrice,
  total_amount: r.totalAmount,
  date_of_payment: r.dateOfPayment,
  remarks: r.remarks,
  status: r.status,
});

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  PaymentRow["status"],
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
  }
> = {
  PENDING: {
    label: "Pending",
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-700 dark:text-yellow-300",
    border: "border-yellow-200 dark:border-yellow-800",
    dot: "bg-yellow-400",
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-700 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-500",
  },
  PAID: {
    label: "Paid",
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-700 dark:text-green-300",
    border: "border-green-200 dark:border-green-800",
    dot: "bg-green-500",
  },
  OVERDUE: {
    label: "Overdue",
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-700 dark:text-red-300",
    border: "border-red-200 dark:border-red-800",
    dot: "bg-red-500",
  },
};

// ── Empty form ─────────────────────────────────────────────────────────────────

const EMPTY: Omit<PaymentRow, "id"> = {
  description: "",
  numberOfUnits: 1,
  unitPrice: 0,
  totalAmount: 0,
  dateOfPayment: "",
  remarks: "",
  status: "PENDING",
};

const RANGE_FIRST_HALF = "1-15";
const RANGE_SECOND_HALF = "16-";

const toDateOnly = (value: string | Date | null | undefined) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const formatDisplayDate = (value: string | Date | null | undefined) => {
  const date = toDateOnly(value);
  return date
    ? date.toLocaleDateString("en-PH", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "";
};

const getMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-PH", { month: "short" }).format(date);

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const getMonthRanges = (date: Date) => {
  const monthLabel = getMonthLabel(date);
  const year = date.getFullYear();
  const month = date.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return [
    `${monthLabel} ${RANGE_FIRST_HALF}`,
    `${monthLabel} ${RANGE_SECOND_HALF}${lastDay}`,
  ];
};

const parseDescriptionMonth = (description: string) => {
  const month = description.split(' ')[0];
  const index = MONTH_LABELS.findIndex(
    (label) => label.toLowerCase() === month.toLowerCase(),
  );
  return index >= 0 ? index : null;
};

const getRangeFromRow = (row: PaymentRow) => {
  const monthFromDescription = parseDescriptionMonth(row.description);
  const date = toDateOnly(row.dateOfPayment);
  const base = date ?? new Date();
  let year = base.getFullYear();

  if (!date && monthFromDescription !== null) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const nextMonth = (currentMonth + 1) % 12;
    if (monthFromDescription === nextMonth && currentMonth === 11) {
      year = today.getFullYear() + 1;
    } else {
      year = today.getFullYear();
    }
  }

  const month = monthFromDescription ?? base.getMonth();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const isSecondHalf = row.description.includes(RANGE_SECOND_HALF);
  const startDay = isSecondHalf ? 16 : 1;
  const endDay = isSecondHalf ? lastDay : 15;
  const start = new Date(year, month, startDay);
  const end = new Date(year, month, endDay);
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const parsePhpNumber = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const applyOverdueStatus = (row: PaymentRow) => {
  if (row.status === "PAID") return row.status;
  const date = toDateOnly(row.dateOfPayment);
  if (!date) return row.status;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today ? "OVERDUE" : row.status;
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function NextCutOffPage() {
  const { rows: records, loading, addRow, updateRow, removeRow } =
    useNextCutOffPayments();
  const rows = useMemo(() => records.map(toRow), [records]);
  const { vehicles } = useVehicles();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);

  const currentMonthRows = rows.filter((row) => {
    const monthIndex = parseDescriptionMonth(row.description);
    const date = toDateOnly(row.dateOfPayment);
    return monthIndex === currentMonth && date?.getFullYear() === currentYear;
  });

  const nextMonthRows = rows.filter((row) => {
    const monthIndex = parseDescriptionMonth(row.description);
    const date = toDateOnly(row.dateOfPayment);
    return monthIndex === nextMonthDate.getMonth() && date?.getFullYear() === currentYear;
  });

  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 6;
  const [historyYear, setHistoryYear] = useState(currentYear.toString());

  const historyRows = useMemo(() => {
    const year = Number(historyYear) || currentYear;
    return rows.filter((row) => {
      const monthIndex = parseDescriptionMonth(row.description);
      if (monthIndex === null) return false;
      const date = toDateOnly(row.dateOfPayment);
      if (!date || date.getFullYear() !== year) return false;
      // Only exclude current/next month if viewing current year; show all for past years
      if (year !== currentYear) return true;
      return (
        monthIndex !== currentMonth &&
        monthIndex !== nextMonthDate.getMonth()
      );
    }).sort((a, b) => new Date(b.dateOfPayment).getTime() - new Date(a.dateOfPayment).getTime());
  }, [rows, currentYear, currentMonth, historyYear]);

  const totalHistoryPages = Math.ceil(historyRows.length / itemsPerPage);
  const paginatedHistory = historyRows.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  const computeRangeTotals = (row: PaymentRow) => {
    const { start, end } = getRangeFromRow(row);
    const matching = vehicles.filter((vehicle) => {
      const pullDate = vehicle.pullOut ?? vehicle.pullOutDate ?? null;
      if (!pullDate) return false;
      const date = pullDate instanceof Date ? pullDate : new Date(pullDate);
      if (Number.isNaN(date.getTime())) return false;
      return date >= start && date <= end;
    });
    const numberOfUnits = matching.length;
    const totalAmount = matching.reduce(
      (sum, vehicle) => sum + parsePhpNumber(vehicle.poAmount),
      0,
    );
    return { numberOfUnits, totalAmount };
  };

  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState<PaymentRow | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const normalizeRowForSave = (row: PaymentRow) => {
    const { numberOfUnits, totalAmount } = computeRangeTotals(row);
    return {
      ...row,
      numberOfUnits,
      totalAmount,
      unitPrice: 0,
      status: applyOverdueStatus(row),
    };
  };

  const handleAdd = async (row: PaymentRow) => {
    const paymentYear = new Date(row.dateOfPayment).getFullYear();
    if (paymentYear !== currentYear) {
      toast.error("Payment entries must be for the current year");
      return;
    }
    const existing = rows.find(r => r.description === row.description && new Date(r.dateOfPayment).getFullYear() === currentYear);
    if (existing) {
      toast.error("A payment entry with this range already exists for the current year");
      return;
    }
    try {
      await addRow(toInput(normalizeRowForSave(row)));
      toast.success("Payment entry added!");
    } catch {
      toast.error("Failed to add payment entry");
    }
  };
  const handleEdit = async (row: PaymentRow) => {
    try {
      await updateRow(row.id, toInput(normalizeRowForSave(row)));
      toast.success("Payment entry updated!");
    } catch {
      toast.error("Failed to update payment entry");
    }
  };
  const handleDel = async (id: number) => {
    try {
      await removeRow(id);
    } catch {
      toast.error("Failed to delete payment entry");
    } finally {
      setDeleteId(null);
    }
  };

  // Summary
  const totals = useMemo(() => {
    const enriched = rows.map((row) => {
      const { numberOfUnits, totalAmount } = computeRangeTotals(row);
      const status = applyOverdueStatus(row);
      return { ...row, numberOfUnits, totalAmount, status };
    });
    return {
      units: enriched.reduce((s, r) => s + r.numberOfUnits, 0),
      amount: enriched.reduce((s, r) => s + r.totalAmount, 0),
      pending: enriched.filter((r) => r.status === "PENDING").length,
      paid: enriched.filter((r) => r.status === "PAID").length,
    };
  }, [rows, vehicles]);

  const currentMonthTotals = useMemo(() => {
    const enriched = currentMonthRows.map((row) => ({
      ...row,
      ...computeRangeTotals(row),
    }));
    return {
      units: enriched.reduce((s, r) => s + r.numberOfUnits, 0),
      amount: enriched.reduce((s, r) => s + r.totalAmount, 0),
    };
  }, [currentMonthRows, vehicles]);

  const nextMonthTotals = useMemo(() => {
    const enriched = nextMonthRows.map((row) => ({
      ...row,
      ...computeRangeTotals(row),
    }));
    return {
      units: enriched.reduce((s, r) => s + r.numberOfUnits, 0),
      amount: enriched.reduce((s, r) => s + r.totalAmount, 0),
    };
  }, [nextMonthRows, vehicles]);

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* ── Page Header ───────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl">
              <CreditCard className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                Next Cut-Off for Payment
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Manage upcoming payment schedules for vehicle
                pull-out batches
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              setEditRow(null);
              setShowModal(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 flex-shrink-0"
          >
            <Plus className="size-4 mr-1.5" />
            Add Payment Entry
          </Button>
        </div>

        {/* ── Summary Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Entries"
            value={rows.length}
            sub="payment batches"
            icon={
              <Calculator className="size-5 text-indigo-600" />
            }
            iconBg="bg-indigo-50 dark:bg-indigo-950"
          />
          <SummaryCard
            label="Total Units"
            value={totals.units}
            sub="vehicles to pay"
            icon={
              <CreditCard className="size-5 text-blue-600" />
            }
            iconBg="bg-blue-50 dark:bg-blue-950"
          />
          <SummaryCard
            label="Total Amount Due"
            value={formatPhp(totals.amount)}
            sub="all batches combined"
            icon={<Clock className="size-5 text-amber-600" />}
            iconBg="bg-amber-50 dark:bg-amber-950"
            wide
          />
          <SummaryCard
            label="Pending / Paid"
            value={`${totals.pending} / ${totals.paid}`}
            sub="awaiting vs. settled"
            icon={
              <CheckCircle2 className="size-5 text-green-600" />
            }
            iconBg="bg-green-50 dark:bg-green-950"
          />
        </div>

        {/* ── Current Month for Payment ─────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 dark:from-emerald-950 to-green-50 dark:to-green-950 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Current Month for Payment
              </h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                {currentMonthRows.length} payment record(s) for the
                current month
              </p>
            </div>
            <span className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {formatPhp(currentMonthTotals.amount)} total
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Th>Month Range</Th>
                  <Th right>Number of Units</Th>
                  <Th right>Total Amount</Th>
                  <Th>Date of Payment</Th>
                  <Th center>Status</Th>
                  <Th>Remarks</Th>
                  <Th sticky>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && currentMonthRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : currentMonthRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      No payments recorded yet.
                    </td>
                  </tr>
                ) : (
                  currentMonthRows.map((row) => {
                    const { numberOfUnits, totalAmount } = computeRangeTotals(row);
                    const status = applyOverdueStatus(row);
                    const cfg = STATUS_CFG[status];
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-emerald-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-800 dark:text-gray-200 whitespace-nowrap">
                          {row.description}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-800 dark:text-gray-200">
                          {numberOfUnits}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatPhp(totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {formatDisplayDate(row.dateOfPayment) || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-3 text-xs ${row.remarks ? "text-gray-600 dark:text-gray-400" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {row.remarks || "–"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditRow(row);
                                setShowModal(true);
                              }}
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(row.id)}
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {currentMonthRows.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-50 dark:bg-emerald-950 border-t-2 border-emerald-200 dark:border-emerald-800">
                    <td className="px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 text-right">
                      {currentMonthTotals.units}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-emerald-800 dark:text-emerald-200 text-right whitespace-nowrap">
                      {formatPhp(currentMonthTotals.amount)}
                    </td>
                    <td className="px-4 py-3" colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── Payment Table ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-indigo-50 dark:from-indigo-950 to-blue-50 dark:to-blue-950">
            <div>
              <h2 className="font-semibold text-indigo-900 dark:text-indigo-100">
                Next Cut-Off
              </h2>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 mt-0.5">
                {nextMonthRows.length} entries · Click a row to edit
                inline
              </p>
            </div>
            <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">
              {formatPhp(nextMonthTotals.amount)} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Th>#</Th>
                  <Th>(Next month) Month Range</Th>
                  <Th center>Units</Th>
                  <Th right>Total Amount</Th>
                  <Th center>Date of Payment</Th>
                  <Th center>Status</Th>
                  <Th>Remarks</Th>
                  <Th sticky>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && nextMonthRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : nextMonthRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm"
                    >
                      <AlertCircle className="size-8 mx-auto mb-2 opacity-30" />
                      No payment entries yet. Click "Add Payment
                      Entry" to begin.
                    </td>
                  </tr>
                ) : (
                  nextMonthRows.map((row, idx) => {
                    const { numberOfUnits, totalAmount } = computeRangeTotals(row);
                    const status = applyOverdueStatus(row);
                    const cfg = STATUS_CFG[status];
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {row.description}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
                            {numberOfUnits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatPhp(totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <span className="flex items-center justify-center gap-1.5">
                            <CalendarIcon className="size-3.5 text-gray-400 dark:text-gray-500" />
                            {row.dateOfPayment
                              ? new Date(
                                  row.dateOfPayment,
                                ).toLocaleDateString("en-PH", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate text-xs">
                          {row.remarks || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/20 border-l border-gray-100 dark:border-gray-800 transition-colors">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditRow(row);
                                setShowModal(true);
                              }}
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteId(row.id)
                              }
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {nextMonthRows.length > 0 && (
                <tfoot>
                  <tr className="bg-indigo-50 dark:bg-indigo-950 border-t-2 border-indigo-200 dark:border-indigo-800">
                    <td
                      colSpan={2}
                      className="px-4 py-3 font-semibold text-indigo-900 dark:text-indigo-100 text-sm"
                    >
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-900 dark:text-indigo-100">
                      {nextMonthTotals.units}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-900 dark:text-indigo-100 text-base">
                      {formatPhp(nextMonthTotals.amount)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* ── History Table ───────────────────────────────────────────── */}  
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 dark:from-gray-950 to-slate-50 dark:to-slate-950 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Payment History
              </h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                {paginatedHistory.length} entries · Page {historyPage} of {totalHistoryPages}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Year:
              </label>
              <Input
                type="number"
                value={historyYear}
                onChange={(e) => {
                  setHistoryYear(e.target.value);
                  setHistoryPage(1); // reset to first page
                }}
                className="w-20"
                min="2020"
                max={currentYear}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <Th>#</Th>
                  <Th>Month Range</Th>
                  <Th center>Units</Th>
                  <Th right>Total Amount</Th>
                  <Th center>Date of Payment</Th>
                  <Th center>Status</Th>
                  <Th>Remarks</Th>
                  <Th sticky>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && paginatedHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : paginatedHistory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500"
                    >
                      No history records for {historyYear}.
                    </td>
                  </tr>
                ) : (
                  paginatedHistory.map((row, idx) => {
                    const { numberOfUnits, totalAmount } = computeRangeTotals(row);
                    const status = applyOverdueStatus(row);
                    const cfg = STATUS_CFG[status];
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-gray-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">
                          {(historyPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {row.description}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-xs font-semibold">
                            {numberOfUnits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                          {formatPhp(totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700 dark:text-gray-300">
                          <span className="flex items-center justify-center gap-1.5">
                            <CalendarIcon className="size-3.5 text-gray-400 dark:text-gray-500" />
                            {row.dateOfPayment
                              ? new Date(
                                  row.dateOfPayment,
                                ).toLocaleDateString("en-PH", {
                                  month: "short",
                                  day: "2-digit",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.text} ${cfg.border}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}
                            />
                            {cfg.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400 max-w-[200px] truncate text-xs">
                          {row.remarks || "—"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditRow(row);
                                setShowModal(true);
                              }}
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteId(row.id)
                              }
                              className="p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalHistoryPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
              <button
                onClick={() => setHistoryPage(Math.max(1, historyPage - 1))}
                disabled={historyPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {historyPage} of {totalHistoryPages}
              </span>
              <button
                onClick={() => setHistoryPage(Math.min(totalHistoryPages, historyPage + 1))}
                disabled={historyPage === totalHistoryPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </main>

      {/* ── Add / Edit Modal ──────────────────────────────────────────── */}
      {showModal && (
        <PaymentFormModal
          initial={editRow}
          onClose={() => {
            setShowModal(false);
            setEditRow(null);
          }}
          onSave={(row) => {
            if (editRow) handleEdit(row);
            else handleAdd(row);
            setShowModal(false);
            setEditRow(null);
          }}
          vehicles={vehicles}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      {deleteId && (
        <DeleteDialog
          row={rows.find((r) => r.id === deleteId)!}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDel(deleteId)}
          vehicles={vehicles}
        />
      )}
    </>
  );
}

// ── Payment Form Modal ────────────────────────────────────────────────────────

function PaymentFormModal({
  initial,
  onClose,
  onSave,
  vehicles,
  currentYear,
  currentMonth,
}: {
  initial: PaymentRow | null;
  onClose: () => void;
  onSave: (row: PaymentRow) => void;
  vehicles: any[];
  currentYear: number;
  currentMonth: number;
}) {
  const isEdit = !!initial;
  const [form, setForm] = useState<Omit<PaymentRow, "id">>({
    ...EMPTY,
    ...(initial
      ? {
          description: initial.description,
          numberOfUnits: initial.numberOfUnits,
          unitPrice: initial.unitPrice,
          totalAmount: initial.totalAmount,
          dateOfPayment: initial.dateOfPayment,
          remarks: initial.remarks,
          status: initial.status,
        }
      : {}),
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof typeof form, string>>
  >({});

  const set = <K extends keyof typeof form>(
    k: K,
    v: (typeof form)[K],
  ) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: "" }));
  };

  const monthRangeOptions = useMemo(() => {
    const currentDate = new Date(currentYear, currentMonth, 1);
    const currentRanges = getMonthRanges(currentDate);
    const nextRanges = getMonthRanges(new Date(currentYear, currentMonth + 1, 1));
    return [...currentRanges, ...nextRanges];
  }, [currentYear, currentMonth]);

  useEffect(() => {
    if (!monthRangeOptions.includes(form.description)) {
      setForm((p) => ({ ...p, description: monthRangeOptions[0] }));
    }
  }, [monthRangeOptions, form.description]);

  useEffect(() => {
    if (!form.dateOfPayment && form.description) {
      const monthIndex = parseDescriptionMonth(form.description);
      if (monthIndex === null) return;

      const isFirstHalf = form.description.includes(RANGE_FIRST_HALF);
      const year = currentYear;
      const targetMonth = monthIndex;
      const nextMonth = (targetMonth + 1) % 12;
      const nextYear = targetMonth === 11 ? year + 1 : year;

      const suggestedDate = isFirstHalf
        ? new Date(year, targetMonth, 20)
        : new Date(nextYear, nextMonth, 5);

      const dateString = suggestedDate.toISOString().split('T')[0];
      setForm((p) => ({ ...p, dateOfPayment: dateString }));
    }
  }, [form.description, form.dateOfPayment, currentYear, currentMonth]);

  const rangeTotals = useMemo(() => {
    const row: PaymentRow = { ...form, id: 0 };
    const { start, end } = getRangeFromRow(row);
    const matching = vehicles.filter((vehicle) => {
      const pullDate = vehicle.pullOut ?? vehicle.pullOutDate ?? null;
      if (!pullDate) return false;
      const date = pullDate instanceof Date ? pullDate : new Date(pullDate);
      if (Number.isNaN(date.getTime())) return false;
      return date >= start && date <= end;
    });
    const numberOfUnits = matching.length;
    const totalAmount = matching.reduce(
      (sum, vehicle) => sum + parsePhpNumber(vehicle.poAmount),
      0,
    );
    return { numberOfUnits, totalAmount };
  }, [form.description, form.dateOfPayment, vehicles]);

  const validate = () => {
    const e: typeof errors = {};
    if (!form.description)
      e.description = "Please select a month range";
    if (!form.dateOfPayment)
      e.dateOfPayment = "Date of payment is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave({
      ...form,
      numberOfUnits: rangeTotals.numberOfUnits,
      totalAmount: rangeTotals.totalAmount,
      unitPrice: 0,
      status: applyOverdueStatus({ ...form, id: 0 }),
      id: initial?.id ?? 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl ${isEdit ? "bg-blue-50 dark:bg-blue-950" : "bg-indigo-50 dark:bg-indigo-950"}`}
        >
          <div>
            <h2
              className={`font-semibold ${isEdit ? "text-blue-900 dark:text-blue-100" : "text-indigo-900 dark:text-indigo-100"}`}
            >
              {isEdit
                ? "✏️ Edit Payment Entry"
                : "＋ Add Payment Entry"}
            </h2>
            <p
              className={`text-xs mt-0.5 ${isEdit ? "text-blue-600 dark:text-blue-300" : "text-indigo-600 dark:text-indigo-300"}`}
            >
              Fields marked{" "}
              <span className="text-red-500">*</span> are
              required
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isEdit ? "hover:bg-blue-100 dark:hover:bg-blue-900" : "hover:bg-indigo-100 dark:hover:bg-indigo-900"}`}
          >
            <X
              className={`size-5 ${isEdit ? "text-blue-700 dark:text-blue-300" : "text-indigo-700 dark:text-indigo-300"}`}
            />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 dark:bg-gray-900">
          {/* Month Range */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month Range <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.description}
              onValueChange={(value) => set("description", value)}
            >
              <SelectTrigger
                className={`flex-1 ${errors.description ? "border-red-400" : ""}`}
              >
                <SelectValue placeholder="Select month range…" />
              </SelectTrigger>
              <SelectContent className="max-h-[280px]">
                {monthRangeOptions.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description}
              </p>
            )}
          </div>

          {/* Units + Total row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Number of Units
                <span className="ml-1 text-gray-400 font-normal">
                  (auto)
                </span>
              </label>
              <div className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200">
                {rangeTotals.numberOfUnits}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Amount
                <span className="ml-1 text-gray-400 font-normal">
                  (auto)
                </span>
              </label>
              <div
                className={`px-3 py-2 border rounded-md text-sm font-semibold ${
                  rangeTotals.totalAmount > 0
                    ? "border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500"
                }`}
              >
                {rangeTotals.totalAmount > 0
                  ? formatPhp(rangeTotals.totalAmount)
                  : "—"}
              </div>
            </div>
          </div>

          {/* Auto-calc banner */}
          {rangeTotals.totalAmount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700">
              <Calculator className="size-3.5 flex-shrink-0" />
              <span>
                <strong>{rangeTotals.numberOfUnits}</strong> unit
                {rangeTotals.numberOfUnits !== 1 ? "s" : ""} ·{" "}
                <strong>{formatPhp(rangeTotals.totalAmount)}</strong>
              </span>
            </div>
          )}

          {/* Date of Payment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date of Payment{" "}
              <span className="text-red-500">*</span>
              <span className="block text-gray-500 dark:text-gray-400 font-normal text-[11px] mt-0.5">
                Due date pin to track pending vs overdue status
              </span>
            </label>
            <div className="relative">
              <Input
                type="date"
                value={form.dateOfPayment}
                onChange={(e) =>
                  set("dateOfPayment", e.target.value)
                }
                className={`pl-9 ${errors.dateOfPayment ? "border-red-400" : ""}`}
              />
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
            </div>
            {errors.dateOfPayment && (
              <p className="text-xs text-red-500 mt-1">
                {errors.dateOfPayment}
              </p>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
              Auto-suggested based on month range. Adjust if needed.
            </p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                set("status", v as PaymentRow["status"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    STATUS_CFG,
                  ) as PaymentRow["status"][]
                )
                  .slice()
                  .sort((a, b) => STATUS_CFG[a].label.localeCompare(STATUS_CFG[b].label, 'en', { numeric: true, sensitivity: 'base' }))
                  .map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${STATUS_CFG[s].dot}`}
                      />
                      {STATUS_CFG[s].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Remarks
            </label>
            <Input
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              placeholder="e.g. Paid via BDO / Awaiting SPH invoice…"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Totals auto-calculated from pull-out dates.
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className={
                isEdit
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }
            >
              <Save className="size-4 mr-1.5" />
              {isEdit ? "Save Changes" : "Add Entry"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Dialog ─────────────────────────────────────────────────────────────

function DeleteDialog({
  row,
  onCancel,
  onConfirm,
  vehicles,
}: {
  row: PaymentRow;
  onCancel: () => void;
  onConfirm: () => void;
  vehicles: any[];
}) {
  const derived = useMemo(() => {
    const { start, end } = getRangeFromRow(row);
    const matching = vehicles.filter((vehicle) => {
      const pullDate = vehicle.pullOut ?? vehicle.pullOutDate ?? null;
      if (!pullDate) return false;
      const date = pullDate instanceof Date ? pullDate : new Date(pullDate);
      if (Number.isNaN(date.getTime())) return false;
      return date >= start && date <= end;
    });
    return {
      numberOfUnits: matching.length,
      totalAmount: matching.reduce(
        (sum, vehicle) => sum + parsePhpNumber(vehicle.poAmount),
        0,
      ),
    };
  }, [row, vehicles]);

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 dark:bg-red-950 p-2.5 rounded-xl">
            <Trash2 className="size-5 text-red-600 dark:text-red-300" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              Delete Entry
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-5 border border-gray-200 dark:border-gray-700 space-y-0.5">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {row.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {derived.numberOfUnits} unit
            {derived.numberOfUnits !== 1 ? "s" : ""} ·{" "}
            {formatPhp(derived.totalAmount)}
          </p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
  icon,
  iconBg,
  wide,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  wide?: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex items-start justify-between gap-3 shadow-sm">
      <div className="min-w-0">
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p
          className={`font-semibold text-gray-900 ${wide ? "text-lg" : "text-2xl"} truncate`}
        >
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div
        className={`${iconBg} p-2.5 rounded-lg flex-shrink-0`}
      >
        {icon}
      </div>
    </div>
  );
}

function Th({
  children,
  right,
  center,
  sticky,
}: {
  children: React.ReactNode;
  right?: boolean;
  center?: boolean;
  sticky?: boolean;
}) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap bg-gray-50 dark:bg-gray-800
      ${right ? "text-right" : center ? "text-center" : "text-left"}
      ${sticky ? "sticky right-0 border-l border-gray-200 dark:border-gray-700 z-10" : ""}
    `}
    >
      {children}
    </th>
  );
}