import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  const { setAuthModalOpen } = useUIStore();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-8 rounded-2xl max-w-md w-full"
        >
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sign in Required</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            You need to be signed in to access this feature. Please log in to your account or create a new one.
          </p>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            Sign In to Continue
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAuth;
