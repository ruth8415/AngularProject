import { Component, input, output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../../core/models/task.model';
import { TasksService } from '../../../../core/services/tasks';
import { TaskDialogComponent } from '../task-dialog/task-dialog';
import { TaskCommentsDialogComponent } from '../task-comments-dialog/task-comments-dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';


@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './task-card.html',
  styleUrl: './task-card.scss'
})
export class TaskCardComponent {
  private dialog = inject(MatDialog);
  private tasksService = inject(TasksService);
  private snackBar = inject(MatSnackBar);

  task = input.required<Task>();
  taskDeleted = output<number>();

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getPriorityColor(priority: string): string {
    const colors = {
      'low': 'accent',
      'normal': 'primary',
      'high': 'warn'
    };
    return colors[priority as keyof typeof colors] || 'primary';
  }

  getPriorityLabel(priority: string): string {
    const labels = {
      'low': 'Low',
      'normal': 'Normal',
      'high': 'High'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  getStatusLabel(status: string): string {
    const labels = {
      'todo': 'To Do',
      'in_progress': 'In Progress',
      'done': 'Done'
    };
    return labels[status as keyof typeof labels] || status;
  }

openTaskDetails(): void {
  const dialogRef = this.dialog.open(TaskDialogComponent, {
    width: '700px',
    data: { task: this.task(), projectId: this.task().projectId }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.snackBar.open('המשימה עודכנה בהצלחה!', 'סגור', { duration: 2000 });
    }
  });
}

  openComments(event: Event): void {
    event.stopPropagation();
    
    this.dialog.open(TaskCommentsDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: { 
        taskId: this.task().id,
        taskTitle: this.task().title
      }
    });
  }

  editTask(event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: this.task(), projectId: this.task().projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Task updated successfully!', 'Close', { duration: 2000 });
      }
    });
  }

  deleteTask(event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      direction: 'rtl',
      panelClass: 'confirm-dialog-container',
      data: {
        title: 'Delete Task',
        message: 'Are you sure you want to delete this task?',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasksService.deleteTask(this.task().id).subscribe({
          next: () => {
            this.taskDeleted.emit(this.task().id);
          },
          error: () => {
            this.snackBar.open('Error deleting task', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }
}