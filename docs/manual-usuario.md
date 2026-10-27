# Manual de Usuario — Mesa de Servicios · Sistecrédito

- **Versión del sistema:** 1.0.0
- **Fecha:** 26 de octubre de 2026
- **Autores:** David Mesa Cortés · Ángela María Ossa Alzate
- **Institución:** Fundación Universitaria Católica del Norte

---

## Tabla de contenido

1. [Introducción](#1-introducción)
2. [Acceso al sistema](#2-acceso-al-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Navegación general](#4-navegación-general)
5. [Dashboard principal](#5-dashboard-principal)
6. [Gestión de tickets](#6-gestión-de-tickets)
7. [Incidentes](#7-incidentes)
8. [Catálogo de servicios](#8-catálogo-de-servicios)
9. [Reportes](#9-reportes)
10. [Usuarios](#10-usuarios)
11. [Health Status](#11-health-status)
12. [Ajustes de cuenta](#12-ajustes-de-cuenta)
13. [Glosario de estados, prioridades y categorías](#13-glosario-de-estados-prioridades-y-categorías)
14. [Preguntas frecuentes y solución de problemas](#14-preguntas-frecuentes-y-solución-de-problemas)
15. [Anexo técnico: puesta en marcha](#15-anexo-técnico-puesta-en-marcha)

---

## 1. Introducción

**Mesa de Servicios** es una aplicación web para registrar, dar seguimiento y resolver solicitudes de soporte (tickets) de Sistecrédito. Permite a los colaboradores reportar incidentes y pedir servicios, y a los analistas y responsables gestionar esos casos, escalarlos a proveedores externos y medir el cumplimiento del nivel de servicio (SLA).

Funciones principales:

- Registro de tickets (incidentes, solicitudes y cambios) con prioridad.
- Seguimiento del ciclo de vida del caso con historial de actualizaciones.
- Escalamiento de casos a proveedores externos.
- Vista de incidentes críticos para el equipo de soporte.
- Catálogo de servicios con tiempos de atención (SLA) de referencia.
- Reportes de métricas y gestión de usuarios para analistas y responsables.

---

## 2. Acceso al sistema

### 2.1 Requisitos

- Navegador web actualizado (Chrome, Edge, Firefox o Safari).
- Credenciales entregadas por el administrador.

### 2.2 Iniciar sesión

1. Abra la dirección del sistema (en ambiente local: `http://localhost:3000`).
2. Se muestra la pantalla `/login`. Ingrese su **correo electrónico** y **contraseña**.
3. Pulse **Ingresar**.
4. Si los datos son correctos, el sistema lo lleva al **Dashboard**.

Mensajes posibles:

| Mensaje | Causa |
|---|---|
| "Email y contraseña requeridos" | Dejó algún campo vacío. |
| "Credenciales inválidas" | Correo o contraseña incorrectos. |

La sesión dura **24 horas**. Pasado ese tiempo debe iniciar sesión de nuevo. Si intenta abrir cualquier página sin sesión activa, el sistema lo redirige al inicio de sesión.

### 2.3 Cerrar sesión

Use el menú de usuario (parte inferior de la barra lateral) y seleccione cerrar sesión. La sesión se invalida de inmediato.

### 2.4 Usuarios de demostración

Todos usan la contraseña `password123`.

| Rol | Nombre | Correo |
|---|---|---|
| Analista | David Mesacortes | david.mesacortes@sistecredito.com |
| Analista | Laura Moreno | laura.moreno@sistecredito.com |
| Analista | Felipe Gutiérrez | felipe.gutierrez@sistecredito.com |
| Analista | Camila Torres | camila.torres@sistecredito.com |
| Responsable (Manager) | Carlos Responsable | carlos.responsable@sistecredito.com |
| Solicitante | María García | maria.garcia@sistecredito.com |
| Solicitante | Juan López | juan.lopez@sistecredito.com |
| Solicitante | Ana Martínez | ana.martinez@sistecredito.com |
| Solicitante | Carlos Rodríguez | carlos.rodriguez@sistecredito.com |
| Solicitante | Sofía Pérez | sofia.perez@sistecredito.com |
| Solicitante | Diego Fernández | diego.fernandez@sistecredito.com |
| Solicitante | Elena González | elena.gonzalez@sistecredito.com |
| Solicitante | Pablo Sánchez | pablo.sanchez@sistecredito.com |

> Para una demostración completa se recomienda `david.mesacortes@sistecredito.com` (Analista), que ve los 100 casos de ejemplo. **Cambie estas credenciales en un ambiente real.**

---

## 3. Roles y permisos

El sistema tiene tres roles. Lo que ve y puede hacer depende del rol asignado.

| Capacidad | Solicitante (REQUESTER) | Analista (ANALYST) | Responsable (MANAGER) |
|---|:---:|:---:|:---:|
| Ver Dashboard | Solo sus tickets | Todos los tickets | Todos los tickets |
| Crear tickets | Sí | Sí | Sí |
| Ver detalle de un ticket | Solo los propios | Cualquiera | Cualquiera |
| Agregar comentarios | Sí | Sí | Sí |
| Cambiar estado de un ticket | No | Sí | Sí |
| Escalar a proveedor | No | Sí | Sí |
| Módulo Incidentes | No | Sí | Sí |
| Módulo Usuarios | No | Sí | Sí |
| Módulo Reportes | No | No | Sí |
| Catálogo, Health Status, Ajustes | Sí | Sí | Sí |

Si un Solicitante intenta abrir una ruta restringida (por ejemplo `/dashboard/incidents`), el sistema lo regresa al Dashboard. Si intenta abrir el ticket de otra persona, también lo regresa al Dashboard.

---

## 4. Navegación general

Al iniciar sesión verá la **barra lateral** a la izquierda y el contenido de cada módulo a la derecha.

### 4.1 Barra lateral

| Opción | Disponible para | Descripción |
|---|---|---|
| Dashboard | Todos | Resumen y lista de casos. |
| Tickets | Todos | Listado completo con filtros. |
| Incidentes | Analista, Responsable | Casos de categoría Incidente. |
| Catálogo | Todos | Servicios disponibles y SLA. |
| Reportes | Responsable | Métricas generales. |
| Usuarios | Analista, Responsable | Directorio de usuarios. |
| Health Status | Todos | Estado de la plataforma de monitoreo. |
| **Nuevo ticket** | Todos | Acceso rápido al formulario de registro. |
| Ajustes | Todos | Perfil y preferencias (junto a su nombre y rol). |

La barra lateral puede contraerse; en ese modo solo se muestran los íconos y, al pasar el cursor, el nombre de cada opción.

### 4.2 Encabezado de página

Cada módulo muestra un título, un subtítulo con datos de resumen (por ejemplo "12 resultados") y el acceso a su perfil.

---

## 5. Dashboard principal

Es la primera pantalla tras iniciar sesión.

- **Título:** "Mis solicitudes" para Solicitantes; "Casos en gestión" para Analistas y Responsables.
- **Subtítulo:** saludo, número de casos y cuántos están activos.

### 5.1 Indicadores (KPIs)

| Indicador | Qué muestra |
|---|---|
| Tickets activos | Casos en estado Abierto o En gestión. |
| SLA compliance | Porcentaje de casos Resueltos o Cerrados sobre el total mostrado. |
| Con proveedor | Casos esperando respuesta de un proveedor externo. |
| Críticos abiertos | Casos de prioridad Crítica aún sin resolver. |

### 5.2 Lista de casos

Muestra hasta los **50 casos** más relevantes, ordenados por prioridad y por última actualización. Cada fila incluye título, estado, prioridad, solicitante, analista asignado, proveedor (si fue escalado) y número de actualizaciones. Haga clic en un caso para abrir su detalle.

Un Solicitante solo ve los tickets que creó; Analistas y Responsables ven todos.

---

## 6. Gestión de tickets

### 6.1 Listado de tickets

Ruta: **Tickets** en la barra lateral.

- Pestañas por estado: **Todos, Abiertos, En gestión, Proveedor, Resueltos, Cerrados**, cada una con su contador.
- Filtro por **prioridad** (Crítica, Alta, Media, Baja), combinable con la pestaña de estado.
- Botón **+ Nuevo ticket**.
- Clic en una fila para ver el detalle.

### 6.2 Crear un ticket

1. Pulse **Nuevo ticket** (barra lateral) o **+ Nuevo ticket** (listado).
2. Complete el formulario **Registrar ticket**:

| Campo | Obligatorio | Descripción |
|---|:---:|---|
| Título | Sí | Resumen corto. Ej.: "No puedo acceder al sistema de nómina". |
| Descripción | Sí | Detalle del problema: cuándo ocurrió, qué error ve, qué estaba haciendo. |
| Tipo | Sí | **Incidente** (algo dejó de funcionar), **Solicitud** (necesito algo nuevo) o **Cambio** (modificar un sistema). |
| Prioridad | Sí | **Baja** (puede esperar), **Media** (resolver en 24 h), **Alta** (resolver en 8 h), **Crítica** (atención inmediata). |

3. Pulse **Registrar ticket →**.
4. El sistema crea el caso en estado **Abierto**, le asigna un identificador automático y lo lleva a su pantalla de detalle.

El **tiempo estimado de atención** se calcula según la prioridad:

| Prioridad | Tiempo estimado |
|---|---|
| Crítica | 2 horas |
| Alta | 8 horas |
| Media | 24 horas |
| Baja | 72 horas |

Si falta algún campo, el sistema muestra: *"Todos los campos son obligatorios: título, descripción, categoría y prioridad"*.

> **Consejo:** si llega desde el Catálogo de servicios, el formulario se abre con título, tipo y prioridad ya sugeridos; puede ajustarlos antes de registrar.

### 6.3 Detalle de un ticket

Muestra:

- Título, descripción, categoría, prioridad y estado actual.
- Tiempo estimado de atención (en horas).
- **Asignado a:** analista responsable del caso.
- Datos del solicitante.
- Información del proveedor, si el caso fue escalado.
- **Historial** cronológico de actualizaciones: quién hizo el cambio, el mensaje y el cambio de estado.

### 6.4 Actualizar el estado (Analista y Responsable)

En el panel de acciones del detalle, pestaña **Actualizar**:

1. Seleccione el nuevo estado: **Abierto, En gestión, Esp. usuario, Resuelto** o **Cerrado**.
2. Escriba un comentario describiendo la acción realizada.
3. Pulse **Guardar**.

El estado cambia, el comentario queda en el historial y, al marcar **Cerrado**, se registra la fecha de cierre.

### 6.5 Escalar a un proveedor (Analista y Responsable)

Use esta opción cuando el caso requiere soporte externo.

1. En el detalle del ticket abra la pestaña **Escalar**.
2. Elija el proveedor de la lista.
3. Escriba una nota con el contexto para el proveedor.
4. Pulse **Escalar caso**.

Resultado: el caso pasa a **Proveedor** (esperando proveedor), queda vinculado al proveedor y se registra el escalamiento en el historial.

Reglas:

- Un caso solo puede escalarse **una vez**; después de escalado, la pestaña **Escalar** desaparece. Si se intenta de nuevo: *"El caso ya fue escalado"*.
- Debe seleccionarse un proveedor; de lo contrario: *"Proveedor requerido"*.

**Proveedores disponibles**

| Proveedor | Tipo |
|---|---|
| Telco Solutions | Telecomunicaciones |
| CloudTech Services | Infraestructura |
| SecureNet | Seguridad |
| DataFlow Corp | Integración |
| Licencias SAS | Licenciamiento |
| TechService Mantenimiento | Mantenimiento |

### 6.6 Agregar un comentario

Cualquier usuario con acceso al ticket puede agregar un mensaje al historial. El mensaje no puede estar vacío (*"El mensaje es requerido"*).

### 6.7 Flujo típico de un ticket

```
Registro (Abierto) → En gestión → [Escalar a proveedor] → Resuelto → Cerrado
                         ↕
                   Esp. usuario
```

---

## 7. Incidentes

Disponible para **Analistas** y **Responsables**.

Muestra solo los casos de categoría **Incidente**, ordenados por prioridad y fecha, separados en tres grupos:

- **Críticos activos:** prioridad Crítica y no resueltos.
- **Activos:** el resto de incidentes sin resolver.
- **Resueltos:** incidentes en estado Resuelto o Cerrado.

El subtítulo indica el total y el número de críticos activos. Cada incidente muestra solicitante, analista, proveedor y actualizaciones; haga clic para abrir su detalle.

---

## 8. Catálogo de servicios

Lista los servicios más solicitados, agrupados por tipo, con una descripción, la prioridad sugerida y el **SLA de referencia**.

| Servicio | Descripción | SLA | Prioridad |
|---|---|:---:|---|
| Falla de sistema | El sistema no responde o tiene errores | 4 h | Alta |
| Acceso bloqueado | No puedo ingresar a una aplicación o recurso | 8 h | Media |
| Error en transacción | Falla en un proceso o transacción financiera | 2 h | Crítica |
| Impresora / periférico | Dispositivo físico con falla o sin configurar | 24 h | Baja |
| Nuevo usuario | Crear cuenta y permisos para colaborador | 24 h | Media |
| Instalación de software | Instalar o actualizar una aplicación | 24 h | Media |
| Acceso VPN | Configurar acceso remoto seguro | 8 h | Media |
| Equipo de cómputo | Solicitar reemplazo o nuevo equipo | 72 h | Baja |
| Actualización de sistema | Solicitar parche o versión nueva | 48 h | Media |
| Cambio de configuración | Modificar parámetros de un servicio | 24 h | Media |
| Migración de datos | Mover información entre sistemas | 72 h | Alta |
| Capacitación | Solicitar entrenamiento en una herramienta | 72 h | Baja |
| Documentación | Pedir guía o manual de un proceso | 48 h | Baja |
| Consulta general | Preguntas sobre procesos o sistemas | 24 h | Baja |

**Cómo usarlo:** haga clic en un servicio y el sistema abre el formulario de nuevo ticket con la información pre-configurada.

---

## 9. Reportes

Disponible solo para **Responsables**.

- **Indicadores:** Total de casos, SLA compliance, Resueltos y En proveedor.
- **Distribución por prioridad:** Crítica, Alta, Media y Baja.
- **Distribución por estado:** Abierto, En gestión, Proveedor, Resuelto y Cerrado.

Los valores se calculan en tiempo real con los datos del sistema. (La exportación a PDF está prevista para una versión futura.)

---

## 10. Usuarios

Disponible para **Analistas** y **Responsables**.

- Resumen por rol: **Responsables, Analistas y Solicitantes**.
- Listado con nombre, correo, departamento, rol y fecha de registro.
- Para cada usuario se muestra la cantidad de casos: los creados (si es Solicitante) o los asignados (si es Analista o Responsable).

Este módulo es de consulta; la creación y edición de usuarios se realiza por el administrador del sistema.

---

## 11. Health Status

Pantalla informativa con la **topología de servicios de monitoreo** de la plataforma: Grafana, Prometheus, Loki, Tempo, Alertmanager, Datadog y Sauron. Permite ver de un vistazo el estado de la plataforma. Se accede desde la barra lateral. La integración en tiempo real con Grafana está planificada para una versión futura.

---

## 12. Ajustes de cuenta

Desde **Ajustes** (junto a su nombre en la barra lateral) puede consultar:

| Sección | Información |
|---|---|
| Perfil | Nombre completo, correo electrónico, rol y departamento. |
| Notificaciones | Alertas de ticket asignado (activo), cambios de estado (activo), escalamientos (activo), resumen semanal (inactivo). |
| Seguridad | Último acceso, sesiones activas y autenticación de dos factores (no configurado). |

> En la versión 1.0.0 esta pantalla es de solo consulta.

---

## 13. Glosario de estados, prioridades y categorías

### Estados

| Estado en pantalla | Significado |
|---|---|
| Abierto (OPEN) | Registrado, pendiente de atención. |
| En gestión (IN_PROGRESS) | Un analista lo está trabajando. |
| Esp. usuario (WAITING_USER) | Se espera información o respuesta del solicitante. |
| Proveedor (WAITING_PROVIDER) | Escalado; se espera respuesta del proveedor externo. |
| Resuelto (RESOLVED) | Solución aplicada. |
| Cerrado (CLOSED) | Caso finalizado; se registra fecha de cierre. |

### Prioridades

| Prioridad | Atención esperada |
|---|---|
| Crítica | Inmediata (estimado 2 h). |
| Alta | 8 h. |
| Media | 24 h. |
| Baja | 72 h. |

### Categorías

| Categoría | Uso |
|---|---|
| Incidente | Algo dejó de funcionar. |
| Solicitud | Necesito algo nuevo. |
| Cambio | Modificar un sistema. |

---

## 14. Preguntas frecuentes y solución de problemas

**No puedo iniciar sesión.**
Verifique el correo y la contraseña. Si el mensaje es "Credenciales inválidas", solicite el restablecimiento al administrador.

**El sistema me devuelve al inicio de sesión.**
Su sesión expiró (dura 24 horas). Inicie sesión nuevamente.

**No veo el menú Incidentes, Usuarios o Reportes.**
Estos módulos dependen del rol. Incidentes y Usuarios son para Analistas y Responsables; Reportes solo para Responsables.

**No veo el ticket de un compañero.**
Los Solicitantes solo ven sus propios tickets.

**No puedo cambiar el estado ni escalar un ticket.**
Estas acciones son exclusivas de Analistas y Responsables.

**No aparece la pestaña "Escalar".**
El caso ya fue escalado; solo se permite un escalamiento por ticket.

**No puedo registrar el ticket.**
Complete título, descripción, tipo y prioridad.

---

## 15. Anexo técnico: puesta en marcha

Dirigido a quien instala o administra el sistema.

**Tecnologías:** Next.js 16 (App Router), React 19, Prisma 7 con SQLite, Tailwind CSS 4, TypeScript.

**Comandos**

```bash
npm install          # instalar dependencias
npm run dev          # iniciar en modo desarrollo (http://localhost:3000)
npm run build        # compilar para producción
npm run start        # ejecutar la versión compilada
npm run seed         # cargar datos de demostración
```

**Datos de demostración (seed):** 100 casos, 8 solicitantes, 4 analistas, 1 responsable y 6 proveedores.

**Seguridad:** las contraseñas se almacenan con hash (bcrypt) y la sesión se guarda en una cookie `httpOnly` con vigencia de 24 horas.

**Endpoints de la API** (requieren sesión activa)

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/api/auth/login` | Iniciar sesión. |
| POST | `/api/auth/logout` | Cerrar sesión. |
| GET | `/api/users/me` | Datos del usuario autenticado. |
| GET | `/api/cases` | Listar casos (los Solicitantes solo ven los propios). |
| POST | `/api/cases` | Crear un caso. |
| GET | `/api/cases/{id}` | Detalle de un caso con historial. |
| PATCH | `/api/cases/{id}` | Actualizar estado o asignación (Analista/Responsable). |
| POST | `/api/cases/{id}/updates` | Agregar un comentario. |
| POST | `/api/cases/{id}/escalate` | Escalar a proveedor (Analista/Responsable). |
| GET | `/api/providers` | Listar proveedores. |

Una colección de Postman está disponible en `docs/mesa-de-servicios.postman_collection.json`.

---

*Fin del manual — Mesa de Servicios v1.0.0*
