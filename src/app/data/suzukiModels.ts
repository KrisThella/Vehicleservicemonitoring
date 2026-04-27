// ── Suzuki Model Master List with Pricing ────────────────────────────────────
// Used across: AddVehicleModal, AddAvailableVehicleModal, AddInTransitModal,
//              PullOutMonitoringPage (Next Cut Off Payment)

export interface SuzukiModel {
  name: string;
  basePrice: number; // SRP in PHP
  category: string;
  availableColors?: string[]; // Optional: specific colors for this model
}

// ── Available Colors by Category ────────────────────────────────────────────
export const CATEGORY_COLORS: Record<string, string[]> = {
  ERTIGA: [
    "ARCTIC WHITE PEARL",
    "MAGMA GRAY METALLIC",
    "PREMIUM SILVER METALLIC",
    "OXFORD BLUE PEARL METALLIC",
    "MIDNIGHT BLACK",
    "PEARL SNOW WHITE",
  ],
  DZIRE: [
    "ARCTIC WHITE PEARL",
    "SPLENDID SILVER PEARL METALLIC",
    "OXFORD BLUE PEARL METALLIC",
    "MIDNIGHT BLACK",
    "PHOENIX RED PEARL",
  ],
  SWIFT: [
    "SUPERIOR WHITE",
    "PREMIUM SILVER METALLIC",
    "GALLANT RED PEARL METALLIC",
    "MIDNIGHT BLACK",
    "CELESTIAL BLUE PEARL METALLIC",
  ],
  "S-PRESSO": [
    "SUPERIOR WHITE",
    "SILKY SILVER METALLIC",
    "SOLID FIRE RED",
    "CELESTIAL BLUE PEARL METALLIC",
    "SOLID KINETIC YELLOW / BLACK",
  ],
  CELERIO: [
    "SUPERIOR WHITE",
    "SILKY SILVER METALLIC",
    "SOLID FIRE RED",
    "CELESTIAL BLUE PEARL METALLIC",
    "SOLID MEDIUM GRAY",
  ],
  FRONX: [
    "ARCTIC WHITE PEARL METALLIC",
    "SPLENDID SILVER PEARL METALLIC",
    "BRAVE KHAKI PEARL",
    "ALLURING BLUE PEARL METALLIC",
    "GRANITE GREY",
    "PEARL SUPER BLACK",
  ],
  JIMNY: [
    "PEARL PURE WHITE",
    "METALLIC STAR SILVER 4",
    "JUNGLE GREEN",
    "SOLID JUNGLE GREEN",
    "PEARL GLORIOUS BROWN",
    "METALLIC BRISK BLUE / BLACK",
    "PEARL BLUISH BLACK 4",
  ],
  XL7: [
    "PEARL ARCTIC WHITE 1",
    "PREMIUM SILVER METALLIC",
    "GRAPHITE GREY METALLIC",
    "PEARL ABLAZE RED 3",
    "PRIME COOL BLACK",
  ],
};
// UNIT Model and Price
export const SUZUKI_MODELS: SuzukiModel[] = [
  // ── APV ─────────────────────────────────────────────────
  {
    name: "APV 1.6 GA MT",
    basePrice: 763_000,
    category: "APV",
  },
  { name: "APV GLX MT", basePrice: 975_000, category: "APV" },

  // ── Celerio ─────────────────────────────────────────────
  {
    name: "CELERIO 1.0 GL AGS",
    basePrice: 754_000,
    category: "CELERIO",
  },

  // ── Dzire ───────────────────────────────────────────────
  {
    name: "DZIRE GL CVT HYBRID",
    basePrice: 920_000,
    category: "DZIRE",
  },
  {
    name: "DZIRE GLX CVT HYBRID",
    basePrice: 998_000,
    category: "DZIRE",
  },

  // ── Ertiga ──────────────────────────────────────────────
  {
    name: "ERTIGA 1.5 GA MT HYBRID",
    basePrice: 954_000,
    category: "ERTIGA",
  },
  {
    name: "ERTIGA 1.5 GL MT HYBRID",
    basePrice: 1_093_000,
    category: "ERTIGA",
  },
  {
    name: "ERTIGA 1.5 GL AT HYBRID",
    basePrice: 1_128_000,
    category: "ERTIGA",
  },
  {
    name: "ERTIGA 1.5 GLX AT HYBRID",
    basePrice: 1_178_000,
    category: "ERTIGA",
  },

  // ── Jimny ───────────────────────────────────────────────
  {
    name: "JIMNY 1.5 GL MT SS",
    basePrice: 1_293_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 1.5 GLX AT MONOTONE SS",
    basePrice: 1_355_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 1.5 GLX AT TWO-TONE SS",
    basePrice: 1_365_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 1.5 5DR GL MT",
    basePrice: 1_558_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 1.5 5DR GLX AT MONOTONE",
    basePrice: 1_698_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 1.5 5DR GLX AT TWO-TONE",
    basePrice: 1_708_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 3GLX AT R",
    basePrice: 1_331_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 5DR GLX AT R - MONOTONE",
    basePrice: 1_739_000,
    category: "JIMNY",
  },
  {
    name: "JIMNY 5DR GLX AT R - TWO-TONE",
    basePrice: 1_749_000,
    category: "JIMNY",
  },

  // ── Swift ───────────────────────────────────────────────
  {
    name: "SWIFT 1.2 GL CVT",
    basePrice: 989_000,
    category: "SWIFT",
  },

  // ── CARRY ─────────────────────────────────────────────────
  {
    name: "CARRY CAB & CHASSIS",
    basePrice: 614_000,
    category: "CARRY",
  },
  {
    name: "CARRY DROPSIDE",
    basePrice: 650_000,
    category: "CARRY",
  },
  {
    name: "CARRY CARGO VAN",
    basePrice: 705_000,
    category: "CARRY",
  },
  {
    name: "CARRY UTILITY VAN",
    basePrice: 754_000,
    category: "CARRY",
  },
  {
    name: "LINEMAN'S VEHICLE BODY",
    basePrice: 798_000,
    category: "CARRY",
  },

  // ── S-Presso ────────────────────────────────────────────
  {
    name: "S-PRESSO 1.0 GL MT",
    basePrice: 634_000,
    category: "S-PRESSO",
  },
  {
    name: "S-PRESSO 1.0 GL AGS",
    basePrice: 674_000,
    category: "S-PRESSO",
  },

  // ── Fronx ───────────────────────────────────────────────
  {
    name: "FRONX GL AT",
    basePrice: 1_059_000,
    category: "FRONX",
  },
  {
    name: "FRONX GLX AT HYBRID",
    basePrice: 1_219_000,
    category: "FRONX",
  },
  {
    name: "FRONX GLX AT HYBRID (TWO-TONE)",
    basePrice: 1_229_000,
    category: "FRONX",
  },
  {
    name: "FRONX SGX AT HYBRID (TWO-TONE)",
    basePrice: 1_299_000,
    category: "FRONX",
  },

  // ── XL7 ─────────────────────────────────────────────────
  {
    name: "XL7 GLX AT - HYBRID MONOTONE",
    basePrice: 1_125_000,
    category: "XL7",
  },
  {
    name: "XL7 GLX AT - HYBRID (TWO-TONE)",
    basePrice: 1_262_000,
    category: "XL7",
  },
  {
    name: "XL7 GLX AT - HYBRID BLACK EDITION",
    basePrice: 1_259_000,
    category: "XL7",
  },
  {
    name: "XL7 GLX AT - HYBRID (TWO-TONE) BLACK EDITION",
    basePrice: 1_269_000,
    category: "XL7",
  },
];

/** Flat list of model names for dropdowns */
export const SUZUKI_MODEL_NAMES = SUZUKI_MODELS.map(
  (m) => m.name,
);

/** Price lookup by model name */
export const MODEL_PRICE_MAP: Record<string, number> =
  Object.fromEntries(
    SUZUKI_MODELS.map((m) => [m.name, m.basePrice]),
  );

/** Format a number as PHP currency */
export const formatPhp = (n: number): string =>
  `₱${n.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;

/** Get unique categories */
export const MODEL_CATEGORIES = [
  ...new Set(SUZUKI_MODELS.map((m) => m.category)),
];