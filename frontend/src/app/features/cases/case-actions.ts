import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  LucideCircleCheckBig,
  LucideLink2,
  LucideLock,
  LucideMessageSquare,
  LucideSearch,
  LucideSend,
  LucideSparkles,
  LucideTimer,
  LucideTriangleAlert,
  LucideUserCog,
} from '@lucide/angular';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CaseStatus, Priority, Provider } from '../../core/models';
import { ProvidersService } from '../../core/providers.service';
import { initials } from '../../shared/initials';

type TabId = 'update' | 'assign' | 'escalate' | 'close';

interface Feedback {
  ok: boolean;
  msg: string;
}

const MAX_COMMENT = 500;

const STATUSES: { value: CaseStatus; label: string; long: string; color: string }[] = [
  { value: 'OPEN', label: 'Abierto', long: 'Abierto', color: '#6B7280' },
  { value: 'IN_PROGRESS', label: 'Gestión', long: 'En gestión', color: '#3B82F6' },
  { value: 'WAITING_USER', label: 'Espera', long: 'Esp. usuario', color: '#F59E0B' },
  { value: 'RESOLVED', label: 'Resuelto', long: 'Resuelto', color: '#10B981' },
  { value: 'CLOSED', label: 'Cerrado', long: 'Cerrado', color: '#64748B' },
];

const STATUS_BY_VALUE: Record<string, { long: string; color: string }> = {
  ...Object.fromEntries(STATUSES.map((s) => [s.value, s])),
  WAITING_PROVIDER: { long: 'Con proveedor', color: '#8B5CF6' },
};

const PRIORITY: Record<Priority, { label: string; color: string }> = {
  LOW: { label: 'Baja', color: '#9CA3AF' },
  MEDIUM: { label: 'Media', color: '#60A5FA' },
  HIGH: { label: 'Alta', color: '#FBBF24' },
  CRITICAL: { label: 'Crítica', color: '#F87171' },
};

const TABS: { id: TabId; label: string }[] = [
  { id: 'update', label: 'Gestión' },
  { id: 'assign', label: 'Asignar' },
  { id: 'escalate', label: 'Escalar' },
  { id: 'close', label: 'Cerrar' },
];

const QUICK_NOTES = [
  'Contacté al usuario',
  'Revisando logs',
  'Se requiere más información',
  'Solución aplicada',
];

function formatHours(h: number): string {
  const a = Math.abs(h);
  if (a < 1) return `${Math.max(1, Math.round(a * 60))} min`;
  if (a < 48) return `${Math.round(a)} h`;
  return `${Math.round(a / 24)} d`;
}

/** Panel de gestión del ticket para analistas y responsables. */
@Component({
  selector: 'app-case-actions',
  imports: [
    FormsModule,
    LucideMessageSquare,
    LucideUserCog,
    LucideLink2,
    LucideLock,
    LucideTimer,
    LucideCircleCheckBig,
    LucideSparkles,
    LucideSend,
    LucideSearch,
    LucideTriangleAlert,
  ],
  templateUrl: './case-actions.html',
})
export class CaseActions {
  private readonly casesApi = inject(CasesService);

  readonly caseId = input.required<string>();
  readonly currentStatus = input.required<CaseStatus>();
  readonly priority = input.required<Priority>();
  readonly estimatedHours = input.required<number | null>();
  readonly elapsedHours = input.required<number>();
  readonly assignedToName = input.required<string | null>();
  readonly hasEscalation = input.required<boolean>();
  readonly changed = output<void>();

  protected readonly tabs = TABS;
  protected readonly statuses = STATUSES;
  protected readonly quickNotes = QUICK_NOTES;
  protected readonly maxComment = MAX_COMMENT;
  protected readonly initials = initials;
  protected readonly formatHours = formatHours;

  protected readonly tab = signal<TabId>('update');
  // Vuelve al estado real del caso cada vez que éste cambia tras guardar.
  protected readonly status = linkedSignal<CaseStatus>(() => this.currentStatus());
  protected readonly message = signal('');
  protected readonly notes = signal('');
  protected readonly providerQuery = signal('');
  protected readonly providerId = signal('');
  protected readonly providers = signal<Provider[]>([]);
  protected readonly loading = signal(false);
  protected readonly feedback = signal<Feedback | null>(null);

  // ── Cabecera ──
  protected readonly st = computed(
    () => STATUS_BY_VALUE[this.currentStatus()] ?? { long: this.currentStatus(), color: '#9CA3AF' },
  );
  protected readonly pr = computed(() => PRIORITY[this.priority()] ?? { label: this.priority(), color: '#9CA3AF' });
  protected readonly isOpen = computed(
    () => this.currentStatus() !== 'RESOLVED' && this.currentStatus() !== 'CLOSED',
  );

  // Barra de tiempo de atención
  protected readonly ratio = computed(() => {
    const est = this.estimatedHours();
    return est ? this.elapsedHours() / est : 0;
  });
  protected readonly slaColor = computed(() =>
    this.ratio() >= 1 ? '#F87171' : this.ratio() >= 0.6 ? '#FBBF24' : '#34D399',
  );
  protected readonly slaText = computed(() => {
    const est = this.estimatedHours();
    if (!est) return null;
    return this.ratio() >= 1
      ? `Vencido hace ${formatHours(this.elapsedHours() - est)}`
      : `Quedan ${formatHours(est - this.elapsedHours())}`;
  });

  // ── Selector segmentado y línea de estados ──
  protected readonly tabIndex = computed(() => TABS.findIndex((t) => t.id === this.tab()));
  protected readonly statusIdx = computed(() => STATUSES.findIndex((s) => s.value === this.status()));
  protected readonly stepsFill = computed(
    () => (Math.max(this.statusIdx(), 0) / (STATUSES.length - 1)) * 100,
  );

  // ── Nota y proveedores ──
  protected readonly pct = computed(() => Math.min(this.message().length / MAX_COMMENT, 1));
  protected readonly filteredProviders = computed(() => {
    const q = this.providerQuery().trim().toLowerCase();
    return this.providers().filter((p) => `${p.name} ${p.type}`.toLowerCase().includes(q));
  });

  constructor() {
    inject(ProvidersService)
      .list()
      .subscribe({
        next: (providers) => this.providers.set(providers),
        error: (err) => this.flash(false, errorMessage(err, 'No se cargaron los proveedores')),
      });
  }

  protected selectTab(tab: TabId): void {
    this.tab.set(tab);
    this.feedback.set(null);
  }

  protected addQuickNote(text: string): void {
    const current = this.message().trim();
    this.message.set((current ? `${current} ${text}.` : `${text}.`).slice(0, MAX_COMMENT));
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
