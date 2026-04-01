import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { VehicleData } from './VehicleTable';
import { format, differenceInDays } from 'date-fns';

interface OverdueAlertsProps {
  vehicles: VehicleData[];
}

export function OverdueAlerts({ vehicles }: OverdueAlertsProps) {
  const overdueVehicles = vehicles.filter((v) => v.overdue || v.status === 'Overdue');

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="size-5 text-red-600" />
            Overdue Alerts
          </CardTitle>
          <Badge className="bg-red-600 text-white">
            {overdueVehicles.length} Overdue
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {overdueVehicles.length === 0 ? (
          <p className="text-sm text-gray-600 py-4 text-center">
            No overdue vehicles at the moment.
          </p>
        ) : (
          <div className="space-y-3">
            {overdueVehicles.slice(0, 5).map((vehicle) => {
              const daysOverdue = differenceInDays(new Date(), vehicle.receivedDate);
              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-lg p-3 border border-red-200 hover:border-red-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-900">{vehicle.model}</p>
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 text-xs">
                          {vehicle.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>CV: {vehicle.cvNumber} • Plate: {vehicle.plateNumber}</p>
                        <div className="flex items-center gap-1 text-red-600">
                          <Clock className="size-3" />
                          <span>
                            Received: {format(vehicle.receivedDate, 'MMM dd, yyyy')} ({daysOverdue} days ago)
                          </span>
                        </div>
                        <p className="text-xs">Location: {vehicle.location} • {vehicle.dealer}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {overdueVehicles.length > 5 && (
              <Button variant="outline" size="sm" className="w-full mt-2">
                View All {overdueVehicles.length} Overdue Vehicles
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
