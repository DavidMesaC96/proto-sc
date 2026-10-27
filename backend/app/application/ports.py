"""Puertos de servicios externos y unidad de trabajo."""

from abc import ABC, abstractmethod

from app.domain.repositories import (
    CaseRepository,
    EscalationRepository,
    ProviderRepository,
    SessionRepository,
    UserRepository,
)


class PasswordHasher(ABC):
    @abstractmethod
    def hash(self, password: str) -> str: ...

    @abstractmethod
    def verify(self, password: str, password_hash: str) -> bool: ...


class TokenGenerator(ABC):
    @abstractmethod
    def generate(self) -> str: ...


class UnitOfWork(ABC):
    users: UserRepository
    sessions: SessionRepository
    providers: ProviderRepository
    cases: CaseRepository
    escalations: EscalationRepository

    @abstractmethod
    def commit(self) -> None: ...

    @abstractmethod
    def rollback(self) -> None: ...
