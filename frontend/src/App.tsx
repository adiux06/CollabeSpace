import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import { useAuthStore } from './store/authStore';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardHome from './components/dashboard/DashboardHome';
import MyTasks from './components/dashboard/MyTasks';
import Team from './components/dashboard/Team';
import Settings from './components/dashboard/Settings';

import AuthModal from './components/auth/AuthModal';
import RequireAuth from './components/layout/RequireAuth';
import { Toaster } from 'react-hot-toast';

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) {
    return <SocketProvider>{children}</SocketProvider>;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-dark-text font-sans">
        <Toaster position="top-right" toastOptions={{
          className: 'dark:bg-dark-card dark:text-white dark:border-dark-border',
        }} />
        <AuthModal />
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/"
            element={
              <AppProvider>
                <DashboardLayout />
              </AppProvider>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="tasks" element={<RequireAuth><MyTasks /></RequireAuth>} />
            <Route path="team" element={<RequireAuth><Team /></RequireAuth>} />
            <Route path="settings" element={<RequireAuth><Settings /></RequireAuth>} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
