import { Component, inject, signal, Inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from '../../../../core/services/projects';
import { TeamsService } from '../../../../core/services/teams';


interface DialogData {
  teamId: number;
}

@Component({
  selector: 'app-project-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './project-dialog.html',
  styleUrl: './project-dialog.scss'
})
export class ProjectDialogComponent {
  private fb = inject(FormBuilder);
  private projectsService = inject(ProjectsService);
  private teamsService = inject(TeamsService);
  private dialogRef = inject(MatDialogRef<ProjectDialogComponent>);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  teams = signal<any[]>([]);

  projectForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    teamId: [null as number | null, [Validators.required]],
    description: [''],
    dueDate: ['', Validators.required]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.loadTeams();
  }

  private loadTeams(): void {
    this.teamsService.loadTeams().subscribe({
      next: (teams: any[]) => {
        this.teams.set(teams);
        if (this.data?.teamId) {
          setTimeout(() => {
            const teamId = Number(this.data.teamId);
            console.log('Setting teamId:', teamId);
            console.log('Available teams:', teams);
            this.projectForm.controls.teamId.setValue(teamId);
            console.log('Form value after set:', this.projectForm.value);
          }, 0);
        }
      },
      error: (error: any) => {
        console.error('Error loading teams:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      this.loading.set(true);
      
      const formValue = this.projectForm.getRawValue();
      const projectData = {
        name: formValue.name!,
        teamId: formValue.teamId!,
        description: formValue.description || '',
        dueDate: formValue.dueDate!
      };
      
      this.projectsService.createProject(projectData).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.loading.set(false);
          this.snackBar.open('Error creating project: ' + (error.error?.message || 'Unknown error'), 'Close', { 
            duration: 5000 
          });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}