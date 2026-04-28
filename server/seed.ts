import { db } from './db';

const SEED_VEHICLES = [
  {
    id: 'sold-1', model: 'S-PRESSO 1.0 GL AGS', csNo: 'UD9868', plateNumber: 'NCT5532',
    color: 'SOLID FIRE RED', year: 2024, receivedDate: '2024-05-25', poNumber: 'PO2859',
    vinNumber: 'MAFAA22CM18J139137', dealer: 'TEAM AARON', status: 'SOLD',
    remarks: 'SOLD TO MR. Edson Domayug', location: 'CLIENT DELIVERED', unit: 'SOLD UNIT',
    pullOut: '2024-11-15', overdue: false, category: 'SALES',
    chassisNo: 'MAFAA22CM18J139137', engineNo: 'X12345',
    invoiceDate: '2024-11-15', nameOfClient: 'MR. EDSON DOMAYUG',
    invoiceNumber: 'PHS01281', releaseDate: '2024-11-17', jc: '2024-087',
    arm: 'BASA', terms: 'FINANCING', bank: 'PSB',
    invoiceAmount: '₱248,000.00', statementDeposit: '2024-11-18',
    ltoBankTransmittal: '2024-11-20', salesConsultant: 'JOHN SANTOS',
    generalManager: 'MR. ROBERTO CRUZ', grossProfit: '₱18,500.00',
    extendedWarranty: 'YES - 3 YEARS',
    ltoDocumentsTransmittal: 'TRANSMITTED - 2024-11-22', poAmount: '₱229,500.00',
  },
  {
    id: 'sold-2', model: 'DZIRE GLX CVT - HYBRID', csNo: 'UD25702', plateNumber: 'NCU7223',
    color: 'METALLIC MAGMA GRAY 2', year: 2024, receivedDate: '2024-02-26', poNumber: 'PO09166',
    vinNumber: 'MAFMG22CM70J110284', dealer: 'TEAM JAY-R', status: 'SOLD',
    remarks: 'SOLD TO MA. Mary Lou Laxina (Service)', location: 'CLIENT DELIVERED',
    unit: 'SOLD UNIT', pullOut: '2024-03-01', overdue: false, category: 'SALES',
    chassisNo: 'MAFMG22CM70J110284', engineNo: 'Y98765',
    invoiceDate: '2024-03-01', nameOfClient: 'MA. MARY LOU LAXINA',
    invoiceNumber: 'PHS01498', releaseDate: '2024-03-03', jc: '2024-012',
    arm: 'BASA', terms: 'FINANCING', bank: 'PSB',
    invoiceAmount: '₱1,088,000.00', statementDeposit: '2024-03-04',
    ltoBankTransmittal: '2024-03-06', salesConsultant: 'MARIA RIVERA',
    generalManager: 'MR. ROBERTO CRUZ', grossProfit: '₱42,300.00',
    extendedWarranty: 'YES - 5 YEARS',
    ltoDocumentsTransmittal: 'TRANSMITTED - 2024-03-10', poAmount: '₱1,045,700.00',
  },
  {
    id: 'allocation-1', model: 'JIMNY 1.5 GL MT SS', csNo: 'UD46410', plateNumber: 'N/A UNIT',
    color: 'MIDNIGHT BLACK', year: 2024, receivedDate: '2024-02-18', poNumber: 'PO11443',
    vinNumber: 'MAEAZ6CM99J199665', dealer: 'TEAM JM', status: 'ON TRACK',
    remarks: 'ALLOCATED FOR DEMO', location: 'TEAM JM', unit: 'DEMO UNIT',
    pullOut: '2024-03-01', overdue: false, category: 'AVAILABLE',
    chassisNo: 'MAEAZ6CM99J199665', engineNo: 'Z88888',
    taggingAccount: 'DEMO-2024-001', allocationTeam: 'TEAM JM',
    dateTagged: '2024-02-20', monthDeclared: 'FEBRUARY 2024',
  },
  {
    id: 'intransit-1', model: 'ERTIGA 1.5 GL AT - HYBRID', csNo: 'UD98765', plateNumber: 'N/A UNIT',
    color: 'PEARL SUPER BLACK 2', year: 2024, receivedDate: '2024-03-15', poNumber: 'PO12345',
    vinNumber: 'MAEAZ6CM88J188654', dealer: 'TEAM JAY-R', status: 'IN TRANSIT',
    remarks: 'IN TRANSIT TO SHOWROOM', location: 'IN TRANSIT', unit: 'NEW STOCK',
    pullOut: null, overdue: false, category: 'IN TRANSIT',
    chassisNo: 'MAEAZ6CM88J188654', engineNo: 'P99988',
  },
  {
    id: 'available-1', model: 'SWIFT 1.2 GL CVT', csNo: 'HD50642', plateNumber: 'N/A UNIT',
    color: 'PEARL SUPER BLACK 2', year: 2024, receivedDate: '2024-03-28', poNumber: 'PO10000054',
    vinNumber: 'MAEAZ6CM99J199662', dealer: 'TEAM JM', status: 'ON TRACK',
    remarks: 'AVAILABLE FOR SALE', location: 'SHOWROOM', unit: 'AVAILABLE UNIT',
    pullOut: null, overdue: false, category: 'AVAILABLE',
    chassisNo: 'MAEAZ6CM99J199662', engineNo: 'Q11199',
    taggingAccount: 'AVAIL-2024-005', allocationTeam: 'TEAM JM',
    dateTagged: '2024-03-29', monthDeclared: 'MARCH 2024',
  },
  {
    id: 'overdue-1', model: 'CELERIO GL CVT', csNo: 'UD25906', plateNumber: 'N/A UNIT',
    color: 'PEARL SUPER BLACK 2', year: 2024, receivedDate: '2024-01-24', poNumber: 'PO22001',
    vinNumber: 'MAEAZ6CM99J100022', dealer: 'TEAM JM', status: 'Overdue',
    remarks: 'PENDING PAPERS', location: 'SERVICE BAY 3 • TUAZON-BURIAS',
    unit: 'PENDING UNIT', pullOut: null, overdue: true, category: 'PULL OUT MONITORING',
    chassisNo: 'MAEAZ6CM99J100022', engineNo: 'C90011',
  },
  {
    id: 'overdue-2', model: 'XL7 1.5 GLX MT - HYBRID', csNo: 'UD44331', plateNumber: 'N/A UNIT',
    color: 'PEARL SUPER BLACK 2', year: 2024, receivedDate: '2024-02-05', poNumber: 'PO22002',
    vinNumber: 'MAEAZ6CM99J100023', dealer: 'TEAM JM', status: 'IN TRANSIT',
    remarks: 'PENDING PAPERS', location: 'SERVICE BAY 4', unit: 'PENDING UNIT',
    pullOut: null, overdue: true, category: 'IN TRANSIT',
    chassisNo: 'MAEAZ6CM99J100023', engineNo: 'X11122',
  },
];

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

