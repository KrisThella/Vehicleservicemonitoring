import { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, CalendarIcon, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';
import {
  useColors,
  useGeneralManagers,
  usePrices,
  useSalesConsultants,
  type ColorRecord,
} from '../../lib/api';
import { GeneralManagerSelect, SalesConsultantSelect } from './TeamSelect';
import { SUZUKI_MODELS } from '../data/suzukiModels';

export interface InTransitEntry {
  model: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  pullOutLocation: string;
  csNo: string;
  yearModel: string;
  clientName: string;
  dealer: string;
  generalManager: string;
  salesConsultant: string;
  poNumber: string;
  poAmount: string;
  pullOutDate: string;
  declaredMonth: string;
  dpReservation: string;
  status: string;
  targetRelease: string;
  remarks: string;
}

interface AddInTransitModalProps {
  onClose: () => void;
  onSave: (data: InTransitEntry) => void;
}

const STATUSES = [
  'IN TRANSIT',
  'ARRIVED – FOR INSPECTION',
  'PENDING RELEASE',
  'RELEASED',
  'DELAYED',
];

const EMPTY_FORM: InTransitEntry = {
  model: '',
  color: '',
  chassisNo: '',
  engineNo: '',
  pullOutLocation: '',
  csNo: '',
  yearModel: '',
  clientName: '',
  dealer: 'BIÑAN',
  generalManager: '',
  salesConsultant: '',
  poNumber: '',
  poAmount: '',
  pullOutDate: '',
  declaredMonth: '',
  dpReservation: '',
  status: '',
  targetRelease: '',
  remarks: '',
};

// ── Color Dropdown with search ─────────────────────────────────────────────

function ColorSelectDropdown({
  value,
  onChange,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  colors: ColorRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const computeDropdownStyle = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropHeight = 260;

    if (spaceBelow >= dropHeight || spaceBelow >= spaceAbove) {
      setDropdownStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    } else {
      setDropdownStyle({
        position: 'fixed',
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
  };

  // Calculate fixed position from trigger's bounding rect
  useEffect(() => {
    if (open) computeDropdownStyle();
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on scroll (only parent, not dropdown)
  useEffect(() => {
    if (!open || !dropdownRef.current) return;
    const handler = (e: Event) => {
      // Don't close if scrolling within the dropdown itself
      if (!dropdownRef.current || !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('scroll', handler, true);
    return () => document.removeEventListener('scroll', handler, true);
  }, [open]);

  const filtered = colors
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }));

  const hex = value ? (colors.find((c) => c.name === value)?.hex ?? '#d1d5db') : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) computeDropdownStyle();
          setOpen((o) => !o);
        }}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          {hex ? (
            <>
              <span
                className="inline-block w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <span className="truncate text-gray-800 dark:text-gray-200">{value}</span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Select color…</span>
          )}
        </span>
        <ChevronDown className={`size-4 text-gray-400 dark:text-gray-600 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl overflow-hidden"
        >
          <div className="p-2 border-b border-gray-100 dark:border-gray-700">
            <input
              autoFocus
              className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Search color…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No match</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { onChange(c.name); setOpen(false); setSearch(''); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${value === c.name ? 'bg-blue-50 dark:bg-gray-700 font-medium' : ''}`}
                >
                  <span
                    className="inline-block w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate text-gray-900 dark:text-gray-100">{c.name}</span>
                  {value === c.name && <span className="ml-auto text-blue-600 dark:text-blue-400 text-xs">✓</span>}
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────

export function AddInTransitModal({ onClose, onSave }: AddInTransitModalProps) {
  const [form, setForm] = useState<InTransitEntry>({ ...EMPTY_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof InTransitEntry, string>>>({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const { colors } = useColors();
  const { prices } = usePrices();
  const { managers } = useGeneralManagers();
  const { consultants } = useSalesConsultants();

  const lastAutoFilledPoAmountRef = useRef<string>('');

  const set = (field: keyof InTransitEntry, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const selectedManagerId = useMemo(() => {
    const selected = managers.find((m) => m.name === form.generalManager);
    return selected?.id ?? null;
  }, [managers, form.generalManager]);

  const filteredConsultantNames = useMemo(() => {
    const list = selectedManagerId
      ? consultants.filter((c) => c.manager_id === selectedManagerId)
      : consultants;
    return list.map((c) => c.name);
  }, [consultants, selectedManagerId]);

  useEffect(() => {
    if (form.salesConsultant && !filteredConsultantNames.includes(form.salesConsultant)) {
      set('salesConsultant', '');
    }
  }, [form.salesConsultant, filteredConsultantNames, set]);

  const validate = (): boolean => {
    const e: Partial<Record<keyof InTransitEntry, string>> = {};
    if (!form.model)       e.model  = 'Model is required';
    if (!form.dealer)      e.dealer = 'Dealer is required';
    if (!form.status)      e.status = 'Status is required';
    if (!form.pullOutDate) e.pullOutDate = 'Pull Out Date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await onSave(form);
      toast.success('In Transit unit added successfully!');
      onClose();
    } catch (error: any) {
      toast.error(`Failed to add In Transit unit: ${error?.message ?? error}`);
    }
  };

  useEffect(() => {
    if (!form.model) return;
    const matched = prices.find((p) => p.model === form.model);
    if (!matched) return;
    const nextPo = (matched.po_amount ?? '').trim();
    if (!nextPo || nextPo === '-') return;

    setForm((prev) => {
      const current = (prev.poAmount ?? '').trim();
      if (!current || current === lastAutoFilledPoAmountRef.current) {
        lastAutoFilledPoAmountRef.current = nextPo;
        return { ...prev, poAmount: nextPo };
      }
      return prev;
    });
  }, [form.model, prices]);

  const modelOptions = useMemo(() => {
    if (prices.length > 0) {
      const byModel = new Map<string, { name: string; category: string; srp: string }>();
      for (const p of prices) {
        const modelName = (p.model ?? '').trim();
        if (!modelName) continue;
        if (!byModel.has(modelName)) {
          byModel.set(modelName, {
            name: modelName,
            category: (p.category ?? '').trim() || 'OTHER',
            srp: (p.srp ?? '').trim(),
          });
        }
      }
      return Array.from(byModel.values());
    }

    // Fallback for brand new DBs / dev mode before Price List is populated
    return SUZUKI_MODELS.map((m) => ({
      name: m.name,
      category: m.category,
      srp: String(m.basePrice),
    }));
  }, [prices]);

  const sortedModelCategories = useMemo(() => {
    const cats = Array.from(new Set(modelOptions.map((m) => m.category).filter(Boolean)));
    return cats.sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));
  }, [modelOptions]);

  useEffect(() => {
    if (categoryFilter !== 'ALL' && !sortedModelCategories.includes(categoryFilter)) {
      setCategoryFilter('ALL');
    }
  }, [categoryFilter, sortedModelCategories]);

  const sortedFilteredModels = useMemo(() => {
    const filtered = categoryFilter === 'ALL'
      ? modelOptions
      : modelOptions.filter((m) => m.category === categoryFilter);
    return filtered
      .slice()
      .sort((a, b) => (a.name ?? '').localeCompare((b.name ?? ''), 'en', { numeric: true, sensitivity: 'base' }));
  }, [modelOptions, categoryFilter]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-blue-50 dark:bg-blue-950 rounded-t-2xl">
          <div>
            <h2 className="font-semibold text-blue-900 dark:text-blue-100">Add In-Transit Unit</h2>
            <p className="text-xs text-blue-600 dark:text-blue-300 mt-0.5">
              Fields marked <span className="text-red-500">*</span> are required
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
          >
            <X className="size-5 text-blue-700 dark:text-blue-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 dark:bg-gray-900">

          {/* ── Section 1: Unit Details ─────────────────────────────── */}
          <div>
            <SectionLabel>Unit Details</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Model */}
              <div className="md:col-span-2">
                <FieldLabel required>Model</FieldLabel>
                <div className="flex gap-2">
                  {/* Category filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 flex-shrink-0"
                  >
                    <option value="ALL">All</option>
                    {sortedModelCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Select value={form.model} onValueChange={(v) => set('model', v)}>
                    <SelectTrigger className={`flex-1 ${errors.model ? 'border-red-400' : ''}`}>
                      <SelectValue placeholder="Select model…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                        {sortedFilteredModels.map((m) => (
                          <SelectItem key={m.name} value={m.name}>
                          <span className="flex items-center justify-between gap-4 w-full">
                            <span>{m.name}</span>
                            <span className="text-gray-400 text-xs">
                                {m.srp ? `₱${m.srp}` : '—'}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.model && <ErrMsg>{errors.model}</ErrMsg>}
              </div>

              {/* Color */}
              <div>
                <FieldLabel>Color</FieldLabel>
                <ColorSelectDropdown value={form.color} onChange={(v) => set('color', v)} colors={colors} />
              </div>

              {/* Year Model */}
              <div>
                <FieldLabel>Year Model</FieldLabel>
                <Input
                  type="number"
                  value={form.yearModel}
                  onChange={(e) => set('yearModel', e.target.value)}
                  placeholder="e.g. 2026"
                />
              </div>

              {/* CS No. */}
              <div>
                <FieldLabel>CS No.</FieldLabel>
                <Input
                  value={form.csNo}
                  onChange={(e) => set('csNo', e.target.value)}
                  placeholder="e.g. UE00112"
                />
              </div>

              {/* Chassis No. */}
              <div>
                <FieldLabel>Chassis No.</FieldLabel>
                <Input
                  value={form.chassisNo}
                  onChange={(e) => set('chassisNo', e.target.value)}
                  placeholder="e.g. MAFHA21SXM7100221"
                  className="font-mono text-xs"
                />
              </div>

              {/* Engine No. */}
              <div>
                <FieldLabel>Engine No.</FieldLabel>
                <Input
                  value={form.engineNo}
                  onChange={(e) => set('engineNo', e.target.value)}
                  placeholder="e.g. G15B-ZA1002211"
                  className="font-mono text-xs"
                />
              </div>

            </div>
          </div>

          {/* ── Section 2: Dealer & Client ────────────────────────────── */}
          <div>
            <SectionLabel>Dealer & Client</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Dealer */}
              <div>
                <FieldLabel required>Dealer</FieldLabel>
                <Input
                  value={form.dealer}
                  onChange={(e) => set('dealer', e.target.value)}
                  placeholder="e.g. BIÑAN"
                  className={errors.dealer ? 'border-red-400' : ''}
                />
                {errors.dealer && <ErrMsg>{errors.dealer}</ErrMsg>}
              </div>

              {/* Client Name */}
              <div>
                <FieldLabel>Client Name</FieldLabel>
                <Input
                  value={form.clientName}
                  onChange={(e) => set('clientName', e.target.value)}
                  placeholder="e.g. MR. JUAN DELA CRUZ"
                />
              </div>

              {/* General Manager */}
              <div>
                <FieldLabel>General Manager</FieldLabel>
                <GeneralManagerSelect
                  value={form.generalManager}
                  onChange={(value) => set('generalManager', value)}
                />
              </div>

              {/* Sales Consultant */}
              <div>
                <FieldLabel>Sales Consultant</FieldLabel>
                <SalesConsultantSelect
                  value={form.salesConsultant}
                  onChange={(value) => set('salesConsultant', value)}
                  managerId={selectedManagerId}
                />
              </div>

              {/* PO Number */}
              <div>
                <FieldLabel>PO Number</FieldLabel>
                <Input
                  value={form.poNumber}
                  onChange={(e) => set('poNumber', e.target.value)}
                  placeholder="e.g. PO30112"
                />
              </div>

              {/* PO Amount */}
              <div>
                <FieldLabel>PO Amount (₱)</FieldLabel>
                <Input
                  value={form.poAmount}
                  onChange={(e) => set('poAmount', e.target.value)}
                  placeholder="e.g. 880,000"
                />
              </div>

              {/* DP / Reservation */}
              <div>
                <FieldLabel>DP / Reservation</FieldLabel>
                <Input
                  value={form.dpReservation}
                  onChange={(e) => set('dpReservation', e.target.value)}
                  placeholder="e.g. ₱88,000"
                />
              </div>

            </div>
          </div>

          {/* ── Section 3: Location & Status ─────────────────────────── */}
          <div>
            <SectionLabel>Location & Status</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Status */}
              <div>
                <FieldLabel required>Status</FieldLabel>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger className={errors.status ? 'border-red-400' : ''}>
                    <SelectValue placeholder="Select status…" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES
                      .slice()
                      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && <ErrMsg>{errors.status}</ErrMsg>}
              </div>

              {/* Pull Out Location */}
              <div>
                <FieldLabel>Pull Out Location</FieldLabel>
                <Input
                  value={form.pullOutLocation}
                  onChange={(e) => set('pullOutLocation', e.target.value)}
                  placeholder="e.g. SPH LAGUNA WAREHOUSE"
                />
              </div>

            </div>
          </div>

          {/* ── Section 4: Dates ──────────────────────────────────────── */}
          <div>
            <SectionLabel>Dates</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Pull Out Date */}
              <div>
                <FieldLabel required>Pull Out Date</FieldLabel>
                <div className="relative">
                  <Input
                    type="date"
                    value={form.pullOutDate}
                    onChange={(e) => set('pullOutDate', e.target.value)}
                    className={`pl-9 ${errors.pullOutDate ? 'border-red-400' : ''}`}
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.pullOutDate && <ErrMsg>{errors.pullOutDate}</ErrMsg>}
              </div>

              {/* Target Release */}
              <div>
                <FieldLabel>Target Release Date</FieldLabel>
                <div className="relative">
                  <Input
                    type="date"
                    value={form.targetRelease}
                    onChange={(e) => set('targetRelease', e.target.value)}
                    className="pl-9"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Declared Month */}
              <div>
                <FieldLabel>Declared Month</FieldLabel>
                <Input
                  type="month"
                  value={form.declaredMonth}
                  onChange={(e) => set('declaredMonth', e.target.value)}
                />
              </div>

            </div>
          </div>

          {/* ── Section 5: Remarks ────────────────────────��──────────── */}
          <div>
            <SectionLabel>Remarks</SectionLabel>
            <Input
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
              placeholder="Additional notes about this transit unit…"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <p className="text-xs text-gray-400 dark:text-gray-500">New unit will appear in the In-Transit table immediately.</p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="dark:bg-gray-900 dark:border-gray-600 dark:hover:bg-gray-800 dark:text-gray-200">Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700">
              Add Unit
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{children}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function ErrMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500 mt-1">{children}</p>;
}