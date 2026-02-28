---
title: SLA & SLOs
---

Service-level commitments for CIS.

---

## Availability

- **SLA** — 99.9 % monthly availability for public APIs.
- **SLO** — 99.95 % for identity read operations, 99.9 % for write
  operations.
- **Error budget** — 21.6 minutes monthly.

## Latency

| Endpoint | Target | Notes |
|----------|--------|-------|
| `POST /api/cis/v1/auth/sessions` | p95 < 250 ms | Excluding MFA verification time. |
| `POST /api/cis/v1/identities` | p95 < 300 ms | Includes consent writes. |
| `POST /api/cis/v1/verification/:id/resubmit` | p95 < 400 ms | Verification workflows execute asynchronously. |

## Incident Response

| Severity | Respond | Resolve |
|----------|---------|---------|
| P1 — Service down | 15 minutes | 2 hours |
| P2 — Degraded | 1 hour | 8 hours |

- Public status page updated every 30 minutes during incidents.

## Reporting

- Monthly SLA reports available in the tenant console.
- Breaches trigger service credits and a root-cause analysis within
  5 business days.

## Dependencies

Track upstream SLAs for compliance providers and notification
services; breaches propagate into CIS error-budget calculations.
