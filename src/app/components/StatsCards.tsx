import { Car, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { VehicleData } from './VehicleTable';

interface StatsCardsProps {
  vehicles: VehicleData[];
}

export function StatsCards({ vehicles }: StatsCardsProps) {
  const totalVehicles = vehicles.length;
  const onProcess = vehicles.filter((v) => v.status === 'On Process').length;
  const completed = vehicles.filter((v) => v.status === 'Completed').length;
  const overdue = vehicles.filter((v) => v.status === 'Overdue' || v.overdue).length;

  const stats = [
    {
      label: 'Total Vehicles',
      value: totalVehicles,
      icon: Car,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
    },
    {
      label: 'On Process',
      value: onProcess,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-950',
    },
    {
      label: 'Completed',
      value: completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-950',
    },
    {
      label: 'Overdue',
      value: overdue,
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
