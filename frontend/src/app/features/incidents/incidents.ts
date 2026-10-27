import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideExternalLink, LucideTriangleAlert } from '@lucide/angular';
import { byUrgency, isFinished } from '../../core/case-order';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { Case } from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { PriorityBadge, StatusBadge } from '../../shared/badges';

@Component({
  selector: 'app-incidents',
  imports: [RouterLink, PageHeader, StatusBadge, PriorityBadge, LucideTriangleAlert, LucideExternalLink],
  templateUrl: './incidents.html',
  styleUrl: './incidents.css',
})
export class Incidents {
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  private readonly incidents = signal<Case[]>([]);

  protected readonly total = computed(() => this.incidents().length);
  protected readonly critical = computed(() => this.incidents().filter((c) => c.priority === 'CRITICAL' && !isFinished(c)));
  protected readonly active = computed(() => this.incidents().filter((c) => !isFinished(c) && c.priority !== 'CRITICAL'));
  protected readonly resolved = computed(() => this.incidents().filter(isFinished));
  protected readonly subtitle = computed(() => `${this.total()} total · ${this.critical().length} críticos activos`);

  constructor() {
    inject(CasesService)
      .list()
      .subscribe({
        next: (cases) => {
          this.incidents.set(cases.filter((c) => c.category === 'INCIDENT').sort(byUrgency));
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(errorMessage(err, 'No se pudieron cargar los incidentes'));
          this.loading.set(false);
        },
      });
  }
}
