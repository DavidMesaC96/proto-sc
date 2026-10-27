import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly highlights = [
    { icon: 'pi-bolt', color: '#00C853', text: 'Resolución en tiempo real', sub: 'Tickets cerrados en horas, no en días' },
    { icon: 'pi-link', color: '#60A5FA', text: 'Escalamiento con contexto completo', sub: 'Proveedores reciben todo el historial' },
    { icon: 'pi-chart-bar', color: '#A78BFA', text: 'SLA y métricas siempre visibles', sub: 'Dashboards en tiempo real para managers' },
  ];

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.error.set('');
    this.loading.set(true);

    const { email, password } = this.form.getRawValue();
    this.auth.login(email.trim(), password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        // Solo se acepta una ruta interna para evitar redirecciones abiertas.
        const target = returnUrl?.startsWith('/') && !returnUrl.startsWith('//') ? returnUrl : '/cases';
        void this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(errorMessage(err, 'Credenciales inválidas'));
      },
    });
  }
}
