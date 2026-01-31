import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamsService } from '../../../../core/services/teams';


@Component({
  selector: 'app-team-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './team-dialog.html',
  styleUrl: './team-dialog.scss'
})
export class TeamDialogComponent {
  private fb = inject(FormBuilder);
  private teamsService = inject(TeamsService);
  private dialogRef = inject(MatDialogRef<TeamDialogComponent>);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);

  teamForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['']
  });

  onSubmit(): void {
    if (this.teamForm.valid) {
      this.loading.set(true);
      
      this.teamsService.createTeam(this.teamForm.getRawValue()).subscribe({
        next: () => {
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading.set(false);
          this.snackBar.open('שגיאה ביצירת הצוות', 'סגור', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}