import { Component, inject, signal, OnInit, Inject, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task, TaskStatus, TaskPriority } from '../../../../core/models/task.model';
import { CommentsSectionComponent } from '../comments-section/comments-section';
import { TasksService } from '../../../../core/services/tasks';
import { TeamsService } from '../../../../core/services/teams';
import { ProjectsService } from '../../../../core/services/projects';


interface DialogData {
  projectId: number | null;
  status?: TaskStatus;
  task?: Task;
}

@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTabsModule,
    CommentsSectionComponent
  ],
  templateUrl: './task-dialog.html',
  styleUrl: './task-dialog.scss'
})
export class TaskDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private teamsService = inject(TeamsService);
  private projectsService = inject(ProjectsService);
  private dialogRef = inject(MatDialogRef<TaskDialogComponent>);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  isEditMode = signal(false);
  teams = signal<any[]>([]);
  allProjects = signal<any[]>([]);
  selectedTeamId = signal<number | null>(null);
  
  filteredProjects = computed(() => {
    const teamId = this.selectedTeamId();
    if (!teamId) return [];
    return this.allProjects().filter(p => p.teamId === teamId);
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    status: ['todo' as TaskStatus, Validators.required],
    priority: ['normal' as TaskPriority, Validators.required],
    teamId: [null as number | null],
    projectId: [null as number | null]
  });

  statusOptions = [
    { value: 'todo', label: 'לביצוע' },
    { value: 'in_progress', label: 'בביצוע' },
    { value: 'done', label: 'הושלם' }
  ];

  priorityOptions = [
    { value: 'low', label: 'נמוכה' },
    { value: 'normal', label: 'רגילה' },
    { value: 'high', label: 'גבוהה' }
  ];

  ngOnInit(): void {
    if (this.data.task) {
      this.isEditMode.set(true);
      this.taskForm.patchValue({
        title: this.data.task.title,
        description: this.data.task.description || '',
        status: this.data.task.status,
        priority: this.data.task.priority
      });
    } else if (this.data.status) {
      this.taskForm.patchValue({ status: this.data.status });
    }
    
    if (!this.data.projectId) {
      // Load teams and projects for selection
      this.taskForm.controls.teamId?.setValidators([Validators.required]);
      this.taskForm.controls.projectId?.setValidators([Validators.required]);
      this.taskForm.controls.teamId?.updateValueAndValidity();
      this.taskForm.controls.projectId?.updateValueAndValidity();
      
      this.teamsService.loadTeams().subscribe({
        next: (teams) => this.teams.set(teams)
      });
      
      this.projectsService.loadProjects().subscribe({
        next: (projects) => this.allProjects.set(projects)
      });
    } else {
      this.taskForm.patchValue({ projectId: this.data.projectId });
    }
  }
  
  onTeamChange(): void {
    const teamId = this.taskForm.value.teamId;
    this.selectedTeamId.set(teamId || null);
    this.taskForm.patchValue({ projectId: null });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.loading.set(true);
      
      if (this.isEditMode()) {
        const formValue = this.taskForm.getRawValue();
        const updateData = {
          title: formValue.title || undefined,
          description: formValue.description || undefined,
          status: formValue.status || undefined,
          priority: formValue.priority || undefined
        };
        this.tasksService.updateTask(this.data.task!.id, updateData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading.set(false);
            this.snackBar.open('שגיאה בעדכון המשימה', 'סגור', { duration: 3000 });
          }
        });
      } else {
        const formValue = this.taskForm.getRawValue();
        const taskData = {
          title: formValue.title!,
          description: formValue.description || '',
          status: formValue.status!,
          priority: formValue.priority!,
          projectId: formValue.projectId || this.data.projectId!
        };
        
        this.tasksService.createTask(taskData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: () => {
            this.loading.set(false);
            this.snackBar.open('שגיאה ביצירת המשימה', 'סגור', { duration: 3000 });
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}