const SEED_PULL_OUTS = [
  { description: 'Suzuki Ertiga 1.5 GA MT',  sph_allocation: 10, date_of_confirmation: 'Mar 05, 2026', confirmed_units: 8, pulled_out: 6 },
  { description: 'Suzuki Dzire GL MT',       sph_allocation: 8,  date_of_confirmation: 'Mar 10, 2026', confirmed_units: 6, pulled_out: 4 },
  { description: 'Suzuki Swift GL MT',       sph_allocation: 5,  date_of_confirmation: 'Mar 12, 2026', confirmed_units: 5, pulled_out: 5 },
  { description: 'Suzuki Celerio GL MT',     sph_allocation: 6,  date_of_confirmation: 'Mar 15, 2026', confirmed_units: 4, pulled_out: 3 },
  { description: 'Suzuki Fronx GL Hybrid',   sph_allocation: 4,  date_of_confirmation: 'Mar 18, 2026', confirmed_units: 4, pulled_out: 2 },
  { description: 'Suzuki S-Presso GL MT',    sph_allocation: 7,  date_of_confirmation: 'Mar 20, 2026', confirmed_units: 5, pulled_out: 5 },
];

const SEED_PAYMENTS = [
  { description: 'Ertiga 1.5 GA MT – Batch 1', number_of_units: 4, total_amount: 3_480_000, date_of_payment: 'Apr 05, 2026', remarks: 'Paid via BDO' },
  { description: 'Dzire GL MT – Batch 1',      number_of_units: 3, total_amount: 2_100_000, date_of_payment: 'Apr 07, 2026', remarks: 'Paid via BPI' },
  { description: 'Swift GL MT – Full Pull',    number_of_units: 5, total_amount: 4_250_000, date_of_payment: 'Apr 10, 2026', remarks: 'Settled – Bank transfer' },
  { description: 'S-Presso GL MT – Full Pull', number_of_units: 5, total_amount: 3_750_000, date_of_payment: 'Apr 10, 2026', remarks: 'Settled – Bank transfer' },
];

