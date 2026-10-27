import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideExternalLink, LucideFunnel } from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { Case, PRIORITY_STYLE } from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { PriorityBadge, StatusBadge } from '../../shared/badges';

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'OPEN', label: 'Abiertos' },
  { value: 'IN_PROGRESS', label: 'En gestión' },
  { value: 'WAITING_PROVIDER', label: 'Proveedor' },
  { value: 'RESOLVED', label: 'Resueltos' },
  { value: 'CLOSED', label: 'Cerrados' },
] as const;

const PRIORITY_FILTERS = [
  { value: '', label: 'Todas', color: '' },
  { value: 'CRITICAL', label: 'Crítica', color: 'var(--red)' },
  { value: 'HIGH', label: 'Alta', color: 'var(--amber)' },
  { value: 'MEDIUM', label: 'Media', color: 'var(--sky)' },
  { value: 'LOW', label: 'Baja', color: 'var(--text-3)' },
] as const;

@Component({
  selector: 'app-cases-list',
  imports: [DatePipe, RouterLink, PageHeader, StatusBadge, PriorityBadge, LucideExternalLink, LucideFunnel],
  templateUrl: './cases-list.html',
  styleUrl: './cases-list.css',
})
export class CasesList {
  private readonly casesApi = inject(CasesService);
  private readonly router = inject(Router);

  protected readonly isStaff = inject(AuthService).isStaff;

  // Filtros en la URL (?status=OPEN&priority=HIGH) para poder compartir o recargar la vista.
  readonly status = input<string>();
  readonly priority = input<string>();

  protected readonly statusTabs = STATUS_TABS;
  protected readonly priorityFilters = PRIORITY_FILTERS;

  protected readonly cases = signal<Case[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly statusFilter = computed(() => this.status() ?? '');
  protected readonly priorityFilter = computed(() => this.priority() ?? '');

  /** Conteo por estado sobre todos los casos, sin importar el filtro de prioridad. */
  protected readonly counts = computed(() => {
    const counts: Record<string, number> = { '': this.cases().length };
    for (const c of this.cases()) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  });

  /** Más críticos primero y, a igual prioridad, los actualizados más recientemente. */
  protected readonly filtered = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    return this.cases()
      .filter((c) => (!status || c.status === status) && (!priority || c.priority === priority))
      .sort(
        (a, b) =>
          PRIORITY_STYLE[b.priority].rank - PRIORITY_STYLE[a.priority].rank ||
          b.updatedAt.localeCompare(a.updatedAt),
      );
  });

  protected readonly subtitle = computed(() => {
    const n = this.filtered().length;
    const tab = STATUS_TABS.find((t) => t.value === this.statusFilter());
    return `${n} resultado${n === 1 ? '' : 's'}${this.statusFilter() && tab ? ` · ${tab.label}` : ''}`;
  });

  constructor() {
    this.casesApi.list().subscribe({
      next: (cases) => {
        this.cases.set(cases);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(errorMessage(err, 'No se pudieron cargar los tickets'));
        this.loading.set(false);
      },
    });
  }

  protected setFilter(key: 'status' | 'priority', value: string): void {
    void this.router.navigate([], {
      queryParams: { [key]: value || null },
      queryParamsHandling: 'merge',
    });
  }
}
