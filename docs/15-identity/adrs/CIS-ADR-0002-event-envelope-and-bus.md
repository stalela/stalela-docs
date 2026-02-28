---
title: "CIS-ADR-0002: Event Envelope & Bus Strategy"
---

- **Status**: Accepted (amended 2025-01 for free-stack alignment)
- **Date**: 2024-05-01

---

## Context

Events previously varied in format and delivery mechanism, making
downstream consumption brittle.

## Decision

Adopt a unified envelope (`event-envelope.v1`) with exactly-once
semantics. The **transactional outbox** pattern guarantees reliable
publishing.

## Free-Stack Amendment (2025-01)

The original ADR referenced Kafka / SQS as the transport bus. Under
the Stalela free-stack architecture:

| Original | Current |
|----------|---------|
| Kafka / SQS | Postgres transactional outbox (`cis.cis_outbox`) |
| SNS fan-out | Vercel Cron poller delivers to subscribers |
| MessageGroupId ordering | Partition key in outbox row |
| Schema Registry (Confluent) | JSON Schema contracts in `libs/specs/` |

The envelope schema and exactly-once semantics are **unchanged**; only
the transport layer differs.

## Consequences

- All services must publish events via the outbox pipeline within the
  same database transaction as the domain write.
- Consumers can rely on consistent metadata (`eventId`,
  `traceparent`).
- Schema contracts maintained under `libs/specs/` for validation.
