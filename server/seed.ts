import { db } from './db';

const SEED_PRICES = [
  { category: 'APV', model: 'APV 1.6 GA MT', srp: '763,000.00', dnp: '717,220.00', ws_subsidy: '35,000.00', dnp_less_ws_subsidy: '682,220.00', ewt: '3,045.63', po_amount: '679,174.38' },
  { category: 'APV', model: 'APV 1.6 GLX MT', srp: '975,000.00', dnp: '916,500.00', ws_subsidy: '80,000.00', dnp_less_ws_subsidy: '836,500.00', ewt: '3,734.68', po_amount: '832,765.32' },
  { category: 'CELERIO', model: 'CELERIO 1.0 GL AGS', srp: '754,000.00', dnp: '708,760.00', ws_subsidy: '53,000.00', dnp_less_ws_subsidy: '655,760.00', ewt: '2,927.50', po_amount: '652,832.50' },
  { category: 'DZIRE', model: 'DZIRE GL CVT - HYBRID', srp: '920,000.00', dnp: '864,800.00', ws_subsidy: '50,000.00', dnp_less_ws_subsidy: '814,800.00', ewt: '3,637.50', po_amount: '811,162.50' },
  { category: 'DZIRE', model: 'DZIRE GLX CVT - HYBRID', srp: '998,000.00', dnp: '938,120.00', ws_subsidy: '60,000.00', dnp_less_ws_subsidy: '878,120.00', ewt: '3,920.18', po_amount: '874,199.82' },
  { category: 'ERTIGA', model: 'ERTIGA 1.5 GA MT - HYBRID', srp: '954,000.00', dnp: '896,760.00', ws_subsidy: '-', dnp_less_ws_subsidy: '896,760.00', ewt: '4,003.39', po_amount: '892,756.61' },
  { category: 'ERTIGA', model: 'ERTIGA 1.5 GL MT - HYBRID', srp: '1,093,000.00', dnp: '1,027,420.00', ws_subsidy: '-', dnp_less_ws_subsidy: '1,027,420.00', ewt: '4,586.70', po_amount: '1,022,833.30' },
  { category: 'ERTIGA', model: 'ERTIGA 1.5 GL AT - HYBRID', srp: '1,128,000.00', dnp: '1,060,320.00', ws_subsidy: '-', dnp_less_ws_subsidy: '1,060,320.00', ewt: '4,733.57', po_amount: '1,055,586.43' },
  { category: 'ERTIGA', model: 'ERTIGA 1.5 GLX AT - HYBRID', srp: '1,213,000.00', dnp: '1,140,220.00', ws_subsidy: '90,000.00', dnp_less_ws_subsidy: '1,050,220.00', ewt: '4,688.48', po_amount: '1,045,531.52' },
  { category: 'FRONX', model: 'FRONX GL AT', srp: '1,059,000.00', dnp: '995,460.00', ws_subsidy: '20,000.00', dnp_less_ws_subsidy: '975,460.00', ewt: '4,341.81', po_amount: '971,118.19' },
  { category: 'FRONX', model: 'FRONX GLX AT', srp: '1,219,000.00', dnp: '1,145,860.00', ws_subsidy: '20,000.00', dnp_less_ws_subsidy: '1,125,860.00', ewt: '5,025.27', po_amount: '1,120,834.73' },
  { category: 'JIMNY', model: 'JIMNY 1.5 GL MT SS', srp: '1,293,000.00', dnp: '1,215,420.00', ws_subsidy: '-', dnp_less_ws_subsidy: '1,215,420.00', ewt: '5,425.98', po_amount: '1,209,994.02' },
  { category: 'JIMNY', model: 'JIMNY 1.5 GLX AT (MONOTONE) SS', srp: '1,355,000.00', dnp: '1,273,700.00', ws_subsidy: '-', dnp_less_ws_subsidy: '1,273,700.00', ewt: '5,686.16', po_amount: '1,268,013.84' },
  { category: 'SWIFT', model: 'SWIFT 1.2 GL CVT', srp: '845,000.00', dnp: '794,300.00', ws_subsidy: '30,000.00', dnp_less_ws_subsidy: '764,300.00', ewt: '3,412.05', po_amount: '760,887.95' },
  { category: 'CARRY', model: 'CARRY 1.5 UTILITY VAN MT', srp: '798,000.00', dnp: '750,120.00', ws_subsidy: '20,000.00', dnp_less_ws_subsidy: '730,120.00', ewt: '3,259.46', po_amount: '726,860.54' },
  { category: 'S-PRESSO', model: 'S-PRESSO 1.0 GL MT', srp: '634,000.00', dnp: '595,960.00', ws_subsidy: '42,000.00', dnp_less_ws_subsidy: '553,960.00', ewt: '2,473.04', po_amount: '551,486.96' },
  { category: 'S-PRESSO', model: 'S-PRESSO 1.0 GL AGS', srp: '674,000.00', dnp: '633,560.00', ws_subsidy: '42,000.00', dnp_less_ws_subsidy: '591,560.00', ewt: '2,640.89', po_amount: '588,919.11' },
  { category: 'XL7', model: 'XL7 1.5 GLX AT - HYBRID (MONOTONE)', srp: '1,252,000.00', dnp: '1,176,800.00', ws_subsidy: '90,000.00', dnp_less_ws_subsidy: '1,086,880.00', ewt: '4,852.14', po_amount: '1,082,027.86' },
  { category: 'XL7', model: 'XL7 1.5 GLX AT - HYBRID (TWO-TONE)', srp: '1,262,000.00', dnp: '1,186,280.00', ws_subsidy: '90,000.00', dnp_less_ws_subsidy: '1,096,280.00', ewt: '4,894.11', po_amount: '1,091,385.89' },
];

