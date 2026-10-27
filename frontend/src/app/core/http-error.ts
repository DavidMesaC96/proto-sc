import { HttpErrorResponse } from '@angular/common/http';

/**
 * Extrae un mensaje legible de un error de la API.
 * La API responde `{ error: string }` para errores de negocio y
 * `{ detail: [...] }` (FastAPI) para errores de validación.
 */
export function errorMessage(err: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (!(err instanceof HttpErrorResponse)) return fallback;
  if (err.status === 0) return 'No se pudo conectar con el servidor';
  if (typeof err.error?.error === 'string') return err.error.error;
  if (err.status === 422) return 'Revisa los datos ingresados';
  return fallback;
}
