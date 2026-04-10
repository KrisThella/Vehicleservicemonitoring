import { useState, useEffect } from 'react';
import { X, CalendarIcon } from 'lucide-react';
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
import { differenceInDays } from 'date-fns';
import { colorHexMap } from './utils/colorMapping';

interface AddAvailableVehicleModalProps {
  onClose: () => void;
  onSave: (data: AvailableVehicleEntry) => void;
}

export interface AvailableVehicleEntry {
  model: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  remarks: string;
  csNo: string;
  yearModel: string;
  taggingAccount: string;
  allocationTeam: string;
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

const ALLOCATION_TEAMS = [
  'TEAM JM',
  'TEAM AARON',
  'TEAM JAY-R',
];

const STATUSES = [
  'ON TRACK',
  'AVAILABLE',
  'HELD',
  'FOR ALLOCATION',
  'TAGGED',
  'RESERVED',
];

export function AddAvailableVehicleModal({ onClose, onSave }: AddAvailableVehicleModalProps) {
  const [form, setForm] = useState<AvailableVehicleEntry>({
    model: '',
    color: '',
    chassisNo: '',
    engineNo: '',
    remarks: '',
    csNo: '',
    yearModel: '',
    taggingAccount: '',
    allocationTeam: '',
    poNumber: '',
    poAmount: '',
    pullOutDate: '',
    dateTagged: '',
    monthDeclared: '',
    location: '',
    unitAge: 0,
    gracePeriod: '',
    status: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof AvailableVehicleEntry, string>>>({});

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
    const newErrors: Partial<Record<keyof AvailableVehicleEntry, string>> = {};
    if (!form.model.trim()) newErrors.model = 'Model is required';
    if (!form.chassisNo.trim()) newErrors.chassisNo = 'Chassis No. is required';
    if (!form.engineNo.trim()) newErrors.engineNo = 'Engine No. is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSave(form);
    toast.success('Available vehicle entry added successfully!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-teal-50 rounded-t-xl">
          <div>
            <h2 className="font-semibold text-teal-900">Add Available Vehicle</h2>
            <p className="text-xs text-teal-600 mt-0.5">
              Fields marked with <span className="text-red-500">*</span> are required
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <X className="size-5 text-teal-700" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Model */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Model <span className="text-red-500">*</span>
              </label>
              <Input
                value={form.model}
                onChange={(e) => set('model', e.target.value)}
                placeholder="e.g. ERTIGA 1.5 GL MT"
                className={errors.model ? 'border-red-400 focus:ring-red-400' : ''}
              />
              {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <Select value={form.color} onValueChange={(v) => set('color', v)}>
                <SelectTrigger>
                  {form.color ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: colorHexMap[form.color] ?? '#d1d5db' }}
                      />
                      {form.color}
                    </span>
                  ) : (
                    <SelectValue placeholder="Select color" />
                  )}
                </SelectTrigger>
                <SelectContent className="max-h-[260px]">
                  {Object.entries(colorHexMap).map(([name, hex]) => (
                    <SelectItem key={name} value={name}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block w-3 h-3 rounded-sm border border-gray-300 flex-shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        {name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CS No. */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CS No.</label>
              <Input
                value={form.csNo}
                onChange={(e) => set('csNo', e.target.value)}
                placeholder="e.g. UE00112"
              />
            </div>

            {/* Chassis No. */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
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
              <label className="block text-xs font-medium text-gray-700 mb-1">
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

            {/* Year Model */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Year Model</label>
              <Input
                value={form.yearModel}
                onChange={(e) => set('yearModel', e.target.value)}
                placeholder="e.g. 2026"
                type="number"
              />
            </div>

            {/* Tagging Account */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Tagging Account</label>
              <Input
                value={form.taggingAccount}
                onChange={(e) => set('taggingAccount', e.target.value)}
                placeholder="e.g. LICA ACCOUNT"
              />
            </div>

            {/* Allocation Team */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Allocation Team</label>
              <Select value={form.allocationTeam} onValueChange={(v) => set('allocationTeam', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {ALLOCATION_TEAMS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* PO Number */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Number</label>
              <Input
                value={form.poNumber}
                onChange={(e) => set('poNumber', e.target.value)}
                placeholder="e.g. PO30112"
              />
            </div>

            {/* PO Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">PO Amount</label>
              <Input
                value={form.poAmount}
                onChange={(e) => set('poAmount', e.target.value)}
                placeholder="e.g. 880000"
              />
            </div>

            {/* Pull Out Date */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pull Out Date
              </label>
              <Input
                type="date"
                value={form.pullOutDate}
                onChange={(e) => set('pullOutDate', e.target.value)}
              />
            </div>

            {/* Date Tagged */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Tagged</label>
              <Input
                type="date"
                value={form.dateTagged}
                onChange={(e) => set('dateTagged', e.target.value)}
              />
            </div>

            {/* Month Declared */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Month Declared</label>
              <Input
                type="month"
                value={form.monthDeclared}
                onChange={(e) => set('monthDeclared', e.target.value)}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
              <Input
                value={form.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="e.g. TSMPC SHAW – SHOWROOM"
              />
            </div>

            {/* Unit Age (auto-computed) */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Unit Age
                <span className="ml-1 text-gray-400 font-normal">(auto-computed)</span>
              </label>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                form.unitAge > 60 ? 'bg-red-50 border-red-300 text-red-700' :
                form.unitAge > 30 ? 'bg-yellow-50 border-yellow-300 text-yellow-700' :
                'bg-green-50 border-green-300 text-green-700'
              }`}>
                <CalendarIcon className="size-4 flex-shrink-0" />
                <span className="font-medium">
                  {form.pullOutDate ? `${form.unitAge} day${form.unitAge !== 1 ? 's' : ''}` : '— (set Pull Out Date)'}
                </span>
              </div>
            </div>

            {/* Grace Period */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Grace Period (days)</label>
              <Input
                value={form.gracePeriod}
                onChange={(e) => set('gracePeriod', e.target.value)}
                placeholder="e.g. 90"
                type="number"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <Input
                value={form.remarks}
                onChange={(e) => set('remarks', e.target.value)}
                placeholder="Additional notes..."
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            className="bg-teal-600 hover:bg-teal-700"
          >
            Add Entry
          </Button>
        </div>
      </div>
    </div>
  );
}
