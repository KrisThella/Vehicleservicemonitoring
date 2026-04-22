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

  const addVehicle = useCallback(async (v: any) => {
    const created = await send<VehicleRecord>('/vehicles', 'POST', dehydrateVehicle(v));
    const hydrated = hydrateVehicle(created);
    setVehicles((prev) => [...prev, hydrated]);
    return hydrated;
  }, []);

  const updateVehicle = useCallback(async (id: string, v: any) => {
    const updated = await send<VehicleRecord>(`/vehicles/${id}`, 'PUT', dehydrateVehicle(v));
    const hydrated = hydrateVehicle(updated);
    setVehicles((prev) => prev.map((x) => (x.id === id ? hydrated : x)));
    return hydrated;
  }, []);

  const removeVehicle = useCallback(async (id: string) => {
    await send(`/vehicles/${id}`, 'DELETE');
    setVehicles((prev) => prev.filter((x) => x.id !== id));
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
