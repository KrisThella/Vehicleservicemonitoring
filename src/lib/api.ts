import { useEffect, useState, useCallback } from 'react';

// ── Types ─────────────────────────────────────────────────────────────────

export interface VehicleRecord {
  id: string;
  model: string;
  csNo?: string;
  plateNumber: string;
  color: string;
  year: number;
  receivedDate: string; // ISO date
  poNumber: string;
  vinNumber: string;
  dealer: string;
  status: string;
  remarks: string;
  location: string;
  unit: string;
  pullOut: string | null;
  overdue: boolean;
  category?: string;
  chassisNo?: string;
  engineNo?: string;
  taggingAccount?: string;
  allocationTeam?: string;
  dateTagged?: string | null;
  monthDeclared?: string;
  invoiceDate?: string | null;
  invoiceNumber?: string;
  releaseDate?: string | null;
  jc?: string;
  arm?: string;
  terms?: string;
  bank?: string;
  invoiceAmount?: string;
  statementDeposit?: string | null;
  ltoBankTransmittal?: string | null;
  salesConsultant?: string;
  generalManager?: string;
  grossProfit?: string;
  extendedWarranty?: string;
  ltoDocumentsTransmittal?: string;
  poAmount?: string;
  nameOfClient?: string;
  [k: string]: unknown;
}

export interface PriceRecord {
  id: number;
  category: string;
  model: string;
  srp: string;
  dnp: string;
  ws_subsidy: string;
  dnp_less_ws_subsidy: string;
  ewt: string;
  po_amount: string;
}

export interface ProfileRecord {
  id: number;
  name: string;
  role: string;
  email: string;
  image_data_url: string | null;
}

export interface GeneralManagerRecord {
  id: number;
  name: string;
  sort_order: number;
}

export interface SalesConsultantRecord {
  id: number;
  manager_id: number;
  name: string;
  sort_order: number;
}

