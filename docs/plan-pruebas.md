# Plan de Pruebas — Mesa de Servicios · Sistecrédito

> **Página en Google Sites:** `3 - Pruebas`
> Copiar cada sección en el orden indicado dentro de esa página.

---

## Sección 1 — Tipos de prueba

> Insertar como tabla desde Google Sheets (Insertar > Hojas de cálculo).
> Título sugerido en el sitio: **"3a. Tipos de prueba seleccionados"**

| Tipo de prueba | Qué se prueba en el proyecto | Herramienta o técnica | Responsable |
|---|---|---|---|
| Unitarias | Validación de credenciales en el módulo de autenticación (email, contraseña, rol) | Jest | David Mesacortes |
| Integración | Comunicación entre la API `/api/cases` y la base de datos SQLite a través de Prisma | Postman | David Mesacortes |
| Sistema | Flujo completo de un ticket: registro → asignación → cambio de estado → cierre | Prueba manual con checklist | Ángela María Ossa |

---

## Sección 2 — Casos de prueba

> Insertar como tabla desde Google Sheets (Insertar > Hojas de cálculo).
> Título sugerido en el sitio: **"3b. Casos de prueba"**

| ID | Funcionalidad / Requisito | Tipo de prueba | Precondiciones | Pasos y datos de entrada | Resultado esperado |
|---|---|---|---|---|---|
| CP-01 | Inicio de sesión (RF-01) | Sistema | Usuario `david.mesacortes@sistecredito.com` registrado con rol ANALYST | 1. Abrir `/login`. 2. Ingresar correo y contraseña `password123`. 3. Pulsar "Ingresar". | Se redirige al dashboard con los casos activos visibles en menos de 3 s. |
| CP-02 | Registro de ticket (RF-02) | Sistema | Usuario autenticado con rol REQUESTER | 1. Ir a `/dashboard/cases/new`. 2. Ingresar título "Fallo en sistema de nómina", categoría "Incidente", prioridad "Alta". 3. Pulsar "Registrar ticket". | El ticket aparece en la lista con estado OPEN y un ID asignado automáticamente. |
| CP-03 | Listado de casos (RF-03) | Integración | Base de datos con al menos 10 casos registrados | 1. Autenticarse como `david.mesacortes@sistecredito.com`. 2. Hacer GET a `/api/cases`. | La API retorna un JSON con los casos ordenados por prioridad y fecha de actualización. |
| CP-04 | Cambio de estado de ticket (RF-04) | Integración | Ticket con ID existente en estado OPEN | 1. Autenticarse como ANALYST. 2. Ir al detalle del ticket. 3. Seleccionar estado "En gestión". 4. Agregar comentario "Revisando con el área". 5. Guardar. | El estado cambia a IN_PROGRESS y el comentario queda registrado en el historial. |
| CP-05 | Escalamiento a proveedor (RF-05) | Sistema | Ticket en estado IN_PROGRESS sin escalamiento previo | 1. Ir al detalle del ticket. 2. Seleccionar pestaña "Escalar". 3. Elegir proveedor "CloudTech Services". 4. Agregar nota "Requiere soporte de infraestructura". 5. Confirmar. | El ticket cambia a estado WAITING_PROVIDER y el proveedor queda vinculado al caso. |

---

## Sección 3 — Criterios de aceptación

> Insertar como texto libre en Google Sites.
> Título sugerido en el sitio: **"3c. Criterios de aceptación del software"**

1. El 100 % de los casos de prueba CP-01 a CP-05 deben ejecutarse sin errores bloqueantes.
2. El tiempo de respuesta del dashboard principal con 100 casos cargados debe ser inferior a 3 segundos.
3. Ningún usuario con rol REQUESTER puede acceder a rutas restringidas de ANALYST o MANAGER (`/dashboard/incidents`, `/dashboard/reports`).

---

> **Nota:** Las tablas de esta página deben crearse en Google Sheets y vincularse con
> *Insertar > Hojas de cálculo* para que sean visibles al momento de calificar.
> Compartir cada hoja como "Cualquier persona con el enlace — Lector".
