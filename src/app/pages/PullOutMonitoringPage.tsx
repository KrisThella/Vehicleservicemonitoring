import { useState } from 'react';
import { Header } from '../components/Header';
import { ChevronDown, ChevronUp } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

interface PullOutRow {
  id: number;
  description: string;
  sphAllocation: number;
  dateOfConfirmation: string;
  confirmedUnits: number;
  pulledOut: number;
  remainingUnits: number;
}

interface PaymentRow {
  id: number;
  description: string;
  numberOfUnits: number;
  totalAmount: number;
  dateOfPayment: string;
  remarks: string;
}

interface InventoryRow {
  month: string;
  beginning: number | null;
  wholesale: number | null;
  retailSales: number | null;
  actualWholesales: number | null;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

const pullOutRows: PullOutRow[] = [
  {
    id: 1,
    description: 'Suzuki Ertiga 1.5 GA MT',
    sphAllocation: 10,
    dateOfConfirmation: 'Mar 05, 2026',
    confirmedUnits: 8,
    pulledOut: 6,
    remainingUnits: 2,
  },
  {
    id: 2,
    description: 'Suzuki Dzire GL MT',
    sphAllocation: 8,
    dateOfConfirmation: 'Mar 10, 2026',
    confirmedUnits: 6,
    pulledOut: 4,
    remainingUnits: 2,
  },
  {
    id: 3,
    description: 'Suzuki Swift GL MT',
    sphAllocation: 5,
    dateOfConfirmation: 'Mar 12, 2026',
    confirmedUnits: 5,
    pulledOut: 5,
    remainingUnits: 0,
  },
  {
    id: 4,
    description: 'Suzuki Celerio GL MT',
    sphAllocation: 6,
    dateOfConfirmation: 'Mar 15, 2026',
    confirmedUnits: 4,
    pulledOut: 3,
    remainingUnits: 1,
  },
  {
    id: 5,
    description: 'Suzuki Fronx GL Hybrid',
    sphAllocation: 4,
    dateOfConfirmation: 'Mar 18, 2026',
    confirmedUnits: 4,
    pulledOut: 2,
    remainingUnits: 2,
  },
  {
    id: 6,
    description: 'Suzuki S-Presso GL MT',
    sphAllocation: 7,
    dateOfConfirmation: 'Mar 20, 2026',
    confirmedUnits: 5,
    pulledOut: 5,
    remainingUnits: 0,
  },
];

const currentMonthPaymentRows: PaymentRow[] = [
  {
    id: 1,
    description: 'Ertiga 1.5 GA MT – Batch 1',
    numberOfUnits: 4,
    totalAmount: 3_480_000,
    dateOfPayment: 'Apr 05, 2026',
    remarks: 'Paid via BDO',
  },
  {
    id: 2,
    description: 'Dzire GL MT – Batch 1',
    numberOfUnits: 3,
    totalAmount: 2_100_000,
    dateOfPayment: 'Apr 07, 2026',
    remarks: 'Paid via BPI',
  },
  {
    id: 3,
    description: 'Swift GL MT – Full Pull',
    numberOfUnits: 5,
    totalAmount: 4_250_000,
    dateOfPayment: 'Apr 10, 2026',
    remarks: 'Settled – Bank transfer',
  },
  {
    id: 4,
    description: 'S-Presso GL MT – Full Pull',
    numberOfUnits: 5,
    totalAmount: 3_750_000,
    dateOfPayment: 'Apr 10, 2026',
    remarks: 'Settled – Bank transfer',
  },
];

const nextCutOffPaymentRows: PaymentRow[] = [
  {
    id: 1,
    description: 'Ertiga 1.5 GA MT – Remaining',
    numberOfUnits: 2,
    totalAmount: 1_740_000,
    dateOfPayment: 'Apr 25, 2026',
    remarks: 'For BDO processing',
  },
  {
    id: 2,
    description: 'Dzire GL MT – Remaining',
    numberOfUnits: 2,
    totalAmount: 1_400_000,
    dateOfPayment: 'Apr 25, 2026',
    remarks: 'Pending bank confirmation',
  },
  {
    id: 3,
    description: 'Celerio GL MT – Remaining',
    numberOfUnits: 1,
    totalAmount: 640_000,
    dateOfPayment: 'Apr 28, 2026',
    remarks: 'For BPI processing',
  },
  {
    id: 4,
    description: 'Fronx GL Hybrid – Remaining',
    numberOfUnits: 2,
    totalAmount: 2_480_000,
    dateOfPayment: 'Apr 28, 2026',
    remarks: 'Awaiting SPH invoice',
  },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const buildInventoryData = (year: number): InventoryRow[] =>
  MONTHS.map((month, idx) => {
    // Populate realistic data only for past months (Jan–Mar 2026)
    const isPast = year < 2026 || (year === 2026 && idx < 3);
    const isCurrent = year === 2026 && idx === 3; // April
    if (isPast) {
      const beginning = 45 + idx * 3;
      const wholesale = 12 + idx * 2;
      const retail = 10 + idx;
      return {
        month,
        beginning,
        wholesale,
        retailSales: retail,
        actualWholesales: wholesale - 1,
      };
    }
    if (isCurrent) {
      return {
        month,
        beginning: 54,
        wholesale: null,
        retailSales: null,
        actualWholesales: null,
      };
    }
    return {
      month,
      beginning: null,
      wholesale: null,
      retailSales: null,
      actualWholesales: null,
    };
  });

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatCurrency = (n: number) =>
  `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const displayNum = (n: number | null) =>
  n === null ? <span className="text-gray-300">–</span> : n;

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
        <h2 className="font-semibold text-blue-800 text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide bg-gray-50 border-b border-gray-200 whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  right,
  bold,
  muted,
  green,
}: {
  children: React.ReactNode;
  right?: boolean;
  bold?: boolean;
  muted?: boolean;
  green?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm border-b border-gray-100 whitespace-nowrap
        ${right ? 'text-right' : ''}
        ${bold ? 'font-semibold' : ''}
        ${muted ? 'text-gray-400' : 'text-gray-800'}
        ${green ? 'text-green-700' : ''}
      `}
    >
      {children}
    </td>
  );
}

