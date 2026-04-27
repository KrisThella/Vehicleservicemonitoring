import { useState, useMemo } from "react";
import { Header } from "../components/Header";
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
  SUZUKI_MODELS,
  MODEL_PRICE_MAP,
  MODEL_CATEGORIES,
  formatPhp,
} from "../data/suzukiModels";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PaymentRow {
  id: string;
  description: string; // Model name (from dropdown)
  numberOfUnits: number;
  unitPrice: number; // auto-pulled from model
  totalAmount: number; // auto-calculated
  dateOfPayment: string; // ISO date
  remarks: string;
  status: "PENDING" | "PROCESSING" | "PAID" | "OVERDUE";
}

// ── Seed data ─────────────────────────────────────────────────────────────────

const SEED: PaymentRow[] = [
  {
    id: "nc-1",
    description: "ERTIGA 1.5 GA MT",
    numberOfUnits: 2,
    unitPrice: 870_000,
    totalAmount: 1_740_000,
    dateOfPayment: "2026-04-25",
    remarks: "For BDO processing",
    status: "PENDING",
  },
  {
    id: "nc-2",
    description: "DZIRE GL MT",
    numberOfUnits: 2,
    unitPrice: 700_000,
    totalAmount: 1_400_000,
    dateOfPayment: "2026-04-25",
    remarks: "Pending bank confirmation",
    status: "PROCESSING",
  },
  {
    id: "nc-3",
    description: "CELERIO 1.0 GL MT",
    numberOfUnits: 1,
    unitPrice: 595_000,
    totalAmount: 595_000,
    dateOfPayment: "2026-04-28",
    remarks: "For BPI processing",
    status: "PENDING",
  },
  {
    id: "nc-4",
    description: "FRONX GL+ HYBRID",
    numberOfUnits: 2,
    unitPrice: 1_160_000,
    totalAmount: 2_320_000,
    dateOfPayment: "2026-04-28",
    remarks: "Awaiting SPH invoice",
    status: "PENDING",
  },
];

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
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-200",
    dot: "bg-yellow-400",
  },
  PROCESSING: {
    label: "Processing",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  PAID: {
    label: "Paid",
    bg: "bg-green-50",
    text: "text-green-700",
    border: "border-green-200",
    dot: "bg-green-500",
  },
  OVERDUE: {
    label: "Overdue",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
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

// ── Page ──────────────────────────────────────────────────────────────────────

export function NextCutOffPage() {
  const [rows, setRows] = useState<PaymentRow[]>(SEED);
  const [showModal, setShowModal] = useState(false);
  const [editRow, setEditRow] = useState<PaymentRow | null>(
    null,
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = (row: PaymentRow) => {
    setRows((p) => [...p, row]);
  };
  const handleEdit = (row: PaymentRow) => {
    setRows((p) => p.map((r) => (r.id === row.id ? row : r)));
  };
  const handleDel = (id: string) => {
    setRows((p) => p.filter((r) => r.id !== id));
    setDeleteId(null);
  };

  // Summary
  const totals = useMemo(
    () => ({
      units: rows.reduce((s, r) => s + r.numberOfUnits, 0),
      amount: rows.reduce((s, r) => s + r.totalAmount, 0),
      pending: rows.filter((r) => r.status === "PENDING")
        .length,
      paid: rows.filter((r) => r.status === "PAID").length,
    }),
    [rows],
  );

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
              <h1 className="text-2xl font-semibold text-gray-900">
                Next Cut-Off for Payment
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
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
            iconBg="bg-indigo-50"
          />
          <SummaryCard
            label="Total Units"
            value={totals.units}
            sub="vehicles to pay"
            icon={
              <CreditCard className="size-5 text-blue-600" />
            }
            iconBg="bg-blue-50"
          />
          <SummaryCard
            label="Total Amount Due"
            value={formatPhp(totals.amount)}
            sub="all batches combined"
            icon={<Clock className="size-5 text-amber-600" />}
            iconBg="bg-amber-50"
            wide
          />
          <SummaryCard
            label="Pending / Paid"
            value={`${totals.pending} / ${totals.paid}`}
            sub="awaiting vs. settled"
            icon={
              <CheckCircle2 className="size-5 text-green-600" />
            }
            iconBg="bg-green-50"
          />
        </div>

        {/* ── Payment Table ─────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50">
            <div>
              <h2 className="font-semibold text-indigo-900">
                Payment Schedule
              </h2>
              <p className="text-xs text-indigo-600 mt-0.5">
                {rows.length} entries · Click a row to edit
                inline
              </p>
            </div>
            <span className="text-sm font-semibold text-indigo-700">
              {formatPhp(totals.amount)} total
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th>#</Th>
                  <Th>Description / Model</Th>
                  <Th center>Units</Th>
                  <Th right>Unit Price</Th>
                  <Th right>Total Amount</Th>
                  <Th center>Date of Payment</Th>
                  <Th>Remarks</Th>
                  <Th center>Status</Th>
                  <Th sticky>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="py-16 text-center text-gray-400 text-sm"
                    >
                      <AlertCircle className="size-8 mx-auto mb-2 opacity-30" />
                      No payment entries yet. Click "Add Payment
                      Entry" to begin.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => {
                    const cfg = STATUS_CFG[row.status];
                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-indigo-50/30 transition-colors group"
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {row.description}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {row.numberOfUnits}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 whitespace-nowrap">
                          {formatPhp(row.unitPrice)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">
                          {formatPhp(row.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-gray-700">
                          <span className="flex items-center justify-center gap-1.5">
                            <CalendarIcon className="size-3.5 text-gray-400" />
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
                        <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate text-xs">
                          {row.remarks || "—"}
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
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-indigo-50/30 border-l border-gray-100 transition-colors">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditRow(row);
                                setShowModal(true);
                              }}
                              className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setDeleteId(row.id)
                              }
                              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                    <td
                      colSpan={2}
                      className="px-4 py-3 font-semibold text-indigo-900 text-sm"
                    >
                      TOTAL
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-900">
                      {totals.units}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-400 text-xs">
                      —
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-indigo-900 text-base">
                      {formatPhp(totals.amount)}
                    </td>
                    <td colSpan={4} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
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
        />
      )}

      {/* ── Delete Confirm ────────────────────────────────────────────── */}
      {deleteId && (
        <DeleteDialog
          row={rows.find((r) => r.id === deleteId)!}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDel(deleteId)}
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
}: {
  initial: PaymentRow | null;
  onClose: () => void;
  onSave: (row: PaymentRow) => void;
}) {
  const isEdit = !!initial;
  const [categoryFilter, setCategoryFilter] = useState("ALL");
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

  // When model changes → auto-fill price & recalc total
  const handleModelChange = (model: string) => {
    const price = MODEL_PRICE_MAP[model] ?? 0;
    const total = price * form.numberOfUnits;
    setForm((p) => ({
      ...p,
      description: model,
      unitPrice: price,
      totalAmount: total,
    }));
    if (errors.description)
      setErrors((p) => ({ ...p, description: "" }));
  };

  // When units change → recalc total
  const handleUnitsChange = (val: string) => {
    const n = Math.max(0, parseInt(val, 10) || 0);
    const total = form.unitPrice * n;
    setForm((p) => ({
      ...p,
      numberOfUnits: n,
      totalAmount: total,
    }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.description)
      e.description = "Please select a model";
    if (!form.numberOfUnits)
      e.numberOfUnits = "Units must be ≥ 1";
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
      id: initial?.id ?? crypto.randomUUID(),
    });
    toast.success(
      isEdit
        ? "Payment entry updated!"
        : "Payment entry added!",
    );
  };

  const filteredModels =
    categoryFilter === "ALL"
      ? SUZUKI_MODELS
      : SUZUKI_MODELS.filter(
          (m) => m.category === categoryFilter,
        );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 rounded-t-2xl ${isEdit ? "bg-blue-50" : "bg-indigo-50"}`}
        >
          <div>
            <h2
              className={`font-semibold ${isEdit ? "text-blue-900" : "text-indigo-900"}`}
            >
              {isEdit
                ? "✏️ Edit Payment Entry"
                : "＋ Add Payment Entry"}
            </h2>
            <p
              className={`text-xs mt-0.5 ${isEdit ? "text-blue-600" : "text-indigo-600"}`}
            >
              Fields marked{" "}
              <span className="text-red-500">*</span> are
              required
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isEdit ? "hover:bg-blue-100" : "hover:bg-indigo-100"}`}
          >
            <X
              className={`size-5 ${isEdit ? "text-blue-700" : "text-indigo-700"}`}
            />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Description / Model */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description / Model{" "}
              <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2 mb-1">
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="border border-gray-300 rounded-md px-2 py-2 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-shrink-0"
              >
                <option value="ALL">All Categories</option>
                {MODEL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <Select
                value={form.description}
                onValueChange={handleModelChange}
              >
                <SelectTrigger
                  className={`flex-1 ${errors.description ? "border-red-400" : ""}`}
                >
                  <SelectValue placeholder="Select model…" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {filteredModels.map((m) => (
                    <SelectItem key={m.name} value={m.name}>
                      <span className="flex items-center justify-between gap-4 w-full">
                        <span>{m.name}</span>
                        <span className="text-gray-400 text-xs">
                          {formatPhp(m.basePrice)}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description}
              </p>
            )}
          </div>

          {/* Units + Price + Total row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Number of Units */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                No. of Units{" "}
                <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                value={form.numberOfUnits}
                onChange={(e) =>
                  handleUnitsChange(e.target.value)
                }
                className={
                  errors.numberOfUnits ? "border-red-400" : ""
                }
              />
              {errors.numberOfUnits && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.numberOfUnits}
                </p>
              )}
            </div>

            {/* Unit Price (auto-filled) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unit Price
                <span className="ml-1 text-gray-400 font-normal">
                  (auto)
                </span>
              </label>
              <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-700">
                {form.unitPrice ? (
                  formatPhp(form.unitPrice)
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </div>
            </div>

            {/* Total Amount (auto-calculated) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Total Amount
                <span className="ml-1 text-gray-400 font-normal">
                  (auto)
                </span>
              </label>
              <div
                className={`px-3 py-2 border rounded-md text-sm font-semibold ${
                  form.totalAmount > 0
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                {form.totalAmount > 0
                  ? formatPhp(form.totalAmount)
                  : "—"}
              </div>
            </div>
          </div>

          {/* Auto-calc banner */}
          {form.totalAmount > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-100 text-xs text-indigo-700">
              <Calculator className="size-3.5 flex-shrink-0" />
              <span>
                <strong>{form.numberOfUnits}</strong> unit
                {form.numberOfUnits !== 1 ? "s" : ""} ×{" "}
                <strong>{formatPhp(form.unitPrice)}</strong> ={" "}
                <strong>{formatPhp(form.totalAmount)}</strong>
              </span>
            </div>
          )}

          {/* Date of Payment */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date of Payment{" "}
              <span className="text-red-500">*</span>
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
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
                ).map((s) => (
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
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
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <p className="text-xs text-gray-400">
            Total auto-calculated from model price × units.
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
}: {
  row: PaymentRow;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2.5 rounded-xl">
            <Trash2 className="size-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Delete Entry
            </h3>
            <p className="text-xs text-gray-500">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-5 border border-gray-200 space-y-0.5">
          <p className="text-sm font-medium text-gray-800">
            {row.description}
          </p>
          <p className="text-xs text-gray-500">
            {row.numberOfUnits} unit
            {row.numberOfUnits !== 1 ? "s" : ""} ·{" "}
            {formatPhp(row.totalAmount)}
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
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-3 shadow-sm">
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
      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap bg-gray-50
      ${right ? "text-right" : center ? "text-center" : "text-left"}
      ${sticky ? "sticky right-0 border-l border-gray-200 z-10" : ""}
    `}
    >
      {children}
    </th>
  );
}