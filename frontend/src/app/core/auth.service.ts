import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';
import { API_URL } from './api';
import { LoginResponse, User } from './models';

const STORAGE_KEY = 'mesa.session';

interface StoredSession {
  token: string;
  expiresAt: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<StoredSession | null>(this.restore());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly token = computed(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isStaff = computed(() => {
    const role = this.user()?.role;
    return role === 'ANALYST' || role === 'MANAGER';
  });

  login(email: string, password: string) {
    return this.http
      .post<LoginResponse>(`${API_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.start(res)));
  }

  /** Invalida el token en el servidor y cierra la sesión local aunque la llamada falle. */
  logout(): void {
    this.http
      .post(`${API_URL}/auth/logout`, null)
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.endSession()),
      )
      .subscribe();
  }

  /** Limpia la sesión local y lleva al login (también lo usa el interceptor ante un 401). */
  endSession(): void {
    this.session.set(null);
    this.write(null);
    void this.router.navigate(['/login']);
  }

  private start(res: LoginResponse): void {
    const session: StoredSession = { token: res.token, expiresAt: res.expiresAt, user: res.user };
    this.session.set(session);
    this.write(session);
  }

  private restore(): StoredSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw) as StoredSession;
      if (new Date(session.expiresAt).getTime() <= Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      return null;
    }
  }

  private write(session: StoredSession | null): void {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Almacenamiento no disponible (modo privado): la sesión vive solo en memoria.
    }
  }
}
