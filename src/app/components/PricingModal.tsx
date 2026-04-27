import { X } from "lucide-react";
import { Button } from "./ui/button";

interface PricingData {
  model: string;
  srp: string;
  dnp: string;
  wsSubsidy: string;
  dnpLesswsSubsidy: string;
  ewt: string;
  poAmount: string;
  category?: string;
}

interface PricingModalProps {
  onClose: () => void;
}

const pricingData: PricingData[] = [
  // APV Models
  {
    model: "APV 1.6 GA MT",
    srp: "763,000.00",
    dnp: "717,220.00",
    wsSubsidy: "35,000.00",
    dnpLesswsSubsidy: "682,220.00",
    ewt: "3,045.63",
    poAmount: "679,174.38",
    category: "APV",
  },
  {
    model: "APV 1.6 GLX MT",
    srp: "975,000.00",
    dnp: "916,500.00",
    wsSubsidy: "80,000.00",
    dnpLesswsSubsidy: "836,500.00",
    ewt: "3,734.68",
    poAmount: "832,765.32",
    category: "APV",
  },
  // CELERIO Models
  {
    model: "CELERIO 1.0 GL AGS",
    srp: "754,000.00",
    dnp: "708,760.00",
    wsSubsidy: "53,000.00",
    dnpLesswsSubsidy: "655,760.00",
    ewt: "2,927.50",
    poAmount: "652,832.50",
    category: "CELERIO",
  },
  // DZIRE Models
  {
    model: "DZIRE GL CVT - HYBRID",
    srp: "920,000.00",
    dnp: "864,800.00",
    wsSubsidy: "50,000.00",
    dnpLesswsSubsidy: "814,800.00",
    ewt: "3,637.50",
    poAmount: "811,162.50",
    category: "DZIRE",
  },
  {
    model: "DZIRE GLX CVT - HYBRID",
    srp: "998,000.00",
    dnp: "938,120.00",
    wsSubsidy: "60,000.00",
    dnpLesswsSubsidy: "878,120.00",
    ewt: "3,920.18",
    poAmount: "874,199.82",
    category: "DZIRE",
  },
  // ERTIGA Models
  {
    model: "ERTIGA 1.5 GA MT - HYBRID",
    srp: "954,000.00",
    dnp: "896,760.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "896,760.00",
    ewt: "4,003.39",
    poAmount: "892,756.61",
    category: "ERTIGA",
  },
  {
    model: "ERTIGA 1.5 GL MT - HYBRID",
    srp: "1,093,000.00",
    dnp: "1,027,420.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,027,420.00",
    ewt: "4,586.70",
    poAmount: "1,022,833.30",
    category: "ERTIGA",
  },
  {
    model: "ERTIGA 1.5 GL AT - HYBRID",
    srp: "1,128,000.00",
    dnp: "1,060,320.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,060,320.00",
    ewt: "4,733.57",
    poAmount: "1,055,586.43",
    category: "ERTIGA",
  },
  {
    model: "ERTIGA 1.5 GLX AT - HYBRID",
    srp: "1,213,000.00",
    dnp: "1,140,220.00",
    wsSubsidy: "90,000.00",
    dnpLesswsSubsidy: "1,050,220.00",
    ewt: "4,688.48",
    poAmount: "1,045,531.52",
    category: "ERTIGA",
  },
  // FRONX Models
  {
    model: "FRONX GL AT",
    srp: "1,059,000.00",
    dnp: "995,460.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "975,460.00",
    ewt: "4,354.73",
    poAmount: "971,105.27",
    category: "FRONX",
  },
  {
    model: "FRONX GLX AT",
    srp: "1,219,000.00",
    dnp: "1,145,860.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "1,125,860.00",
    ewt: "5,026.16",
    poAmount: "1,120,833.84",
    category: "FRONX",
  },
  {
    model: "FRONX GLX AT - HYBRID (TWO-TONE)",
    srp: "1,229,000.00",
    dnp: "1,155,260.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "1,135,260.00",
    ewt: "5,068.13",
    poAmount: "1,130,191.88",
    category: "FRONX",
  },
  {
    model: "FRONX SGX AT - HYBRID (TWO-TONE)",
    srp: "1,299,000.00",
    dnp: "1,221,060.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "1,201,060.00",
    ewt: "5,361.98",
    poAmount: "1,195,698.13",
    category: "FRONX",
  },
  // JIMNY Models
  {
    model: "JIMNY 1.5 GL MT SS",
    srp: "1,293,000.00",
    dnp: "1,196,205.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,196,205.00",
    ewt: "5,340.20",
    poAmount: "1,190,864.80",
    category: "JIMNY",
  },
  {
    model: "JIMNY 1.5 GLX AT (MONOTONE) SS",
    srp: "1,355,000.00",
    dnp: "1,231,000.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,231,000.00",
    ewt: "5,495.54",
    poAmount: "1,225,504.46",
    category: "JIMNY",
  },
  {
    model: "JIMNY 1.5 GLX AT (TWO-TONE) SS",
    srp: "1,365,000.00",
    dnp: "1,231,250.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,231,250.00",
    ewt: "5,496.65",
    poAmount: "1,225,753.35",
    category: "JIMNY",
  },
  {
    model: "JIMNY 1.5 5DR GL MT",
    srp: "1,558,000.00",
    dnp: "1,441,150.00",
    wsSubsidy: "50,000.00",
    dnpLesswsSubsidy: "1,391,150.00",
    ewt: "6,210.49",
    poAmount: "1,384,939.51",
    category: "JIMNY",
  },
  {
    model: "JIMNY 1.5 5DR GLX AT (MONOTONE)",
    srp: "1,698,000.00",
    dnp: "1,570,650.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,570,650.00",
    ewt: "7,011.83",
    poAmount: "1,563,638.17",
    category: "JIMNY",
  },
  {
    model: "JIMNY 1.5 5DR GLX AT (TWO-TONE)",
    srp: "1,708,000.00",
    dnp: "1,579,900.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,579,900.00",
    ewt: "7,053.13",
    poAmount: "1,572,846.88",
    category: "JIMNY",
  },
  {
    model: "JIMNY 3GLX AT R",
    srp: "1,331,000.00",
    dnp: "1,231,175.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,231,175.00",
    ewt: "5,496.32",
    poAmount: "1,225,678.68",
    category: "JIMNY",
  },
  {
    model: "JIMNY 5DR GLX AT R - (MONOTONE)",
    srp: "1,739,000.00",
    dnp: "1,608,575.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,608,575.00",
    ewt: "7,181.14",
    poAmount: "1,601,393.86",
    category: "JIMNY",
  },
  {
    model: "JIMNY 5DR GLX AT R - (TWO-TONE)",
    srp: "1,749,000.00",
    dnp: "1,617,825.00",
    wsSubsidy: "-",
    dnpLesswsSubsidy: "1,617,825.00",
    ewt: "7,222.43",
    poAmount: "1,610,602.57",
    category: "JIMNY",
  },
  // SWIFT Models
  {
    model: "SWIFT 1.2 GL CVT",
    srp: "989,000.00",
    dnp: "929,660.00",
    wsSubsidy: "83,000.00",
    dnpLesswsSubsidy: "846,660.00",
    ewt: "3,779.73",
    poAmount: "842,880.27",
    category: "SWIFT",
  },
  // CARRY Models
  {
    model: "CARRY CAB & CHASSIS",
    srp: "614,000.00",
    dnp: "577,160.00",
    wsSubsidy: "18,000.00",
    dnpLesswsSubsidy: "559,160.00",
    ewt: "2,496.25",
    poAmount: "556,663.75",
    category: "CARRY",
  },
  {
    model: "CARRY DROPSIDE",
    srp: "650,000.00",
    dnp: "611,000.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "591,000.00",
    ewt: "2,638.39",
    poAmount: "588,361.61",
    category: "CARRY",
  },
  {
    model: "CARRY CARGO VAN",
    srp: "705,000.00",
    dnp: "662,700.00",
    wsSubsidy: "23,000.00",
    dnpLesswsSubsidy: "639,700.00",
    ewt: "2,855.80",
    poAmount: "636,844.20",
    category: "CARRY",
  },
  {
    model: "CARRY UTILITY VAN",
    srp: "754,000.00",
    dnp: "708,760.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "688,760.00",
    ewt: "3,074.82",
    poAmount: "685,685.18",
    category: "CARRY",
  },
  {
    model: "CARRY LINEMAN'S VEHICLE BODY",
    srp: "798,000.00",
    dnp: "750,120.00",
    wsSubsidy: "20,000.00",
    dnpLesswsSubsidy: "730,120.00",
    ewt: "3,259.46",
    poAmount: "726,860.54",
    category: "CARRY",
  },
  // S-PRESSO Models
  {
    model: "S-PRESSO 1.0 GL MT",
    srp: "634,000.00",
    dnp: "595,960.00",
    wsSubsidy: "42,000.00",
    dnpLesswsSubsidy: "553,960.00",
    ewt: "2,473.04",
    poAmount: "551,486.96",
    category: "S-PRESSO",
  },
  {
    model: "S-PRESSO 1.0 GL AGS",
    srp: "674,000.00",
    dnp: "633,560.00",
    wsSubsidy: "42,000.00",
    dnpLesswsSubsidy: "591,560.00",
    ewt: "2,640.89",
    poAmount: "588,919.11",
    category: "S-PRESSO",
  },
  // XL7 Models
  {
    model: "XL7 1.5 GLX AT - HYBRID (MONOTONE)",
    srp: "1,252,000.00",
    dnp: "1,176,800.00",
    wsSubsidy: "90,000.00",
    dnpLesswsSubsidy: "1,086,880.00",
    ewt: "4,852.14",
    poAmount: "1,082,027.86",
    category: "XL7",
  },
  {
    model: "XL7 1.5 GLX AT - HYBRID (TWO-TONE)",
    srp: "1,262,000.00",
    dnp: "1,186,280.00",
    wsSubsidy: "90,000.00",
    dnpLesswsSubsidy: "1,096,280.00",
    ewt: "4,894.11",
    poAmount: "1,091,385.89",
    category: "XL7",
  },
  {
    model: "XL7 1.5 GLX AT - HYBRID BLACK EDITION",
    srp: "1,254,000.00",
    dnp: "1,183,460.00",
    wsSubsidy: "90,000.00",
    dnpLesswsSubsidy: "1,093,460.00",
    ewt: "4,881.52",
    poAmount: "1,088,578.48",
    category: "XL7",
  },
  {
    model: "XL7 1.5 GLX AT - HYBRID BLACK EDITION (TWO-TONE)",
    srp: "1,269,000.00",
    dnp: "1,192,860.00",
    wsSubsidy: "90,000.00",
    dnpLesswsSubsidy: "1,102,860.00",
    ewt: "4,923.48",
    poAmount: "1,097,936.52",
    category: "XL7",
  },
];

