import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TeamsService } from '../../../../core/services/teams';
import { TeamDialogComponent } from '../team-dialog/team-dialog';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog';
import { TeamMembersDialogComponent } from '../team-members-dialog/team-members-dialog';
import { Team } from '../../../../core/models/team.model';


@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './teams-list.html',
  styleUrl: './teams-list.scss'
})

export class TeamsListComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  teams = this.teamsService.teams;
  loading = this.teamsService.loading;

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.teamsService.loadTeams().subscribe({
      error: () => {
        this.snackBar.open('שגיאה בטעינת הצוותים', 'סגור', { duration: 3000 });
      }
    });
  }

  openTeamDialog(): void {
    const dialogRef = this.dialog.open(TeamDialogComponent, {
      width: '500px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('הצוות נוצר בהצלחה!', 'סגור', { duration: 3000 });
      }
    });
  }

  viewProjects(teamId: number): void {
    this.router.navigate(['/projects', teamId]);
  }

  openAddMemberDialog(team: Team, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(AddMemberDialogComponent, {
      width: '500px',
      data: {
        teamId: team.id,
        teamName: team.name
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTeams();
      }
    });
  }

  viewTeamMembers(team: Team, event: Event): void {
    event.stopPropagation();
    
    const dialogRef = this.dialog.open(TeamMembersDialogComponent, {
      width: '450px',
      maxHeight: '500px',
      data: {
        teamId: team.id,
        teamName: team.name
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadTeams();
    });
  }
}