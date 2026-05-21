export const DEFAULT_PRICES = [
  { category: 'APV', model: 'APV 1.6 GA MT', srp: '763,000.00', dnp: '717,220.00', ws_subsidy: '35,000.00', dnp_less_ws_subsidy: '682,220.00', ewt: '3,045.63', po_amount: '679,174.38' },
  { category: 'APV', model: 'APV 1.6 GLX MT', srp: '975,000.00', dnp: '916,500.00', ws_subsidy: '80,000.00', dnp_less_ws_subsidy: '836,500.00', ewt: '3,734.68', po_amount: '832,765.32' },
  { category: 'CELERIO', model: 'CELERIO 1.0 GL AGS', srp: '754,000.00', dnp: '708,760.00', ws_subsidy: '53,000.00', dnp_less_ws_subsidy: '655,760.00', ewt: '2,927.50', po_amount: '652,832.50' },
  { category: 'DZIRE', model: 'DZIRE GL CVT - HYBRID', srp: '920,000.00', dnp: '864,800.00', ws_subsidy: '50,000.00', dnp_less_ws_subsidy: '814,800.00', ewt: '3,637.50', po_amount: '811,162.50' },
  { category: 'SWIFT', model: 'SWIFT 1.2 GL CVT', srp: '845,000.00', dnp: '794,300.00', ws_subsidy: '30,000.00', dnp_less_ws_subsidy: '764,300.00', ewt: '3,412.05', po_amount: '760,887.95' },
];

export const DEFAULT_COLORS = [
  { name: 'PEARL PURE WHITE', hex: '#FFFFFF' },
  { name: 'MIDNIGHT BLACK', hex: '#0B0B0B' },
  { name: 'SUPERIOR WHITE', hex: '#F4F5F6' },
  { name: 'PHOENIX RED PEARL', hex: '#C0392B' },
  { name: 'RADIANT RED PEARL', hex: '#D32F2F' },
  { name: 'SILKY SILVER METALLIC', hex: '#B7B9BB' },
];

export const DEFAULT_TEAMS = [
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

export default { DEFAULT_PRICES, DEFAULT_COLORS, DEFAULT_TEAMS };
