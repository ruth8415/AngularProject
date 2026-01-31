import { Component, inject, Inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { TeamsService } from '../../../../core/services/teams';

interface DialogData {
  teamId: number;
  teamName: string;
}

interface TeamMember {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-team-members-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './team-members-dialog.html',
  styleUrl: './team-members-dialog.scss'
})
export class TeamMembersDialogComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private dialogRef = inject(MatDialogRef<TeamMembersDialogComponent>);

  members = signal<TeamMember[]>([]);
  loading = signal(true);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit(): void {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.teamsService.listTeamMembers(this.data.teamId).subscribe({
      next: (members) => {
        this.members.set(members);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
