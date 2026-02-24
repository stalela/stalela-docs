# Rail Gateway — Airtel Money (Mobile Money)

**Purpose**  
Adapt canonical transfers to Airtel Money; strict schema validation; webhook handling; events.

## Responsibilities
- Consume `transfers.submitted.airtelmomo`.
- Initiate payment and handle callbacks.

## Interfaces
- HTTP: `POST /webhooks/airtelmomo`
- Events (envelope `v=1`): as per canonical `transfers.*`

## Data & Rules
- `airtelmomo_ops`; MSISDN/currency validation; idempotency keying.

## Failure Modes
- Callback gaps → poll; DLQ on parse/verify failure.

## Observability & Security
- Prompt success rate; signature verify; PII redaction.

---

> See also: [Rail Gateway — Template](./rail-gateway-template.md) and Reason Code mappings in [../20-specs/error-codes.md](../20-specs/error-codes.md)
