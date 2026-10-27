from app.application.ports import UnitOfWork
from app.domain.entities import User, UserWithCounts
from app.domain.exceptions import PermissionDenied


class ListUsers:
    """Directorio de usuarios; solo para personal de la mesa."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, user: User) -> list[UserWithCounts]:
        if not user.is_staff:
            raise PermissionDenied("Sin permisos")
        return self.uow.users.list_with_counts()