// ── Page Component ─────────────────────────────────────────────────────────────

export function PullOutMonitoringPage() {
  const currentYear = new Date().getFullYear();
  const [inventoryYear, setInventoryYear] = useState(currentYear);
  
  const inventoryData = buildInventoryData(inventoryYear);
  
  // Pull Out totals
  const poTotalSphAllocation = pullOutRows.reduce((s, r) => s + r.sphAllocation, 0);
  const poTotalConfirmed = pullOutRows.reduce((s, r) => s + r.confirmedUnits, 0);
  const poTotalPulledOut = pullOutRows.reduce((s, r) => s + r.pulledOut, 0);

  // Current month payment totals
  const cmTotalUnits = currentMonthPaymentRows.reduce((s, r) => s + r.numberOfUnits, 0);
  const cmTotalAmount = currentMonthPaymentRows.reduce((s, r) => s + r.totalAmount, 0);

  // Next cut off totals
  const ncTotalUnits = nextCutOffPaymentRows.reduce((s, r) => s + r.numberOfUnits, 0);
  const ncTotalAmount = nextCutOffPaymentRows.reduce((s, r) => s + r.totalAmount, 0);

  // Overall totals
  const overallTotalUnits = cmTotalUnits + ncTotalUnits;
  const overallTotalAmount = cmTotalAmount + ncTotalAmount;

  const startYear = 2016;
  const endYear = currentYear + 2;
  const yearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Pull Out Monitoring
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track SPH allocation pull-outs, payment schedules, and inventory summary
          </p>
        </div>

        {/* ── Table 1: Pull Out Monitoring ───────────────────────────────── */}
        <SectionCard title="Pull Out Monitoring">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Description</Th>
                  <Th right>SPH Allocation</Th>
                  <Th>Date of Confirmation</Th>
                  <Th right>No. of Confirmed Units</Th>
                  <Th right>Pulled Out</Th>
                  <Th right>Remaining Units for Pull Out</Th>
                </tr>
              </thead>
              <tbody>
                {pullOutRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <Td>{row.description}</Td>
                    <Td right>{row.sphAllocation}</Td>
                    <Td>{row.dateOfConfirmation}</Td>
                    <Td right>{row.confirmedUnits}</Td>
                    <Td right>{row.pulledOut}</Td>
                    <Td right>
                      <span
                        className={
                          row.remainingUnits > 0
                            ? 'text-orange-600 font-medium'
                            : 'text-green-600 font-medium'
                        }
                      >
                        {row.remainingUnits}
                      </span>
                    </Td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800">
                    Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {poTotalSphAllocation}
                  </td>
                  <td className="px-4 py-3"></td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {poTotalConfirmed}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {poTotalPulledOut}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-orange-700 text-right">
                    {pullOutRows.reduce((s, r) => s + r.remainingUnits, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── Tables 2 & 3: Payment Schedules ───────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Current Month for Payment */}
          <SectionCard title="Current Month for Payment">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Description</Th>
                    <Th right>Number of Units</Th>
                    <Th right>Total Amount</Th>
                    <Th>Date of Payment</Th>
                    <Th>Remarks</Th>
                  </tr>
                </thead>
                <tbody>
                  {currentMonthPaymentRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <Td>{row.description}</Td>
                      <Td right>{row.numberOfUnits}</Td>
                      <Td right>{formatCurrency(row.totalAmount)}</Td>
                      <Td>{row.dateOfPayment}</Td>
                      <Td muted={!row.remarks}>{row.remarks || '–'}</Td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td className="px-4 py-3 text-sm font-bold text-green-800">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-800 text-right">
                      {cmTotalUnits}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-green-800 text-right">
                      {formatCurrency(cmTotalAmount)}
                    </td>
                    <td className="px-4 py-3" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Next Cut Off for Payment */}
          <SectionCard title="Next Cut Off for Payment">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <Th>Description</Th>
                    <Th right>Number of Units</Th>
                    <Th right>Total Amount</Th>
                    <Th>Date of Payment</Th>
                    <Th>Remarks</Th>
                  </tr>
                </thead>
                <tbody>
                  {nextCutOffPaymentRows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                      <Td>{row.description}</Td>
                      <Td right>{row.numberOfUnits}</Td>
                      <Td right>{formatCurrency(row.totalAmount)}</Td>
                      <Td>{row.dateOfPayment}</Td>
                      <Td muted={!row.remarks}>{row.remarks || '–'}</Td>
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-orange-50 border-t-2 border-orange-200">
                    <td className="px-4 py-3 text-sm font-bold text-orange-800">
                      Total
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-800 text-right">
                      {ncTotalUnits}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-800 text-right">
                      {formatCurrency(ncTotalAmount)}
                    </td>
                    <td className="px-4 py-3" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>

        {/* ── Overall Total for Payment ──────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-blue-100 text-sm">Overall Total for Payment</p>
            <p className="text-white text-xs mt-1 opacity-80">
              Sum of Current Month + Next Cut Off
            </p>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-center">
              <p className="text-blue-200 text-xs uppercase tracking-wide">Total Units</p>
              <p className="text-white text-3xl font-bold mt-1">{overallTotalUnits}</p>
            </div>
            <div className="text-center">
              <p className="text-blue-200 text-xs uppercase tracking-wide">Total Amount</p>
              <p className="text-white text-2xl font-bold mt-1">
                {formatCurrency(overallTotalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* ── Inventory Summary ─────────────────────────────────────────── */}
        <SectionCard
          title={
            <div className="flex items-center gap-3 flex-wrap">
              <span>Inventory Summary</span>
              <div className="flex items-center gap-1">
                <span className="text-blue-500 font-medium">(</span>
                <select
                  value={inventoryYear}
                  onChange={(e) => setInventoryYear(Number(e.target.value))}
                  className="bg-white border border-blue-200 text-blue-800 text-sm rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {yearOptions.map((y) => (
                    <option className="" key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <span className="text-blue-500 font-medium">)</span>
              </div>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <Th>Month</Th>
                  <Th right>Beginning</Th>
                  <Th right>Wholesale (Lica Count)</Th>
                  <Th right>Retail Sales (Lica)</Th>
                  <Th right>Actual Wholesales (SPH Invoice)</Th>
                </tr>
              </thead>
              <tbody>
                {inventoryData.map((row) => {
                  const allNull =
                    row.beginning === null &&
                    row.wholesale === null &&
                    row.retailSales === null &&
                    row.actualWholesales === null;
                  return (
                    <tr
                      key={row.month}
                      className={`transition-colors ${allNull ? 'opacity-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-800 border-b border-gray-100">
                        {row.month}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-b border-gray-100 text-gray-700">
                        {displayNum(row.beginning)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-b border-gray-100 text-gray-700">
                        {displayNum(row.wholesale)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-b border-gray-100 text-gray-700">
                        {displayNum(row.retailSales)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right border-b border-gray-100 text-gray-700">
                        {displayNum(row.actualWholesales)}
                      </td>
                    </tr>
                  );
                })}
                {/* Summary totals */}
                <tr className="bg-blue-50 border-t-2 border-blue-200">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800">
                    Full Year Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {inventoryData.reduce((s, r) => s + (r.beginning ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {inventoryData.reduce((s, r) => s + (r.wholesale ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {inventoryData.reduce((s, r) => s + (r.retailSales ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 text-right">
                    {inventoryData.reduce((s, r) => s + (r.actualWholesales ?? 0), 0) || '–'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </main>
    </>
  );
}