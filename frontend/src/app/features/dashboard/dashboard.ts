import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  LucideBuilding,
  LucideCircleAlert,
  LucideCircleCheckBig,
  LucideExternalLink,
  LucideTicket,
  LucideTriangleAlert,
} from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { byUrgency, isFinished } from '../../core/case-order';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CATEGORY_LABEL, Case } from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { StatusBadge } from '../../shared/badges';
import { initials } from '../../shared/initials';
import { MetricWidget } from '../../shared/metric-widget';

/** Máximo de filas de la cola en el dashboard (la lista completa está en Tickets). */
const QUEUE_SIZE = 50;

@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe,
    RouterLink,
    PageHeader,
    StatusBadge,
    MetricWidget,
    LucideTicket,
    LucideCircleCheckBig,
    LucideBuilding,
    LucideTriangleAlert,
    LucideCircleAlert,
    LucideExternalLink,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly isStaff = this.auth.isStaff;
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  private readonly cases = signal<Case[]>([]);

  protected readonly initials = initials;
  protected readonly categoryLabel = CATEGORY_LABEL;

  protected readonly total = computed(() => this.cases().length);
  protected readonly open = computed(() => this.cases().filter((c) => c.status === 'OPEN').length);
  protected readonly inProgress = computed(() => this.cases().filter((c) => c.status === 'IN_PROGRESS').length);
  protected readonly withProvider = computed(() => this.cases().filter((c) => c.status === 'WAITING_PROVIDER').length);
  protected readonly resolved = computed(() => this.cases().filter(isFinished).length);
  protected readonly sla = computed(() => (this.total() ? Math.round((this.resolved() / this.total()) * 100) : 0));
  protected readonly critical = computed(() => this.cases().filter((c) => c.priority === 'CRITICAL' && !isFinished(c)));
  protected readonly queue = computed(() => [...this.cases()].sort(byUrgency).slice(0, QUEUE_SIZE));

  protected readonly ratio = (n: number) => (this.total() > 0 ? n / this.total() : 0);

  protected readonly title = computed(() => (this.user()?.role === 'REQUESTER' ? 'Mis solicitudes' : 'Casos en gestión'));
  protected readonly subtitle = computed(() => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';
    const active = this.open() + this.inProgress();
    const total = this.total();
    return `${greeting}, ${this.user()?.name.split(' ')[0] ?? ''} · ${total} caso${total !== 1 ? 's' : ''} · ${active} activo${active !== 1 ? 's' : ''}`;
  });

  constructor() {
    inject(CasesService)
      .list()
      .subscribe({
        next: (cases) => {
          this.cases.set(cases);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err, 'No se pudo cargar el dashboard'));
          this.loading.set(false);
        },
      });
  }
}
