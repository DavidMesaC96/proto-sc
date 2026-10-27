import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideChevronDown,
  LucideLogOut,
  LucidePlus,
  LucideSearch,
  LucideSettings,
} from '@lucide/angular';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL } from '../core/models';
import { initials } from '../shared/initials';

/** Encabezado de cada pantalla: título, búsqueda, notificaciones, menú de usuario y "Nuevo ticket". */
@Component({
  selector: 'app-page-header',
  imports: [RouterLink, LucideSearch, LucideBell, LucideChevronDown, LucideSettings, LucideLogOut, LucidePlus],
  templateUrl: './page-header.html',
  styleUrl: './page-header.css',
})
export class PageHeader {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly showNewTicket = input(true);

  protected readonly user = this.auth.user;
  protected readonly menuOpen = signal(false);
  protected readonly initials = computed(() => initials(this.user()?.name));
  protected readonly firstName = computed(() => this.user()?.name.split(' ')[0] ?? '');
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABEL[role] : '';
  });

  protected goToCases(): void {
    void this.router.navigate(['/cases']);
  }

  protected logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }
}
