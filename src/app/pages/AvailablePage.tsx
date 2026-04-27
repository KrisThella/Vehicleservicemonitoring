import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import {
  Package, Clock, AlertTriangle, TrendingUp,
  Plus, Search, X, Pencil, Trash2, ChevronDown, Filter,
} from 'lucide-react';
import { differenceInDays, format } from 'date-fns';
import { mockVehicles } from '../data/vehicleData';
import { Button } from '../components/ui/button';
import {
  AddAvailableVehicleModal,
  AvailableVehicleEntry,
  ALLOCATION_TEAMS,
  AVAILABLE_STATUSES,
} from '../components/AddAvailableVehicleModal';
import { colorHexMap } from '../components/utils/colorMapping';

// ── Helpers ──────────────────────────────────────────────────────────────────

function ageBadgeClass(days: number) {
  if (days > 90) return 'bg-red-100 text-red-700 border-red-200';
  if (days > 60) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (days > 30) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
}

function statusBadgeClass(status: string) {
  switch (status) {
    case 'AVAILABLE':      return 'bg-teal-100 text-teal-700 border-teal-200';
    case 'ON TRACK':       return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'FOR ALLOCATION': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'TAGGED':         return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    case 'RESERVED':       return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'HELD':           return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'SOLD':           return 'bg-gray-100 text-gray-600 border-gray-200';
    default:               return 'bg-gray-100 text-gray-600 border-gray-200';
  }
}

// ── Seed from mockVehicles ────────────────────────────────────────────────────

