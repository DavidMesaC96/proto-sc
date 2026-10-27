from fastapi import APIRouter, status

from app.application.use_cases.cases import (
    AddCaseUpdate,
    CreateCase,
    EscalateCase,
    GetCase,
    ListCases,
    UpdateCase,
)
from app.presentation.api.deps import CurrentUser, Uow
from app.presentation.api.schemas import (
    CaseCreateIn,
    CaseDetailOut,
    CaseNoteIn,
    CaseOut,
    CaseUpdateIn,
    CaseUpdateOut,
    EscalateIn,
    EscalationOut,
)

router = APIRouter(prefix="/cases", tags=["cases"])


@router.get("", response_model=list[CaseOut])
def list_cases(user: CurrentUser, uow: Uow):
    return ListCases(uow).execute(user)


@router.post("", response_model=CaseDetailOut, status_code=status.HTTP_201_CREATED)
def create_case(body: CaseCreateIn, user: CurrentUser, uow: Uow):
    return CreateCase(uow).execute(
        user,
        title=body.title,
        description=body.description,
        category=body.category,
        priority=body.priority,
    )


@router.get("/{case_id}", response_model=CaseDetailOut)
def get_case(case_id: str, user: CurrentUser, uow: Uow):
    return GetCase(uow).execute(user, case_id)


@router.patch("/{case_id}", response_model=CaseDetailOut)
def update_case(case_id: str, body: CaseUpdateIn, user: CurrentUser, uow: Uow):
    fields = body.model_fields_set
    kwargs = {"status": body.status, "message": body.message}
    if "assigned_to_id" in fields:
        kwargs["assigned_to_id"] = body.assigned_to_id
    return UpdateCase(uow).execute(user, case_id, **kwargs)


@router.post(
    "/{case_id}/updates", response_model=CaseUpdateOut, status_code=status.HTTP_201_CREATED
)
def add_update(case_id: str, body: CaseNoteIn, user: CurrentUser, uow: Uow):
    return AddCaseUpdate(uow).execute(user, case_id, body.message)


@router.post(
    "/{case_id}/escalate", response_model=EscalationOut, status_code=status.HTTP_201_CREATED
)
def escalate(case_id: str, body: EscalateIn, user: CurrentUser, uow: Uow):
    return EscalateCase(uow).execute(user, case_id, body.provider_id, body.notes)
