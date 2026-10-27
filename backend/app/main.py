from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.presentation.api.routers import auth, cases, providers
from app.presentation.errors import register_error_handlers


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="Mesa de Servicios API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_error_handlers(app)

    api = APIRouter(prefix="/api")
    api.include_router(auth.router)
    api.include_router(cases.router)
    api.include_router(providers.router)
    app.include_router(api)

    @app.get("/health", tags=["health"])
    def health():
        return {"status": "ok"}

    return app


app = create_app()
