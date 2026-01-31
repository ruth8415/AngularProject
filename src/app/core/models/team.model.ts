export interface Team {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  memberCount?: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}