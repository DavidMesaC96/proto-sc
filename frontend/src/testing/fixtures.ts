import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Case, Role } from '../app/core/models';

export function makeCase(over: Partial<Case>): Case {
  return {
    id: 'x',
    title: 'Caso',
    description: 'd',
    category: 'INCIDENT',
    priority: 'MEDIUM',
    status: 'OPEN',
    estimatedTime: 24,
    requesterId: 'r',
    assignedToId: null,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-01T10:00:00Z',
    closedAt: null,
    requester: { id: 'r', name: 'María García', department: 'Finanzas' },
    assignedTo: null,
    escalation: null,
    updatesCount: 0,
    ...over,
  };
}

/** Guarda una sesión vigente en localStorage para los tests que dependen de AuthService. */
export function signIn(role: Role = 'ANALYST', name = 'Laura Moreno'): void {
  localStorage.clear();
  localStorage.setItem(
    'mesa.session',
    JSON.stringify({
      token: 'tok',
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: { id: 'u1', name, email: 'u@t.com', role, department: 'TI', phone: null, createdAt: '2026-01-01T00:00:00Z' },
    }),
  );
}

export function configureHttpTesting(): void {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
}

export function http(): HttpTestingController {
  return TestBed.inject(HttpTestingController);
}
