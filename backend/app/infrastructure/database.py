from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import get_settings


class Base(DeclarativeBase):
    pass


def _engine_args(url: str) -> dict:
    # SQLite necesita check_same_thread=False porque FastAPI usa un pool de hilos.
    return {"connect_args": {"check_same_thread": False}} if url.startswith("sqlite") else {}


_url = get_settings().database_url
engine = create_engine(_url, **_engine_args(_url))
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
