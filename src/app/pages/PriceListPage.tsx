import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Save, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

interface PriceItem {
  model: string;
  srp: string;
  dnp: string;
  wsSubsidy: string;
  dnpLessWsSubsidy: string;
  ewt: string;
  poAmount: string;
}

const initialPrices: PriceItem[] = [
  { model: 'APV 1.6 GA MT', srp: '763,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'APV 1.6 GLX MT', srp: '975,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'CELERIO 1.0 GL AGS', srp: '754,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'DZIRE GL CVT - HYBRID', srp: '920,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'DZIRE GLX CVT - HYBRID', srp: '998,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'ERTIGA 1.5 GA MT - HYBRID', srp: '954,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'ERTIGA 1.5 GL MT - HYBRID', srp: '1,093,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'ERTIGA 1.5 GL AT - HYBRID', srp: '1,128,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'ERTIGA 1.5 GLX AT - HYBRID', srp: '1,213,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'FRONX GL AT', srp: '1,059,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'FRONX GLX AT', srp: '1,219,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'FRONX GLX AT - HYBRID (TWO-TONE)', srp: '1,229,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'FRONX SGX AT - HYBRID (TWO-TONE)', srp: '1,299,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 GL MT SS', srp: '1,293,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 GLX AT (MONOTONE) SS', srp: '1,355,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 GLX AT (TWO-TONE) SS', srp: '1,365,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 5DR GL MT', srp: '1,558,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 5DR GLX AT (MONOTONE)', srp: '1,698,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 1.5 5DR GLX AT (TWO-TONE)', srp: '1,708,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 3GLX AT R', srp: '1,331,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 5DR GLX AT R (MONOTONE)', srp: '1,739,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'JIMNY 5DR GLX AT R (TWO-TONE)', srp: '1,749,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'SWIFT 1.2 GL CVT', srp: '989,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'CARRY CAB & CHASSIS', srp: '614,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'CARRY DROPSIDE', srp: '650,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'CARRY CARGO VAN', srp: '705,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'CARRY UTILITY VAN', srp: '754,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: "CARRY LINEMAN'S VEHICLE", srp: '798,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'S-PRESSO 1.0 GL MT', srp: '634,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'S-PRESSO 1.0 GL AGS', srp: '674,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'XL7 1.5 GLX AT - HYBRID MONOTONE', srp: '1,252,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'XL7 1.5 GLX AT - HYBRID (TWO-TONE)', srp: '1,262,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'XL7 1.5 GLX AT - HYBRID BLACK EDITION', srp: '1,254,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
  { model: 'XL7 1.5 GLX AT - HYBRID (TWO-TONE) BLACK EDITION', srp: '1,269,000.00', dnp: '', wsSubsidy: '', dnpLessWsSubsidy: '', ewt: '', poAmount: '' },
];

const PRICE_COLUMNS: { key: keyof PriceItem; label: string }[] = [
  { key: 'srp', label: 'SRP (₱)' },
  { key: 'dnp', label: 'DNP (₱)' },
  { key: 'wsSubsidy', label: 'WS Subsidy (₱)' },
  { key: 'dnpLessWsSubsidy', label: 'DNP Less WS Subsidy (₱)' },
  { key: 'ewt', label: 'EWT (₱)' },
  { key: 'poAmount', label: 'PO Amount (₱)' },
];

const emptyNewItem = (): Omit<PriceItem, 'model'> => ({
  srp: '',
  dnp: '',
  wsSubsidy: '',
  dnpLessWsSubsidy: '',
  ewt: '',
  poAmount: '',
});

export function PriceListPage() {
  const navigate = useNavigate();
  const [prices, setPrices] = useState<PriceItem[]>(initialPrices);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<PriceItem>({ model: '', ...emptyNewItem() });
  const [searchTerm, setSearchTerm] = useState('');

  const handleEdit = (index: number) => setEditingIndex(index);

  const handleSave = (index: number, updated: PriceItem) => {
    const updatedPrices = [...prices];
    updatedPrices[index] = updated;
    setPrices(updatedPrices);
    setEditingIndex(null);
    toast.success('Price updated successfully!');
  };

  const handleAddNew = () => {
    if (!newItem.model || !newItem.srp) {
      toast.error('Model name and SRP are required');
      return;
    }
    setPrices([...prices, { ...newItem }]);
    setNewItem({ model: '', ...emptyNewItem() });
    setIsAddingNew(false);
    toast.success('New unit added successfully!');
  };

  const filteredPrices = prices.filter((item) =>
    item.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Price List Management</h1>
              <p className="text-sm text-gray-500">Manage vehicle pricing information</p>
            </div>
          </div>
          <Button onClick={() => setIsAddingNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="size-4" />
            Add New Unit
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          {/* Search */}
          <div className="mb-6">
            <Input
              placeholder="Search by model name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {/* Add New Form */}
          {isAddingNew && (
            <div className="bg-white rounded-lg border border-blue-200 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Add New Unit</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newItem.model}
                    onChange={(e) => setNewItem((p) => ({ ...p, model: e.target.value }))}
                    placeholder="Enter model name"
                  />
                </div>
                {PRICE_COLUMNS.map((col) => (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {col.label}
                      {col.key === 'srp' && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <Input
                      value={newItem[col.key]}
                      onChange={(e) => setNewItem((p) => ({ ...p, [col.key]: e.target.value }))}
                      placeholder="e.g., 1,250,000.00"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewItem({ model: '', ...emptyNewItem() });
                  }}
                  className="gap-2"
                >
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button onClick={handleAddNew} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="size-4" />
                  Save
                </Button>
              </div>
            </div>
          )}

          {/* Price List Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[240px]">
                      Model
                    </th>
                    {PRICE_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]"
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPrices.map((item, index) => (
                    <PriceRow
                      key={index}
                      item={item}
                      isEditing={editingIndex === index}
                      onEdit={() => handleEdit(index)}
                      onSave={(updated) => handleSave(index, updated)}
                      onCancel={() => setEditingIndex(null)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PriceRow sub-component ───────────────────────────────────────────────────

function PriceRow({
  item,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  item: PriceItem;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updated: PriceItem) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PriceItem>({ ...item });

  // Sync draft when item changes (e.g., after save)
  const setField = (key: keyof PriceItem, val: string) =>
    setDraft((p) => ({ ...p, [key]: val }));

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        {isEditing ? (
          <Input value={draft.model} onChange={(e) => setField('model', e.target.value)} className="h-8" />
        ) : (
          <span className="text-gray-900">{item.model}</span>
        )}
      </td>
      {PRICE_COLUMNS.map((col) => (
        <td key={col.key} className="px-4 py-3">
          {isEditing ? (
            <Input
              value={draft[col.key]}
              onChange={(e) => setField(col.key, e.target.value)}
              className="h-8"
              placeholder="—"
            />
          ) : (
            <span className="text-gray-700">{item[col.key] ? `₱${item[col.key]}` : <span className="text-gray-400">—</span>}</span>
          )}
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
              <X className="size-3" />
              Cancel
            </Button>
            <Button size="sm" onClick={() => onSave(draft)} className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Save className="size-3" />
              Save
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
            <Edit2 className="size-3" />
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}