const SEED_COLORS = [
  { name: 'ALLURING BLUE PEARL METALLIC', hex: '#2A6F9E' },
  { name: 'ARCTIC WHITE PEARL', hex: '#F6F7F8' },
  { name: 'ARCTIC WHITE PEARL METALLIC', hex: '#F5F6F7' },
  { name: 'BRAVE KHAKI PEARL', hex: '#8A7F5A' },
  { name: 'BURGUNDY RED', hex: '#7B1F2A' },
  { name: 'CELESTIAL BLUE PEARL METALLIC', hex: '#3B7EA1' },
  { name: 'GALLANT RED PEARL METALLIC', hex: '#B22222' },
  { name: 'GLISTENING GRAY METALLIC', hex: '#8E9093' },
  { name: 'GRANITE GREY', hex: '#676A6D' },
  { name: 'GRAPHITE GREY METALLIC', hex: '#4F5457' },
  { name: 'JUNGLE GREEN', hex: '#2E7A5E' },
  { name: 'MAGMA GRAY METALLIC', hex: '#6B6E71' },
  { name: 'METALLIC BRISK BLUE / BLACK', hex: '#2F6FA8' },
  { name: 'METALLIC CHIFFON IVORY / BLACK', hex: '#EDE6D6' },
  { name: 'METALLIC MAGMA GRAY 2', hex: '#5F6164' },
  { name: 'METALLIC MINERAL GRAY 2', hex: '#6A6D70' },
  { name: 'METALLIC SPEEDY BLUE', hex: '#1F6BB0' },
  { name: 'METALLIC STAR SILVER 4', hex: '#C0C2C4' },
  { name: 'MIDNIGHT BLACK', hex: '#0B0B0B' },
  { name: 'OXFORD BLUE PEARL METALLIC', hex: '#1F3B5A' },
  { name: 'PHOENIX RED PEARL', hex: '#C0392B' },
  { name: 'PEARL ABLAZE RED 3', hex: '#A71D2A' },
  { name: 'PEARL ARCTIC WHITE 1', hex: '#F7F8F8' },
  { name: 'PEARL BLUISH BLACK 4', hex: '#0F1113' },
  { name: 'PEARL GLORIOUS BROWN', hex: '#6E4B3A' },
  { name: 'PEARL MELLOW DEEP RED', hex: '#8E2B2B' },
  { name: 'PEARL PURE WHITE', hex: '#FFFFFF' },
  { name: 'PEARL SNOW WHITE', hex: '#FBFBFB' },
  { name: 'PEARL SNOW WHITE 4', hex: '#F8F9F9' },
  { name: 'PEARL SUPER BLACK', hex: '#0A0A0A' },
  { name: 'PREMIUM SHERWOOD BROWN', hex: '#5A3E36' },
  { name: 'PREMIUM SILVER METALLIC', hex: '#B0B3B6' },
  { name: 'PRIME CERULEAN BLUE 2', hex: '#007BA7' },
  { name: 'PRIME COOL BLACK', hex: '#0D0D0D' },
  { name: 'RADIANT RED PEARL', hex: '#D32F2F' },
  { name: 'SILKY SILVER METALLIC', hex: '#B7B9BB' },
  { name: 'SOLID JUNGLE GREEN', hex: '#2C6B52' },
  { name: 'SOLID MEDIUM GRAY', hex: '#9A9B9D' },
  { name: 'SOLID FIRE RED', hex: '#C62828' },
  { name: 'SOLID KINETIC YELLOW / BLACK', hex: '#F4C542' },
  { name: 'SPLENDID SILVER PEARL METALLIC', hex: '#C6C8CA' },
  { name: 'SUPERIOR WHITE', hex: '#F4F5F6' },
  { name: 'WHITE', hex: '#FFFFFF' },
];

