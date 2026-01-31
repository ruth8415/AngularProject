import { Component, input, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CommentsService } from '../../../../core/services/comments';


@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './comments-section.html',
  styleUrl: './comments-section.scss'
})
export class CommentsSectionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);
  private snackBar = inject(MatSnackBar);

  taskId = input.required<number>();

  comments = this.commentsService.comments;
  loading = this.commentsService.loading;
  submitting = signal(false);

  commentForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(1)]]
  });

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.commentsService.loadComments(this.taskId()).subscribe({
      error: (error) => {
        this.snackBar.open('שגיאה בטעינת התגובות', 'סגור', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      this.submitting.set(true);
      
      const commentData = {
        taskId: this.taskId(),
        body: this.commentForm.value.body!.trim()
      };

      this.commentsService.createComment(commentData).subscribe({
        next: () => {
          this.commentForm.reset();
          this.submitting.set(false);
          this.snackBar.open('התגובה נוספה בהצלחה!', 'סגור', { duration: 2000 });
        },
        error: (error) => {
          this.submitting.set(false);
          this.snackBar.open('שגיאה בהוספת התגובה', 'סגור', { duration: 3000 });
        }
      });
    }
  }
}