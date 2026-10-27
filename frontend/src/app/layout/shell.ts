import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../core/auth.service';
import { ROLE_LABEL } from '../core/models';
import { initials } from '../shared/initials';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class Shell {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly collapsed = signal(false);
  protected readonly roleLabel = computed(() => {
    const role = this.user()?.role;
    return role ? ROLE_LABEL[role] : '';
  });
  protected readonly initials = computed(() => initials(this.user()?.name));

  protected toggle(): void {
    this.collapsed.update((v) => !v);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
