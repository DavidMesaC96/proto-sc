from app.application.ports import UnitOfWork
from app.domain.entities import Provider


class ListProviders:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def execute(self) -> list[Provider]:
        return self.uow.providers.list_all()
