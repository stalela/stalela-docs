# SDK & Libraries

Stalela provides SDKs and client libraries that wrap the Invoicing API so developers can focus on invoices, receipts, and integrations instead of plumbing canonical payloads. This page replaces the legacy POS plugin reference and summarizes the same deterministic payload structure, offline queueing guarantees, and webhook handling that the archived POS plugin document captured.

## Supported SDKs

- **JavaScript / TypeScript (npm)** — Browser, Electron, React Native, and POS integrations can share the same package.
- **Python (pip)** — Flask/FastAPI backends, ERP connectors, and accounting scripts.
- **PHP (composer)** — Legacy ERP systems or PHP-based ecommerce platforms.
- **Future adopters** — Java, .NET, and native mobile SDKs land in Phase 1+ as usage grows.

Each SDK targets the canonical payload described in `spec/design-pos-plugin-api-1.md`, enforces authentication headers like `Authorization: Bearer`, and respects the `X-Stalela-Merchant-ID` / `X-Stalela-Outlet-ID` scoping that the Invoicing API (`design/docs/platform/api.md`) requires.

## Core SDK features

- **Authentication helpers** — Acquire, refresh, and attach scoped API keys.
- **Canonical payload serialization** — Always order `merchant_id`, `outlet_id`, `pos_terminal_id`, `cashier_id`, `client`, `items`, `tax_groups`, `totals`, and `payments` so signatures remain reproducible (see `spec/design-cloud-api-1.md` and `spec/design-pos-plugin-api-1.md`).
- **Offline queue with auto-retry** — IndexedDB (browser) or SQLite (native) keeps drafts, flushes FIFO when connectivity returns, and surfaces fiscal status callbacks (`onQueued`, `onFiscalized`, `onError`).
- **Tax group helpers** — Ship the 14 DGI tax group codes plus client classification validation (Individual, Company, Commercial Individual, Professional, Embassy) before hitting the API.
- **Receipt rendering** — HTML/print-ready templates plus PDF helpers so dashboards and POS screens can embed fiscal numbers, auth codes, and QR payloads.
- **Webhook signature verification** — Validate `X-Stalela-Signature` (HMAC-SHA256) before honoring `fiscalized`, `synced`, or `dgi_rejected` events.
- **Webhook receivers + delivery utilities** — Automatically verify payloads, emit typed events, and surface `ledger_hash` + `security_elements` for auditing.

## Getting started

### JavaScript / TypeScript

```bash
npm install @stalela/sdk
```

```javascript
import { Stalela } from '@stalela/sdk';

const client = new Stalela({ apiKey: process.env.STALELA_API_KEY });
const invoice = await client.invoices.create({
  client: { name: 'Acme Ltd', nif: '987654321', classification: 'Company' },
  items: [{ description: 'Consulting', quantity: 1, unit_price: 500, tax_group: 'TG03' }],
  currency: 'CDF',
  merchant_id: 'stalela-ks-1',
  outlet_id: 'outlet-kin001',
  pos_terminal_id: 'pos-sdk-js',
  cashier_id: 'cashier-42',
  invoice_type: 'sale',
  timestamp: new Date().toISOString(),
  tax_groups: [
    {
      code: 'TG03',
      name: 'Standard VAT — Services',
      rate: '0.16',
      base_amount: '500.00',
      tax_amount: '80.00'
    }
  ],
  totals: { subtotal: '500.00', total_vat: '80.00', total: '580.00', currency: 'CDF' },
  payments: [{ method: 'mobile_money', amount: '580.00', instrument_id: 'MOMO-123', currency: 'CDF' }]
});

console.log('Fiscal number', invoice.fiscal_number, 'QR', invoice.qr_payload);
```

### Python

```bash
pip install stalela-sdk
```

```python
from stalela import Stalela

client = Stalela(api_key=os.environ["STALELA_API_TOKEN"])
payload = {
    "merchant_id": "stalela-ks-1",
    "outlet_id": "outlet-kin001",
    "pos_terminal_id": "python-sdk-01",
    "cashier_id": "cashier-13",
    "invoice_type": "sale",
    "timestamp": "2026-02-17T04:00:00Z",
    "client": {"name": "Acme Ltd", "nif": "123456789", "classification": "Company"},
    "items": [{"code": "CONS-001", "description": "Consulting hours", "quantity": 2, "unit_price": "500.00", "tax_group": "TG03", "taxable_unit": "hour"}],
    "tax_groups": [{"code": "TG03", "name": "Standard VAT — Services", "rate": "0.16", "base_amount": "1000.00", "tax_amount": "160.00"}],
    "totals": {"subtotal": "1000.00", "total_vat": "160.00", "total": "1160.00", "currency": "CDF"},
    "payments": [{"method": "mobile_money", "amount": "1160.00", "instrument_id": "MOMO-123", "currency": "CDF"}]
}

invoice = client.invoices.create(payload)
print("Fiscalized:", invoice["payload"]["fiscal_number"], "with QR", invoice["payload"]["qr_payload"])
```

## Canonical payload & tax helpers

Every SDK enforces the field ordering defined in `spec/design-pos-plugin-api-1.md` (merchant_id → payments) and mirrors the same validation rules described in the Invoicing API reference. Tax group helpers surface the 14 DGI codes plus client classifications before the request leaves the client, so the Cloud Signing Service can trust the payload order and tax totals when the payload arrives.

## Offline queue & reliability

Offline is non-negotiable. SDKs queue invoices in IndexedDB (browser) or SQLite (native) with statuses such as `draft`, `queued`, `fiscalized`, and `error`. When connectivity returns, the SDK flushes invoices FIFO to `POST /api/v1/invoices`, recomputes totals if the catalog changed, and retries with exponential backoff (100 ms → 5 s → 20 s, max 3 attempts). Each retry line logs the `nonce`/`hash` so merchants can audit why a submission was delayed. Fiscal status callbacks keep dashboards in sync: green for `fiscalized`, yellow for queued, red for errors.

## Webhooks & verification

The SDK verifies `X-Stalela-Signature` (HMAC-SHA256) before honoring webhook events that describe `dgi_status` changes (`queued`, `synced`, `dgi_acknowledged`, `fiscal_error`). Webhook payloads include `fiscal_number`, `ledger_hash`, and the canonical payload hash so applications can reconcile receipts without touching untrusted layers. The SDK also exposes helper functions to render receipts (HTML + PDF) summarizing the security elements and tax breakdown.

## POS integration guide (Phase 2 preview)

Phase 2 POS vendors embed the same SDK to talk to Stalela Cloud instead of running a local fiscal service. In practice, each POS terminal becomes another API consumer that connects through the SDK, scopes requests with `outlet_id` and `user_id`, and relies on the SDK’s deterministic serialization, offline queue, and webhook callbacks. POS integrations can reuse the same receipt templates, tax group helpers, and webhook logic that existing dashboards use, which means the transition from Phase 1 dashboards to Phase 2 multi-terminal POS systems is seamless.

## See also

- `design/docs/platform/api.md` — the REST endpoints that every SDK targets.
- `spec/design-pos-plugin-api-1.md` — formal payload specification and canonical ordering.
- `design/docs/api/pos-plugin.md` — legacy plugin reference (archived for Phase 3 compliance) that preserved the original payload examples.
