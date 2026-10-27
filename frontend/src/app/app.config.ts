import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsCo from '@angular/common/locales/es-CO';
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

registerLocaleData(localeEsCo);

/** Aura con el azul institucional como color primario. */
const BrandPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eaf0fa',
      100: '#c2d3ee',
      200: '#7fa0dc',
      300: '#4a78c6',
      400: '#003da3',
      500: '#002b7a',
      600: '#00246a',
      700: '#001f5c',
      800: '#00184a',
      900: '#001238',
      950: '#000c26',
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    providePrimeNG({ theme: { preset: BrandPreset, options: { darkModeSelector: false } } }),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ],
};
