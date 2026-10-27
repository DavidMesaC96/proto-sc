# Mesa de Servicios — Frontend (Angular)

Angular 22 (standalone, signals, sin zone.js) + PrimeNG 22. Consume la API de `../backend`.

## Estructura

```
src/app/
├── core/       Sesión (AuthService), interceptor Bearer, guards, servicios de API y modelos
├── shared/     Componentes reutilizables (badges de estado y prioridad)
├── layout/     Shell: menú lateral + barra superior
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

## Pendiente de migrar desde Next.js

Dashboard, incidentes, catálogo, reportes, usuarios y configuración.
