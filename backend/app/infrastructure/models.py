"""Modelos ORM (detalle de persistencia). El dominio no depende de ellos."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.entities import new_id, utcnow
from app.infrastructure.database import Base


def _pk() -> Mapped[str]:
    return mapped_column(String(32), primary_key=True, default=new_id)


class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = _pk()
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(20), default="REQUESTER")
    department: Mapped[str | None] = mapped_column(String(200))
    phone: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class SessionModel(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = _pk()
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    user: Mapped[UserModel] = relationship()


class ProviderModel(Base):
    __tablename__ = "providers"

    id: Mapped[str] = _pk()
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(100))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str | None] = mapped_column(String(50))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class CaseModel(Base):
    __tablename__ = "cases"

    id: Mapped[str] = _pk()
    title: Mapped[str] = mapped_column(String(300))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(20))
    priority: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30), default="OPEN", index=True)
    estimated_time: Mapped[int | None] = mapped_column(Integer)
    requester_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    assigned_to_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    requester: Mapped[UserModel] = relationship(foreign_keys=[requester_id])
    assigned_to: Mapped[UserModel | None] = relationship(foreign_keys=[assigned_to_id])
    updates: Mapped[list["CaseUpdateModel"]] = relationship(
        back_populates="case", order_by="CaseUpdateModel.created_at"
    )
    escalation: Mapped["EscalationModel | None"] = relationship(back_populates="case")


class CaseUpdateModel(Base):
    __tablename__ = "case_updates"

    id: Mapped[str] = _pk()
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), index=True)
    author_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    message: Mapped[str] = mapped_column(Text)
    old_status: Mapped[str | None] = mapped_column(String(30))
    new_status: Mapped[str | None] = mapped_column(String(30))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    case: Mapped[CaseModel] = relationship(back_populates="updates")
    author: Mapped[UserModel] = relationship()


class EscalationModel(Base):
    __tablename__ = "escalations"

    id: Mapped[str] = _pk()
    case_id: Mapped[str] = mapped_column(ForeignKey("cases.id"), unique=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id"))
    status: Mapped[str] = mapped_column(String(20), default="PENDING")
    notes: Mapped[str | None] = mapped_column(Text)
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    case: Mapped[CaseModel] = relationship(back_populates="escalation")
    provider: Mapped[ProviderModel] = relationship()
