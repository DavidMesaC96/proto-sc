import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideChevronRight,
  LucideCircleQuestionMark,
  LucideFileText,
  LucideRefreshCw,
  LucideZap,
} from '@lucide/angular';
import { CaseCategory, PRIORITY_STYLE, Priority } from '../../core/models';
import { PageHeader } from '../../layout/page-header';

interface ServiceItem {
  title: string;
  desc: string;
  sla: string;
  priority: Priority;
}

interface ServiceSection {
  category: string;
  /** Categoría del ticket que se crea desde esta sección. */
  caseCategory: CaseCategory;
  icon: 'zap' | 'file' | 'refresh' | 'help';
  color: string;
  bg: string;
  items: ServiceItem[];
}

const SERVICES: ServiceSection[] = [
  {
    category: 'Soporte técnico',
    caseCategory: 'INCIDENT',
    icon: 'zap',
    color: 'var(--cyan)',
    bg: 'var(--cyan-dim)',
    items: [
      { title: 'Falla de sistema', desc: 'El sistema no responde o tiene errores', sla: '4h', priority: 'HIGH' },
      { title: 'Acceso bloqueado', desc: 'No puedo ingresar a una aplicación o recurso', sla: '8h', priority: 'MEDIUM' },
      { title: 'Error en transacción', desc: 'Falla en un proceso o transacción financiera', sla: '2h', priority: 'CRITICAL' },
      { title: 'Impresora / periférico', desc: 'Dispositivo físico con falla o sin configurar', sla: '24h', priority: 'LOW' },
    ],
  },
  {
    category: 'Solicitudes',
    caseCategory: 'REQUEST',
    icon: 'file',
    color: '#A78BFA',
    bg: 'rgba(167,139,250,.12)',
    items: [
      { title: 'Nuevo usuario', desc: 'Crear cuenta y permisos para colaborador', sla: '24h', priority: 'MEDIUM' },
      { title: 'Instalación de software', desc: 'Instalar o actualizar una aplicación', sla: '24h', priority: 'MEDIUM' },
      { title: 'Acceso VPN', desc: 'Configurar acceso remoto seguro', sla: '8h', priority: 'MEDIUM' },
      { title: 'Equipo de cómputo', desc: 'Solicitar reemplazo o nuevo equipo', sla: '72h', priority: 'LOW' },
    ],
  },
  {
    category: 'Cambios',
    caseCategory: 'CHANGE',
    icon: 'refresh',
    color: 'var(--amber)',
    bg: 'var(--amber-dim)',
    items: [
      { title: 'Actualización de sistema', desc: 'Solicitar parche o versión nueva', sla: '48h', priority: 'MEDIUM' },
      { title: 'Cambio de configuración', desc: 'Modificar parámetros de un servicio', sla: '24h', priority: 'MEDIUM' },
      { title: 'Migración de datos', desc: 'Mover información entre sistemas', sla: '72h', priority: 'HIGH' },
    ],
  },
  {
    // Las consultas se registran como solicitudes: el original las mandaba a CHANGE por exclusión.
    category: 'Consultas',
    caseCategory: 'REQUEST',
    icon: 'help',
    color: 'var(--green)',
    bg: 'var(--green-dim)',
    items: [
      { title: 'Capacitación', desc: 'Solicitar entrenamiento en una herramienta', sla: '72h', priority: 'LOW' },
      { title: 'Documentación', desc: 'Pedir guía o manual de un proceso', sla: '48h', priority: 'LOW' },
      { title: 'Consulta general', desc: 'Preguntas sobre procesos o sistemas', sla: '24h', priority: 'LOW' },
    ],
  },
];

@Component({
  selector: 'app-catalog',
  imports: [RouterLink, PageHeader, LucideZap, LucideFileText, LucideRefreshCw, LucideCircleQuestionMark, LucideChevronRight],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog {
  protected readonly sections = SERVICES;
  protected readonly priorityStyle = PRIORITY_STYLE;
  protected readonly toneOf = (p: Priority) => PRIORITY_TONE[p];
}

const PRIORITY_TONE: Record<Priority, string> = {
  CRITICAL: 'var(--red)',
  HIGH: 'var(--amber)',
  MEDIUM: 'var(--sky)',
  LOW: 'var(--text-3)',
};
