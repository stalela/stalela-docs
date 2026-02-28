---
title: Idempotency
---

Idempotency ensures safe retries for write operations.

---

## Header Semantics

| Header | Description |
|--------|-------------|
| `Idempotency-Key` | Client-supplied UUID per unique mutation. |
| `Idempotency-Expiry` | Optional TTL in seconds for stored responses (default 24 h). |

## Storage

- Keys stored in Postgres (`cis.idempotency_keys` table) with a hash
  of the request body.
- On conflict, the stored response is returned. If the payload
  differs from the original, a `409 Conflict` is returned.

## Best Practices

- Generate keys client-side using UUIDv4.
- Log keys with request context for observability.
- Avoid reusing keys across different endpoints.

## Error Responses

| Code | Description |
|------|-------------|
| `409 Conflict` | Key reused with different payload. |
| `400 Bad Request` | Missing or malformed key on required endpoints. |

Idempotency applies to all `POST` operations mutating state
(identities, orgs, consents, verification transitions, API keys).
`GET` requests remain cacheable without keys.