const SEED_NEXT_CUT_OFF = [
  { description: 'ERTIGA 1.5 GA MT',  number_of_units: 2, unit_price: 870_000,   total_amount: 1_740_000, date_of_payment: '2026-04-25', remarks: 'For BDO processing',         status: 'PENDING' },
  { description: 'DZIRE GL MT',       number_of_units: 2, unit_price: 700_000,   total_amount: 1_400_000, date_of_payment: '2026-04-25', remarks: 'Pending bank confirmation',  status: 'PROCESSING' },
  { description: 'CELERIO 1.0 GL MT', number_of_units: 1, unit_price: 595_000,   total_amount: 595_000,   date_of_payment: '2026-04-28', remarks: 'For BPI processing',         status: 'PENDING' },
  { description: 'FRONX GL+ HYBRID',  number_of_units: 2, unit_price: 1_160_000, total_amount: 2_320_000, date_of_payment: '2026-04-28', remarks: 'Awaiting SPH invoice',       status: 'PENDING' },
];

const SEED_INVENTORY_2026 = [
  // Jan, Feb, Mar (past)
  { month_index: 0, beginning: 45, wholesale: 12, retail_sales: 10, actual_wholesales: 11 },
  { month_index: 1, beginning: 48, wholesale: 14, retail_sales: 11, actual_wholesales: 13 },
  { month_index: 2, beginning: 51, wholesale: 16, retail_sales: 12, actual_wholesales: 15 },
  // Apr (current — beginning known, others null)
  { month_index: 3, beginning: 54, wholesale: null, retail_sales: null, actual_wholesales: null },
];

export function seedDatabase() {
  const vehiclesCount = (db.prepare('SELECT COUNT(*) AS c FROM vehicles').get() as { c: number }).c;
  if (vehiclesCount === 0) {
    const insert = db.prepare('INSERT INTO vehicles (id, data) VALUES (?, ?)');
    const txn = db.transaction((rows: any[]) => {
      for (const v of rows) insert.run(v.id, JSON.stringify(v));
    });
    txn(SEED_VEHICLES);
    console.log(`[seed] Inserted ${SEED_VEHICLES.length} vehicles`);
  }

  const pricesCount = (db.prepare('SELECT COUNT(*) AS c FROM prices').get() as { c: number }).c;
  if (pricesCount === 0) {
    const insert = db.prepare(
      'INSERT INTO prices (category, model, srp, dnp, ws_subsidy, dnp_less_ws_subsidy, ewt, po_amount) VALUES (?,?,?,?,?,?,?,?)'
    );
    const txn = db.transaction((rows: any[]) => {
      for (const p of rows) insert.run(p.category, p.model, p.srp, p.dnp, p.ws_subsidy, p.dnp_less_ws_subsidy, p.ewt, p.po_amount);
    });
    txn(SEED_PRICES);
    console.log(`[seed] Inserted ${SEED_PRICES.length} prices`);
  }

  const profileExists = (db.prepare('SELECT COUNT(*) AS c FROM profile').get() as { c: number }).c;
  if (profileExists === 0) {
    db.prepare('INSERT INTO profile (id, name, role, email, image_data_url) VALUES (1, ?, ?, ?, NULL)')
      .run('Donna Ricci', 'Admin User', 'donna.ricci@tsmpc.com');
    console.log('[seed] Inserted profile');
  }

  const colorCount = (db.prepare('SELECT COUNT(*) AS c FROM colors').get() as { c: number }).c;
  if (colorCount === 0) {
    const insert = db.prepare('INSERT INTO colors (name, hex, sort_order) VALUES (?,?,?)');
    const txn = db.transaction((rows: { name: string; hex: string }[]) => {
      rows.forEach((r, i) => insert.run(r.name, r.hex, i));
    });
    txn(SEED_COLORS);
    console.log(`[seed] Inserted ${SEED_COLORS.length} colors`);
  }

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
}
