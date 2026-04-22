import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import {
  Truck,
  Filter,
  ChevronDown,
  ChevronUp,
  Download,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Package,
  TrendingUp,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { AddInTransitModal, InTransitEntry } from '../components/AddInTransitModal';

// ── Types ──────────────────────────────────────────────────────────────────────

type TransitStatus =
  | 'IN TRANSIT'
  | 'ARRIVED – FOR INSPECTION'
  | 'PENDING RELEASE'
  | 'RELEASED'
  | 'DELAYED';

interface InTransitUnit {
  id: string;
  model: string;
  color: string;
  chassisNo: string;
  engineNo: string;
  remarks: string;
  pullOutLocation: string;
  csNo: string;
  yearModel: number;
  clientName: string;
  dealer: string;
  poNumber: string;
  poAmount: number;
  pullOutDate: string;
  pullOutDateRaw: Date;
  colorCode: string;
  declaredMonth: string;
  currentLocation: string;
  dpReservation: string;
  status: TransitStatus;
  targetReleaseDate: string;
  targetReleaseDateRaw: Date;
  remarks2: string;
}

interface AllocationRow {
  model: string;
  allocation: number;
  inTransit: number;
  totalReceived: number;
  open: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const today = new Date('2026-04-10');

const mockTransitUnits: InTransitUnit[] = [
  {
    id: 'it-001',
    model: 'ERTIGA 1.5 GL MT',
    color: 'METALLIC PREMIUM SILVER',
    chassisNo: 'MAFHA21SXM7100221',
    engineNo: 'G15B-ZA1002211',
    remarks: 'For fleet client',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00112',
    yearModel: 2026,
    clientName: 'LBC EXPRESS INC.',
    dealer: 'TEAM AARON',
    poNumber: 'PO30112',
    poAmount: 880_000,
    pullOutDate: 'Apr 02, 2026',
    pullOutDateRaw: new Date('2026-04-02'),
    colorCode: 'ZMC',
    declaredMonth: 'April 2026',
    currentLocation: 'NLEX – PAMPANGA AREA',
    dpReservation: '₱88,000',
    status: 'IN TRANSIT',
    targetReleaseDate: 'Apr 12, 2026',
    targetReleaseDateRaw: new Date('2026-04-12'),
    remarks2: 'ETA 2 days',
  },
  {
    id: 'it-002',
    model: 'DZIRE GL MT',
    color: 'SOLID FIRE RED',
    chassisNo: 'MAFMG22SXM7200445',
    engineNo: 'K14B-ZA2004451',
    remarks: 'Bank financing – BPI',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00289',
    yearModel: 2026,
    clientName: 'MS. ANNA REYES',
    dealer: 'TEAM JAY-R',
    poNumber: 'PO30234',
    poAmount: 695_000,
    pullOutDate: 'Apr 03, 2026',
    pullOutDateRaw: new Date('2026-04-03'),
    colorCode: 'ZHH',
    declaredMonth: 'April 2026',
    currentLocation: 'TSMPC SHAW – PARKING',
    dpReservation: '₱50,000',
    status: 'ARRIVED – FOR INSPECTION',
    targetReleaseDate: 'Apr 10, 2026',
    targetReleaseDateRaw: new Date('2026-04-10'),
    remarks2: 'Inspection ongoing',
  },
  {
    id: 'it-003',
    model: 'SWIFT GL MT',
    color: 'METALLIC MAGMA GRAY 2',
    chassisNo: 'MAFZD51SXM7300678',
    engineNo: 'Z12E-ZA3006781',
    remarks: 'Cash transaction',
    pullOutLocation: 'SPH BATANGAS HUB',
    csNo: 'UE00301',
    yearModel: 2026,
    clientName: 'MR. CARLOS DELA CRUZ',
    dealer: 'TEAM JM',
    poNumber: 'PO30345',
    poAmount: 850_000,
    pullOutDate: 'Apr 01, 2026',
    pullOutDateRaw: new Date('2026-04-01'),
    colorCode: 'ZJJ',
    declaredMonth: 'April 2026',
    currentLocation: 'TSMPC SHAW – FOR RELEASE',
    dpReservation: '₱85,000',
    status: 'PENDING RELEASE',
    targetReleaseDate: 'Apr 09, 2026',
    targetReleaseDateRaw: new Date('2026-04-09'),
    remarks2: 'LTO docs pending – 1 pcs',
  },
  {
    id: 'it-004',
    model: 'S-PRESSO 1.0 GL AGS',
    color: 'SOLID SIZZLING ORANGE',
    chassisNo: 'MAFAA22SXM7400112',
    engineNo: 'X01B-ZA4001121',
    remarks: 'Demo unit pullout',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00088',
    yearModel: 2026,
    clientName: '— (DEMO)',
    dealer: 'TEAM AARON',
    poNumber: 'PO30056',
    poAmount: 648_000,
    pullOutDate: 'Mar 28, 2026',
    pullOutDateRaw: new Date('2026-03-28'),
    colorCode: 'ZQF',
    declaredMonth: 'March 2026',
    currentLocation: 'TSMPC SHAW – SHOWROOM',
    dpReservation: '—',
    status: 'RELEASED',
    targetReleaseDate: 'Apr 05, 2026',
    targetReleaseDateRaw: new Date('2026-04-05'),
    remarks2: 'Placed in showroom display',
  },
  {
    id: 'it-005',
    model: 'FRONX GL HYBRID',
    color: 'METALLIC GRANDEUR GRAY',
    chassisNo: 'MAFFY22SXM7500339',
    engineNo: 'Z12E-ZA5003391',
    remarks: 'Financing – RCBC',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00422',
    yearModel: 2026,
    clientName: 'ATTY. JOSE MIRANDA',
    dealer: 'TEAM JM',
    poNumber: 'PO30489',
    poAmount: 1_165_000,
    pullOutDate: 'Apr 05, 2026',
    pullOutDateRaw: new Date('2026-04-05'),
    colorCode: 'ZLH',
    declaredMonth: 'April 2026',
    currentLocation: 'EN ROUTE – SLEX',
    dpReservation: '₱116,500',
    status: 'IN TRANSIT',
    targetReleaseDate: 'Apr 11, 2026',
    targetReleaseDateRaw: new Date('2026-04-11'),
    remarks2: 'Driver: Romy – 09171234567',
  },
  {
    id: 'it-006',
    model: 'CELERIO 1.0 GL MT',
    color: 'PEARL METALLIC ORANGE RED',
    chassisNo: 'MAFLA31SXM7600554',
    engineNo: 'Z10A-ZA6005541',
    remarks: 'Late pickup – loading delayed',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00199',
    yearModel: 2026,
    clientName: 'MR. RODEL BAUTISTA',
    dealer: 'TEAM JAY-R',
    poNumber: 'PO30200',
    poAmount: 598_000,
    pullOutDate: 'Mar 25, 2026',
    pullOutDateRaw: new Date('2026-03-25'),
    colorCode: 'ZQQ',
    declaredMonth: 'March 2026',
    currentLocation: 'TSMPC SHAW – HOLDING AREA',
    dpReservation: '₱30,000',
    status: 'DELAYED',
    targetReleaseDate: 'Apr 05, 2026',
    targetReleaseDateRaw: new Date('2026-04-05'),
    remarks2: 'Bank OR/CR not yet ready',
  },
  {
    id: 'it-007',
    model: 'ERTIGA 1.5 GA MT',
    color: 'SOLID WHITE',
    chassisNo: 'MAFHA21SXM7700788',
    engineNo: 'G15B-ZA7007881',
    remarks: 'Fleet – govt unit',
    pullOutLocation: 'SPH BATANGAS HUB',
    csNo: 'UE00512',
    yearModel: 2026,
    clientName: 'MAKATI CITY LGU',
    dealer: 'TEAM AARON',
    poNumber: 'PO30560',
    poAmount: 855_000,
    pullOutDate: 'Apr 04, 2026',
    pullOutDateRaw: new Date('2026-04-04'),
    colorCode: 'ZW4',
    declaredMonth: 'April 2026',
    currentLocation: 'EN ROUTE – STAR TOLLWAY',
    dpReservation: '—',
    status: 'IN TRANSIT',
    targetReleaseDate: 'Apr 14, 2026',
    targetReleaseDateRaw: new Date('2026-04-14'),
    remarks2: 'With COA inspection schedule',
  },
  {
    id: 'it-008',
    model: 'DZIRE GLX CVT HYBRID',
    color: 'METALLIC PREMIUM SILVER',
    chassisNo: 'MAFMG22SXM7800901',
    engineNo: 'K14B-ZA8009011',
    remarks: 'High-value unit – bank repo replacement',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00633',
    yearModel: 2026,
    clientName: 'SECURITY BANK',
    dealer: 'TEAM JM',
    poNumber: 'PO30622',
    poAmount: 1_045_000,
    pullOutDate: 'Apr 06, 2026',
    pullOutDateRaw: new Date('2026-04-06'),
    colorCode: 'ZMC',
    declaredMonth: 'April 2026',
    currentLocation: 'TSMPC SHAW – PARKING B',
    dpReservation: '—',
    status: 'ARRIVED – FOR INSPECTION',
    targetReleaseDate: 'Apr 13, 2026',
    targetReleaseDateRaw: new Date('2026-04-13'),
    remarks2: 'SB coordinator: 09281112233',
  },
  {
    id: 'it-009',
    model: 'JIMNY 1.5 GL AT',
    color: 'SOLID JUNGLE GREEN',
    chassisNo: 'MAFSN51SXM7901234',
    engineNo: 'M15A-ZA9012341',
    remarks: 'Priority client – expedite LTO',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00701',
    yearModel: 2026,
    clientName: 'MR. DIEGO SANTOS',
    dealer: 'TEAM JAY-R',
    poNumber: 'PO30710',
    poAmount: 1_398_000,
    pullOutDate: 'Apr 07, 2026',
    pullOutDateRaw: new Date('2026-04-07'),
    colorCode: 'Z6S',
    declaredMonth: 'April 2026',
    currentLocation: 'TSMPC SHAW – FOR RELEASE',
    dpReservation: '₱139,800',
    status: 'PENDING RELEASE',
    targetReleaseDate: 'Apr 11, 2026',
    targetReleaseDateRaw: new Date('2026-04-11'),
    remarks2: 'Waiting for OR/CR – PSB',
  },
  {
    id: 'it-011',
    model: 'SWIFT GL CVT',
    color: 'SOLID PEARL WHITE',
    chassisNo: 'MAFZD51SXM8100667',
    engineNo: 'Z12E-ZA1006671',
    remarks: 'Cash buyer – urgent',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00899',
    yearModel: 2026,
    clientName: 'MS. KATHLEEN TAN',
    dealer: 'TEAM JM',
    poNumber: 'PO30900',
    poAmount: 930_000,
    pullOutDate: 'Apr 09, 2026',
    pullOutDateRaw: new Date('2026-04-09'),
    colorCode: 'YK9',
    declaredMonth: 'April 2026',
    currentLocation: 'TSMPC SHAW – PARKING A',
    dpReservation: '₱93,000',
    status: 'ARRIVED – FOR INSPECTION',
    targetReleaseDate: 'Apr 12, 2026',
    targetReleaseDateRaw: new Date('2026-04-12'),
    remarks2: 'Inspection scheduled – Apr 10',
  },
  {
    id: 'it-012',
    model: 'FRONX GL+ HYBRID',
    color: 'METALLIC MINERAL GRAY',
    chassisNo: 'MAFFY22SXM8200780',
    engineNo: 'Z12E-ZA2007801',
    remarks: 'Delayed due to weather',
    pullOutLocation: 'SPH LAGUNA WAREHOUSE',
    csNo: 'UE00944',
    yearModel: 2026,
    clientName: 'MRS. ELENA QUISUMBING',
    dealer: 'TEAM JAY-R',
    poNumber: 'PO30950',
    poAmount: 1_230_000,
    pullOutDate: 'Mar 30, 2026',
    pullOutDateRaw: new Date('2026-03-30'),
    colorCode: 'ZLG',
    declaredMonth: 'March 2026',
    currentLocation: 'HOLDING – FLOODED AREA BYPASS',
    dpReservation: '₱123,000',
    status: 'DELAYED',
    targetReleaseDate: 'Apr 08, 2026',
    targetReleaseDateRaw: new Date('2026-04-08'),
    remarks2: 'Road clearance awaited',
  },
];

// ── Allocation Summary data ────────────────────────────────────────────────────

const allocationData: AllocationRow[] = [
  { model: 'Ertiga GL/GA', allocation: 15, inTransit: 2, totalReceived: 13, open: 2 },
  { model: 'Dzire GL/GLX', allocation: 12, inTransit: 2, totalReceived: 10, open: 2 },
  { model: 'Swift GL/CVT', allocation: 10, inTransit: 2, totalReceived: 8, open: 2 },
  { model: 'S-Presso',     allocation: 8,  inTransit: 1, totalReceived: 7,  open: 1 },
  { model: 'Fronx GL/GL+', allocation: 10, inTransit: 2, totalReceived: 8,  open: 2 },
  { model: 'Celerio GL',   allocation: 6,  inTransit: 1, totalReceived: 5,  open: 1 },
  { model: 'Jimny GL',     allocation: 5,  inTransit: 1, totalReceived: 4,  open: 1 },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  TransitStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  'IN TRANSIT':               { label: 'IN TRANSIT',               bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-500' },
  'ARRIVED – FOR INSPECTION': { label: 'ARRIVED – FOR INSPECTION', bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-500' },
  'PENDING RELEASE':          { label: 'PENDING RELEASE',          bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  'RELEASED':                 { label: 'RELEASED',                 bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  'DELAYED':                  { label: 'DELAYED',                  bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-500' },
};

const isOverdue = (unit: InTransitUnit) =>
  unit.status !== 'RELEASED' && unit.targetReleaseDateRaw < today;

const formatCurrency = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between gap-4">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`${accent} p-3 rounded-xl flex-shrink-0`}>{icon}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransitStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function InTransitPage() {
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [filterModel, setFilterModel] = useState('all');
  const [filterDealer, setFilterDealer] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addedEntries, setAddedEntries] = useState<InTransitEntry[]>([]);

  // Unique filter options
  const uniqueModels = Array.from(new Set(mockTransitUnits.map((u) => u.model))).sort();
  const uniqueDealers = Array.from(new Set(mockTransitUnits.map((u) => u.dealer))).sort();
  const uniqueLocations = Array.from(
    new Set(mockTransitUnits.map((u) => u.currentLocation))
  ).sort();
  const uniqueStatuses = Array.from(new Set(mockTransitUnits.map((u) => u.status))).sort();

  // Filtered units
  const filtered = useMemo(() => {
    return mockTransitUnits.filter((u) => {
      if (filterModel !== 'all' && u.model !== filterModel) return false;
      if (filterDealer !== 'all' && u.dealer !== filterDealer) return false;
      if (filterLocation !== 'all' && u.currentLocation !== filterLocation) return false;
      if (filterStatus !== 'all' && u.status !== filterStatus) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !u.model.toLowerCase().includes(s) &&
          !u.chassisNo.toLowerCase().includes(s) &&
          !u.clientName.toLowerCase().includes(s) &&
          !u.csNo.toLowerCase().includes(s) &&
          !u.poNumber.toLowerCase().includes(s) &&
          !u.engineNo.toLowerCase().includes(s)
        )
          return false;
      }
      return true;
    });
  }, [search, filterModel, filterDealer, filterLocation, filterStatus]);

  const resetFilters = () => {
    setSearch('');
    setFilterModel('all');
    setFilterDealer('all');
    setFilterLocation('all');
    setFilterStatus('all');
  };

  // Summary counts
  const totalUnits = mockTransitUnits.length;
  const inTransitCount = mockTransitUnits.filter((u) => u.status === 'IN TRANSIT').length;
  const delayedCount = mockTransitUnits.filter((u) => isOverdue(u)).length;
  const releasedCount = mockTransitUnits.filter((u) => u.status === 'RELEASED').length;

  // Allocation totals
  const allotTotal = allocationData.reduce((s, r) => s + r.allocation, 0);
  const allotInTransit = allocationData.reduce((s, r) => s + r.inTransit, 0);
  const allotReceived = allocationData.reduce((s, r) => s + r.totalReceived, 0);
  const allotOpen = allocationData.reduce((s, r) => s + r.open, 0);

  // Active filter count badge
  const activeFilterCount = [
    filterModel !== 'all',
    filterDealer !== 'all',
    filterLocation !== 'all',
    filterStatus !== 'all',
    search !== '',
  ].filter(Boolean).length;

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-6">

        {/* ── Page Title ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Truck className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IN TRANSIT</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Vehicle transit monitoring & allocation tracking – 2026
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="size-4 mr-1.5" />
              Export
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)}>
              <Plus className="size-4 mr-1.5" />
              Add Unit
            </Button>
          </div>
        </div>

        {/* ── Top Summary Cards ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Units Monitored"
            value={totalUnits}
            sub="All transit records"
            accent="bg-blue-50"
            icon={<Package className="size-6 text-blue-600" />}
          />
          <StatCard
            label="Currently In Transit"
            value={inTransitCount}
            sub="On the road now"
            accent="bg-indigo-50"
            icon={<Truck className="size-6 text-indigo-600" />}
          />
          <StatCard
            label="Released Units"
            value={releasedCount}
            sub="Delivered to clients"
            accent="bg-green-50"
            icon={<CheckCircle2 className="size-6 text-green-600" />}
          />
          <StatCard
            label="Delayed / Overdue"
            value={delayedCount}
            sub="Past target release date"
            accent="bg-red-50"
            icon={<AlertTriangle className="size-6 text-red-500" />}
          />
        </div>

        {/* ── Allocation Summary Dashboard ─────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="font-semibold text-blue-900 text-base flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-600" />
              Allocation Summary Dashboard
            </h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Overall allocation quick stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Allocation', value: allotTotal, color: 'text-gray-800', bg: 'bg-gray-50 border-gray-200' },
                { label: 'In Transit',        value: allotInTransit, color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200' },
                { label: 'Total Received',    value: allotReceived, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
                { label: 'Open / Remaining',  value: allotOpen, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`rounded-lg border p-4 text-center ${item.bg}`}
                >
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Bar chart - Pure CSS */}
            <div>
              <p className="text-sm font-medium text-gray-600 mb-3">Allocation vs. Received vs. In Transit (by Model)</p>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mb-4 flex-wrap text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#bfdbfe' }} />
                  <span className="text-gray-600">Allocation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
                  <span className="text-gray-600">Total Received</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#6366f1' }} />
                  <span className="text-gray-600">In Transit</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f97316' }} />
                  <span className="text-gray-600">Open / Remaining</span>
                </div>
              </div>

              {/* Chart */}
              <div className="relative bg-gray-50/50 rounded-lg p-4">
                {/* Y-axis grid lines */}
                <div className="absolute inset-4 flex flex-col justify-between pointer-events-none">
                  {[0, 5, 10, 15, 20].reverse().map((val) => (
                    <div key={val} className="flex items-center">
                      <span className="text-[10px] text-gray-400 w-6 -ml-8">{val}</span>
                      <div className="flex-1 border-t border-dashed border-gray-200" />
                    </div>
                  ))}
                </div>

                {/* Bars */}
                <div className="relative flex items-end justify-around gap-2 h-[220px] px-2">
                  {allocationData.map((row) => {
                    const maxVal = 20; // Y-axis max
                    const barWidth = 'w-full';
                    const spacing = 'gap-0.5';

                    return (
                      <div key={row.model} className="flex-1 flex flex-col items-center gap-2">
                        {/* Bar group */}
                        <div className={`flex items-end justify-center ${spacing} w-full h-full`}>
                          {/* Allocation bar */}
                          <div
                            className={`${barWidth} bg-blue-200 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{ height: `${(row.allocation / maxVal) * 100}%` }}
                            title={`Allocation: ${row.allocation}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.allocation}
                            </div>
                          </div>

                          {/* Total Received bar */}
                          <div
                            className={`${barWidth} bg-blue-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{ height: `${(row.totalReceived / maxVal) * 100}%` }}
                            title={`Total Received: ${row.totalReceived}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.totalReceived}
                            </div>
                          </div>

                          {/* In Transit bar */}
                          <div
                            className={`${barWidth} bg-indigo-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{ height: `${(row.inTransit / maxVal) * 100}%` }}
                            title={`In Transit: ${row.inTransit}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.inTransit}
                            </div>
                          </div>

                          {/* Open bar */}
                          <div
                            className={`${barWidth} bg-orange-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer group relative`}
                            style={{ height: `${(row.open / maxVal) * 100}%` }}
                            title={`Open / Remaining: ${row.open}`}
                          >
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              {row.open}
                            </div>
                          </div>
                        </div>

                        {/* X-axis label */}
                        <div className="text-[10px] text-gray-500 text-center leading-tight max-w-full px-1">
                          {row.model}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Per-model allocation table */}
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Model</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Allocation</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 uppercase">In Transit</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Total Received</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-orange-600 uppercase">Open Units</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allocationData.map((row) => {
                    const pct = Math.round((row.totalReceived / row.allocation) * 100);
                    return (
                      <tr key={row.model} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">{row.model}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{row.allocation}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full font-semibold text-xs">
                            {row.inTransit}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-gray-700">{row.totalReceived}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-semibold text-xs ${
                              row.open > 0
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {row.open}
                          </span>
                        </td>
                        <td className="px-4 py-3 min-w-[140px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td className="px-4 py-3 font-bold text-blue-800">TOTAL</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-800">{allotTotal}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-700">{allotInTransit}</td>
                    <td className="px-4 py-3 text-center font-bold text-blue-800">{allotReceived}</td>
                    <td className="px-4 py-3 text-center font-bold text-orange-700">{allotOpen}</td>
                    <td className="px-4 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* ── Filters (collapsible) ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setFiltersOpen((p) => !p)}
          >
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
              {!filtersOpen && (
                <span className="text-xs text-gray-400">(click to expand)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {filtersOpen && activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); resetFilters(); }}
                  className="text-gray-500 h-7 px-2"
                >
                  <RefreshCw className="size-3 mr-1" />
                  Reset
                </Button>
              )}
              {filtersOpen ? (
                <ChevronUp className="size-4 text-gray-400" />
              ) : (
                <ChevronDown className="size-4 text-gray-400" />
              )}
            </div>
          </div>

          {filtersOpen && (
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Search */}
                <div className="lg:col-span-2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input
                    className="pl-9"
                    placeholder="Model, chassis, engine, client, CS no…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                {/* Model */}
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger><SelectValue placeholder="All Models" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
                {/* Dealer */}
                <Select value={filterDealer} onValueChange={setFilterDealer}>
                  <SelectTrigger><SelectValue placeholder="All Dealers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dealers</SelectItem>
                    {uniqueDealers.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
                {/* Status */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-gray-700">{mockTransitUnits.length}</span> units
                {delayedCount > 0 && (
                  <span className="ml-3 text-red-500 font-medium">
                    ⚠ {delayedCount} unit{delayedCount > 1 ? 's' : ''} overdue / delayed
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── In Transit Data Table ─────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">In Transit Data Table</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <span key={key} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    '#', 'Model', 'Color', 'Chassis No.', 'Engine No.', 'Pull Out Location',
                    'CS No.', 'Year Model', 'Client Name', 'Dealer', 'PO Number', 'PO Amount',
                    'Pull Out Date', 'Color Code', 'Declared Month', 'Current Location',
                    'DP / Reservation', 'Status', 'Target Release', 'Remarks',
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap bg-gray-50"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={20} className="px-4 py-12 text-center text-gray-400">
                      No units match the current filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((unit, idx) => {
                    const overdue = isOverdue(unit);
                    return (
                      <tr
                        key={unit.id}
                        className={`transition-colors ${
                          overdue
                            ? 'bg-red-50 hover:bg-red-100'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        {/* # */}
                        <td className="px-3 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>

                        {/* Model */}
                        <td className="px-3 py-3 font-medium text-gray-900 whitespace-nowrap">
                          {unit.model}
                        </td>

                        {/* Color */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.color}</td>

                        {/* Chassis */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                          {unit.chassisNo}
                        </td>

                        {/* Engine */}
                        <td className="px-3 py-3 font-mono text-xs text-gray-700 whitespace-nowrap">
                          {unit.engineNo}
                        </td>

                        {/* Pull Out Location */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.pullOutLocation}</td>

                        {/* CS No */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.csNo}</td>

                        {/* Year */}
                        <td className="px-3 py-3 text-gray-700">{unit.yearModel}</td>

                        {/* Client */}
                        <td className="px-3 py-3 text-gray-900 whitespace-nowrap">{unit.clientName}</td>

                        {/* Dealer */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                            {unit.dealer}
                          </span>
                        </td>

                        {/* PO Number */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.poNumber}</td>

                        {/* PO Amount */}
                        <td className="px-3 py-3 text-gray-900 font-medium whitespace-nowrap">
                          {formatCurrency(unit.poAmount)}
                        </td>

                        {/* Pull Out Date */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.pullOutDate}</td>

                        {/* Color Code */}
                        <td className="px-3 py-3 text-gray-600 font-mono text-xs">{unit.colorCode}</td>

                        {/* Declared Month */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.declaredMonth}</td>

                        {/* Current Location */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap max-w-[180px] truncate" title={unit.currentLocation}>
                          {unit.currentLocation}
                        </td>

                        {/* DP / Reservation */}
                        <td className="px-3 py-3 text-gray-700 whitespace-nowrap">{unit.dpReservation}</td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <StatusBadge status={unit.status} />
                        </td>

                        {/* Target Release */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              overdue ? 'text-red-600' : 'text-gray-700'
                            }`}
                          >
                            {overdue && <AlertTriangle className="size-3" />}
                            {unit.targetReleaseDate}
                          </span>
                        </td>

                        {/* Remarks */}
                        <td className="px-3 py-3 text-gray-500 text-xs max-w-[180px] truncate" title={unit.remarks2}>
                          {unit.remarks2}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filtered.length > 0 && (
                <tfoot>
                  <tr className="bg-blue-50 border-t-2 border-blue-200">
                    <td colSpan={11} className="px-3 py-3 text-sm font-bold text-blue-800">
                      TOTAL ({filtered.length} units)
                    </td>
                    <td className="px-3 py-3 text-sm font-bold text-blue-800 whitespace-nowrap">
                      {formatCurrency(filtered.reduce((s, u) => s + u.poAmount, 0))}
                    </td>
                    <td colSpan={8} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

      </main>

      {/* Add In Transit Modal */}
      {showAddModal && (
        <AddInTransitModal
          onClose={() => setShowAddModal(false)}
          onSave={(entry) => setAddedEntries((prev) => [...prev, entry])}
        />
      )}
    </>
  );
}