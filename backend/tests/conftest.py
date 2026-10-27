import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.domain.entities import new_id
from app.infrastructure.database import Base
from app.infrastructure.models import ProviderModel, UserModel
from app.infrastructure.repositories import SqlAlchemyUnitOfWork
from app.infrastructure.security import BcryptPasswordHasher
from app.main import app
from app.presentation.api.deps import get_uow

PASSWORD = "password123"


@pytest.fixture()
def session_factory():
    engine = create_engine(
        "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    Base.metadata.create_all(engine)
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


@pytest.fixture()
def client(session_factory):
    password_hash = BcryptPasswordHasher().hash(PASSWORD)
    with session_factory() as db:
        for name, email, role in [
            ("Ana Solicitante", "ana@test.com", "REQUESTER"),
            ("Otro Solicitante", "otro@test.com", "REQUESTER"),
            ("Laura Analista", "laura@test.com", "ANALYST"),
        ]:
            db.add(UserModel(id=new_id(), name=name, email=email,
                             password_hash=password_hash, role=role))
        db.add(ProviderModel(id="prov1", name="Telco", type="Telecom", email="t@telco.com"))
        db.commit()

    def override_uow():
        db = session_factory()
        try:
            yield SqlAlchemyUnitOfWork(db)
        finally:
            db.close()

    app.dependency_overrides[get_uow] = override_uow
    yield TestClient(app)
    app.dependency_overrides.clear()


def login(client: TestClient, email: str) -> dict[str, str]:
    res = client.post("/api/auth/login", json={"email": email, "password": PASSWORD})
    assert res.status_code == 200, res.text
    return {"Authorization": f"Bearer {res.json()['token']}"}


@pytest.fixture()
def requester(client):
    return login(client, "ana@test.com")


@pytest.fixture()
def other_requester(client):
    return login(client, "otro@test.com")


@pytest.fixture()
def analyst(client):
    return login(client, "laura@test.com")
