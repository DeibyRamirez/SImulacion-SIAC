# Etapa 1 — Fundación técnica

> **Sprint PDF:** 1 (03/09 – 23/09/2026)  
> **Historias:** HU-001, HU-002, HU-011, inicio HU-003  
> **Estado:** Completada

## Objetivo

Establecer infraestructura backend real, autenticación JWT, modelo de datos y primera carga de evidencias.

## Entregables

### Backend (`backend/`)

- Scaffold NestJS 10 + pnpm + TypeScript + Jest
- Prisma schema con entidades: Usuario, Programa, Evidencia, Plantilla, AnexoVigencia, AlertaInApp, Estructura normativa
- `AuthModule`: JWT + Passport, dominio `@uniautonoma.edu.co`
- `UsuariosModule`: HU-011 — asignación de roles
- `DocumentsModule`: upload multipart → almacén local/S3 + PostgreSQL (inicio HU-003)
- Patrón Repository en todos los módulos de datos
- Guards por rol (`RolesGuard`) y RN-001 (`SoloValidadosGuard`)
- Semilla de datos (`prisma/semilla.ts`) con 3 usuarios demo
- Tests unitarios auth (`auth.service.spec.ts`)

### Frontend

- Capa `lib/servicios/` con cliente HTTP JWT
- `ProveedorSesion` conectado a API real + fallback mock
- `.env.local` con `NEXT_PUBLIC_API_URL`

### DevOps

- `docker-compose.yml` — PostgreSQL 14 + MinIO
- `.env.example` documentado en backend

## Endpoints implementados

| Método | Ruta | Descripción | HU |
|--------|------|-------------|-----|
| POST | `/api/auth/login` | Login JWT | HU-001 |
| GET | `/api/auth/perfil` | Perfil autenticado | HU-001 |
| GET | `/api/usuarios` | Listar usuarios (Admin) | HU-011 |
| PATCH | `/api/usuarios/:id/rol` | Cambiar rol | HU-011 |
| POST | `/api/evidencias` | Cargar evidencia | HU-003 |
| GET | `/api/evidencias` | Listar evidencias | HU-003 |

## Criterios de aceptación

- [x] Login institucional emite JWT; sin token → 401
- [x] Cada rol ve su inicio (UI existente + redirección por rol)
- [x] Cargador puede subir PDF/Excel con metadatos → Borrador en PG
- [x] Guards impiden acciones según rol
- [x] `pnpm run build` frontend OK
- [x] Tests auth backend pasan

## Comandos

```bash
docker compose up -d
cd backend && pnpm install && pnpm prisma:generate && pnpm prisma:migrate && pnpm prisma:seed && pnpm start:dev
cd Frontend/frontend && pnpm dev
```
