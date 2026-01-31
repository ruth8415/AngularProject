import { Component, OnInit, inject, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ProjectsService } from '../../../../core/services/projects';
import { TeamsService } from '../../../../core/services/teams';
import { CurrentTeamService } from '../../../../core/services/current-team';
import { ProjectDialogComponent } from '../project-dialog/project-dialog';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog';
import { Project } from '../../../../core/models/project.model';

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './projects-list.html',
  styleUrl: './projects-list.scss'
})
export class ProjectsListComponent implements OnInit {
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private currentTeamService = inject(CurrentTeamService);

  teamId = Number(this.route.snapshot.paramMap.get('teamId')) || null;
  
  allProjects = this.projectsService.projects;
  loading = this.projectsService.loading;

  projects = computed(() => {
    if (this.teamId) {
      return this.allProjects().filter(p => p.teamId === this.teamId);
    }
    return this.allProjects();
  });

  constructor() {
  }

  ngOnInit(): void {
    if (this.teamId) {
      this.currentTeamService.setCurrentTeam(this.teamId);
    }
    this.loadProjects();
  }

  loadProjects(): void {
    if (!this.teamId) {
      // When viewing all projects, load teams to enrich project data
      forkJoin({
        projects: this.projectsService.loadProjects(),
        teams: this.teamsService.loadTeams()
      }).subscribe({
        next: ({ projects, teams }) => {
          // Enrich projects with team names
          const enrichedProjects = projects.map(project => {
            const team = teams.find(t => t.id === project.teamId);
            return {
              ...project,
              teamName: team?.name
            };
          });
          this.projectsService.projects.set(enrichedProjects);
        },
        error: () => {
          this.snackBar.open('שגיאה בטעינת הפרויקטים', 'סגור', { duration: 3000 });
        }
      });
    } else {
      // When viewing team-specific projects, just load projects normally
      this.projectsService.loadProjects().subscribe({
        next: () => {
        },
        error: () => {
          this.snackBar.open('שגיאה בטעינת הפרויקטים', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  openProjectDialog(): void {
    const dialogRef = this.dialog.open(ProjectDialogComponent, {
      width: '500px',
      data: { teamId: this.teamId || null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('הפרויקט נוצר בהצלחה!', 'סגור', { duration: 3000 });
        this.loadProjects();
      }
    });
  }

  viewTasks(projectId: number): void {
    this.router.navigate(['/tasks', projectId]);
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }

  deleteProject(project: Project, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'מחיקת פרויקט',
        message: `האם אתה בטוח שברצונך למחוק את הפרויקט "${project.name}"?`,
        confirmText: 'מחק',
        cancelText: 'ביטול'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectsService.deleteProject(project.id).subscribe({
          next: () => {
            this.snackBar.open('הפרויקט נמחק בהצלחה', 'סגור', { duration: 3000 });
          },
          error: (error: any) => {
            this.snackBar.open('שגיאה במחיקת הפרויקט: ' + (error.error?.message || 'שגיאה לא ידועה'), 'סגור', { 
              duration: 5000 
            });
          }
        });
      }
    });
  }
}