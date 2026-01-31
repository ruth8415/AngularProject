import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrentTeamService {
  currentTeamId = signal<number | null>(null);

  setCurrentTeam(teamId: number): void {
    this.currentTeamId.set(teamId);
  }

  getCurrentTeam(): number | null {
    return this.currentTeamId();
  }
}