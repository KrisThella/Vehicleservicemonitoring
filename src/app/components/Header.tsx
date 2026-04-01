import { Car, Bell, User, Settings, DollarSign } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface HeaderProps {
  onOpenPricing?: () => void;
}

export function Header({ onOpenPricing }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Company Name */}
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Car className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">2026 TSMPC INVENTORY MONITORING</h1>
              <p className="text-sm text-gray-500">The Shaw Motor Plaza Corp – Demo & Service Unit</p>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Price List Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenPricing}
              className="flex items-center gap-2 text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <DollarSign className="size-4" />
              Price List
            </Button>
            
            <div className="relative">
              <Bell className="size-5 text-gray-600 cursor-pointer hover:text-gray-900" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                3
              </Badge>
            </div>
            <Settings className="size-5 text-gray-600 cursor-pointer hover:text-gray-900" />
            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="size-4 text-blue-600" />
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Service Manager</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}