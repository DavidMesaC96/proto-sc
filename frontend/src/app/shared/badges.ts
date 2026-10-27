import { Component, computed, input } from '@angular/core';
import { CaseStatus, PRIORITY_STYLE, Priority, STATUS_STYLE } from '../core/models';

const FALLBACK = { color: '#6B7280', bg: 'rgba(107,114,128,.10)', dot: '#9CA3AF' };

@Component({
  selector: 'app-status-badge',
  template: `<span class="pill" [style.color]="style().color" [style.background]="style().bg">
    <span class="p-dot pulse" [style.background]="style().dot"></span>{{ style().label }}
  </span>`,
})
export class StatusBadge {
  readonly status = input.required<CaseStatus>();
  protected readonly style = computed(
    () => STATUS_STYLE[this.status()] ?? { ...FALLBACK, label: this.status() },
  );
}

@Component({
  selector: 'app-priority-badge',
  template: `<span class="pill" [style.color]="style().color" [style.background]="style().bg">{{
    style().label
  }}</span>`,
})
export class PriorityBadge {
  readonly priority = input.required<Priority>();
  protected readonly style = computed(
    () => PRIORITY_STYLE[this.priority()] ?? { ...FALLBACK, label: this.priority() },
  );
}
