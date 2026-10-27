"""Puertos (interfaces) de persistencia. La infraestructura los implementa."""

from abc import ABC, abstractmethod

from app.domain.entities import (
    AuthSession,
    Case,
    CaseUpdate,
    Escalation,
    Provider,
    User,
)


class UserRepository(ABC):
    @abstractmethod
    def get_by_id(self, user_id: str) -> User | None: ...

    @abstractmethod
    def get_by_email(self, email: str) -> User | None: ...


class SessionRepository(ABC):
    @abstractmethod
    def add(self, session: AuthSession) -> None: ...

    @abstractmethod
    def get_by_token(self, token: str) -> AuthSession | None: ...

    @abstractmethod
    def delete_by_token(self, token: str) -> None: ...


class ProviderRepository(ABC):
    @abstractmethod
    def list_all(self) -> list[Provider]: ...

    @abstractmethod
    def get_by_id(self, provider_id: str) -> Provider | None: ...


class CaseRepository(ABC):
    @abstractmethod
    def list_for(self, user: User) -> list[Case]:
        """Casos visibles para el usuario (un solicitante solo ve los suyos)."""

    @abstractmethod
    def get(self, case_id: str) -> Case | None:
        """Caso con relaciones y actualizaciones cargadas."""

    @abstractmethod
    def add(self, case: Case) -> None: ...

    @abstractmethod
    def save(self, case: Case) -> None: ...

    @abstractmethod
    def add_update(self, update: CaseUpdate) -> None: ...

    @abstractmethod
    def get_update(self, update_id: str) -> CaseUpdate | None: ...


class EscalationRepository(ABC):
    @abstractmethod
    def get_by_case(self, case_id: str) -> Escalation | None: ...

    @abstractmethod
    def add(self, escalation: Escalation) -> None: ...
