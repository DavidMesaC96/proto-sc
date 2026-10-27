import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
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
      { path: '', pathMatch: 'full', redirectTo: 'cases' },
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
    ],
  },
  { path: '**', redirectTo: '' },
];
