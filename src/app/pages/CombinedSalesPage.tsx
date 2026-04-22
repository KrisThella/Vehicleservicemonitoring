import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import {
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Plus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { VehicleData } from '../components/VehicleTable';
import { format } from 'date-fns';
import { useVehicles } from '../../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';

interface CombinedSalesFilters {
  model: string;
  dealer: string;
  csrStatus: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

export function CombinedSalesPage() {
  const currentYear = new Date().getFullYear();
  const { vehicles } = useVehicles();
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [filters, setFilters] = useState<CombinedSalesFilters>({
    model: 'all',
    dealer: 'all',
    csrStatus: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  // Filter sold vehicles for combined sales
  const soldVehicles = vehicles.filter(
    (v: any) => v.status === 'SOLD' || v.category === 'SALES'
  );

  // Apply filters
  const filteredVehicles = useMemo(() => {
    return soldVehicles.filter((vehicle) => {
      // Model filter
      if (filters.model !== 'all' && vehicle.model !== filters.model) {
        return false;
      }

      // Dealer filter
      if (filters.dealer !== 'all' && vehicle.dealer !== filters.dealer) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom && vehicle.invoiceDate) {
        const fromDate = new Date(filters.dateFrom);
        if (vehicle.invoiceDate < fromDate) return false;
      }
      if (filters.dateTo && vehicle.invoiceDate) {
        const toDate = new Date(filters.dateTo);
        if (vehicle.invoiceDate > toDate) return false;
      }

      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          vehicle.model.toLowerCase().includes(searchLower) ||
          vehicle.chassisNo?.toLowerCase().includes(searchLower) ||
          vehicle.vinNumber.toLowerCase().includes(searchLower) ||
          vehicle.csNo?.toLowerCase().includes(searchLower) ||
          vehicle.nameOfClient?.toLowerCase().includes(searchLower) ||
          vehicle.invoiceNumber?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [soldVehicles, filters]);

  // Get unique values for filters
  const uniqueModels = Array.from(new Set(soldVehicles.map((v) => v.model))).sort();
  const uniqueDealers = Array.from(new Set(soldVehicles.map((v) => v.dealer))).sort();

  // Calculate statistics
  const totalSales = filteredVehicles.length;
  const releasedUnits = filteredVehicles.filter((v) => v.releaseDate).length;
  const pendingDeliveries = filteredVehicles.filter((v) => !v.releaseDate).length;

  const totalRevenue = filteredVehicles.reduce((sum, v) => {
    const amount = v.invoiceAmount?.replace(/[₱,]/g, '') || '0';
    return sum + parseFloat(amount);
  }, 0);

  const totalGrossProfit = filteredVehicles.reduce((sum, v) => {
    const profit = v.grossProfit?.replace(/[₱,]/g, '') || '0';
    return sum + parseFloat(profit);
  }, 0);

  const totalPOAmount = filteredVehicles.reduce((sum, v) => {
    const amount = v.poAmount?.replace(/[₱,]/g, '') || '0';
    return sum + parseFloat(amount);
  }, 0);

  const handleResetFilters = () => {
    setFilters({
      model: 'all',
      dealer: 'all',
      csrStatus: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    });
  };

  const handleExportData = () => {
    // Mock export functionality
    console.log('Exporting data...', filteredVehicles);
    alert('Export functionality would be implemented here');
  };

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Combined Sales {currentYear}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comprehensive sales tracking from allocation to delivery
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportData}>
              <Download className="size-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Sales</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {totalSales}
                </p>
                <p className="text-xs text-gray-400 mt-1">Units sold</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <TrendingUp className="size-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Released Units</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {releasedUnits}
                </p>
                <p className="text-xs text-gray-400 mt-1">Delivered to clients</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <CheckCircle className="size-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Deliveries</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {pendingDeliveries}
                </p>
                <p className="text-xs text-gray-400 mt-1">Awaiting release</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <Clock className="size-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-xl font-semibold text-gray-900 mt-1">
                  ₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-400 mt-1">Invoice amount</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <DollarSign className="size-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
            <p className="text-sm text-blue-700 font-medium">Total PO Amount</p>
            <p className="text-2xl font-semibold text-blue-900 mt-1">
              ₱{totalPOAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
            <p className="text-sm text-green-700 font-medium">Total Gross Profit</p>
            <p className="text-2xl font-semibold text-green-900 mt-1">
              ₱{totalGrossProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 p-6">
            <p className="text-sm text-purple-700 font-medium">Average GP per Unit</p>
            <p className="text-2xl font-semibold text-purple-900 mt-1">
              ₱
              {totalSales > 0
                ? (totalGrossProfit / totalSales).toLocaleString('en-PH', {
                    minimumFractionDigits: 2,
                  })
                : '0.00'}
            </p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setIsFiltersOpen((prev) => !prev)}
          >
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {!isFiltersOpen && (
                <span className="text-xs text-gray-400 ml-2">
                  (click to expand)
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isFiltersOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleResetFilters();
                  }}
                >
                  Reset
                </Button>
              )}
              {isFiltersOpen ? (
                <ChevronUp className="size-4 text-gray-500" />
              ) : (
                <ChevronDown className="size-4 text-gray-500" />
              )}
            </div>
          </div>

          {isFiltersOpen && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Search
                  </label>
                  <Input
                    placeholder="Search by model, chassis, VIN, client..."
                    value={filters.searchTerm}
                    onChange={(e) =>
                      setFilters({ ...filters, searchTerm: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Model
                  </label>
                  <Select
                    value={filters.model}
                    onValueChange={(value) => setFilters({ ...filters, model: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Models" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Models</SelectItem>
                      {uniqueModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Dealer
                  </label>
                  <Select
                    value={filters.dealer}
                    onValueChange={(value) => setFilters({ ...filters, dealer: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Dealers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dealers</SelectItem>
                      {uniqueDealers.map((dealer) => (
                        <SelectItem key={dealer} value={dealer}>
                          {dealer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      setFilters({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  />
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{filteredVehicles.length}</span> of{' '}
                    <span className="font-semibold">{soldVehicles.length}</span> sales
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Combined Sales Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="font-semibold text-gray-900">
              Sales Records - {currentYear}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase sticky left-0 bg-gray-50">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Color
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Chassis No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    VIN No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CS No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Year Model
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    CSR Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Allocation
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PO Number
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    PO Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pull Out Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Color Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SPH Month Declared
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    LICA Invoice Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Name of Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice No.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Release Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    SC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GRM
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dealer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Terms
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Bank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Invoice Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    GP
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Extended Warranty
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    LTO Documents Transmittal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Remarks
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Pull Out Location
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={29}
                      className="px-4 py-8 text-center text-sm text-gray-500"
                    >
                      No sales records found matching the filters
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map((vehicle, index) => (
                    <tr
                      key={vehicle.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 sticky left-0 bg-white">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                        {vehicle.model}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.color}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">
                        {vehicle.chassisNo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-mono text-xs">
                        {vehicle.vinNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.csNo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.year}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-200"
                        >
                          {vehicle.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.allocation || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.poNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                        {vehicle.poAmount || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.pullOut
                          ? format(vehicle.pullOut, 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.colorCode || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.monthDeclared || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.invoiceDate
                          ? format(vehicle.invoiceDate, 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.nameOfClient || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.invoiceNumber || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.releaseDate
                          ? format(vehicle.releaseDate, 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.salesConsultant || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.generalManager || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.dealer}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.terms || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.bank || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium">
                        {vehicle.invoiceAmount || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap font-medium text-green-700">
                        {vehicle.grossProfit || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.extendedWarranty || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.ltoDocumentsTransmittal || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                        {vehicle.remarks}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {vehicle.location}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}