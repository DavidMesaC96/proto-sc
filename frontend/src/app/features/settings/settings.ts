import { formatDate } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { LucideBell, LucideShield, LucideUser } from '@lucide/angular';
import { AuthService } from '../../core/auth.service';
import { Role } from '../../core/models';
import { PageHeader } from '../../layout/page-header';
import { initials } from '../../shared/initials';

const ROLE_LONG_LABEL: Record<Role, string> = {
  REQUESTER: 'Usuario final',
  ANALYST: 'Analista de soporte',
  MANAGER: 'Responsable / Gestor',
};

interface Section {
  icon: 'user' | 'bell' | 'shield';
  title: string;
  color: string;
  bg: string;
  fields: { label: string; value: string }[];
}

@Component({
  selector: 'app-settings',
  imports: [PageHeader, LucideUser, LucideBell, LucideShield],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  protected readonly user = inject(AuthService).user;
  protected readonly initials = computed(() => initials(this.user()?.name));
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LONG_LABEL[role] : '';
  });

  // Solo el perfil sale de datos reales; notificaciones y seguridad son de muestra, como en el original.
  protected readonly sections = computed<Section[]>(() => {
    const u = this.user();
    return [
      {
        icon: 'user',
        title: 'Perfil',
        color: 'var(--cyan)',
        bg: 'var(--cyan-dim)',
        fields: [
          { label: 'Nombre completo', value: u?.name ?? '—' },
          { label: 'Correo electrónico', value: u?.email ?? '—' },
          { label: 'Rol', value: this.roleLabel() },
          { label: 'Departamento', value: u?.department ?? '—' },
        ],
      },
      {
        icon: 'bell',
        title: 'Notificaciones',
        color: '#A78BFA',
        bg: 'rgba(167,139,250,.12)',
        fields: [
          { label: 'Alertas de ticket asignado', value: 'Activo' },
          { label: 'Cambios de estado', value: 'Activo' },
          { label: 'Escalamientos', value: 'Activo' },
          { label: 'Resumen semanal', value: 'Inactivo' },
        ],
      },
      {
        icon: 'shield',
        title: 'Seguridad',
        color: 'var(--amber)',
        bg: 'var(--amber-dim)',
        fields: [
          { label: 'Último acceso', value: formatDate(new Date(), "dd 'de' MMMM 'de' y", 'es-CO') },
          { label: 'Sesiones activas', value: '1' },
          { label: 'Autenticación de dos factores', value: 'No configurado' },
        ],
      },
    ];
  });
}
