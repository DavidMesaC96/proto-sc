# Actividad 2 — Plan de calidad, pruebas y despliegue
## Mesa de Servicios · Sistecrédito

> **Curso:** Ingeniería de Requisitos — Fundación Universitaria Católica del Norte
> **Equipo:** David Mesa Cortés · Ángela María Ossa
> **Entrega:** viernes 30 de octubre de 2026
> **Repositorio:** https://github.com/DavidMesaC96/proto-sc

---

# PÁGINA 1 — Inicio

> **Título en Google Sites:** `Inicio`

## Nombre del proyecto

Mesa de Servicios · Sistecrédito

## Descripción (≤ 100 palabras)

Sistema web de gestión de servicios TI desarrollado para Sistecrédito. Permite a los usuarios registrar tickets de soporte, incidentes y solicitudes de cambio, con asignación automática a analistas y seguimiento del estado en tiempo real. Los analistas pueden actualizar casos, escalar a proveedores externos y consultar métricas de SLA desde un dashboard centralizado. El sistema diferencia tres roles: solicitante, analista y responsable, con vistas adaptadas a cada perfil. Construido con Next.js 16, React 19, Prisma 7 y SQLite.

## Tecnologías utilizadas

| Categoría | Tecnología | Versión |
|---|---|---|
| Framework frontend | Next.js (App Router) | 16.4.3 |
| Librería UI | React | 19 |
| Lenguaje | TypeScript | 7 |
| ORM | Prisma | 7 |
| Base de datos | SQLite | — |
| Estilos | Tailwind CSS | 4 |
| Autenticación | bcryptjs + cookies | — |
| Control de versiones | Git + GitHub | — |
| Gestor de paquetes | npm | — |

## Integrantes y páginas responsables

| Integrante | Rol | Páginas responsables |
|---|---|---|
| David Mesa Cortés | Desarrollador / Analista | Inicio, Calidad, Pruebas, Configuración, Despliegue |
| Ángela María Ossa | Analista / Documentadora | Soporte, Documentación, Referencias |

---

# PÁGINA 2 — Calidad

> **Título en Google Sites:** `Calidad`

## Modelo de calidad adoptado

**Modelo:** ISO/IEC 25010:2023 — Systems and software Quality Requirements and Evaluation (SQuaRE)

**Justificación (≤ 100 palabras):**

La ISO/IEC 25010:2023 es el estándar internacional más completo para evaluar la calidad de productos software. Se adoptó porque define características medibles y aplicables directamente a sistemas de gestión de servicios como la Mesa de Servicios de Sistecrédito, permitiendo evaluar tanto la experiencia del usuario final como la solidez técnica del sistema. Su estructura jerárquica facilita la selección de características prioritarias según el contexto del proyecto (Organización Internacional de Normalización [ISO], 2023).

## Paso 1 — Características seleccionadas

| Característica del modelo | Por qué es relevante para el proyecto | Funcionalidad o módulo donde aplica |
|---|---|---|
| Usabilidad | Usuarios de distintos departamentos (Finanzas, RRHH, Logística) deben poder registrar y consultar tickets sin capacitación previa | Formulario de nuevo ticket (`/dashboard/cases/new`) y dashboard principal |
| Fiabilidad | Los tickets críticos no pueden perderse ni quedar sin estado. El sistema debe garantizar que cada caso registrado persiste correctamente en la base de datos | Módulo de gestión de casos y API `/api/cases` |
| Mantenibilidad | El equipo técnico debe poder agregar nuevos estados, roles o módulos sin romper la funcionalidad existente | Esquema de base de datos (Prisma), API REST y componentes reutilizables del frontend |

## Paso 2 — Métricas de calidad

| ID | Métrica | Característica asociada | Cómo se mide | Herramienta | Umbral de aceptación |
|---|---|---|---|---|---|
| M-01 | Tasa de éxito en registro de tickets | Fiabilidad | (Tickets registrados exitosamente / intentos totales de registro) × 100 | Logs de la API Next.js + Prisma | ≥ 98 % |
| M-02 | Tiempo de carga del dashboard | Usabilidad | Tiempo en milisegundos desde la solicitud HTTP hasta el renderizado completo con 100 casos | Chrome DevTools (pestaña Network) | ≤ 3 000 ms |
| M-03 | Cobertura de rutas protegidas | Mantenibilidad | (Rutas con validación de rol implementada / total de rutas privadas) × 100 | Revisión manual del middleware en `lib/auth.ts` | 100 % |

