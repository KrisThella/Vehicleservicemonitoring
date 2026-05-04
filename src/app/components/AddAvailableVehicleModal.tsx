import { useState, useEffect, useRef } from 'react';
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
import { differenceInDays, format } from 'date-fns';
import { useColors, usePrices, type ColorRecord } from '../../lib/api';
import { CATEGORY_COLORS } from '../data/suzukiModels';

export interface AvailableVehicleEntry {
  id: string;
  model: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  remarks: string;
  csNo: string;
  yearModel: string;
  taggingAccount: string;
  allocationTeam: string;
  dealer: string;
  poNumber: string;
  poAmount: string;
  pullOutDate: string;
  dateTagged: string;
  monthDeclared: string;
  location: string;
  unitAge: number;
  gracePeriod: string;
  status: string;
}

interface AddAvailableVehicleModalProps {
  onClose: () => void;
  onSave: (data: AvailableVehicleEntry) => void;
  initialData?: AvailableVehicleEntry;
  mode?: 'add' | 'edit';
}

export const ALLOCATION_TEAMS = ['TEAM JM', 'TEAM AARON', 'TEAM JAY-R'];

export const AVAILABLE_STATUSES = [
  'AVAILABLE',
  'ON TRACK',
  'FOR ALLOCATION',
  'TAGGED',
  'RESERVED',
  'HELD',
  'SOLD',
];

const EMPTY_FORM: AvailableVehicleEntry = {
  id: '',
  model: '',
  color: '',
  chassisNo: '',
  engineNo: '',
  remarks: '',
  csNo: '',
  yearModel: '',
  taggingAccount: '',
  allocationTeam: '',
  dealer: '',
  poNumber: '',
  poAmount: '',
  pullOutDate: '',
  dateTagged: '',
  monthDeclared: '',
  location: '',
  unitAge: 0,
  gracePeriod: '90',
  status: '',
};

