export interface Project {
  id: number;
  name: string;
  description?: string;
  teamId: number;
  teamName?: string;
  dueDate?: string;
  createdAt: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  teamId: number;
  dueDate: string;
}