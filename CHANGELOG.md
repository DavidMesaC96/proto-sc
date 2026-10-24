# Changelog — Mesa de Servicios · Sistecrédito

Todos los cambios notables de este proyecto se documentan en este archivo.
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).
Versionado siguiendo [Semantic Versioning](https://semver.org/lang/es/).

---

## [v1.0.0] — 2026-10-24

### Agregado
- Módulo de autenticación: inicio de sesión con email y contraseña, sesión por cookie segura
- Módulo de tickets: registro, listado, detalle y cambio de estado de casos
- Módulo de incidentes: vista filtrada de casos críticos
- Módulo de catálogo de servicios: referencia de servicios disponibles
- Módulo de reportes: métricas de SLA y casos por estado
- Módulo de configuración de usuario: perfil, rol y departamento
- Dashboard principal con KPIs: tickets activos, SLA compliance, casos con proveedor, críticos abiertos
- Sidebar de navegación con logo Sistecrédito, Health Status (Sauron) y acceso rápido a nuevo ticket
- Página Health Status con topología de servicios (Grafana, Prometheus, Loki, Tempo, Datadog, Sauron)
- Sistema de escalamiento a proveedores externos con notas y seguimiento
- Roles de usuario: REQUESTER, ANALYST, MANAGER con vistas diferenciadas
- Seed de datos: 100 casos, 8 solicitantes, 4 analistas, 1 manager, 6 proveedores
- Sistema de diseño visual Sistecrédito: paleta `#002B7A` / `#00C853`, pill buttons, cards con sombra suave
- Fuentes responsivas con `clamp()` adaptadas a diferentes tamaños de pantalla

### Tecnologías
- Next.js 16.4.3 (App Router)
- React 19
- Prisma 7 + SQLite
- Tailwind CSS v4
- TypeScript 7
- bcryptjs para hash de contraseñas

### Configuración
- Repositorio: https://github.com/DavidMesaC96/proto-sc
- Rama principal: `main`
- Rama de desarrollo: `feature/develop`
- Rama de pruebas: `feature/qa`
- Tag: `v1.0.0`

---

## [Sin lanzar]

### Por agregar
- Integración con Grafana para Health Status en tiempo real
- Notificaciones por correo al cambiar estado de un ticket
- Exportación de reportes a PDF
- Autenticación con Active Directory (SSO corporativo)