function ColorSelectDropdown({
  value,
  onChange,
  allowedColors,
  colors,
}: {
  value: string;
  onChange: (v: string) => void;
  allowedColors?: string[];
  colors: ColorRecord[];
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  // Calculate fixed position from trigger's bounding rect
  useEffect(() => {
    if (open && triggerRef.current) {
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
    }
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

  const availableColors = allowedColors
    ? colors.filter((c) => allowedColors.includes(c.name))
    : colors;

  const filtered = availableColors
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true, sensitivity: 'base' }));

  const hex = value ? (colors.find((c) => c.name === value)?.hex ?? '#d1d5db') : null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm hover:border-gray-400 dark:hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          {hex ? (
            <>
              <span
                className="inline-block w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-sm"
                style={{ backgroundColor: hex }}
              />
              <span className="truncate text-gray-900 dark:text-gray-100">{value}</span>
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
              className="w-full text-sm px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400"
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-teal-50 dark:hover:bg-gray-700 transition-colors ${value === c.name ? 'bg-teal-50 dark:bg-gray-700 font-medium' : ''}`}
                >
                  <span
                    className="inline-block w-4 h-4 rounded-sm border border-gray-300 dark:border-gray-600 flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate text-gray-900 dark:text-gray-100">{c.name}</span>
                  {value === c.name && <span className="ml-auto text-teal-600 dark:text-teal-400 text-xs">✓</span>}
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

export function AddAvailableVehicleModal({
  onClose,
  onSave,
  initialData,
  mode = 'add',
}: AddAvailableVehicleModalProps) {
  const [form, setForm] = useState<AvailableVehicleEntry>(
    initialData ? { ...initialData } : { ...EMPTY_FORM, id: crypto.randomUUID() }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof AvailableVehicleEntry, string>>>({});
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const { colors } = useColors();
  const { prices } = usePrices();
  const modelCategories = Array.from(
    new Set(prices.map((p) => p.category).filter((c): c is string => Boolean(c)))
  ).sort();

  // Auto-compute unit age from pull out date
  useEffect(() => {
    if (form.pullOutDate) {
      const pullDate = new Date(form.pullOutDate);
      const age = differenceInDays(new Date(), pullDate);
      setForm((prev) => ({ ...prev, unitAge: Math.max(0, age) }));
    } else {
      setForm((prev) => ({ ...prev, unitAge: 0 }));
    }
  }, [form.pullOutDate]);

  const set = (field: keyof AvailableVehicleEntry, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof AvailableVehicleEntry, string>> = {};
    if (!form.model.trim()) e.model = 'Model is required';
    if (!form.chassisNo.trim()) e.chassisNo = 'Chassis No. is required';
    if (!form.engineNo.trim()) e.engineNo = 'Engine No. is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) { toast.error('Please fill in all required fields'); return; }
    onSave(form);
    toast.success(mode === 'edit' ? 'Entry updated successfully!' : 'Vehicle entry added successfully!');
    onClose();
  };

  const ageColor =
    form.unitAge > 90 ? 'bg-red-50 border-red-300 text-red-700' :
    form.unitAge > 60 ? 'bg-orange-50 border-orange-300 text-orange-700' :
    form.unitAge > 30 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
    'bg-green-50 border-green-300 text-green-700';

  const filteredModels = categoryFilter === 'ALL'
    ? prices
    : prices.filter((m) => m.category === categoryFilter);
  const sortedModelCategories = modelCategories
    .slice()
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));
  const sortedFilteredModels = filteredModels
    .slice()
    .sort((a, b) => a.model.localeCompare(b.model, 'en', { numeric: true, sensitivity: 'base' }));

  // Get the category of the currently selected model
  const selectedModelCategory = form.model
    ? prices.find((m) => m.model === form.model)?.category
    : undefined;

  // Get allowed colors based on selected model's category
  const allowedColors = selectedModelCategory
    ? CATEGORY_COLORS[selectedModelCategory]
    : undefined;

  const isEdit = mode === 'edit';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl mx-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 rounded-t-2xl ${isEdit ? 'bg-blue-50 dark:bg-blue-950' : 'bg-teal-50 dark:bg-teal-950'}`}>
          <div>
            <h2 className={`font-semibold ${isEdit ? 'text-blue-900 dark:text-blue-100' : 'text-teal-900 dark:text-teal-100'}`}>
              {isEdit ? '✏️ Edit Vehicle Entry' : '＋ Add Available Vehicle'}
            </h2>
            <p className={`text-xs mt-0.5 ${isEdit ? 'text-blue-600 dark:text-blue-300' : 'text-teal-600 dark:text-teal-300'}`}>
              Fields marked <span className="text-red-500">*</span> are required
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${isEdit ? 'hover:bg-blue-100 dark:hover:bg-blue-900' : 'hover:bg-teal-100 dark:hover:bg-teal-900'}`}
          >
            <X className={`size-5 ${isEdit ? 'text-blue-700 dark:text-blue-400' : 'text-teal-700 dark:text-teal-400'}`} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 dark:bg-gray-900">

          {/* Section: Unit Info */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unit Information</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Model */}
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-2 py-2 text-xs text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 flex-shrink-0"
                  >
                    <option value="ALL">All</option>
                    {sortedModelCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <Select
                    value={form.model}
                    onValueChange={(v) => set('model', v)}
                  >
                    <SelectTrigger className={`flex-1 ${errors.model ? 'border-red-400' : ''}`}>
                      <SelectValue placeholder="Select model…" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[280px]">
                      {sortedFilteredModels.map((m) => (
                        <SelectItem key={m.id} value={m.model}>
                          <span className="flex items-center justify-between gap-4 w-full">
                            <span>{m.model}</span>
                            <span className="text-gray-400 text-xs">
                              {m.srp ? `₱${m.srp}` : '-'}
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
              </div>

              {/* Color */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
                <ColorSelectDropdown
                  value={form.color}
                  onChange={(v) => set('color', v)}
                  allowedColors={allowedColors}
                  colors={colors}
                />
              </div>

              {/* Year Model */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Year Model</label>
                <Input
                  value={form.yearModel}
                  onChange={(e) => set('yearModel', e.target.value)}
                  placeholder="e.g. 2026"
                  type="number"
                />
              </div>

              {/* Chassis No. */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Chassis No. <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.chassisNo}
                  onChange={(e) => set('chassisNo', e.target.value)}
                  placeholder="e.g. MAFHA21SXM7100221"
                  className={`font-mono text-xs ${errors.chassisNo ? 'border-red-400' : ''}`}
                />
                {errors.chassisNo && <p className="text-xs text-red-500 mt-1">{errors.chassisNo}</p>}
              </div>

              {/* Engine No. */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Engine No. <span className="text-red-500">*</span>
                </label>
                <Input
                  value={form.engineNo}
                  onChange={(e) => set('engineNo', e.target.value)}
                  placeholder="e.g. G15B-ZA1002211"
                  className={`font-mono text-xs ${errors.engineNo ? 'border-red-400' : ''}`}
                />
                {errors.engineNo && <p className="text-xs text-red-500 mt-1">{errors.engineNo}</p>}
              </div>

              {/* CS No. */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">CS No.</label>
                <Input
                  value={form.csNo}
                  onChange={(e) => set('csNo', e.target.value)}
                  placeholder="e.g. UE00112"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <Input
                  value={form.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. TSMPC SHAW – SHOWROOM"
                />
              </div>
            </div>
          </div>

          {/* Section: Allocation */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Allocation & Sales</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Allocation Team */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Allocation Team</label>
                <Select value={form.allocationTeam} onValueChange={(v) => set('allocationTeam', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALLOCATION_TEAMS
                      .slice()
                      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tagging Account */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Tagging Account</label>
                <Input
                  value={form.taggingAccount}
                  onChange={(e) => set('taggingAccount', e.target.value)}
                  placeholder="e.g. LICA ACCOUNT"
                />
              </div>

              {/* Dealer */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dealer</label>
                <Input
                  value={form.dealer}
                  onChange={(e) => set('dealer', e.target.value)}
                  placeholder="e.g. TSMPC SHAW"
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">PO Number</label>
                <Input
                  value={form.poNumber}
                  onChange={(e) => set('poNumber', e.target.value)}
                  placeholder="e.g. PO30112"
                />
              </div>

              {/* PO Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">PO Amount</label>
                <Input
                  value={form.poAmount}
                  onChange={(e) => set('poAmount', e.target.value)}
                  placeholder="e.g. 880,000"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <Select value={form.status} onValueChange={(v) => set('status', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_STATUSES
                      .slice()
                      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
                      .map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Section: Dates & Age */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates & Unit Age</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pull Out Date */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Pull Out Date
                  <span className="ml-1 text-gray-400 font-normal">(used for age)</span>
                </label>
                <div className="relative">
                  <Input
                    type="date"
                    value={form.pullOutDate}
                    onChange={(e) => set('pullOutDate', e.target.value)}
                    className="pl-9"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Unit Age (auto) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Unit Age
                  <span className="ml-1 text-gray-400 font-normal">(auto-computed)</span>
                </label>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium ${ageColor} dark:bg-gray-800`}>
                  <CalendarIcon className="size-4 flex-shrink-0" />
                  {form.pullOutDate
                    ? `${form.unitAge} day${form.unitAge !== 1 ? 's' : ''} since pull-out`
                    : '— set Pull Out Date first'}
                </div>
              </div>

              {/* Date Tagged */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date Tagged</label>
                <div className="relative">
                  <Input
                    type="date"
                    value={form.dateTagged}
                    onChange={(e) => set('dateTagged', e.target.value)}
                    className="pl-9"
                  />
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Month Declared */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Month Declared</label>
                <Input
                  type="month"
                  value={form.monthDeclared}
                  onChange={(e) => set('monthDeclared', e.target.value)}
                />
              </div>

              {/* Grace Period */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period (days)</label>
                <Input
                  value={form.gracePeriod}
                  onChange={(e) => set('gracePeriod', e.target.value)}
                  placeholder="e.g. 90"
                  type="number"
                />
              </div>
            </div>
          </div>

          {/* Section: Remarks */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remarks</span>
              <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800" />
            </div>
            <Input
              value={form.remarks}
              onChange={(e) => set('remarks', e.target.value)}
              placeholder="Additional notes about this unit..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            {isEdit ? `Editing entry ID: ${form.id.slice(0, 8)}…` : 'New entry will appear in the table immediately.'}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-gray-200">Cancel</Button>
            <Button
              onClick={handleSubmit}
              className={isEdit ? 'bg-blue-600 hover:bg-blue-700' : 'bg-teal-600 hover:bg-teal-700'}
            >
              {isEdit ? 'Save Changes' : 'Add Entry'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}