import api from './client';
import type { Task } from '../types';

export const fetchTasks = async (workspaceId: string): Promise<Task[]> => {
  const response = await api.get(`/tasks?workspaceId=${workspaceId}`);
  return response.data.tasks;
};

export const fetchMyTasks = async (): Promise<Task[]> => {
  const response = await api.get('/tasks?myTasks=true');
  return response.data.tasks;
};

export const createTask = async (taskData: Partial<Task>): Promise<Task> => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTaskOrder = async (data: {
  taskId: string;
  sourceStatus: string;
  destinationStatus: string;
  sourceIndex: number;
  destinationIndex: number;
  workspaceId: string;
}) => {
  const response = await api.post('/tasks/reorder', data);
  return response.data;
};

export const updateTask = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const response = await api.put(`/tasks/${id}`, updates);
  return response.data;
};

export const deleteTask = async ({ id, workspaceId }: { id: string, workspaceId: string }): Promise<void> => {
  await api.delete(`/tasks/${id}`, { data: { workspaceId } });
};

export const duplicateTask = async (id: string, workspaceId: string): Promise<Task> => {
  const response = await api.post(`/tasks/${id}/duplicate`, { workspaceId });
  return response.data;
};

// Comments
export const fetchTaskComments = async (taskId: string): Promise<any[]> => {
  const response = await api.get(`/comments/task/${taskId}`);
  return response.data;
};

export const addComment = async (taskId: string, text: string): Promise<any> => {
  const response = await api.post('/comments', { taskId, text });
  return response.data;
};

export const deleteComment = async (id: string): Promise<void> => {
  await api.delete(`/comments/${id}`);
};

// AI
export const chatWithAI = async (message: string, workspaceId: string): Promise<{ message: string }> => {
  const response = await api.post('/ai/chat', { message, workspaceId });
  return response.data;
};
