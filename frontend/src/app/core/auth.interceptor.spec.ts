import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authInterceptor } from './auth.interceptor';

function setup(withSession: boolean) {
  localStorage.clear();
  if (withSession) {
    localStorage.setItem(
      'mesa.session',
      JSON.stringify({
        token: 'tok',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        user: { id: 'u', name: 'U', email: 'u@t.com', role: 'ANALYST' },
      }),
    );
  }
  TestBed.configureTestingModule({
    providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
  });
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  return {
    http: TestBed.inject(HttpClient),
    ctrl: TestBed.inject(HttpTestingController),
    auth: TestBed.inject(AuthService),
  };
}

describe('authInterceptor', () => {
  it('agrega el token Bearer a las llamadas a la API', () => {
    const { http, ctrl } = setup(true);
    http.get('/api/cases').subscribe();
    expect(ctrl.expectOne('/api/cases').request.headers.get('Authorization')).toBe('Bearer tok');
  });

  it('no envía el token a otros dominios', () => {
    const { http, ctrl } = setup(true);
    http.get('https://otro.com/x').subscribe();
    expect(ctrl.expectOne('https://otro.com/x').request.headers.has('Authorization')).toBe(false);
  });

  it('cierra la sesión cuando la API responde 401', () => {
    const { http, ctrl, auth } = setup(true);
    http.get('/api/cases').subscribe({ error: () => undefined });
    ctrl.expectOne('/api/cases').flush({ error: 'No autenticado' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
  });

  it('un 401 en el login (credenciales malas) no toca la sesión ni redirige', () => {
    const { http, ctrl, auth } = setup(false);
    const router = TestBed.inject(Router);
    http.post('/api/auth/login', {}).subscribe({ error: () => undefined });
    ctrl.expectOne('/api/auth/login').flush({ error: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });
    expect(auth.isAuthenticated()).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
