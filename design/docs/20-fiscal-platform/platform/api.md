# Invoicing API

Stalela is fiscal invoicing infrastructure for the DRC. The Invoicing API is the primary developer surface that receives canonical payloads, applies the 14 DGI tax groups, and routes the request through the Cloud Signing Service (HSM-backed). Every fiscal event is numbered by the Monotonic Counter Manager, signed inside the HSM, timestamped, and stored in the hash-chained fiscal ledger before Stalela returns the sealed response to the caller. This surface honors the SFE specifications (docs/sfe-specifications-v1-summary) by supporting the five mandatory invoice types, the 14 tax groups, immutable security elements, and offline queueing semantics required by the DGI.

## Authentication

Requests require an outbound API key scoped to a merchant and an outlet. Send `Authorization: Bearer <token>` plus `X-Stalela-Merchant-ID` and `X-Stalela-Outlet-ID` headers so the Cloud can enforce multi-tenant quotas. Optional headers such as `X-Stalela-User-ID` or `X-Stalela-Source` help auditors trace which dashboard user, SDK, or future POS terminal produced a fiscal request. The platform enforces rate limits per outlet and per API key (e.g., 60 requests/min); honor `Retry-After` in `429` responses and back off accordingly.

## Core endpoints

### POST /api/v1/invoices

Create and fiscalize an invoice in one call. Stalela validates the canonical payload, applies the tax engine (all 14 DGI tax groups plus client classification), and forwards the payload to the Cloud Signing Service (HSM). The cloud assigns the next sequential fiscal number for the outlet, signs the payload, timestamps it, generates the QR payload, stores the sealed invoice in the fiscal ledger, and returns the response that clients may display or deliver via email/WhatsApp/PDF/print.

Stalela enforces deterministic field ordering so every signature is reproducible. Clients queue invoices locally (IndexedDB on the dashboard or SQLite in SDKs) when offline and flush them via this endpoint once connectivity returns.

#### Canonical payload

1. `merchant_nif` (string) — tax identifier for the merchant issuing the invoice.
2. `outlet_id` (string) — the outlet within the merchant namespace.
3. `pos_terminal_id` (string) — the terminal, SDK, or service creating the invoice.
4. `cashier_id` (string) — operator or session token.
5. `invoice_type` (sale, advance, credit_note, export, export_credit).
6. `timestamp` (ISO 8601 UTC) — when the invoice was authored.
7. `client` — object with `name`, `nif`, and `classification` (`Individual`, `Company`, `CommercialIndividual`, `Professional`, `Embassy`).
8. `items[]` — array of line items; each entry lists `code`, `description`, `quantity`, `unit_price`, `tax_group`, and `taxable_unit`.
9. `tax_groups[]` — array covering each of the 14 DGI tax groups present (`code`, `name`, `rate`, `base_amount`, `tax_amount`).
10. `totals` — object with `subtotal`, `total_vat`, `total`, and `currency`.
11. `payments[]` — array of payment instruments with `method`, `amount`, `instrument_id`, and `currency`.

```json
{
  "merchant_nif": "308123456",
  "outlet_id": "outlet-kin001",
  "pos_terminal_id": "sdk-js-01",
  "cashier_id": "cashier-13",
  "invoice_type": "sale",
  "timestamp": "2026-02-17T04:00:00Z",
  "client": {
    "name": "Acme Ltd",
    "nif": "123456789",
    "classification": "Company"
  },
  "items": [
    {
      "code": "CONS-001",
      "description": "Consulting hours",
      "quantity": 2,
      "unit_price": "500.00",
      "tax_group": "TG03",
      "taxable_unit": "hour"
    }
  ],
  "tax_groups": [
    {
      "code": "TG03",
      "name": "Standard VAT — Services",
      "rate": "0.16",
      "base_amount": "1000.00",
      "tax_amount": "160.00"
    }
  ],
  "totals": {
    "subtotal": "1000.00",
    "total_vat": "160.00",
    "total": "1160.00",
    "currency": "CDF"
  },
  "payments": [
    {
      "method": "mobile_money",
      "amount": "1160.00",
      "instrument_id": "AIRTEL-001",
      "currency": "CDF"
    }
  ]
}
```

### GET /api/v1/invoices/{fiscal_number}

Retrieve a sealed invoice with every security element and ledger metadata. The response includes the canonical payload, fiscal number, fiscal authority ID, authentication code, timestamp, QR payload, `ledger_hash`, `dgi_status` (`queued`, `synced`, `failed`), and the originating `outlet_id`.

### GET /api/v1/invoices

List invoices with filters (`merchant_nif`, `outlet_id`, `date_range`, `client.nif`, `status`, `fiscal_number`) plus pagination (`page`, `per_page`). Sort by `timestamp` or `fiscal_number`. Include query parameters to surface `dgi_status` so dashboards can display completion badges (real-time vs. queued).

### POST /api/v1/invoices/{fiscal_number}/void

