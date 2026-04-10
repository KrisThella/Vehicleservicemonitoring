import { useState } from 'react';
import { Header } from '../components/Header';
import { Package, TrendingUp, Clock, Plus } from 'lucide-react';
import { VehicleData } from '../components/VehicleTable';
import { format, differenceInDays } from 'date-fns';
import { mockVehicles } from '../data/vehicleData';
import { Button } from '../components/ui/button';
import { AddAvailableVehicleModal, AvailableVehicleEntry } from '../components/AddAvailableVehicleModal';

export function AvailablePage() {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedEntries, setAddedEntries] = useState<AvailableVehicleEntry[]>([]);

  // Filter only available vehicles with "ON TRACK" status from mockVehicles
  const availableVehicles = mockVehicles.filter(v => v.status === 'ON TRACK');

  const totalAvailable = availableVehicles.length + addedEntries.length;
  const avgAge = availableVehicles.reduce((sum, v) => {
    return sum + differenceInDays(new Date(), v.receivedDate);
  }, 0) / (availableVehicles.length || 1);

  const handleAddEntry = (entry: AvailableVehicleEntry) => {
    setAddedEntries((prev) => [...prev, entry]);
  };

  return (
    <>
      <Header onOpenPricing={() => setShowPricingModal(true)} />
      
      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Available Units</h1>
          <p className="text-sm text-gray-500 mt-1">Vehicles with ON TRACK status ready for allocation or sale</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Available</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalAvailable}</p>
              </div>
              <div className="bg-teal-50 p-3 rounded-lg">
                <Package className="size-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Unit Age</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {Math.round(avgAge)} days
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Clock className="size-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ready for Sale</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalAvailable}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Available Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header with Add Button */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Available Vehicles</h2>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-sm"
              size="sm"
            >
              <Plus className="size-4 mr-1.5" />
              Add Entry
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chassis No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CS No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tagging Account</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation Team</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pull Out Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Tagged</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month Declared</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Age</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grace Period</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* Existing mock vehicles */}
                {availableVehicles.map((vehicle) => {
                  const unitAge = differenceInDays(new Date(), vehicle.receivedDate);
                  const gracePeriod = Math.max(0, 90 - unitAge);
                  
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.color}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">{vehicle.chassisNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.engineNo || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{vehicle.remarks}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.dealer}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.csNo}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.taggingAccount || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.allocationTeam || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.poNumber}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.poAmount || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.pullOut ? format(vehicle.pullOut, 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.dateTagged ? format(vehicle.dateTagged, 'MMM dd, yyyy') : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.monthDeclared || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.location}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          unitAge > 60 ? 'bg-red-100 text-red-700' : unitAge > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {unitAge} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          gracePeriod < 30 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {gracePeriod} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {vehicle.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {/* Newly added entries */}
                {addedEntries.map((entry, idx) => (
                  <tr key={`new-${idx}`} className="hover:bg-teal-50 bg-teal-50/30">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">{entry.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.color || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">{entry.chassisNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">{entry.engineNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{entry.remarks || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.dealer || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.csNo || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.yearModel || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.taggingAccount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.allocationTeam || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.poNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.poAmount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {entry.pullOutDate ? format(new Date(entry.pullOutDate), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {entry.dateTagged ? format(new Date(entry.dateTagged), 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {entry.monthDeclared ? (() => {
                        const d = new Date(entry.monthDeclared + '-01');
                        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                      })() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{entry.location || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        entry.unitAge > 60 ? 'bg-red-100 text-red-700' : entry.unitAge > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {entry.unitAge} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        parseInt(entry.gracePeriod || '0') < 30 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {entry.gracePeriod || '0'} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {entry.status ? (
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {entry.status}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}

                {availableVehicles.length === 0 && addedEntries.length === 0 && (
                  <tr>
                    <td colSpan={19} className="px-4 py-12 text-center text-sm text-gray-500">
                      No available vehicles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Available Vehicle Modal */}
      {showAddModal && (
        <AddAvailableVehicleModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddEntry}
        />
      )}
    </>
  );
}
