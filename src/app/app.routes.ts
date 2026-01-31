import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/dashboard', 
    pathMatch: 'full' 
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/components/register/register')
      .then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./shared/components/layout/layout.component')
      .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'teams',
        loadComponent: () => import('./features/teams/components/teams-list/teams-list')
          .then(m => m.TeamsListComponent)
      },
      {
        path: 'projects',
        loadComponent: () => import('./features/projects/components/projects-list/projects-list')
          .then(m => m.ProjectsListComponent)
      },
      {
        path: 'projects/:teamId',
        loadComponent: () => import('./features/projects/components/projects-list/projects-list')
          .then(m => m.ProjectsListComponent)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/tasks/components/tasks-board/tasks-board')
          .then(m => m.TasksBoardComponent)
      },
      {
        path: 'tasks/:projectId',
        loadComponent: () => import('./features/tasks/components/tasks-board/tasks-board')
          .then(m => m.TasksBoardComponent)
      }
    ]
  },
  { 
    path: '**', 
    redirectTo: '/dashboard' 
  }
];