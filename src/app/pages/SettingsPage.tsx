import { useNavigate } from 'react-router';
import { ArrowLeft, User, DollarSign, Palette, ChevronRight, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { useEffect, useState } from 'react';

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem('theme', dark ? 'dark' : 'light');
}

export function SettingsPage() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => { applyTheme(isDarkMode); }, [isDarkMode]);

  const settingsOptions = [
    { icon: User, title: 'User Profile', description: 'Update your profile photo and personal information', path: '/settings/profile' },
    { icon: DollarSign, title: 'Price List', description: 'Manage vehicle pricing and add new units', path: '/settings/price-list' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage your application preferences</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <Palette className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">System Theme</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                  {isDarkMode ? <><Moon className="size-4" /> Dark</> : <><Sun className="size-4" /> Light</>}
                </span>
                <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {settingsOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.path}
                  onClick={() => navigate(option.path)}
                  className="w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:border-blue-300 hover:shadow-sm transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                        <Icon className="size-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">{option.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{option.description}</p>
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
