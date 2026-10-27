export type Role = 'REQUESTER' | 'ANALYST' | 'MANAGER';
export type CaseStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_USER'
  | 'WAITING_PROVIDER'
  | 'RESOLVED'
  | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type CaseCategory = 'INCIDENT' | 'REQUEST' | 'CHANGE';
export type EscalationStatus = 'PENDING' | 'RESOLVED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string | null;
  phone: string | null;
  createdAt: string;
}

/** Datos mínimos de un usuario embebido en otro recurso. */
export interface UserBrief {
  id: string;
  name: string;
  email?: string | null;
  role?: Role | null;
  department?: string | null;
  phone?: string | null;
}

export interface Provider {
  id: string;
  name: string;
  type: string;
  email: string;
  phone: string | null;
}

export interface Escalation {
  id: string;
  caseId: string;
  providerId: string;
  status: EscalationStatus;
  notes: string | null;
  sentAt: string;
  resolvedAt: string | null;
  provider: Provider | null;
}

export interface CaseUpdate {
  id: string;
  caseId: string;
  authorId: string;
  message: string;
  oldStatus: CaseStatus | null;
  newStatus: CaseStatus | null;
  createdAt: string;
  author: UserBrief | null;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  category: CaseCategory;
  priority: Priority;
  status: CaseStatus;
  estimatedTime: number | null;
  requesterId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  requester: UserBrief | null;
  assignedTo: UserBrief | null;
  escalation: Escalation | null;
  updatesCount: number;
}

export interface CaseDetail extends Case {
  updates: CaseUpdate[];
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: User;
}

export interface CreateCaseRequest {
  title: string;
  description: string;
  category: CaseCategory;
  priority: Priority;
}

export interface UpdateCaseRequest {
  status?: CaseStatus;
  assignedToId?: string | null;
  message?: string;
}

export interface EscalateRequest {
  providerId: string;
  notes?: string;
}

// ── Etiquetas y presentación ──

export const ROLE_LABEL: Record<Role, string> = {
  REQUESTER: 'Usuario',
  ANALYST: 'Analista',
  MANAGER: 'Responsable',
};

export const CATEGORY_LABEL: Record<CaseCategory, string> = {
  INCIDENT: 'Incidente',
  REQUEST: 'Solicitud',
  CHANGE: 'Cambio',
};

export const CATEGORY_ICON: Record<CaseCategory, string> = {
  INCIDENT: 'pi-bolt',
  REQUEST: 'pi-file',
  CHANGE: 'pi-sync',
};

export const STATUS_STYLE: Record<CaseStatus, { label: string; color: string; bg: string }> = {
  OPEN: { label: 'Abierto', color: '#2563EB', bg: 'rgba(59,130,246,.10)' },
  IN_PROGRESS: { label: 'En gestión', color: '#D97706', bg: 'rgba(245,158,11,.10)' },
  WAITING_PROVIDER: { label: 'Con proveedor', color: '#7C3AED', bg: 'rgba(139,92,246,.10)' },
  WAITING_USER: { label: 'Esp. usuario', color: '#D97706', bg: 'rgba(245,158,11,.10)' },
  RESOLVED: { label: 'Resuelto', color: '#059669', bg: 'rgba(16,185,129,.10)' },
  CLOSED: { label: 'Cerrado', color: '#6B7280', bg: 'rgba(107,114,128,.10)' },
};

export const PRIORITY_STYLE: Record<Priority, { label: string; color: string; bg: string; rank: number }> = {
  LOW: { label: 'Baja', color: '#6B7280', bg: 'rgba(107,114,128,.08)', rank: 1 },
  MEDIUM: { label: 'Media', color: '#2563EB', bg: 'rgba(59,130,246,.10)', rank: 2 },
  HIGH: { label: 'Alta', color: '#D97706', bg: 'rgba(245,158,11,.10)', rank: 3 },
  CRITICAL: { label: 'Crítica', color: '#DC2626', bg: 'rgba(239,68,68,.10)', rank: 4 },
};