Issue a credit note fiscal event. Provide the reason and item adjustments; Stalela treats the event as a new fiscal event, repeats the tax engine work, signs it via the Cloud Signing Service, and appends it to the ledger while referencing the original invoice.

### POST /api/v1/invoices/{fiscal_number}/refund

Create a refund fiscal event that preserves audit trails. Include the refund `amount`, `currency`, `payment_reference`, and optional `reason`. The Cloud Signing Service returns a new fiscal number/auth code pair for the refund.

### POST /api/v1/reports

Trigger Z/X/A and audit exports derived from the cloud fiscal ledger. Provide the report `type`, applicable `outlet_id`, and the `period` (date or shift). The response carries `report_id`, `download_url`, and the `ledger_hash` digest that links the report back to the sealed invoices.

### GET /api/v1/tax-groups

Return the manifest of all 14 DGI tax groups with `code`, `name`, `rate`, and `effective_from` timestamps. Clients cache this payload so offline queues can compute totals before submission.

## Response structure

Stalela returns a sealed invoice envelope that mirrors the canonical payload plus the security elements minted inside the Cloud Signing Service (HSM).

```json
{
  "status": "ok",
  "code": "INVOICE_FISCALIZED",
  "payload": {
    "fiscal_number": "STALELA-2026-000458",
    "auth_code": "H8F2-A9D3-9001",
    "timestamp": "2026-02-17T04:00:02Z",
    "qr_payload": "https://stalela.cd/verify?fiscal_number=STALELA-2026-000458",
    "fiscal_authority_id": "cloud-signer-west-1",
    "dgi_status": "queued",
    "ledger_hash": "e3b0c44298fc1c149afbf4c8996fb924",
    "security_elements": {
      "fiscal_number": "STALELA-2026-000458",
      "auth_code": "H8F2-A9D3-9001",
      "timestamp": "2026-02-17T04:00:02Z",
      "qr_payload": "https://stalela.cd/verify?fiscal_number=STALELA-2026-000458",
      "fiscal_authority_id": "cloud-signer-west-1"
    }
  }
}
```

The `dgi_status` field tracks whether the Sync Agent has uploaded the sealed invoice to the DGI: `queued`, `synced`, or `failed`. Client apps can highlight the sync status (green Real-time, yellow Queued, red Retry) without ever fabricating `fiscal_number` or `auth_code`.

## Error handling

- `400 Invalid canonical payload` — missing fields, incorrect ordering, or mismatched tax totals.
- `401 Unauthorized` — missing or invalid bearer token.
- `403 Forbidden` — the API key lacks scope for the merchant/outlet requested.
- `422 Fiscalization failed` — the Cloud Signing Service rejected the payload (totals, tax group mismatch, unsupported invoice type).
- `429 Too many requests` — rate limit exceeded; honor the `Retry-After` header before resubmitting.
- `500 Internal server error` — transient HSM, ledger, or Sync Agent failure; retry with exponential backoff.

## Webhook notifications

Stalela can deliver webhook notifications when invoices change state. Each webhook is signed with `X-Stalela-Signature` (HMAC-SHA256) and includes `fiscal_number`, `dgi_status`, `ledger_hash`, and the canonical payload hash. Statuses include `fiscalized`, `synced`, `dgi_acknowledged`, and `fiscal_error`. Queue indicators (e.g., `Queued → Fiscalized`) let dashboards update colored badges in near real time.

```json
{
  "event": "invoice.fiscalized",
  "fiscal_number": "STALELA-2026-000458",
  "dgi_status": "queued",
  "ledger_hash": "e3b0c44298fc1c149afbf4c8996fb924",
  "source": "dashboard",
  "security_elements": {
    "auth_code": "H8F2-A9D3-9001",
    "timestamp": "2026-02-17T04:00:02Z"
  }
}
```

## Code examples

### CURL

```bash
curl -X POST https://api.stalela.cd/api/v1/invoices \
  -H "Authorization: Bearer $STALELA_API_TOKEN" \
  -H "X-Stalela-Merchant-ID: stalela-ks-1" \
  -H "X-Stalela-Outlet-ID: outlet-kin001" \
  -H "Content-Type: application/json" \
  -d '@invoice.json'
```

### Python

```python
import requests

response = requests.post(
    "https://api.stalela.cd/api/v1/invoices",
    headers={
        "Authorization": f"Bearer {os.environ['STALELA_API_TOKEN']}",
        "X-Stalela-Merchant-ID": "stalela-ks-1",
        "X-Stalela-Outlet-ID": "outlet-kin001"
    },
    json=invoice_payload  # see canonical structure above
)

response.raise_for_status()
print(response.json()["payload"]["fiscal_number"])
```

### JavaScript

```javascript
const createInvoice = async (payload) => {
  const response = await fetch("https://api.stalela.cd/api/v1/invoices", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${STALELA_API_TOKEN}`,
      "X-Stalela-Merchant-ID": "stalela-ks-1",
      "X-Stalela-Outlet-ID": "outlet-kin001",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.code);
  }

  return response.json().payload;
};

const memoryPayload = {
  /* canonical payload */
};
```
