import { useState } from 'react';
import { Header } from '../components/Header';
import { usePullOuts, useInventory } from '../../lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InventoryDisplayRow {
  month: string;
  beginning: number | null;
  wholesale: number | null;
  retailSales: number | null;
  actualWholesales: number | null;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Helpers ────────────────────────────────────────────────────────────────────

const displayNum = (n: number | null) =>
  n === null || n === undefined ? <span className="text-gray-300 dark:text-gray-600">–</span> : n;

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-blue-50 dark:bg-slate-800">
        <h2 className="font-semibold text-blue-800 dark:text-blue-300 text-base">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 whitespace-nowrap ${right ? 'text-right' : 'text-left'}`}
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
}: {
  children: React.ReactNode;
  right?: boolean;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={`px-4 py-3 text-sm border-b border-gray-100 dark:border-slate-700 whitespace-nowrap
        ${right ? 'text-right' : ''}
        ${bold ? 'font-semibold' : ''}
        ${muted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}
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

  const { rows: pullOutRows, loading: poLoading } = usePullOuts();
  const { rows: inventoryDbRows, loading: invLoading } = useInventory(inventoryYear);

  // Build display rows for all 12 months, filling in DB values when present
  const inventoryData: InventoryDisplayRow[] = MONTHS.map((month, idx) => {
    const row = inventoryDbRows.find((r) => r.month_index === idx);
    return {
      month,
      beginning: row?.beginning ?? null,
      wholesale: row?.wholesale ?? null,
      retailSales: row?.retail_sales ?? null,
      actualWholesales: row?.actual_wholesales ?? null,
    };
  });

  // Pull Out totals (remainingUnits = confirmed - pulled_out, clamped at 0)
  const poTotalSphAllocation = pullOutRows.reduce((s, r) => s + r.sph_allocation, 0);
  const poTotalConfirmed = pullOutRows.reduce((s, r) => s + r.confirmed_units, 0);
  const poTotalPulledOut = pullOutRows.reduce((s, r) => s + r.pulled_out, 0);
  const poTotalRemaining = pullOutRows.reduce(
    (s, r) => s + Math.max(0, r.confirmed_units - r.pulled_out),
    0
  );

  // Year selector: 2016 .. currentYear + 2
  const yearOptions: number[] = [];
  for (let y = 2016; y <= currentYear + 2; y++) yearOptions.push(y);

  return (
    <>
      <Header />

      <main className="flex-1 overflow-auto px-6 py-6 space-y-8 bg-gray-50 dark:bg-slate-950">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Pull Out Monitoring
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                {poLoading && pullOutRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : pullOutRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      No pull-out records yet.
                    </td>
                  </tr>
                ) : (
                  pullOutRows.map((row) => {
                    const remaining = Math.max(0, row.confirmed_units - row.pulled_out);
                    return (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                        <Td>{row.description}</Td>
                        <Td right>{row.sph_allocation}</Td>
                        <Td>{row.date_of_confirmation}</Td>
                        <Td right>{row.confirmed_units}</Td>
                        <Td right>{row.pulled_out}</Td>
                        <Td right>
                          <span
                            className={
                              remaining > 0
                                ? 'text-orange-600 dark:text-orange-500 font-medium'
                                : 'text-green-600 dark:text-green-500 font-medium'
                            }
                          >
                            {remaining}
                          </span>
                        </Td>
                      </tr>
                    );
                  })
                )}
                {/* Totals row */}
                {pullOutRows.length > 0 && (
                  <tr className="bg-blue-50 dark:bg-slate-800 border-t-2 border-blue-200 dark:border-slate-700">
                    <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300">Total</td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                      {poTotalSphAllocation}
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                      {poTotalConfirmed}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                      {poTotalPulledOut}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-orange-700 dark:text-orange-500 text-right">
                      {poTotalRemaining}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

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
                  className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-sm rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
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
                {invLoading && inventoryDbRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                      Loading…
                    </td>
                  </tr>
                ) : (
                  inventoryData.map((row) => {
                    const allNull =
                      row.beginning === null &&
                      row.wholesale === null &&
                      row.retailSales === null &&
                      row.actualWholesales === null;
                    return (
                  <tr
                    key={row.month}
                    className={`transition-colors ${allNull ? 'opacity-50' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-slate-700">
                      {row.month}
                    </td>
                    <td className="px-4 py-3 text-sm text-right border-b border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {displayNum(row.beginning)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right border-b border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {displayNum(row.wholesale)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right border-b border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {displayNum(row.retailSales)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right border-b border-gray-100 dark:border-slate-700 text-gray-700 dark:text-gray-300">
                      {displayNum(row.actualWholesales)}
                    </td>
                  </tr>
                    );
                  })
                )}
                {/* Summary totals */}
                <tr className="bg-blue-50 dark:bg-slate-800 border-t-2 border-blue-200 dark:border-slate-700">
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300">
                    Full Year Total
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                    {inventoryData.reduce((s, r) => s + (r.beginning ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                    {inventoryData.reduce((s, r) => s + (r.wholesale ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
                    {inventoryData.reduce((s, r) => s + (r.retailSales ?? 0), 0) || '–'}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-blue-800 dark:text-blue-300 text-right">
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
