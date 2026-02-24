# Rail Gateway — RTGS (High-Value)

**Purpose**  
Handle high-value, real-time gross settlement submissions and acknowledgments.

## Responsibilities
- Consume `transfers.submitted.rtgs`.
- Submit payment via partner/bank API; handle acknowledgments and settlement confirmations.

## Interfaces
- Events (envelope `v=1`): `transfers.*`
- Files/API: as per partner specifications.

## Data Model
- `rtgs_ops` (transferId, amount, currency, opRef, status)

## Rules
- High-value thresholds; cutoff windows; stronger idempotency.

## Failure Modes
- Queueing at partner; manual operator intervention paths.

## Observability & Security
- Metrics: ack/settle latency; strong auth; PII minimization.

---

> See also: [Rail Gateway — Template](./rail-gateway-template.md) and Reason Code mappings in [../20-specs/error-codes.md](../20-specs/error-codes.md)
