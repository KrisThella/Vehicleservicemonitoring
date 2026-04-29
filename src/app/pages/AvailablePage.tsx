import { useState } from 'react';
import { Header } from '../components/Header';
import { Package, TrendingUp, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useVehicles } from '../../lib/api';
import { Button } from '../components/ui/button';
import { AddAvailableVehicleModal, AvailableVehicleEntry } from '../components/AddAvailableVehicleModal';
import { toast } from 'sonner';

export function AvailablePage() {
  const { vehicles, addVehicle } = useVehicles();
  const [showAddModal, setShowAddModal] = useState(false);

  const onTrackVehicles = vehicles.filter((v: any) => v.status === 'ON TRACK');
  const totalOnTrack = onTrackVehicles.length;

  const handleAddEntry = async (entry: AvailableVehicleEntry) => {
    try {
      await addVehicle({
        model: entry.model,
        color: entry.color || '',
        chassisNo: entry.chassisNo,
        engineNo: entry.engineNo,
        remarks: entry.remarks || '',
        dealer: entry.dealer || '',
        csNo: entry.csNo || '',
        year: parseInt(entry.yearModel || '0') || new Date().getFullYear(),
        taggingAccount: entry.taggingAccount,
        allocationTeam: entry.allocationTeam,
        poNumber: entry.poNumber || '',
        poAmount: entry.poAmount,
        pullOut: entry.pullOutDate ? new Date(entry.pullOutDate) : null,
        dateTagged: entry.dateTagged ? new Date(entry.dateTagged) : null,
        monthDeclared: entry.monthDeclared,
        location: entry.location || '',
        unit: 'ON TRACK UNIT',
        vinNumber: entry.chassisNo,
        plateNumber: 'N/A UNIT',
        receivedDate: entry.dateTagged ? new Date(entry.dateTagged) : new Date(),
        status: entry.status || 'ON TRACK',
        overdue: false,
        category: 'AVAILABLE',
      });
      toast.success('Vehicle added to inventory');
    } catch (e: any) {
      toast.error(`Failed: ${e.message}`);
    }
  };

  return (
    <>
      <Header />
      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">On Track Units</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Vehicles with ON TRACK status ready for allocation or sale</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total On Track</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{totalOnTrack}</p>
              </div>
              <div className="bg-teal-50 dark:bg-teal-950 p-3 rounded-lg">
                <Package className="size-6 text-teal-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Ready for Sale</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{totalOnTrack}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">On Track Vehicles</h2>
            <Button onClick={() => setShowAddModal(true)} className="bg-teal-600 hover:bg-teal-700 h-8 px-3 text-sm" size="sm">
              <Plus className="size-4 mr-1.5" />
              Add Entry
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  {['Model','Color','Chassis No.','Engine No.','Remarks','Dealer','CS No.','Year','Tagging','Allocation Team','PO #','PO Amount','Pull Out','Date Tagged','Month Declared','Location','Unit Age','Grace','Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {onTrackVehicles.map((vehicle: any) => {
                  const unitAge = differenceInDays(new Date(), vehicle.receivedDate);
                  const gracePeriod = Math.max(0, 90 - unitAge);
                  return (
                    <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.model}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.color}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap font-mono text-xs text-gray-900 dark:text-gray-100">{vehicle.chassisNo}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.engineNo || '-'}</td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate text-gray-900 dark:text-gray-100">{vehicle.remarks}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.dealer}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.csNo}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.year}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.taggingAccount || '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.allocationTeam || '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.poNumber}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.poAmount || '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.pullOut ? format(vehicle.pullOut, 'MMM dd, yyyy') : '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.dateTagged ? format(vehicle.dateTagged, 'MMM dd, yyyy') : '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.monthDeclared || '-'}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap text-gray-900 dark:text-gray-100">{vehicle.location}</td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${unitAge > 60 ? 'bg-red-100 text-red-700' : unitAge > 30 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{unitAge} days</span></td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${gracePeriod < 30 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{gracePeriod} days</span></td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap"><span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">{vehicle.status}</span></td>
                    </tr>
                  );
                })}
                {onTrackVehicles.length === 0 && (
                  <tr><td colSpan={19} className="px-4 py-12 text-center text-sm text-gray-500">No on track vehicles found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {showAddModal && (
        <AddAvailableVehicleModal onClose={() => setShowAddModal(false)} onSave={handleAddEntry} />
      )}
    </>
  );
}
