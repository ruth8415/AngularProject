export interface Comment {
  id: number;
  body: string;  
  taskId: number;
  userId: number;
  userName?: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  taskId: number;
  body: string;  
}