---

# PÁGINA 3 — Pruebas

> **Título en Google Sites:** `Pruebas`

## Paso 3a — Tipos de prueba

| Tipo de prueba | Qué se prueba en el proyecto | Herramienta o técnica | Responsable |
|---|---|---|---|
| Unitarias | Validación de credenciales en el módulo de autenticación (email, contraseña, rol) | Jest | David Mesacortes |
| Integración | Comunicación entre la API `/api/cases` y la base de datos SQLite a través de Prisma | Postman | David Mesacortes |
| Sistema | Flujo completo de un ticket: registro → asignación → cambio de estado → cierre | Prueba manual con checklist | Ángela María Ossa |

## Paso 3b — Casos de prueba

| ID | Funcionalidad / Requisito | Tipo de prueba | Precondiciones | Pasos y datos de entrada | Resultado esperado |
|---|---|---|---|---|---|
| CP-01 | Inicio de sesión (RF-01) | Sistema | Usuario `david.mesacortes@sistecredito.com` registrado con rol ANALYST | 1. Abrir `/login`. 2. Ingresar correo y contraseña `password123`. 3. Pulsar "Ingresar". | Se redirige al dashboard con los casos activos visibles en menos de 3 s. |
| CP-02 | Registro de ticket (RF-02) | Sistema | Usuario autenticado con rol REQUESTER | 1. Ir a `/dashboard/cases/new`. 2. Ingresar título "Fallo en sistema de nómina", categoría "Incidente", prioridad "Alta". 3. Pulsar "Registrar ticket". | El ticket aparece en la lista con estado OPEN y un ID asignado automáticamente. |
| CP-03 | Listado de casos (RF-03) | Integración | Base de datos con al menos 10 casos registrados | 1. Autenticarse como `david.mesacortes@sistecredito.com`. 2. Hacer GET a `/api/cases`. | La API retorna un JSON con los casos ordenados por prioridad y fecha de actualización. |
| CP-04 | Cambio de estado de ticket (RF-04) | Integración | Ticket con ID existente en estado OPEN | 1. Autenticarse como ANALYST. 2. Ir al detalle del ticket. 3. Seleccionar estado "En gestión". 4. Agregar comentario "Revisando con el área". 5. Guardar. | El estado cambia a IN_PROGRESS y el comentario queda registrado en el historial. |
| CP-05 | Escalamiento a proveedor (RF-05) | Sistema | Ticket en estado IN_PROGRESS sin escalamiento previo | 1. Ir al detalle del ticket. 2. Seleccionar pestaña "Escalar". 3. Elegir proveedor "CloudTech Services". 4. Agregar nota "Requiere soporte de infraestructura". 5. Confirmar. | El ticket cambia a estado WAITING_PROVIDER y el proveedor queda vinculado al caso. |

## Paso 3c — Criterios de aceptación

1. El 100 % de los casos de prueba CP-01 a CP-05 deben ejecutarse sin errores bloqueantes.
2. El tiempo de respuesta del dashboard principal con 100 casos cargados debe ser inferior a 3 segundos (M-02).
3. Ningún usuario con rol REQUESTER puede acceder a rutas restringidas de ANALYST o MANAGER (`/dashboard/incidents`, `/dashboard/reports`).

---

# PÁGINA 4 — Configuración

> **Título en Google Sites:** `Configuración` — *Próximamente*

---

# PÁGINA 5 — Despliegue

> **Título en Google Sites:** `Despliegue` — *Próximamente*

---

# PÁGINA 6 — Soporte

> **Título en Google Sites:** `Soporte` — *Próximamente*

---

# PÁGINA 7 — Documentación

> **Título en Google Sites:** `Documentación` — *Próximamente*

---

# PÁGINA 8 — Referencias

> **Título en Google Sites:** `Referencias` — *Próximamente*

Organización Internacional de Normalización. (2023). *ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*. ISO. https://www.iso.org/standard/78181.html