// ── HTTP helpers ──────────────────────────────────────────────────────────

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`);
  if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
  return r.json();
}
async function send<T>(path: string, method: string, body?: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) throw new Error(`${method} ${path} failed: ${r.status}`);
  return r.json();
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return send<T>(path, 'POST', body);
}

async function put<T>(path: string, body?: unknown): Promise<T> {
  return send<T>(path, 'PUT', body);
}

async function del<T>(path: string): Promise<T> {
  return send<T>(path, 'DELETE');
}

// ── Date conversion helpers ───────────────────────────────────────────────

function toDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  return new Date(s);
}

export function hydrateVehicle(v: VehicleRecord): any {
  return {
    ...v,
    receivedDate: toDate(v.receivedDate)!,
    pullOut: toDate(v.pullOut),
    dateTagged: toDate(v.dateTagged as any),
    invoiceDate: toDate(v.invoiceDate as any),
    releaseDate: toDate(v.releaseDate as any),
    statementDeposit: toDate(v.statementDeposit as any),
    ltoBankTransmittal: toDate(v.ltoBankTransmittal as any),
  };
}

function dehydrateVehicle(v: any): VehicleRecord {
  const out: any = { ...v };
  for (const k of [
    'receivedDate', 'pullOut', 'dateTagged', 'invoiceDate',
    'releaseDate', 'statementDeposit', 'ltoBankTransmittal',
  ]) {
    if (v[k] instanceof Date) out[k] = (v[k] as Date).toISOString();
  }
  return out;
}

// ── Hooks ─────────────────────────────────────────────────────────────────

export function useVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notifyVehiclesChanged = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vehicles:changed'));
    }
  };

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await get<VehicleRecord[]>('/vehicles');
      setVehicles(rows.map(hydrateVehicle));
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = () => {
      refetch();
    };
    window.addEventListener('vehicles:changed', handle);
    return () => window.removeEventListener('vehicles:changed', handle);
  }, [refetch]);

  const addVehicle = useCallback(async (v: any) => {
    const created = await send<VehicleRecord>('/vehicles', 'POST', dehydrateVehicle(v));
    const hydrated = hydrateVehicle(created);
    setVehicles((prev) => [...prev, hydrated]);
    notifyVehiclesChanged();
    return hydrated;
  }, []);

  const updateVehicle = useCallback(async (id: string, v: any) => {
    const updated = await send<VehicleRecord>(`/vehicles/${id}`, 'PUT', dehydrateVehicle(v));
    const hydrated = hydrateVehicle(updated);
    setVehicles((prev) => prev.map((x) => (x.id === id ? hydrated : x)));
    notifyVehiclesChanged();
    return hydrated;
  }, []);

  const removeVehicle = useCallback(async (id: string) => {
    await send(`/vehicles/${id}`, 'DELETE');
    setVehicles((prev) => prev.filter((x) => x.id !== id));
    notifyVehiclesChanged();
  }, []);

  return { vehicles, loading, error, refetch, addVehicle, updateVehicle, removeVehicle };
}

export function usePrices() {
  const [prices, setPrices] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setPrices(await get<PriceRecord[]>('/prices')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const addPrice = useCallback(async (p: Partial<PriceRecord>) => {
    const created = await send<PriceRecord>('/prices', 'POST', p);
    setPrices((prev) => [...prev, created].sort((a, b) =>
      a.category.localeCompare(b.category) || a.model.localeCompare(b.model)
    ));
    return created;
  }, []);

  const updatePrice = useCallback(async (id: number, p: Partial<PriceRecord>) => {
    const updated = await send<PriceRecord>(`/prices/${id}`, 'PUT', p);
    setPrices((prev) => prev.map((x) => (x.id === id ? updated : x)));
    return updated;
  }, []);

  const removePrice = useCallback(async (id: number) => {
    await send(`/prices/${id}`, 'DELETE');
    setPrices((prev) => prev.filter((x) => x.id !== id));
  }, []);

  return { prices, loading, refetch, addPrice, updatePrice, removePrice };
}

// ── Team Management ──────────────────────────────────────────────────────

export function useGeneralManagers() {
  const [managers, setManagers] = useState<GeneralManagerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const notifyTeamsChanged = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('teams:changed'));
    }
  };

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setManagers(await get<GeneralManagerRecord[]>('/general-managers')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const addManager = useCallback(async (name: string, consultants: string[]) => {
    const created = await send<{ manager: GeneralManagerRecord }>(
      '/general-managers',
      'POST',
      { name, consultants }
    );
    const manager = created.manager;
    setManagers((prev) => [...prev, manager].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)));
    notifyTeamsChanged();
    return manager;
  }, []);

  const updateManager = useCallback(async (id: number, name: string) => {
    const updated = await send<GeneralManagerRecord>(`/general-managers/${id}`, 'PUT', { name });
    setManagers((prev) => prev.map((m) => (m.id === id ? updated : m)));
    notifyTeamsChanged();
    return updated;
  }, []);

  const removeManager = useCallback(async (id: number) => {
    await send(`/general-managers/${id}`, 'DELETE');
    setManagers((prev) => prev.filter((m) => m.id !== id));
    notifyTeamsChanged();
  }, []);

  return { managers, loading, refetch, addManager, updateManager, removeManager };
}

export function useSalesConsultants(managerId?: number) {
  const [consultants, setConsultants] = useState<SalesConsultantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const query = managerId ? `?manager_id=${managerId}` : '';
      setConsultants(await get<SalesConsultantRecord[]>(`/sales-consultants${query}`));
    } finally {
      setLoading(false);
    }
  }, [managerId]);

  useEffect(() => { refetch(); }, [refetch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handle = () => { refetch(); };
    window.addEventListener('teams:changed', handle);
    return () => window.removeEventListener('teams:changed', handle);
  }, [refetch]);

  const addConsultant = useCallback(async (manager_id: number, name: string) => {
    const created = await send<SalesConsultantRecord>('/sales-consultants', 'POST', { manager_id, name });
    setConsultants((prev) => [...prev, created].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('teams:changed'));
    }
    return created;
  }, []);

  const updateConsultant = useCallback(async (id: number, name: string, nextManagerId?: number) => {
    const updated = await send<SalesConsultantRecord>(`/sales-consultants/${id}`, 'PUT', {
      name,
      manager_id: nextManagerId,
    });
    setConsultants((prev) => prev.map((c) => (c.id === id ? updated : c)));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('teams:changed'));
    }
    return updated;
  }, []);

  const removeConsultant = useCallback(async (id: number) => {
    await send(`/sales-consultants/${id}`, 'DELETE');
    setConsultants((prev) => prev.filter((c) => c.id !== id));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('teams:changed'));
    }
  }, []);

  return { consultants, loading, refetch, addConsultant, updateConsultant, removeConsultant };
}

// ── Pull-Out Monitoring data ──────────────────────────────────────────────

export interface PullOutRecord {
  id: number;
  description: string;
  sph_allocation: number;
  date_of_confirmation: string;
  confirmed_units: number;
  pulled_out: number;
  sort_order: number;
}

export interface PaymentRecord {
  id: number;
  description: string;
  number_of_units: number;
  total_amount: number;
  date_of_payment: string;
  remarks: string;
  sort_order: number;
}

export interface InventoryRecord {
  id: number;
  year: number;
  month_index: number;
  beginning: number | null;
  wholesale: number | null;
  retail_sales: number | null;
  actual_wholesales: number | null;
}

export function usePullOuts() {
  const [rows, setRows] = useState<PullOutRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await get<PullOutRecord[]>('/pull-outs')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { rows, loading, refetch };
}

export function usePayments() {
  const [rows, setRows] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await get<PaymentRecord[]>('/payments')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);
  return { rows, loading, refetch };
}

export type NextCutOffStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'OVERDUE';

export interface NextCutOffRecord {
  id: number;
  description: string;
  number_of_units: number;
  unit_price: number;
  total_amount: number;
  date_of_payment: string;
  remarks: string;
  status: NextCutOffStatus;
  sort_order: number;
}

export type NextCutOffInput = Omit<NextCutOffRecord, 'id' | 'sort_order'>;

export function useNextCutOffPayments() {
  const [rows, setRows] = useState<NextCutOffRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await get<NextCutOffRecord[]>('/next-cut-off')); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refetch(); }, [refetch]);

  const addRow = useCallback(async (input: NextCutOffInput) => {
    const created = await post<NextCutOffRecord>('/next-cut-off', input);
    setRows((p) => [...p, created]);
    return created;
  }, []);

  const updateRow = useCallback(async (id: number, input: NextCutOffInput) => {
    const updated = await put<NextCutOffRecord>(`/next-cut-off/${id}`, input);
    setRows((p) => p.map((r) => (r.id === id ? updated : r)));
    return updated;
  }, []);

  const removeRow = useCallback(async (id: number) => {
    await del(`/next-cut-off/${id}`);
    setRows((p) => p.filter((r) => r.id !== id));
  }, []);

  return { rows, loading, refetch, addRow, updateRow, removeRow };
}

export function useInventory(year: number) {
  const [rows, setRows] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const refetch = useCallback(async () => {
    setLoading(true);
    try { setRows(await get<InventoryRecord[]>(`/inventory?year=${year}`)); }
    finally { setLoading(false); }
  }, [year]);
  useEffect(() => { refetch(); }, [refetch]);
  return { rows, loading, refetch };
}

// ── Colors ────────────────────────────────────────────────────────────────

export interface ColorRecord {
  id: number;
  name: string;
  hex: string;
  sort_order: number;
}

export interface ColorInput {
  name: string;
  hex: string;
}

export function useColors() {
  const [colors, setColors] = useState<ColorRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setColors(await get<ColorRecord[]>('/colors')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const addColor = useCallback(async (input: ColorInput) => {
    const created = await send<ColorRecord>('/colors', 'POST', input);
    setColors((p) => [...p, created]);
    return created;
  }, []);

  const updateColor = useCallback(async (id: number, input: ColorInput) => {
    const updated = await send<ColorRecord>(`/colors/${id}`, 'PUT', input);
    setColors((p) => p.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const removeColor = useCallback(async (id: number) => {
    await send(`/colors/${id}`, 'DELETE');
    setColors((p) => p.filter((c) => c.id !== id));
  }, []);

  return { colors, loading, refetch, addColor, updateColor, removeColor };
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    try { setProfile(await get<ProfileRecord>('/profile')); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { refetch(); }, [refetch]);

  const saveProfile = useCallback(async (p: Partial<ProfileRecord>) => {
    const updated = await send<ProfileRecord>('/profile', 'PUT', p);
    setProfile(updated);
    return updated;
  }, []);

  return { profile, loading, refetch, saveProfile };
}
