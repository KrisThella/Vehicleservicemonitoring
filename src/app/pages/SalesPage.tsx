import { useState } from 'react';
import { Header } from '../components/Header';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { VehicleData } from '../components/VehicleTable';
import { format } from 'date-fns';
import { mockVehicles } from '../data/vehicleData';

export function SalesPage() {
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Filter only sold vehicles
  const soldVehicles = mockVehicles.filter(v => v.status === 'SOLD' || v.category === 'SALES');

  const totalSales = soldVehicles.length;
  const totalRevenue = soldVehicles.reduce((sum, v) => {
    const amount = v.invoiceAmount?.replace(/[₱,]/g, '') || '0';
    return sum + parseFloat(amount);
  }, 0);

  return (
    <>
      <Header onOpenPricing={() => setShowPricingModal(true)} />
      
      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sales</h1>
          <p className="text-sm text-gray-500 mt-1">Track all sold vehicles and sales performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sold Units</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">{totalSales}</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <TrendingUp className="size-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <DollarSign className="size-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Unit Price</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  ₱{(totalRevenue / totalSales || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <Package className="size-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Sold Vehicles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chassis No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Engine No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CS No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name of Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Release Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Consultant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">General Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dealer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Terms</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Extended Warranty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">LTO Docs Transmittal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pull Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {soldVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.color}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">{vehicle.chassisNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.engineNo || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.csNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.poNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.poAmount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {vehicle.invoiceDate ? format(vehicle.invoiceDate, 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.nameOfClient || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.invoiceNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {vehicle.releaseDate ? format(vehicle.releaseDate, 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.salesConsultant || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.generalManager || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.dealer}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.terms || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.bank || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.invoiceAmount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.grossProfit || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.extendedWarranty || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{vehicle.ltoDocumentsTransmittal || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{vehicle.remarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {vehicle.pullOut ? format(vehicle.pullOut, 'MMM dd, yyyy') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
