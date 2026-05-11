export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  members: {
    userId: User;
    role: 'admin' | 'member' | 'viewer';
  }[];
  settings: {
    taskStatuses: string[];
    defaultView: 'kanban' | 'list';
  };
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Review' | string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  workspaceId: string;
  assignee?: User;
  order: number;
  tags: string[];
  subtasks?: { title: string; completed: boolean }[];
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: User;
}
