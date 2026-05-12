import { useMemo, useState } from 'react';
import { Check, ChevronDown, Pencil, Save, Trash2, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner';
import {
  useGeneralManagers,
  useSalesConsultants,
  type SalesConsultantRecord,
} from '../../lib/api';

interface BaseSelectProps<T> {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  items: T[];
  getLabel: (item: T) => string;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  emptyMessage: string;
}

function EditableSelect<T extends { id: number }>(props: BaseSelectProps<T>) {
  const {
    value,
    onChange,
    placeholder,
    items,
    getLabel,
    onUpdate,
    onDelete,
    emptyMessage,
  } = props;
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const selectedLabel = value || '';

  const handleSave = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    try {
      await onUpdate(editingId, name);
      setEditingId(null);
      setEditingName('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await onDelete(id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete item');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-sm justify-between w-full"
        >
          <span className={selectedLabel ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
            {selectedLabel || placeholder}
          </span>
          <ChevronDown className="size-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2 z-[260]" align="start">
        <div className="space-y-2">
          <div className="max-h-56 overflow-y-auto space-y-1">
            {items.length === 0 && (
              <div className="text-xs text-gray-400 px-2 py-1">{emptyMessage}</div>
            )}
            {items.map((item) => {
              const label = getLabel(item);
              const isEditing = editingId === item.id;
              return (
                <div key={item.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <button
                      type="button"
                      className="flex-1 text-left text-xs text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        onChange(label);
                        setOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  )}

                  {!isEditing && label === value && <Check className="size-3 text-blue-600" />}

                  {isEditing ? (
                    <Button size="sm" className="h-7 px-2" onClick={handleSave}>
                      <Save className="size-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        setEditingId(item.id);
                        setEditingName(label);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-600"
                    onClick={() => handleDelete(item.id, label)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => setOpen(false)}
          >
            <X className="size-3 mr-1" />
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function GeneralManagerSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { managers, updateManager, removeManager } = useGeneralManagers();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const sorted = useMemo(
    () => managers.slice().sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)),
    [managers]
  );

  const handleUpdate = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    try {
      await updateManager(editingId, name);
      setEditingId(null);
      setEditingName('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update General Manager');
    }
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Delete ${label}?`)) return;
    try {
      await removeManager(id);
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete General Manager');
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-sm justify-between w-full"
        >
          <span className={value ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'}>
            {value || 'Select general manager'}
          </span>
          <ChevronDown className="size-4 text-gray-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-2 z-[260]" align="start">
        <div className="space-y-2">
          <div className="max-h-56 overflow-y-auto space-y-1">
            {sorted.length === 0 && (
              <div className="text-xs text-gray-400 px-2 py-1">No general managers yet</div>
            )}
            {sorted.map((manager) => {
              const isEditing = editingId === manager.id;
              return (
                <div key={manager.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                  {isEditing ? (
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="h-7 text-xs"
                    />
                  ) : (
                    <button
                      type="button"
                      className="flex-1 text-left text-xs text-gray-800 dark:text-gray-200"
                      onClick={() => {
                        onChange(manager.name);
                        setOpen(false);
                      }}
                    >
                      {manager.name}
                    </button>
                  )}

                  {!isEditing && manager.name === value && <Check className="size-3 text-blue-600" />}

                  {isEditing ? (
                    <Button size="sm" className="h-7 px-2" onClick={handleUpdate}>
                      <Save className="size-3" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        setEditingId(manager.id);
                        setEditingName(manager.name);
                      }}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-red-600"
                    onClick={() => handleDelete(manager.id, manager.name)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => setOpen(false)}
          >
            <X className="size-3 mr-1" />
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SalesConsultantSelect({
  value,
  onChange,
  managerId,
}: {
  value: string;
  onChange: (value: string) => void;
  managerId?: number | null;
}) {
  const { consultants, updateConsultant, removeConsultant } = useSalesConsultants();

  const filtered = useMemo(() => {
    if (!managerId) return consultants.slice().sort((a, b) => a.name.localeCompare(b.name));
    return consultants
      .filter((c) => c.manager_id === managerId)
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  }, [consultants, managerId]);

  const handleUpdate = async (id: number, name: string) => {
    await updateConsultant(id, name, managerId ?? undefined);
  };

  const handleDelete = async (id: number, label: string) => {
    if (!window.confirm(`Delete ${label}?`)) return;
    await removeConsultant(id);
  };

  return (
    <EditableSelect<SalesConsultantRecord>
      value={value}
      onChange={onChange}
      placeholder="Select sales consultant"
      items={filtered}
      getLabel={(c) => c.name}
      onUpdate={handleUpdate}
      onDelete={(id) => {
        const label = filtered.find((c) => c.id === id)?.name || 'this consultant';
        return handleDelete(id, label);
      }}
      emptyMessage={managerId ? 'No consultants for this manager' : 'No consultants yet'}
    />
  );
}
