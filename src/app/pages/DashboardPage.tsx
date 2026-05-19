import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Header } from '../components/Header';
import { Filters } from '../components/Filters';
import { StatsCards } from '../components/StatsCards';
import { VehicleTable, VehicleData } from '../components/VehicleTable';
import { HistoryPanel } from '../components/HistoryPanel';
import { AddVehicleModal } from '../components/AddVehicleModal';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { exportToExcel, todayStamp } from '../../lib/exportExcel';
import { useVehicles } from '../../lib/api';
import { usePrices } from '../../lib/api';
import { useAllocationTables } from '../../lib/api';
import { useLocation } from 'react-router';
import { Input } from '../components/ui/input';

export function DashboardPage() {
  const location = useLocation();
  const { vehicles, addVehicle, updateVehicle } = useVehicles();
  const { prices } = usePrices();
  const { tables, addTable, removeTable } = useAllocationTables();
  const normalizeStatus = (status: string) =>
    status === 'AVAILABLE' ? 'ON TRACK' : status;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedDealer, setSelectedDealer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [detailsVehicle, setDetailsVehicle] = useState<VehicleData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [prefillVehicle, setPrefillVehicle] = useState<Partial<VehicleData> | null>(null);
  const [showFab, setShowFab] = useState(false);
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableDate, setNewTableDate] = useState('');

  // Handle navigation state from notification dropdown and demo set-as-sale flow
  useEffect(() => {
    const state = location.state as { openVehicleId?: string; openHistoryId?: string; prefillVehicle?: Partial<VehicleData> } | null;
    if (state?.prefillVehicle) {
      setPrefillVehicle(state.prefillVehicle);
      setShowAddModal(true);
      window.history.replaceState({}, '');
    } else if (state?.openVehicleId) {
      const vehicle = vehicles.find((v) => v.id === state.openVehicleId);
      if (vehicle) {
        setDetailsVehicle(vehicle);
        setShowDetailsModal(true);
      }
      window.history.replaceState({}, '');
    } else if (state?.openHistoryId) {
      const vehicle = vehicles.find((v) => v.id === state.openHistoryId);
      if (vehicle) {
        setSelectedVehicle(vehicle);
      }
      window.history.replaceState({}, '');
    }
  }, [location.state, vehicles]);

  // Filter vehicles based on all criteria
  const filteredVehicles = vehicles.filter((vehicle) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        vehicle.csNo.toLowerCase().includes(search) ||
        vehicle.plateNumber.toLowerCase().includes(search) ||
        vehicle.vinNumber.toLowerCase().includes(search) ||
        vehicle.dealer.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // Model filter
    if (selectedModel !== 'all' && vehicle.model !== selectedModel) {
      return false;
    }

    // Dealer filter
    if (selectedDealer !== 'all' && vehicle.dealer !== selectedDealer) {
      return false;
    }

    // Status filter
    if (selectedStatus !== 'all' && normalizeStatus(vehicle.status) !== selectedStatus) {
      return false;
    }

    // Category filter
    if (selectedCategory !== 'all' && vehicle.category !== selectedCategory) {
      return false;
    }

    // Date from filter
    if (dateFrom && vehicle.receivedDate < dateFrom) {
      return false;
    }

    // Date to filter
    if (dateTo && vehicle.receivedDate > dateTo) {
      return false;
    }

    return true;
  });

  const handleRefresh = () => {
    toast.success('Dashboard refreshed successfully');
  };

  const handleExport = () => {
    const rows = filteredVehicles.map((v) => ({
      'Model': v.model,
      'Category': v.category,
      'Chassis No.': v.chassisNo,
      'Engine No.': v.engineNo,
      'Color': v.color,
      'Year Model': v.yearModel,
      'Client Name': v.clientName,
      'Dealer': v.dealer,
      'Status': v.status,
      'PO Number': v.poNumber,
      'PO Amount': v.poAmount,
      'CS No.': v.csNo,
      'Declared Month': v.declaredMonth,
      'Pull-Out Date': v.pullOutDate,
      'Current Location': v.currentLocation,
      'Remarks': v.remarks,
    }));
    exportToExcel(rows, `dashboard-vehicles-${todayStamp()}`, 'Vehicles');
    toast.success(`Exported ${rows.length} vehicle(s) to Excel`);
  };

  const handleViewHistory = (vehicle: VehicleData) => {
    setSelectedVehicle(vehicle);
  };

  const handleViewDetails = (vehicle: VehicleData) => {
    setDetailsVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleAddVehicle = async (newVehicle: VehicleData) => {
    try {
      await addVehicle(newVehicle);
      toast.success('Vehicle added successfully!');
    } catch (e: any) {
      toast.error(`Failed to add vehicle: ${e.message}`);
    }
  };

  const handleSaveVehicle = async (updatedVehicle: VehicleData) => {
    try {
      await updateVehicle(updatedVehicle.id, updatedVehicle);
      setShowDetailsModal(false);
      setDetailsVehicle(null);
    } catch (e: any) {
      toast.error(`Failed to update vehicle: ${e.message}`);
    }
  };

  const allocationVehicles = filteredVehicles.filter((v) => v.category === 'ALLOCATION');
  const tableVehicles = tables
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((table) => ({
      table,
      vehicles: allocationVehicles.filter((v) => String(v.allocationTable || '') === String(table.id)),
    }));
  const unassignedAllocationVehicles = allocationVehicles.filter((v) => !v.allocationTable);

  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableDate) {
      toast.error('Table name and Date of Confirmation are required');
      return;
    }
    try {
      await addTable({ name: newTableName.trim(), date_of_confirmation: newTableDate });
      setShowAddTableModal(false);
      setNewTableName('');
      setNewTableDate('');
      toast.success('Allocation table added');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add table');
    }
  };

  const handleDeleteTable = async (id: number, name: string) => {
    const hasData = allocationVehicles.some((v) => String(v.allocationTable || '') === String(id));
    if (hasData) {
      toast.error('Cannot delete table with data');
      return;
    }
    if (!confirm(`Delete allocation table "${name}"?`)) return;
    try {
      await removeTable(id);
      toast.success('Allocation table deleted');
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete table');
    }
  };

  return (
    <>
      <Header />
      
      <Filters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        selectedDealer={selectedDealer}
        onDealerChange={setSelectedDealer}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        onRefresh={handleRefresh}
        onExport={handleExport}
        modelOptions={Array.from(new Set(prices.map((p) => p.model).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))}
        dealerOptions={Array.from(new Set(vehicles.map((v) => v.dealer).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))}
      />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {/* Stats Cards */}
        <StatsCards vehicles={filteredVehicles} />

        <section className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Allocation Tables</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Create and manage table groups for allocation units.</p>
            </div>
            <Button size="sm" onClick={() => setShowAddTableModal(true)} className="bg-blue-600 hover:bg-blue-700">Add Table</Button>
          </div>
        </section>

        {tableVehicles.map(({ table, vehicles: rows }) => (
          <section key={table.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{table.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Date of Confirmation: {table.date_of_confirmation}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteTable(table.id, table.name)}
                disabled={rows.length > 0}
              >
                Delete Table
              </Button>
            </div>
            <VehicleTable data={rows} onViewHistory={handleViewHistory} onViewDetails={handleViewDetails} />
            {rows.length === 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No units in this table yet.</p>
              </div>
            )}
          </section>
        ))}

        <section className="space-y-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Unassigned Allocation Units</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Units with no allocation table selected.</p>
          </div>
          <VehicleTable data={unassignedAllocationVehicles} onViewHistory={handleViewHistory} onViewDetails={handleViewDetails} />
        </section>

        {tableVehicles.length === 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No allocation tables yet. Add a table to get started.</p>
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 right-6 z-40 flex items-end gap-2">
        <Button
          onClick={() => setShowAddModal(true)}
          className={`size-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all ${
            showFab
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-2 pointer-events-none"
          }`}
          size="icon"
        >
          <Plus className="size-6" />
        </Button>
        <button
          type="button"
          onClick={() => setShowFab((v) => !v)}
          onMouseEnter={() => setShowFab((v) => !v)}
          className="flex items-center justify-center size-8 rounded-full bg-gray-200 text-gray-700 shadow hover:bg-gray-300 transition-colors"
          aria-label="Toggle add vehicle button"
        >
          <span className="text-sm font-semibold">
            {showFab ? "∨" : "∧"}
          </span>
        </button>
      </div>

      {/* History Panel Overlay */}
      {selectedVehicle && (
        <HistoryPanel
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <AddVehicleModal
          onClose={() => {
            setShowAddModal(false);
            setPrefillVehicle(null);
          }}
          onSave={handleAddVehicle}
          initialVehicle={prefillVehicle ?? undefined}
          title={prefillVehicle ? "Continue Sale" : undefined}
        />
      )}

      {/* Vehicle Details Modal */}
      {showDetailsModal && (
        <VehicleDetailsModal
          vehicle={detailsVehicle}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          onSave={handleSaveVehicle}
        />
      )}

      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddTableModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg mx-4">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add Allocation Table</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Table Name</label>
                <Input
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g. Partial 2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Confirmation</label>
                <Input
                  type="date"
                  value={newTableDate}
                  onChange={(e) => setNewTableDate(e.target.value)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddTableModal(false)}>Cancel</Button>
              <Button onClick={handleCreateTable} className="bg-blue-600 hover:bg-blue-700">Save</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}