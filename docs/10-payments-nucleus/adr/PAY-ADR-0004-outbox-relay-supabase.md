# ADR-0004: Outbox Relay on Supabase

**Status:** Accepted  
**Date:** 2026-02-27  
**Supersedes:** — (complements ADR-0001: Outbox Pattern Mandatory)

---

## Context

ADR-0001 mandates the transactional outbox pattern for event delivery. The TypeScript platform runs on **Supabase managed Postgres 17** deployed to Vercel as serverless functions. We need a relay mechanism that:

1. Reads pending rows from `payments.outbox_transfers` and `ledger.outbox_ledger`.
2. Publishes them to downstream consumers (rail gateways, ledger posting engine, webhooks).
3. Marks rows as dispatched or failed.
4. Works within Supabase's managed infrastructure constraints (no long-running processes, no custom extensions beyond what Supabase provides).

## Decision

Use **Supabase Database Webhooks** as the primary relay, with **`pg_cron` + `pg_net`** as the fallback for self-hosted environments.

### Primary: Database Webhooks (Supabase-hosted)

- Configure a Supabase Database Webhook on `INSERT` for each outbox table.
- The webhook sends a POST to a Next.js API route (`/api/internal/outbox-relay`).
- The relay route reads the outbox entry, dispatches the event, and marks the row as `SENT`.
- The relay route is protected by an internal API key (`X-Outbox-Secret` header), not JWT.

### Fallback: pg_cron + pg_net (self-hosted)

- Enable the `pg_cron` and `pg_net` extensions.
- Schedule a cron job every 10 seconds: `SELECT cron.schedule('outbox-relay', '*/10 * * * * *', $$...$$)`.
- The job queries pending outbox rows and POSTs them via `pg_net.http_post()`.

### Outbox Table Schema

Both `payments.outbox_transfers` and `ledger.outbox_ledger` share this structure:

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `uuid` PK | Row identifier |
| `payload` | `jsonb` | Event envelope (conforms to `EventEnvelope` schema) |
| `status` | `text` | `PENDING` → `SENT` or `FAILED` |
| `created_at` | `timestamptz` | Insertion time |
| `sent_at` | `timestamptz` | Dispatch time |
| `retry_count` | `integer` | Number of dispatch attempts |

### Garbage Collection

- Rows with `status = 'SENT'` older than 7 days are purged by a daily `pg_cron` job.
- Rows with `status = 'FAILED'` and `retry_count >= 5` are moved to a dead-letter log and alerted via Sentry or PagerDuty.

## Alternatives Considered

| Alternative | Why Rejected |
|---|---|
| Direct HTTP publish inside transaction | Not atomic — if HTTP call fails after commit, event is lost. If before commit, stale events are published. |
| Postgres `LISTEN/NOTIFY` | Unreliable over connection poolers (Supabase Supavisor drops notifications). Not persistent. |
| CDC (Change Data Capture) via Debezium | Requires infrastructure Supabase doesn't provide. Overkill for current scale. |
| Supabase Realtime (Postgres Changes) | Designed for client subscriptions, not server-to-server dispatch. No retry semantics. |

## Consequences

### Positive

- **Atomic**: Outbox row is written in the same DB transaction as the state change — guaranteed consistency.
- **Reliable**: Database Webhooks have built-in retry with exponential backoff.
- **Observable**: Outbox tables provide a queryable audit trail of all events.
- **No infrastructure**: Works entirely within Supabase managed services.

### Negative

- **Polling latency**: Database Webhooks fire on `INSERT` with low latency (~100ms), but pg_cron fallback has up to 10s delay.
- **Table bloat**: Outbox tables grow unbounded without GC — mitigated by the daily purge job.
- **Webhook reliability**: Supabase Database Webhooks are in GA but have occasional delivery delays under load.

## References

- [ADR-0001: Outbox Pattern Mandatory](ADR-0001-events-outbox.md)
- [Outbox table schemas](../../../packages/db/src/schema/payments.ts) — `outbox_transfers`
- [Event Envelope schema](../../../libs/specs/transfer/event-envelope.schema.json)
- [Supabase Database Webhooks docs](https://supabase.com/docs/guides/database/webhooks)
