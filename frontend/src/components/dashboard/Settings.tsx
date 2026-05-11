import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { User as UserIcon, Moon, Sun, Settings as SettingsIcon, Mail } from 'lucide-react';
import ThemeToggle from '../layout/ThemeToggle';

const Settings = () => {
  const { user } = useAuthStore();
  const { theme } = useUIStore();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2 text-primary-500" />
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your personal profile and application preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-card shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Information</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="h-20 w-20 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-2xl mr-6">
                  {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-10 h-10" />}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h4>
                  <p className="text-gray-500 dark:text-gray-400 flex items-center mt-1">
                    <Mail className="w-4 h-4 mr-1.5" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-xl border border-gray-200 dark:border-dark-border">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Note:</strong> Profile editing is currently disabled in this demo environment. Contact your administrator if you need to update your details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-card shadow-sm rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Preferences</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Appearance</h4>
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-border rounded-xl">
                  <div className="flex items-center">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-gray-400 mr-3" />
                    ) : (
                      <Sun className="w-5 h-5 text-gray-400 mr-3" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{theme} mode enabled</p>
                    </div>
                  </div>
                  <div className="flex items-center transform scale-[0.25] origin-right mr-6 z-10">
                    <ThemeToggle id="settings-theme-checkbox" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;
