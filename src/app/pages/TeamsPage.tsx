import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import {
  useGeneralManagers,
  useSalesConsultants,
  type SalesConsultantRecord,
} from '../../lib/api';

export function TeamsPage() {
  const navigate = useNavigate();
  const { managers, loading: loadingManagers, addManager, updateManager, removeManager } = useGeneralManagers();
  const {
    consultants,
    loading: loadingConsultants,
    addConsultant,
    updateConsultant,
    removeConsultant,
    refetch: refetchConsultants,
  } = useSalesConsultants();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newManagerName, setNewManagerName] = useState('');
  const [newConsultants, setNewConsultants] = useState<string[]>(['']);

  const [editingManagerId, setEditingManagerId] = useState<number | null>(null);
  const [editingManagerName, setEditingManagerName] = useState('');

  const [editingConsultantId, setEditingConsultantId] = useState<number | null>(null);
  const [editingConsultantName, setEditingConsultantName] = useState('');

  const [pendingConsultantByManager, setPendingConsultantByManager] = useState<Record<number, string>>({});

  const consultantsByManager = useMemo(() => {
    const map = new Map<number, SalesConsultantRecord[]>();
    consultants.forEach((c) => {
      if (!map.has(c.manager_id)) map.set(c.manager_id, []);
      map.get(c.manager_id)!.push(c);
    });
    for (const list of map.values()) {
      list.sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
    }
    return map;
  }, [consultants]);

  const openEditManager = (id: number, name: string) => {
    setEditingManagerId(id);
    setEditingManagerName(name);
  };

  const saveManager = async () => {
    if (!editingManagerId) return;
    const name = editingManagerName.trim();
    if (!name) {
      toast.error('General Manager name is required');
      return;
    }
    try {
      await updateManager(editingManagerId, name);
      setEditingManagerId(null);
      setEditingManagerName('');
      toast.success('General Manager updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update General Manager');
    }
  };

  const addManagerRow = async () => {
    const name = newManagerName.trim();
    const consultantsList = newConsultants.map((c) => c.trim()).filter(Boolean);
    if (!name) {
      toast.error('General Manager name is required');
      return;
    }
    if (consultantsList.length === 0) {
      toast.error('At least one consultant is required');
      return;
    }
    try {
      await addManager(name, consultantsList);
      await refetchConsultants();
      setNewManagerName('');
      setNewConsultants(['']);
      setIsAddOpen(false);
      toast.success('General Manager added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add General Manager');
    }
  };

  const addConsultantRow = async (managerId: number) => {
    const name = (pendingConsultantByManager[managerId] || '').trim();
    if (!name) {
      toast.error('Consultant name is required');
      return;
    }
    try {
      await addConsultant(managerId, name);
      setPendingConsultantByManager((prev) => ({ ...prev, [managerId]: '' }));
      toast.success('Consultant added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add consultant');
    }
  };

  const removeManagerRow = async (id: number) => {
    try {
      await removeManager(id);
      await refetchConsultants();
      toast.success('General Manager deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete General Manager');
    }
  };

  const openEditConsultant = (id: number, name: string) => {
    setEditingConsultantId(id);
    setEditingConsultantName(name);
  };

  const saveConsultant = async () => {
    if (!editingConsultantId) return;
    const name = editingConsultantName.trim();
    if (!name) {
      toast.error('Consultant name is required');
      return;
    }
    try {
      await updateConsultant(editingConsultantId, name);
      setEditingConsultantId(null);
      setEditingConsultantName('');
      toast.success('Consultant updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to update consultant');
    }
  };

  const deleteConsultant = async (id: number) => {
    try {
      await removeConsultant(id);
      toast.success('Consultant deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete consultant');
    }
  };

  const loading = loadingManagers || loadingConsultants;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Team Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage General Managers and their Sales Consultants</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <Users className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100">General Managers</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Add or update teams and consultants</p>
                </div>
              </div>
              <Button onClick={() => setIsAddOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus className="size-4" />
                Add Manager
              </Button>
            </div>
          </div>

          {loading && (
            <div className="text-sm text-gray-500 dark:text-gray-400">Loading teams…</div>
          )}

          {!loading && managers.length === 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400">No General Managers yet.</div>
          )}

          {!loading && managers.map((manager) => {
            const list = consultantsByManager.get(manager.id) || [];
            return (
              <div key={manager.id} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {editingManagerId === manager.id ? (
                      <Input
                        value={editingManagerName}
                        onChange={(e) => setEditingManagerName(e.target.value)}
                        className="w-64"
                        placeholder="General Manager name"
                      />
                    ) : (
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{manager.name}</h3>
                    )}
                    {editingManagerId === manager.id ? (
                      <Button size="sm" onClick={saveManager}>Save</Button>
                    ) : (
                      <Button variant="ghost" size="sm" onClick={() => openEditManager(manager.id, manager.name)}>
                        <Pencil className="size-4" />
                      </Button>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-red-600" onClick={() => removeManagerRow(manager.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales Consultants</div>
                  {list.length === 0 ? (
                    <div className="text-sm text-red-500">Add at least one consultant.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {list.map((consultant) => (
                        <div key={consultant.id} className="flex items-center gap-2">
                          {editingConsultantId === consultant.id ? (
                            <Input
                              value={editingConsultantName}
                              onChange={(e) => setEditingConsultantName(e.target.value)}
                              className="flex-1"
                              placeholder="Consultant name"
                            />
                          ) : (
                            <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">{consultant.name}</div>
                          )}
                          {editingConsultantId === consultant.id ? (
                            <Button size="sm" onClick={saveConsultant}>Save</Button>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => openEditConsultant(consultant.id, consultant.name)}>
                              <Pencil className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteConsultant(consultant.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      value={pendingConsultantByManager[manager.id] || ''}
                      onChange={(e) =>
                        setPendingConsultantByManager((prev) => ({ ...prev, [manager.id]: e.target.value }))
                      }
                      placeholder="Add consultant name"
                      className="max-w-md"
                    />
                    <Button size="sm" onClick={() => addConsultantRow(manager.id)} className="gap-1">
                      <Plus className="size-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddOpen(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add General Manager</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Include at least one consultant.</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">General Manager</label>
                <Input
                  value={newManagerName}
                  onChange={(e) => setNewManagerName(e.target.value)}
                  placeholder="e.g. MR. AARON QUIROGA"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Sales Consultants</label>
                {newConsultants.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={value}
                      onChange={(e) =>
                        setNewConsultants((prev) => prev.map((v, i) => (i === index ? e.target.value : v)))
                      }
                      placeholder="Consultant name"
                    />
                    {newConsultants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() =>
                          setNewConsultants((prev) => prev.filter((_, i) => i !== index))
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setNewConsultants((prev) => [...prev, ''])}
                >
                  <Plus className="size-4" />
                  Add another
                </Button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={addManagerRow} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
