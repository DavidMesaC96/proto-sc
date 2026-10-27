"""Composición de dependencias: aquí se conectan casos de uso e infraestructura."""

from collections.abc import Iterator
from typing import Annotated

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.application.ports import PasswordHasher, TokenGenerator, UnitOfWork
from app.application.use_cases.auth import GetCurrentUser
from app.config import Settings, get_settings
from app.domain.entities import User
from app.infrastructure.database import SessionLocal
from app.infrastructure.repositories import SqlAlchemyUnitOfWork
from app.infrastructure.security import BcryptPasswordHasher, SecureTokenGenerator

bearer = HTTPBearer(auto_error=False)


def get_uow() -> Iterator[UnitOfWork]:
    db = SessionLocal()
    try:
        yield SqlAlchemyUnitOfWork(db)
    finally:
        db.close()


def get_hasher() -> PasswordHasher:
    return BcryptPasswordHasher()


def get_token_generator() -> TokenGenerator:
    return SecureTokenGenerator()


Uow = Annotated[UnitOfWork, Depends(get_uow)]


def get_token(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
) -> str | None:
    return credentials.credentials if credentials else None


Token = Annotated[str | None, Depends(get_token)]


def get_current_user(uow: Uow, token: Token) -> User:
    return GetCurrentUser(uow).execute(token)


CurrentUser = Annotated[User, Depends(get_current_user)]
AppSettings = Annotated[Settings, Depends(get_settings)]
