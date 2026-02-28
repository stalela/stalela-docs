---
title: Architecture Overview
description: CIS deployment topology and integration model for the Stalela free stack.
---

## Deployment Tiers

CIS runs as part of the stalela-platform monorepo, deployed as Vercel serverless functions backed by Supabase Postgres. Each tenant maps to a logical partition with explicit residency and encryption boundaries.

| Tier | Components | Scaling Notes |
| --- | --- | --- |
| **Edge** | Vercel Edge Middleware (rate limits, bot defense, JWT extraction) | Auto-scaling built into Vercel Edge Network. |
| **App** | Next.js API Routes (`/api/cis/v1/*`), background Vercel Cron jobs | Serverless auto-scaling; WebAuthn attestation performed at this layer. |
| **Data** | Supabase Postgres (`pgSchema('cis')`), Web Crypto API (PII encryption) | Postgres partitioned by tenant; PII columns encrypted with tenant-specific keys via `packages/crypto/`. |
| **Async** | Postgres transactional outbox, Vercel Cron (outbox polling) | Outbox workers poll and publish with exactly-once semantics. |

---

## Request Flow

1. Requests terminate at Vercel Edge Middleware, which extracts JWT and injects `x-tenant-id`, `x-user-id` headers.
2. App layer (Next.js API Routes) authenticates credentials, reads/writes Supabase Postgres via Drizzle ORM.
3. Mutations enqueue event records in the `cis.cis_outbox` table with deterministic payload hashes.
4. Vercel Cron-triggered outbox poller publishes outbox entries, partitioned by `identityId` or `orgId`.
5. Downstream subscribers (Compliance, CTS, Ledger) consume and acknowledge events.

---

## High Availability

- Supabase Postgres with point-in-time recovery (RPO ~5 minutes).
- Vercel serverless functions auto-scale across global edge network.
- Outbox poller monitors lag and emits metrics when `lag_seconds > 30`.

---

## Resilience Features

- Circuit breakers on Compliance and CTS API calls.
- Request hedging for factor verification providers after 300 ms.
- Outbox workers monitor lag and emit metrics when `lag_seconds > 30`.
- Automatic quarantine of identities with repeated auth failures (configurable policy).

---

## Observability Hooks

- Structured logging (JSON) with `identityId`, `orgId`, `tenantId`, `correlationId`.
- Metrics: `cis_auth_latency`, `cis_verification_duration`, `cis_outbox_lag_seconds`.
- Tracing: spans around credential verification, policy evaluation, and outbox publish.

---

## Integration Map

- **Compliance** — synchronous verification checks, asynchronous decisions.
- **CTS** — consumes `identities.*` and `auth.*` events to calibrate transaction limits.
- **Ledger** — references canonical org data for financial account ownership.
- **Notification service** — Resend (email via `packages/email/`) for factor challenges.

Understanding these building blocks helps teams design new features without violating CIS guarantees. For deeper component details, continue to [container topology](../architecture/container.md).