function seedFromMock(): AvailableVehicleEntry[] {
  return mockVehicles
    .filter((v) => v.status === 'ON TRACK' || v.category === 'AVAILABLE')
    .map((v) => {
      const pullOutDate = v.pullOut ? format(v.pullOut, 'yyyy-MM-dd') : '';
      const unitAge = pullOutDate
        ? Math.max(0, differenceInDays(new Date(), new Date(pullOutDate)))
        : Math.max(0, differenceInDays(new Date(), v.receivedDate));
      return {
        id: v.id,
        model: v.model,
        color: v.color,
        chassisNo: v.chassisNo || v.vinNumber || '',
        engineNo: v.engineNo || '',
        remarks: v.remarks || '',
        csNo: v.csNo || '',
        yearModel: String(v.year),
        taggingAccount: v.taggingAccount || '',
        allocationTeam: v.allocationTeam || v.dealer || '',
        dealer: v.dealer || '',
        poNumber: v.poNumber || '',
        poAmount: v.poAmount || '',
        pullOutDate,
        dateTagged: v.dateTagged ? format(v.dateTagged, 'yyyy-MM-dd') : '',
        monthDeclared: v.monthDeclared || '',
        location: v.location || '',
        unitAge,
        gracePeriod: '90',
        status: v.status,
      } as AvailableVehicleEntry;
    });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function AvailablePage() {
  const [entries, setEntries] = useState<AvailableVehicleEntry[]>(seedFromMock);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState<AvailableVehicleEntry | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        e.model.toLowerCase().includes(q) ||
        e.chassisNo.toLowerCase().includes(q) ||
        e.engineNo.toLowerCase().includes(q) ||
        e.csNo.toLowerCase().includes(q) ||
        e.color.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.dealer.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'ALL' || e.status === filterStatus;
      const matchTeam   = filterTeam === 'ALL'   || e.allocationTeam === filterTeam;
      return matchSearch && matchStatus && matchTeam;
    });
  }, [entries, search, filterStatus, filterTeam]);

  const activeFilters = (search ? 1 : 0) + (filterStatus !== 'ALL' ? 1 : 0) + (filterTeam !== 'ALL' ? 1 : 0);

  const stats = useMemo(() => {
    const total     = entries.length;
    const available = entries.filter((e) => e.status === 'AVAILABLE' || e.status === 'ON TRACK').length;
    const overdue   = entries.filter((e) => e.unitAge > 90).length;
    const avgAge    = total ? Math.round(entries.reduce((s, e) => s + e.unitAge, 0) / total) : 0;
    return { total, available, overdue, avgAge };
  }, [entries]);

  const handleAdd    = (entry: AvailableVehicleEntry) => setEntries((p) => [entry, ...p]);
  const handleEdit   = (entry: AvailableVehicleEntry) => setEntries((p) => p.map((e) => e.id === entry.id ? entry : e));
  const handleDelete = (id: string) => { setEntries((p) => p.filter((e) => e.id !== id)); setDeleteId(null); };
  const clearFilters = () => { setSearch(''); setFilterStatus('ALL'); setFilterTeam('ALL'); };

  return (
    <>
      <Header onOpenPricing={() => {}} />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-5">

        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Available Units</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage and track all available inventory units</p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700 flex-shrink-0">
            <Plus className="size-4 mr-1.5" />
            Add Entry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Units"      value={stats.total}           icon={<Package    className="size-5 text-teal-600" />}   iconBg="bg-teal-50"   sub="in inventory" />
          <StatCard label="Ready / On Track" value={stats.available}       icon={<TrendingUp className="size-5 text-blue-600" />}   iconBg="bg-blue-50"   sub="for sale or allocation" highlight="blue" />
          <StatCard label="Avg. Unit Age"    value={`${stats.avgAge}d`}    icon={<Clock      className="size-5 text-purple-600" />} iconBg="bg-purple-50" sub="days since pull-out" />
          <StatCard label="Aging Alerts"     value={stats.overdue}         icon={<AlertTriangle className="size-5 text-red-500" />} iconBg="bg-red-50"    sub="over 90 days" highlight={stats.overdue > 0 ? 'red' : undefined} />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <input
                  className="w-full pl-9 pr-9 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                  placeholder="Search model, chassis, color, location…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters((f) => !f)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors ${
                  showFilters || activeFilters > 0 ? 'bg-teal-50 border-teal-300 text-teal-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="size-3.5" />
                Filters
                {activeFilters > 0 && (
                  <span className="ml-1 bg-teal-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilters}</span>
                )}
                <ChevronDown className={`size-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>

              {activeFilters > 0 && (
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-red-500 underline transition-colors">
                  Clear all
                </button>
              )}

              <span className="ml-auto text-xs text-gray-400">
                Showing <strong className="text-gray-700">{filtered.length}</strong> of {entries.length} entries
              </span>
            </div>

            {showFilters && (
              <div className="flex items-center gap-4 flex-wrap pt-1 pb-0.5">
                <FilterSelect label="Status"          value={filterStatus} onChange={setFilterStatus} options={['ALL', ...AVAILABLE_STATUSES]} />
                <FilterSelect label="Allocation Team" value={filterTeam}   onChange={setFilterTeam}   options={['ALL', ...ALLOCATION_TEAMS]}    />
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <Th>Model</Th>
                  <Th>Color</Th>
                  <Th>Chassis No.</Th>
                  <Th>Engine No.</Th>
                  <Th>CS No.</Th>
                  <Th>Year</Th>
                  <Th>Allocation Team</Th>
                  <Th>Tagging Account</Th>
                  <Th>Dealer</Th>
                  <Th>PO No.</Th>
                  <Th>PO Amount</Th>
                  <Th>Pull Out Date</Th>
                  <Th>Date Tagged</Th>
                  <Th>Month Declared</Th>
                  <Th>Location</Th>
                  <Th>Unit Age</Th>
                  <Th>Grace Rem.</Th>
                  <Th>Status</Th>
                  <Th>Remarks</Th>
                  <Th sticky>Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-400">
                        <Package className="size-10 opacity-30" />
                        <p className="text-sm">No entries found</p>
                        {activeFilters > 0 && (
                          <button onClick={clearFilters} className="text-xs text-teal-600 underline hover:text-teal-700">
                            Clear filters to see all
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => {
                    const graceDays = parseInt(entry.gracePeriod || '90', 10);
                    const remaining = Math.max(0, graceDays - entry.unitAge);
                    const graceClass = remaining < 15
                      ? 'bg-red-100 text-red-700 border-red-200'
                      : remaining < 30
                        ? 'bg-orange-100 text-orange-700 border-orange-200'
                        : 'bg-green-100 text-green-700 border-green-200';

                    return (
                      <tr key={entry.id} className="hover:bg-gray-50/80 transition-colors group">
                        <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{entry.model}</td>

                        {/* Color with swatch */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <span
                              className="inline-block w-3.5 h-3.5 rounded-sm border border-gray-300 flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: colorHexMap[entry.color] ?? '#d1d5db' }}
                            />
                            <span className="text-gray-700 text-xs max-w-[120px] truncate">{entry.color || '—'}</span>
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700">{entry.chassisNo || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-gray-700">{entry.engineNo || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.csNo || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.yearModel || '—'}</td>

                        {/* Allocation Team chip */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {entry.allocationTeam ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border bg-indigo-50 text-indigo-700 border-indigo-200">
                              {entry.allocationTeam}
                            </span>
                          ) : '—'}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.taggingAccount || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.dealer || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.poNumber || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">{entry.poAmount || '—'}</td>

                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {entry.pullOutDate ? format(new Date(entry.pullOutDate), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {entry.dateTagged ? format(new Date(entry.dateTagged), 'MMM dd, yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                          {entry.monthDeclared
                            ? (() => { try { return new Date(entry.monthDeclared + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }); } catch { return entry.monthDeclared; } })()
                            : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-700 max-w-[150px] truncate">{entry.location || '—'}</td>

                        {/* Unit Age badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${ageBadgeClass(entry.unitAge)}`}>
                            {entry.unitAge}d
                          </span>
                        </td>

                        {/* Grace remaining */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${graceClass}`}>
                            {remaining}d
                          </span>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {entry.status
                            ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border font-medium ${statusBadgeClass(entry.status)}`}>{entry.status}</span>
                            : '—'}
                        </td>

                        <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">{entry.remarks || '—'}</td>

                        {/* Sticky actions */}
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-white group-hover:bg-gray-50/80 border-l border-gray-100 transition-colors">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditEntry(entry)}
                              className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteId(entry.id)}
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
            </table>
          </div>

          {/* Table Footer legend */}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-400 flex-wrap gap-2">
              <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</span>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> ≤30d</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> 31–60d</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> 61–90d</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" /> &gt;90d</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <AddAvailableVehicleModal onClose={() => setShowAddModal(false)} onSave={handleAdd} mode="add" />
      )}

      {/* Edit Modal */}
      {editEntry && (
        <AddAvailableVehicleModal
          onClose={() => setEditEntry(null)}
          onSave={(updated) => { handleEdit(updated); setEditEntry(null); }}
          initialData={editEntry}
          mode="edit"
        />
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <DeleteConfirmDialog
          entry={entries.find((e) => e.id === deleteId)!}
          onCancel={() => setDeleteId(null)}
          onConfirm={() => handleDelete(deleteId)}
        />
      )}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, sub, highlight }: {
  label: string; value: string | number; icon: React.ReactNode;
  iconBg: string; sub: string; highlight?: 'blue' | 'red';
}) {
  return (
    <div className={`bg-white rounded-xl border p-5 flex items-start justify-between gap-3 shadow-sm ${
      highlight === 'red' ? 'border-red-200' : highlight === 'blue' ? 'border-blue-200' : 'border-gray-200'
    }`}>
      <div>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={`text-2xl font-semibold ${
          highlight === 'red' ? 'text-red-600' : highlight === 'blue' ? 'text-blue-700' : 'text-gray-900'
        }`}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <div className={`${iconBg} p-2.5 rounded-lg flex-shrink-0`}>{icon}</div>
    </div>
  );
}

function Th({ children, sticky }: { children: React.ReactNode; sticky?: boolean }) {
  return (
    <th className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap ${
      sticky ? 'sticky right-0 bg-gray-50 border-l border-gray-200 z-10' : ''
    }`}>
      {children}
    </th>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-gray-500 text-xs font-medium whitespace-nowrap">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        {options.map((o) => <option key={o} value={o}>{o === 'ALL' ? `All ${label}s` : o}</option>)}
      </select>
    </label>
  );
}

function DeleteConfirmDialog({ entry, onCancel, onConfirm }: {
  entry: AvailableVehicleEntry; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 p-2.5 rounded-xl"><Trash2 className="size-5 text-red-600" /></div>
          <div>
            <h3 className="font-semibold text-gray-900">Delete Entry</h3>
            <p className="text-xs text-gray-500">This action cannot be undone.</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 mb-5 border border-gray-200">
          <p className="text-sm font-medium text-gray-800">{entry.model}</p>
          <p className="text-xs text-gray-500 mt-0.5">Chassis: {entry.chassisNo || '—'} · CS No: {entry.csNo || '—'}</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700">Delete</Button>
        </div>
      </div>
    </div>
  );
}