const DEFAULT_SEED_VERSION = '2026-05-19-core-defaults';

const SEED_TEAMS = [
  {
    manager: 'MR. AARON QUIROGA',
    consultants: [
      'ALONTE, NERRISA',
      'ARAGONES, SARAH JANE M.',
      'CERVANTES, ELLA MARIE',
      'DAGOL, ANN-MARIE',
      'FONACIER, APRIL R.',
      'SARMIENTO, KAREN L.',
    ],
  },
  {
    manager: 'MR. NESTOR MATEO SENARIO JR.',
    consultants: [
      'ALBANO, RHIAN IRISH',
      'BARTOLAZA, ROCHELLE V.',
      'DANO, RYAN',
      'LOYOLA, KARL JOHN',
      'MALLARI, MARILYN',
      'MONTANA, JERISH',
    ],
  },
  {
    manager: 'MR. ROGELIO MENDOZA JR.',
    consultants: [
      'CARAMAY, CARNATION',
      'CASTILLO, JAARON ALBERT D.',
      'MANZANO, ROCKY R.',
      'MARANAN, SALVE MAY CHRISTY J.',
      'MONDEJAR, JESSA MAE',
      'PERA, REGINA O.',
      'STA. MARIA, THELMA C.',
      'VIZCARRA, JELLY ANN L.',
    ],
  },
];

// Map of model -> list of color names to seed as available for that model
const SEED_MODEL_COLORS: { model: string; colors: string[] }[] = [
  { model: 'APV 1.6 GA MT', colors: ['PEARL PURE WHITE', 'MIDNIGHT BLACK', 'SUPERIOR WHITE'] },
  { model: 'APV 1.6 GLX MT', colors: ['PEARL PURE WHITE', 'PHOENIX RED PEARL', 'MIDNIGHT BLACK'] },
  { model: 'CELERIO 1.0 GL AGS', colors: ['ALLURING BLUE PEARL METALLIC', 'PEARL PURE WHITE'] },
  { model: 'DZIRE GL CVT - HYBRID', colors: ['PEARL SNOW WHITE', 'GRAPHITE GREY METALLIC'] },
  { model: 'FRONX GL AT', colors: ['PRIME CERULEAN BLUE 2', 'SUPERIOR WHITE', 'MIDNIGHT BLACK'] },
  { model: 'SWIFT 1.2 GL CVT', colors: ['RADIANT RED PEARL', 'SILKY SILVER METALLIC', 'PEARL PURE WHITE'] },
  { model: 'XL7 1.5 GLX AT - HYBRID (MONOTONE)', colors: ['OXFORD BLUE PEARL METALLIC', 'PEARL ARCTIC WHITE 1'] },
  { model: 'JIMNY 1.5 GL MT SS', colors: ['GALLANT RED PEARL METALLIC', 'PEARL SUPER BLACK', 'PEARL PURE WHITE'] },
];

const SEED_PULL_OUTS: {
  description: string;
  sph_allocation: number;
  date_of_confirmation: string;
  confirmed_units: number;
  pulled_out: number;
}[] = [];

