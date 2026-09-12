# Etapa 0 — Inception (Completada)

> **Periodo:** 20/08/2026 – 02/09/2026  
> **Estado:** Completada — retrospectivo  
> **Referencia:** [SIAC_Documentacion_Proyecto.pdf](../../Documentos/SIAC_Documentacion_Proyecto.pdf)

## Objetivo

Alinear equipo, cliente (Planeación CUAC) y docente sobre alcance, arquitectura y plan de sprints antes de escribir código de producción.

## Entregables realizados

| Artefacto | Ubicación | Estado |
|-----------|-----------|--------|
| Acta de constitución (F-00) | PDF unificado | ✅ |
| Propuesta técnica (F-01) | PDF unificado | ✅ |
| Especificación de requisitos (F-02) | PDF unificado | ✅ |
| Impact Mapping | PDF cap. 4 | ✅ |
| Product Vision Board | PDF cap. 4 | ✅ |
| ProtoPersonas (María, Par MEN) | PDF cap. 4 | ✅ |
| Not List (alcance congelado) | PDF cap. 4 | ✅ |
| Prototipo Figma mediana fidelidad | Enlace en PDF | ✅ |
| Prototipo Next.js alta fidelidad | `Frontend/frontend/` | ✅ |
| Memoria del proyecto | `Frontend/MEMORIA_PROYECTO.md` | ✅ |
| Estructura normativa Decreto 1330 | `Documentos/estructura_decreto_etapas_documentos.md` | ✅ |

## Prototipo frontend (adelanto visual)

El prototipo implementa **19 rutas** con datos mock en `sessionStorage`:

- **3 roles:** Cargador, Revisor, Administrador/Par académico
- **8 vistas admin** + cargador + revisor
- CRUD mock de etapas, carpetas y documentos normativos
- Login estilo Moodle CUAC con credenciales demo

## Historias de usuario — alcance del semestre

| ID | Historia | Sprint planificado |
|----|----------|-------------------|
| HU-001 | Inicio de sesión JWT | Sprint 1 (Etapa 1) |
| HU-002 | Pantalla de inicio por rol | Sprint 1 (Etapa 1) |
| HU-003 | Carga de evidencias con metadatos | Sprint 1–2 |
| HU-004 | CRUD de evidencias | Sprint 2 (Etapa 2) |
| HU-005 | Biblioteca y CRUD de plantillas | Sprint 2 (Etapa 2) |
| HU-006 | Aprobar o rechazar evidencias | Sprint 3 (Etapa 3) |
| HU-007 | Semáforo de vigencias y alertas | Sprint 3 (Etapa 3) |
| HU-008 | Búsqueda y filtros en URL | Sprint 2 (Etapa 2) |
| HU-009 | Métricas embebidas Power BI | Sprint 3 (Etapa 3) |
| HU-010 | Panel de programas | Sprint 2 (Etapa 2) |
| HU-011 | Roles y permisos | Sprint 1 (Etapa 1) |

## Checklist de validación (Etapa 0)

- [x] Problemática y justificación documentadas
- [x] Arquitectura monolito en capas (NestJS + Next.js) definida
- [x] Stack tecnológico acordado (PostgreSQL, Prisma, S3, JWT)
- [x] Patrones: Repository, Adapter, DTO, DI, Módulos
- [x] Prototipo UI validable con stakeholders
- [x] Not List congelada (sin SACES, sin encuestas, sin app móvil)
- [x] Cronograma 4 sprints + cierre definido

## Decisiones clave

1. **No microservicios** — plazo y equipo de 2 personas
2. **Frontend y backend separados** — API REST reutilizable
3. **pnpm** como gestor de paquetes (no npm)
4. **Código y UI en español**
5. **ClickUp solo como referencia** — esta simulación no llena tareas externas

## Próxima etapa

→ [Etapa 1 — Fundación técnica](../etapa-1/README.md): NestJS + Prisma + Auth JWT + inicio HU-003
