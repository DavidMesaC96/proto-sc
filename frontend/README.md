# Mesa de Servicios — Frontend (Angular)

Angular 22 (standalone, signals, sin zone.js) + íconos Lucide. Consume la API de `../backend`.

El aspecto es el del Next.js original: `src/styles.css` es el `globals.css` de la rama `feature/fix`
(tokens, botones, campos y las clases `cd-*` / `ca-*` del rediseño del detalle) y no depende de una
librería de componentes.

## Estructura

```
src/app/
├── core/       Sesión (AuthService), interceptor Bearer, guards, servicios de API y modelos
├── shared/     Componentes reutilizables (badges de estado y prioridad)
├── layout/     Shell (menú lateral) y PageHeader (título, búsqueda, menú de usuario)
└── features/
    ├── login/
    └── cases/  Lista con filtros, detalle con historial, acciones y nuevo ticket
```

Cada pantalla se carga de forma perezosa (`loadComponent`). Los filtros de la lista viven en la
URL (`/cases?status=OPEN&priority=HIGH`).

## Desarrollo

Requiere el backend corriendo en `http://localhost:8000` (ver `../backend/README.md`).

```bash
npm install
npm start          # http://localhost:4200
```

`ng serve` reenvía `/api/*` a FastAPI mediante `proxy.conf.json`, así que no hay CORS en desarrollo.
En producción, el servidor web que sirva el frontend debe hacer el mismo reenvío de `/api`.

Usuario de prueba: `david.mesacortes@sistecredito.com` / `password123`.

## Pruebas y build

```bash
npm test -- --watch=false
npm run build
```

## Pantallas

| Ruta | Quién | Datos |
|---|---|---|
| `/dashboard` | todos | KPIs y cola, calculados con `GET /api/cases` |
| `/cases`, `/cases/:id`, `/cases/new` | todos | casos, historial, gestión y escalamiento |
| `/incidents`, `/reports`, `/users` | analistas y responsables (`staffGuard`) | `GET /api/cases`, `GET /api/users` |
| `/catalog` | todos | estático; cada servicio precarga `/cases/new` |
| `/health` | todos | pantalla "en construcción", como en el original |
| `/settings` | todos | perfil real; notificaciones y seguridad son de muestra |

En el panel de gestión del detalle, las pestañas Asignar y Cerrar son solo la forma, igual que en el
original.
