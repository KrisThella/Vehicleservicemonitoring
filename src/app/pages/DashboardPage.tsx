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
import { useLocation } from 'react-router';

export function DashboardPage() {
  const location = useLocation();
  const { vehicles, addVehicle, updateVehicle } = useVehicles();
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
  const [showFab, setShowFab] = useState(false);

  // Handle navigation state from notification dropdown
  useEffect(() => {
    const state = location.state as { openVehicleId?: string; openHistoryId?: string } | null;
    if (state?.openVehicleId) {
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
      />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6 bg-gray-50 dark:bg-gray-950">
        {/* Stats Cards */}
        <StatsCards vehicles={filteredVehicles} />

        {/* Main Content - Full Width Vehicle Table */}
        <div>
          <VehicleTable data={filteredVehicles} onViewHistory={handleViewHistory} onViewDetails={handleViewDetails} />
          
          {filteredVehicles.length === 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">No vehicles found matching your filters.</p>
            </div>
          )}
        </div>
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
          onClose={() => setShowAddModal(false)}
          onSave={handleAddVehicle}
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
    </>
  );
}