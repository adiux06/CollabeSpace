import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Loader2, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-hot-toast';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();
  const { setActiveWorkspace } = useAuthStore();

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      const res = await api.post('/workspaces', data);
      return res.data;
    },
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setActiveWorkspace(newWorkspace);
      toast.success('Workspace created successfully!');
      setName('');
      setDescription('');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, description });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-dark-border"
          >
            <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Layout className="w-5 h-5 mr-2 text-primary-500" />
                Create New Workspace
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="e.g. Marketing Team, Project Apollo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="block w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-border dark:bg-dark-bg dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="What is this workspace for?"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim()}
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/20 transition-all font-medium flex items-center justify-center disabled:opacity-50"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Create Workspace'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateWorkspaceModal;
