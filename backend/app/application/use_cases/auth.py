from dataclasses import dataclass
from datetime import datetime, timedelta

from app.application.ports import PasswordHasher, TokenGenerator, UnitOfWork
from app.domain.entities import AuthSession, User, new_id, utcnow
from app.domain.exceptions import InvalidCredentials, NotAuthenticated, ValidationFailed


@dataclass
class LoginResult:
    token: str
    expires_at: datetime
    user: User


class Login:
    def __init__(
        self,
        uow: UnitOfWork,
        hasher: PasswordHasher,
        tokens: TokenGenerator,
        session_ttl_hours: int,
    ):
        self.uow = uow
        self.hasher = hasher
        self.tokens = tokens
        self.session_ttl_hours = session_ttl_hours

    def execute(self, email: str, password: str) -> LoginResult:
        if not email or not password:
            raise ValidationFailed("Email y contraseña requeridos")

        user = self.uow.users.get_by_email(email)
        if user is None or not self.hasher.verify(password, user.password_hash):
            raise InvalidCredentials("Credenciales inválidas")

        session = AuthSession(
            id=new_id(),
            user_id=user.id,
            token=self.tokens.generate(),
            expires_at=utcnow() + timedelta(hours=self.session_ttl_hours),
        )
        self.uow.sessions.add(session)
        self.uow.commit()
        return LoginResult(token=session.token, expires_at=session.expires_at, user=user)


class Logout:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, token: str) -> None:
        self.uow.sessions.delete_by_token(token)
        self.uow.commit()


class GetCurrentUser:
    """Resuelve el usuario dueño de un token de sesión vigente."""

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self, token: str | None) -> User:
        if not token:
            raise NotAuthenticated("No autenticado")
        session = self.uow.sessions.get_by_token(token)
        if session is None or session.user is None or session.is_expired(utcnow()):
            raise NotAuthenticated("No autenticado")
        return session.user