export function PricingModal({ onClose }: PricingModalProps) {
  // Group pricing data by category
  const groupedData = pricingData.reduce(
    (acc, item) => {
      const category = item.category || "OTHER";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    },
    {} as Record<string, PricingData[]>,
  );

  // Define proper category order
  const categoryOrder = [
    "APV",
    "CELERIO",
    "DZIRE",
    "ERTIGA HYBRID",
    "FRONX HYBRID",
    "JIMNY",
    "SWIFT",
    "CARRY",
    "S-PRESSO",
    "XL7",
  ];
  const categories = categoryOrder.filter(
    (cat) => groupedData[cat],
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Suzuki Price List
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              The Shaw Motor Plaza Corp - Updated: April 2026
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded-lg border-l-4 border-blue-600">
                  {category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-2 border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">
                          MODEL
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">
                          SRP
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">
                          DNP
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">
                          WS SUBSIDY
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">
                          DNP LESS WS SUBSIDY
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">
                          EWT
                        </th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3 bg-blue-50">
                          PO AMOUNT
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData[category].map(
                        (item, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {item.model}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                              ₱{item.srp}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                              ₱{item.dnp}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                              {item.wsSubsidy === "-"
                                ? "-"
                                : `₱${item.wsSubsidy}`}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                              ₱{item.dnpLesswsSubsidy}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                              ₱{item.ewt}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right font-mono bg-blue-50">
                              ₱{item.poAmount}
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-500">
            <p className="font-semibold mb-1">Legend:</p>
            <p>
              <strong>SRP:</strong> Suggested Retail Price |{" "}
              <strong>DNP:</strong> Dealer Net Price |{" "}
              <strong>WS:</strong> Wholesale Subsidy
            </p>
            <p>
              <strong>DNP LESS WS:</strong> Dealer Net Price
              Less Wholesale Subsidy | <strong>EWT:</strong>{" "}
              Expanded With Holding Tax
            </p>
          </div>
          <Button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}