---
title: Data Retention
---

Retention policies comply with POPIA, GDPR, and local regulations.

---

## Identity Data

- Active identities retained for lifetime of account plus 5 years.
- Suspended identities reviewed every 12 months for potential
  deletion.
- PII erased 30 days after erasure-request completion.

## Consent Records

- Stored in **append-only Postgres tables** with Row-Level Security
  for 7 years.
- Immutable hash chains ensure tamper evidence.

## Verification Artifacts

| Artifact | Retention | Notes |
|----------|-----------|-------|
| Document images | 2 years | Extended if legal hold applies. |
| Liveness recordings | 90 days | Deleted sooner if tenant opts out. |
| Provider responses | 5 years | Metadata only — no raw documents. |

## API Logs

- Standard logs retained 30 days; aggregated metrics kept 13 months.
- Access logs anonymized when exported to analytics.

## Deletion Pipeline

- Erasure queue processed nightly via Vercel Cron.
- Downstream systems receive `erasure.completed` callbacks through
  the transactional outbox.
- Audit report generated per ticket and stored for regulators.

```mermaid
flowchart LR
    A[Erasure request] --> B[Mark PII for deletion]
    B --> C[Nightly Cron job]
    C --> D[Purge PII blobs]
    D --> E[Emit erasure.completed]
    E --> F[Downstream cleanup]
    F --> G[Archive audit report]
```
