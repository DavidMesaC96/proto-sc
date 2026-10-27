import { TestBed } from '@angular/core/testing';
import { configureHttpTesting, signIn } from '../../../testing/fixtures';
import { NewCase } from './new-case';

async function setup(inputs: Record<string, string>) {
  signIn();
  configureHttpTesting();
  const fixture = TestBed.createComponent(NewCase);
  for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture;
}

describe('NewCase', () => {
  it('se precarga con los datos que manda el catálogo', async () => {
    const el = (await setup({ title: 'Acceso VPN', category: 'REQUEST', priority: 'HIGH' })).nativeElement as HTMLElement;
    expect((el.querySelector('#title') as HTMLInputElement).value).toBe('Acceso VPN');
    expect(el.querySelector('.cat.on strong')?.textContent).toBe('Solicitud');
    expect(el.querySelector('.prio.on strong')?.textContent).toBe('Alta');
  });

  it('ignora categorías o prioridades inválidas', async () => {
    const el = (await setup({ category: 'NADA', priority: 'NADA' })).nativeElement as HTMLElement;
    expect(el.querySelector('.cat.on strong')?.textContent).toBe('Incidente');
    expect(el.querySelector('.prio.on strong')?.textContent).toBe('Media');
  });

  it('no deja registrar con título o descripción vacíos', async () => {
    const fixture = await setup({});
    const el = fixture.nativeElement as HTMLElement;
    (el.querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    expect(el.textContent).toContain('Requerido');
  });
});
