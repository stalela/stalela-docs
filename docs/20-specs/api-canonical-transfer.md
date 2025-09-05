# Canonical Transfer API

The Canonical Transfer Service (CTS) exposes the primary API for creating and retrieving transfers.

---

## 🎯 Purpose
- Provide a **unified API** for initiating transfers.  
- Normalize requests into canonical model.  
- Return transfer state and timeline

---

## 🔌 Endpoints

### `POST /transfers`
Creates a new transfer.

**Headers**
- `Idempotency-Key`: unique key per client request.

**Request Body**
```json
{
  "tenantId": "tn_456",
  "payer": { "accountId": "acct_001" },
  "payee": { "accountId": "acct_999" },
  "amount": { "value": 1000, "currency": "USD" },
  "rail": "usdc-algo",
  "intent": "PUSH",
  "externalRef": "ext_abc123",
  "metadata": { "invoiceId": "inv_555" }
}
```

**Response**
```json
{
  "transferId": "tr_12345",
  "state": "SUBMITTED",
  "nextAction": "await_settlement"
}
```

Errors
- `409 Conflict` – duplicate idempotency key.  
- `422 EntityDenied` – compliance block.  
- `502 RoutingUnavailable` – directory lookup failed.  
- `500 RailUnavailable` – rail gateway issue.

---

### `GET /transfers/:id`
Returns transfer details and event timeline.

**Response**
```json
{
  "transferId": "tr_12345",
  "tenantId": "tn_456",
  "state": "SETTLED",
  "events": [
    { "type": "transfers.initiated", "occurredAt": "..." },
    { "type": "transfers.submitted.usdc", "occurredAt": "..." },
    { "type": "transfers.settled", "occurredAt": "..." }
  ]
}
```

---

## 📊 Observability
- Metrics: POST latency, error rates, transfer creation/sec.  
- Logs: transferId, tenantId, eventId.  
- Traces: full timeline correlation.

---
