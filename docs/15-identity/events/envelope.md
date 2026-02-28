---
title: Event Envelope
---

CIS emits events through a **transactional outbox** pattern. Events are written to the `cis.cis_outbox` table in the same database transaction as the domain state change, then published asynchronously by a polling worker. Consumers must validate signatures, deduplicate by `eventId`, and respect ordering by partition key.

## Envelope Schema

```json
{
  "envelope": {
    "v": 1,
    "eventId": "uuid",
    "type": "identities.verified",
    "occurredAt": "2025-11-03T10:15:01Z",
    "tenantId": "tnt_za",
    "traceparent": "00-..."
  },
  "key": { "identityId": "id_123" },
  "payload": { "level": "KYC_BASIC", "method": "provider:veriff" }
}
```

- `envelope.v` — Version of the envelope format (currently `1`).
- `envelope.eventId` — UUID used for deduplication.
- `envelope.type` — Topic (e.g., `identities.created`).
- `envelope.traceparent` — Trace context for distributed tracing.
- `key` — Partition key fields (identity or organization).
- `payload` — Event-specific attributes.

---

## Signing

Events can be optionally signed using HMAC-SHA256. When enabled, the envelope includes `signature` and `keyId`. Verify the signature using the shared secret stored in the environment configuration.

---

## Ordering & Delivery

- Partition key equals `identityId` or `orgId`, ensuring per-subject ordering.
- Deterministic event ID equals `eventId`, enabling exactly-once consumption by downstream processors.
- Retention: 7 days minimum in the outbox table before archival.

---

## Replay

Use `/api/cis/v1/events/replay` to rehydrate missed events. Provide `eventId` or time ranges along with `tenantId`.
