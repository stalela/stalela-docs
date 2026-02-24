# Cloud API Reference

The Stalela Cloud API is the primary interface for creating fiscalized invoices, querying their status, generating reports, and managing outlets. All client applications (web dashboard, REST API consumers, SDKs) interact with the platform through this API.

!!! caution "Security by design"
    All endpoints require TLS 1.3+, `Authorization: Bearer <api_key>`, and the `X-Bono-Outlet-ID` header to scope requests to a specific outlet. Never accept payloads with missing canonical fields or unauthorized API keys.

## Key Endpoints

| Endpoint | Method | Purpose | Response highlights |
|----------|--------|---------|---------------------|
| `/api/v1/invoices` | POST | Submit a canonical payload for fiscalization | `fiscal_number`, `auth_code`, `timestamp`, `qr_payload` |
| `/api/v1/invoices/reconcile` | POST | Reconcile locally-sealed invoices (Phase 1.5) | Array of reconciliation results |
| `/api/v1/credentials/provision` | POST | Request Delegated Credential & block (Phase 1.5) | `vc_jwt`, `block_start`, `block_end`, `ttl` |
| `/api/v1/invoices/{fiscal_number}` | GET | Retrieve a sealed invoice | Full sealed payload + `dgi_status` |
| `/api/v1/invoices/batch` | POST | Submit multiple payloads in one request | Array of sealed responses |
| `/api/v1/invoices/{fiscal_number}/status` | GET | Check DGI sync status | `dgi_status`, `acknowledged_at` |
| `/api/v1/outlets` | POST | Register a new outlet | `outlet_id`, `fiscal_authority_id` |
| `/api/v1/outlets/{outlet_id}/status` | GET | Check outlet health and counter | `next_fiscal_number`, `pending_sync`, `status` |
| `/api/v1/reports` | POST | Generate Z/X/A reports | `report_id`, `download_url` |
| `/api/v1/audit/export` | GET | Download hash-chained journal exports | `ledger_hash`, `entries`, signed downloads |
| `/api/v1/webhooks` | POST | Register a webhook endpoint | `webhook_id`, `events`, `active` |
| `/api/v1/api-keys` | POST | Create a scoped API key | `api_key_id`, `key`, `scopes` |
| `/api/v1/verify/{fiscal_number}` | GET | **Public** — verify a sealed invoice by fiscal number + auth code | `status`, `signature_valid`, `dgi_status` |
| `/api/v1/verify/qr` | POST | **Public** — verify by QR payload data | Same as above |
| `/api/v1/verify/batch` | POST | Bulk-verify multiple invoices (authenticated) | Array of verification results |

!!! info "Specification reference"
    The endpoint request/response schema definitions are based on `spec/design-cloud-api-1.md` (project root).

## Example: Create Invoice

```json
POST /api/v1/invoices
Content-Type: application/json
Authorization: Bearer bono_key_abc123
X-Bono-Outlet-ID: OUTLET-001
Idempotency-Key: hash_of_canonical_payload

{
  "invoice_type": "sale",
  "merchant_nif": "123456789",
  "client": {
    "name": "Acme Ltd",
    "nif": "987654321",
    "classification": "company"
  },
  "items": [
    {
      "sku": "SKU-001",
      "description": "Consulting service",
      "quantity": 1,
      "unit_price": 100000,
      "tax_group": "TG03"
    }
  ],
  "tax_groups": [
    { "code": "TG03", "base_amount": 100000, "rate": 0.16, "tax_amount": 16000 }
  ],
  "totals": {
    "subtotal": 100000,
    "tax": 16000,
    "total": 116000,
    "currency": "CDF"
  },
  "payments": [
    { "method": "bank_transfer", "amount": 116000, "reference": "TXN-789" }
  ]
}
```

Response (201 Created):

```json
{
  "fiscal_number": "BONO-OUTLET001-000123",
  "fiscal_authority_id": "HSM-CLUSTER-01",
  "auth_code": "MEUCIQD8j2w8s...",
  "timestamp": "2026-02-17T03:00:00Z",
  "qr_payload": "https://verify.stalela.cd/i?hash=...",
  "dgi_status": "pending_sync",
  "submitted_by": {
    "type": "api_key",
    "id": "KEY-abc123"
  }
}
```

## Example: Generate Report

```json
POST /api/v1/reports
Content-Type: application/json
Authorization: Bearer bono_key_abc123
X-Bono-Outlet-ID: OUTLET-001

{
  "type": "Z",
  "period": { "date": "2026-02-17" },
  "include_ledger_hash": true
}
```

Response (200 OK):

```json
{
  "report_id": "RPT-Z-OUTLET001-2026-02-17",
  "type": "Z",
  "download_url": "/api/v1/reports/RPT-Z-OUTLET001-2026-02-17/download",
  "generated_at": "2026-02-17T23:58:30Z",
  "ledger_hash": "3F9B-7A12-..."
}
```

## Example: Outlet Registration

```json
POST /api/v1/outlets
Content-Type: application/json
Authorization: Bearer bono_owner_key

{
  "merchant_nif": "123456789",
  "name": "Acme Kinshasa Branch",
  "address": "123 Boulevard du 30 Juin, Kinshasa"
}
```

Response (201 Created):

```json
{
  "outlet_id": "OUTLET-001",
  "fiscal_authority_id": "HSM-CLUSTER-01",
  "next_fiscal_number": 1,
  "status": "active"
}
```

## Monitoring endpoints

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/outlets/{outlet_id}/status` | Returns sync health, pending invoice count, next fiscal number, and platform status. |
| `GET /api/v1/sync/status` | Exposes aggregate sync pipeline health: backlog, state, next retry timestamp. |
| `GET /api/v1/audit/export` | Returns the hash-chained Fiscal Ledger with signed `ledger_hash` plus downloadable artifacts for auditors. |

## Error handling

| Scenario | HTTP status | Error code | Notes |
|----------|-------------|------------|-------|
| Invalid canonical payload | 400 | `INVALID_PAYLOAD` | Missing required fields or tax group validation failure. |
| Invalid signature / auth | 401 | `UNAUTHORIZED` | API key invalid, expired, or revoked. |
| Insufficient permissions | 403 | `INSUFFICIENT_PERMISSIONS` | API key lacks the required scope for this operation. |
| Outlet not found | 404 | `OUTLET_NOT_FOUND` | The `X-Bono-Outlet-ID` does not match a registered outlet. |
| Duplicate request | 409 | `DUPLICATE_PAYLOAD` | `Idempotency-Key` matches an already-sealed invoice; returns the existing sealed response. |
| Rate limit exceeded | 429 | `RATE_LIMIT_EXCEEDED` | Retry after the duration specified in `Retry-After` header. |

## Rate limiting

- Default: 100 requests/second per API key.
- Burst: up to 200 requests in a 1-second window.
- Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## Notes

- Every invoice is traceable through `fiscal_number`, `outlet_id`, and `submitted_by` (user_id or api_key_id).
- Audit exports default to a 30-day window. Use `start_date` and `end_date` query parameters to customize.
- All endpoints emit structured logs (`bono.api.request`, `bono.api.response`) that include `outlet_id`, `fiscal_number`, and `dgi_status`.
