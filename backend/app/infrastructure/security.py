import secrets

import bcrypt

from app.application.ports import PasswordHasher, TokenGenerator


class BcryptPasswordHasher(PasswordHasher):
    """Compatible con los hashes $2a/$2b generados por bcryptjs en el sistema anterior."""

    def hash(self, password: str) -> str:
        return bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=10)).decode()

    def verify(self, password: str, password_hash: str) -> bool:
        try:
            return bcrypt.checkpw(password.encode(), password_hash.encode())
        except ValueError:
            return False


class SecureTokenGenerator(TokenGenerator):
    def generate(self) -> str:
        return secrets.token_hex(32)
