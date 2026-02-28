---
title: Container Diagram
---

## CIS Container View

```mermaid
flowchart LR
  subgraph vercel[Vercel Serverless]
    middleware[Vercel Middleware<br/>JWT + Rate Limit]
    api[Next.js App Router<br/>/api/cis/v1/*]
    cron[Vercel Cron<br/>Outbox Poller]
  end
  subgraph data_plane[Data Plane]
    pg[(Supabase Postgres<br/>pgSchema cis)]
    crypto[Web Crypto API<br/>AES-256-GCM]
  end
  subgraph async_plane[Async Plane]
    outbox[(cis.cis_outbox table)]
    resend[Resend<br/>Email Notifications]
  end
  compliance{{Compliance Service}}

  middleware --> api
  api --> pg
  api --> crypto
  api --> outbox
  api --> compliance
  cron --> outbox
  cron -->|publish| cts[(CTS Consumers)]
  cron -->|publish| ledger[(Ledger Consumers)]
  resend --> sms[(SMS Provider)]
```

---

## Notes

- **Outbox poller** — A Vercel Cron job polls `cis.cis_outbox` and dispatches events to downstream consumers (CTS, Ledger) via HTTP callbacks or shared Postgres notify channels.
- The API service calls the Compliance Service synchronously for identity screening (`/api/cis/v1/identities/screen`).
- Events are written to the outbox table within the same database transaction as domain state changes, then published asynchronously.
- Verification workflows are orchestrated by a domain-layer state machine — no external workflow engine required.
- PII encryption uses Web Crypto API (AES-256-GCM) with environment-configured keys rather than an external KMS.
