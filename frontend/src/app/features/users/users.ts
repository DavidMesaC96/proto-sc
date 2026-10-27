import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { LucideShield, LucideUser, LucideUserCheck, LucideUsers } from '@lucide/angular';
import { errorMessage } from '../../core/http-error';
import { Role, UserListItem } from '../../core/models';
import { UsersService } from '../../core/users.service';
import { PageHeader } from '../../layout/page-header';
import { initials } from '../../shared/initials';

const ROLE_CFG: Record<Role, { label: string; color: string; bg: string }> = {
  MANAGER: { label: 'Responsable', color: '#002B7A', bg: 'rgba(0,43,122,.08)' },
  ANALYST: { label: 'Analista', color: '#007A3D', bg: 'rgba(0,200,83,.10)' },
  REQUESTER: { label: 'Usuario', color: '#6B7280', bg: 'rgba(107,114,128,.08)' },
};

@Component({
  selector: 'app-users',
  imports: [DatePipe, PageHeader, LucideUsers, LucideShield, LucideUserCheck, LucideUser],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly users = signal<UserListItem[]>([]);

  protected readonly initials = initials;
  protected readonly roleCfg = ROLE_CFG;

  protected readonly managers = computed(() => this.users().filter((u) => u.role === 'MANAGER').length);
  protected readonly analysts = computed(() => this.users().filter((u) => u.role === 'ANALYST').length);
  protected readonly requesters = computed(() => this.users().filter((u) => u.role === 'REQUESTER').length);
  protected readonly subtitle = computed(
    () => `${this.users().length} usuarios registrados · ${this.analysts()} analistas · ${this.requesters()} solicitantes`,
  );

  /** Un solicitante cuenta los casos que pidió; el personal de la mesa, los que tiene asignados. */
  protected cases(u: UserListItem): number {
    return u.role === 'REQUESTER' ? u.requestedCases : u.assignedCases;
  }

  constructor() {
    inject(UsersService)
      .list()
      .subscribe({
        next: (users) => {
          this.users.set(users);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err, 'No se pudieron cargar los usuarios'));
          this.loading.set(false);
        },
      });
  }
}
