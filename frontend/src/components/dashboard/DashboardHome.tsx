import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import KanbanBoard from '../kanban/KanbanBoard';
import CreateTaskModal from '../kanban/CreateTaskModal';
import EditTaskModal from '../kanban/EditTaskModal';
import { fetchTasks, createTask, updateTask, deleteTask, duplicateTask } from '../../api/taskApi';
import api from '../../api/client';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import { useSocket } from '../../contexts/SocketContext';
import type { Task } from '../../types';

const DashboardHome = () => {
  const { user, isAuthenticated, activeWorkspace } = useAuthStore();
  const { setAuthModalOpen } = useUIStore();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  // Fetch user workspaces to keep list fresh
  const { data: workspaces, error: workspaceError, isLoading: workspacesLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
    enabled: isAuthenticated
  });

  const workspaceId = activeWorkspace?._id || (workspaces && workspaces.length > 0 ? workspaces[0]._id : null);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', workspaceId],
    queryFn: () => fetchTasks(workspaceId as string),
    enabled: !!workspaceId,
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Failed to create task: ${error.response?.data?.message || error.message}`);
    }
  });

  const editMutation = useMutation({
    mutationFn: (data: { id: string; updates: Partial<Task> }) => updateTask(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setEditingTask(null);
      toast.success('Task updated successfully');
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Failed to update task: ${error.response?.data?.message || error.message}`);
    }
  });
  
  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateTask(id, workspaceId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setEditingTask(null);
      toast.success('Task duplicated');
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Failed to duplicate task: ${error.response?.data?.message || error.message}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTask({ id, workspaceId: workspaceId as string }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setEditingTask(null);
      toast.success('Task deleted successfully');
    },
    onError: (error: any) => {
      console.error(error);
      toast.error(`Failed to delete task: ${error.response?.data?.message || error.message}`);
    }
  });

  // Handle Real-time socket events
  useEffect(() => {
    if (!socket) return;
    
    socket.on('task-created', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    });
    
    socket.on('task-updated', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    });
    
    socket.on('task-moved', () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    });

    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-moved');
    };
  }, [socket, queryClient, workspaceId]);


  const handleCreateTask = async (data: any) => {
    let currentWorkspaceId = workspaceId;
    
    // Fallback: If workspaceId is somehow missing from state, try fetching it directly
    if (!currentWorkspaceId) {
      try {
        const res = await api.get('/workspaces');
        if (res.data && res.data.length > 0) {
          currentWorkspaceId = res.data[0]._id;
        }
      } catch (err) {
        console.error("Failed to fallback fetch workspace", err);
      }
    }

    if (!currentWorkspaceId) {
      alert(`Error: No workspace found! \nWorkspaces loaded: ${workspaces?.length}\nLoading: ${workspacesLoading}\nError: ${workspaceError ? (workspaceError as any).message : 'None'}`);
      return;
    }
    
    createMutation.mutate({
      ...data,
      workspaceId: currentWorkspaceId,
      tags: [],
    });
  };

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

  const handleDeleteTask = async () => {
    if (!editingTask) return;
    setShowConfirmDelete(true);
  };

  const handleDuplicateTask = async () => {
    if (!editingTask) return;
    duplicateMutation.mutate(editingTask._id);
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user?.name || 'Guest'}!
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Here's what's happening in your workspace today.
            </p>
          </div>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setAuthModalOpen(true);
              } else {
                setIsModalOpen(true);
              }
            }}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Task
          </button>
        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">To Do</h3>
            <p className="mt-2 text-3xl font-semibold text-primary-600">
              {tasks.filter(t => t.status === 'To Do').length}
            </p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">In Progress</h3>
            <p className="mt-2 text-3xl font-semibold text-blue-500">
              {tasks.filter(t => t.status === 'In Progress').length}
            </p>
          </div>
          <div className="glass-panel rounded-xl p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Done</h3>
            <p className="mt-2 text-3xl font-semibold text-green-500">
              {tasks.filter(t => t.status === 'Done').length}
            </p>
          </div>
        </div>
        
        {isLoading ? (
          <div className="mt-8 flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="mt-8">
             <KanbanBoard 
              tasks={tasks} 
              workspaceId={workspaceId as string} 
              onTaskClick={(task) => setEditingTask(task)}
            />
          </div>
        )}

        <CreateTaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateTask}
          isSubmitting={createMutation.isPending}
        />

        <EditTaskModal
          isOpen={!!editingTask}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
          onDelete={handleDeleteTask}
          onDuplicate={handleDuplicateTask}
          isSubmitting={editMutation.isPending || duplicateMutation.isPending}
        />

        <ConfirmModal
          isOpen={showConfirmDelete}
          onClose={() => setShowConfirmDelete(false)}
          onConfirm={() => {
            if (editingTask) {
              deleteMutation.mutate(editingTask._id);
            }
          }}
          title="Delete Task?"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete Task"
        />
      </div>
    </div>
  );
};

export default DashboardHome;
