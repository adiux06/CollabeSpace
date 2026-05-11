import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Bell } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';

const Header = () => {
  const { user } = useAuthStore();
  const { 
    theme, toggleTheme, toggleSidebar, sidebarOpen, 
    isNotificationsOpen, setNotificationsOpen, notifications,
    isUserMenuOpen, setUserMenuOpen
  } = useUIStore();

  const hasUnread = notifications.some(n => !n.read);

  return (
    <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="flex items-center">
        <div className="flex items-center transform scale-[0.4] origin-left mr-2">
          <input 
            type="checkbox" 
            id="hamburger-check" 
            className="hamburger-check" 
            checked={sidebarOpen} 
            onChange={toggleSidebar}
          />
          <label 
            htmlFor="hamburger-check" 
            className="hamburger-button text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <div className="hamburger-line1"></div>
            <div className="hamburger-line2"></div>
            <div className="hamburger-line3"></div>
          </label>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
          CollabSpace
        </h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center transform scale-[0.25] origin-right mr-6 z-10">
          <ThemeToggle id="header-theme-checkbox" />
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none rounded-full relative transition-colors ${isNotificationsOpen ? 'bg-gray-100 dark:bg-dark-bg text-primary-500' : ''}`}
          >
            <Bell className="h-5 w-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-dark-card" />
            )}
          </button>
          
          {isNotificationsOpen && <NotificationDropdown />}
        </div>

        <div className="relative">
          {user ? (
            <button 
              onClick={() => setUserMenuOpen(!isUserMenuOpen)}
              className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold shadow-sm hover:ring-2 hover:ring-primary-500/50 transition-all focus:outline-none"
            >
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </button>
          ) : (
            <button
              onClick={() => {
                useUIStore.getState().setAuthModalOpen(true);
              }}
              className="text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors"
            >
              Log In
            </button>
          )}
          
          {isUserMenuOpen && <UserMenu />}
        </div>
      </div>
    </header>
  );
};

export default Header;
