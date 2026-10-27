import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  LucideArrowRight,
  LucideBuilding,
  LucideCalendarDays,
  LucideClock,
  LucideFileText,
  LucideLink2,
  LucideMessageSquare,
  LucidePhone,
  LucideRefreshCw,
  LucideZap,
} from '@lucide/angular';
import { catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/auth.service';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import {
  CATEGORY_LABEL,
  CaseDetail,
  ESCALATION_STATUS_LABEL,
  ROLE_LABEL,
  Role,
} from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { PriorityBadge, StatusBadge } from '../../shared/badges';
import { initials } from '../../shared/initials';
import { CaseActions } from './case-actions';

const ROLE_TONE: Record<Role, { bg: string; color: string }> = {
  REQUESTER: { bg: 'var(--sky-dim)', color: 'var(--sky)' },
  ANALYST: { bg: 'var(--green-dim)', color: 'var(--green)' },
  MANAGER: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
};

@Component({
  selector: 'app-case-detail',
  imports: [
    DatePipe,
    RouterLink,
    PageHeader,
    StatusBadge,
    PriorityBadge,
    CaseActions,
    LucideZap,
    LucideFileText,
    LucideRefreshCw,
    LucideCalendarDays,
    LucideClock,
    LucideBuilding,
    LucidePhone,
    LucideLink2,
    LucideArrowRight,
    LucideMessageSquare,
  ],
  templateUrl: './case-detail.html',
})
export class CaseDetailPage {
  private readonly casesApi = inject(CasesService);

  /** Id de la ruta `/cases/:id` (component input binding). */
  readonly id = input.required<string>();

  protected readonly isStaff = inject(AuthService).isStaff;
  protected readonly detail = signal<CaseDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly categoryLabel = computed(() => {
    const category = this.detail()?.category;
    return category ? CATEGORY_LABEL[category] : '';
  });
  protected readonly elapsedHours = computed(() => {
    const created = this.detail()?.createdAt;
    return created ? (Date.now() - new Date(created).getTime()) / 36e5 : 0;
  });

  private readonly refresh = signal(0);

  protected readonly initials = initials;
  protected readonly escalationLabel = ESCALATION_STATUS_LABEL;

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

  protected tone(role: Role | null | undefined) {
    return (role && ROLE_TONE[role]) || { bg: 'var(--surface-2)', color: 'var(--text-2)' };
  }

  protected roleLabel(role: Role | null | undefined): string {
    return role ? ROLE_LABEL[role] : '';
  }
}
