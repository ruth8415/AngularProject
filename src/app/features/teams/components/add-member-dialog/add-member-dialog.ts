import { Component, inject, signal, Inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TeamsService } from '../../../../core/services/teams';
import { UsersService } from '../../../../core/services/users';

interface DialogData {
  teamId: number;
  teamName: string;
}

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './add-member-dialog.html',
  styleUrl: './add-member-dialog.scss'
})
export class AddMemberDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private teamsService = inject(TeamsService);
  private usersService = inject(UsersService);
  private dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);
  private snackBar = inject(MatSnackBar);

  loading = signal(false);
  users = this.usersService.users;

  memberForm = this.fb.group({
    userId: [null as number | null, [Validators.required]]
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.usersService.loadUsers().subscribe({
      error: (error: any) => {
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.memberForm.valid) {
      this.loading.set(true);
      
      const userId = this.memberForm.getRawValue().userId;
      
      if (userId !== null) {
        this.teamsService.addMember(this.data.teamId, userId).subscribe({
          next: () => {
            this.snackBar.open('Member added successfully to team', 'Close', { duration: 3000 });
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            this.loading.set(false);
            const errorMessage = error.error?.message || 'Unknown error';
            
            // Check if it's a duplicate member error
            if (errorMessage.includes('already a member') || error.status === 400) {
              this.snackBar.open('This user is already a member of this team', 'Close', { 
                duration: 4000 
              });
            } else {
              this.snackBar.open('Error adding member: ' + errorMessage, 'Close', { 
                duration: 5000 
              });
            }
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
