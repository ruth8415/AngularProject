import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private http = inject(HttpClient);
  private healthUrl = 'http://localhost:3000/health';

  checkHealth(): Observable<{ status: string }> {
    return this.http.get<{ status: string }>(this.healthUrl);
  }
}
