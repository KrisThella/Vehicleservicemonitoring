import { useState } from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { StatsCards } from './components/StatsCards';
import { VehicleTable, VehicleData } from './components/VehicleTable';
import { OverdueAlerts } from './components/OverdueAlerts';
import { HistoryPanel } from './components/HistoryPanel';
import { PricingModal } from './components/PricingModal';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Mock vehicle data based on TSMPC Inventory Monitoring
const mockVehicles: VehicleData[] = [
  // SOLD Units
  {
    id: 'sold-1',
    model: 'S-PRESSO 1.0 GL AGS',
    csNo: 'UD9868',
    plateNumber: 'NCT5532',
    color: 'SOLID FIRE RED',
    year: 2024,
    receivedDate: new Date('2024-05-25'),
    poNumber: 'PO2859',
    vinNumber: 'MAFAA22CM18J139137',
    dealer: 'TEAM AARON',
    status: 'SOLD',
    remarks: 'SOLD TO MR. Edson Domayug',
    location: 'CLIENT DELIVERED',
    unit: 'SOLD UNIT',
    pullOut: new Date('2024-11-15'),
    overdue: false,
    category: 'SALES',
    chassisNo: 'MAFAA22CM18J139137',
    engineNo: 'X12345',
    invoiceDate: new Date('2024-11-15'),
    nameOfClient: 'MR. EDSON DOMAYUG',
    invoiceNumber: 'PHS01281',
    releaseDate: new Date('2024-11-17'),
    jc: '2024-087',
    arm: 'BASA',
    terms: 'FINANCING',
    bank: 'PSB',
    invoiceAmount: '₱248,000.00',
    statementDeposit: new Date('2024-11-18'),
    ltoBankTransmittal: new Date('2024-11-20'),
    salesConsultant: 'JOHN SANTOS',
    generalManager: 'MR. ROBERTO CRUZ',
    grossProfit: '₱18,500.00',
    extendedWarranty: 'YES - 3 YEARS',
    ltoDocumentsTransmittal: 'TRANSMITTED - 2024-11-22',
    poAmount: '₱229,500.00',
  },
  {
    id: 'sold-2',
    model: 'DZIRE GLX CVT - HYBRID',
    csNo: 'UD25702',
    plateNumber: 'NCU7223',
    color: 'METALLIC MAGMA GRAY 2',
    year: 2024,
    receivedDate: new Date('2024-02-26'),
    poNumber: 'PO09166',
    vinNumber: 'MAFMG22CM70J110284',
    dealer: 'TEAM JAY-R',
    status: 'SOLD',
    remarks: 'SOLD TO MA. Mary Lou Laxina (Service)',
    location: 'CLIENT DELIVERED',
    unit: 'SOLD UNIT',
    pullOut: new Date('2024-03-01'),
    overdue: false,
    category: 'SALES',
    chassisNo: 'MAFMG22CM70J110284',
    engineNo: 'Y98765',
    invoiceDate: new Date('2024-03-01'),
    nameOfClient: 'MA. MARY LOU LAXINA',
    invoiceNumber: 'PHS01498',
    releaseDate: new Date('2024-03-03'),
    jc: '2024-012',
    arm: 'BASA',
    terms: 'FINANCING',
    bank: 'PSB',
    invoiceAmount: '₱1,088,000.00',
    statementDeposit: new Date('2024-03-04'),
    ltoBankTransmittal: new Date('2024-03-06'),
    salesConsultant: 'MARIA RIVERA',
    generalManager: 'MR. ROBERTO CRUZ',
    grossProfit: '₱42,300.00',
    extendedWarranty: 'YES - 5 YEARS',
    ltoDocumentsTransmittal: 'TRANSMITTED - 2024-03-10',
    poAmount: '₱1,045,700.00',
  },
  // ALLOCATION Units
  {
    id: 'allocation-1',
    model: 'JIMNY 1.5 GL MT',
    csNo: 'UD46410',
    plateNumber: 'N/A UNIT',
    color: 'MIDNIGHT BLACK',
    year: 2024,
    receivedDate: new Date('2024-02-18'),
    poNumber: 'PO11443',
    vinNumber: 'MAFMG22CM82J110285',
    dealer: 'TEAM JM',
    status: 'ON HOLD',
    remarks: 'FOR ALLOCATION - AWAITING APPROVAL OF TUAZON TO GET THE UNIT',
    location: 'HELD - ALLOCATION',
    unit: 'ALLOCATION',
    pullOut: null,
    overdue: false,
    category: 'ALLOCATION',
    allocation: 'BARNUEVO, ARNOLD',
    chassisNo: 'MAFMG22CM82J110285',
    engineNo: 'A33211',
    bodorCsnStatus: 'BASA',
    nameOfClient: 'PENDING',
    invoiceDate: new Date('2024-03-15'),
  },
  {
    id: 'allocation-2',
    model: 'APV 1.6 GA MT',
    csNo: 'UD25908',
    plateNumber: 'N/A UNIT',
    color: 'SILKY SILVER METALLIC',
    year: 2024,
    receivedDate: new Date('2024-01-24'),
    poNumber: 'PO09322',
    vinNumber: 'MAFAA22CM10J110014',
    dealer: 'TEAM AARON',
    status: 'ON HOLD',
    remarks: 'FOR ALLOCATION - AWAITING APPROVAL',
    location: 'HELD - ALLOCATION',
    unit: 'ALLOCATION',
    pullOut: null,
    overdue: false,
    category: 'ALLOCATION',
    allocation: 'VASQUEZ, JOANNA',
    chassisNo: 'MAFAA22CM10J110014',
    engineNo: 'B44432',
    bodorCsnStatus: 'BASA',
    nameOfClient: 'ON HOLD',
  },
  // AVAILABLE Units - ON TRACK
  {
    id: 'available-1',
    model: 'APV 1.6 GA AT',
    csNo: 'UD44330',
    plateNumber: 'NCH6612',
    color: 'GRAPHITE GREY METALLIC',
    year: 2024,
    receivedDate: new Date('2024-01-25'),
    poNumber: 'PO3511',
    vinNumber: 'MAFAA22CM73J139246',
    dealer: 'TEAM AARON',
    status: 'ON TRACK',
    remarks: 'SERVICE VEHICLE FOR OPERATION',
    location: 'TEAM AARON',
    unit: 'DEMO UNIT',
    pullOut: null,
    overdue: false,
    category: 'AVAILABLE',
    chassisNo: 'MAFAA22CM73J139246',
    engineNo: 'C55543',
    plAmount: '569,700.06',
    dealerAtNo: 'PHS01311',
    niAccount: 'LAS-000000001',
  },
  {
    id: 'available-2',
    model: 'CARRY UTILITY VAN',
    csNo: 'UD50634',
    plateNumber: 'NCS2552',
    color: 'WHITE',
    year: 2024,
    receivedDate: new Date('2024-03-10'),
    poNumber: 'PO10054',
    vinNumber: 'MAFAA22CM95J139321',
    dealer: 'TEAM JAY-R',
    status: 'ON TRACK',
    remarks: 'SERVICE VEHICLE FOR OPERATION (DEMO)',
    location: 'TEAM JAY-R',
    unit: 'DEMO UNIT',
    pullOut: null,
    overdue: false,
    category: 'AVAILABLE',
    chassisNo: 'MAFAA22CM95J139321',
    engineNo: 'D66654',
    plAmount: '578,750.06',
    dealerAtNo: 'PHS01312',
  },
  // IN TRANSIT Units
  {
    id: 'transit-1',
    model: 'S-PRESSO 1.0 GL MT',
    csNo: 'UD50640',
    plateNumber: 'N/A UNIT',
    color: 'SOLID FIRE RED',
    year: 2024,
    receivedDate: new Date('2025-02-26'),
    poNumber: 'PO09932',
    vinNumber: 'MAFAA22CM18J140012',
    dealer: 'TEAM AARON',
    status: 'IN TRANSIT',
    remarks: 'IN TRANSIT',
    location: 'IN TRANSIT',
    unit: 'IN TRANSIT',
    pullOut: null,
    overdue: false,
    category: 'IN TRANSIT',
    allocation: 'BASA',
    chassisNo: 'MAFAA22CM18J140012',
    engineNo: 'E77765',
  },
  {
    id: 'transit-2',
    model: 'S-PRESSO 1.0 GL AGS',
    csNo: 'UD50642',
    plateNumber: 'N/A UNIT',
    color: 'GRANITE GREY',
    year: 2024,
    receivedDate: new Date('2025-02-26'),
    poNumber: 'PO09934',
    vinNumber: 'MAFAA22CM18J140013',
    dealer: 'TEAM JAY-R',
    status: 'IN TRANSIT',
    remarks: 'IN TRANSIT',
    location: 'IN TRANSIT',
    unit: 'IN TRANSIT',
    pullOut: null,
    overdue: false,
    category: 'IN TRANSIT',
    allocation: 'BASA',
    chassisNo: 'MAFAA22CM18J140013',
    engineNo: 'E77766',
  },
  // DEMO Units
  {
    id: 'demo-1',
    model: 'ERTIGA 1.5 GLX AT - HYBRID',
    csNo: 'B151093',
    plateNumber: 'N5E1532',
    color: 'RADIANT RED PEARL',
    year: 2024,
    receivedDate: new Date('2024-05-25'),
    poNumber: 'PO2859',
    vinNumber: 'MREA86CMH1119629',
    dealer: 'TEAM JM',
    status: 'HELD',
    remarks: 'SERVICE VEHICLE FOR OPERATION',
    location: 'FOR RETENTION',
    unit: 'TEAM JM',
    pullOut: null,
    overdue: false,
    category: 'DEMO',
    serdis: 'TEAM JM',
  },
  {
    id: 'demo-2',
    model: 'ERTIGA 1.5 GL AT - HYBRID',
    csNo: 'H151094',
    plateNumber: 'N6E5832',
    color: 'ARCTIC WHITE PEARL',
    year: 2024,
    receivedDate: new Date('2024-07-31'),
    poNumber: 'PO3127',
    vinNumber: 'MREAJ6CM16J109257',
    dealer: 'TEAM AARON',
    status: 'HELD',
    remarks: 'SERVICE VEHICLE FOR OPERATION',
    location: 'FOR RETENTION',
    unit: 'TEAM AARON',
    pullOut: null,
    overdue: false,
    category: 'DEMO',
    serdis: 'TEAM AARON',
  },
  // More varied data
  {
    id: 'sales-1',
    model: 'CELERIO GL AGS',
    csNo: 'HD25904',
    plateNumber: 'N/A UNIT',
    color: 'ARCTIC WHITE PEARL METALLIC',
    year: 2024,
    receivedDate: new Date('2024-01-18'),
    poNumber: 'PO09312',
    vinNumber: 'TSMPP22MW021011555',
    dealer: 'TEAM JAY-R',
    status: 'Completed',
    remarks: 'All services completed, ready for pull-out',
    location: 'READY FOR DELIVERY',
    unit: 'Service Unit B',
    pullOut: new Date('2024-04-02'),
    overdue: false,
    category: 'SALES',
    chassisNo: 'TSMPP22MW021011555',
    engineNo: 'F88877',
    invoiceAmount: '₱495,000.00',
    bank: 'UNIONBANK',
    terms: 'FINANCING',
  },
  {
    id: 'sales-2',
    model: 'CELERIO GL CVT',
    csNo: 'QD25906',
    plateNumber: 'N/A UNIT',
    color: 'METALLIC MINERAL GRAY 2',
    year: 2024,
    receivedDate: new Date('2024-01-24'),
    poNumber: 'PO09322',
    vinNumber: 'MAFAA22CM10J110014',
    dealer: 'TEAM JM',
    status: 'Overdue',
    remarks: 'Waiting for parts delivery - brake system repair',
    location: 'SERVICE BAY 3',
    unit: 'Service Unit C',
    pullOut: null,
    overdue: true,
    category: 'SALES',
    chassisNo: 'MAFAA22CM10J110014',
    engineNo: 'G99988',
  },
  {
    id: 'sales-3',
    model: 'ERTIGA 1.5 GL MT - HYBRID',
    csNo: 'GD25910',
    plateNumber: 'N/A UNIT',
    color: 'PEARL SNOW WHITE',
    year: 2024,
    receivedDate: new Date('2024-02-26'),
    poNumber: 'PO11443',
    vinNumber: 'MAFMG22CM70J110284',
    dealer: 'TEAM AARON',
    status: 'On Process',
    remarks: 'Regular maintenance and oil change',
    location: 'SERVICE BAY 5',
    unit: 'Service Unit A',
    pullOut: null,
    overdue: false,
    category: 'SALES',
    chassisNo: 'MAFMG22CM70J110284',
    engineNo: 'H11199',
  },
  {
    id: 'allocation-3',
    model: 'ERTIGA 1.5 GLX MT - HYBRID',
    csNo: 'D25911',
    plateNumber: '504410',
    color: 'PRIME COOL BLACK',
    year: 2024,
    receivedDate: new Date('2024-02-26'),
    poNumber: 'PO11443',
    vinNumber: 'MAFMG22CM70J110285',
    dealer: 'TEAM JAY-R',
    status: 'ON HOLD',
    remarks: 'Scheduled for inspection',
    location: 'WAITING AREA',
    unit: 'Service Unit B',
    pullOut: null,
    overdue: false,
    category: 'ALLOCATION',
    allocation: 'GARCIA, LORETO',
    chassisNo: 'MAFMG22CM70J110285',
    engineNo: 'I22211',
    bodorCsnStatus: 'BASA',
  },
  {
    id: 'sales-4',
    model: 'XL7 1.5 GLX AT - HYBRID',
    csNo: 'D44330',
    plateNumber: 'N/A UNIT',
    color: 'PEARL ARCTIC WHITE 4',
    year: 2024,
    receivedDate: new Date('2024-03-15'),
    poNumber: 'PO11582',
    vinNumber: 'MAFMG22CM70J110286',
    dealer: 'TEAM JM',
    status: 'On Process',
    remarks: 'Transmission service in progress',
    location: 'SERVICE BAY 6',
    unit: 'Service Unit C',
    pullOut: new Date('2024-04-10'),
    overdue: false,
    category: 'SALES',
    chassisNo: 'MAFMG22CM70J110286',
    engineNo: 'J33322',
  },
  {
    id: 'transit-3',
    model: 'XL7 1.5 GLX MT - HYBRID',
    csNo: 'D44331',
    plateNumber: 'N/A UNIT',
    color: 'BRAVE KHAKI PEARL',
    year: 2024,
    receivedDate: new Date('2024-03-20'),
    poNumber: 'PO11582',
    vinNumber: 'MAFMG22CM70J110287',
    dealer: 'TEAM JAY-R',
    status: 'IN TRANSIT',
    remarks: 'Parts on backorder - awaiting supplier delivery',
    location: 'IN TRANSIT',
    unit: 'IN TRANSIT',
    pullOut: null,
    overdue: true,
    category: 'IN TRANSIT',
    allocation: 'BASA',
    chassisNo: 'MAFMG22CM70J110287',
    engineNo: 'K44433',
  },
  {
    id: 'pull-out-1',
    model: 'SWIFT 1.2 GL CVT',
    csNo: 'D46410',
    plateNumber: 'NCE1223',
    color: 'PEARL ARCTIC WHITE 1',
    year: 2024,
    receivedDate: new Date('2024-03-18'),
    poNumber: 'PO09932',
    vinNumber: 'MAFAA22CM11J000022',
    dealer: 'TEAM AARON',
    status: 'Completed',
    remarks: 'SERVICE UNIT, Shaw Bansaray',
    location: 'READY FOR DELIVERY',
    unit: 'Service Unit A',
    pullOut: new Date('2024-03-31'),
    overdue: false,
    category: 'PULL OUT MONITORING',
    chassisNo: 'MAFAA22CM11J000022',
    engineNo: 'L55544',
  },
  {
    id: 'demo-3',
    model: 'JIMNY SDR GLX AT',
    csNo: 'D46420',
    plateNumber: 'NCG2554',
    color: 'METALLIC BRISK BLUE / BLACK',
    year: 2024,
    receivedDate: new Date('2024-03-22'),
    poNumber: 'PO09934',
    vinNumber: 'TSMHF22CM08J116652',
    dealer: 'TEAM JAY-R',
    status: 'HELD',
    remarks: 'DEMO UNIT',
    location: 'SERVICE BAY 8',
    unit: 'Service Unit B',
    pullOut: null,
    overdue: false,
    category: 'DEMO',
    chassisNo: 'TSMHF22CM08J116652',
    engineNo: 'M66655',
  },
  {
    id: 'available-3',
    model: 'CARRY CAB & CHASSIS',
    csNo: 'D46456',
    plateNumber: 'NCH3344',
    color: 'WHITE',
    year: 2024,
    receivedDate: new Date('2024-03-25'),
    poNumber: 'PO09944',
    vinNumber: 'MREAZ6CM77J199227',
    dealer: 'TEAM JM',
    status: 'ON TRACK',
    remarks: 'Initial inspection pending',
    location: 'HOLDING AREA',
    unit: 'Service Unit C',
    pullOut: null,
    overdue: false,
    category: 'AVAILABLE',
    chassisNo: 'MREAZ6CM77J199227',
    engineNo: 'N77766',
  },
  {
    id: 'sales-5',
    model: 'DZIRE GL MT',
    csNo: 'UD50634',
    plateNumber: 'N/A UNIT',
    color: 'ARCTIC WHITE PEARL METALLIC',
    year: 2024,
    receivedDate: new Date('2024-03-27'),
    poNumber: 'PO10054',
    vinNumber: 'MREAF6CM19J177845',
    dealer: 'TEAM AARON',
    status: 'On Process',
    remarks: 'Full inspection and maintenance',
    location: 'SERVICE BAY 9',
    unit: 'Service Unit D',
    pullOut: new Date('2024-04-08'),
    overdue: false,
    category: 'SALES',
    chassisNo: 'MREAF6CM19J177845',
    engineNo: 'O88877',
  },
  {
    id: 'sales-6',
    model: 'DZIRE GL CVT',
    csNo: 'BD50640',
    plateNumber: 'NCH6612',
    color: 'PREMIUM SILVER METALLIC',
    year: 2024,
    receivedDate: new Date('2024-03-12'),
    poNumber: 'PO10000009',
    vinNumber: 'MAEAZ6CM88J188654',
    dealer: 'TEAM JAY-R',
    status: 'Overdue',
    remarks: 'Customer delayed parts approval - engine repair needed',
    location: 'SERVICE BAY 10',
    unit: 'Service Unit A',
    pullOut: null,
    overdue: true,
    category: 'SALES',
    chassisNo: 'MAEAZ6CM88J188654',
    engineNo: 'P99988',
  },
  {
    id: 'pull-out-2',
    model: 'SWIFT 2.2 GL CVT',
    csNo: 'HD50642',
    plateNumber: 'N/A UNIT',
    color: 'PEARL SUPER BLACK 2',
    year: 2024,
    receivedDate: new Date('2024-03-28'),
    poNumber: 'PO10000054',
    vinNumber: 'MAEAZ6CM99J199662',
    dealer: 'TEAM JM',
    status: 'Completed',
    remarks: 'HELD TO CAVMAN',
    location: 'READY FOR DELIVERY',
    unit: 'Service Unit B',
    pullOut: new Date('2024-04-01'),
    overdue: false,
    category: 'PULL OUT MONITORING',
    chassisNo: 'MAEAZ6CM99J199662',
    engineNo: 'Q11199',
  },
];

export default function App() {
  const [vehicles] = useState<VehicleData[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedDealer, setSelectedDealer] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [showPricingModal, setShowPricingModal] = useState(false);

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
    if (selectedStatus !== 'all' && vehicle.status !== selectedStatus) {
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
    toast.success('Exporting data to CSV...');
  };

  const handleViewHistory = (vehicle: VehicleData) => {
    setSelectedVehicle(vehicle);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenPricing={() => setShowPricingModal(true)} />
      
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

      <main className="px-6 py-6 space-y-6">
        {/* Stats Cards */}
        <StatsCards vehicles={filteredVehicles} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicle Table - Takes 2 columns */}
          <div className="lg:col-span-2">
            <VehicleTable data={filteredVehicles} onViewHistory={handleViewHistory} />
            
            {filteredVehicles.length === 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No vehicles found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Overdue Alerts - Takes 1 column */}
          <div className="lg:col-span-1">
            <OverdueAlerts vehicles={filteredVehicles} />
          </div>
        </div>
      </main>

      {/* History Panel Overlay */}
      {selectedVehicle && (
        <HistoryPanel
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <PricingModal onClose={() => setShowPricingModal(false)} />
      )}

      <Toaster />
    </div>
  );
}