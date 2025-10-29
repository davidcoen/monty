# packages/db

This package contains the Prisma schema and a PrismaClient singleton.

Commands (run from repo root):

- `pnpm db:push` — push schema to the database (fast prototyping)
- `pnpm db:migrate` — run production migrations
- `pnpm db:studio` — open Prisma Studio

Notes:
- Currently the schema contains only a placeholder `User` model. Domain models will be added later.
- Ensure `DATABASE_URL` is set in your environment or `.env`.
