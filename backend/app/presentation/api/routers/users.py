from fastapi import APIRouter

from app.application.use_cases.users import ListUsers
from app.presentation.api.deps import CurrentUser, Uow
from app.presentation.api.schemas import UserListItemOut

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=list[UserListItemOut])
def list_users(user: CurrentUser, uow: Uow):
    return [
        UserListItemOut.model_validate(
            {
                **item.user.__dict__,
                "requested_cases": item.requested_cases,
                "assigned_cases": item.assigned_cases,
            }
        )
        for item in ListUsers(uow).execute(user)
    ]
