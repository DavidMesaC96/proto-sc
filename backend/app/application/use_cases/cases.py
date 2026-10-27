from app.application.ports import UnitOfWork
from app.domain.entities import (
    Case,
    CaseUpdate,
    Escalation,
    User,
    new_id,
    utcnow,
)
from app.domain.enums import CaseCategory, CaseStatus, Priority
from app.domain.exceptions import Conflict, NotFound, PermissionDenied, ValidationFailed

_UNSET = object()


def _require_staff(user: User) -> None:
    if not user.is_staff:
        raise PermissionDenied("Sin permisos")


def _load(uow: UnitOfWork, case_id: str) -> Case:
    case = uow.cases.get(case_id)
    if case is None:
        raise NotFound("Caso no encontrado")
    return case


class ListCases:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, user: User) -> list[Case]:
        return self.uow.cases.list_for(user)


class GetCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, user: User, case_id: str) -> Case:
        case = _load(self.uow, case_id)
        if not case.can_be_viewed_by(user):
            raise PermissionDenied("Acceso denegado")
        return case


class CreateCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(
        self,
        user: User,
        *,
        title: str,
        description: str,
        category: CaseCategory,
        priority: Priority,
    ) -> Case:
        if not title.strip() or not description.strip():
            raise ValidationFailed(
                "Todos los campos son obligatorios: título, descripción, categoría y prioridad"
            )

        case = Case.register(
            title=title.strip(),
            description=description.strip(),
            category=category,
            priority=priority,
            requester_id=user.id,
        )
        self.uow.cases.add(case)
        self.uow.cases.add_update(
            CaseUpdate(
                id=new_id(),
                case_id=case.id,
                author_id=user.id,
                message="Caso registrado en el sistema.",
                new_status=CaseStatus.OPEN,
            )
        )
        self.uow.commit()
        return _load(self.uow, case.id)


class UpdateCase:
    """Cambia estado y/o asignación de un caso (solo personal de la mesa)."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(
        self,
        user: User,
        case_id: str,
        *,
        status: CaseStatus | None = None,
        assigned_to_id: str | None | object = _UNSET,
        message: str | None = None,
    ) -> Case:
        _require_staff(user)
        case = _load(self.uow, case_id)
        now = utcnow()

        if assigned_to_id is not _UNSET:
            if assigned_to_id is not None:
                assignee = self.uow.users.get_by_id(assigned_to_id)  # type: ignore[arg-type]
                if assignee is None or not assignee.is_staff:
                    raise ValidationFailed("El responsable asignado no es válido")
            case.assign_to(assigned_to_id, now)  # type: ignore[arg-type]

        old_status = case.status
        if status is not None:
            old_status = case.change_status(status, now)

        self.uow.cases.save(case)

        if message or status is not None:
            self.uow.cases.add_update(
                CaseUpdate(
                    id=new_id(),
                    case_id=case.id,
                    author_id=user.id,
                    message=message or f"Estado actualizado a {status}",
                    old_status=old_status,
                    new_status=status or case.status,
                )
            )
        self.uow.commit()
        return _load(self.uow, case.id)


class AddCaseUpdate:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, user: User, case_id: str, message: str) -> CaseUpdate:
        if not message or not message.strip():
            raise ValidationFailed("El mensaje es requerido")

        case = _load(self.uow, case_id)
        if not case.can_be_viewed_by(user):
            raise PermissionDenied("Acceso denegado")

        update = CaseUpdate(
            id=new_id(), case_id=case.id, author_id=user.id, message=message.strip()
        )
        self.uow.cases.add_update(update)
        self.uow.commit()
        created = self.uow.cases.get_update(update.id)
        assert created is not None
        return created


class EscalateCase:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(
        self, user: User, case_id: str, provider_id: str, notes: str | None
    ) -> Escalation:
        _require_staff(user)
        if not provider_id:
            raise ValidationFailed("Proveedor requerido")

        case = _load(self.uow, case_id)
        provider = self.uow.providers.get_by_id(provider_id)
        if provider is None:
            raise NotFound("Proveedor no encontrado")
        if self.uow.escalations.get_by_case(case.id) is not None:
            raise Conflict("El caso ya fue escalado")

        escalation = Escalation(
            id=new_id(), case_id=case.id, provider_id=provider.id, notes=notes
        )
        self.uow.escalations.add(escalation)

        old_status = case.change_status(CaseStatus.WAITING_PROVIDER, utcnow())
        self.uow.cases.save(case)
        self.uow.cases.add_update(
            CaseUpdate(
                id=new_id(),
                case_id=case.id,
                author_id=user.id,
                message=f"Caso escalado al proveedor {provider.name}. {notes or ''}".strip(),
                old_status=old_status,
                new_status=CaseStatus.WAITING_PROVIDER,
            )
        )
        self.uow.commit()

        escalation.provider = provider
        return escalation
