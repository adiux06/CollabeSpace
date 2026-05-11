import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

const Sidebar = () => {
  const { logout, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setAuthModalOpen } = useUIStore();

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'My Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Team', to: '/team', icon: Users },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const handleLinkClick = (e: React.MouseEvent, to: string) => {
    if (to !== '/' && !isAuthenticated) {
      e.preventDefault();
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col transition-colors duration-200">
      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={(e) => handleLinkClick(e, item.to)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <item.icon
                className={`mr-3 flex-shrink-0 h-5 w-5 transition-all duration-300 ${
                  window.location.pathname === item.to
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 group-hover:text-primary-500'
                } ${item.name === 'Settings' ? 'settings-icon-animate' : 'sidebar-icon-animate'}`}
                aria-hidden="true"
              />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {isAuthenticated && (
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-dark-border p-4">
          <button
            onClick={logout}
            className="flex-shrink-0 w-full group block text-left"
          >
            <div className="flex items-center">
              <LogOut className="inline-block h-6 w-6 text-gray-400 group-hover:text-red-500 transition-colors" />
              {sidebarOpen && (
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-500 transition-colors">
                    Logout
                  </p>
                </div>
              )}
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
