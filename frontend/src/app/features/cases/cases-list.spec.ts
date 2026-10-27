import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Case } from '../../core/models';
import { CasesList } from './cases-list';

function makeCase(over: Partial<Case>): Case {
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

const CASES = [
  makeCase({ id: '1', title: 'VPN caída', status: 'OPEN', priority: 'CRITICAL' }),
  makeCase({ id: '2', title: 'Impresora', status: 'CLOSED', priority: 'LOW' }),
  makeCase({ id: '3', title: 'Correo lento', status: 'OPEN', priority: 'HIGH' }),
];

async function setup(inputs: { status?: string; priority?: string } = {}) {
  localStorage.clear();
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
  });
  const fixture = TestBed.createComponent(CasesList);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  TestBed.inject(HttpTestingController).expectOne('/api/cases').flush(CASES);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

const rowTitles = (el: HTMLElement) =>
  Array.from(el.querySelectorAll('a.row .t')).map((p) => p.textContent?.trim());

describe('CasesList', () => {
  it('muestra todos los casos, los más críticos primero', async () => {
    const f = await setup();
    expect(rowTitles(f.nativeElement)).toEqual(['VPN caída', 'Correo lento', 'Impresora']);
  });

  it('filtra por estado desde la URL', async () => {
    const f = await setup({ status: 'OPEN' });
    expect(rowTitles(f.nativeElement)).toEqual(['VPN caída', 'Correo lento']);
  });

  it('combina estado y prioridad', async () => {
    const f = await setup({ status: 'OPEN', priority: 'HIGH' });
    expect(rowTitles(f.nativeElement)).toEqual(['Correo lento']);
  });

  it('los conteos por estado ignoran los demás filtros', async () => {
    const f = await setup({ priority: 'LOW' });
    const counts = Array.from(f.nativeElement.querySelectorAll('.tab .count')).map((c) => (c as HTMLElement).textContent);
    // Todos, Abiertos, En gestión, Proveedor, Resueltos, Cerrados
    expect(counts).toEqual(['3', '2', '0', '0', '0', '1']);
  });

  it('muestra el estado vacío cuando ningún caso coincide', async () => {
    const f = await setup({ status: 'RESOLVED' });
    expect(rowTitles(f.nativeElement)).toEqual([]);
    expect(f.nativeElement.textContent).toContain('Sin tickets');
  });
});
