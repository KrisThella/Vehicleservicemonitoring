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
}
