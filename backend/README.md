# Mesa de Servicios — Backend (FastAPI)

API en Python 3.12 con **Clean Architecture**, SQLAlchemy 2 y Alembic.

## Arquitectura

La regla de dependencia apunta siempre hacia adentro: `presentation → application → domain`.
`infrastructure` implementa los puertos que definen `domain` y `application`.

```
app/
├── domain/           Entidades, enums, excepciones y puertos de repositorio. Sin dependencias externas.
├── application/      Casos de uso (Login, CreateCase, EscalateCase...) y puertos (UnitOfWork, PasswordHasher).
├── infrastructure/   SQLAlchemy (modelos ORM, repositorios, UnitOfWork), bcrypt, configuración de BD.
└── presentation/     FastAPI: routers, esquemas HTTP (camelCase), dependencias y manejo de errores.
```

Cambiar de Azure SQL o PostgreSQL solo toca `infrastructure/` (la `DATABASE_URL` y, si hace falta, el driver).

## Puesta en marcha

```bash
cd backend
/opt/homebrew/bin/python3.12 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env

.venv/bin/alembic upgrade head      # crea las tablas
.venv/bin/python -m scripts.seed    # datos de demostración
.venv/bin/uvicorn app.main:app --reload
```

- Documentación interactiva: http://localhost:8000/docs
- Credenciales de prueba: `david.mesacortes@sistecredito.com` / `password123`

## Pruebas

```bash
.venv/bin/pytest
```

Usan SQLite en memoria y sustituyen el `UnitOfWork` por inyección de dependencias.

## Endpoints (`/api`)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Devuelve `token` (usar como `Authorization: Bearer ...`) |
| POST | `/auth/logout` | Invalida el token |
| GET | `/auth/me` | Usuario actual |
| GET / POST | `/cases` | Listar (un solicitante solo ve los suyos) / crear |
| GET / PATCH | `/cases/{id}` | Detalle / cambiar estado o asignación (solo analistas y responsables) |
| POST | `/cases/{id}/updates` | Agregar comentario |
| POST | `/cases/{id}/escalate` | Escalar a proveedor (solo analistas y responsables) |
| GET | `/providers` | Proveedores |

## Migraciones

```bash
.venv/bin/alembic revision --autogenerate -m "descripcion"
.venv/bin/alembic upgrade head
```
