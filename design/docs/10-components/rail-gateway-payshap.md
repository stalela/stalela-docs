# Rail Gateway — PayShap (ZA Instant Proxy Payments)

**Purpose**  
Integrate proxy-based instant payments (PayShap), handling proxy resolution, submission, and returns.

## Responsibilities
- Consume `transfers.submitted.payshap`.
- Resolve proxy (cell/email/ID) → account; submit payment; handle timeouts/returns.

## Interfaces
### Inputs
- Events: `transfers.submitted.payshap`
- HTTP: `POST /webhooks/payshap`

### Outputs
- Events (envelope `v=1`): `transfers.accepted`, `transfers.settled`, `transfers.returned`, `transfers.failed`

## Data Model
- `payshap_ops` (proxyType, proxyValue, resolvedAccount, opRef, status, reasonCode)

## Rules
- Proxy validation and supported types; cutoff/timeouts per scheme.
- Reason code mapping.

## Failure Modes
- Resolution failure; submission timeout; duplicate notifications.

## Observability & Security
- Metrics: resolution latency, success; webhook signature; PII redaction.

---

> See also: [Rail Gateway — Template](./rail-gateway-template.md) and Reason Code mappings in [../20-specs/error-codes.md](../20-specs/error-codes.md)
