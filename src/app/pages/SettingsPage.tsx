import { useNavigate } from 'react-router';
import { ArrowLeft, User, DollarSign, Palette, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useState } from 'react';

export function SettingsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const settingsOptions = [
    {
      icon: User,
      title: 'User Profile',
      description: 'Update your profile photo and personal information',
      path: '/settings/profile',
    },
    {
      icon: DollarSign,
      title: 'Price List',
      description: 'Manage vehicle pricing and add new units',
      path: '/settings/price-list',
    },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage your application preferences</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* System Theme */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Palette className="size-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">System Theme</h3>
                  <p className="text-sm text-gray-500">Switch between light and dark mode</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
                <Switch
                  checked={isDarkMode}
                  onCheckedChange={setIsDarkMode}
                />
              </div>
            </div>
          </div>

          {/* Other Settings Options */}
          <div className="space-y-3">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.path}
                  onClick={() => navigate(option.path)}
                  className="w-full bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
                        <Icon className="size-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.title}</h3>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="size-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
