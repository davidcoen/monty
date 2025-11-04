# packages/db

This package contains the Prisma schema and a PrismaClient singleton.

Commands (run from repo root):

- `pnpm db:push` — push schema to the database (fast prototyping)
- `pnpm db:migrate` — run production migrations
- `pnpm db:studio` — open Prisma Studio

Notes:
- The Prisma schema now lives at `packages/db/prisma/schema.prisma`; migrations are kept alongside it.
- The domain includes `Scenario`, `CashFlow`, and `SimulationRun` in addition to the placeholder `User`.
- Ensure `DATABASE_URL` is set in your environment or `.env`.
