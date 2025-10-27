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
- `Idempotency-Key`: unique key per client request (unique on `(tenantId, idempotencyKey, bodyHash)` for **36h**).
- `X-Canonical-Version`: currently fixed to `1`; bump when schema revs.
- `Authorization`: OAuth2 client-credentials bearer token by default; HMAC signature supported for partners that cannot use OAuth.

**Request Body**
```json
{
  "tenantId": "tn_456",
  "intent": "PUSH",
  "amount": { "value": "1000.00", "currency": "USD" },
  "sourceCurrency": "USD",
  "targetCurrency": "USD",
  "fxStrategy": "NOT_APPLICABLE",
  "payer": { "type": "WALLET", "id": "acct_001" },
  "payee": { "type": "BANK", "id": "acct_999" },
  "railHints": ["usdc-algo"],
  "feeModel": "STORO_STANDARD",
  "endUserRef": "end_abc123",
  "externalRef": "ext_abc123",
  "metadata": { "invoiceId": "inv_555" },
  "traceparent": "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-00"
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
- `409 IdempotencyConflict` – same key, different `bodyHash`.
- `422 EntityDenied` – compliance block.
- `502 RoutingUnavailable` – directory lookup failed; includes `retryAfter` when a route window is closed.
- `503 DependencyUnavailable` – downstream dependency outage (e.g., Compliance, Directory).
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
- Metrics: see [Observability defaults](#-observability-defaults) for required counters/histograms.
- Logs: transferId, tenantId, eventId (never emit PII `payer`/`payee`).
- Traces: propagate `traceparent` from ingress to outbox publish.

---

## 🧬 Canonical Schema (v1)

```json
{
  "$id": "schemas/canonical-transfer/v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "CanonicalTransferRequest.v1",
  "type": "object",
  "required": ["tenantId", "intent", "amount", "payer", "payee"],
  "properties": {
    "tenantId": { "type": "string", "minLength": 3, "maxLength": 64 },
    "intent": { "type": "string", "enum": ["AUTH", "CAPTURE", "PUSH", "PULL"] },
    "amount": {
      "type": "object",
      "required": ["value", "currency"],
      "properties": {
        "value": { "type": "string", "pattern": "^-?\\d{1,20}(\\.\\d{1,8})?$" },
        "currency": { "type": "string", "pattern": "^[A-Z]{3}$" }
      },
      "additionalProperties": false
    },
    "sourceCurrency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "targetCurrency": { "type": "string", "pattern": "^[A-Z]{3}$" },
    "fxStrategy": { "type": "string", "enum": ["NOT_APPLICABLE", "QUOTE_AT_SUBMIT", "PASS_THROUGH"] },
    "payer": {
      "type": "object",
      "required": ["type", "id"],
      "properties": {
        "type": { "type": "string", "enum": ["WALLET", "BANK", "CARD", "MOBILE_MONEY", "EXTERNAL"] },
        "id": { "type": "string", "minLength": 1 }
      },
      "additionalProperties": true
    },
    "payee": {
      "type": "object",
      "required": ["type", "id"],
      "properties": {
        "type": { "type": "string", "enum": ["WALLET", "BANK", "CARD", "MOBILE_MONEY", "EXTERNAL"] },
        "id": { "type": "string", "minLength": 1 }
      },
      "additionalProperties": true
    },
    "endUserRef": { "type": "string", "maxLength": 128 },
    "railHints": { "type": "array", "items": { "type": "string" }, "maxItems": 3 },
    "feeModel": { "type": "string", "maxLength": 64 },
    "externalRef": { "type": "string", "maxLength": 128 },
    "metadata": { "type": "object", "additionalProperties": { "type": ["string", "number", "boolean"] } },
    "traceparent": { "type": "string" }
  },
  "additionalProperties": false
}
```

### Canonicalization Rules

- Trim string inputs and uppercase currency codes.
- Amounts are normalized using authoritative currency scale → emit fixed-scale decimal **strings**.
- Sort object keys lexicographically; keep array order stable.
- Drop empty-string values before hashing.
- Compute `bodyHash = sha256(utf8(JSON.stringify_no_ws(canonical)))`.

---

## 📜 OpenAPI 3.1 Stub

```yaml
openapi: 3.1.0
info:
  title: Storo CTS API
  version: 1.0.0
servers:
  - url: https://api.storo.io
