import { Component, effect, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideChevronRight, LucideFileText, LucideRefreshCw, LucideZap } from '@lucide/angular';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CaseCategory, Priority } from '../../core/models';

const CATS: { value: CaseCategory; label: string; hint: string }[] = [
  { value: 'INCIDENT', label: 'Incidente', hint: 'Algo dejó de funcionar' },
  { value: 'REQUEST', label: 'Solicitud', hint: 'Necesito algo nuevo' },
  { value: 'CHANGE', label: 'Cambio', hint: 'Modificar un sistema' },
];

const PRIOS: { value: Priority; label: string; hint: string; color: string; dot: string }[] = [
  { value: 'LOW', label: 'Baja', hint: 'Puede esperar', color: 'var(--text-3)', dot: '#4E6078' },
  { value: 'MEDIUM', label: 'Media', hint: 'Resolver en 24h', color: 'var(--sky)', dot: '#0EA5E9' },
  { value: 'HIGH', label: 'Alta', hint: 'Resolver en 8h', color: 'var(--amber)', dot: '#F59E0B' },
  { value: 'CRITICAL', label: 'Crítica', hint: 'Atención inmediata', color: 'var(--red)', dot: '#EF4444' },
];

@Component({
  selector: 'app-new-case',
  imports: [ReactiveFormsModule, RouterLink, LucideChevronRight, LucideZap, LucideFileText, LucideRefreshCw],
  templateUrl: './new-case.html',
  styleUrl: './new-case.css',
})
export class NewCase {
  private readonly casesApi = inject(CasesService);
  private readonly router = inject(Router);

  // Datos que trae el catálogo de servicios: /cases/new?title=...&category=...&priority=...
  readonly title = input<string>();
  readonly category = input<string>();
  readonly priority = input<string>();

  protected readonly cats = CATS;
  protected readonly prios = PRIOS;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.required],
    category: ['INCIDENT' as CaseCategory],
    priority: ['MEDIUM' as Priority],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal('');

  constructor() {
    effect(() => {
      const title = this.title();
      const category = CATS.find((c) => c.value === this.category())?.value;
      const priority = PRIOS.find((p) => p.value === this.priority())?.value;
      this.form.patchValue({
        ...(title ? { title: title.slice(0, 120) } : {}),
        ...(category ? { category } : {}),
        ...(priority ? { priority } : {}),
      });
    });
  }

  protected invalid(name: 'title' | 'description'): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }

  protected submit(): void {
    const { title, description, category, priority } = this.form.getRawValue();
    // Un campo con solo espacios no cuenta como lleno.
    if (!title.trim()) this.form.controls.title.setErrors({ required: true });
    if (!description.trim()) this.form.controls.description.setErrors({ required: true });
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.loading.set(true);
    this.casesApi.create({ title: title.trim(), description: description.trim(), category, priority }).subscribe({
      next: (created) => void this.router.navigate(['/cases', created.id]),
      error: (err) => {
        this.loading.set(false);
        this.error.set(errorMessage(err));
      },
    });
  }
}
