export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  projectName?: string;
  teamName?: string;
  assigneeId?: number;
  createdBy: number;
  dueDate?: string;
  orderIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: number;
  assigneeId?: number;
  dueDate?: string;
  orderIndex?: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: number;  
  dueDate?: string;
  orderIndex?: number;
}