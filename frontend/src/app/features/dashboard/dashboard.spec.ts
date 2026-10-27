import { TestBed } from '@angular/core/testing';
import { configureHttpTesting, http, makeCase, signIn } from '../../../testing/fixtures';
import { Dashboard } from './dashboard';

const CASES = [
  makeCase({ id: '1', title: 'VPN caída', status: 'IN_PROGRESS', priority: 'CRITICAL' }),
  makeCase({ id: '2', title: 'Impresora', status: 'CLOSED', priority: 'LOW' }),
  makeCase({ id: '3', title: 'Correo lento', status: 'OPEN', priority: 'HIGH' }),
  makeCase({ id: '4', title: 'Con proveedor', status: 'WAITING_PROVIDER', priority: 'MEDIUM' }),
];

async function setup(role: 'ANALYST' | 'REQUESTER' = 'ANALYST') {
  signIn(role);
  configureHttpTesting();
  const fixture = TestBed.createComponent(Dashboard);
  http().expectOne('/api/cases').flush(CASES);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement as HTMLElement;
}

const values = (el: HTMLElement) => Array.from(el.querySelectorAll('.mw-value')).map((v) => v.textContent?.trim());

describe('Dashboard', () => {
  it('calcula los cuatro indicadores a partir de los casos', async () => {
    const el = await setup();
    // activos (abiertos + en gestión), SLA (resueltos/total), con proveedor, críticos abiertos
    expect(values(el)).toEqual(['2', '25%', '1', '1']);
  });

  it('muestra la alerta de críticos con el título del caso', async () => {
    const el = await setup();
    expect(el.querySelector('.alert-crit')?.textContent).toContain('1 crítico');
    expect(el.querySelector('.alert-crit')?.textContent).toContain('VPN caída');
  });

  it('ordena la cola por urgencia: el crítico primero', async () => {
    const el = await setup();
    const titles = Array.from(el.querySelectorAll('.ticket-row .t')).map((t) => t.textContent?.trim());
    expect(titles[0]).toBe('VPN caída');
    expect(titles).toHaveLength(4);
  });

  it('un solicitante ve "Mis solicitudes" y no la columna de solicitante', async () => {
    const el = await setup('REQUESTER');
    expect(el.querySelector('h1')?.textContent).toContain('Mis solicitudes');
    expect(el.querySelector('.ticket-row .req')).toBeNull();
  });
});