paths:
  /transfers:
    post:
      summary: Create transfer
      parameters:
        - name: Idempotency-Key
          in: header
          required: true
          schema: { type: string, maxLength: 128 }
        - name: X-Canonical-Version
          in: header
          required: true
          schema: { type: integer, enum: [1] }
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: ./schemas/canonical-transfer/v1.json
      responses:
        "201": { description: Created }
        "200": { description: Idempotent replay }
        "409": { description: IdempotencyConflict }
        "422": { description: EntityDenied }
        "502": { description: RoutingUnavailable }
        "503": { description: DependencyUnavailable }
  /transfers/{id}:
    get:
      summary: Get transfer
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200": { description: OK }
```

---

## 📊 Observability Defaults

| Metric | Type | Labels | Notes |
| --- | --- | --- | --- |
| `cts_requests_total` | counter | `route`, `code`, `tenantId` | Ingest volume + error mix |
| `cts_request_duration_seconds_bucket` | histogram | `route` | Track POST latency (SLO p95 < 1.5s) |
| `cts_idempotency_conflicts_total` | counter | `tenantId` | Alert if rising above 0.1% |
| `cts_compliance_latency_seconds_bucket` | histogram |  | Compliance round-trip |
| `cts_directory_latency_seconds_bucket` | histogram |  | Directory round-trip |
| `cts_outbox_attempts_total` | counter | `eventType` | Publish attempts |
| `cts_outbox_failures_total` | counter | `eventType` | For burn-rate SLO |
| `cts_transfers_state` | gauge | `state` | Derived from projections |
| `cts_consumer_lag` | gauge | `topic` | Exported from SQS/Kafka exporter |

**PromQL Examples**

```promql
histogram_quantile(0.95, sum(rate(http_server_duration_seconds_bucket{route="/transfers",method="POST"}[5m])) by (le)) > 1.5

rate(cts_outbox_failures_total[5m]) / rate(cts_outbox_attempts_total[5m]) > 0.001
```

---

## 🗄️ Postgres DDL (Aurora Serverless v2)

```sql
create extension if not exists pgcrypto;

create table transfers (
  transferId uuid primary key default gen_random_uuid(),
  tenantId text not null,
  payer jsonb not null,
  payee jsonb not null,
  amount_value numeric(20,8) not null,
  amount_currency char(3) not null,
  source_currency char(3) null,
  target_currency char(3) null,
  fx_strategy text null,
  rail text not null,
  intent text not null check (intent in ('AUTH','CAPTURE','PUSH','PULL')),
  externalRef text null,
  feeModel text null,
  endUserRef text null,
  state text not null,
  version bigint not null default 0,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

create index ix_transfers_tenant_created on transfers(tenantId, createdAt desc);
create unique index ux_transfers_externalref on transfers(tenantId, externalRef) where externalRef is not null;

create table transfer_events (
  eventId uuid primary key default gen_random_uuid(),
  transferId uuid not null references transfers(transferId),
  type text not null,
  payload jsonb not null,
  occurredAt timestamptz not null default now()
);

create index ix_events_transfer_time on transfer_events(transferId, occurredAt);
create unique index ux_events_lifecycle on transfer_events(transferId, type);

create table outbox_transfers (
  id uuid primary key default gen_random_uuid(),
  eventType text not null,
  payload jsonb not null,
  state text not null check (state in ('PENDING','SENT','FAILED')),
  attempts int not null default 0,
  lastError text null,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);
create index ix_outbox_state_created on outbox_transfers(state, createdAt);
create index ix_outbox_eventType on outbox_transfers(eventType);

create table idempotency (
  tenantId text not null,
  idempotencyKey text not null,
  bodyHash char(64) not null,
  transferId uuid not null,
  createdAt timestamptz not null default now(),
  primary key (tenantId, idempotencyKey, bodyHash)
);

create index ux_idem_window on idempotency(tenantId, idempotencyKey, bodyHash)
  where createdAt > now() - interval '36 hours';
```

### Idempotent write example

```sql
begin;
insert into transfers (...) values (...) returning transferId;
insert into outbox_transfers (eventType, payload, state) values ('transfers.submitted.usdc', :payload, 'PENDING');
insert into idempotency(tenantId, idempotencyKey, bodyHash, transferId) values (:t,:k,:h,:tr);
commit;
```

---
