import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { usePrices, PriceRecord } from '../../lib/api';

const PRICE_COLUMNS: { key: keyof Omit<PriceRecord, 'id' | 'category' | 'model'>; label: string }[] = [
  { key: 'srp', label: 'SRP (₱)' },
  { key: 'dnp', label: 'DNP (₱)' },
  { key: 'ws_subsidy', label: 'WS Subsidy (₱)' },
  { key: 'dnp_less_ws_subsidy', label: 'DNP Less WS Subsidy (₱)' },
  { key: 'ewt', label: 'EWT (₱)' },
  { key: 'po_amount', label: 'PO Amount (₱)' },
];

const DEFAULT_CATEGORIES = [
  'APV', 'CARRY', 'CELERIO', 'DZIRE', 'ERTIGA', 'FRONX',
  'JIMNY', 'S-PRESSO', 'SWIFT', 'XL7', 'OTHER',
];

const blankItem = (): Omit<PriceRecord, 'id'> => ({
  category: '',
  model: '',
  srp: '',
  dnp: '',
  ws_subsidy: '',
  dnp_less_ws_subsidy: '',
  ewt: '',
  po_amount: '',
});

export function PriceListPage() {
  const navigate = useNavigate();
  const { prices, loading, addPrice, updatePrice, removePrice } = usePrices();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newItem, setNewItem] = useState<Omit<PriceRecord, 'id'>>(blankItem());
  const [searchTerm, setSearchTerm] = useState('');

  const categoryOptions = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...prices.map((p) => p.category)])
  ).sort();

  const handleAdd = async () => {
    if (!newItem.category || !newItem.model || !newItem.srp) {
      toast.error('Category, Model and SRP are required');
      return;
    }
    try {
      await addPrice(newItem);
      setNewItem(blankItem());
      setIsAddingNew(false);
      toast.success('New unit added');
    } catch (e: any) { toast.error(e.message); }
  };

  const filteredPrices = prices.filter((item) => {
    const q = searchTerm.toLowerCase();
    return item.model.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
  });

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
              <ArrowLeft className="size-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Price List Management</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage vehicle pricing information</p>
            </div>
          </div>
          <Button onClick={() => setIsAddingNew(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="size-4" />
            Add New Unit
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-full mx-auto">
          <div className="mb-6">
            <Input
              placeholder="Search by model or category…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>

          {isAddingNew && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-blue-900 p-6 mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Add New Unit</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select value={newItem.category} onValueChange={(v) => setNewItem((p) => ({ ...p, category: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Model Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={newItem.model}
                    onChange={(e) => setNewItem((p) => ({ ...p, model: e.target.value }))}
                    placeholder="e.g., SWIFT 1.2 GL CVT"
                  />
                </div>
                {PRICE_COLUMNS.map((col) => (
                  <div key={col.key}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {col.label}{col.key === 'srp' && <span className="text-red-500 ml-1">*</span>}
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
                <Button variant="outline" onClick={() => { setIsAddingNew(false); setNewItem(blankItem()); }} className="gap-2">
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button onClick={handleAdd} className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Save className="size-4" />
                  Save
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[240px]">Model</th>
                    {PRICE_COLUMNS.map((col) => (
                      <th key={col.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase min-w-[140px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {loading && (
                    <tr><td colSpan={PRICE_COLUMNS.length + 3} className="px-4 py-12 text-center text-sm text-gray-500">Loading…</td></tr>
                  )}
                  {!loading && filteredPrices.map((item) => (
                    <PriceRow
                      key={item.id}
                      item={item}
                      categories={categoryOptions}
                      isEditing={editingId === item.id}
                      onEdit={() => setEditingId(item.id)}
                      onCancel={() => setEditingId(null)}
                      onSave={async (updated) => {
                        try {
                          await updatePrice(item.id, updated);
                          setEditingId(null);
                          toast.success('Price updated');
                        } catch (e: any) { toast.error(e.message); }
                      }}
                      onDelete={async () => {
                        if (!confirm(`Delete "${item.model}"?`)) return;
                        try {
                          await removePrice(item.id);
                          toast.success('Deleted');
                        } catch (e: any) { toast.error(e.message); }
                      }}
                    />
                  ))}
                  {!loading && filteredPrices.length === 0 && (
                    <tr><td colSpan={PRICE_COLUMNS.length + 3} className="px-4 py-12 text-center text-sm text-gray-500">No prices match.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PriceRow({
  item, categories, isEditing, onEdit, onSave, onCancel, onDelete,
}: {
  item: PriceRecord;
  categories: string[];
  isEditing: boolean;
  onEdit: () => void;
  onSave: (updated: PriceRecord) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [draft, setDraft] = useState<PriceRecord>({ ...item });
  const setField = (key: keyof PriceRecord, val: string) => setDraft((p) => ({ ...p, [key]: val }));

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="px-4 py-3">
        {isEditing ? (
          <Select value={draft.category} onValueChange={(v) => setField('category', v)}>
            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-gray-700 dark:text-gray-300 text-xs font-medium uppercase">{item.category}</span>
        )}
      </td>
      <td className="px-4 py-3">
        {isEditing ? (
          <Input value={draft.model} onChange={(e) => setField('model', e.target.value)} className="h-8" />
        ) : (
          <span className="text-gray-900 dark:text-gray-100">{item.model}</span>
        )}
      </td>
      {PRICE_COLUMNS.map((col) => (
        <td key={col.key} className="px-4 py-3">
          {isEditing ? (
            <Input value={draft[col.key]} onChange={(e) => setField(col.key, e.target.value)} className="h-8" placeholder="—" />
          ) : (
            <span className="text-gray-700 dark:text-gray-300">
              {item[col.key] ? `₱${item[col.key]}` : <span className="text-gray-400">—</span>}
            </span>
          )}
        </td>
      ))}
      <td className="px-4 py-3 text-right">
        {isEditing ? (
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} className="gap-1">
              <X className="size-3" /> Cancel
            </Button>
            <Button size="sm" onClick={() => onSave(draft)} className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Save className="size-3" /> Save
            </Button>
          </div>
        ) : (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="sm" onClick={onEdit} className="gap-1">
              <Edit2 className="size-3" /> Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete} className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="size-3" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
