import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG } from '../config/api.config';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

interface JwtPayload {
  userId: number;
  email: string;
  name: string;
  exp: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = API_CONFIG.baseUrl;

  private currentUserSignal = signal<User | null>(null);
  
  currentUser = this.currentUserSignal.asReadonly();
  isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor() {
    this.loadUserFromToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        this.currentUserSignal.set({
          id: decoded.userId,
          email: decoded.email,
          name: decoded.name
        });
      } catch {
        this.logout();
      }
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_CONFIG.endpoints.auth.register}`,
      data
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}${API_CONFIG.endpoints.auth.login}`,
      data
    ).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem('token', response.token);
    this.currentUserSignal.set(response.user);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private isTokenValid(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_CONFIG.endpoints.auth.me}`).pipe(
      tap(user => this.currentUserSignal.set(user))
    );
  }
}