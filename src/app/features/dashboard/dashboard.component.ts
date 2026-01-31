import { Component, inject, OnInit, computed, signal, effect } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatIconModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  stats = this.dashboardService.stats;
  loading = this.dashboardService.loading;

  // Animated counters
  animatedTeams = signal(0);
  animatedProjects = signal(0);
  animatedTasks = signal(0);
  animatedCompletionRate = signal(0);
  animatedCompleted = signal(0);
  animatedInProgress = signal(0);
  animatedPending = signal(0);

  // Computed properties for chart data
  taskStatusData = computed(() => {
    const s = this.stats();
    if (!s) return null;
    return {
      labels: ['Completed', 'In Progress', 'Pending'],
      values: [s.completedTasks, s.inProgressTasks, s.pendingTasks],
      colors: ['#10b981', '#f59e0b', '#6366f1']
    };
  });

  constructor() {
    effect(() => {
      const s = this.stats();
      if (s) {
        this.animateValue(this.animatedTeams, 0, s.totalTeams, 1500);
        this.animateValue(this.animatedProjects, 0, s.totalProjects, 1800);
        this.animateValue(this.animatedTasks, 0, s.totalTasks, 2000);
        this.animateValue(this.animatedCompletionRate, 0, s.completionRate, 2200);
        this.animateValue(this.animatedCompleted, 0, s.completedTasks, 1600);
        this.animateValue(this.animatedInProgress, 0, s.inProgressTasks, 1700);
        this.animateValue(this.animatedPending, 0, s.pendingTasks, 1900);
      }
    });
  }

  ngOnInit(): void {
    this.dashboardService.loadDashboardStats().subscribe();
  }

  private animateValue(signal: any, start: number, end: number, duration: number): void {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(start + (end - start) * easeOutQuart);
      signal.set(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
}
