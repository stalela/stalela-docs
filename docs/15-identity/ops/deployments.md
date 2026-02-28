---
title: Deployments
---

CIS deploys as part of the **stalela-platform** monorepo on Vercel with
Supabase Postgres as the data tier.

---

## Vercel Deployment

- **Trigger** — Push to `main` auto-deploys via Vercel CI. Preview
  deployments created for every pull request.
- **Rollback** — One-click rollback in the Vercel dashboard to any
  previous production deployment.
- **Edge functions** — Middleware (JWT validation, tenant extraction)
  runs at the Edge; API route handlers execute in Vercel Serverless
  Functions (Node.js runtime).

## Database Migrations

- Managed via **Supabase CLI** (`npx supabase db push`).
- Migration files live in `supabase/migrations/` inside the monorepo.
- Online migrations only; long-lock DDL executed during scheduled
  maintenance windows with `ALTER … ADD COLUMN … DEFAULT` patterns.

## Disaster Recovery

- Supabase provides **Point-in-Time Recovery (PITR)** with continuous
  WAL archiving.
- `recovery_point_objective` = 5 minutes,
  `recovery_time_objective` = 30 minutes.
- Quarterly failover drills ensure automation works.

## Infrastructure as Code

- Vercel project settings managed through `vercel.json` and the Vercel
  dashboard.
- Sensitive values stored as **Vercel Environment Variables** (encrypted
  at rest); never committed to the repository.
- Supabase project configuration managed via `supabase/config.toml`.

## Environment Promotion

| Environment | Branch   | URL                                    |
|-------------|----------|----------------------------------------|
| Preview     | PR       | `stalela-platform-<hash>.vercel.app`   |
| Staging     | `staging`| `staging.stalela-platform.vercel.app`  |
| Production  | `main`   | `stalela-platform.vercel.app`          |
