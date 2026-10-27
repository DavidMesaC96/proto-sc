import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CATEGORY_ICON, CATEGORY_LABEL, CaseDetail, Role } from '../../core/models';
import { PriorityBadge, StatusBadge } from '../../shared/badges';
import { initials } from '../../shared/initials';
import { CaseActions } from './case-actions';

const ROLE_TONE: Record<Role, { bg: string; color: string }> = {
  REQUESTER: { bg: 'rgba(59,130,246,.10)', color: '#3B82F6' },
  ANALYST: { bg: 'rgba(16,185,129,.10)', color: '#10B981' },
  MANAGER: { bg: 'rgba(245,158,11,.10)', color: '#F59E0B' },
};

@Component({
  selector: 'app-case-detail',
  imports: [DatePipe, RouterLink, StatusBadge, PriorityBadge, CaseActions],
  templateUrl: './case-detail.html',
  styleUrl: './case-detail.css',
})
export class CaseDetailPage {
  private readonly casesApi = inject(CasesService);

  /** Id de la ruta `/cases/:id` (component input binding). */
  readonly id = input.required<string>();

  protected readonly isStaff = inject(AuthService).isStaff;
  protected readonly detail = signal<CaseDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly category = computed(() => {
    const category = this.detail()?.category;
    return category ? { label: CATEGORY_LABEL[category], icon: CATEGORY_ICON[category] } : null;
  });

  private readonly refresh = signal(0);

  constructor() {
    toObservable(computed(() => ({ id: this.id(), refresh: this.refresh() })))
      .pipe(
        tap(() => this.error.set('')),
        switchMap(({ id }) =>
          this.casesApi.get(id).pipe(
            catchError((err) => {
              this.error.set(errorMessage(err, 'No se pudo cargar el ticket'));
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((detail) => {
        this.detail.set(detail);
        this.loading.set(false);
      });
  }

  protected reload(): void {
    this.refresh.update((n) => n + 1);
  }

  protected initials = initials;

  protected tone(role: Role | null | undefined) {
    return (role && ROLE_TONE[role]) || { bg: 'var(--surface-2)', color: 'var(--text-2)' };
  }
}
