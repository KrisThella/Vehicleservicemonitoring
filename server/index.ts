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

// ── Colors ────────────────────────────────────────────────────────────────
app.get('/api/colors', (_req, res) => {
  const rows = db.prepare('SELECT * FROM colors ORDER BY sort_order, id').all();
  res.json(rows);
});

app.post('/api/colors', (req, res) => {
  const { name, hex } = req.body || {};
  if (!name || !hex) return res.status(400).json({ error: 'name and hex required' });
  try {
    const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM colors').get() as { m: number }).m;
    const r = db.prepare('INSERT INTO colors (name, hex, sort_order) VALUES (?,?,?)').run(name, hex, maxOrder + 1);
    res.status(201).json(db.prepare('SELECT * FROM colors WHERE id = ?').get(r.lastInsertRowid));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put('/api/colors/:id', (req, res) => {
  const { name, hex } = req.body || {};
  if (!name || !hex) return res.status(400).json({ error: 'name and hex required' });
  try {
    const r = db.prepare(
      "UPDATE colors SET name=?, hex=?, updated_at=strftime('%s','now') WHERE id = ?"
    ).run(name, hex, req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json(db.prepare('SELECT * FROM colors WHERE id = ?').get(req.params.id));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/colors/:id', (req, res) => {
  const r = db.prepare('DELETE FROM colors WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Pull-out rows ─────────────────────────────────────────────────────────
app.get('/api/pull-outs', (_req, res) => {
  const rows = db.prepare('SELECT * FROM pull_outs ORDER BY sort_order, id').all();
  res.json(rows);
});

app.post('/api/pull-outs', (req, res) => {
  const { description = '', sph_allocation = 0, date_of_confirmation = '', confirmed_units = 0, pulled_out = 0 } = req.body || {};
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM pull_outs').get() as { m: number }).m;
  const r = db.prepare(
    'INSERT INTO pull_outs (description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, sort_order) VALUES (?,?,?,?,?,?)'
  ).run(description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, maxOrder + 1);
  res.status(201).json(db.prepare('SELECT * FROM pull_outs WHERE id = ?').get(r.lastInsertRowid));
});

app.put('/api/pull-outs/:id', (req, res) => {
  const { description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out } = req.body || {};
  const r = db.prepare(
    'UPDATE pull_outs SET description=?, sph_allocation=?, date_of_confirmation=?, confirmed_units=?, pulled_out=? WHERE id = ?'
  ).run(description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM pull_outs WHERE id = ?').get(req.params.id));
});

app.delete('/api/pull-outs/:id', (req, res) => {
  const r = db.prepare('DELETE FROM pull_outs WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Payments (current month) ──────────────────────────────────────────────
app.get('/api/payments', (_req, res) => {
  const rows = db.prepare('SELECT * FROM payments ORDER BY sort_order, id').all();
  res.json(rows);
});

app.post('/api/payments', (req, res) => {
  const { description = '', number_of_units = 0, total_amount = 0, date_of_payment = '', remarks = '' } = req.body || {};
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM payments').get() as { m: number }).m;
  const r = db.prepare(
    'INSERT INTO payments (description, number_of_units, total_amount, date_of_payment, remarks, sort_order) VALUES (?,?,?,?,?,?)'
  ).run(description, number_of_units, total_amount, date_of_payment, remarks, maxOrder + 1);
  res.status(201).json(db.prepare('SELECT * FROM payments WHERE id = ?').get(r.lastInsertRowid));
});

app.put('/api/payments/:id', (req, res) => {
  const { description, number_of_units, total_amount, date_of_payment, remarks } = req.body || {};
  const r = db.prepare(
    'UPDATE payments SET description=?, number_of_units=?, total_amount=?, date_of_payment=?, remarks=? WHERE id = ?'
  ).run(description, number_of_units, total_amount, date_of_payment, remarks, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM payments WHERE id = ?').get(req.params.id));
});

app.delete('/api/payments/:id', (req, res) => {
  const r = db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Next Cut-Off Payments ─────────────────────────────────────────────────
app.get('/api/next-cut-off', (_req, res) => {
  const rows = db.prepare('SELECT * FROM next_cut_off_payments ORDER BY sort_order, id').all();
  res.json(rows);
});

app.post('/api/next-cut-off', (req, res) => {
  const {
    description = '', number_of_units = 1, unit_price = 0, total_amount = 0,
    date_of_payment = '', remarks = '', status = 'PENDING',
  } = req.body || {};
  const maxOrder = (db.prepare('SELECT COALESCE(MAX(sort_order), -1) AS m FROM next_cut_off_payments').get() as { m: number }).m;
  const r = db.prepare(
    'INSERT INTO next_cut_off_payments (description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, sort_order) VALUES (?,?,?,?,?,?,?,?)'
  ).run(description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, maxOrder + 1);
  res.status(201).json(db.prepare('SELECT * FROM next_cut_off_payments WHERE id = ?').get(r.lastInsertRowid));
});

app.put('/api/next-cut-off/:id', (req, res) => {
  const { description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status } = req.body || {};
  const r = db.prepare(
    'UPDATE next_cut_off_payments SET description=?, number_of_units=?, unit_price=?, total_amount=?, date_of_payment=?, remarks=?, status=? WHERE id = ?'
  ).run(description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json(db.prepare('SELECT * FROM next_cut_off_payments WHERE id = ?').get(req.params.id));
});

app.delete('/api/next-cut-off/:id', (req, res) => {
  const r = db.prepare('DELETE FROM next_cut_off_payments WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

// ── Inventory rows ────────────────────────────────────────────────────────
app.get('/api/inventory', (req, res) => {
  const year = Number(req.query.year ?? new Date().getFullYear());
  const rows = db.prepare('SELECT * FROM inventory_rows WHERE year = ? ORDER BY month_index').all(year);
  res.json(rows);
});

app.put('/api/inventory', (req, res) => {
  const { year, month_index, beginning = null, wholesale = null, retail_sales = null, actual_wholesales = null } = req.body || {};
  if (year === undefined || month_index === undefined) {
    return res.status(400).json({ error: 'year and month_index required' });
  }
  db.prepare(
    `INSERT INTO inventory_rows (year, month_index, beginning, wholesale, retail_sales, actual_wholesales)
     VALUES (?,?,?,?,?,?)
     ON CONFLICT(year, month_index) DO UPDATE SET
       beginning = excluded.beginning,
       wholesale = excluded.wholesale,
       retail_sales = excluded.retail_sales,
       actual_wholesales = excluded.actual_wholesales`
  ).run(year, month_index, beginning, wholesale, retail_sales, actual_wholesales);
  const row = db.prepare('SELECT * FROM inventory_rows WHERE year = ? AND month_index = ?').get(year, month_index);
  res.json(row);
});

const PORT = Number(process.env.PORT ?? 3001);
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[api] listening on http://127.0.0.1:${PORT}`);
});
