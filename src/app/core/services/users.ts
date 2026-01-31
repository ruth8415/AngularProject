import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/users`;

  users = signal<User[]>([]);
  loading = signal(false);

  loadUsers(): Observable<User[]> {
    this.loading.set(true);
    return this.http.get<User[]>(this.apiUrl).pipe(
      tap(users => {
        this.users.set(users);
        this.loading.set(false);
      })
    );
  }
}
