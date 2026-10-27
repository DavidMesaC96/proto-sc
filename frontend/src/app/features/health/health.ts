import { Component } from '@angular/core';
import { LucideHardHat } from '@lucide/angular';

const STACK = [
  { name: 'Grafana', color: '#F46800' },
  { name: 'Prometheus', color: '#E6522C' },
  { name: 'Loki', color: '#002B7A' },
  { name: 'Tempo', color: '#7B3FD4' },
  { name: 'Alertmanager', color: '#EF4444' },
  { name: 'Datadog', color: '#632CA6' },
  { name: 'Sauron', color: '#00C853' },
];

/** Pantalla "en construcción" del monitoreo (Grafana, Loki, Prometheus, Datadog, Sauron). */
@Component({
  selector: 'app-health',
  imports: [LucideHardHat],
  templateUrl: './health.html',
  styleUrl: './health.css',
})
export class Health {
  protected readonly stack = STACK;
}
