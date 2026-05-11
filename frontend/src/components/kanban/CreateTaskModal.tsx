import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown, Check } from 'lucide-react';
import type { Task } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['To Do', 'In Progress', 'Done']),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  isSubmitting: boolean;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [activeDropdown, setActiveDropdown] = React.useState<'status' | 'priority' | null>(null);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      priority: 'medium',
      status: 'To Do',
    }
  });

  React.useEffect(() => {
    if (isOpen) {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'To Do',
      });
    }
  }, [isOpen, reset]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit(data);
  };

  const priorityColors = {
    low: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900/30',
    medium: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30',
    high: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:border-rose-900/30',
    urgent: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900/30',
  };

  const statusColors = {
    'To Do': 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-dark-bg dark:border-dark-border',
    'In Progress': 'bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-900/20 dark:border-sky-900/30',
    'Done': 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass-panel rounded-2xl p-6 shadow-2xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Task</h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input
                    {...register('title')}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="Task title"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-dark-bg dark:border-dark-border dark:text-white focus:ring-2 focus:ring-primary-500 outline-none min-h-[100px]"
                    placeholder="Add more details..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                    <div className="relative">
                      <div 
                        onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between font-bold text-sm ${priorityColors[watch('priority') as keyof typeof priorityColors]}`}
                      >
                        <span className="capitalize">{watch('priority')}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </div>
                      <AnimatePresence>
                        {activeDropdown === 'priority' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            {['low', 'medium', 'high', 'urgent'].map((p) => (
                              <div
                                key={p}
                                onClick={() => {
                                  setValue('priority', p as any);
                                  setActiveDropdown(null);
                                }}
                                className="px-4 py-3 text-sm font-bold capitalize hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors flex items-center justify-between cursor-pointer"
                              >
                                {p}
                                {watch('priority') === p && <Check className="w-4 h-4 text-primary-500" />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <div className="relative">
                      <div 
                        onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                        className={`w-full px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between font-bold text-sm ${statusColors[watch('status') as keyof typeof statusColors]}`}
                      >
                        {watch('status')}
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </div>
                      <AnimatePresence>
                        {activeDropdown === 'status' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden"
                          >
                            {['To Do', 'In Progress', 'Done'].map((s) => (
                              <div
                                key={s}
                                onClick={() => {
                                  setValue('status', s as any);
                                  setActiveDropdown(null);
                                }}
                                className="px-4 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors flex items-center justify-between cursor-pointer"
                              >
                                {s}
                                {watch('status') === s && <Check className="w-4 h-4 text-primary-500" />}
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-dark-bg rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Task'}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateTaskModal;
