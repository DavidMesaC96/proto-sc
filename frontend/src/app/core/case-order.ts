import { Case, PRIORITY_STYLE } from './models';

/** Orden de urgencia: más críticos primero y, a igual prioridad, los actualizados más recientemente. */
export function byUrgency(a: Case, b: Case): number {
  return (
    PRIORITY_STYLE[b.priority].rank - PRIORITY_STYLE[a.priority].rank ||
    b.updatedAt.localeCompare(a.updatedAt)
  );
}

export function isFinished(c: Case): boolean {
  return c.status === 'RESOLVED' || c.status === 'CLOSED';
}
