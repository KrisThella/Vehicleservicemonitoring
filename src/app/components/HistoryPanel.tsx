import { X, Clock, User, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { VehicleData } from './VehicleTable';
import { format } from 'date-fns';

interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  user: string;
  status: 'completed' | 'pending' | 'alert';
  details: string;
}

interface HistoryPanelProps {
  vehicle: VehicleData | null;
  onClose: () => void;
}

// Mock history data generator
const generateHistory = (vehicle: VehicleData): HistoryEntry[] => {
  return [
    {
      id: '1',
      timestamp: vehicle.receivedDate,
      action: 'Vehicle Received',
      user: 'John Martinez',
      status: 'completed',
      details: `Vehicle received at ${vehicle.location}. Initial inspection completed.`,
    },
    {
      id: '2',
      timestamp: new Date(vehicle.receivedDate.getTime() + 2 * 60 * 60 * 1000),
      action: 'Service Started',
      user: 'Sarah Chen',
      status: 'completed',
      details: `Service work initiated. PO Number: ${vehicle.poNumber}`,
    },
    {
      id: '3',
      timestamp: new Date(vehicle.receivedDate.getTime() + 24 * 60 * 60 * 1000),
      action: 'Parts Ordered',
      user: 'Mike Johnson',
      status: 'completed',
      details: 'Required parts ordered from supplier. Expected delivery in 2-3 days.',
    },
    {
      id: '4',
      timestamp: new Date(vehicle.receivedDate.getTime() + 48 * 60 * 60 * 1000),
      action: 'Status Update',
      user: 'Sarah Chen',
      status: vehicle.status === 'Overdue' ? 'alert' : 'pending',
      details: vehicle.remarks,
    },
  ];
};

export function HistoryPanel({ vehicle, onClose }: HistoryPanelProps) {
  if (!vehicle) return null;

  const history = generateHistory(vehicle);

  const getStatusIcon = (status: HistoryEntry['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="size-4 text-green-600" />;
      case 'pending':
        return <Clock className="size-4 text-yellow-600" />;
      case 'alert':
        return <AlertCircle className="size-4 text-red-600" />;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Service History</h2>
            <p className="text-sm text-gray-500 mt-1">Complete timeline and actions</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Vehicle Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">{vehicle.model}</h3>
            <Badge
              variant="outline"
              className={
                vehicle.status === 'Completed'
                  ? 'bg-green-100 text-green-700 border-green-200'
                  : vehicle.status === 'Overdue'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : vehicle.status === 'On Process'
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-yellow-100 text-yellow-700 border-yellow-200'
              }
            >
              {vehicle.status}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">CV Number:</span>
              <p className="font-medium text-gray-900">{vehicle.cvNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Plate:</span>
              <p className="font-medium text-gray-900">{vehicle.plateNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">VIN:</span>
              <p className="font-medium text-gray-900 font-mono text-xs">{vehicle.vinNumber}</p>
            </div>
            <div>
              <span className="text-gray-500">Location:</span>
              <p className="font-medium text-gray-900">{vehicle.location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* History Timeline */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {history.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline Line */}
              {index < history.length - 1 && (
                <div className="absolute left-[11px] top-8 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Entry */}
              <div className="flex gap-4">
                <div className="relative flex-shrink-0 mt-1">
                  <div className="size-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                    {getStatusIcon(entry.status)}
                  </div>
                </div>
                <div className="flex-1 pb-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{entry.action}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(entry.timestamp, 'MMM dd, yyyy • hh:mm a')}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{entry.details}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="size-3" />
                      <span>{entry.user}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        <Button className="w-full" variant="outline">
          <FileText className="size-4 mr-2" />
          Export Full History
        </Button>
      </div>
    </div>
  );
}
