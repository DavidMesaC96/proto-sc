import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export type MetricColor = 'cyan' | 'green' | 'amber' | 'red' | 'purple';

const ICON_STYLE: Record<MetricColor, { bg: string; border: string; symbol: string }> = {
  cyan: { bg: 'rgba(0,200,83,.10)', border: 'rgba(0,200,83,.20)', symbol: '#00C853' },
  green: { bg: 'rgba(16,185,129,.10)', border: 'rgba(16,185,129,.20)', symbol: '#10B981' },
  amber: { bg: 'rgba(245,158,11,.10)', border: 'rgba(245,158,11,.20)', symbol: '#F59E0B' },
  red: { bg: 'rgba(239,68,68,.10)', border: 'rgba(239,68,68,.20)', symbol: '#EF4444' },
  purple: { bg: 'rgba(139,92,246,.10)', border: 'rgba(139,92,246,.20)', symbol: '#8B5CF6' },
};

/** Tarjeta de indicador: ícono, valor grande, etiqueta y barra de progreso. Es un enlace. */
@Component({
  selector: 'app-metric-widget',
  imports: [RouterLink],
  template: `
    <a
      class="mw glass-card-hover"
      [routerLink]="href()"
      [queryParams]="queryParams()"
    >
      <div class="mw-icon" [style.background]="tone().bg" [style.border-color]="tone().border" [style.color]="tone().symbol">
        <ng-content />
      </div>
      <p class="mw-value" [class.red]="color() === 'red'">{{ value() }}</p>
      <p class="mw-label">{{ label() }}</p>
      <p class="mw-sub">{{ sub() }}</p>
      <div class="mw-track"><div class="mw-bar" [style.width.%]="pct()" [style.background]="tone().symbol"></div></div>
    </a>
  `,
  styles: `
    :host { display: block; }
    .mw { display: flex; flex-direction: column; align-items: center; height: 100%; padding: 32px 24px 24px; border: 1px solid rgba(0, 43, 122, 0.08); border-radius: 16px; background: #fff; box-shadow: 0 2px 8px rgba(0, 43, 122, 0.06); text-align: center; text-decoration: none; cursor: pointer; }
    .mw-icon { display: flex; align-items: center; justify-content: center; width: 64px; height: 64px; margin-bottom: 18px; border: 1px solid; border-radius: 18px; }
    .mw-value { margin-bottom: 10px; font-size: 3rem; font-weight: 900; line-height: 1; letter-spacing: -0.04em; color: #002b7a; }
    .mw-value.red { color: #ef4444; }
    .mw-label { margin-bottom: 4px; font-size: 0.85rem; font-weight: 700; color: #0d1b3e; }
    .mw-sub { flex: 1; margin-bottom: 20px; font-size: 0.75rem; color: #6b7280; }
    .mw-track { width: 100%; height: 5px; overflow: hidden; border-radius: 999px; background: rgba(0, 43, 122, 0.07); }
    .mw-bar { height: 100%; border-radius: 999px; transition: width 0.7s cubic-bezier(0.22, 1, 0.36, 1); }
  `,
})
export class MetricWidget {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly sub = input.required<string>();
  readonly color = input.required<MetricColor>();
  readonly href = input.required<string>();
  readonly queryParams = input<Record<string, string>>();
  /** Fracción 0–1 que llena la barra. */
  readonly raw = input(0);

  protected readonly tone = computed(() => ICON_STYLE[this.color()]);
  protected readonly pct = computed(() => Math.min(this.raw() * 100, 100));
}
