# Golden Fixtures

Golden fixtures are canonical JSON examples used to validate contracts (events and APIs) across services and in CI pipelines.

## Scope
- Event envelope and payload examples (envelope `v=1`).
- Canonical Transfer API requests/responses.
- Per-rail gateway event samples for `accepted/settled/returned/failed`.

## Usage
- Validate outbound events from providers against fixture schemas.
- Validate inbound event consumers via golden test vectors.
- Reference fixtures in CI `contract-validate` job (see `docs/50-repo-structure/ci-cd.md`).

## Examples

### Event: transfers.settled (v1)
```json
{
  "eventId": "018f3d20-1111-7c89-b1e3-7a7f5d3b9b10",
  "type": "transfers.settled",
  "v": 1,
  "occurredAt": "2025-08-26T10:15:01Z",
  "transferId": "tr_12345",
  "tenantId": "tn_67890",
  "payload": {
    "amount": { "value": 1000, "currency": "USD" },
    "rail": "usdc-algo"
  }
}
```

### API: POST /transfers request
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

### API: POST /transfers response
```json
{
  "transferId": "tr_12345",
  "state": "SUBMITTED",
  "nextAction": "await_settlement"
}
```
