import { useState } from 'react';
import { X } from 'lucide-react';
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
import { colorHexMap } from './utils/colorMapping';

interface AddInTransitModalProps {
  onClose: () => void;
  onSave: (data: InTransitEntry) => void;
}

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
  poNumber: string;
  poAmount: string;
  pullOutDate: string;
  colorCode: string;
  declaredMonth: string;
  currentLocation: string;
  dpReservation: string;
  status: string;
  targetRelease: string;
  remarks: string;
}

const DEALERS = [
  'TEAM JM',
  'TEAM AARON',
  'TEAM JAY-R',
];

const STATUSES = [
  'IN TRANSIT',
  'ARRIVED – FOR INSPECTION',
  'PENDING RELEASE',
  'RELEASED',
  'DELAYED',
];

export function AddInTransitModal({ onClose, onSave }: AddInTransitModalProps) {
  const [form, setForm] = useState<InTransitEntry>({
    model: '',
    color: '',
    chassisNo: '',
    engineNo: '',
    pullOutLocation: '',
    csNo: '',
    yearModel: '',
    clientName: '',
    dealer: '',
    poNumber: '',
    poAmount: '',
    pullOutDate: '',
    colorCode: '',
    declaredMonth: '',
    currentLocation: '',
    dpReservation: '',
    status: '',
    targetRelease: '',
    remarks: '',
  });

  const set = (field: keyof InTransitEntry, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!form.model.trim()) {
      toast.error('Model is required');
      return;
    }
    onSave(form);
    toast.success('In Transit entry added successfully!');
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-blue-50 rounded-t-xl">
          <div>
            <h2 className="font-semibold text-blue-900">Add In Transit Unit</h2>
            <p className="text-xs text-blue-600 mt-0.5">
              Fill in the details for the new transit entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <X className="size-5 text-blue-700" />
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
              />
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

            {/* Color Code */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Color Code</label>
              <Input
                value={form.colorCode}
                onChange={(e) => set('colorCode', e.target.value)}
                placeholder="e.g. ZMC"
              />
            </div>

            {/* Chassis No. */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Chassis No.</label>
              <Input
                value={form.chassisNo}
                onChange={(e) => set('chassisNo', e.target.value)}
                placeholder="e.g. MAFHA21SXM7100221"
                className="font-mono text-xs"
              />
            </div>

            {/* Engine No. */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Engine No.</label>
              <Input
                value={form.engineNo}
                onChange={(e) => set('engineNo', e.target.value)}
                placeholder="e.g. G15B-ZA1002211"
                className="font-mono text-xs"
              />
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

            {/* Client Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Client Name</label>
              <Input
                value={form.clientName}
                onChange={(e) => set('clientName', e.target.value)}
                placeholder="e.g. MR. JUAN DELA CRUZ"
              />
            </div>

            {/* Dealer */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dealer</label>
              <Select value={form.dealer} onValueChange={(v) => set('dealer', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dealer" />
                </SelectTrigger>
                <SelectContent>
                  {DEALERS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pull Out Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pull Out Location</label>
              <Input
                value={form.pullOutLocation}
                onChange={(e) => set('pullOutLocation', e.target.value)}
                placeholder="e.g. SPH LAGUNA WAREHOUSE"
              />
            </div>

            {/* Current Location */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Current Location</label>
              <Input
                value={form.currentLocation}
                onChange={(e) => set('currentLocation', e.target.value)}
                placeholder="e.g. EN ROUTE – SLEX"
              />
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
              <label className="block text-xs font-medium text-gray-700 mb-1">Pull Out Date</label>
              <Input
                type="date"
                value={form.pullOutDate}
                onChange={(e) => set('pullOutDate', e.target.value)}
              />
            </div>

            {/* Declared Month */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Declared Month</label>
              <Input
                type="month"
                value={form.declaredMonth}
                onChange={(e) => set('declaredMonth', e.target.value)}
              />
            </div>

            {/* DP / Reservation */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">DP / Reservation</label>
              <Input
                value={form.dpReservation}
                onChange={(e) => set('dpReservation', e.target.value)}
                placeholder="e.g. ₱88,000"
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

            {/* Target Release */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Release</label>
              <Input
                type="date"
                value={form.targetRelease}
                onChange={(e) => set('targetRelease', e.target.value)}
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <Input
                value={form.remarks}
                onChange={(e) => set('remarks', e.target.value)}
                placeholder="Additional notes about this transit unit..."
              />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add Unit
          </Button>
        </div>
      </div>
    </div>
  );
}
