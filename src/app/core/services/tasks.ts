import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TasksService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.tasks}`;

  tasks = signal<Task[]>([]);
  loading = signal(false);

  private normalizeTask(serverTask: any): Task {
    return {
      id: serverTask.id,
      title: serverTask.title,
      description: serverTask.description,
      status: serverTask.status,
      priority: serverTask.priority,
      projectId: serverTask.project_id || serverTask.projectId,
      projectName: serverTask.project_name || serverTask.projectName,
      teamName: serverTask.team_name || serverTask.teamName,
      assigneeId: serverTask.assigned_to || serverTask.assignedTo,
      createdBy: serverTask.created_by || serverTask.createdBy,
      createdAt: serverTask.created_at || serverTask.createdAt,
      updatedAt: serverTask.updated_at || serverTask.updatedAt
    };
  }

  loadTasks(projectId?: number): Observable<Task[]> {
    this.loading.set(true);
    let params = new HttpParams();
    if (projectId) {
      params = params.set('projectId', projectId.toString());
    }
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map(tasks => tasks.map(t => this.normalizeTask(t))),
      tap(tasks => {
        this.tasks.set(tasks);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  createTask(task: CreateTaskRequest): Observable<Task> {
    return this.http.post<any>(this.apiUrl, task).pipe(
      map(serverTask => this.normalizeTask(serverTask)),
      tap(normalizedTask => {
        this.tasks.update(tasks => [...tasks, normalizedTask]);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  updateTask(id: number, task: UpdateTaskRequest): Observable<Task> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, task).pipe(
      map(serverTask => this.normalizeTask(serverTask)),
      tap(normalizedTask => {
        this.tasks.update(tasks =>
          tasks.map(t => t.id === id ? normalizedTask : t)
        );
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.tasks.update(tasks => tasks.filter(t => t.id !== id));
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}