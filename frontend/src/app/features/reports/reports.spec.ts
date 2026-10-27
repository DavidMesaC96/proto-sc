import { TestBed } from '@angular/core/testing';
import { configureHttpTesting, http, makeCase, signIn } from '../../../testing/fixtures';
import { Reports } from './reports';

const provider = { id: 'p', name: 'Telco', type: 'Red', email: 'a@b.c', phone: null };
const CASES = [
  makeCase({ id: '1', status: 'OPEN', priority: 'CRITICAL', category: 'INCIDENT' }),
  makeCase({ id: '2', status: 'RESOLVED', priority: 'LOW', category: 'REQUEST' }),
  makeCase({ id: '3', status: 'CLOSED', priority: 'LOW', category: 'REQUEST' }),
  makeCase({
    id: '4',
    status: 'WAITING_PROVIDER',
    priority: 'HIGH',
    category: 'CHANGE',
    escalation: { id: 'e', caseId: '4', providerId: 'p', status: 'PENDING', notes: null, sentAt: '2026-10-01T00:00:00Z', resolvedAt: null, provider },
  }),
];

async function setup() {
  signIn('MANAGER');
  configureHttpTesting();
  const fixture = TestBed.createComponent(Reports);
  http().expectOne('/api/cases').flush(CASES);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

describe('Reports', () => {
  it('los indicadores cuentan resueltos y cerrados como cumplidos', async () => {
    const el = await setup();
    const values = Array.from(el.querySelectorAll('.mw-value')).map((v) => v.textContent?.trim());
    // total, SLA, resueltos, en proveedor
    expect(values).toEqual(['4', '50%', '2', '1']);
  });

  it('agrupa por prioridad y por categoría', async () => {
    const el = await setup();
    const counts = Array.from(el.querySelectorAll('.b-count')).map((c) => c.textContent?.trim());
    // por estado (5): abierto, gestión, proveedor, resuelto, cerrado; por prioridad (4): crítica, alta, media, baja
    expect(counts).toEqual(['1', '0', '1', '1', '1', '1', '1', '0', '2']);
    const cats = Array.from(el.querySelectorAll('.cat-row')).map((r) => [
      r.querySelector('.b-label')?.textContent?.trim(),
      r.querySelector('.cat-n')?.textContent?.trim(),
    ]);
    expect(cats).toEqual([['Incidentes', '1'], ['Solicitudes', '2'], ['Cambios', '1']]);
  });

  it('lista los casos escalados por proveedor', async () => {
    const el = await setup();
    expect(el.querySelector('.prov')?.textContent).toContain('Telco');
  });
});
