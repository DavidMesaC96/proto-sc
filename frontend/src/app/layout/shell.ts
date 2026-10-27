import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  LucideActivity,
  LucideBookOpen,
  LucideChartNoAxesColumn,
  LucideChevronLeft,
  LucideChevronRight,
  LucideLayoutDashboard,
  LucidePlus,
  LucideSettings,
  LucideSiren,
  LucideTicket,
  LucideUsers,
} from '@lucide/angular';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL, Role } from '../core/models';
import { initials } from '../shared/initials';

interface NavItem {
  path: string;
  label: string;
  icon: 'dashboard' | 'ticket' | 'siren' | 'book' | 'chart' | 'users';
  roles: Role[];
  /** false = pantalla aún no migrada desde Next.js. */
  ready: boolean;
}

const ALL_NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['REQUESTER', 'ANALYST', 'MANAGER'], ready: false },
  { path: '/cases', label: 'Tickets', icon: 'ticket', roles: ['REQUESTER', 'ANALYST', 'MANAGER'], ready: true },
  { path: '/incidents', label: 'Incidentes', icon: 'siren', roles: ['ANALYST', 'MANAGER'], ready: false },
  { path: '/catalog', label: 'Catálogo', icon: 'book', roles: ['REQUESTER', 'ANALYST', 'MANAGER'], ready: false },
  { path: '/reports', label: 'Reportes', icon: 'chart', roles: ['MANAGER'], ready: false },
  { path: '/users', label: 'Usuarios', icon: 'users', roles: ['ANALYST', 'MANAGER'], ready: false },
];

@Component({
  selector: 'app-shell',
  imports: [
    NgTemplateOutlet,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideTicket,
    LucideSiren,
    LucideBookOpen,
    LucideChartNoAxesColumn,
    LucideUsers,
    LucideActivity,
    LucidePlus,
    LucideSettings,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly nav = computed(() => {
    const role = this.user()?.role;
    return ALL_NAV.filter((item) => role && item.roles.includes(role));
  });
  protected readonly firstName = computed(() => this.user()?.name.split(' ')[0] ?? '');
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABEL[role] : '';
  });
  protected readonly initials = computed(() => initials(this.user()?.name));

  // En pantallas estrechas el menú se contrae solo; el botón permite abrirlo a mano.
  protected readonly collapsed = signal(false);

  constructor() {
    const mql = window.matchMedia('(max-width: 900px)');
    this.collapsed.set(mql.matches);
    mql.addEventListener('change', (e) => this.collapsed.set(e.matches));
  }

  protected toggle(): void {
    this.collapsed.update((v) => !v);
  }
}
