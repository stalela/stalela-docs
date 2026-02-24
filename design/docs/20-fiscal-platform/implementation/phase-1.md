# Phase 1 — Software Invoicing

Phase 1 proves that the Stalela Cloud can deliver sealed, fiscally compliant invoices through an API-first platform, using the Cloud Signing Service (HSM) as the trusted fiscal authority, with a web dashboard, REST API, and SDKs.

## Scope

Cloud Signing Service + REST API + Web Dashboard + JavaScript/Python SDK + Z/X/A reports + manual DGI compliance tooling + public invoice verification portal.

## Epics

### 1. Cloud Signing Service MVP

**Description:** Build the HSM-backed Cloud Signing Service that assigns sequential fiscal numbers, signs canonical payloads with ECDSA, generates QR codes, and stores everything in the append-only Fiscal Ledger.

**Acceptance criteria:**

- Monotonic Counter Manager guarantees gap-free sequential numbering per outlet under serializable database isolation.
- HSM signs every canonical payload and returns `fiscal_number`, `auth_code`, `timestamp`, `qr_payload`, and `fiscal_authority_id`.
- Fiscal Ledger stores hash-chained entries; each entry references the previous hash for tamper detection.
- Invoice mutations (void, refund, credit note) create new fiscal events — nothing is deleted.

**Dependencies:** `spec/architecture-kutapay-system-1.md`, `design/docs/architecture/trust-boundary.md`.

### 2. REST API + Tax Engine

**Description:** Build the REST API that accepts canonical payloads, validates them through the tax engine (14 DGI groups + client classification), routes them to the Cloud Signing Service, and returns sealed responses.

**Acceptance criteria:**

- API accepts canonical payloads with deterministic field ordering and validates all required fields.
- Tax Engine enforces TG01–TG14, applies client classification rules (individual, company, commercial_individual, professional, embassy), and calculates rounding per `spec/schema-tax-engine-1.md`.
- API returns sealed responses with all five security elements.
- Error responses include actionable validation messages.
- Rate limiting (100 req/s per API key) and idempotency keys prevent abuse and duplicates.

**Dependencies:** `spec/schema-tax-engine-1.md`, `design/docs/fiscal/tax-engine.md`.

### 3. Web Dashboard MVP

**Description:** Deliver the web dashboard for invoice management, outlet administration, user/API key management, and report generation.

**Acceptance criteria:**

- Dashboard supports invoice creation, viewing, filtering, and status tracking.
- Outlet registration and configuration via the dashboard.
- User and API key management with role-based access control (Cashier, Supervisor, Manager, Owner).
- Z/X/A report generation and download.
- Offline indicators for queued drafts.

**Dependencies:** `design/docs/platform/dashboard.md`, `design/docs/platform/multi-user.md`.

### 4. JavaScript & Python SDK

**Description:** Ship official client libraries with type-safe models, offline queue support, and receipt rendering helpers.

**Acceptance criteria:**

- SDKs wrap the REST API with typed request/response models.
- Built-in offline queue (IndexedDB for browser, SQLite for native) with configurable grace period and retry logic.
- Tax engine helpers for building valid `tax_groups` and `tax_summary` arrays.
- Event callbacks for queue state transitions (synced, failed, grace exceeded).

**Dependencies:** `design/docs/api/cloud.md`, `design/docs/api/invoicing-sdk.md`.

### 5. Manual compliance tooling & onboarding

**Description:** Provide compliance tools to submit fiscal data to the DGI before automated MCF/e-MCF uploads are available.

**Acceptance criteria:**

- Generate DGI-ready CSV/Excel exports containing sealed invoice metadata, fiscal numbers, tax summaries, and security elements.
- Produce Z/X/A reports and audit exports from the Fiscal Ledger.
- **Public verification portal** at `verify.stalela.cd` live with QR scanning, manual fiscal number lookup, and ECDSA signature validation. See [Invoice Verification](../fiscal/invoice-verification.md).
- **Verification API** (`/api/v1/verify/{fiscal_number}`) available as a public, rate-limited endpoint for programmatic verification.
- **SDK verification helpers** (`verify()`, `verifyQR()`, `verifySignatureOffline()`) shipped in JavaScript and Python SDKs.
- **Public key distribution** via `/.well-known/fiscal-keys.json` so the DGI and auditors can verify signatures independently.
- Onboard initial clients with documentation, API keys, and training.
- Collect feedback and validate offline queue behavior under real-world conditions.

**Dependencies:** `design/docs/fiscal/reports.md`, `design/docs/cloud/dgi-integration.md`.

## Risks

!!! warning "Phase 1 Risks"
    - The DGI MCF/e-MCF API remains undefined, so manual compliance tooling is required initially. Automated uploads come in Phase 2 or when the DGI publishes the spec.
    - HSM provider selection and key provisioning may introduce lead time. Evaluate cloud HSM offerings (AWS CloudHSM, Azure Managed HSM) early.
    - Field testing in DRC conditions may expose unexpected latency and connectivity patterns. The offline queue must handle extended outages gracefully.
