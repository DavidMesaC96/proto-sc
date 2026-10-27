import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  LucideChartColumn,
  LucideEye,
  LucideEyeOff,
  LucideLandmark,
  LucideLink2,
  LucideLogIn,
  LucideShieldCheck,
  LucideZap,
} from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    LucideEye,
    LucideEyeOff,
    LucideLogIn,
    LucideZap,
    LucideLink2,
    LucideChartColumn,
    LucideShieldCheck,
    LucideLandmark,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly year = new Date().getFullYear();
  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected submit(): void {
    if (this.form.invalid) {
      this.error.set('Ingresa tu correo y contraseña');
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

  protected clearError(): void {
    this.error.set('');
  }
}
