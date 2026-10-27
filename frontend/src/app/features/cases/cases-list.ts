import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { AuthService } from '../../core/auth.service';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { Case, PRIORITY_STYLE, Priority } from '../../core/models';
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
  { value: 'CRITICAL', label: 'Crítica', color: '#EF4444' },
  { value: 'HIGH', label: 'Alta', color: '#F59E0B' },
  { value: 'MEDIUM', label: 'Media', color: '#3B82F6' },
  { value: 'LOW', label: 'Baja', color: '#6B7280' },
] as const;

type CaseRow = Case & { priorityRank: number };

@Component({
  selector: 'app-cases-list',
  imports: [DatePipe, RouterLink, ButtonModule, InputTextModule, TableModule, StatusBadge, PriorityBadge],
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

  protected readonly cases = signal<CaseRow[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly search = signal('');

  protected readonly statusFilter = computed(() => this.status() ?? '');
  protected readonly priorityFilter = computed(() => this.priority() ?? '');

  /** Conteo por estado sobre todos los casos, sin importar los otros filtros. */
  protected readonly counts = computed(() => {
    const counts: Record<string, number> = { '': this.cases().length };
    for (const c of this.cases()) counts[c.status] = (counts[c.status] ?? 0) + 1;
    return counts;
  });

  protected readonly filtered = computed(() => {
    const status = this.statusFilter();
    const priority = this.priorityFilter();
    const term = this.search().trim().toLowerCase();
    return this.cases().filter(
      (c) =>
        (!status || c.status === status) &&
        (!priority || c.priority === priority) &&
        (!term ||
          c.title.toLowerCase().includes(term) ||
          (c.requester?.name ?? '').toLowerCase().includes(term)),
    );
  });

  constructor() {
    this.casesApi.list().subscribe({
      next: (cases) => {
        this.cases.set(
          cases.map((c) => ({ ...c, priorityRank: PRIORITY_STYLE[c.priority as Priority]?.rank ?? 0 })),
        );
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

  protected newCase(): void {
    void this.router.navigate(['/cases/new']);
  }

  protected open(c: Case): void {
    void this.router.navigate(['/cases', c.id]);
  }

  protected priorityColor(priority: string): string {
    return PRIORITY_FILTERS.find((p) => p.value === priority)?.color ?? '';
  }
}
