# Calidad del Software — Mesa de Servicios · Sistecrédito

> **Página en Google Sites:** `2 - Calidad`
> Copiar cada sección en el orden indicado dentro de esa página.

---

## Paso 1 — Modelo de calidad

> Insertar como texto libre en Google Sites.
> Título sugerido: **"Modelo de calidad adoptado"**

**Modelo:** ISO/IEC 25010:2023 — Systems and software Quality Requirements and Evaluation (SQuaRE)

**Justificación (≤ 100 palabras):**

La ISO/IEC 25010:2023 es el estándar internacional más completo para evaluar la calidad de productos software. Se adoptó porque define características medibles y aplicables directamente a sistemas de gestión de servicios como la Mesa de Servicios de Sistecrédito, permitiendo evaluar tanto la experiencia del usuario final como la solidez técnica del sistema. Su estructura jerárquica facilita la selección de características prioritarias según el contexto del proyecto (Organización Internacional de Normalización [ISO], 2023).

---

## Paso 1 — Características del modelo

> Insertar como tabla desde Google Sheets (Insertar > Hojas de cálculo).
> Título sugerido: **"Características seleccionadas del modelo ISO/IEC 25010:2023"**

| Característica del modelo | Por qué es relevante para el proyecto | Funcionalidad o módulo donde aplica |
|---|---|---|
| Usabilidad | Usuarios de distintos departamentos (Finanzas, RRHH, Logística) deben poder registrar y consultar tickets sin capacitación previa | Formulario de nuevo ticket (`/dashboard/cases/new`) y dashboard principal |
| Fiabilidad | Los tickets críticos no pueden perderse ni quedar sin estado. El sistema debe garantizar que cada caso registrado persiste correctamente en la base de datos | Módulo de gestión de casos y API `/api/cases` |
| Mantenibilidad | El equipo técnico debe poder agregar nuevos estados, roles o módulos sin romper la funcionalidad existente | Esquema de base de datos (Prisma), API REST y componentes reutilizables del frontend |

---

## Paso 2 — Métricas de calidad

> Insertar como tabla desde Google Sheets (Insertar > Hojas de cálculo).
> Título sugerido: **"Métricas de calidad definidas"**

| ID | Métrica | Característica asociada | Cómo se mide | Herramienta | Umbral de aceptación |
|---|---|---|---|---|---|
| M-01 | Tasa de éxito en registro de tickets | Fiabilidad | (Tickets registrados exitosamente / intentos totales de registro) × 100 | Logs de la API Next.js + Prisma | ≥ 98 % |
| M-02 | Tiempo de carga del dashboard | Usabilidad | Tiempo en milisegundos desde la solicitud HTTP hasta el renderizado completo de la página con 100 casos | Chrome DevTools (pestaña Network) | ≤ 3 000 ms |
| M-03 | Cobertura de rutas protegidas | Mantenibilidad | (Rutas con validación de rol implementada / total de rutas privadas) × 100 | Revisión manual del middleware de autenticación en `lib/auth.ts` | 100 % |

---

## Referencias de esta página

> Incluir en la página **8 - Referencias** del sitio.

Organización Internacional de Normalización. (2023). *ISO/IEC 25010:2023 — Systems and software engineering — Systems and software Quality Requirements and Evaluation (SQuaRE) — Product quality model*. ISO. https://www.iso.org/standard/78181.html

---

> **Nota para Google Sites:**
> - Las dos tablas deben crearse en Google Sheets y vincularse con *Insertar > Hojas de cálculo*.
> - La justificación va como bloque de texto antes de las tablas.
> - La cita APA de la justificación debe aparecer también en la página Referencias.
