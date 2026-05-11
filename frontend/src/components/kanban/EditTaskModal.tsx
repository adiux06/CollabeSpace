import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  X, Trash2, Copy, Save, Calendar, User as UserIcon, 
  Tag, Folder, Clock, CheckSquare, Plus, MessageSquare,
  ChevronDown, Check
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '../../store/authStore';
import type { Task } from '../../types';
import CommentList from './CommentList';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['To Do', 'In Progress', 'Done', 'Review']),
  dueDate: z.string().optional(),
  assignee: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface EditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  isSubmitting: boolean;
  task: Task | null;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ 
  isOpen, onClose, onSubmit, onDelete, onDuplicate, isSubmitting, task 
}) => {
  const { user } = useAuthStore();
  const [subtasks, setSubtasks] = useState<{title: string, completed: boolean}[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [activeDropdown, setActiveDropdown] = useState<'status' | 'priority' | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  useEffect(() => {
    if (task && isOpen) {
      reset({
        title: task.title,
        description: task.description || '',
        priority: task.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: task.status as 'To Do' | 'In Progress' | 'Done' | 'Review',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        assignee: (task.assignee as any)?._id || (task.assignee as any) || '',
      });
      setSubtasks(task.subtasks || []);
    }
  }, [task, isOpen, reset]);

  const handleFormSubmit = (data: TaskFormData) => {
    onSubmit({ ...data, subtasks });
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    setSubtasks([...subtasks, { title: newSubtask.trim(), completed: false }]);
    setNewSubtask('');
  };

  const toggleSubtask = (index: number) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index));
  };

  const priorityColors = {
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    urgent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const statusColors = {
    'To Do': 'bg-gray-100 text-gray-700 dark:bg-dark-bg dark:text-gray-400',
    'In Progress': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
    'Review': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    'Done': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl h-[90vh] z-[101] overflow-hidden shadow-3xl"
          >
            <div className="bg-white dark:bg-dark-card w-full h-full flex flex-col rounded-3xl border border-gray-200 dark:border-dark-border">
              {/* Header / Top Section */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50">
                <div className="flex items-center gap-4">
                  {/* Status Dropdown */}
                  <div className="relative group">
                    <div 
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-transparent hover:border-current shadow-sm flex items-center gap-2 ${statusColors[watch('status') as keyof typeof statusColors]}`}
                      onClick={() => setActiveDropdown(activeDropdown === 'status' ? null : 'status')}
                    >
                      {watch('status')}
                      <ChevronDown className="w-3 h-3 opacity-70" />
                    </div>
                    
                    <AnimatePresence>
                      {activeDropdown === 'status' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                          {['To Do', 'In Progress', 'Review', 'Done'].map((status) => (
                            <div
                              key={status}
                              onClick={() => {
                                setValue('status', status as 'To Do' | 'In Progress' | 'Review' | 'Done');
                                setActiveDropdown(null);
                              }}
                              className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors flex items-center justify-between ${
                                watch('status') === status 
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg'
                              }`}
                            >
                              {status}
                              {watch('status') === status && <Check className="w-3 h-3" />}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Priority Dropdown */}
                  <div className="relative">
                    <div 
                      className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-transparent hover:border-current shadow-sm flex items-center gap-2 ${priorityColors[watch('priority') as keyof typeof priorityColors]}`}
                      onClick={() => setActiveDropdown(activeDropdown === 'priority' ? null : 'priority')}
                    >
                      {watch('priority')}
                      <ChevronDown className="w-3 h-3 opacity-70" />
                    </div>
                    
                    <AnimatePresence>
                      {activeDropdown === 'priority' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute top-full left-0 mt-2 w-40 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border rounded-xl shadow-2xl z-50 overflow-hidden"
                        >
                          {['low', 'medium', 'high', 'urgent'].map((priority) => (
                            <div
                              key={priority}
                              onClick={() => {
                                setValue('priority', priority as 'low' | 'medium' | 'high' | 'urgent');
                                setActiveDropdown(null);
                              }}
                              className={`px-4 py-2.5 text-xs font-bold capitalize cursor-pointer transition-colors flex items-center justify-between ${
                                watch('priority') === priority 
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' 
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg'
                              }`}
                            >
                              {priority}
                              {watch('priority') === priority && <Check className="w-3 h-3" />}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-dark-bg rounded-xl transition-colors text-gray-500">
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-hidden flex">
                {/* Left Column: Details & Subtasks */}
                <div className="flex-[1.5] overflow-y-auto p-8 custom-scrollbar border-r border-gray-100 dark:border-dark-border">
                  <form id="task-edit-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
                    {/* Title Section */}
                    <div>
                      <input
                        {...register('title')}
                        className="text-3xl font-black w-full bg-transparent border-none focus:ring-0 p-0 dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
                        placeholder="Task Title"
                      />
                      {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Description Section */}
                    <div>
                      <label className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                        <MessageSquare className="w-3.5 h-3.5 mr-2" />
                        Description
                      </label>
                      <textarea
                        {...register('description')}
                        className="w-full min-h-[150px] bg-transparent border-none focus:ring-0 p-0 text-gray-600 dark:text-gray-300 text-base leading-relaxed placeholder-gray-300 dark:placeholder-gray-700"
                        placeholder="What needs to be done?"
                      />
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-6 gap-x-12 pt-6 border-t border-gray-100 dark:border-dark-border">
                      <div className="flex items-center gap-4">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Assignee</label>
                          <select 
                            {...register('assignee')}
                            className="w-full text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 font-medium dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                          >
                            <option value="" className="dark:bg-dark-card">Unassigned</option>
                            <option value={user?._id} className="dark:bg-dark-card">{user?.name} (You)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Due Date</label>
                          <input
                            type="date"
                            {...register('dueDate')}
                            className="w-full text-sm bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-lg px-2 py-1 font-medium dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition-all cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Folder className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Workspace</label>
                          <span className="text-sm font-medium dark:text-white">{(task as any)?.workspaceId?.name || 'Workspace'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <Tag className="w-5 h-5 text-gray-400" />
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Tags</label>
                          <div className="flex flex-wrap gap-1">
                            {task?.tags.map(tag => (
                              <span key={tag} className="px-2 py-0.5 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 rounded-md text-[10px] font-bold">
                                {tag}
                              </span>
                            ))}
                            {task?.tags.length === 0 && <span className="text-xs text-gray-400 italic">No tags</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtasks Section */}
                    <div className="pt-8 border-t border-gray-100 dark:border-dark-border">
                      <div className="flex items-center justify-between mb-6">
                        <label className="flex items-center text-xs font-bold text-gray-400 uppercase tracking-widest">
                          <CheckSquare className="w-3.5 h-3.5 mr-2" />
                          Subtasks 
                          <span className="ml-2 text-primary-500">({subtasks.filter(s => s.completed).length}/{subtasks.length})</span>
                        </label>
                      </div>
                      <div className="space-y-3">
                        {subtasks.map((st, i) => (
                          <div key={i} className="flex items-center gap-3 group">
                            <input
                              type="checkbox"
                              checked={st.completed}
                              onChange={() => toggleSubtask(i)}
                              className="w-5 h-5 rounded border-gray-300 dark:border-dark-border text-primary-600 focus:ring-primary-500"
                            />
                            <span className={`flex-1 text-sm ${st.completed ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                              {st.title}
                            </span>
                            <button 
                              type="button"
                              onClick={() => removeSubtask(i)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-3 mt-4">
                          <Plus className="w-5 h-5 text-gray-400" />
                          <input
                            value={newSubtask}
                            onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                            placeholder="Add a subtask..."
                            className="flex-1 bg-transparent border-none focus:ring-0 p-0 text-sm dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="pt-12 border-t border-gray-100 dark:border-dark-border text-[10px] text-gray-400 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Created by <span className="text-gray-600 dark:text-gray-400 font-bold">{(task as any)?.createdBy?.name || 'User'}</span> on {task?.createdAt && format(new Date(task.createdAt), 'PPP p')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        Last updated {task?.updatedAt && format(new Date(task.updatedAt), 'PPP p')}
                      </div>
                    </div>
                  </form>
                </div>

                {/* Right Column: Sidebar (Comments) */}
                <div className="flex-1 bg-gray-50/30 dark:bg-dark-bg/20 flex flex-col">
                  <div className="flex border-b border-gray-100 dark:border-dark-border">
                    <button 
                      onClick={() => setActiveTab('details')}
                      className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'details' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400'}`}
                    >
                      Activity
                    </button>
                    <button 
                      onClick={() => setActiveTab('comments')}
                      className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'comments' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-400'}`}
                    >
                      Comments
                    </button>
                  </div>
                  
                  <div className="flex-1 p-6 overflow-hidden">
                    {activeTab === 'comments' ? (
                      <CommentList taskId={task?._id || ''} workspaceId={(task as any)?.workspaceId?._id || ''} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-50 grayscale">
                        <Clock className="w-12 h-12 mb-4 text-gray-300" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Activity Log</p>
                        <p className="text-xs text-gray-500 mt-2">Coming soon to CollabSpace</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 border-t border-gray-100 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onDelete}
                    className="flex items-center px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all font-bold text-sm"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={onDuplicate}
                    className="flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl transition-all font-bold text-sm"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </button>
                </div>
                
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-dark-bg rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="task-edit-form"
                    disabled={isSubmitting}
                    className="flex items-center px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 disabled:opacity-50 transition-all"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default EditTaskModal;
