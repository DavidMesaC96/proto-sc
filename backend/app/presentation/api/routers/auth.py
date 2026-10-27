from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.application.ports import PasswordHasher, TokenGenerator
from app.application.use_cases.auth import Login, Logout
from app.presentation.api.deps import (
    AppSettings,
    CurrentUser,
    Token,
    Uow,
    get_hasher,
    get_token_generator,
)
from app.presentation.api.schemas import LoginIn, LoginOut, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=LoginOut)
def login(
    body: LoginIn,
    uow: Uow,
    settings: AppSettings,
    hasher: Annotated[PasswordHasher, Depends(get_hasher)],
    tokens: Annotated[TokenGenerator, Depends(get_token_generator)],
):
    result = Login(uow, hasher, tokens, settings.session_ttl_hours).execute(
        body.email, body.password
    )
    return LoginOut(token=result.token, expires_at=result.expires_at, user=result.user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(user: CurrentUser, token: Token, uow: Uow):
    Logout(uow).execute(token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser):
    return user
