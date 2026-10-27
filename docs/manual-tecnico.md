# Manual Técnico — Mesa de Servicios · Sistecrédito

- **Versión del sistema:** 1.0.0
- **Fecha:** 26 de octubre de 2026
- **Autores:** David Mesa Cortés · Ángela María Ossa Alzate
- **Institución:** Fundación Universitaria Católica del Norte
- **Audiencia:** desarrolladores y administradores que instalan, mantienen o extienden el sistema. Para el uso funcional, ver [`manual-usuario.md`](manual-usuario.md).

---

## Tabla de contenido

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Arquitectura](#3-arquitectura)
4. [Estructura del repositorio](#4-estructura-del-repositorio)
5. [Instalación y puesta en marcha](#5-instalación-y-puesta-en-marcha)
6. [Configuración](#6-configuración)
7. [Modelo de datos](#7-modelo-de-datos)
8. [Autenticación y sesiones](#8-autenticación-y-sesiones)
9. [Autorización por rol](#9-autorización-por-rol)
10. [API REST](#10-api-rest)
11. [Reglas de negocio](#11-reglas-de-negocio)
12. [Capa de interfaz](#12-capa-de-interfaz)
13. [Datos de demostración (seed)](#13-datos-de-demostración-seed)
14. [Migraciones y base de datos](#14-migraciones-y-base-de-datos)
15. [Pruebas y documentación asociada](#15-pruebas-y-documentación-asociada)
16. [Despliegue a producción](#16-despliegue-a-producción)
17. [Limitaciones y deuda técnica conocida](#17-limitaciones-y-deuda-técnica-conocida)
18. [Cómo extender el sistema](#18-cómo-extender-el-sistema)

---

## 1. Visión general

Mesa de Servicios es una aplicación web monolítica (frontend y backend en un mismo proyecto Next.js) para gestionar tickets de soporte: registro, seguimiento con historial, escalamiento a proveedores externos y métricas de SLA.

```
Navegador ──► Next.js (App Router)
               ├─ Server Components  (páginas /dashboard/*, consultan Prisma directamente)
               ├─ Client Components  (formularios y acciones: fetch a /api/*)
               └─ Route Handlers     (/api/*, lógica REST)
                        │
                     Prisma Client + adaptador libSQL
                        │
                     SQLite (dev.db)
```

## 2. Stack tecnológico

| Capa | Tecnología | Versión (package.json) |
|---|---|---|
| Framework | Next.js (App Router) | ^16.4.3 |
| UI | React | 19.3.0 |
| Lenguaje | TypeScript (`strict: false`) | ^7.0.2 |
| Estilos | Tailwind CSS 4 + estilos en línea + variables CSS (`app/globals.css`) | ^4 |
| Iconos | lucide-react | ^1.61.0 |
| ORM | Prisma Client | ^7.10.1 |
| Base de datos | SQLite vía `@prisma/adapter-libsql` | ^7.10.1 |
| Hash de contraseñas | bcryptjs | ^3.0.3 |

Dependencias instaladas pero **no utilizadas en el código**: `next-auth`, `better-sqlite3` y `@prisma/adapter-better-sqlite3` (ver [§17](#17-limitaciones-y-deuda-técnica-conocida)).

> **Aviso (AGENTS.md):** esta versión de Next.js tiene cambios incompatibles respecto a versiones anteriores. Antes de modificar convenciones del framework, consultar la documentación incluida en `node_modules/next/dist/docs/`.

## 3. Arquitectura

### 3.1 Renderizado

- Las **páginas del dashboard** son Server Components `async`: llaman a `getSession()`, validan el rol y consultan Prisma directamente, sin pasar por la API REST.
- Los **componentes con interacción** (`NewCaseForm`, `CaseActions`, `Sidebar`, `UserMenu`, login) son Client Components (`"use client"`) y usan `fetch` contra `/api/*`.
- La **API REST** (`app/api/**/route.ts`) es la que muta datos. Tras una mutación, el cliente llama a `router.refresh()`/`router.push()` para revalidar.

### 3.2 Flujo de una petición autenticada

1. El navegador envía la cookie `session`.
2. `getSession()` (`lib/auth.ts`) lee la cookie con `cookies()` de `next/headers`.
3. Busca la fila en `Session` por `token` e incluye el `User`.
4. Si no existe o `expiresAt < now`, devuelve `null` → la página redirige a `/login` o la API responde `401`.

### 3.3 Protección de rutas

No existe `middleware.ts`/`proxy.ts`. La protección se hace **por página y por endpoint**:

- `app/dashboard/layout.tsx` redirige a `/login` si no hay sesión (cubre todo `/dashboard/*`).
- Cada página restringida repite su propia validación de rol (ver [§9](#9-autorización-por-rol)).
- `app/page.tsx` redirige a `/dashboard` o `/login` según haya sesión.

## 4. Estructura del repositorio

```
app/
  layout.tsx, globals.css, page.tsx
  login/page.tsx
  api/
    auth/{login,logout}/route.ts
    cases/route.ts
    cases/[id]/{route.ts, updates/route.ts, escalate/route.ts}
    providers/route.ts
    users/me/route.ts
  dashboard/
    layout.tsx                 # guarda de sesión + Sidebar
    page.tsx                   # KPIs
    cases/{page.tsx, new/, [id]/}
    incidents/ catalog/ reports/ users/ health/ settings/
components/
  Sidebar, TopBar, Navbar, UserMenu, PageHeader, StatusBadge, PriorityBadge
  ui/{Card, MetricWidget, SearchBar}
lib/
  prisma.ts                    # singleton de PrismaClient
  auth.ts                      # getSession()
prisma/
  schema.prisma
  migrations/                  # init + add_session
  seed.ts, seed.js
prisma7.config.ts              # configuración de Prisma CLI
docs/                          # manuales, plan de pruebas, colección Postman
public/                        # logos
```

El alias `@/*` apunta a la raíz del proyecto (`tsconfig.json`).

## 5. Instalación y puesta en marcha

**Requisitos:** Node.js compatible con Next.js 16 y npm.

```bash
npm install
npx prisma generate --config prisma7.config.ts   # genera Prisma Client
npx prisma migrate deploy --config prisma7.config.ts  # crea dev.db con el esquema
npm run seed                                      # datos de demostración (opcional)
npm run dev                                       # http://localhost:3000
```

| Script | Comando real | Uso |
|---|---|---|
| `npm run dev` | `next dev` | Desarrollo |
| `npm run build` | `next build` | Compilación de producción |
| `npm run start` | `next start` | Servir la compilación |
| `npm run lint` | `eslint` | Análisis estático |
| `npm run seed` | `ts-node … prisma/seed.ts` | Cargar datos de demostración |

> El archivo de configuración de Prisma se llama `prisma7.config.ts`, no el `prisma.config.ts` que la CLI busca por defecto. Por eso los comandos `prisma …` deben recibir `--config prisma7.config.ts` (o renombrar el archivo).

Credenciales de demostración: ver `ACCESO.md`.

## 6. Configuración

Variables de entorno (archivo `.env`, excluido de git por la regla `.env*` de `.gitignore`):

| Variable | Uso real | Valor local |
|---|---|---|
| `DATABASE_URL` | URL de SQLite. La leen `lib/prisma.ts` (por defecto `file:./dev.db`) y `prisma7.config.ts`. | `file:./dev.db` |
| `NEXTAUTH_SECRET` | **No se usa** (sin NextAuth en el código). | — |
| `NEXTAUTH_URL` | **No se usa.** | — |

`next.config.js` solo desactiva los indicadores de desarrollo (`devIndicators: false`).

## 7. Modelo de datos

Definido en `prisma/schema.prisma` (proveedor `sqlite`, generador `prisma-client-js`).

### 7.1 Diagrama de relaciones

```
User 1──* Case (requester)      User 1──* Case (assignedTo)
User 1──* CaseUpdate (author)   User 1──* Session
Case 1──* CaseUpdate            Case 1──0..1 Escalation
Provider 1──* Escalation
```

### 7.2 Entidades

**User** — `id` (cuid), `name`, `email` (único), `password` (hash bcrypt), `role` (`REQUESTER` | `ANALYST` | `MANAGER`, por defecto `REQUESTER`), `department?`, `phone?`, `createdAt`.

**Session** — `id`, `userId`, `token` (único, 64 hex), `expiresAt`.

**Provider** — `id`, `name`, `type`, `email`, `phone?`, `createdAt`.

**Case** — `id`, `title`, `description`, `category`, `priority`, `status` (por defecto `OPEN`), `estimatedTime?` (horas), `requesterId`, `assignedToId?`, `createdAt`, `updatedAt`, `closedAt?`.

**CaseUpdate** — `id`, `caseId`, `authorId`, `message`, `oldStatus?`, `newStatus?`, `createdAt`. Es el historial (bitácora) del caso.

**Escalation** — `id`, `caseId` (único → máximo una por caso), `providerId`, `sentAt`, `status` (por defecto `PENDING`), `notes?`, `resolvedAt?`.

### 7.3 Valores permitidos (no impuestos por la BD)

`category`, `priority`, `status` y `Escalation.status` son `String` libres; los valores válidos se controlan solo en la interfaz:

| Campo | Valores |
|---|---|
| `category` | `INCIDENT`, `REQUEST`, `CHANGE` |
| `priority` | `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `status` | `OPEN`, `IN_PROGRESS`, `WAITING_USER`, `WAITING_PROVIDER`, `RESOLVED`, `CLOSED` |

`WAITING_PROVIDER` solo se establece mediante el escalamiento; el selector de estados de `CaseActions` no lo ofrece.

## 8. Autenticación y sesiones

Autenticación propia con sesiones en base de datos (no usa NextAuth).

**Login** — `POST /api/auth/login`:
1. Valida `email` y `password` (`400` si faltan).
2. Busca el usuario y compara con `bcrypt.compare` (`401` si falla; mismo mensaje para usuario inexistente o clave errónea).
3. Genera `token = randomBytes(32).toString("hex")`, `expiresAt = ahora + 24 h` y crea la fila `Session`.
4. Responde el usuario (sin hash) y fija la cookie `session` (`httpOnly`, `expires`, `path=/`).

**Logout** — `POST /api/auth/logout`: borra las filas `Session` con ese token y elimina la cookie.

**Atributos de la cookie:** `httpOnly` y `path=/`. No se fijan `secure` ni `sameSite` explícitamente (ver [§17](#17-limitaciones-y-deuda-técnica-conocida)).

Las sesiones vencidas no se eliminan automáticamente; simplemente se rechazan al validar.

## 9. Autorización por rol

| Recurso | REQUESTER | ANALYST | MANAGER |
|---|:-:|:-:|:-:|
| Dashboard, Tickets, Catálogo, Ajustes | ✔ (solo sus casos) | ✔ | ✔ |
| Incidentes (`/dashboard/incidents`) | ✘ | ✔ | ✔ |
| Reportes (`/dashboard/reports`) | ✘ | ✔ (acceso directo por URL) | ✔ |
| Usuarios (`/dashboard/users`) | ✘ | ✔ | ✔ |
| `PATCH /api/cases/{id}` | ✘ 403 | ✔ | ✔ |
| `POST /api/cases/{id}/escalate` | ✘ 403 | ✔ | ✔ |

Los `REQUESTER` que abren una página restringida son redirigidos a `/dashboard`. En la API se aplica el filtrado por propietario en `GET /api/cases` y `GET /api/cases/{id}` (`403` si el caso no es suyo).

> **Discrepancia:** el enlace "Reportes" del Sidebar solo se muestra a `MANAGER`, pero la página `reports/page.tsx` solo bloquea a `REQUESTER`; un `ANALYST` puede entrar escribiendo la URL.

## 10. API REST

Base: `/api`. Formato JSON. Cuerpos de error: `{ "error": "<mensaje>" }`. Todos los endpoints, salvo login y logout, requieren cookie de sesión válida.

| Método | Ruta | Rol | Descripción |
|---|---|---|---|
| POST | `/auth/login` | público | Inicia sesión. |
| POST | `/auth/logout` | público | Cierra sesión. |
| GET | `/users/me` | autenticado | Usuario actual (sin `password`). |
| GET | `/cases` | autenticado | Lista de casos, más recientes primero. `REQUESTER` solo ve los propios. |
| POST | `/cases` | autenticado | Crea un caso. |
| GET | `/cases/{id}` | autenticado | Detalle con historial ascendente. |
| PATCH | `/cases/{id}` | ANALYST, MANAGER | Cambia estado y/o asignación. |
| POST | `/cases/{id}/updates` | autenticado | Agrega un comentario. |
| POST | `/cases/{id}/escalate` | ANALYST, MANAGER | Escala a un proveedor. |
| GET | `/providers` | autenticado | Proveedores ordenados por nombre. |

### 10.1 Detalle de endpoints

**`POST /auth/login`** — Body: `{ "email", "password" }`.
`200` → `{ "user": { id, name, email, role } }` + cookie · `400` campos faltantes · `401` credenciales inválidas.

**`GET /cases`** — `200` → arreglo de casos con `requester`, `assignedTo`, `escalation.provider` y `_count.updates`. `401` sin sesión.

**`POST /cases`** — Body: `{ "title", "description", "category", "priority" }` (los cuatro obligatorios).
`201` → caso creado (con `requester`) · `400` si falta algún campo · `401`.
Efectos: fija `requesterId` al usuario de la sesión, calcula `estimatedTime` ([§11](#11-reglas-de-negocio)) y crea un `CaseUpdate` inicial "Caso registrado en el sistema." con `newStatus: "OPEN"`.

**`GET /cases/{id}`** — `200` · `401` · `403` (REQUESTER sobre caso ajeno) · `404`.

**`PATCH /cases/{id}`** — Body (todos opcionales): `{ "status", "assignedToId", "message" }`.
`200` → caso actualizado · `403` sin permisos (o sin sesión) · `404`.
Efectos: si `status === "CLOSED"` fija `closedAt`. Si llega `message` o `status`, registra un `CaseUpdate` con `oldStatus`/`newStatus`; el mensaje por defecto es `Estado actualizado a {status}`.

**`POST /cases/{id}/updates`** — Body: `{ "message" }`.
`201` → actualización con `author` · `400` mensaje vacío · `401` · `404`. No cambia el estado del caso. Cualquier usuario autenticado puede comentar, **incluso en casos ajenos** (no se valida propiedad).

**`POST /cases/{id}/escalate`** — Body: `{ "providerId", "notes"? }`.
`201` → escalamiento con `provider` · `400` sin `providerId` · `403` · `409` ya escalado.
Efectos: crea `Escalation`, pone el caso en `WAITING_PROVIDER` y registra un `CaseUpdate` (`IN_PROGRESS → WAITING_PROVIDER`).

**`GET /providers`**, **`GET /users/me`** — sin parámetros.

La colección Postman está en `docs/mesa-de-servicios.postman_collection.json`.

## 11. Reglas de negocio

### 11.1 Tiempo estimado de atención

Se asigna al crear el caso según prioridad (`app/api/cases/route.ts`):

| Prioridad | Horas |
|---|---|
| LOW | 72 |
| MEDIUM | 24 |
| HIGH | 8 |
| CRITICAL | 2 |

### 11.2 Ciclo de vida

```
OPEN ─► IN_PROGRESS ─► WAITING_USER ─► RESOLVED ─► CLOSED
              └────► WAITING_PROVIDER (por escalamiento)
```

El backend **no valida transiciones**: `PATCH` acepta cualquier cadena como `status`.

### 11.3 Métrica de SLA (dashboard y reportes)

`SLA compliance = round((RESOLVED + CLOSED) / total × 100)`. Es la proporción de casos resueltos o cerrados sobre el total; **no** compara tiempos reales contra `estimatedTime`.

### 11.4 Incidentes

La vista de incidentes filtra `category = "INCIDENT"`; "críticos activos" son los de prioridad `CRITICAL` que no están en `RESOLVED`/`CLOSED`.

### 11.5 Catálogo de servicios

Lista estática codificada en `app/dashboard/catalog/page.tsx` (no está en base de datos), con SLA de referencia por servicio (2 h a 72 h).

### 11.6 Health Status

La página `/dashboard/health` es una vista de topología de servicios de observabilidad (Grafana, Prometheus, Loki, Tempo, Datadog, Sauron). No realiza consultas ni llamadas a esos servicios.

## 12. Capa de interfaz

- **Sistema de diseño:** paleta Sistecrédito `#002B7A` (azul) y `#00C853` (verde); botones tipo píldora; tarjetas con sombra suave; variables CSS en `app/globals.css`; tamaños con `clamp()`.
- **Navegación:** `Sidebar` (colapsable 260 px ↔ 60 px) filtra sus ítems por rol; incluye accesos fijos a Health Status, Nuevo ticket y Ajustes. `TopBar`/`UserMenu` muestran el usuario y el cierre de sesión.
- **Componentes de presentación:** `StatusBadge` y `PriorityBadge` mapean códigos a etiqueta y color; un estado desconocido se muestra con el código crudo y color gris.
- **Formularios:** `NewCaseForm` (creación) y `CaseActions` (cambio de estado, comentario y escalamiento con carga de proveedores desde `/api/providers`).

## 13. Datos de demostración (seed)

Crea 100 casos, 8 solicitantes, 4 analistas, 1 responsable y 6 proveedores. Todas las cuentas usan la contraseña `password123` (ver `ACCESO.md`).

- `npm run seed` ejecuta `prisma/seed.ts` con ts-node.
- Existe también `prisma/seed.js`, versión en CommonJS que además incluye una función `toEmail` que normaliza acentos al generar correos (los correos de `ACCESO.md` no llevan tildes). Ambos tienen la URL `file:./dev.db` fija en el código.
- Úselo **solo en desarrollo/demostración**: las credenciales son conocidas.

## 14. Migraciones y base de datos

| Migración | Contenido |
|---|---|
| `20261024160756_init` | Tablas `User`, `Provider`, `Case`, `CaseUpdate`, `Escalation`. |
| `20261024163900_add_session` | Tabla `Session`. |

- La base es el archivo `dev.db` en la raíz.
- Para aplicar migraciones: `npx prisma migrate deploy --config prisma7.config.ts`. Tras cambiar `schema.prisma`: `npx prisma migrate dev --config prisma7.config.ts` y luego `npx prisma generate`.
- Respaldo: copiar `dev.db` con la aplicación detenida.

## 15. Pruebas y documentación asociada

No hay pruebas automatizadas en el repositorio (sin Jest/Vitest/Playwright); la verificación es manual y por API.

| Documento | Contenido |
|---|---|
| `docs/plan-pruebas.md` / `.pdf` | Plan de pruebas. |
| `docs/bloque-3a-tipos-prueba.*` | Tipos de prueba. |
| `docs/bloque-3b-casos-prueba.*` | Casos de prueba. |
| `docs/bloque-3c-criterios.*` | Criterios de entrada/salida. |
| `docs/calidad.md` / `.pdf` | Plan de calidad y métricas ISO/IEC 25010:2023. |
| `docs/mesa-de-servicios.postman_collection.json` | Pruebas de API. |
| `docs/manual-usuario.md` | Manual de usuario. |
| `CHANGELOG.md` | Historial de versiones. |

## 16. Despliegue a producción

El proyecto es un prototipo académico. Antes de exponerlo, como mínimo:

1. Reemplazar SQLite local por una base gestionada (o garantizar volumen persistente y respaldos) y definir `DATABASE_URL` por entorno; el `seed` no debe ejecutarse.
2. Servir solo por HTTPS y fijar `secure: true` y `sameSite` en la cookie de sesión.
3. Eliminar o cambiar todas las cuentas y contraseñas de demostración.
4. Construir con `npm run build` y ejecutar con `npm run start` (o la plataforma de despliegue elegida).
5. Añadir límite de intentos de login y registro de auditoría.

## 17. Limitaciones y deuda técnica conocida

Hallazgos verificados en el código a la fecha de este manual:

| # | Hallazgo | Impacto |
|---|---|---|
| 1 | Cookie sin `secure` ni `sameSite` explícitos. | Exposición en HTTP; sin defensa explícita contra CSRF. |
| 2 | Sin límite de intentos de login. | Fuerza bruta. |
| 3 | `PATCH` y `escalate` no validan valores de `status`/`providerId` ni transiciones. | Datos inconsistentes. |
| 4 | `escalate` no verifica que el caso exista (devuelve error de FK sin manejar) y fija `oldStatus` como `IN_PROGRESS` sin leer el estado real. | Error 500 / historial impreciso. |
| 5 | `POST /cases/{id}/updates` no valida propiedad del caso. | Un solicitante podría comentar casos ajenos si conoce el id. |
| 6 | Los endpoints no manejan JSON inválido (`req.json()` sin `try/catch`). | Error 500 en lugar de 400. |
| 7 | `reports` accesible a ANALYST por URL aunque el menú lo oculte. | Inconsistencia de permisos. |
| 8 | `next-auth`, `better-sqlite3` y `@prisma/adapter-better-sqlite3` instalados sin uso; `NEXTAUTH_*` sin uso. | Peso y confusión. |
| 9 | `prisma7.config.ts` con nombre no estándar; el script `prisma.seed` en `package.json` apunta a `ts-node prisma/seed.ts`. | Comandos de CLI requieren `--config`. |
| 10 | `seed.ts` y `seed.js` duplicados con diferencias. | Riesgo de divergencia. |
| 11 | "SLA compliance" mide casos cerrados/total, no cumplimiento de tiempos. | Métrica engañosa. |
| 12 | Sin pruebas automatizadas. | Regresiones no detectadas. |
| 13 | Campos de estado/prioridad/categoría como texto libre en la BD. | Sin integridad a nivel de datos. |
| 14 | `.env` (con un secreto de ejemplo) y `dev.db` están correctamente ignorados por git, pero viven en la raíz del proyecto y el seed tiene la ruta de la BD fija. | Cuidado al empaquetar o desplegar. |

## 18. Cómo extender el sistema

**Agregar un endpoint**
1. Crear `app/api/<recurso>/route.ts` exportando `GET`/`POST`/etc.
2. Abrir con `const user = await getSession();` y responder `401`/`403` según corresponda.
3. En rutas dinámicas, `params` es una `Promise`: `const { id } = await params;`.

**Agregar una página al dashboard**
1. Crear `app/dashboard/<ruta>/page.tsx` como Server Component.
2. Validar sesión y rol con `getSession()` + `redirect()` (el layout solo valida sesión).
3. Añadir el ítem en `ALL_NAV` de `components/Sidebar.tsx` con sus `roles`.

**Agregar un estado de caso**
1. Añadirlo en `CFG` de `components/StatusBadge.tsx` y en `STATUSES` de `CaseActions.tsx`.
2. Revisar los filtros que excluyen `RESOLVED`/`CLOSED` (dashboard, incidentes, reportes).

**Cambiar el esquema**
1. Editar `prisma/schema.prisma`.
2. `npx prisma migrate dev --name <cambio> --config prisma7.config.ts`.
3. `npx prisma generate --config prisma7.config.ts` y actualizar `seed.ts` si aplica.

---

*Fin del manual técnico — Mesa de Servicios v1.0.0*
