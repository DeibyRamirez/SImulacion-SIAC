# SIAC — Sistema Interno de Aseguramiento de la Calidad

Simulación del proyecto SIAC para la Corporación Universitaria Autónoma del Cauca (CUAC).

## Estructura

```text
Simulacion_SIAC/
├── backend/          # API NestJS + Prisma + PostgreSQL
├── Frontend/frontend/ # Next.js 16 App Router
├── docs/             # Documentación por etapa
├── Documentos/       # Documentación institucional
└── docker-compose.yml
```

## Requisitos

- Node.js 20 LTS
- pnpm 10+
- Docker (PostgreSQL)

## Inicio rápido

```bash
# 1. Base de datos
docker compose up -d
# Nota: PostgreSQL SIAC usa puerto 5433 (5432 suele estar ocupado por PostgreSQL local en Windows)

# 2. Backend
cd backend
pnpm install
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm start:dev

# 3. Frontend (otra terminal)
cd Frontend/frontend
pnpm install
pnpm dev
```

- Frontend: http://localhost:3000
- API: http://localhost:3001/api

## Credenciales demo

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Cargador | maria.cargadora@uniautonoma.edu.co | Cargador2026 |
| Revisor | revisor.calidad@uniautonoma.edu.co | Revisor2026 |
| Administrador | admin.planeacion@uniautonoma.edu.co | Admin2026 |

## Documentación

Ver [docs/](docs/) para documentación por etapa y [Frontend/MEMORIA_PROYECTO.md](Frontend/MEMORIA_PROYECTO.md) para memoria viva del proyecto.
