import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './api';
import { UserListItem } from './models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  list() {
    return this.http.get<UserListItem[]>(`${API_URL}/users`);
  }
}
