import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';

function run(guard: typeof authGuard, url = '/cases/abc') {
  return TestBed.runInInjectionContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );
}

function withSession(active: boolean) {
  localStorage.clear();
  if (active) {
    localStorage.setItem(
      'mesa.session',
      JSON.stringify({
        token: 't',
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
        user: { id: 'u', name: 'U', email: 'u@t.com', role: 'ANALYST' },
      }),
    );
  }
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
}

describe('guards', () => {
  it('authGuard deja pasar con sesión', () => {
    withSession(true);
    expect(run(authGuard)).toBe(true);
  });

  it('authGuard redirige al login recordando la ruta pedida', () => {
    withSession(false);
    const result = run(authGuard) as UrlTree;
    expect(result.toString()).toBe('/login?returnUrl=%2Fcases%2Fabc');
  });

  it('guestGuard manda a /cases si ya hay sesión', () => {
    withSession(true);
    expect((run(guestGuard) as UrlTree).toString()).toBe('/cases');
  });

  it('guestGuard deja ver el login sin sesión', () => {
    withSession(false);
    expect(run(guestGuard)).toBe(true);
  });
});
