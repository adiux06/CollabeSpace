import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Plus, Check, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import CreateWorkspaceModal from '../dashboard/CreateWorkspaceModal';

const WorkspaceSwitcher = () => {
  const { activeWorkspace, setActiveWorkspace, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: isAuthenticated
  });

  // Set active workspace if none is selected
  React.useEffect(() => {
    if (workspaces && workspaces.length > 0 && !activeWorkspace) {
      setActiveWorkspace(workspaces[0]);
    }
  }, [workspaces, activeWorkspace, setActiveWorkspace]);

  if (!isAuthenticated || isLoading) return null;

  return (
    <div className="relative px-2 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-dark-bg hover:bg-gray-100 dark:hover:bg-dark-border rounded-xl border border-gray-200 dark:border-dark-border transition-all duration-200"
      >
        <div className="flex items-center truncate">
          <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary-500 flex items-center justify-center text-white mr-2">
            <Briefcase className="w-4 h-4" />
          </div>
          <span className="truncate">{activeWorkspace?.name || 'Select Workspace'}</span>
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-2 right-2 mt-2 py-2 bg-white dark:bg-dark-card rounded-xl shadow-xl border border-gray-200 dark:border-dark-border z-20"
            >
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {workspaces?.map((ws: any) => (
                  <button
                    key={ws._id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?._id === ws._id && (
                      <Check className="w-4 h-4 text-primary-500" />
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-dark-border">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full flex items-center px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors font-medium"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
};

export default WorkspaceSwitcher;
