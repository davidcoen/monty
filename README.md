# Monty — personal finance Monte Carlo (scaffold)

This repository is a scaffold for a server-first Next.js monorepo for a private personal finance Monte Carlo web app. It intentionally contains only the foundation: infra, scripts, Prisma setup, a placeholder app page, and minimal tests. Domain models and business logic will be added later.

Key goals
- Server-first Next.js App Router (Server Components + Server Actions)
- TypeScript, Tailwind CSS, shadcn base setup
- Prisma + PostgreSQL (docker-compose)
- Render blueprint for cloud deployment
- Vitest unit tests + Playwright e2e smoke test

Prereqs
- Node LTS (use .nvmrc), pnpm, Docker

Quick start (developer):

1. Install dependencies

```bash
pnpm i
```

2. Copy environment file

```bash
cp .env.example .env
```

3. Start Postgres locally

```bash
docker compose up -d
```

4. Initialize Prisma (prototype)

```bash
pnpm db:push
```

5. Start dev server (apps/web)

```bash
pnpm dev
```

Open http://localhost:3000 to see the placeholder page. Health endpoint: http://localhost:3000/api/health

Environment variables (example in `.env.example` in repo):
- DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance?schema=public
- NODE_ENV=development
- NEXT_PUBLIC_APP_NAME=Monty
- LOG_LEVEL=info

Placeholders for future variables (commented): AUTH_SECRET, SENTRY_DSN

Deploy to Render
- Connect this repository to Render and use `render.yaml`. The blueprint defines a Postgres instance and a web service. Ensure the web service has `DATABASE_URL` from the managed Postgres. The pre-deploy runs `pnpm db:migrate`.

Next steps (developer checklist)
- Add domain models to `packages/db/schema.prisma` and run migrations.
- Implement Monte Carlo kernel in `packages/lib/sim`.
- Add scenario CRUD pages and tests.
