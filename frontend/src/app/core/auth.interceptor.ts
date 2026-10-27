import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from './api';
import { AuthService } from './auth.service';

/** Agrega el token Bearer a las llamadas a la API y cierra la sesión si el servidor responde 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(API_URL)) return next(req);

  const auth = inject(AuthService);
  const token = auth.token();
  const authorized = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authorized).pipe(
    catchError((err: unknown) => {
      // Un 401 en el login significa credenciales inválidas, no sesión vencida.
      const isLogin = req.url === `${API_URL}/auth/login`;
      if (err instanceof HttpErrorResponse && err.status === 401 && !isLogin) {
        auth.endSession();
      }
      return throwError(() => err);
    }),
  );
};
