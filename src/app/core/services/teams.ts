import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, map } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Team, CreateTeamRequest } from '../models/team.model';

@Injectable({
  providedIn: 'root'
})
export class TeamsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.teams}`;

  teams = signal<Team[]>([]);
  loading = signal(false);

  private normalizeTeam(serverTeam: any): Team {
    return {
      id: serverTeam.id,
      name: serverTeam.name,
      description: serverTeam.description,
      createdAt: serverTeam.created_at || serverTeam.createdAt,
      memberCount: serverTeam.member_count || serverTeam.memberCount
    };
  }

  loadTeams(): Observable<Team[]> {
    this.loading.set(true);
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(teams => teams.map(t => this.normalizeTeam(t))),
      tap(teams => {
        this.teams.set([...teams]);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  createTeam(team: CreateTeamRequest): Observable<Team> {
    return this.http.post<any>(this.apiUrl, team).pipe(
      map(serverTeam => this.normalizeTeam(serverTeam)),
      tap(normalizedTeam => {
        this.teams.update(teams => [...teams, normalizedTeam]);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  addMember(teamId: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/members`, { userId }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  addMemberByUsername(teamId: number, username: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${teamId}/members`, { username }).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  listTeamMembers(teamId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${teamId}/members`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  removeMember(teamId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}/members/${userId}`).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  deleteTeam(teamId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${teamId}`).pipe(
      tap(() => {
        this.teams.update(teams => teams.filter(t => t.id !== teamId));
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}