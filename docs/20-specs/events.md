# Event Specifications

The **Event model** defines the envelope and catalog of all domain events emitted across Storo services.

---

## 🎯 Purpose
- Provide a **single canonical envelope** for all events.  
- Define the **catalog of event types** (`transfers.*`, `ledger.*`, etc.).  
- Ensure **idempotency and consistency** across services.  

---

## 📦 Event Envelope (v1)

```json
{
  "envelope": {
    "v": 1,
    "eventId": "uuid",
    "type": "events.transfers.submitted.usdc",
    "occurredAt": "2025-08-26T10:15:01Z",
    "tenantId": "tn_456",
    "transferId": "tr_123",
    "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00",
    "payloadSchema": "canonical.transfer.v1"
  },
  "payload": {
    "amount": { "value": "1000.00", "currency": "USD" },
    "payerRef": "payer-1",
    "payeeRef": "payee-9",
    "endUserRef": "end-7"
  }
}
```

**Fields**
- `envelope.v` – envelope schema version (integer, starting at 1).
- `envelope.eventId` – unique ID (UUIDv7 recommended).
- `envelope.type` – dot-delimited string category (see catalog).
- `envelope.occurredAt` – ISO8601 UTC timestamp.
- `envelope.tenantId` – tenant scoping.
- `envelope.transferId` – optional link to transfer (if relevant).
- `envelope.traceparent` – W3C trace context for correlation end-to-end.
- `envelope.payloadSchema` – canonical schema identifier (`canonical.transfer.v1`).
- `payload` – type-specific content (PII-free; only stable references).

**Optional enrichment (additive)**
- `kycTier` – KYC tier for context (T0|T1|T2).  
- `riskScore` – screening risk score (0-100).  
- `exchangeControlRef` – reference for exchange control/BoP.  
- `taxCode` – tax/VAT code for fee lines.  
- `proxyType` – proxy type for PayShap (cell|email|id).  

> Additive fields do not break consumers; treat unknown fields as optional.

---

## 📚 Event Catalog

### Transfers
- `transfers.initiated`  
- `transfers.submitted.<rail>`  
- `transfers.accepted`  
- `transfers.settled`  
- `transfers.returned`  
- `transfers.failed`  

### Ledger
- `ledger.posting.created`  
- `ledger.balance.updated`  

### Compliance
- `compliance.entity.flagged`  

### Reconciliation
- `recon.statement.ingested`  
- `recon.exception.opened`  

### Directory
- `directory.version.updated`  

---

## 🔁 Idempotency Rules
- Event consumers must dedupe using `envelope.eventId`.
- For transfer lifecycle, `(envelope.transferId, envelope.type)` must be unique.
- Outbox pattern ensures atomic persistence + publish; events are immutable after emission.

---

## 🚦 Partitioning & Delivery Defaults

- SNS FIFO topic: `events.transfers.fifo` with `MessageGroupId = transferId` to guarantee order.
- Outbox worker retry/backoff: `1s, 5s, 30s, 2m, 10m, 1h, 2h, 4h, 8h, 16h`; send to DLQ after the 10th attempt.
- DLQ retention: 14 days within queue, plus archived copy retained for 7 years.

---

## 🧭 Versioning
- Envelope: `v` is the envelope schema version (current: 1).  
- Additive changes (new optional fields) require no version bump.  
- Breaking payload changes introduce a new `type` version (e.g., `transfers.settled.v2`) with dual-publish during migration.

---

## 📊 Observability
- Metrics: events/sec by type, lag from occurredAt → consumed.  
- Audit: immutable event store recommended for replay/debug.

---