const SEED_PAYMENTS: {
  description: string;
  number_of_units: number;
  total_amount: number;
  date_of_payment: string;
  remarks: string;
}[] = [];

const SEED_NEXT_CUT_OFF: {
  description: string;
  number_of_units: number;
  unit_price: number;
  total_amount: number;
  date_of_payment: string;
  remarks: string;
  status: string;
}[] = [];

const SEED_INVENTORY_2026: {
  month_index: number;
  beginning: number | null;
  wholesale: number | null;
  retail_sales: number | null;
  actual_wholesales: number | null;
}[] = [];

export function seedDatabase() {
  const seedState = db.prepare('SELECT value FROM settings WHERE key = ?').get('defaults_seed_version') as { value: string } | undefined;
  if (seedState?.value === DEFAULT_SEED_VERSION) {
    return;
  }

  // Ensure default prices exist. Use INSERT OR IGNORE so this is idempotent
  const pricesBefore = (db.prepare('SELECT COUNT(*) AS c FROM prices').get() as { c: number }).c;
  const insertPrice = db.prepare(
    'INSERT OR IGNORE INTO prices (category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount) VALUES (?,?,?,?,?,?,?,?)'
  );
  const priceTxn = db.transaction((rows: any[]) => {
    for (const p of rows) insertPrice.run(p.category, p.model, p.srp, p.dnp, p.ws_subsidy, p.dnp_less_ws_subsidy, p.ewt, p.po_amount);
  });
  priceTxn(SEED_PRICES);
  const pricesAfter = (db.prepare('SELECT COUNT(*) AS c FROM prices').get() as { c: number }).c;
  const pricesAdded = pricesAfter - pricesBefore;
  if (pricesAdded > 0) console.log(`[seed] Added ${pricesAdded} default prices (had ${pricesBefore}, now ${pricesAfter})`);

  const profileExists = (db.prepare('SELECT COUNT(*) AS c FROM profile').get() as { c: number }).c;
  if (profileExists === 0) {
    db.prepare('INSERT INTO profile (id, name, role, email, image_data_url) VALUES (1, ?, ?, ?, NULL)')
      .run('Donna Ricci', 'Admin User', 'donna.ricci@tsmpc.com');
    console.log('[seed] Inserted profile');
  }

  const existingColorCount = (db.prepare('SELECT COUNT(*) AS c FROM colors').get() as { c: number }).c;
  const insertColor = db.prepare('INSERT OR IGNORE INTO colors (name, hex, sort_order) VALUES (?,?,?)');
  const colorTxn = db.transaction((rows: { name: string; hex: string }[]) => {
    rows.forEach((r, i) => insertColor.run(r.name, r.hex, existingColorCount + i));
  });
  colorTxn(SEED_COLORS);
  const newColorCount = (db.prepare('SELECT COUNT(*) AS c FROM colors').get() as { c: number }).c;
  const added = newColorCount - existingColorCount;
  if (added > 0) console.log(`[seed] Added ${added} default colors (had ${existingColorCount}, now ${newColorCount})`);

  // Seed model -> color assignments (idempotent)
  const insertAssignment = db.prepare(
    'INSERT OR IGNORE INTO model_color_assignments (price_id, color_id, sort_order) VALUES (?,?,?)'
  );
  const getPriceId = db.prepare('SELECT id FROM prices WHERE model = ?');
  const getColorId = db.prepare('SELECT id FROM colors WHERE name = ?');

  const assignmentTxn = db.transaction(() => {
    let globalOrder = 0;
    for (const item of SEED_MODEL_COLORS) {
      const priceRow = getPriceId.get(item.model) as { id: number } | undefined;
      if (!priceRow) continue; // price not present yet
      const priceId = priceRow.id;
      for (const colorName of item.colors) {
        const colorRow = getColorId.get(colorName) as { id: number } | undefined;
        if (!colorRow) continue; // color may not exist (user may have customized list)
        insertAssignment.run(priceId, colorRow.id, globalOrder++);
      }
    }
  });
  assignmentTxn();

  // Insert default teams (general managers + sales consultants) idempotently
  const gmBefore = (db.prepare('SELECT COUNT(*) AS c FROM general_managers').get() as { c: number }).c;
  const insertManager = db.prepare('INSERT OR IGNORE INTO general_managers (name, sort_order) VALUES (?, ?)');
  const getManagerId = db.prepare('SELECT id FROM general_managers WHERE name = ?');
  const insertConsultant = db.prepare('INSERT OR IGNORE INTO sales_consultants (manager_id, name, sort_order) VALUES (?, ?, ?)');
  const teamTxn = db.transaction(() => {
    SEED_TEAMS.forEach((team, teamIndex) => {
      insertManager.run(team.manager, teamIndex);
      const row = getManagerId.get(team.manager) as { id: number } | undefined;
      const managerId = row ? row.id : null;
      if (managerId) {
        team.consultants.forEach((name, consultantIndex) => {
          insertConsultant.run(managerId, name, consultantIndex);
        });
      }
    });
  });
  teamTxn();
  const gmAfter = (db.prepare('SELECT COUNT(*) AS c FROM general_managers').get() as { c: number }).c;
  const gmAdded = gmAfter - gmBefore;
  if (gmAdded > 0) console.log(`[seed] Added ${gmAdded} general managers (had ${gmBefore}, now ${gmAfter})`);

  const poCount = (db.prepare('SELECT COUNT(*) AS c FROM pull_outs').get() as { c: number }).c;
  if (poCount === 0) {
    const insert = db.prepare(
      'INSERT INTO pull_outs (description, sph_allocation, date_of_confirmation, confirmed_units, pulled_out, sort_order) VALUES (?,?,?,?,?,?)'
    );
    const txn = db.transaction((rows: any[]) => {
      rows.forEach((r, i) => insert.run(r.description, r.sph_allocation, r.date_of_confirmation, r.confirmed_units, r.pulled_out, i));
    });
    txn(SEED_PULL_OUTS);
    console.log(`[seed] Inserted ${SEED_PULL_OUTS.length} pull-out rows`);
  }

  const payCount = (db.prepare('SELECT COUNT(*) AS c FROM payments').get() as { c: number }).c;
  if (payCount === 0) {
    const insert = db.prepare(
      'INSERT INTO payments (description, number_of_units, total_amount, date_of_payment, remarks, sort_order) VALUES (?,?,?,?,?,?)'
    );
    const txn = db.transaction((rows: any[]) => {
      rows.forEach((r, i) => insert.run(r.description, r.number_of_units, r.total_amount, r.date_of_payment, r.remarks, i));
    });
    txn(SEED_PAYMENTS);
    console.log(`[seed] Inserted ${SEED_PAYMENTS.length} payment rows`);
  }

  const ncCount = (db.prepare('SELECT COUNT(*) AS c FROM next_cut_off_payments').get() as { c: number }).c;
  if (ncCount === 0) {
    const insert = db.prepare(
      'INSERT INTO next_cut_off_payments (description, number_of_units, unit_price, total_amount, date_of_payment, remarks, status, sort_order) VALUES (?,?,?,?,?,?,?,?)'
    );
    const txn = db.transaction((rows: any[]) => {
      rows.forEach((r, i) => insert.run(r.description, r.number_of_units, r.unit_price, r.total_amount, r.date_of_payment, r.remarks, r.status, i));
    });
    txn(SEED_NEXT_CUT_OFF);
    console.log(`[seed] Inserted ${SEED_NEXT_CUT_OFF.length} next-cut-off payment rows`);
  }

  const invCount = (db.prepare('SELECT COUNT(*) AS c FROM inventory_rows').get() as { c: number }).c;
  if (invCount === 0) {
    const insert = db.prepare(
      'INSERT INTO inventory_rows (year, month_index, beginning, wholesale, retail_sales, actual_wholesales) VALUES (?,?,?,?,?,?)'
    );
    const txn = db.transaction((rows: any[]) => {
      rows.forEach((r) => insert.run(2026, r.month_index, r.beginning, r.wholesale, r.retail_sales, r.actual_wholesales));
    });
    txn(SEED_INVENTORY_2026);
    console.log(`[seed] Inserted ${SEED_INVENTORY_2026.length} inventory rows`);
  }

  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run('defaults_seed_version', DEFAULT_SEED_VERSION);

  console.log('[seed] Default seed version recorded');
}
