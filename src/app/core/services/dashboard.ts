import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface DashboardStats {
  totalTeams: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completionRate: number;
  teamGrowth: number;
  projectGrowth: number;
  taskGrowth: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  
  stats = signal<DashboardStats | null>(null);
  loading = signal(false);

  loadDashboardStats(): Observable<DashboardStats> {
    this.loading.set(true);
    
    return forkJoin({
      teams: this.http.get<any[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.teams}`).pipe(catchError(() => of([]))),
      projects: this.http.get<any[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.projects}`).pipe(catchError(() => of([]))),
      tasks: this.http.get<any[]>(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.tasks}`).pipe(catchError(() => of([])))
    }).pipe(
      map(({ teams, projects, tasks }) => {
        const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || t.status === 'in_progress').length;
        const pendingTasks = tasks.filter(t => t.status === 'todo' || t.status === 'pending').length;
        const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

        const stats: DashboardStats = {
          totalTeams: teams.length,
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          completionRate,
          teamGrowth: Math.floor(Math.random() * 20) + 5,
          projectGrowth: Math.floor(Math.random() * 15) + 3,
          taskGrowth: Math.floor(Math.random() * 25) + 10
        };

        this.stats.set(stats);
        this.loading.set(false);
        return stats;
      }),
      catchError((error) => {
        this.loading.set(false);
        console.error('Error loading dashboard stats:', error);
        // Return empty stats on error
        const emptyStats: DashboardStats = {
          totalTeams: 0,
          totalProjects: 0,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completionRate: 0,
          teamGrowth: 0,
          projectGrowth: 0,
          taskGrowth: 0
        };
        this.stats.set(emptyStats);
        return of(emptyStats);
      })
    );
  }
}
