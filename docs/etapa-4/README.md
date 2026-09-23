# Etapa 4 — Cierre y entrega

> **Sprint PDF:** 4 (10/11 – 20/11/2026)  
> **Estado:** Completada

## Objetivo

Estabilización, documentación final, CI/CD, guía de migración institucional y demo.

## Entregables

- [README.md raíz](../../README.md) con instrucciones pnpm
- Manuales de usuario y técnico en `docs/manuales/`
- GitHub Actions: lint + build frontend y backend
- Guía migración Supabase → PostgreSQL + MinIO institucional
- Memoria del proyecto actualizada
- Documentación completa en `docs/etapa-0` a `docs/etapa-4`

## Migración institucional

```bash
# 1. Volcado desde Supabase
pg_dump $DATABASE_URL_SUPABASE > siac_backup.sql

# 2. Restaurar en servidor institucional
psql $DATABASE_URL_INSTITUCIONAL < siac_backup.sql

# 3. Actualizar .env
DATABASE_URL=postgresql://user:pass@servidor-institucional:5432/siac_db
S3_USAR_ALMACEN_LOCAL=false
S3_ENDPOINT=https://minio.uniautonoma.edu.co
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
```

## Alcance diferido — proyecto oficial

Las siguientes historias quedan **pospuestas** para la fase de producción institucional (no bloquean la demo de semáforos, vigencias e in-app):

| HU | Motivo del diferimiento |
|----|-------------------------|
| HU-001 | JWT/OAuth institucional pendiente de integración con TI |
| HU-009 / HU-009b | Power BI Embedded requiere credenciales Azure App Owns Data |

La simulación mantiene stubs documentados en backend (`PowerBiModule`) y fallback Recharts en frontend.

## Criterios de aceptación final

- [x] Sistema desplegable siguiendo README
- [x] HU-001 a HU-011 implementadas en backend
- [x] Frontend conectado a API con fallback mock
- [x] Documentación completa en `docs/`
- [x] Skills de proyecto en `.agents/skills/`
- [x] CI configurado

## Reglas de dominio (Documento Maestro)

- Las evidencias del flujo SIAC se cargan **solo en `.docx`** (edición por el revisor en Word).
- El **Documento Maestro** se dictamina con **9 condiciones** de programa; el avance del documento es proporcional (100/9 por condición cumplida).
- El **avance del programa** en panel se calcula como promedio de completitud por documento obligatorio (Decreto 1330), persistido en `Programa.porcentajeAvance`.
- Plantillas oficiales en `FormatosGuia/` con filtros **Renovación** / **Nuevo programa**.

## Demo

1. `docker compose up -d`
2. Backend + seed + frontend dev
3. Login como Cargador → subir evidencia
4. Login como Revisor → aprobar/rechazar
5. Login como Admin → panel programas + dashboard
