import { X } from 'lucide-react';
import { Button } from './ui/button';

interface PricingData {
  model: string;
  srp: string;
  dsp: string;
  vvsSubsidy: string;
  ltoMaEvfst: string;
  poAmount: string;
  category?: string;
}

interface PricingModalProps {
  onClose: () => void;
}

const pricingData: PricingData[] = [
  // APV Models
  { model: 'APV 1.6 GA MT', srp: '765,000.00', dsp: '712,425.00', vvsSubsidy: '32,000.00', ltoMaEvfst: '3,905.01', poAmount: '679,179.88', category: 'APV' },
  { model: 'APV 1.6 GA AT', srp: '825,000.00', dsp: '767,625.00', vvsSubsidy: '32,000.00', ltoMaEvfst: '3,731.01', poAmount: '832,702.00', category: 'APV' },
  
  // CELERIO Models
  { model: 'CELERIO 1.0 GL AGS', srp: '758,000.00', dsp: '705,700.00', vvsSubsidy: '53,000.00', ltoMaEvfst: '2,767.50', poAmount: '652,832.50', category: 'CELERIO' },
  
  // DZIRE Models
  { model: 'DZIRE GA MT', srp: '820,000.00', dsp: '763,400.00', vvsSubsidy: '60,000.00', ltoMaEvfst: '3,127.50', poAmount: '811,312.50', category: 'DZIRE' },
  { model: 'DZIRE GL CVT', srp: '930,000.00', dsp: '865,950.00', vvsSubsidy: '60,000.00', ltoMaEvfst: '3,629.01', poAmount: '864,336.01', category: 'DZIRE' },
  { model: 'DZIRE GLP AGS', srp: '914,000.00', dsp: '850,740.00', vvsSubsidy: '60,000.00', ltoMaEvfst: '3,529.01', poAmount: '847,996.01', category: 'DZIRE' },
  { model: 'DZIRE GL CVT - HYBRID', srp: '956,000.00', dsp: '890,700.00', vvsSubsidy: '-', ltoMaEvfst: '4,251.99', poAmount: '905,756.01', category: 'DZIRE' },
  { model: 'DZIRE GLP CVT - HYBRID', srp: '1,020,000.00', dsp: '949,650.00', vvsSubsidy: '-', ltoMaEvfst: '4,526.99', poAmount: '962,903.01', category: 'DZIRE' },
  { model: 'DZIRE GLX CVT - HYBRID', srp: '1,120,000.00', dsp: '1,042,000.00', vvsSubsidy: '-', ltoMaEvfst: '4,918.47', poAmount: '1,056,726.48', category: 'DZIRE' },
  { model: 'DZIRE GLX CVT - HYBRID', srp: '1,170,000.00', dsp: '1,089,750.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '4,811.02', poAmount: '1,014,536.02', category: 'DZIRE' },
  
  // ERTIGA Models
  { model: 'ERTIGA 1.5 GA MT - HYBRID', srp: '1,108,000.00', dsp: '1,031,480.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '4,580.00', poAmount: '956,060.00', category: 'ERTIGA' },
  { model: 'ERTIGA 1.5 GL MT - HYBRID', srp: '1,158,000.00', dsp: '1,078,590.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '4,784.01', poAmount: '1,002,305.01', category: 'ERTIGA' },
  { model: 'ERTIGA 1.5 GL AT - HYBRID', srp: '1,208,000.00', dsp: '1,125,700.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '5,004.01', poAmount: '1,050,295.01', category: 'ERTIGA' },
  { model: 'ERTIGA 1.5 GLX MT - HYBRID', srp: '1,278,000.00', dsp: '1,189,290.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '5,260.01', poAmount: '1,113,969.99', category: 'ERTIGA' },
  { model: 'ERTIGA 1.5 GLX AT - HYBRID', srp: '1,328,000.00', dsp: '1,236,400.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '5,464.01', poAmount: '1,160,935.99', category: 'ERTIGA' },
  
  // JIMNY Models
  { model: 'JIMNY 1.5 GL MT', srp: '1,698,000.00', dsp: '1,580,490.00', vvsSubsidy: '-', ltoMaEvfst: '8,364.21', poAmount: '1,721,692.21', category: 'JIMNY' },
  { model: 'JIMNY 1.5 GL AT', srp: '1,758,000.00', dsp: '1,638,750.00', vvsSubsidy: '20,000.00', ltoMaEvfst: '8,589.01', poAmount: '1,742,838.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GL MT (TWO-TONE)', srp: '1,848,000.00', dsp: '1,721,400.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '9,089.01', poAmount: '1,821,910.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GL AT (TWO-TONE)', srp: '1,908,000.00', dsp: '1,779,660.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '9,314.01', poAmount: '1,867,373.99', category: 'JIMNY' },
  { model: 'JIMNY 1.5 GL MT SS', srp: '1,758,000.00', dsp: '1,638,750.00', vvsSubsidy: '-', ltoMaEvfst: '8,589.01', poAmount: '1,805,088.99', category: 'JIMNY' },
  { model: 'JIMNY 1.5 GL AT SS', srp: '1,818,000.00', dsp: '1,696,770.00', vvsSubsidy: '-', ltoMaEvfst: '8,839.01', poAmount: '1,859,358.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GL MT (TWO-TONE) SS', srp: '1,908,000.00', dsp: '1,779,660.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '9,314.01', poAmount: '1,867,373.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GL AT (TWO-TONE) SS', srp: '1,968,000.00', dsp: '1,837,920.00', vvsSubsidy: '-', ltoMaEvfst: '9,564.01', poAmount: '1,941,923.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GLX MT', srp: '2,058,000.00', dsp: '1,921,590.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '10,039.01', poAmount: '2,009,128.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GLX AT', srp: '2,118,000.00', dsp: '1,979,850.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '10,289.01', poAmount: '2,054,638.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GLX MT (TWO-TONE)', srp: '2,118,000.00', dsp: '1,979,850.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '10,289.01', poAmount: '2,054,638.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GLX AT (TWO-TONE)', srp: '2,178,000.00', dsp: '2,038,110.00', vvsSubsidy: '-', ltoMaEvfst: '10,539.01', poAmount: '2,129,188.99', category: 'JIMNY' },
  { model: 'JIMNY SDR GLX AT EDITION', srp: '2,218,000.00', dsp: '2,071,830.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '10,714.01', poAmount: '2,152,043.99', category: 'JIMNY' },
  
  // S-PRESSO Models
  { model: 'S-PRESSO 1.0 GL MT', srp: '598,000.00', dsp: '556,660.00', vvsSubsidy: '60,000.00', ltoMaEvfst: '2,030.01', poAmount: '498,689.99', category: 'S-PRESSO' },
  { model: 'S-PRESSO 1.0 GL AGS', srp: '638,000.00', dsp: '594,020.00', vvsSubsidy: '60,000.00', ltoMaEvfst: '2,155.01', poAmount: '531,864.99', category: 'S-PRESSO' },
  
  // SWIFT Models
  { model: 'SWIFT 1.2 GL CVT', srp: '988,000.00', dsp: '920,460.00', vvsSubsidy: '83,000.00', ltoMaEvfst: '3,775.01', poAmount: '842,260.01', category: 'SWIFT' },
  
  // XL7 Models
  { model: 'XL7 1.5 GLX MT - HYBRID', srp: '1,418,000.00', dsp: '1,319,900.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '5,859.01', poAmount: '1,245,640.01', category: 'XL7' },
  { model: 'XL7 1.5 GLX AT - HYBRID', srp: '1,468,000.00', dsp: '1,367,010.00', vvsSubsidy: '80,000.00', ltoMaEvfst: '6,063.01', poAmount: '1,292,610.01', category: 'XL7' },
  
  // CARRY Models
  { model: 'CARRY CAB & CHASSIS', srp: '690,000.00', dsp: '643,050.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '2,338.99', poAmount: '610,362.61', category: 'CARRY' },
  { model: 'CARRY CARGO VAN', srp: '825,000.00', dsp: '768,150.00', vvsSubsidy: '25,000.00', ltoMaEvfst: '3,052.50', poAmount: '745,886.25', category: 'CARRY' },
  { model: 'CARRY CARGO VAN', srp: '795,000.00', dsp: '708,745.00', vvsSubsidy: '20,000.00', ltoMaEvfst: '3,031.62', poAmount: '685,485.19', category: 'CARRY' },
  { model: 'CARRY DROPSIDE', srp: '795,000.00', dsp: '750,210.00', vvsSubsidy: '30,000.00', ltoMaEvfst: '2,999.62', poAmount: '719,880.25', category: 'CARRY' },
  { model: 'CARRY UTILITY VAN', srp: '825,000.00', dsp: '768,150.00', vvsSubsidy: '25,000.00', ltoMaEvfst: '3,052.50', poAmount: '745,886.25', category: 'CARRY' },
  { model: "CARRY LINYMAN'S VEHICLE (RHD)", srp: '825,000.00', dsp: '768,150.00', vvsSubsidy: '25,000.00', ltoMaEvfst: '3,052.50', poAmount: '745,886.25', category: 'CARRY' },
];

export function PricingModal({ onClose }: PricingModalProps) {
  // Group pricing data by category
  const groupedData = pricingData.reduce((acc, item) => {
    const category = item.category || 'OTHER';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, PricingData[]>);

  const categories = Object.keys(groupedData).sort();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Suzuki Price List</h2>
            <p className="text-sm text-gray-500 mt-1">Updated: March 2026</p>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-blue-50 px-4 py-2 rounded-lg">
                  {category}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left text-xs font-semibold text-gray-700 px-4 py-3">MODEL</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">SRP</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">DSP</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">VVS SUBSIDY</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3">LTO/MA/EVFST</th>
                        <th className="text-right text-xs font-semibold text-gray-700 px-4 py-3 bg-blue-50">PO AMOUNT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {groupedData[category].map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">{item.model}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                            ₱{item.srp}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                            ₱{item.dsp}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                            {item.vvsSubsidy === '-' ? '-' : `₱${item.vvsSubsidy}`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 text-right font-mono">
                            ₱{item.ltoMaEvfst}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-blue-600 text-right font-mono bg-blue-50">
                            ₱{item.poAmount}
                          </td>
                        </tr>
                      ))}
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
            <p><strong>SRP:</strong> Suggested Retail Price | <strong>DSP:</strong> Dealer Selling Price</p>
            <p><strong>VVS:</strong> Vehicle Value Subsidy | <strong>LTO:</strong> Land Transportation Office fees</p>
          </div>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
