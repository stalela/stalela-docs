---
title: Rate Limits
---

Rate limits protect CIS availability. Limits apply **per tenant**
unless noted.

---

## Endpoint Limits

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| `POST /api/cis/v1/auth/sessions` | 30 req | 1 min | Per identity + IP. |
| Identity creation | 300 req | 1 hour | Per tenant. |
| Contact verification start | 5 req | 15 min | Per identity and channel. |
| Verification resubmit | 10 req | 1 hour | Prevents hammering providers. |
| API key create / delete | 20 req | 24 hours | Per org. |

## Response Headers

| Header | Description |
|--------|-------------|
| `RateLimit-Limit` | Maximum requests allowed in the window. |
| `RateLimit-Remaining` | Requests remaining in the current window. |
| `RateLimit-Reset` | Seconds until the window resets. |

## Throttling Behaviour

- `429` responses include `Retry-After` in seconds.
- Auth endpoints use a sliding window with exponential back-off.
- Soft limits are adjustable via tenant configuration overrides.
