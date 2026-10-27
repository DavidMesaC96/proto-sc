"""Contratos HTTP. Se serializan en camelCase para el frontend."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.domain.enums import (
    CaseCategory,
    CaseStatus,
    EscalationStatus,
    Priority,
    Role,
)


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True
    )


class UserBrief(CamelModel):
    id: str
    name: str
    email: str | None = None
    role: Role | None = None
    department: str | None = None
    phone: str | None = None


class UserOut(CamelModel):
    id: str
    name: str
    email: str
    role: Role
    department: str | None = None
    phone: str | None = None
    created_at: datetime


class ProviderOut(CamelModel):
    id: str
    name: str
    type: str
    email: str
    phone: str | None = None


class EscalationOut(CamelModel):
    id: str
    case_id: str
    provider_id: str
    status: EscalationStatus
    notes: str | None = None
    sent_at: datetime
    resolved_at: datetime | None = None
    provider: ProviderOut | None = None


class CaseUpdateOut(CamelModel):
    id: str
    case_id: str
    author_id: str
    message: str
    old_status: CaseStatus | None = None
    new_status: CaseStatus | None = None
    created_at: datetime
    author: UserBrief | None = None


class CaseOut(CamelModel):
    id: str
    title: str
    description: str
    category: CaseCategory
    priority: Priority
    status: CaseStatus
    estimated_time: int | None = None
    requester_id: str
    assigned_to_id: str | None = None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None = None
    requester: UserBrief | None = None
    assigned_to: UserBrief | None = None
    escalation: EscalationOut | None = None
    updates_count: int = 0


class CaseDetailOut(CaseOut):
    updates: list[CaseUpdateOut] = []


# ---- entradas ----

class LoginIn(CamelModel):
    email: str
    password: str


class LoginOut(CamelModel):
    token: str
    expires_at: datetime
    user: UserOut


class CaseCreateIn(CamelModel):
    title: str = Field(min_length=1, max_length=300)
    description: str = Field(min_length=1)
    category: CaseCategory
    priority: Priority


class CaseUpdateIn(CamelModel):
    status: CaseStatus | None = None
    assigned_to_id: str | None = None
    message: str | None = None


class CaseNoteIn(CamelModel):
    message: str


class EscalateIn(CamelModel):
    provider_id: str
    notes: str | None = None
