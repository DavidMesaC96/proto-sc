from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.domain import exceptions as exc

_STATUS_BY_ERROR: dict[type[exc.DomainError], int] = {
    exc.ValidationFailed: 400,
    exc.InvalidCredentials: 401,
    exc.NotAuthenticated: 401,
    exc.PermissionDenied: 403,
    exc.NotFound: 404,
    exc.Conflict: 409,
}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(exc.DomainError)
    async def handle_domain_error(_: Request, error: exc.DomainError) -> JSONResponse:
        status_code = _STATUS_BY_ERROR.get(type(error), 400)
        return JSONResponse(status_code=status_code, content={"error": error.message})
