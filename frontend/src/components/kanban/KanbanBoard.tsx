import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { updateTaskOrder, deleteTask } from '../../api/taskApi';
import { toast } from 'react-hot-toast';
import ConfirmModal from '../common/ConfirmModal';
import type { DropResult } from '@hello-pangea/dnd';
import type { Task } from '../../types';

interface KanbanBoardProps {
  tasks: Task[];
  workspaceId: string;
  onTaskClick: (task: Task) => void;
}

const columns = ['To Do', 'In Progress', 'Done'];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, workspaceId, onTaskClick }) => {
  const queryClient = useQueryClient();
  const [taskToDelete, setTaskToDelete] = React.useState<string | null>(null);

  const updateOrderMutation = useMutation({
    mutationFn: updateTaskOrder,
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', workspaceId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', workspaceId]);

      // Optimistically update
      queryClient.setQueryData<Task[]>(['tasks', workspaceId], (old) => {
        if (!old) return [];
        const newTasks = [...old];
        const task = newTasks.find(t => t._id === newOrder.taskId);
        if (task) {
          task.status = newOrder.destinationStatus;
        }
        return newTasks;
      });

      return { previousTasks };
    },
    onError: (_err, _newOrder, context) => {
      queryClient.setQueryData(['tasks', workspaceId], context?.previousTasks);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onMutate: async ({ id: deletedId }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', workspaceId] });
      const previousTasks = queryClient.getQueryData<Task[]>(['tasks', workspaceId]);
      
      queryClient.setQueryData<Task[]>(['tasks', workspaceId], (old) => {
        if (!old) return [];
        return old.filter(t => t._id !== deletedId);
      });
      return { previousTasks };
    },
    onError: (err: any, _variables, context) => {
      queryClient.setQueryData(['tasks', workspaceId], context?.previousTasks);
      toast.error(`Failed to delete task: ${err.response?.data?.message || err.message}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      toast.success('Task deleted successfully');
    },
  });

  const handleDelete = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation(); 
    setTaskToDelete(taskId);
  };

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    updateOrderMutation.mutate({
      taskId: draggableId,
      sourceStatus: source.droppableId,
      destinationStatus: destination.droppableId,
      sourceIndex: source.index,
      destinationIndex: destination.index,
      workspaceId,
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 h-full pb-4">
        {columns.map((columnId, index) => {
          const columnTasks = tasks
            .filter((t) => t.status === columnId)
            .sort((a, b) => a.order - b.order);

          return (
            <motion.div 
              key={columnId} 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: "easeOut" }}
              className="bg-gray-100 dark:bg-dark-card/50 rounded-xl flex flex-col min-h-[500px]"
            >
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-dark-border">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200">{columnId}</h3>
                <span className="bg-gray-200 dark:bg-dark-border text-gray-600 dark:text-gray-400 text-xs px-2 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto custom-scrollbar transition-colors ${
                      snapshot.isDraggingOver ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                    }`}
                  >
                    <AnimatePresence mode="popLayout">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                              {...(provided.draggableProps as any)}
                              {...(provided.dragHandleProps as any)}
                              ref={provided.innerRef}
                              onClick={() => onTaskClick(task)}
                              className={`mb-3 glass-panel p-4 rounded-lg cursor-pointer active:cursor-grabbing transition-all ${
                                snapshot.isDragging ? 'shadow-2xl ring-2 ring-primary-500 scale-105' : 'hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-900/50 hover:-translate-y-1'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2 group/card">
                                <h4 className="font-medium text-gray-900 dark:text-white line-clamp-2 text-sm pr-2">
                                  {task.title}
                                </h4>
                                <button
                                  onClick={(e) => handleDelete(e, task._id)}
                                  className="text-gray-400 hover:text-red-500 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                  title="Delete Task"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-4 flex items-center justify-between text-[10px]">
                                <span className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider
                                  ${task.priority === 'urgent' 
                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                                    : task.priority === 'high'
                                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                    : task.priority === 'medium'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`
                                }>
                                  {task.priority}
                                </span>
                                {task.assignee && (
                                  <div className="h-6 w-6 rounded-full bg-gray-200 dark:bg-dark-border flex items-center justify-center font-medium text-gray-600 dark:text-gray-300">
                                    {task.assignee.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </Draggable>
                      ))}
                    </AnimatePresence>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          );
        })}
      </div>
      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => taskToDelete && deleteMutation.mutate({ id: taskToDelete, workspaceId })}
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone and all data associated with this task will be lost."
        confirmText="Delete Task"
      />
    </DragDropContext>
  );
};

export default KanbanBoard;
