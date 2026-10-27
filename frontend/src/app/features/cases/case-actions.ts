import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CaseStatus, Provider } from '../../core/models';
import { ProvidersService } from '../../core/providers.service';

interface Feedback {
  ok: boolean;
  msg: string;
}

const STATUSES: { value: CaseStatus; label: string; color: string }[] = [
  { value: 'OPEN', label: 'Abierto', color: '#6B7280' },
  { value: 'IN_PROGRESS', label: 'En gestión', color: '#3B82F6' },
  { value: 'WAITING_USER', label: 'Esp. usuario', color: '#F59E0B' },
  { value: 'RESOLVED', label: 'Resuelto', color: '#10B981' },
  { value: 'CLOSED', label: 'Cerrado', color: '#6B7280' },
];

/** Panel de acciones para analistas y responsables: actualizar estado y escalar a proveedor. */
@Component({
  selector: 'app-case-actions',
  imports: [FormsModule, ButtonModule, TextareaModule],
  templateUrl: './case-actions.html',
  styleUrl: './case-actions.css',
})
export class CaseActions {
  private readonly casesApi = inject(CasesService);

  readonly caseId = input.required<string>();
  readonly currentStatus = input.required<CaseStatus>();
  readonly hasEscalation = input.required<boolean>();
  readonly changed = output<void>();

  protected readonly statuses = STATUSES;
  protected readonly tab = signal<'update' | 'escalate'>('update');
  // Se reinicia al estado real del caso cada vez que éste cambia tras guardar.
  protected readonly status = linkedSignal<CaseStatus>(() => this.currentStatus());
  protected readonly message = signal('');
  protected readonly notes = signal('');
  protected readonly providerId = signal('');
  protected readonly providers = signal<Provider[]>([]);
  protected readonly loading = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  constructor() {
    inject(ProvidersService)
      .list()
      .subscribe({
        next: (providers) => this.providers.set(providers),
        error: (err) => this.feedback.set({ ok: false, msg: errorMessage(err, 'No se cargaron los proveedores') }),
      });
  }

  protected selectTab(tab: 'update' | 'escalate'): void {
    this.tab.set(tab);
    this.feedback.set(null);
  }

  protected saveUpdate(): void {
    if (!this.message().trim()) {
      this.flash(false, 'Escribe un comentario');
      return;
    }
    this.loading.set(true);
    this.casesApi.update(this.caseId(), { status: this.status(), message: this.message().trim() }).subscribe({
      next: () => {
        this.message.set('');
        this.done('Actualizado');
      },
      error: (err) => this.fail(err, 'Error al actualizar'),
    });
  }

  protected saveEscalation(): void {
    if (!this.providerId()) {
      this.flash(false, 'Selecciona un proveedor');
      return;
    }
    this.loading.set(true);
    this.casesApi
      .escalate(this.caseId(), { providerId: this.providerId(), notes: this.notes().trim() || undefined })
      .subscribe({
        next: () => this.done('Escalado correctamente'),
        error: (err) => this.fail(err, 'Error al escalar'),
      });
  }

  private done(msg: string): void {
    this.loading.set(false);
    this.flash(true, msg);
    this.changed.emit();
  }

  private fail(err: unknown, fallback: string): void {
    this.loading.set(false);
    this.flash(false, errorMessage(err, fallback));
  }

  private flash(ok: boolean, msg: string): void {
    this.feedback.set({ ok, msg });
    setTimeout(() => this.feedback.set(null), 2500);
  }
}
