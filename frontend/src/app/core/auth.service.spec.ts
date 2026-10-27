import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginResponse } from './models';

const USER = {
  id: 'u1',
  name: 'Laura Moreno',
  email: 'laura@test.com',
  role: 'ANALYST' as const,
  department: null,
  phone: null,
  createdAt: '2026-01-01T00:00:00Z',
};

function loginResponse(expiresInMs = 60_000): LoginResponse {
  return { token: 'tok', expiresAt: new Date(Date.now() + expiresInMs).toISOString(), user: USER };
}

function setup() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
  const router = TestBed.inject(Router);
  vi.spyOn(router, 'navigate').mockResolvedValue(true);
  return {
    auth: TestBed.inject(AuthService),
    http: TestBed.inject(HttpTestingController),
    router,
  };
}

describe('AuthService', () => {
  beforeEach(() => localStorage.clear());

  it('arranca sin sesión', () => {
    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('login guarda la sesión y marca al analista como personal de la mesa', () => {
    const { auth, http } = setup();
    auth.login('laura@test.com', 'x').subscribe();
    http.expectOne('/api/auth/login').flush(loginResponse());

    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.token()).toBe('tok');
    expect(auth.isStaff()).toBe(true);
    expect(JSON.parse(localStorage.getItem('mesa.session')!).token).toBe('tok');
  });

  it('restaura una sesión vigente guardada', () => {
    localStorage.setItem('mesa.session', JSON.stringify(loginResponse()));
    const { auth } = setup();
    expect(auth.user()?.name).toBe('Laura Moreno');
  });

  it('descarta una sesión vencida', () => {
    localStorage.setItem('mesa.session', JSON.stringify(loginResponse(-1000)));
    const { auth } = setup();
    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('mesa.session')).toBeNull();
  });

  it('logout limpia la sesión y va al login aunque el servidor falle', () => {
    localStorage.setItem('mesa.session', JSON.stringify(loginResponse()));
    const { auth, http, router } = setup();

    auth.logout();
    http.expectOne('/api/auth/logout').flush('boom', { status: 500, statusText: 'Error' });

    expect(auth.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('mesa.session')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('un solicitante no es personal de la mesa', () => {
    const { auth, http } = setup();
    auth.login('a@b.com', 'x').subscribe();
    http.expectOne('/api/auth/login').flush({ ...loginResponse(), user: { ...USER, role: 'REQUESTER' } });
    expect(auth.isStaff()).toBe(false);
  });
});
