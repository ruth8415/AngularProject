import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, MatIconModule, MatButtonModule],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(value => !value);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  navigateToTeams(): void {
    this.router.navigate(['/teams']);
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
