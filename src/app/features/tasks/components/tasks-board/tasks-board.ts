import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';

import { Task, TaskStatus } from '../../../../core/models/task.model';
import { TaskCardComponent } from '../task-card/task-card';
import { TasksService } from '../../../../core/services/tasks';
import { TaskDialogComponent } from '../task-dialog/task-dialog';
import { ProjectsService } from '../../../../core/services/projects';
import { TeamsService } from '../../../../core/services/teams';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [
    DragDropModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TaskCardComponent
  ],
  templateUrl: './tasks-board.html',
  styleUrl: './tasks-board.scss'
})
export class TasksBoardComponent implements OnInit {
  private tasksService = inject(TasksService);
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  projectId = Number(this.route.snapshot.paramMap.get('projectId')) || null;
  loading = this.tasksService.loading;
  allTasks = this.tasksService.tasks;
  currentTeamId = signal<number | null>(null);

  todoTasks = computed(() => {
    const tasks = this.allTasks().filter(t => t.status === 'todo');
    return this.projectId ? tasks.filter(t => t.projectId === this.projectId) : tasks;
  });
  
  inProgressTasks = computed(() => {
    const tasks = this.allTasks().filter(t => t.status === 'in_progress');
    return this.projectId ? tasks.filter(t => t.projectId === this.projectId) : tasks;
  });
  
  doneTasks = computed(() => {
    const tasks = this.allTasks().filter(t => t.status === 'done');
    return this.projectId ? tasks.filter(t => t.projectId === this.projectId) : tasks;
  });

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    if (!this.projectId) {
      // When viewing all tasks, load projects and teams to enrich task data
      forkJoin({
        tasks: this.tasksService.loadTasks(),
        projects: this.projectsService.loadProjects(),
        teams: this.teamsService.loadTeams()
      }).subscribe({
        next: ({ tasks, projects, teams }) => {
          // Enrich tasks with project and team names
          const enrichedTasks = tasks.map(task => {
            const project = projects.find(p => p.id === task.projectId);
            const team = project ? teams.find(t => t.id === project.teamId) : undefined;
            return {
              ...task,
              projectName: project?.name,
              teamName: team?.name
            };
          });
          this.tasksService.tasks.set(enrichedTasks);
        },
        error: () => {
          this.snackBar.open('שגיאה בטעינת המשימות', 'סגור', { duration: 3000 });
        }
      });
    } else {
      // When viewing project-specific tasks, load tasks and get project's teamId
      forkJoin({
        tasks: this.tasksService.loadTasks(this.projectId),
        projects: this.projectsService.loadProjects()
      }).subscribe({
        next: ({ tasks, projects }) => {
          const currentProject = projects.find(p => p.id === this.projectId);
          if (currentProject) {
            this.currentTeamId.set(currentProject.teamId);
          }
        },
        error: () => {
          this.snackBar.open('שגיאה בטעינת המשימות', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    const task = event.item.data as Task;
    
    if (event.previousContainer === event.container) {
      return;
    }
    
    this.tasksService.updateTask(task.id, { status: newStatus }).subscribe({
      next: () => {
        this.snackBar.open('המשימה עודכנה בהצלחה!', 'סגור', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('שגיאה בעדכון המשימה', 'סגור', { duration: 3000 });
        this.loadTasks();
      }
    });
  }

  openTaskDialog(status: TaskStatus = 'todo'): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '700px',
      data: { projectId: this.projectId || null, status }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('המשימה נוצרה בהצלחה!', 'סגור', { duration: 3000 });
        this.loadTasks();
      }
    });
  }

  onTaskDeleted(taskId: number): void {
    this.snackBar.open('המשימה נמחקה בהצלחה!', 'סגור', { duration: 2000 });
  }

  goBack(): void {
    if (this.projectId && this.currentTeamId()) {
      // Navigate back to the team's projects page
      this.router.navigate(['/projects', this.currentTeamId()]);
    } else if (this.projectId) {
      // Fallback to all projects if teamId not available
      this.router.navigate(['/projects']);
    }
  }
}