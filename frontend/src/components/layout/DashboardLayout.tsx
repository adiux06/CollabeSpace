import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AIChatBot from '../ai/AIChatBot';
import { useUIStore } from '../../store/uiStore';

const DashboardLayout = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden transition-colors duration-200">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 transition-all duration-300 ease-in-out`}>
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        
        <main className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-dark-bg">
          <Outlet />
        </main>
        <AIChatBot />
      </div>
    </div>
  );
};

export default DashboardLayout;
