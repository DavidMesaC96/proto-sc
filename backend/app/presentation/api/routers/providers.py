from fastapi import APIRouter

from app.application.use_cases.providers import ListProviders
from app.presentation.api.deps import CurrentUser, Uow
from app.presentation.api.schemas import ProviderOut

router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("", response_model=list[ProviderOut])
def list_providers(user: CurrentUser, uow: Uow):
    return ListProviders(uow).execute()
