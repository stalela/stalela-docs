# Phase 2 — POS & Retail

Phase 1 proved that the Cloud Signing Service, REST API, and web dashboard can deliver fiscally compliant invoices for B2B clients. Phase 2 extends the platform to **physical retail and restaurant environments** with POS SDK integration, multi-terminal support, mobile money payments, and the webhook event system.

## Objectives

- Onboard retail and restaurant outlets (multi-lane counters, mobile waitstaff, fast-service kiosks) using the same cloud fiscal authority from Phase 1.
- **New capabilities:** POS SDK, multi-terminal concurrency, mobile money integration, webhook API, enhanced dashboard views, and fleet observability.

## Epics

### 1. POS SDK & multi-terminal support

**Description:** Build a POS SDK that wraps the Cloud API with receipt rendering, offline queue, and multi-terminal awareness. The Monotonic Counter Manager already serializes fiscal numbers per outlet, so POS terminals are simply additional API consumers.

**Acceptance criteria:**

- POS SDK (JavaScript) handles invoice creation, offline queue, receipt template rendering, and device-specific status indicators.
- Multiple POS terminals per outlet submit invoices concurrently; the cloud serializes fiscal numbering without gaps.
- Each invoice carries `pos_terminal_id` and `cashier_id` for traceability.
- Receipt templates include all five security elements (fiscal number, fiscal authority ID, auth code, timestamp, QR code).

**Dependencies:** `design/docs/platform/multi-user.md`, `design/docs/api/invoicing-sdk.md`.

### 2. Mobile money integration

**Description:** Support mobile money (M-Pesa, Airtel Money, Orange Money) as payment methods within invoices. Payment confirmation callbacks trigger invoice submission or update payment status on existing invoices.

**Acceptance criteria:**

- Payment callbacks from mobile money providers are processed and recorded in the invoice's `payments` array.
- Invoices can be sealed before or after payment confirmation (payment status does not block fiscalization).
- Dashboard shows payment status alongside invoice status.

**Dependencies:** `design/docs/platform/integrations.md`.

### 3. Webhook event system

**Description:** Build the webhook delivery system that pushes signed event notifications to external endpoints when invoices are sealed, reports are generated, or sync errors occur.

**Acceptance criteria:**

- Webhook events: `invoice.sealed`, `invoice.sync.success`, `invoice.sync.failed`, `report.generated`, `outlet.offline_alert`.
- Payloads are signed with HMAC-SHA256 using the webhook secret.
- Retry with exponential backoff on delivery failure (max 5 retries).
- Dashboard UI for webhook management (create, test, view delivery logs).

**Dependencies:** `design/docs/platform/integrations.md`.

### 4. Enhanced dashboard & supervisor views

**Description:** Add shift management, supervisor drill-downs, and fleet health views to the web dashboard for retail operations.

**Acceptance criteria:**

- Shift open/close workflow with X report generation per shift.
- Supervisor view showing all terminals in an outlet with real-time invoice counts and sync status.
- Fleet overview page (for multi-outlet merchants) with aggregate health metrics.
- Offline client alerts with draft counts and ages.

**Dependencies:** `design/docs/platform/dashboard.md`.

### 5. Observability, onboarding & fleet operations

**Description:** Instrument the platform with monitoring, alerting, and onboarding playbooks for retail staff.

**Acceptance criteria:**

- Dashboards showing API latency, signing throughput, sync queue depth, and error rates.
- Alerts for: failed DGI uploads, offline grace period exceeded, rate limit breaches, HSM health.
- Onboarding documentation for retail merchants: outlet setup, API key creation, POS SDK installation, tax group configuration.
- Automated regression tests for offline queue, multi-terminal concurrency, and mobile money flows.

**Dependencies:** `design/docs/cloud/architecture.md`, `design/docs/cloud/offline-sync.md`.

### 6. WhatsApp Invoice Bot

**Description:** Deploy a WhatsApp Business API integration that allows merchants to create invoices, query status, download receipts, and request reports by sending natural language messages in French or Lingala.

**Acceptance criteria:**

- Merchant sends a free-text message describing a sale; the NL Invoice Parser extracts items, quantities, prices, client, and payment methods.
- Bot presents a draft preview with confidence score; merchant confirms or edits before fiscalization.
- Bot supports status queries ("statut facture 004821"), receipt downloads (PDF attachment), and Z report requests.
- Phone number linked to merchant account via OTP on first use.
- All bot interactions logged in the audit trail with `source: "whatsapp_bot"`.
- Session timeout: 15 minutes of inactivity.

**Dependencies:** `design/docs/platform/ai-capabilities.md`.

### 7. Natural Language Invoice API

**Description:** Expose a REST endpoint (`/api/v1/invoices/natural`) that accepts free-text invoice descriptions in French, Lingala, Swahili, or English and returns a canonical payload for signing.

**Acceptance criteria:**

- Endpoint accepts `{ "text": "...", "language": "fr" }` and returns a structured canonical payload.
- Confidence score ≥ 0.85 triggers auto-submission to the Cloud Signing Service; below 0.85 returns a draft for review.
- Entity extraction covers items, quantities, unit prices, client name, payment methods, and currency.
- Fuzzy matching against the merchant's product catalog resolves item names to SKUs and tax groups.
- Supports the same authentication and rate limiting as the core invoicing API.

**Dependencies:** `design/docs/platform/ai-capabilities.md`, `design/docs/fiscal/tax-engine.md`.

### 8. Tax Auto-Classification API

**Description:** Expose a classification endpoint (`/api/v1/tax/classify`) that suggests the correct DGI tax group (TG01–TG14) for items based on description, HS code, or product category.

**Acceptance criteria:**

- Classifier trained on DRC customs tariff schedule, DGI circulars, and pilot transaction data.
- Confidence ≥ 0.90 → auto-apply; 0.70–0.90 → suggest with explanation; < 0.70 → require manual classification.
- Available as a standalone API and integrated into the invoice creation flow (API, dashboard, and NL pipeline).
- Model accuracy ≥ 85% on a held-out test set of 1,000 classified items.

**Dependencies:** `design/docs/fiscal/tax-engine.md`, `design/docs/platform/ai-capabilities.md`.

### 9. Rule-Based Anomaly Detection

**Description:** Implement real-time rule-based anomaly detection on the Fiscal Ledger to catch numbering gaps, velocity spikes, excessive void rates, and suspicious timing patterns.

**Acceptance criteria:**

- Hard rules trigger immediately for critical anomalies (numbering gaps, duplicate fiscal numbers, counter rollback).
- Statistical baselines (30-day rolling window) detect velocity, amount, and tax group distribution anomalies per outlet.
- Alerts surface in the dashboard alert center, via email, and through `anomaly.detected` webhook events.
- Each alert includes severity, description, affected outlet/cashier, and recommended action.

**Dependencies:** `design/docs/platform/ai-capabilities.md`, `design/docs/fiscal/reports.md`.

## Risks

!!! warning "Phase 2 Risks"
    - POS environments have unreliable connectivity; the offline queue must handle 48–72h outages without data loss or duplicate fiscal events.
    - Mobile money provider APIs have variable reliability and documentation quality; build provider-agnostic abstractions.
    - DGI readiness for automated uploads may still be pending — maintain manual compliance tooling as a fallback.
    - Scaling to many outlets may expose performance bottlenecks in the signing pipeline or Fiscal Ledger writes.
