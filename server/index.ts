import express from 'express';
import cors from 'cors';
import { db } from './db';
import { seedDatabase } from './seed';

seedDatabase();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ── Vehicles ──────────────────────────────────────────────────────────────
app.get('/api/vehicles', (_req, res) => {
  const rows = db.prepare('SELECT data FROM vehicles ORDER BY id').all() as { data: string }[];
  res.json(rows.map((r) => JSON.parse(r.data)));
});

app.get('/api/vehicles/:id', (req, res) => {
  const row = db.prepare('SELECT data FROM vehicles WHERE id = ?').get(req.params.id) as { data: string } | undefined;
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(JSON.parse(row.data));
});

app.post('/api/vehicles', (req, res) => {
  const v = req.body;
  if (!v.id) v.id = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  db.prepare('INSERT INTO vehicles (id, data) VALUES (?, ?)').run(v.id, JSON.stringify(v));
  res.status(201).json(v);
});

app.put('/api/vehicles/:id', (req, res) => {
  const v = req.body;
  v.id = req.params.id;
  const result = db.prepare(
    "UPDATE vehicles SET data = ?, updated_at = strftime('%s','now') WHERE id = ?"
  ).run(JSON.stringify(v), req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(v);
});

app.delete('/api/vehicles/:id', (req, res) => {
  const result = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Prices ────────────────────────────────────────────────────────────────
app.get('/api/prices', (_req, res) => {
  const rows = db.prepare('SELECT * FROM prices ORDER BY category, model').all();
  res.json(rows);
});

app.post('/api/prices', (req, res) => {
  const { category, model, srp = '', dnp = '', ws_subsidy = '', dnp_less_ws_subsidy = '', ewt = '', po_amount = '' } = req.body || {};
  if (!category || !model) return res.status(400).json({ error: 'category and model required' });
  try {
    const result = db.prepare(
      'INSERT INTO prices (category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount) VALUES (?,?,?,?,?,?,?,?)'
    ).run(category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount);
    const row = db.prepare('SELECT * FROM prices WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(row);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/prices/:id', (req, res) => {
  const { category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount } = req.body || {};
  const result = db.prepare(
    `UPDATE prices SET category=?, model=?, srp=?, dnp=?, ws_subsidy=?, dnp_less_ws_subsidy=?, ewt=?, po_amount=?,
     updated_at=strftime('%s','now') WHERE id = ?`
  ).run(category, model, srp ?? '', dnp ?? '', ws_subsidy ?? '', dnp_less_ws_subsidy ?? '', ewt ?? '', po_amount ?? '', req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM prices WHERE id = ?').get(req.params.id));
});

app.delete('/api/prices/:id', (req, res) => {
  const result = db.prepare('DELETE FROM prices WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Profile ───────────────────────────────────────────────────────────────
app.get('/api/profile', (_req, res) => {
  const row = db.prepare('SELECT id, name, role, email, image_data_url FROM profile WHERE id = 1').get();
  res.json(row);
});

app.put('/api/profile', (req, res) => {
  const { name, role, email, image_data_url } = req.body || {};
  const existing = db.prepare('SELECT image_data_url FROM profile WHERE id = 1').get() as { image_data_url: string | null } | undefined;
  const finalImage = image_data_url !== undefined ? image_data_url : existing?.image_data_url ?? null;
  db.prepare('UPDATE profile SET name=?, role=?, email=?, image_data_url=? WHERE id = 1')
    .run(name, role, email, finalImage);
  res.json(db.prepare('SELECT id, name, role, email, image_data_url FROM profile WHERE id = 1').get());
});

// ── Settings ──────────────────────────────────────────────────────────────
app.get('/api/settings/:key', (req, res) => {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key) as { value: string } | undefined;
  res.json({ value: row?.value ?? null });
});

app.put('/api/settings/:key', (req, res) => {
  const { value } = req.body || {};
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(req.params.key, String(value));
  res.json({ ok: true });
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});
