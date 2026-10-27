import { TestBed } from '@angular/core/testing';
import { UserListItem } from '../../core/models';
import { configureHttpTesting, http, signIn } from '../../../testing/fixtures';
import { Users } from './users';

function user(over: Partial<UserListItem>): UserListItem {
  return {
    id: 'u',
    name: 'Nombre Apellido',
    email: 'n@t.com',
    role: 'REQUESTER',
    department: null,
    phone: null,
    createdAt: '2026-01-01T00:00:00Z',
    requestedCases: 0,
    assignedCases: 0,
    ...over,
  };
}

const USERS = [
  user({ id: '1', name: 'Ana Solicitante', role: 'REQUESTER', requestedCases: 5, assignedCases: 0, department: 'Finanzas' }),
  user({ id: '2', name: 'Laura Analista', role: 'ANALYST', requestedCases: 0, assignedCases: 7 }),
  user({ id: '3', name: 'Carlos Jefe', role: 'MANAGER' }),
];

async function setup() {
  signIn('MANAGER');
  configureHttpTesting();
  const fixture = TestBed.createComponent(Users);
  http().expectOne('/api/users').flush(USERS);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Users', () => {
  it('cuenta usuarios por rol', async () => {
    const el = await setup();
    const kpis = Array.from(el.querySelectorAll('.k-n')).map((k) => k.textContent?.trim());
    expect(kpis).toEqual(['1', '1', '1']);
  });

  it('un solicitante muestra los casos que pidió y un analista los que tiene asignados', async () => {
    const el = await setup();
    const rows = Array.from(el.querySelectorAll('.row')).map((r) => ({
      name: r.querySelector('.name')?.textContent?.trim(),
      n: r.querySelector('.n')?.textContent?.trim(),
    }));
    expect(rows).toEqual([
      { name: 'Ana Solicitante', n: '5' },
      { name: 'Laura Analista', n: '7' },
      { name: 'Carlos Jefe', n: '0' },
    ]);
  });

  it('muestra un guion si no hay departamento', async () => {
    const el = await setup();
    const deps = Array.from(el.querySelectorAll('.dep')).map((d) => d.textContent?.trim());
    expect(deps).toEqual(['Finanzas', '—', '—']);
  });
});
