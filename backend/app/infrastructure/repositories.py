"""Implementaciones SQLAlchemy de los puertos del dominio."""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.application.ports import UnitOfWork
from app.domain.entities import (
    AuthSession,
    Case,
    CaseUpdate,
    Escalation,
    Provider,
    User,
    UserWithCounts,
)
from app.domain.enums import (
    CaseCategory,
    CaseStatus,
    EscalationStatus,
    Priority,
    Role,
)
from app.domain.repositories import (
    CaseRepository,
    EscalationRepository,
    ProviderRepository,
    SessionRepository,
    UserRepository,
)
from app.infrastructure.models import (
    CaseModel,
    CaseUpdateModel,
    EscalationModel,
    ProviderModel,
    SessionModel,
    UserModel,
)


def _aware(value: datetime | None) -> datetime | None:
    """SQLite devuelve fechas sin zona horaria; todas se guardan en UTC."""
    if value is not None and value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


# ---- mapeo modelo ORM -> entidad de dominio ----

def to_user(m: UserModel) -> User:
    return User(
        id=m.id,
        name=m.name,
        email=m.email,
        password_hash=m.password_hash,
        role=Role(m.role),
        department=m.department,
        phone=m.phone,
        created_at=_aware(m.created_at),
    )


def to_provider(m: ProviderModel) -> Provider:
    return Provider(
        id=m.id,
        name=m.name,
        type=m.type,
        email=m.email,
        phone=m.phone,
        created_at=_aware(m.created_at),
    )


def to_escalation(m: EscalationModel) -> Escalation:
    return Escalation(
        id=m.id,
        case_id=m.case_id,
        provider_id=m.provider_id,
        status=EscalationStatus(m.status),
        notes=m.notes,
        sent_at=_aware(m.sent_at),
        resolved_at=_aware(m.resolved_at),
        provider=to_provider(m.provider),
    )


def to_update(m: CaseUpdateModel) -> CaseUpdate:
    return CaseUpdate(
        id=m.id,
        case_id=m.case_id,
        author_id=m.author_id,
        message=m.message,
        old_status=CaseStatus(m.old_status) if m.old_status else None,
        new_status=CaseStatus(m.new_status) if m.new_status else None,
        created_at=_aware(m.created_at),
        author=to_user(m.author),
    )


def to_case(m: CaseModel, *, with_updates: bool, updates_count: int | None = None) -> Case:
    updates = [to_update(u) for u in m.updates] if with_updates else []
    return Case(
        id=m.id,
        title=m.title,
        description=m.description,
        category=CaseCategory(m.category),
        priority=Priority(m.priority),
        status=CaseStatus(m.status),
        estimated_time=m.estimated_time,
        requester_id=m.requester_id,
        assigned_to_id=m.assigned_to_id,
        created_at=_aware(m.created_at),
        updated_at=_aware(m.updated_at),
        closed_at=_aware(m.closed_at),
        requester=to_user(m.requester),
        assigned_to=to_user(m.assigned_to) if m.assigned_to else None,
        escalation=to_escalation(m.escalation) if m.escalation else None,
        updates=updates,
        updates_count=updates_count if updates_count is not None else len(updates),
    )


# ---- repositorios ----

class SqlUserRepository(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: str) -> User | None:
        m = self.db.get(UserModel, user_id)
        return to_user(m) if m else None

    def get_by_email(self, email: str) -> User | None:
        m = self.db.scalar(select(UserModel).where(UserModel.email == email.strip().lower()))
        return to_user(m) if m else None

    def list_with_counts(self) -> list[UserWithCounts]:
        requested = dict(
            self.db.execute(
                select(CaseModel.requester_id, func.count()).group_by(CaseModel.requester_id)
            ).all()
        )
        assigned = dict(
            self.db.execute(
                select(CaseModel.assigned_to_id, func.count())
                .where(CaseModel.assigned_to_id.is_not(None))
                .group_by(CaseModel.assigned_to_id)
            ).all()
        )
        rows = self.db.scalars(select(UserModel).order_by(UserModel.role, UserModel.name))
        return [
            UserWithCounts(
                user=to_user(m),
                requested_cases=requested.get(m.id, 0),
                assigned_cases=assigned.get(m.id, 0),
            )
            for m in rows
        ]


