class DomainError(Exception):
    """Base de los errores de negocio; la capa de presentación los traduce a HTTP."""

    def __init__(self, message: str):
        super().__init__(message)
        self.message = message


class InvalidCredentials(DomainError):
    pass


class NotAuthenticated(DomainError):
    pass


class PermissionDenied(DomainError):
    pass


class NotFound(DomainError):
    pass


class Conflict(DomainError):
    pass


class ValidationFailed(DomainError):
    pass
