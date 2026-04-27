import { useState, useRef, useEffect } from 'react';
import { Car, Bell, Settings, DollarSign, Clock, MoreVertical, FileText, History } from 'lucide-react';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';
import { differenceInDays, format } from 'date-fns';
import { useVehicles, useProfile } from '../../lib/api';

export function Header() {
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [dotMenuOpen, setDotMenuOpen] = useState<string | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const { vehicles } = useVehicles();
  const { profile } = useProfile();

  const overdueVehicles = vehicles.filter(
    (v: any) => v.overdue || v.status === 'Overdue'
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
        setDotMenuOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleViewDetails = (vehicleId: string) => {
    setNotifOpen(false);
    setDotMenuOpen(null);
    navigate('/', { state: { openVehicleId: vehicleId } });
  };

  const handleViewHistory = (vehicleId: string) => {
    setNotifOpen(false);
    setDotMenuOpen(null);
    navigate('/', { state: { openHistoryId: vehicleId } });
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-gray-100">INVENTORY MONITORING</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">The Shaw Motor Plaza Corp – Demo & Service Unit</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/price-list')}
              className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950"
            >
              <DollarSign className="size-4" />
              Price List
            </Button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen((p) => !p); setDotMenuOpen(null); }}
                className="relative p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="size-5 text-gray-600 dark:text-gray-300" />
                {overdueVehicles.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                    {overdueVehicles.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-[420px] bg-white rounded-xl shadow-2xl border border-gray-200 z-[100] overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 bg-red-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="size-4 text-red-600" />
                      <span className="font-semibold text-red-800">Overdue Alerts</span>
                    </div>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-red-600 text-white text-xs font-bold">
                      {overdueVehicles.length}
                    </span>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                    {overdueVehicles.length === 0 ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500">
                        No overdue vehicles at the moment.
                      </div>
                    ) : (
                      overdueVehicles.map((vehicle: any) => {
                        const daysOverdue = differenceInDays(new Date(), vehicle.receivedDate);
                        const isMenuOpen = dotMenuOpen === vehicle.id;
                        return (
                          <div
                            key={vehicle.id}
                            className="group relative flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => handleViewDetails(vehicle.id)}
                          >
                            <div className="mt-1 w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900 text-sm truncate">
                                  {vehicle.model}
                                </span>
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 flex-shrink-0">
                                  {vehicle.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                CS: {vehicle.csNo} • Plate: {vehicle.plateNumber}
                              </p>
                              <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                                <Clock className="size-3 flex-shrink-0" />
                                <span>
                                  Received: {format(vehicle.receivedDate, 'MMM dd, yyyy')} ({daysOverdue} days ago)
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-0.5">
                                {vehicle.location} • {vehicle.dealer}
                              </p>
                            </div>

                            <div className="relative flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDotMenuOpen(isMenuOpen ? null : vehicle.id);
                                }}
                                className="p-1 rounded hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="More options"
                              >
                                <MoreVertical className="size-4 text-gray-500" />
                              </button>
                              {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[110] overflow-hidden">
                                  <button
                                    onClick={() => handleViewDetails(vehicle.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  >
                                    <FileText className="size-4 flex-shrink-0" />
                                    Open Vehicle Details
                                  </button>
                                  <button
                                    onClick={() => handleViewHistory(vehicle.id)}
                                    className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                                  >
                                    <History className="size-4 flex-shrink-0" />
                                    History of Unit
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {overdueVehicles.length > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                      <button
                        onClick={() => { setNotifOpen(false); navigate('/'); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium w-full text-center"
                      >
                        View all in Dashboard
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Settings
              className="size-5 text-gray-600 dark:text-gray-300 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => navigate('/settings')}
            />

            <div className="flex items-center gap-2 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                {profile?.image_data_url ? (
                  <img src={profile.image_data_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">
                    {profile?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2) ?? 'U'}
                  </span>
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900 dark:text-gray-100">{profile?.role ?? 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.name ?? ''}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
