import { Component, inject, Inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { CommentsService } from '../../../../core/services/comments';

interface DialogData {
  taskId: number;
  taskTitle: string;
}

@Component({
  selector: 'app-task-comments-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './task-comments-dialog.html',
  styleUrl: './task-comments-dialog.scss'
})
export class TaskCommentsDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private commentsService = inject(CommentsService);
  private snackBar = inject(MatSnackBar);
  private dialogRef = inject(MatDialogRef<TaskCommentsDialogComponent>);

  comments = this.commentsService.comments;
  loading = this.commentsService.loading;
  submitting = signal(false);

  commentForm = this.fb.nonNullable.group({
    body: ['', [Validators.required, Validators.minLength(1)]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.commentsService.loadComments(this.data.taskId).subscribe({
      error: () => {
        this.snackBar.open('Error loading comments', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.commentForm.valid) {
      this.submitting.set(true);
      
      const commentData = {
        taskId: this.data.taskId,
        body: this.commentForm.value.body!.trim()
      };

      this.commentsService.createComment(commentData).subscribe({
        next: () => {
          this.commentForm.reset();
          this.submitting.set(false);
          this.snackBar.open('Comment added!', 'Close', { duration: 2000 });
        },
        error: () => {
          this.submitting.set(false);
          this.snackBar.open('Error adding comment', 'Close', { duration: 3000 });
        }
      });
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
