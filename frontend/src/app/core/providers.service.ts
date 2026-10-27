import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './api';
import { Provider } from './models';

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<Provider[]>(`${API_URL}/providers`);
  }
}
