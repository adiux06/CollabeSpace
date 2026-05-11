import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { User, Settings, LogOut, ChevronRight } from 'lucide-react';

const UserMenu = () => {
  const { user, logout } = useAuthStore();
  const { setUserMenuOpen } = useUIStore();
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden z-50 animate-in fade-in zoom-in duration-200 origin-top-right">
      {/* User Header */}
      <div className="p-4 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="p-2">
        <button 
          className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <span className="font-medium">My Profile</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
        </button>

        <button 
          onClick={handleSettingsClick}
          className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg/50 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            <span className="font-medium">Settings</span>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
        </button>
      </div>

      <div className="p-2 border-t border-gray-100 dark:border-dark-border">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors font-medium"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;
