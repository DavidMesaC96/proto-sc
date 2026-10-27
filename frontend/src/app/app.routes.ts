import { Routes } from '@angular/router';
import { authGuard, guestGuard, staffGuard } from './core/auth.guard';
import { Shell } from './layout/shell';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Ingresar · Mesa de Servicios',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Mesa de Servicios',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'cases',
        title: 'Tickets · Mesa de Servicios',
        loadComponent: () => import('./features/cases/cases-list').then((m) => m.CasesList),
      },
      {
        path: 'cases/new',
        title: 'Nuevo ticket · Mesa de Servicios',
        loadComponent: () => import('./features/cases/new-case').then((m) => m.NewCase),
      },
      {
        path: 'cases/:id',
        title: 'Detalle del ticket · Mesa de Servicios',
        loadComponent: () => import('./features/cases/case-detail').then((m) => m.CaseDetailPage),
      },
      {
        path: 'incidents',
        canActivate: [staffGuard],
        title: 'Incidentes · Mesa de Servicios',
        loadComponent: () => import('./features/incidents/incidents').then((m) => m.Incidents),
      },
      {
        path: 'catalog',
        title: 'Catálogo · Mesa de Servicios',
        loadComponent: () => import('./features/catalog/catalog').then((m) => m.Catalog),
      },
      {
        path: 'reports',
        canActivate: [staffGuard],
        title: 'Reportes · Mesa de Servicios',
        loadComponent: () => import('./features/reports/reports').then((m) => m.Reports),
      },
      {
        path: 'users',
        canActivate: [staffGuard],
        title: 'Usuarios · Mesa de Servicios',
        loadComponent: () => import('./features/users/users').then((m) => m.Users),
      },
      {
        path: 'health',
        title: 'Health Status · Mesa de Servicios',
        loadComponent: () => import('./features/health/health').then((m) => m.Health),
      },
      {
        path: 'settings',
        title: 'Ajustes · Mesa de Servicios',
        loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
