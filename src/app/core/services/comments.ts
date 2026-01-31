import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Comment, CreateCommentRequest } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.comments}`;

  comments = signal<Comment[]>([]);
  loading = signal(false);

  loadComments(taskId: number): Observable<Comment[]> {
    this.loading.set(true);
    const params = new HttpParams().set('taskId', taskId.toString());
    
    return this.http.get<Comment[]>(this.apiUrl, { params }).pipe(
      tap(comments => {
        this.comments.set(comments);
        this.loading.set(false);
      }),
      catchError(error => {
        this.loading.set(false);
        return throwError(() => error);
      })
    );
  }

  createComment(comment: CreateCommentRequest): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, comment).pipe(
      tap(newComment => {
        this.comments.update(comments => [...comments, newComment]);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }
}