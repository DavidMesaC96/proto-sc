import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { CasesService } from '../../core/cases.service';
import { errorMessage } from '../../core/http-error';
import { CATEGORY_ICON, CATEGORY_LABEL, CaseCategory, Priority } from '../../core/models';

const CATEGORY_HINT: Record<CaseCategory, string> = {
  INCIDENT: 'Algo dejó de funcionar',
  REQUEST: 'Necesito algo nuevo',
  CHANGE: 'Modificar un sistema',
};

const PRIORITIES: { value: Priority; label: string; hint: string; color: string }[] = [
  { value: 'LOW', label: 'Baja', hint: 'Puede esperar', color: '#6B7280' },
  { value: 'MEDIUM', label: 'Media', hint: 'Resolver en 24h', color: '#0EA5E9' },
  { value: 'HIGH', label: 'Alta', hint: 'Resolver en 8h', color: '#F59E0B' },
  { value: 'CRITICAL', label: 'Crítica', hint: 'Atención inmediata', color: '#EF4444' },
];

@Component({
  selector: 'app-new-case',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './new-case.html',
  styleUrl: './new-case.css',
})
export class NewCase {
  private readonly casesApi = inject(CasesService);
  private readonly router = inject(Router);

  protected readonly categories = (Object.keys(CATEGORY_LABEL) as CaseCategory[]).map((value) => ({
    value,
    label: CATEGORY_LABEL[value],
    hint: CATEGORY_HINT[value],
    icon: CATEGORY_ICON[value],
  }));
  protected readonly priorities = PRIORITIES;

  protected readonly form = inject(FormBuilder).nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.required],
    category: ['INCIDENT' as CaseCategory],
    priority: ['MEDIUM' as Priority],
  });

  protected readonly loading = signal(false);
  protected readonly error = signal('');

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
