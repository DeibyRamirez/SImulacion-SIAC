# Autenticación, roles y endpoints (SIAC)

Auditoría del flujo actual **sin registro público**. Los usuarios se crean con `POST /usuarios` (solo **SuperAdmin**).

## Flujo de sesión

| Paso | Backend | Frontend |
|------|---------|----------|
| Login | `POST /auth/login` — dominio institucional, JWT | `iniciarSesionApi` → `guardarToken` en `cliente-api.ts` |
| Perfil | `GET /auth/perfil` — `AuthGuard('jwt')`, usuario activo vía `JwtStrategy` | `proveedor-sesion.tsx` restaura sesión al cargar |
| Logout | (stateless) | `cerrarSesionApi` elimina token |
| Google OAuth | `POST /auth/google` → **501** Not Implemented | UI login muestra error si el usuario intenta Google |

## Roles (`RolUsuario`)

- **Cargador** — carga evidencias (.docx), borrador / envío a revisión.
- **Revisor** — bandeja y dictamen (checklist documento maestro).
- **Administrador** — programas, vigencias, plantillas, métricas, estructura.
- **SuperAdmin** — gestión de usuarios.
- **ParAcademico** — lectura acotada (p. ej. plantillas solo vigentes).

El backend aplica `AuthGuard('jwt')` + `RolesGuard` en controladores sensibles. Donde no hay `@Roles()` en un método, cualquier usuario autenticado puede llamarlo; la **autorización fina** (solo sus evidencias, etc.) queda en el servicio.

## Matriz rol × recurso (resumen)

### Auth

| Endpoint | Cargador | Revisor | Admin | SuperAdmin |
|----------|:--------:|:-------:|:-----:|:----------:|
| `POST /auth/login` | ✓ | ✓ | ✓ | ✓ |
| `GET /auth/perfil` | ✓ | ✓ | ✓ | ✓ |
| `POST /auth/google` | 501 | 501 | 501 | 501 |

### Usuarios

| Endpoint | Cargador | Revisor | Admin | SuperAdmin |
|----------|:--------:|:-------:|:-----:|:----------:|
| `GET /usuarios` | — | — | ✓ | ✓ |
| `POST /usuarios` | — | — | — | ✓ |
| `PATCH /usuarios/:id` | — | — | — | ✓ |

### Evidencias (`/evidencias`)

| Operación | Roles explícitos en controlador |
|-----------|----------------------------------|
| `POST /` crear | Cargador |
| `GET /`, `GET /:id`, descarga, contenido, historial, versiones, evaluaciones | JWT (filtro por rol en servicio) |
| `PATCH /:id`, `PATCH /:id/archivo`, `DELETE /:id` | Cargador |
| `POST /:id/enviar-revision` | Cargador |
| `POST /:id/dictamen` | Revisor |

### Plantillas (`/plantillas`)

| Operación | Roles |
|-----------|--------|
| `GET /` listar | JWT (Cargador/ParAcadémico: solo vigentes) |
| `GET /:id/descargar`, `GET /:id/contenido` | JWT |
| `POST /`, `PATCH /:id`, `PATCH /:id/archivo`, `DELETE /:id` | Administrador, Revisor |

### Programas, vigencias, métricas

- `POST /programas` — Administrador, SuperAdmin.
- Vigencias: escritura principalmente Administrador; algunas lecturas Revisor.
- `GET /metricas/*` — Revisor, Administrador.
- `GET /powerbi/*` — Administrador.

### Otros

- `GET /busqueda` — JWT (sin rol fijo).
- `GET /notificaciones` — JWT.
- Ingesta Power BI — Cargador, Administrador.

## Frontend (rutas)

- `guardia-sesion.tsx` / layout `(app)` exigen sesión y rol acorde a la ruta (`/cargador`, `/revisor`, `/administrador`, `/superadmin`).
- Modo mock (`NEXT_PUBLIC_API_URL` vacío): datos en `localStorage`; no sustituye guards del backend en producción.

## Brechas conocidas / decisiones

1. **OAuth Google** — pendiente ADR-003; no exponer como flujo productivo hasta backend implementado.
2. **Registro público** — no existe; correcto para el alcance actual.
3. **Previsualización .docx** — usar `GET .../contenido` con Bearer (proxy backend), no URL firmada directa en el navegador (CORS).

## Prueba manual rápida

1. Login por cada rol semilla.
2. Cargador: `POST /evidencias` → 201; Revisor: mismo token no debe crear (403).
3. Revisor: `POST /evidencias/:id/dictamen`; Cargador no debe dictaminar (403).
4. Sin token: `GET /auth/perfil` → 401.
