import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signIn } from '../../../testing/fixtures';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Catalog } from './catalog';

describe('Catalog', () => {
  async function setup() {
    signIn();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Catalog);
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra los 14 servicios en 4 secciones', async () => {
    const el = await setup();
    expect(el.querySelectorAll('section')).toHaveLength(4);
    expect(el.querySelectorAll('a.item')).toHaveLength(14);
  });

  it('cada servicio enlaza al nuevo ticket con título, categoría y prioridad', async () => {
    const el = await setup();
    const link = Array.from(el.querySelectorAll('a.item')).find((a) => a.textContent?.includes('Error en transacción')) as HTMLAnchorElement;
    const params = new URL(link.href, 'http://x').searchParams;
    expect(params.get('title')).toBe('Error en transacción');
    expect(params.get('category')).toBe('INCIDENT');
    expect(params.get('priority')).toBe('CRITICAL');
  });

  it('las consultas se registran como solicitudes', async () => {
    const el = await setup();
    const link = Array.from(el.querySelectorAll('a.item')).find((a) => a.textContent?.includes('Capacitación')) as HTMLAnchorElement;
    expect(new URL(link.href, 'http://x').searchParams.get('category')).toBe('REQUEST');
  });
});
