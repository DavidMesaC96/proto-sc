import { Component, computed, inject, signal } from '@angular/core';
import { LucideBuilding, LucideChartColumn, LucideCircleCheckBig, LucideTrendingUp } from '@lucide/angular';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { Case, CaseCategory } from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { MetricWidget } from '../../shared/metric-widget';

const PRIORITY_BARS = [
  { key: 'CRITICAL', label: 'Crítica', color: 'var(--red)' },
  { key: 'HIGH', label: 'Alta', color: 'var(--amber)' },
  { key: 'MEDIUM', label: 'Media', color: 'var(--sky)' },
  { key: 'LOW', label: 'Baja', color: 'var(--text-3)' },
] as const;

const CATEGORY_PLURAL: Record<CaseCategory, string> = {
  INCIDENT: 'Incidentes',
  REQUEST: 'Solicitudes',
  CHANGE: 'Cambios',
};

const STATUS_BARS = [
  { key: 'OPEN', label: 'Abierto', color: 'var(--sky)' },
  { key: 'IN_PROGRESS', label: 'En gestión', color: 'var(--amber)' },
  { key: 'WAITING_PROVIDER', label: 'Proveedor', color: '#A78BFA' },
  { key: 'RESOLVED', label: 'Resuelto', color: 'var(--green)' },
  { key: 'CLOSED', label: 'Cerrado', color: 'var(--text-3)' },
] as const;

@Component({
  selector: 'app-reports',
  imports: [PageHeader, MetricWidget, LucideChartColumn, LucideTrendingUp, LucideCircleCheckBig, LucideBuilding],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class Reports {
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  private readonly cases = signal<Case[]>([]);

  private readonly countBy = (pick: (c: Case) => string) =>
    computed(() => {
      const counts: Record<string, number> = {};
      for (const c of this.cases()) counts[pick(c)] = (counts[pick(c)] ?? 0) + 1;
      return counts;
    });

  protected readonly total = computed(() => this.cases().length);
  private readonly byStatus = this.countBy((c) => c.status);
  private readonly byPriority = this.countBy((c) => c.priority);
  private readonly byCategory = this.countBy((c) => c.category);

  protected readonly withProvider = computed(() => this.byStatus()['WAITING_PROVIDER'] ?? 0);
  protected readonly finished = computed(() => (this.byStatus()['RESOLVED'] ?? 0) + (this.byStatus()['CLOSED'] ?? 0));
  protected readonly sla = computed(() => (this.total() ? Math.round((this.finished() / this.total()) * 100) : 0));

  protected readonly statusBars = computed(() => STATUS_BARS.map((s) => ({ ...s, count: this.byStatus()[s.key] ?? 0 })));
  protected readonly priorityBars = computed(() => PRIORITY_BARS.map((p) => ({ ...p, count: this.byPriority()[p.key] ?? 0 })));
  protected readonly categoryBars = computed(() =>
    (Object.keys(CATEGORY_PLURAL) as CaseCategory[])
      .map((key) => ({ label: CATEGORY_PLURAL[key], count: this.byCategory()[key] ?? 0 }))
      .filter((c) => c.count > 0),
  );
  protected readonly providers = computed(() => {
    const counts: Record<string, number> = {};
    for (const c of this.cases()) {
      const name = c.escalation?.provider?.name;
      if (name) counts[name] = (counts[name] ?? 0) + 1;
    }
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  });

  /** Porcentaje de ancho de una barra respecto al total de casos. */
  protected readonly pct = (n: number) => (this.total() ? (n / this.total()) * 100 : 0);
  protected readonly ratio = (n: number) => (this.total() ? n / this.total() : 0);

  constructor() {
    inject(CasesService)
      .list()
      .subscribe({
        next: (cases) => {
          this.cases.set(cases);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err, 'No se pudieron cargar los reportes'));
          this.loading.set(false);
        },
      });
  }
}
