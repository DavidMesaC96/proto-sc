import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { API_URL } from './api';
import {
  Case,
  CaseDetail,
  CaseUpdate,
  CreateCaseRequest,
  EscalateRequest,
  Escalation,
  UpdateCaseRequest,
} from './models';

@Injectable({ providedIn: 'root' })
export class CasesService {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_URL}/cases`;

  list() {
    return this.http.get<Case[]>(this.url);
  }

  get(id: string) {
    return this.http.get<CaseDetail>(`${this.url}/${id}`);
  }

  create(body: CreateCaseRequest) {
    return this.http.post<CaseDetail>(this.url, body);
  }

  update(id: string, body: UpdateCaseRequest) {
    return this.http.patch<CaseDetail>(`${this.url}/${id}`, body);
  }

  addNote(id: string, message: string) {
    return this.http.post<CaseUpdate>(`${this.url}/${id}/updates`, { message });
  }

  escalate(id: string, body: EscalateRequest) {
    return this.http.post<Escalation>(`${this.url}/${id}/escalate`, body);
  }
}