class SqlSessionRepository(SessionRepository):
    def __init__(self, db: Session):
        self.db = db

    def add(self, session: AuthSession) -> None:
        self.db.add(
            SessionModel(
                id=session.id,
                user_id=session.user_id,
                token=session.token,
                expires_at=session.expires_at,
            )
        )

    def get_by_token(self, token: str) -> AuthSession | None:
        m = self.db.scalar(select(SessionModel).where(SessionModel.token == token))
        if m is None:
            return None
        return AuthSession(
            id=m.id,
            user_id=m.user_id,
            token=m.token,
            expires_at=_aware(m.expires_at),
            user=to_user(m.user),
        )

    def delete_by_token(self, token: str) -> None:
        m = self.db.scalar(select(SessionModel).where(SessionModel.token == token))
        if m is not None:
            self.db.delete(m)


class SqlProviderRepository(ProviderRepository):
    def __init__(self, db: Session):
        self.db = db

    def list_all(self) -> list[Provider]:
        rows = self.db.scalars(select(ProviderModel).order_by(ProviderModel.name))
        return [to_provider(m) for m in rows]

    def get_by_id(self, provider_id: str) -> Provider | None:
        m = self.db.get(ProviderModel, provider_id)
        return to_provider(m) if m else None


class SqlCaseRepository(CaseRepository):
    def __init__(self, db: Session):
        self.db = db

    def list_for(self, user: User) -> list[Case]:
        stmt = (
            select(CaseModel, func.count(CaseUpdateModel.id))
            .outerjoin(CaseUpdateModel, CaseUpdateModel.case_id == CaseModel.id)
            .options(
                selectinload(CaseModel.requester),
                selectinload(CaseModel.assigned_to),
                selectinload(CaseModel.escalation).selectinload(EscalationModel.provider),
            )
            .group_by(CaseModel.id)
            .order_by(CaseModel.created_at.desc())
        )
        if not user.is_staff:
            stmt = stmt.where(CaseModel.requester_id == user.id)
        return [
            to_case(m, with_updates=False, updates_count=count)
            for m, count in self.db.execute(stmt).all()
        ]

    def get(self, case_id: str) -> Case | None:
        stmt = (
            select(CaseModel)
            .where(CaseModel.id == case_id)
            .options(
                selectinload(CaseModel.requester),
                selectinload(CaseModel.assigned_to),
                selectinload(CaseModel.escalation).selectinload(EscalationModel.provider),
                selectinload(CaseModel.updates).selectinload(CaseUpdateModel.author),
            )
        )
        m = self.db.scalar(stmt)
        return to_case(m, with_updates=True) if m else None

    def add(self, case: Case) -> None:
        self.db.add(
            CaseModel(
                id=case.id,
                title=case.title,
                description=case.description,
                category=case.category.value,
                priority=case.priority.value,
                status=case.status.value,
                estimated_time=case.estimated_time,
                requester_id=case.requester_id,
                assigned_to_id=case.assigned_to_id,
                created_at=case.created_at,
                updated_at=case.updated_at,
                closed_at=case.closed_at,
            )
        )
        self.db.flush()

    def save(self, case: Case) -> None:
        m = self.db.get(CaseModel, case.id)
        m.status = case.status.value
        m.assigned_to_id = case.assigned_to_id
        m.updated_at = case.updated_at
        m.closed_at = case.closed_at

    def add_update(self, update: CaseUpdate) -> None:
        self.db.add(
            CaseUpdateModel(
                id=update.id,
                case_id=update.case_id,
                author_id=update.author_id,
                message=update.message,
                old_status=update.old_status.value if update.old_status else None,
                new_status=update.new_status.value if update.new_status else None,
                created_at=update.created_at,
            )
        )
        self.db.flush()

    def get_update(self, update_id: str) -> CaseUpdate | None:
        m = self.db.get(CaseUpdateModel, update_id)
        return to_update(m) if m else None


class SqlEscalationRepository(EscalationRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_by_case(self, case_id: str) -> Escalation | None:
        m = self.db.scalar(select(EscalationModel).where(EscalationModel.case_id == case_id))
        return to_escalation(m) if m else None

    def add(self, escalation: Escalation) -> None:
        self.db.add(
            EscalationModel(
                id=escalation.id,
                case_id=escalation.case_id,
                provider_id=escalation.provider_id,
                status=escalation.status.value,
                notes=escalation.notes,
                sent_at=escalation.sent_at,
            )
        )
        self.db.flush()


class SqlAlchemyUnitOfWork(UnitOfWork):
    def __init__(self, db: Session):
        self.db = db
        self.users = SqlUserRepository(db)
        self.sessions = SqlSessionRepository(db)
        self.providers = SqlProviderRepository(db)
        self.cases = SqlCaseRepository(db)
        self.escalations = SqlEscalationRepository(db)

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()
