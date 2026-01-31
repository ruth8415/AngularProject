import { Component, input, output, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../../core/models/task.model';
import { TasksService } from '../../../../core/services/tasks';
import { TaskDialogComponent } from '../task-dialog/task-dialog';
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

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (d.toDateString() === today.toDateString()) {
      return 'היום';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'אתמול';
    } else {
      return d.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' });
    }
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
      'low': 'נמוכה',
      'normal': 'רגילה',
      'high': 'גבוהה'
    };
    return labels[priority as keyof typeof labels] || priority;
  }

  getStatusLabel(status: string): string {
    const labels = {
      'todo': 'לביצוע',
      'in_progress': 'בביצוע',
      'done': 'הושלם'
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

  editTask(event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      data: { task: this.task(), projectId: this.task().projectId }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('המשימה עודכנה בהצלחה!', 'סגור', { duration: 2000 });
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
        title: 'מחיקת משימה',
        message: 'האם אתה בטוח שברצונך למחוק משימה זו?',
        confirmText: 'מחק',
        cancelText: 'ביטול'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.tasksService.deleteTask(this.task().id).subscribe({
          next: () => {
            this.taskDeleted.emit(this.task().id);
          },
          error: () => {
            this.snackBar.open('שגיאה במחיקת המשימה', 'סגור', { duration: 3000 });
          }
        });
      }
    });
  }
}