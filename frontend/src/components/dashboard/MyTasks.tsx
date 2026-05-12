import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ArrowUpCircle,
  AlertCircle,
  Tag, 
  MoreVertical,
  ChevronRight,
  Layout,
  List as ListIcon,
  Search,
  Briefcase
} from 'lucide-react';
import { fetchMyTasks, updateTask, deleteTask, duplicateTask } from '../../api/taskApi';
import EditTaskModal from '../kanban/EditTaskModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { Task } from '../../types';

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'urgent': 
      return {
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'text-red-500 bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30',
        dot: 'bg-red-500'
      };
    case 'high': 
      return {
        icon: <ArrowUpCircle className="w-4 h-4" />,
        color: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-900/30',
        dot: 'bg-orange-500'
      };
    case 'medium': 
      return {
        icon: <ArrowUpCircle className="w-4 h-4" />,
        color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-900/30',
        dot: 'bg-amber-500'
      };
    default: 
      return {
        icon: <ArrowUpCircle className="w-4 h-4" />,
        color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30',
        dot: 'bg-blue-500'
      };
  }
};

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Done': 
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900/50';
    case 'In Progress': 
      return 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-200 dark:border-sky-900/50';
    case 'Review': 
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/50';
    default: 
      return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-dark-border';
  }
};

const MyTasks = () => {
  const queryClient = useQueryClient();
  const { data: tasks = [], isLoading, error } = useQuery({ queryKey: ['myTasks'], queryFn: fetchMyTasks });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  // Filtering & View State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const editMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Task> }) => updateTask(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      setEditingTask(null);
      toast.success('Task updated successfully');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask({ id, workspaceId: (editingTask as any).workspaceId?._id || '' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      setEditingTask(null);
      toast.success('Task deleted successfully');
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateTask(id, (editingTask as any).workspaceId?._id || (editingTask as any).workspaceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myTasks'] });
      setEditingTask(null);
      toast.success('Task duplicated');
    },
  });

  const handleUpdateTask = (data: any) => {
    if (editingTask) {
      editMutation.mutate({ 
        id: editingTask._id, 
        updates: {
          ...data,
          workspaceId: (editingTask as any).workspaceId?._id || (editingTask as any).workspaceId
        } 
      });
    }
  };

  const handleDeleteTask = () => {
    if (editingTask) {
      deleteMutation.mutate(editingTask._id);
    }
  };

  const handleDuplicateTask = () => {
    if (editingTask) {
      duplicateMutation.mutate(editingTask._id);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-6">We couldn't load your tasks. Please check your connection and try again.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
        >
          Retry Loading
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">My Tasks</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your workload and stay on track.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative group min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-1 shadow-sm">
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-500 px-3 py-1.5 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="w-px h-4 bg-gray-200 dark:bg-dark-border mx-1" />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-gray-500 px-3 py-1.5 focus:ring-0 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">Review</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* View Toggles */}
            <div className="flex items-center bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-1 shadow-sm">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Layout className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-primary-100 text-primary-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-card p-16 text-center rounded-3xl border-2 border-dashed border-gray-200 dark:border-dark-border"
          >
            <div className="w-20 h-20 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-primary-500 opacity-60" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
          </motion.div>
        ) : viewType === 'grid' ? (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-8"
          >
            {filteredTasks.map((task: any) => {
              const priorityStyles = getPriorityStyles(task.priority);
              return (
                <motion.div
                  key={task._id}
                  variants={item}
                  onClick={() => setEditingTask(task)}
                  className="group relative bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Priority Indicator Line */}
                  <div className={`absolute top-0 left-0 w-full h-1 ${priorityStyles.dot}`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${priorityStyles.color}`}>
                        {priorityStyles.icon}
                        {task.priority}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {task.title}
                    </h3>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 min-h-[40px]">
                      {task.description || 'No description provided for this task.'}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6 h-[24px] overflow-hidden">
                      {task.workspaceId && (
                        <span className="flex items-center px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-[10px] font-bold rounded-md border border-primary-100 dark:border-primary-900/30">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {task.workspaceId.name}
                        </span>
                      )}
                      {task.tags?.length > 0 && 
                        task.tags.slice(0, 1).map((tag: string, index: number) => (
                          <span key={index} className="flex items-center px-2 py-0.5 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-400 text-[10px] font-bold rounded-md border border-gray-200 dark:border-dark-border">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))
                      }
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5 mr-1.5" />
                        <span className="text-xs font-medium">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusStyles(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                  </div>

                  {/* View Details Hover Overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-primary-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center text-white text-xs font-bold gap-2 cursor-pointer">
                    View Full Details
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* List View */
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-3 pb-8"
          >
            {filteredTasks.map((task: any) => {
              const priorityStyles = getPriorityStyles(task.priority);
              return (
                <motion.div
                  key={task._id}
                  variants={item}
                  onClick={() => setEditingTask(task)}
                  className="group bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-dark-border p-4 flex items-center gap-6 hover:shadow-lg hover:border-primary-500/50 transition-all cursor-pointer"
                >
                  <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${priorityStyles.dot}`} />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-500 transition-colors truncate">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1">
                      {task.workspaceId && (
                        <div className="flex items-center text-[10px] text-primary-500 font-bold uppercase tracking-wider">
                          <Briefcase className="w-3 h-3 mr-1" />
                          {task.workspaceId.name}
                        </div>
                      )}
                      <div className="flex items-center text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3 mr-1" />
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 pr-4">
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${priorityStyles.color}`}>
                      {task.priority}
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(task.status)} min-w-[90px] text-center`}>
                      {task.status}
                    </div>
                    <div className="flex -space-x-2">
                       {task.assignee ? (
                          <div className="h-7 w-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-black text-[10px] text-primary-600 border-2 border-white dark:border-dark-card">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-gray-100 dark:bg-dark-bg flex items-center justify-center font-black text-[10px] text-gray-400 border-2 border-white dark:border-dark-card">
                            ?
                          </div>
                        )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      <EditTaskModal
        isOpen={!!editingTask}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSubmit={handleUpdateTask}
        onDelete={handleDeleteTask}
        onDuplicate={handleDuplicateTask}
        isSubmitting={editMutation.isPending || duplicateMutation.isPending}
      />
    </div>
  );
};

export default MyTasks;
