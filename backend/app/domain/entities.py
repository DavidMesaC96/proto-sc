from __future__ import annotations

import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone

from app.domain.enums import (
    CaseCategory,
    CaseStatus,
    EscalationStatus,
    Priority,
    Role,
)

# Horas estimadas de atención según prioridad.
ESTIMATED_HOURS: dict[Priority, int] = {
    Priority.LOW: 72,
    Priority.MEDIUM: 24,
    Priority.HIGH: 8,
    Priority.CRITICAL: 2,
}


def new_id() -> str:
    return uuid.uuid4().hex


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class User:
    id: str
    name: str
    email: str
    password_hash: str
    role: Role = Role.REQUESTER
    department: str | None = None
    phone: str | None = None
    created_at: datetime = field(default_factory=utcnow)

    @property
    def is_staff(self) -> bool:
        return self.role in (Role.ANALYST, Role.MANAGER)


@dataclass
class UserWithCounts:
    """Usuario con cuántos casos ha solicitado y cuántos tiene asignados."""

    user: User
    requested_cases: int = 0
    assigned_cases: int = 0


@dataclass
class AuthSession:
    id: str
    user_id: str
    token: str
    expires_at: datetime
    user: User | None = None

    def is_expired(self, now: datetime) -> bool:
        return self.expires_at <= now


@dataclass
class Provider:
    id: str
    name: str
    type: str
    email: str
    phone: str | None = None
    created_at: datetime = field(default_factory=utcnow)


@dataclass
class Escalation:
    id: str
    case_id: str
    provider_id: str
    status: EscalationStatus = EscalationStatus.PENDING
    notes: str | None = None
    sent_at: datetime = field(default_factory=utcnow)
    resolved_at: datetime | None = None
    provider: Provider | None = None


@dataclass
class CaseUpdate:
    id: str
    case_id: str
    author_id: str
    message: str
    old_status: CaseStatus | None = None
    new_status: CaseStatus | None = None
    created_at: datetime = field(default_factory=utcnow)
    author: User | None = None


@dataclass
class Case:
    id: str
    title: str
    description: str
    category: CaseCategory
    priority: Priority
    requester_id: str
    status: CaseStatus = CaseStatus.OPEN
    estimated_time: int | None = None
    assigned_to_id: str | None = None
    created_at: datetime = field(default_factory=utcnow)
    updated_at: datetime = field(default_factory=utcnow)
    closed_at: datetime | None = None

    # Relaciones cargadas por el repositorio (opcionales).
    requester: User | None = None
    assigned_to: User | None = None
    escalation: Escalation | None = None
    updates: list[CaseUpdate] = field(default_factory=list)
    updates_count: int = 0

    @classmethod
    def register(
        cls,
        *,
        title: str,
        description: str,
        category: CaseCategory,
        priority: Priority,
        requester_id: str,
    ) -> Case:
        return cls(
            id=new_id(),
            title=title,
            description=description,
            category=category,
            priority=priority,
            requester_id=requester_id,
            estimated_time=ESTIMATED_HOURS[priority],
        )

    def can_be_viewed_by(self, user: User) -> bool:
        return user.is_staff or self.requester_id == user.id

    def change_status(self, new_status: CaseStatus, now: datetime) -> CaseStatus:
        """Cambia el estado y devuelve el estado anterior."""
        old = self.status
        self.status = new_status
        self.updated_at = now
        if new_status == CaseStatus.CLOSED:
            self.closed_at = now
        return old

    def assign_to(self, user_id: str | None, now: datetime) -> None:
        self.assigned_to_id = user_id
        self.updated_at = now
