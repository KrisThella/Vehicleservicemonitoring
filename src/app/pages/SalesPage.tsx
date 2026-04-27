import { Header } from '../components/Header';
import { TrendingUp, Package, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useVehicles } from '../../lib/api';

export function SalesPage() {
  const { vehicles } = useVehicles();
  const soldVehicles = vehicles.filter((v: any) => v.status === 'SOLD' || v.category === 'SALES');

  const totalSales = soldVehicles.length;
  const totalRevenue = soldVehicles.reduce((sum, v) => {
    const amount = v.invoiceAmount?.replace(/[₱,]/g, '') || '0';
    return sum + parseFloat(amount);
  }, 0);

  return (
    <>
      <Header />
      
      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sales</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track all sold vehicles and sales performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Sold Units</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">{totalSales}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                <TrendingUp className="size-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                <DollarSign className="size-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Average Unit Price</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  ₱{(totalRevenue / totalSales || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-950 p-3 rounded-lg">
                <Package className="size-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Sold Vehicles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Color</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Chassis No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Engine No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">CS No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Year Model</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PO Number</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">PO Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name of Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice No.</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Release Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Sales Consultant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">General Manager</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Dealer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Terms</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Bank</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Invoice Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Gross Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Extended Warranty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">LTO Docs Transmittal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Remarks</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Pull Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {soldVehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.model}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.color}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap font-mono text-xs">{vehicle.chassisNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.engineNo || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.csNo}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.year}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.location}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.poNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.poAmount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {vehicle.invoiceDate ? format(vehicle.invoiceDate, 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.nameOfClient || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.invoiceNumber || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {vehicle.releaseDate ? format(vehicle.releaseDate, 'MMM dd, yyyy') : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.salesConsultant || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.generalManager || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.dealer}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.terms || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.bank || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.invoiceAmount || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.grossProfit || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.extendedWarranty || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">{vehicle.ltoDocumentsTransmittal || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{vehicle.remarks}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
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
